import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef
} from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/Logo.jpg';
import { subscribeReadings, readingToUsage, flattenReadingsTree, db, ref, get, formatDateLocal } from '../firebase';

/* ================================
   Constants & Config
================================== */

const METRICS = [
  { key: 'power', label: 'Power (W)', color: '#ea580c' },
  { key: 'voltage', label: 'Voltage (V)', color: '#0891b2' },
  { key: 'current', label: 'Current (A)', color: '#16a34a' },
  { key: 'energy', label: 'Energy (kWh)', color: '#7c3aed' }
];

const ALERT_TYPES = {
  TAMPER: { label: 'Tamper', color: '#dc2626' },
  SENSOR_FAULT: { label: 'Sensor Fault', color: '#eab308' },
  THRESHOLD: { label: 'Threshold Breach', color: '#f97316' }
};

const DEFAULT_RANGE_DAYS = 7;

/* ================================
   Utility Functions
================================== */

function generateMockData(startDate, endDate, granularity = 'hour') {
  const data = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const stepMs =
    granularity === 'day'
      ? 24 * 60 * 60 * 1000
      : granularity === 'week'
      ? 7 * 24 * 60 * 60 * 1000
      : 60 * 60 * 1000; // hour default

  for (let t = start.getTime(); t <= end.getTime(); t += stepMs) {
    const base = 50 + Math.sin(t / 8.64e7) * 25; // daily sinusoidal
    data.push({
      timestamp: new Date(t),
      power: clampRandom(base, 30, 140),
      voltage: clampRandom(220 + Math.sin(t / 1e7) * 5, 210, 235),
      current: clampRandom(5 + Math.sin(t / 5e6) * 2, 2, 12),
      energy: clampRandom(base / 10, 1, 20)
    });
  }
  return data;
}

function clampRandom(seed, min, max) {
  const variation = (Math.random() - 0.5) * (max - min) * 0.15;
  const val = seed + variation;
  return Math.min(max, Math.max(min, parseFloat(val.toFixed(2))));
}

function aggregateByPeriod(data, granularity = 'day') {
  const buckets = new Map();
  data.forEach(d => {
    let key;
    const dt = d.timestamp;
    if (granularity === 'month') key = `${dt.getFullYear()}-${dt.getMonth() + 1}`;
    else if (granularity === 'week') {
      const week = getWeekNumber(dt);
      key = `${dt.getFullYear()}-W${week}`;
    } else {
      // Use local date key to avoid off-by-one day (UTC shift) showing future date with no data
      key = formatDateLocal(dt);
    }
    if (!buckets.has(key)) {
      buckets.set(key, {
        key,
        power: 0,
        voltage: 0,
        current: 0,
        energy: 0,
        count: 0
      });
    }
    const b = buckets.get(key);
    METRICS.forEach(m => {
      b[m.key] += d[m.key];
    });
    b.count += 1;
  });
  return Array.from(buckets.values()).map(b => {
    return {
      key: b.key,
      power: b.power / b.count,
      voltage: b.voltage / b.count,
      current: b.current / b.count,
      energy: b.energy // total energy accumulation (not averaged)
    };
  });
}

function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
}

function computeStats(data, visibleMetrics) {
  const stats = {};
  visibleMetrics.forEach(m => {
    if (!data.length) {
      stats[m.key] = { min: 0, max: 0, avg: 0, minPoint: null, maxPoint: null };
      return;
    }
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    let minPoint = null;
    let maxPoint = null;
    data.forEach(d => {
      const v = d[m.key];
      if (v < min) {
        min = v;
        minPoint = d;
      }
      if (v > max) {
        max = v;
        maxPoint = d;
      }
      sum += v;
    });
    stats[m.key] = {
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      avg: parseFloat((sum / data.length).toFixed(2)),
      minPoint,
      maxPoint
    };
  });
  return stats;
}

function formatDateShort(d) {
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

/* ================================
   Component
================================== */

const DetailedCharts = () => {
  const navigate = useNavigate();

  const [rangePreset, setRangePreset] = useState('7d');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - DEFAULT_RANGE_DAYS + 1);
    return d.toISOString().slice(0, 10);
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [granularity, setGranularity] = useState('hour');
  const [rawData, setRawData] = useState([]);
  const readingsUnsubRef = useRef(null);
  const [usingLive, setUsingLive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [visible, setVisible] = useState(() => METRICS.map(m => m.key));
  const [thresholds, setThresholds] = useState({
    power: 120,
    voltage: 230,
    current: 10,
    energy: 15
  });
  const [highlightAnomalies, setHighlightAnomalies] = useState(true);
  const [alertEvents, setAlertEvents] = useState([]);
  const [focusMetric, setFocusMetric] = useState('power');
  const [lineStyle, setLineStyle] = useState('line'); // 'line' | 'smooth' | 'stepped' | 'area'
  const [chartSize, setChartSize] = useState('m'); // 's' | 'm' | 'l'
  const [expandedMetric, setExpandedMetric] = useState(null); // key of metric currently enlarged
  const [showMarkers, setShowMarkers] = useState(true); // expanded chart marker visibility
  const [showSMA, setShowSMA] = useState(false); // show simple moving average overlay
  const [useSmartScale, setUseSmartScale] = useState(true); // adaptive y-domain (voltage focus)
  const [futureSkew, setFutureSkew] = useState(null); // minutes device clock appears ahead
  const FUTURE_TOLERANCE_MS = 2 * 60 * 1000; // 2 min tolerance central constant
  const [purgedFuture, setPurgedFuture] = useState(0);
  const [autoSkewCorrect, setAutoSkewCorrect] = useState(false); // shift future timestamps back instead of discarding
  const [detectedSkewMs, setDetectedSkewMs] = useState(0);
  const [powerSource, setPowerSource] = useState('auto'); // 'auto' | 'active' | 'raw' | 'derived'
  const [powerScale, setPowerScale] = useState(()=>{ try { const v = localStorage.getItem('pp_powerScale'); return v? parseFloat(v)||1:1; } catch { return 1;} });
  // Previously forced 1h lag caused incorrect displayed times; now zero offset (show raw reconciled timestamps)
  const FIXED_OFFSET_MIN = 0;
  const LIVE_STABILIZE_DELAY_MS = 3000; // delay to allow device to finalize a sample (no smoothing, just defer commit)
  const liveBufferRef = useRef(new Map());
  const liveFlushTimerRef = useRef(null);
  const chartWrapperRef = useRef(null);
  const [hoverIndex, setHoverIndex] = useState(null); // Hovered data point index for line chart tooltip
  // removed manual offset suggestion state

  // Detect consistent clock lag/lead (e.g., 5 hour difference reported) and suggest offset.
  // removed offset suggestion effect

  // Moved generateAlertEvents above effects to avoid temporal dead zone ReferenceError.
  function generateAlertEvents(data) {
    if (!data.length) return [];
    const sample = [];
    for (let i = 0; i < data.length; i += Math.floor(data.length / 8) || 1) {
      if (Math.random() < 0.3) {
        const typeKeys = Object.keys(ALERT_TYPES);
        const type = typeKeys[Math.floor(Math.random() * typeKeys.length)];
        sample.push({
          id: `${type}-${i}-${Date.now()}`,
          timestamp: data[i].timestamp,
          type
        });
      }
    }
    return sample;
  }

  useEffect(() => {
    if (document.getElementById('detailed-charts-styles')) return;
    const styleTag = document.createElement('style');
    styleTag.id = 'detailed-charts-styles';
    styleTag.innerHTML = COMPONENT_CSS;
    document.head.appendChild(styleTag);
  }, []);

  // Helper: parse a date string (YYYY-MM-DD) explicitly as local midnight to prevent UTC shift
  const parseDateLocal = (s) => {
    if(!s) return new Date();
    const [y,m,d] = s.split('-').map(Number);
    return new Date(y, (m||1)-1, d||1, 0,0,0,0);
  };

  // Live Firebase subscription (current date) + on-demand historical range fetch
  useEffect(() => {
    // Clean previous subscription
    if (readingsUnsubRef.current) { try { readingsUnsubRef.current(); } catch(_){} readingsUnsubRef.current = null; }
    setIsLoading(true);
  const s = parseDateLocal(startDate);
  const e = parseDateLocal(endDate);
    if (s > e) {
      setIsLoading(false);
      setRawData([]);
      return;
    }
    // Always subscribe to current date for live updates while viewing any range.
    readingsUnsubRef.current = subscribeReadings((flat) => {
      const now = Date.now();
      let mapped = flat.map(r => readingToUsage(r)).filter(Boolean);
      // detect & correct skew
      const future = mapped.filter(m => m.timestamp > now + FUTURE_TOLERANCE_MS);
      if (future.length) {
        const maxAheadMs = Math.max(...future.map(f => f.timestamp - now));
        setFutureSkew(Math.round(maxAheadMs / 60000));
        setDetectedSkewMs(maxAheadMs);
        if (autoSkewCorrect) {
          mapped = mapped.map(m => m.timestamp > now + FUTURE_TOLERANCE_MS ? { ...m, timestamp: m.timestamp - maxAheadMs } : m);
        }
      }
      mapped = mapped.filter(m => m.timestamp <= now + FUTURE_TOLERANCE_MS);
      if(!mapped.length) return;
      // Buffer updates (including existing timestamp revisions)
      mapped.forEach(m => {
        if (m.timestamp >= s.getTime() && m.timestamp <= (e.getTime() + 86399999)) {
          // store by base (unshifted) timestamp; fixed offset applied on flush
          liveBufferRef.current.set(m.timestamp, m); // overwrite ensures latest value kept
        }
      });
      if (!liveFlushTimerRef.current) {
        liveFlushTimerRef.current = setTimeout(() => {
          liveFlushTimerRef.current = null;
          if (liveBufferRef.current.size === 0) return;
          setUsingLive(true);
          setRawData(prev => {
            const map = new Map(prev.map(d => [d.baseTimestamp ?? +d.timestamp, d]));
            let purged = 0;
            const nowInner = Date.now();
            for (const [ts, rec] of liveBufferRef.current.entries()) {
              if (ts > nowInner + FUTURE_TOLERANCE_MS) { purged++; continue; }
              const baseTs = ts; // original device/base timestamp (after reconciliation in readingToUsage)
              map.set(baseTs, {
                baseTimestamp: baseTs,
                timestamp: new Date(baseTs),
                power: rec.power,
                voltage: rec.voltage,
                current: rec.current,
                energy: rec.energyToday,
                activePowerRaw: rec._rawActivePower,
                powerRaw: rec._rawPower,
                derivedReal: rec._derivedReal,
                derivedVA: rec._derivedVA,
                pf: rec.powerFactor
              });
            }
            if (purged>0) setPurgedFuture(p=>p+purged);
            liveBufferRef.current.clear();
            return Array.from(map.values()).sort((a,b)=>a.baseTimestamp - b.baseTimestamp);
          });
        }, LIVE_STABILIZE_DELAY_MS);
      }
    }, { currentDateOnly: true, log: false });

    // Historical fetch: traverse Firebase readings path for the selected date range.
    (async () => {
      try {
        const dayCount = Math.ceil((e - s) / 86400000) + 1;
        const all = [];
        for (let i=0;i<dayCount;i++) {
          const day = new Date(s.getTime() + i*86400000);
          const yyyyMmDd = formatDateLocal(day);
          const dayRef = ref(db, `Readings/${yyyyMmDd}`);
          const snap = await get(dayRef);
          const val = snap.val();
          if (val) {
            const flat = flattenReadingsTree({ [yyyyMmDd]: val });
            flat.forEach(r => {
              if (r.timestamp >= s.getTime() && r.timestamp <= (e.getTime() + 86399999)) {
                const u = readingToUsage(r);
                if (u) all.push({
                  baseTimestamp: u.timestamp,
                  timestamp: new Date(u.timestamp),
                  power: u.power,
                  voltage: u.voltage,
                  current: u.current,
                  energy: u.energyToday,
                  activePowerRaw: u._rawActivePower,
                  powerRaw: u._rawPower,
                  derivedReal: u._derivedReal,
                  derivedVA: u._derivedVA,
                  pf: u.powerFactor
                });
              }
            });
          }
        }
        // Filter future drift in historical set as well (should rarely happen)
        const now = Date.now();
        const future = all.filter(d => +d.timestamp > now + FUTURE_TOLERANCE_MS);
        if (future.length) {
          const maxAheadMs = Math.max(...future.map(f => +f.timestamp - now));
          setFutureSkew(Math.round(maxAheadMs / 60000));
        }
        for (let i = all.length - 1; i >= 0; i--) {
          if (+all[i].timestamp > now + FUTURE_TOLERANCE_MS) all.splice(i,1);
        }
        if (autoSkewCorrect && future.length) {
          // apply correction to any remaining items that were exactly on boundary (rare)
          const maxAheadMs = detectedSkewMs || Math.max(...future.map(f=> +f.timestamp - now));
          all.forEach(d => { if (+d.timestamp > now + FUTURE_TOLERANCE_MS) { d.timestamp = new Date(+d.timestamp - maxAheadMs); } });
        }
        const sorted = all.sort((a,b)=>a.baseTimestamp - b.baseTimestamp);
        setRawData(sorted);
        setAlertEvents(generateAlertEvents(sorted));
      } catch (err) {
        console.error('[DetailedCharts] historical fetch error', err);
        // On error leave existing data untouched; do not inject mock to preserve data fidelity
      } finally {
        setIsLoading(false);
      }
    })();

    return () => {
      if (readingsUnsubRef.current) { try { readingsUnsubRef.current(); } catch(_){} }
    };
  }, [startDate, endDate, granularity]);

  useEffect(() => {
    const now = new Date();
    let newStart = new Date();
    if (rangePreset === '7d') {
      newStart.setDate(now.getDate() - 6);
      setGranularity('hour');
    } else if (rangePreset === '30d') {
      newStart.setDate(now.getDate() - 29);
      setGranularity('day');
    } else if (rangePreset === 'custom') {
      return;
    } else if (rangePreset === '90d') {
      newStart.setDate(now.getDate() - 89);
      setGranularity('day');
    }
    setStartDate(newStart.toISOString().slice(0, 10));
    setEndDate(now.toISOString().slice(0, 10));
  }, [rangePreset]);

  const visibleMetrics = useMemo(
    () => METRICS.filter(m => visible.includes(m.key)),
    [visible]
  );
  const stats = useMemo(() => computeStats(rawData, visibleMetrics), [rawData, visibleMetrics]);
  // Choose power field according to user selection
  const choosePower = useCallback((d)=>{
    if(!d) return 0;
    const scale = powerScale || 1;
    if(powerSource==='active') return (d.activePowerRaw ?? d.powerRaw ?? d.power) * scale;
    if(powerSource==='raw') return (d.powerRaw ?? d.activePowerRaw ?? d.power) * scale;
    if(powerSource==='derived') return (d.derivedReal ?? (d.voltage*d.current*d.pf) ?? d.power) * scale;
    // auto: prefer active raw if plausible
    if(d.activePowerRaw && d.activePowerRaw>0){
      // Detect kW mis-scaling: if active<20 and voltage*current > 200, treat as kW
      const apparent = d.voltage * d.current;
      if(d.activePowerRaw < 20 && apparent > 200) return d.activePowerRaw * 1000 * scale;
      return d.activePowerRaw * scale;
    }
    if(d.powerRaw && d.powerRaw>0){
      const apparent = d.voltage * d.current;
      // If raw power > 3x apparent, maybe already kW => multiply 1000? Actually cap unrealistic spikes
      if(d.powerRaw > apparent * 3 && d.powerRaw < 50) return d.powerRaw * 1000 * scale; // small but flagged as kW
      return d.powerRaw * scale;
    }
    return (d.derivedReal ?? d.power ?? 0) * scale;
  }, [powerSource, powerScale]);
  // adjustTs no longer needed since we show raw base timestamps
  // timestamp adjustment applied during merge and historical load
  const peakPeriods = useMemo(() => {
    if (!rawData.length) return [];
    const sorted = [...rawData].sort((a, b) => b[focusMetric] - a[focusMetric]);
    return sorted.slice(0, 3);
  }, [rawData, focusMetric]);
  const aggregated = useMemo(() => {
    if (!rawData.length) return [];
    if (granularity === 'hour') return aggregateByPeriod(rawData, 'day');
    return aggregateByPeriod(rawData, granularity === 'week' ? 'week' : 'day');
  }, [rawData, granularity]);
  const yMaxGlobal = useMemo(() => {
    if (!rawData.length) return 0;
    return Math.max(
      ...rawData.flatMap(d => visibleMetrics.map(m => d[m.key] || 0)),
      ...visibleMetrics.map(m => thresholds[m.key] || 0)
    );
  }, [rawData, visibleMetrics, thresholds]);

  const toggleMetric = (key) => {
    setVisible(prev =>
      prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key]
    );
  };

  const updateThreshold = (metric, value) => {
    setThresholds(prev => ({ ...prev, [metric]: value }));
  };

  const onExportCSV = () => {
    if (!rawData.length) return;
    const headers = ['timestamp', ...visible];
    const rows = rawData.map(d => [
      d.timestamp.toISOString(),
      ...visible.map(k => d[k])
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `usage-${startDate}-to-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const onExportPNG = async () => {
    if (!chartWrapperRef.current) return;
    try {
      const html2canvas = await import('html2canvas').catch(() => null);
      if (!html2canvas) {
        alert('PNG export requires html2canvas. Please install it.');
        return;
      }
      const canvas = await html2canvas.default(chartWrapperRef.current, {
        backgroundColor: '#ffffff'
      });
      const link = document.createElement('a');
      link.download = `charts-${startDate}-to-${endDate}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error(err);
      alert('Failed to export image.');
    }
  };

  const handleCustomDateChange = (setter) => (e) => {
    setRangePreset('custom');
    setter(e.target.value);
  };

  // generateAlertEvents now defined above; removed useCallback version.

  const renderLineChart = () => {
    const width = 900;
    const isNarrow = typeof window !== 'undefined' && window.innerWidth < 600;
    const height = isNarrow ? 260 : 320; // shorter overall height on mobile
    const padding = { top: isNarrow ? 44 : 30, right: 56, bottom: isNarrow ? 22 : 40, left: 64 };
    if (!rawData.length) {
      return <div className="dc-chart-empty">No data for selected range.</div>;
    }
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;
    const xCount = rawData.length - 1 || 1;
    const xScale = (i) => padding.left + (i / xCount) * innerW;
    const yScale = (v) => padding.top + innerH - (v / yMaxGlobal) * innerH;
    const xTicks = 6;
    const yTicks = 5;
    const visibleAlerts = alertEvents.filter(a =>
      a.timestamp >= new Date(startDate) && a.timestamp <= new Date(endDate)
    );
    return (
  <svg role="img" aria-label="Time-series usage chart" width="100%" viewBox={`0 0 ${width} ${height}`} className="dc-line-chart">
        <g className="dc-axes">
          <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#64748b" strokeWidth="1" />
          <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#64748b" strokeWidth="1" />
          {Array.from({ length: xTicks + 1 }).map((_, i) => {
            const idx = Math.round((i / xTicks) * xCount);
            const safeIdx = Math.min(idx, rawData.length - 1); // prevent out-of-range when few points (weekly)
            const d = rawData[safeIdx];
            if (!d) return null;
            return (
              <g key={i}>
                <line x1={xScale(safeIdx)} x2={xScale(safeIdx)} y1={height - padding.bottom} y2={height - padding.bottom + 6} stroke="#64748b" />
                <text x={xScale(safeIdx)} y={height - padding.bottom + 18} textAnchor="middle" className="dc-axis-text">
                  {d.timestamp.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </text>
              </g>
            );
          })}
          {Array.from({ length: yTicks + 1 }).map((_, i) => {
            const v = (i / yTicks) * yMaxGlobal;
            return (
              <g key={i}>
                <line x1={padding.left - 6} x2={padding.left} y1={yScale(v)} y2={yScale(v)} stroke="#64748b" />
                <text x={padding.left - 10} y={yScale(v) + 4} textAnchor="end" className="dc-axis-text">{Math.round(v)}</text>
                <line x1={padding.left} x2={width - padding.right} y1={yScale(v)} y2={yScale(v)} stroke="#e2e8f0" strokeWidth="0.5" />
              </g>
            );
          })}
        </g>
        {visibleMetrics.map(m => (
          <g key={`th-${m.key}`}>
            <line x1={padding.left} x2={width - padding.right} y1={yScale(thresholds[m.key])} y2={yScale(thresholds[m.key])} stroke={m.color} strokeDasharray="4 4" strokeWidth="1.5" />
            <text x={width - padding.right + 4} y={yScale(thresholds[m.key]) + 4} className="dc-threshold-label" fill={m.color}>{m.label.split(' ')[0]} Thr {thresholds[m.key]}</text>
          </g>
        ))}
        {visibleAlerts.map(alert => {
          const idx = rawData.findIndex(d => d.timestamp.getTime() === alert.timestamp.getTime());
          if (idx < 0) return null;
          const x = xScale(idx);
          return (
            <g key={alert.id}>
              <rect x={x - 2} y={padding.top} width={4} height={innerH} fill={ALERT_TYPES[alert.type].color} opacity="0.25" />
              <circle cx={x} cy={padding.top - 10} r={5} fill={ALERT_TYPES[alert.type].color}>
                <title>{`${ALERT_TYPES[alert.type].label} @ ${formatDateShort(alert.timestamp)}`}</title>
              </circle>
            </g>
          );
        })}
        {visibleMetrics.map(m => {
          if (!rawData.length) return null;
          const buildLine = () => rawData.map((d,i)=>`${i===0?'M':'L'} ${xScale(i)} ${yScale(d[m.key])}`).join(' ');
          const buildStepped = () => {
            let p='';
            rawData.forEach((d,i)=>{
              const x = xScale(i); const y = yScale(d[m.key]);
              if(i===0){ p += `M ${x} ${y}`; }
              else { const prevY = yScale(rawData[i-1][m.key]); p += ` L ${x} ${prevY} L ${x} ${y}`; }
            });
            return p;
          };
          const buildSmooth = () => {
            if (rawData.length < 3) return buildLine();
            let dPath='';
            for(let i=0;i<rawData.length-1;i++){
              const current = rawData[i];
              const next = rawData[i+1];
              const x1 = xScale(i); const y1 = yScale(current[m.key]);
              const x2 = xScale(i+1); const y2 = yScale(next[m.key]);
              const cpX = (x1 + x2) / 2;
              if(i===0) dPath += `M ${x1} ${y1}`;
              dPath += ` C ${cpX} ${y1}, ${cpX} ${y2}, ${x2} ${y2}`;
            }
            return dPath;
          };
          const basePath = lineStyle==='stepped'?buildStepped(): lineStyle==='smooth'?buildSmooth(): buildLine();
          const areaPath = () => {
            const baseline = yScale(0);
            return basePath + ` L ${xScale(rawData.length-1)} ${baseline} L ${xScale(0)} ${baseline} Z`;
          };
          const barLayout = (() => { if(lineStyle!=='bar') return null; const count=rawData.length||1; const gapRatio=.25; const barW=innerW/(count+(count-1)*gapRatio); const gap=barW*gapRatio; const xBar=(i)=>padding.left+i*(barW+gap); return {barW,gap,xBar};})();
          return (
            <g key={m.key} aria-label={`${m.label} ${lineStyle} series`}>
              {lineStyle==='bar' ? (
                rawData.map((d,i)=>{ const v=d[m.key]; const isAnomaly = highlightAnomalies && v >= thresholds[m.key]; const h = innerH - (yScale(v) - padding.top); return (
                  <rect key={i} x={barLayout.xBar(i)} y={yScale(v)} width={barLayout.barW} height={h} rx={2} fill={isAnomaly? '#dc2626':m.color}>
                    <title>{`${m.label}: ${v} @ ${formatDateShort(d.timestamp)}${isAnomaly?' (Breach)':''}`}</title>
                  </rect>
                );})
              ) : (
                <>
                  {lineStyle==='area' && <path d={areaPath()} fill={m.color} opacity="0.12" />}
                  <path d={basePath} fill="none" stroke={m.color} strokeWidth={lineStyle==='area'?1.4:1.8} strokeLinejoin="round" strokeLinecap="round" />
                  {rawData.map((d,i)=>{ const v=d[m.key]; const isAnomaly = highlightAnomalies && v >= thresholds[m.key]; return (
                    <circle key={i} cx={xScale(i)} cy={yScale(v)} r={isAnomaly?4.5:3} fill={isAnomaly?'#dc2626':m.color} stroke="#fff" strokeWidth="1">
                      <title>{`${m.label}: ${v} @ ${formatDateShort(d.timestamp)}${isAnomaly?' (Breach)':''}`}</title>
                    </circle>
                  );})}
                </>
              )}
              {stats[m.key].minPoint && <circle cx={xScale(rawData.indexOf(stats[m.key].minPoint))} cy={yScale(stats[m.key].minPoint[m.key])} r="7" fill="#ffffff" stroke={m.color} strokeWidth="2" />}
              {stats[m.key].maxPoint && <circle cx={xScale(rawData.indexOf(stats[m.key].maxPoint))} cy={yScale(stats[m.key].maxPoint[m.key])} r="7" fill="#ffffff" stroke={m.color} strokeWidth="2" />}
            </g>
          );
        })}
      </svg>
    );
  };

  // New: Per-metric small charts for each metric (power, voltage, current, energy)
  const renderMetricMiniChart = (metricKey) => {
    const metric = METRICS.find(m => m.key === metricKey);
    if (!metric) return null;
    if (!rawData.length) return <div className="dc-chart-empty">No data</div>;
    const sizeHeights = { s: 150, m: 210, l: 270 };
    const sizeWidths = { s: 280, m: 340, l: 420 };
    const height = sizeHeights[chartSize] || 210;
    const width = sizeWidths[chartSize] || 340;
    const padding = { top: 18, right: 12, bottom: 20, left: 40 };
  // Map power metric if selected
  const data = metricKey==='power'? rawData.map(r=>({...r, power: choosePower(r)})): rawData;
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;
    const xCount = data.length - 1 || 1;
    const xScale = (i) => padding.left + (i / xCount) * innerW;
    const values = data.map(d => d[metricKey] ?? 0).filter(v=>Number.isFinite(v));
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    let domainMin = 0;
    let domainMax = Math.max(rawMax, thresholds[metricKey] || 0);
    if(useSmartScale && metricKey==='voltage') {
      domainMin = rawMin > 150 ? 150 : Math.floor(rawMin - 2);
      domainMax = Math.max(300, rawMax * 1.02, thresholds.voltage || 0);
    } else if(useSmartScale && metricKey!=='energy') {
      const span = (rawMax - rawMin) || 1;
      domainMin = Math.max(0, rawMin - span * 0.05);
    }
    const denom = (domainMax - domainMin) || 1;
    const yScale = (v) => padding.top + innerH - ((v - domainMin) / denom) * innerH;
    const buildLine = () => data.map((d,i)=>`${i===0?'M':'L'} ${xScale(i)} ${yScale(d[metricKey])}`).join(' ');
    const buildStepped = () => {
      let p='';
      data.forEach((d,i)=>{const x=xScale(i);const y=yScale(d[metricKey]); if(i===0){p+=`M ${x} ${y}`;} else {const prevY=yScale(data[i-1][metricKey]); p+=` L ${x} ${prevY} L ${x} ${y}`;}}); return p; };
    const buildSmooth = () => {
      if (data.length < 3) return buildLine();
      let dPath='';
      for(let i=0;i<data.length-1;i++){
        const c=data[i]; const n=data[i+1]; const x1=xScale(i); const y1=yScale(c[metricKey]); const x2=xScale(i+1); const y2=yScale(n[metricKey]); const cpX=(x1+x2)/2; if(i===0) dPath+=`M ${x1} ${y1}`; dPath+=` C ${cpX} ${y1}, ${cpX} ${y2}, ${x2} ${y2}`;
      }
      return dPath; };
    const basePath = lineStyle==='stepped'?buildStepped(): lineStyle==='smooth'?buildSmooth(): buildLine();
    const areaPath = () => { const baseline = yScale(domainMin); return basePath + ` L ${xScale(data.length-1)} ${baseline} L ${xScale(0)} ${baseline} Z`; };
    const yTicks = 3;
    return (
      <svg role="img" aria-label={`${metric.label} mini chart`} className="dc-mini-chart" viewBox={`0 0 ${width} ${height}`}> 
        {/* Axes */}
        <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#cbd5e1" strokeWidth="1" />
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#cbd5e1" strokeWidth="1" />
        {Array.from({length:yTicks+1}).map((_,i)=>{ const v = domainMin + (i / yTicks) * (domainMax - domainMin); return (
          <g key={i}>
            <line x1={padding.left} x2={width - padding.right} y1={yScale(v)} y2={yScale(v)} stroke="#e2e8f0" strokeWidth="0.5" />
            <text x={padding.left - 6} y={yScale(v)+4} textAnchor="end" className="dc-axis-text">{Math.round(v)}</text>
          </g>
        );})}
        {/* Threshold */}
        {thresholds[metricKey] && (
          <g>
            <line x1={padding.left} x2={width - padding.right} y1={yScale(thresholds[metricKey])} y2={yScale(thresholds[metricKey])} stroke={metric.color} strokeDasharray="4 4" strokeWidth="1" />
            <text x={width - padding.right} y={yScale(thresholds[metricKey]) - 4} textAnchor="end" className="dc-threshold-label" fill={metric.color}>{thresholds[metricKey]}</text>
          </g>
        )}
        {lineStyle==='area' && <path d={areaPath()} fill={metric.color} opacity="0.12" />}
        <path d={basePath} fill="none" stroke={metric.color} strokeWidth={lineStyle==='area'?1.4:1.8} strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d,i)=>{ const v=d[metricKey]; const isAnomaly = highlightAnomalies && v >= thresholds[metricKey]; return (
          <circle key={i} cx={xScale(i)} cy={yScale(v)} r={isAnomaly?4.5:3} fill={isAnomaly?'#dc2626':metric.color} stroke="#fff" strokeWidth="1">
            <title>{`${metric.label}: ${v} @ ${formatDateShort(d.timestamp)}${isAnomaly?' (Breach)':''}`}</title>
          </circle>
        );})}
      </svg>
    );
  };

  // Large expanded chart overlay rendering for one metric
  const renderExpandedMetric = () => {
    if (!expandedMetric) return null;
    const metric = METRICS.find(m=>m.key===expandedMetric);
    if (!metric) return null;
  const data = expandedMetric==='power'? rawData.map(r=>({...r, power: choosePower(r)})): rawData;
    const width = 1100;
    const height = 480;
    const padding = { top: 30, right: 40, bottom: 40, left: 70 };
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;
    if (!data.length) return (
      <div className="dc-overlay" onClick={()=>setExpandedMetric(null)}>
        <div className="dc-overlay-inner" onClick={e=>e.stopPropagation()}>
          <div className="dc-overlay-head">
            <h3 className="dc-overlay-title">{metric.label}</h3>
            <button className="dc-close" onClick={()=>setExpandedMetric(null)}>✕</button>
          </div>
          <div className="dc-chart-empty" style={{padding:'2rem'}}>No data</div>
        </div>
      </div>
    );
    const xCount = data.length - 1 || 1;
    const xScale = (i) => padding.left + (i / xCount) * innerW;
    const values = data.map(d=>d[expandedMetric] || 0);
    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    let domainMin = 0;
    let domainMax = Math.max(rawMax, thresholds[expandedMetric] || 0);
    if(useSmartScale && expandedMetric==='voltage') {
      domainMin = rawMin > 150 ? 150 : Math.floor(rawMin - 2);
      domainMax = Math.max(300, rawMax * 1.02, thresholds.voltage || 0);
    } else if(useSmartScale && expandedMetric!=='energy') {
      const span = (rawMax - rawMin) || 1;
      domainMin = Math.max(0, rawMin - span * 0.05);
    }
    const denom = (domainMax - domainMin) || 1;
    const yScale = (v) => padding.top + innerH - ((v - domainMin) / denom) * innerH;
    const MAX_POINTS = 800; // decimation limit for readability
    const stride = Math.max(1, Math.ceil(data.length / MAX_POINTS));
    const indexIterator = (cb) => { for(let i=0;i<data.length;i+=stride){ cb(i);} if((data.length-1)%stride!==0){ cb(data.length-1);} };
    const buildLine = () => {
      let path='';
      let first=true;
      indexIterator(i=>{ const d=data[i]; const cmd = first?'M':'L'; first=false; path += `${cmd} ${xScale(i)} ${yScale(d[expandedMetric])} `; });
      return path.trim();
    };
    const buildStepped = () => { let p=''; data.forEach((d,i)=>{const x=xScale(i); const y=yScale(d[expandedMetric]); if(i===0){p+=`M ${x} ${y}`;} else {const prevY=yScale(data[i-1][expandedMetric]); p+=` L ${x} ${prevY} L ${x} ${y}`;}}); return p; };
  const buildSmooth = () => { if (data.length<3) return buildLine(); let dPath=''; for(let i=0;i<data.length-1;i++){ const c=data[i]; const n=data[i+1]; const x1=xScale(i); const y1=yScale(c[expandedMetric]); const x2=xScale(i+1); const y2=yScale(n[expandedMetric]); const cpX=(x1+x2)/2; if(i===0) dPath+=`M ${x1} ${y1}`; dPath+=` C ${cpX} ${y1}, ${cpX} ${y2}, ${x2} ${y2}`;} return dPath; };
    const basePath = lineStyle==='stepped'?buildStepped(): lineStyle==='smooth'?buildSmooth(): buildLine();
    const areaPath = () => { const baseline = yScale(domainMin); return basePath + ` L ${xScale(data.length-1)} ${baseline} L ${xScale(0)} ${baseline} Z`; };
    const yTicks = 6;
    // Simple moving average (window size auto ~ sqrt(n))
    const smaWindow = Math.max(3, Math.round(Math.sqrt(data.length)));
    const smaPath = () => {
      if(!showSMA || data.length < smaWindow+2) return null;
      let path='';
      for(let i=0;i<data.length;i+=stride){
        let sum=0,count=0;
        for(let k=i-smaWindow+1;k<=i;k++){ if(k>=0){ sum += data[k][expandedMetric]; count++; } }
        const avg = sum / (count||1);
        const x = xScale(i); const y = yScale(avg);
        path += (path? ' L':'M')+` ${x} ${y}`;
      }
      return path;
    };
    // Tooltip interaction
    const handleMove = (evt) => {
      const rect = evt.currentTarget.getBoundingClientRect();
      const relX = evt.clientX - rect.left - padding.left; // inside plot
      if (relX < 0 || relX > innerW) return;
      const ratio = relX / innerW;
      const idx = Math.min(data.length-1, Math.max(0, Math.round(ratio * xCount)));
      const point = data[idx];
      const tooltip = document.getElementById('dc-exp-tooltip');
      if (tooltip && point) {
        tooltip.style.display='block';
        tooltip.style.left = (xScale(idx)+8) + 'px';
        tooltip.style.top = (yScale(point[expandedMetric]) - 10) + 'px';
  tooltip.innerHTML = `<div><strong>${metric.label}</strong>: ${point[expandedMetric] ?? 0}</div><div>${new Date(point.timestamp).toLocaleString([], {year:'numeric', month:'short', day:'2-digit', hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false})}</div>`;
      }
    };
    const handleLeave = () => {
      const tooltip = document.getElementById('dc-exp-tooltip');
      if (tooltip) tooltip.style.display='none';
    };
    return (
      <div className="dc-overlay" onClick={()=>setExpandedMetric(null)}>
        <div className="dc-overlay-inner" onClick={e=>e.stopPropagation()}>
          <div className="dc-overlay-head">
            <h3 className="dc-overlay-title">{metric.label} Detailed</h3>
            <div style={{display:'flex',gap:'.5rem',alignItems:'center',flexWrap:'wrap'}}>
              <select className="dc-select" value={lineStyle} onChange={e=>setLineStyle(e.target.value)}>
                <option value="line">Line</option>
                <option value="smooth">Smooth</option>
                <option value="stepped">Stepped</option>
                <option value="area">Area</option>
                <option value="bar">Bar</option>
              </select>
              <label style={{display:'flex',alignItems:'center',gap:4,fontSize:'.55rem',fontWeight:600,padding:'2px 6px',border:'1px solid #e2e8f0',borderRadius:6,background:'#fff'}} title="Smart axis scale (e.g. clamp voltage ~150-300V)">
                <input type="checkbox" checked={useSmartScale} onChange={e=>setUseSmartScale(e.target.checked)} style={{transform:'scale(1.05)'}} /> Smart
              </label>
              <label style={{display:'flex',alignItems:'center',gap:4,fontSize:'.65rem',fontWeight:600}}>
                <input type="checkbox" checked={showMarkers} onChange={e=>setShowMarkers(e.target.checked)} style={{transform:'scale(1.1)'}} /> Markers
              </label>
              <label style={{display:'flex',alignItems:'center',gap:4,fontSize:'.65rem',fontWeight:600}}>
                <input type="checkbox" checked={showSMA} onChange={e=>setShowSMA(e.target.checked)} style={{transform:'scale(1.1)'}} /> Avg Line
              </label>
              <button className="dc-close" onClick={()=>setExpandedMetric(null)}>✕</button>
            </div>
          </div>
          <div className="dc-overlay-chart-wrap">
            <svg role="img" aria-label={`${metric.label} expanded chart`} width="100%" viewBox={`0 0 ${width} ${height}`} className="dc-expanded-chart" onMouseMove={handleMove} onMouseLeave={handleLeave}>
              {/* Axes */}
              <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#cbd5e1" strokeWidth="1.2" />
              <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#cbd5e1" strokeWidth="1.2" />
              {Array.from({length:yTicks+1}).map((_,i)=>{ const v = domainMin + (i / yTicks) * (domainMax - domainMin); return (
                <g key={i}>
                  <line x1={padding.left} x2={width - padding.right} y1={yScale(v)} y2={yScale(v)} stroke="#e2e8f0" strokeWidth="0.7" />
                  <text x={padding.left - 8} y={yScale(v)+4} textAnchor="end" className="dc-axis-text">{Math.round(v)}</text>
                </g>
              );})}
              {/* X labels (up to 8 evenly spaced) */}
              {Array.from({length:Math.min(8,data.length)}).map((_,i)=>{ const idx = Math.round((i/(Math.min(8,data.length)-1||1))* (data.length-1)); const ts = data[idx]?.timestamp; return (
                <text key={i} x={xScale(idx)} y={height - padding.bottom + 16} textAnchor="middle" className="dc-axis-text" fontSize="10">{ts? new Date(ts).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12:false}) : ''}</text>
              );})}
              {/* Threshold */}
              {thresholds[expandedMetric] && (
                <g>
                  <line x1={padding.left} x2={width - padding.right} y1={yScale(thresholds[expandedMetric])} y2={yScale(thresholds[expandedMetric])} stroke={metric.color} strokeDasharray="6 6" strokeWidth="1.4" />
                  <text x={width - padding.right} y={yScale(thresholds[expandedMetric]) - 6} textAnchor="end" className="dc-threshold-label" fill={metric.color}>{thresholds[expandedMetric]}</text>
                </g>
              )}
              {lineStyle==='area' && <path d={areaPath()} fill={metric.color} opacity="0.15" />}
              <path d={basePath} fill="none" stroke={metric.color} strokeWidth={lineStyle==='area'?1.8:2.2} strokeLinejoin="round" strokeLinecap="round" />
              {showSMA && smaPath() && <path d={smaPath()} fill="none" stroke="#0f172a" strokeOpacity="0.55" strokeWidth="2" strokeDasharray="6 4" />}
              {showMarkers && lineStyle!=='bar' && data.map((d,i)=>{ if(i%stride!==0 && i!==data.length-1) return null; const v = d[expandedMetric]; const isAnomaly = highlightAnomalies && v >= thresholds[expandedMetric]; return (
                <circle key={i} cx={xScale(i)} cy={yScale(v)} r={isAnomaly?5.2:3.2} fill={isAnomaly?'#dc2626':metric.color} stroke="#fff" strokeWidth="1.1" />
              );})}
            </svg>
            <div id="dc-exp-tooltip" className="dc-exp-tooltip" style={{display:'none'}} />
          </div>
        </div>
      </div>
    );
  };

  const renderBarChart = () => {
  const width = 900;
  const isNarrow = typeof window !== 'undefined' && window.innerWidth < 600;
  const barCount = aggregated.length || 1;
  const maxLabels = 12;
  const stridePreview = Math.max(1, Math.ceil(barCount / maxLabels));
    // allocate a bit more bottom space only if labels rotate (dense)
    const height = isNarrow ? 200 : 260;
    const bottomPad = isNarrow ? (stridePreview > 1 ? 30 : 24) : 50;
    const padding = { top: isNarrow ? 26 : 20, right: 40, bottom: bottomPad, left: 56 };
    if (!aggregated.length) {
      return <div className="dc-chart-empty">No aggregated data.</div>;
    }
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const metric = focusMetric;
  const color = METRICS.find(m => m.key === metric)?.color || '#334155';
  const maxVal = Math.max(...aggregated.map(d => d[metric]));
    // Improved bar layout with consistent gaps
  const count = barCount;
  const desiredGap = Math.min(16, Math.max(4, innerW / count * 0.12)); // dynamic gap based on density
  const totalGapSpace = desiredGap * (count - 1);
  let barWidth = (innerW - totalGapSpace) / count;
    if (barWidth < 2) { // fallback if too many bars
      barWidth = 2;
    }
    const gap = (innerW - barWidth * count) / (count - 1 || 1); // recompute exact gap to fill width precisely
    const xScale = (i) => padding.left + i * (barWidth + gap);
  const yScale = (v) => padding.top + innerH - (v / maxVal) * innerH;
  const yTicks = 4;
  // Adaptive label density (reuse stridePreview logic)
  const stride = stridePreview;
    return (
      <svg role="img" aria-label={`Aggregated ${metric} bar chart`} width="100%" viewBox={`0 0 ${width} ${height}`} className="dc-bar-chart">
        <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#64748b" strokeWidth="1" />
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#64748b" strokeWidth="1" />
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const v = (i / yTicks) * maxVal;
          return (
            <g key={i}>
              <line x1={padding.left} x2={width - padding.right} y1={yScale(v)} y2={yScale(v)} stroke="#e2e8f0" strokeWidth="0.5" />
              <text x={padding.left - 8} y={yScale(v) + 4} textAnchor="end" className="dc-axis-text">{Math.round(v)}</text>
            </g>
          );
        })}
        {aggregated.map((d, i) => {
          const h = innerH - (yScale(d[metric]) - padding.top);
          const isPeak = d[metric] === maxVal;
          let label = d.key;
          if (d.key.includes('-W')) {
            label = d.key; // Weekly representation
          } else {
            const dt = new Date(d.key);
            if (!isNaN(dt)) label = dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          }
          const showLabel = (i % stride === 0) || i === aggregated.length - 1;
          const xCenter = xScale(i) + barWidth / 2;
          return (
            <g key={d.key}>
              <rect x={xScale(i)} y={yScale(d[metric])} width={barWidth} height={h} fill={isPeak ? '#dc2626' : color} rx="4">
                <title>{`${label}: ${d[metric].toFixed(2)}`}</title>
              </rect>
              {showLabel && (
                <text x={xCenter} y={height - padding.bottom + (stride > 1 ? 24 : 16)} textAnchor="middle" className="dc-axis-text" style={{ fontSize: '10px' }} transform={stride > 1 ? `rotate(-45 ${xCenter} ${height - padding.bottom + 24})` : undefined}>
                  {label}
                </text>
              )}
            </g>
          );
        })}
        <text x={width / 2} y={height - 10} textAnchor="middle" className="dc-axis-text">Period</text>
        <text transform={`translate(15 ${height / 2}) rotate(-90)`} textAnchor="middle" className="dc-axis-text">{METRICS.find(m => m.key === metric)?.label}</text>
      </svg>
    );
  };

  return (
    <div className="dc-container">
      {futureSkew !== null && (
        <div style={{background:'#fef3c7',color:'#92400e',padding:'6px 10px',fontSize:'.65rem',fontWeight:600,textAlign:'center'}}>
          Device clock appears {futureSkew} min ahead – future readings hidden. Purged: {purgedFuture}
          <label style={{marginLeft:12,display:'inline-flex',alignItems:'center',gap:4,cursor:'pointer'}}>
            <input type="checkbox" checked={autoSkewCorrect} onChange={e=>setAutoSkewCorrect(e.target.checked)} style={{transform:'scale(1.05)'}} />
            <span style={{fontWeight:600}}>Auto Correct</span>
          </label>
          <span style={{marginLeft:8,fontWeight:500}}>Skew≈ {Math.round(detectedSkewMs/1000)}s</span>
          <button style={{marginLeft:8,fontSize:'.55rem',padding:'2px 6px',border:'1px solid #d97706',background:'#fff7ed',color:'#92400e',borderRadius:4,cursor:'pointer'}} onClick={()=>{
            const now = Date.now();
            setRawData(d=>{ const before=d.length; const filtered=d.filter(x=> +x.timestamp <= now + FUTURE_TOLERANCE_MS); const purged=before-filtered.length; if(purged>0) setPurgedFuture(p=>p+purged); return filtered; });
          }}>Purge Now</button>
        </div>
      )}
      <header className="dc-header" role="banner">
        <div className="dc-header-content">
          <div className="dc-logo-section">
            <img src={Logo} alt="PowerPulsePro logo" className="dc-logo" />
          </div>
            <h1 className="dc-page-title">Detailed Usage Analytics</h1>
            <button className="dc-back-btn" onClick={() => navigate('/dashboard')} aria-label="Back to Dashboard">← Dashboard</button>
        </div>
      </header>
      <section className="dc-filters" role="toolbar" aria-label="Chart filters and date range selection">
        <div className="dc-filter-group">
          <label className="dc-filter-label">Range Preset</label>
          <div className="dc-preset-row" role="group" aria-label="Date range presets">
            {[{ key: '7d', label: 'Last 7 Days' }, { key: '30d', label: 'Last 30 Days' }, { key: '90d', label: 'Last 90 Days' }, { key: 'custom', label: 'Custom' }].map(p => (
              <button key={p.key} className={`dc-chip ${rangePreset === p.key ? 'active' : ''}`} onClick={() => setRangePreset(p.key)} aria-pressed={rangePreset === p.key}>{p.label}</button>
            ))}
          </div>
        </div>
        <div className="dc-filter-group">
          <label className="dc-filter-label" htmlFor="start-date">Start</label>
          <input id="start-date" type="date" value={startDate} onChange={handleCustomDateChange(setStartDate)} className="dc-date-input" aria-label="Start date" />
        </div>
        <div className="dc-filter-group">
          <label className="dc-filter-label" htmlFor="end-date">End</label>
          <input id="end-date" type="date" value={endDate} onChange={handleCustomDateChange(setEndDate)} className="dc-date-input" aria-label="End date" />
        </div>
        <div className="dc-filter-group">
          <label className="dc-filter-label" htmlFor="granularity">Granularity</label>
          <select id="granularity" className="dc-select" value={granularity} onChange={e => setGranularity(e.target.value)} aria-label="Granularity selection">
            <option value="hour">Hourly</option>
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
          </select>
        </div>
        <div className="dc-filter-group">
          <label className="dc-filter-label">Anomalies</label>
          <div className="dc-toggle-row">
            <label className="dc-checkbox-label">
              <input type="checkbox" checked={highlightAnomalies} onChange={(e) => setHighlightAnomalies(e.target.checked)} aria-label="Highlight threshold anomalies" />
              Highlight
            </label>
          </div>
        </div>
      </section>
      <section className="dc-metric-legend" aria-label="Metric legend and visibility toggles">
        {METRICS.map(m => {
          const active = visible.includes(m.key);
          return (
            <button key={m.key} className={`dc-legend-item ${active ? 'visible' : 'dimmed'}`} onClick={() => toggleMetric(m.key)} style={{ '--metric-color': m.color }} aria-pressed={active} aria-label={`Toggle ${m.label}`}>
              <span className="dc-legend-dot" />
              <span className="dc-legend-label">{m.label}</span>
            </button>
          );
        })}
      </section>
      <div className="dc-threshold-panel" aria-label="Threshold controls">
        {METRICS.map(m => (
          <div key={m.key} className="dc-threshold-item">
            <label htmlFor={`thr-${m.key}`} className="dc-threshold-label">{m.label.split(' ')[0]} Thr</label>
            <input id={`thr-${m.key}`} type="number" className="dc-threshold-input" value={thresholds[m.key]} onChange={e => updateThreshold(m.key, Number(e.target.value))} aria-label={`${m.label} threshold`} />
          </div>
        ))}
      </div>
      <div className="dc-charts-wrapper" ref={chartWrapperRef}>
        <div className="dc-chart-card" aria-live="polite">
          <div className="dc-chart-card-header" style={{justifyContent:'space-between'}}>
            <h2 className="dc-chart-title">Live Metrics (Separate)</h2>
            <div className="dc-chart-subcontrols" style={{ display:'flex', alignItems:'center', gap:'.5rem', flexWrap:'wrap'}}>
              {/* Time offset controls removed (fixed 1h lag applied internally) */}
              {/* Removed TimeDbg toggle button (showTimeDebug no longer used) */}
              <div style={{display:'flex',alignItems:'center',gap:'.3rem'}}>
                <label className="dc-sub-label" htmlFor="line-style">Style</label>
                <select id="line-style" className="dc-select" value={lineStyle} onChange={e=>setLineStyle(e.target.value)}>
                  <option value="line">Line</option>
                  <option value="smooth">Smooth</option>
                  <option value="stepped">Stepped</option>
                  <option value="area">Area</option>
                  <option value="bar">Bar</option>
                </select>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'.3rem'}}>
                <label className="dc-sub-label" htmlFor="power-source">Power Src</label>
                <select id="power-source" className="dc-select" value={powerSource} onChange={e=>setPowerSource(e.target.value)} title="Select which power field to visualize">
                  <option value="auto">Auto</option>
                  <option value="active">ActivePower</option>
                  <option value="raw">Power</option>
                  <option value="derived">Derived</option>
                </select>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'.3rem'}}>
                <label className="dc-sub-label" htmlFor="power-scale">Scale</label>
                <input id="power-scale" type="number" step="0.1" min="0.001" className="dc-threshold-input" style={{width:70}} value={powerScale} onChange={e=>{ const v=parseFloat(e.target.value)||1; setPowerScale(v); try{localStorage.setItem('pp_powerScale', String(v));}catch{} }} />
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'.3rem'}}>
                <label className="dc-sub-label" htmlFor="chart-size">Size</label>
                <select id="chart-size" className="dc-select" value={chartSize} onChange={e=>setChartSize(e.target.value)}>
                  <option value="s">Small</option>
                  <option value="m">Medium</option>
                  <option value="l">Large</option>
                </select>
              </div>
              <button className="dc-chip" style={{fontSize:'.6rem'}} onClick={()=>setVisible(METRICS.map(m=>m.key))}>Show All</button>
              <button className="dc-chip" style={{fontSize:'.6rem'}} onClick={()=>setVisible([])}>Hide All</button>
            </div>
          </div>
          <div className={`dc-multi-grid ${chartSize==='l' ? 'large' : ''}`}>
            {METRICS.filter(m=>visible.includes(m.key)).map(m => (
              <div key={m.key} className="dc-mini-card" onClick={()=>setExpandedMetric(m.key)} role="button" tabIndex={0} onKeyDown={e=>{ if(e.key==='Enter' || e.key===' ') { setExpandedMetric(m.key); e.preventDefault(); } }}>
                <div className="dc-mini-head">
                  <span className="dc-mini-dot" style={{background:m.color}} />
                  <span className="dc-mini-title">{m.label}</span>
                  <button className="dc-mini-hide" title="Hide metric" onClick={(e)=>{e.stopPropagation(); setVisible(prev=>prev.filter(k=>k!==m.key));}}>✕</button>
                </div>
                <div className="dc-mini-body">
                  {isLoading ? <div className="dc-chart-empty" style={{padding:'1rem 0'}}>Loading…</div> : renderMetricMiniChart(m.key)}
                </div>
              </div>
            ))}
            {!METRICS.some(m=>visible.includes(m.key)) && (
              <div className="dc-chart-empty" style={{gridColumn:'1 / -1', padding:'1rem'}}>No metrics selected.</div>
            )}
          </div>
        </div>
        <div className="dc-chart-card">
          <div className="dc-chart-card-header">
            <h2 className="dc-chart-title">Aggregated {focusMetric} Comparison</h2>
            <div className="dc-chart-subcontrols">
              <label className="dc-sub-label" htmlFor="focus-metric">Metric</label>
              <select id="focus-metric" className="dc-select" value={focusMetric} onChange={(e) => setFocusMetric(e.target.value)} aria-label="Select aggregation focus metric">
                {METRICS.map(m => (
                  <option key={m.key} value={m.key}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="dc-chart-body dc-chart-body-responsive">{isLoading ? <Loader /> : renderBarChart()}</div>
        </div>
        {renderExpandedMetric()}
      </div>
      <section className="dc-summary-grid" aria-label="Metric summary statistics">
        {rawData.length === 0 ? (
          <div style={{ 
            gridColumn: '1 / -1', 
            textAlign: 'center', 
            padding: '2rem', 
            color: 'var(--dc-text-dim)', 
            fontSize: '0.9rem',
            background: 'var(--dc-surface)',
            borderRadius: 'var(--dc-radius-lg)',
            border: '1px solid var(--dc-border)'
          }}>
            No data available for the selected date range. Statistics will appear once data is received.
          </div>
        ) : (
          visibleMetrics.map(m => {
            const s = stats[m.key];
            return (
              <div key={m.key} className="dc-summary-card">
                <div className="dc-summary-header">
                  <span className="dc-summary-color" style={{ background: m.color }} />
                  <h3 className="dc-summary-title">{m.label}</h3>
                </div>
                <div className="dc-summary-stats">
                  <div className="dc-stat-line"><span>Min</span><strong>{s.min}</strong></div>
                  <div className="dc-stat-line"><span>Max</span><strong>{s.max}</strong></div>
                  <div className="dc-stat-line"><span>Avg</span><strong>{s.avg}</strong></div>
                </div>
                <div className="dc-summary-foot">
                  {s.minPoint && (<span className="dc-foot-tag" title={`At ${formatDateShort(s.minPoint.timestamp)}`}>Min @ {s.minPoint.timestamp.toLocaleDateString()}</span>)}
                  {s.maxPoint && (<span className="dc-foot-tag" title={`At ${formatDateShort(s.maxPoint.timestamp)}`}>Max @ {s.maxPoint.timestamp.toLocaleDateString()}</span>)}
                </div>
              </div>
            );
          })
        )}
      </section>
      <section className="dc-peak-panel" aria-label="Peak periods">
        <h2 className="dc-peak-title">Top {focusMetric} Periods</h2>
        <ul className="dc-peak-list">
          {peakPeriods.map(p => (
            <li key={p.timestamp.getTime()} className="dc-peak-item">
              <span className="dc-peak-time">{formatDateShort(p.timestamp)}</span>
              <span className="dc-peak-value">{p[focusMetric].toFixed(2)}</span>
            </li>
          ))}
          {!peakPeriods.length && <li className="dc-empty">No data</li>}
        </ul>
      </section>
      <section className="dc-export-panel" aria-label="Export options">
        <button className="dc-export-btn" onClick={onExportCSV} disabled={!rawData.length || isLoading} aria-disabled={!rawData.length || isLoading}>Export CSV</button>
        <button className="dc-export-btn" onClick={onExportPNG} disabled={!rawData.length || isLoading} aria-disabled={!rawData.length || isLoading}>Download PNG</button>
        <div className="dc-alert-legend" aria-label="Alert color legend">
          {Object.entries(ALERT_TYPES).map(([k, v]) => (
            <span key={k} className="dc-alert-legend-item">
              <span className="dc-alert-dot" style={{ background: v.color }} aria-hidden="true" />
              {v.label}
            </span>
          ))}
        </div>
      </section>
      <footer className="dc-footer" role="contentinfo">
        <div className="dc-footer-help">
          <span>Need help? Contact </span>
          <a href="mailto:powerpulsepro.smartmetering@gmail.com" className="dc-footer-link">PowerPulsePro Support</a>
        </div>
        <div className="dc-footer-copy">© {new Date().getFullYear()} PowerPulsePro Smart Energy Meter. All rights reserved.</div>
        {rawData.length>0 && (
          <div style={{marginTop:4,fontSize:'.55rem',color:'#94a3b8'}}>
            Latest point: {new Date(rawData[rawData.length-1].timestamp).toLocaleString([], {hour12:false})} (Δ {(Math.round((Date.now()-rawData[rawData.length-1].timestamp)/1000))}s)
          </div>
        )}
      </footer>
    </div>
  );
};

const Loader = () => (
  <div className="dc-loader" role="status" aria-live="polite">
    <div className="dc-spinner" />
    <span className="dc-loader-text">Loading analytics...</span>
  </div>
);

const COMPONENT_CSS = `
:root { --dc-bg: #fef7f0; --dc-bg-mid: #f0f9ff; --dc-bg-end: #ecfeff; --dc-surface: #ffffff; --dc-surface-alt: #f8fafc; --dc-border: #e2e8f0; --dc-border-strong: #cbd5e1; --dc-text: #111827; --dc-text-dim: #64748b; --dc-primary: #ea580c; --dc-primary-accent: #0891b2; --dc-radius-sm: 4px; --dc-radius: 10px; --dc-radius-lg: 18px; --dc-focus: 2px solid #0891b2; --dc-font-stack: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif; --dc-max:1280px; }
.dc-container { font-family: var(--dc-font-stack); -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; background: linear-gradient(135deg,var(--dc-bg) 0%,var(--dc-bg-mid) 50%,var(--dc-bg-end) 100%); min-height: 100vh; padding: 0; color: var(--dc-text); box-sizing: border-box; display:flex; flex-direction:column; overflow-x:hidden; }
.dc-header { position: sticky; top: 0; z-index: 40; background: rgba(255,255,255,0.95); backdrop-filter: blur(20px); border-bottom: 2px solid var(--dc-primary); box-shadow: 0 4px 20px 0 rgba(234,88,12,0.2); }
.dc-header-content { width:100%; max-width: var(--dc-max); margin: 0 auto; display: flex; align-items: center; justify-content: space-between; padding: .65rem 1rem; gap: 1rem; box-sizing:border-box; position:relative; }
.dc-logo-section { display: flex; align-items: center; gap: .4rem; }
.dc-logo { height: 42px; width: auto; object-fit: contain; }
.dc-brand-text { display:none; }
.dc-page-title { font-size: 1.4rem; font-weight: 700; margin: 0; color: var(--dc-primary); text-align: center; flex: 0; position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); padding:0 .5rem; line-height:1.1; }
.dc-back-btn { background: var(--dc-primary); color: #fff; border: none; padding: .55rem .9rem; border-radius: .65rem; cursor: pointer; font-weight: 600; font-size: .8rem; letter-spacing: .5px; box-shadow: 0 2px 6px -1px rgba(234,88,12,0.5); transition: background .25s, transform .25s, box-shadow .25s; }
.dc-back-btn:hover { background: #c2410c; transform: translateY(-2px); box-shadow: 0 6px 14px -4px rgba(234,88,12,0.45); }
.dc-back-btn:active { transform: translateY(0); }
.dc-filters { display: grid; grid-template-columns: repeat(auto-fit,minmax(170px,1fr)); gap: 1rem; background: var(--dc-surface); padding: 1rem 1rem; border-radius: var(--dc-radius-lg); box-shadow: 0 4px 10px -4px rgba(0,0,0,0.1),0 0 0 1px rgba(0,0,0,0.05); margin: 1.1rem auto 1.25rem; width:100%; max-width: var(--dc-max); box-sizing:border-box; }
.dc-filter-group { display: flex; flex-direction: column; gap: .35rem; }
.dc-filter-label { font-size: .72rem; font-weight: 600; letter-spacing: .2px; color: var(--dc-text-dim); }
.dc-preset-row { display: flex; flex-wrap: wrap; gap: .4rem; }
.dc-chip { border: 1px solid var(--dc-border); background: var(--dc-surface-alt); padding: .38rem .6rem; font-size: .7rem; border-radius: 999px; cursor: pointer; color: var(--dc-text-dim); font-weight: 600; letter-spacing: .2px; transition: background .25s, color .25s, border-color .25s; }
.dc-chip.active, .dc-chip:hover { background: var(--dc-primary); color: #fff; border-color: var(--dc-primary); }
.dc-date-input, .dc-select, .dc-threshold-input { background: var(--dc-surface-alt); border: 1px solid var(--dc-border); padding: .55rem .6rem; border-radius: var(--dc-radius-sm); font-size: .8rem; color: var(--dc-text); outline: none; transition: border-color .25s, background .25s; }
.dc-date-input:focus, .dc-select:focus, .dc-threshold-input:focus { border-color: var(--dc-primary); box-shadow: 0 0 0 2px rgba(234,88,12,0.25); }
.dc-toggle-row { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }
.dc-checkbox-label { display: inline-flex; align-items: center; gap: .45rem; font-size: .75rem; font-weight: 500; color: var(--dc-text-dim); cursor: pointer; }
.dc-checkbox-label input { transform: scale(1.1); accent-color: var(--dc-primary); cursor: pointer; }
.dc-metric-legend { display: flex; flex-wrap: wrap; gap: .6rem; margin: 0 auto 1rem; width:100%; max-width: var(--dc-max); padding:0 1rem; box-sizing:border-box; }
.dc-legend-item { display: inline-flex; align-items: center; gap: .5rem; padding: .5rem .75rem; background: var(--dc-surface); border: 1px solid var(--dc-border); border-radius: var(--dc-radius); cursor: pointer; font-size: .75rem; font-weight: 600; color: var(--dc-text-dim); position: relative; transition: box-shadow .25s, border-color .25s, background .25s; }
.dc-legend-item.visible { color: var(--dc-text); border-color: var(--dc-primary); box-shadow: 0 0 0 1px var(--dc-primary), 0 2px 6px -1px rgba(0,0,0,0.15); }
.dc-legend-item.dimmed { opacity: .55; }
.dc-legend-item:focus-visible { outline: var(--dc-focus); outline-offset: 2px; }
.dc-legend-item:hover { background: #fff; }
.dc-legend-dot { width: 14px; height: 14px; border-radius: 4px; background: var(--metric-color); box-shadow: 0 0 0 1px rgba(0,0,0,0.25) inset; }
.dc-threshold-panel { display: flex; flex-wrap: wrap; gap: .9rem; background: var(--dc-surface); padding: .75rem .9rem; border-radius: var(--dc-radius-lg); box-shadow: 0 3px 8px -3px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05); margin: 0 auto 1.25rem; width:100%; max-width: var(--dc-max); box-sizing:border-box; }
.dc-threshold-item { display: flex; flex-direction: column; gap: .25rem; width: auto; flex:1 1 110px; min-width:95px; }
.dc-threshold-label { font-size: .65rem; font-weight: 600; letter-spacing: .5px; text-transform: uppercase; color: var(--dc-text-dim); }
.dc-charts-wrapper { display: flex; flex-direction: column; gap: 1.25rem; margin: 0 auto 1.5rem; width:100%; max-width: var(--dc-max); padding: 0 1rem; box-sizing: border-box; }
.dc-chart-card { background: var(--dc-surface); border-radius: var(--dc-radius-lg); padding: .85rem 1rem .6rem; box-shadow: 0 2px 6px -1px rgba(0,0,0,0.12), 0 4px 16px -2px rgba(0,0,0,0.06); position: relative; overflow-x: auto; border: 1px solid #f1f5f9; }
.dc-multi-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: .9rem; width:100%; }
.dc-multi-grid.large { grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); }
.dc-mini-card { background:#fff; border:1px solid var(--dc-border); border-radius:12px; padding:.5rem .6rem .4rem; display:flex; flex-direction:column; box-shadow:0 2px 4px -2px rgba(0,0,0,0.15); }
.dc-mini-head { display:flex; align-items:center; gap:.4rem; margin-bottom:.25rem; }
.dc-mini-dot { width:14px; height:14px; border-radius:4px; box-shadow:0 0 0 1px rgba(0,0,0,0.25) inset; }
.dc-mini-title { font-size:.7rem; font-weight:600; color:#334155; flex:1; }
.dc-mini-hide { background:transparent; border:none; font-size:.7rem; cursor:pointer; color:#64748b; padding:2px 4px; border-radius:4px; }
.dc-mini-hide:hover { background:#f1f5f9; color:#0f172a; }
.dc-mini-body { width:100%; overflow:hidden; }
.dc-mini-chart { width:100%; height:auto; font-family:inherit; }
.dc-overlay { position:fixed; inset:0; background:rgba(15,23,42,0.55); backdrop-filter:blur(3px); display:flex; align-items:center; justify-content:center; padding:2rem; z-index:999; }
.dc-overlay-inner { background:#fff; border-radius:18px; width: min(1180px, 96vw); max-height:92vh; display:flex; flex-direction:column; box-shadow:0 8px 40px -6px rgba(0,0,0,0.35), 0 2px 8px -2px rgba(0,0,0,0.25); animation:dcPop .25s ease; }
.dc-overlay-head { display:flex; align-items:center; justify-content:space-between; padding:1rem 1.25rem .75rem; border-bottom:1px solid #e2e8f0; }
.dc-overlay-title { font-size:1rem; font-weight:600; color:#0f172a; margin:0; }
.dc-overlay-chart-wrap { position:relative; padding:.75rem 1.25rem 1.1rem; width:100%; }
.dc-close { border:none; background:#f1f5f9; padding:.4rem .65rem; border-radius:8px; cursor:pointer; font-size:.75rem; color:#334155; font-weight:600; }
.dc-close:hover { background:#e2e8f0; }
.dc-expanded-chart { font-family:inherit; width:100%; height:auto; }
.dc-exp-tooltip { position:absolute; pointer-events:none; background:#0f172a; color:#fff; font-size:.65rem; line-height:1.15; padding:.35rem .5rem .4rem; border-radius:6px; box-shadow:0 4px 14px -4px rgba(0,0,0,0.45); transform:translate(-50%, -100%); white-space:nowrap; }
@keyframes dcPop { 0% { transform:scale(.94); opacity:0; } 100% { transform:scale(1); opacity:1; } }
.dc-chart-card-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: .75rem; padding-bottom: .5rem; border-bottom: 1px solid var(--dc-border); margin-bottom: .5rem; }
.dc-chart-title { font-size: .95rem; margin: 0; font-weight: 700; color: #0f172a; }
.dc-chart-subcontrols { display: flex; align-items: center; gap: .5rem; }
.dc-sub-label { font-size: .65rem; font-weight: 600; text-transform: uppercase; color: var(--dc-text-dim); letter-spacing: .5px; }
.dc-chart-body { width: 100%; min-height: 220px; }
.dc-chart-body-responsive{ width:100%; overflow-x:auto; -webkit-overflow-scrolling:touch; }
.dc-chart-body-responsive svg{ width:100%; min-width:0; height:auto; }
.dc-line-chart, .dc-bar-chart { font-family: inherit; }
.dc-axis-text { font-size: .6rem; fill: var(--dc-text-dim); font-weight: 500; letter-spacing: .3px; }
.dc-threshold-label { font-size: .55rem; font-weight: 600; background: #fff; padding: 2px 4px; border-radius: 4px; filter: drop-shadow(0 1px 2px rgba(0,0,0,0.25)); }
.dc-chart-empty { font-size: .75rem; color: var(--dc-text-dim); padding: 1rem 0; }
.dc-summary-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(180px,1fr)); gap: 1rem; margin: 0 auto 1.25rem; width:100%; max-width: var(--dc-max); padding: 0 1rem; box-sizing:border-box; }
.dc-summary-card { background: linear-gradient(175deg,#ffffff 0%,#f8fafc 85%); border: 1px solid var(--dc-border); border-radius: var(--dc-radius-lg); padding: .85rem .9rem; display: flex; flex-direction: column; gap: .65rem; position: relative; box-shadow: 0 2px 5px -2px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05); min-height: 160px; }
.dc-summary-header { display: flex; align-items: center; gap: .5rem; }
.dc-summary-color { width: 16px; height: 16px; border-radius: 5px; box-shadow: 0 0 0 1px rgba(0,0,0,0.3) inset; }
.dc-summary-title { font-size: .78rem; margin: 0; font-weight: 600; color: var(--dc-text-dim); letter-spacing:.2px; }
.dc-summary-stats { display: flex; flex-direction: column; gap: .4rem; font-size: .7rem; }
.dc-stat-line { display: flex; align-items: center; justify-content: space-between; background: #fff; padding: .4rem .55rem; border-radius: var(--dc-radius-sm); border: 1px solid var(--dc-border); font-weight: 600; letter-spacing: .3px; }
.dc-summary-foot { display: flex; flex-wrap: wrap; gap: .4rem; margin-top: auto; }
.dc-foot-tag { background: var(--dc-surface-alt); border: 1px solid var(--dc-border); font-size: .55rem; font-weight: 600; padding: .28rem .45rem; border-radius: 999px; letter-spacing: .15px; color: var(--dc-text-dim); }
.dc-peak-panel { background: var(--dc-surface); border-radius: var(--dc-radius-lg); padding: .9rem 1rem 1.15rem; box-shadow: 0 2px 6px -1px rgba(0,0,0,0.12), 0 4px 14px -4px rgba(0,0,0,0.06); margin: 0 auto 1.25rem; width:100%; max-width: var(--dc-max); border: 1px solid #f1f5f9; box-sizing:border-box; }
.dc-peak-title { font-size: .85rem; font-weight: 600; letter-spacing: .25px; color: var(--dc-text-dim); margin: 0 0 .6rem; }
.dc-peak-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: .55rem; font-size: .7rem; }
.dc-peak-item { display: flex; justify-content: space-between; background: var(--dc-surface-alt); border: 1px solid var(--dc-border); padding: .5rem .6rem; border-radius: var(--dc-radius-sm); font-weight: 600; letter-spacing: .4px; }
.dc-empty { color: var(--dc-text-dim); font-style: italic; }
.dc-peak-time { color: var(--dc-text-dim); }
.dc-peak-value { color: var(--dc-text); font-weight: 700; }
.dc-export-panel { display: flex; flex-wrap: wrap; gap: .75rem 1rem; align-items: center; background: var(--dc-surface); padding: .8rem 1rem .75rem; border-radius: var(--dc-radius-lg); box-shadow: 0 2px 6px -1px rgba(0,0,0,0.12), 0 4px 14px -4px rgba(0,0,0,0.06); margin: 0 auto .5rem; width:100%; max-width: var(--dc-max); border: 1px solid #f1f5f9; box-sizing:border-box; }
.dc-export-btn { background: var(--dc-primary); color: #fff; border: none; padding: .58rem .95rem; border-radius: var(--dc-radius); font-size: .7rem; letter-spacing: .2px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.25); transition: background .25s, transform .2s; }
.dc-export-btn:hover:not(:disabled) { background: #c2410c; transform: translateY(-1px); }
.dc-export-btn:disabled { opacity: .5; cursor: not-allowed; }
.dc-alert-legend { display: flex; flex-wrap: wrap; gap: .6rem; margin-left: auto; font-size: .65rem; }
.dc-alert-legend-item { display: inline-flex; align-items: center; gap: .35rem; font-weight: 600; color: var(--dc-text-dim); background: var(--dc-surface-alt); padding: .35rem .55rem; border-radius: 999px; border: 1px solid var(--dc-border); letter-spacing: .4px; }
.dc-alert-dot { width: 10px; height: 10px; border-radius: 50%; box-shadow: 0 0 0 1px rgba(0,0,0,0.25) inset; }
.dc-loader { display: flex; flex-direction: column; align-items: center; gap: .75rem; padding: 2.5rem 0; }
.dc-spinner { width: 34px; height: 34px; border-radius: 50%; border: 4px solid var(--dc-border); border-top-color: var(--dc-primary); animation: dc-spin 1s linear infinite; }
.dc-loader-text { font-size: .7rem; font-weight: 600; letter-spacing: .4px; color: var(--dc-text-dim); text-transform: uppercase; }
@keyframes dc-spin { to { transform: rotate(360deg); } }
.dc-footer { text-align: center; font-size: .65rem; color: #cbd5e1; letter-spacing: .5px; padding: 1rem 1.25rem 1.05rem; max-width: 100%; margin: 0; font-weight:500; background:#0f172a; border-top:1px solid #1e293b; display:flex; flex-direction:column; gap:.5rem; margin-top:auto; }
.dc-footer-help { font-size:.8rem; color:#f1f5f9; }
.dc-footer-link { color:#ea580c; font-weight:600; text-decoration:none; }
.dc-footer-link:hover { text-decoration:underline; }
.dc-footer-copy { font-size:.7rem; color:#cbd5e1; }
@media (max-width: 860px){
  .dc-chart-body{padding-top:.5rem;}
  .dc-header-content{display:flex; flex-direction:row; align-items:center; gap:.55rem; padding:.5rem .6rem;}
  .dc-logo{height:28px;}
  .dc-page-title{position:static; transform:none; font-size:1rem; line-height:1.15; text-align:left; margin:0 .5rem 0 0; font-weight:700; color:var(--dc-primary);}
  .dc-back-btn{align-self:flex-end; order:2;}
}
@media (min-width: 1080px) { .dc-charts-wrapper { flex-direction: column; } }
@media (max-width: 840px) { .dc-filters { grid-template-columns: repeat(auto-fit,minmax(150px,1fr)); } .dc-summary-grid { grid-template-columns: repeat(auto-fit,minmax(150px,1fr)); } .dc-chart-card { padding: .65rem .65rem .85rem; } .dc-back-btn{font-size:.7rem; padding:.55rem .8rem;} }
/* Ultra-small / phone optimizations */
@media (max-width: 560px){
  /* Compact mobile header layout */
  .dc-header-content{display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:.55rem; padding:.5rem .6rem;}
  .dc-logo{height:28px;}
  .dc-page-title{grid-column:2; justify-self:center; position:static; transform:none; font-size:1rem; line-height:1.15; text-align:center; margin:0; font-weight:700; color:var(--dc-primary);}
  .dc-back-btn{background:transparent; color:var(--dc-primary); box-shadow:none; font-size:.7rem; padding:.35rem .5rem; margin:0; border:none; letter-spacing:.3px; font-weight:600;}
  .dc-back-btn:hover{background:transparent; text-decoration:underline; transform:none; box-shadow:none;}
  .dc-back-btn:active{transform:none;}
  .dc-filters{padding:.7rem .75rem; gap:.7rem;}
  .dc-threshold-panel{padding:.6rem .65rem; gap:.65rem;}
  .dc-threshold-item{flex:1 1 45%; min-width:120px;}
  .dc-threshold-input{padding:.45rem .5rem; font-size:.7rem;}
  .dc-metric-legend{gap:.45rem; padding:0 .6rem;}
  .dc-legend-item{padding:.45rem .6rem; font-size:.65rem;}
  .dc-export-panel{padding:.65rem .7rem .6rem; gap:.6rem .7rem;}
  .dc-summary-grid{padding:0 .6rem; gap:.65rem; grid-template-columns: repeat(auto-fit,minmax(150px,1fr));}
  .dc-charts-wrapper{padding:0 .6rem; gap:.85rem;}
  .dc-chart-card{padding:.55rem .55rem .4rem;}
  .dc-chart-title{font-size:.83rem;}
  .dc-axis-text{font-size:.5rem;}
  .dc-peak-panel{padding:.7rem .7rem .85rem; margin-bottom:1rem;}
  .dc-peak-title{font-size:.75rem;}
  .dc-foot-tag{font-size:.5rem;}
  .dc-export-btn{font-size:.6rem; padding:.5rem .7rem;}
  .dc-footer{padding:.85rem .75rem 1rem; font-size:.6rem;}
  .dc-footer-help{font-size:.7rem;}
  .dc-footer-copy{font-size:.6rem;}
  .dc-filters{grid-template-columns:repeat(2,minmax(0,1fr));}
  .dc-threshold-item{width:48%;}
}
@media (max-width: 420px){
  .dc-filters{grid-template-columns:1fr;}
  .dc-threshold-item{width:100%;}
  .dc-page-title{font-size:1rem;}
}
@media (prefers-reduced-motion: reduce) { .dc-back-btn, .dc-export-btn, .dc-chip { transition: none; } .dc-spinner { animation: none; } }
`;

export default DetailedCharts;
