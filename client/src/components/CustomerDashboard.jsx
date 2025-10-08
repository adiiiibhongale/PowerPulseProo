import React, { useState, useEffect, useRef } from 'react';
import { subscribeReadings, subscribeEvents, readingToUsage } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/Logo.jpg';

// Icons
const VoltageIcon = () => (
  <svg style={{ width: '24px', height: '24px', color: '#ea580c' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
);
const CurrentIcon = () => (
  <svg style={{ width: '24px', height: '24px', color: '#0891b2' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
);
const PowerIcon = () => (
  <svg style={{ width: '24px', height: '24px', color: '#ea580c' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
);
const EnergyIcon = () => (
  <svg style={{ width: '24px', height: '24px', color: '#0891b2' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
);
const FrequencyIcon = () => (
  <svg style={{ width: '24px', height: '24px', color: '#ea580c' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
);
const PowerFactorIcon = () => (
  <svg style={{ width: '24px', height: '24px', color: '#0891b2' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
);
const AlertIcon = () => (
  <svg style={{ width: '20px', height: '20px', color: '#dc2626' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.764 0L3.05 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
);
const WarningIcon = () => (
  <svg style={{ width: '20px', height: '20px', color: '#f59e0b' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const InfoIcon = () => (
  <svg style={{ width: '20px', height: '20px', color: '#0891b2' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const DownloadIcon = () => (
  <svg style={{ width: '20px', height: '20px', color: '#ffffff' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
);
const UserIcon = () => (
  <svg style={{ width: '24px', height: '24px', color: '#ea580c' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);
const StatusIcon = ({ online }) => (
  online ? (
    <svg style={{ width: '12px', height: '12px', color: '#10b981' }} fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" /></svg>
  ) : (
    <svg style={{ width: '12px', height: '12px', color: '#ef4444' }} fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" /></svg>
  )
);

// Responsive styles function
const getResponsiveStyles = (screenWidth, isTouchDevice = false) => {
  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1024;
  return {
    container: {
      minHeight: '100vh',
      background: `linear-gradient(135deg, #fef7f0 0%, #f0f9ff 50%, #ecfeff 100%)`,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    header: {
      background: 'rgba(255, 255, 255, 0.95)',
      boxShadow: '0 4px 20px 0 rgba(234, 88, 12, 0.2)',
      borderBottom: '2px solid #ea580c',
      backdropFilter: 'blur(20px)',
      padding: isMobile ? '0.75rem 0' : '1rem 0',
    },
    headerContent: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: isMobile ? '0 1rem' : '0 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '0.75rem' : '0',
    },
    logoSection: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '0.5rem' : '1rem',
    },
    logo: {
      height: isMobile ? '36px' : '48px',
      width: 'auto',
      objectFit: 'contain',
    },
    brandText: {
      fontSize: isMobile ? '1.25rem' : '1.5rem',
      fontWeight: 'bold',
      color: '#111827',
    },
    pageTitle: {
      fontSize: isMobile ? '1.5rem' : '1.8rem',
      fontWeight: 'bold',
      color: '#ea580c',
      margin: 0,
      textAlign: isMobile ? 'center' : 'left',
    },
    userProfile: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '0.5rem' : '0.75rem',
      padding: isMobile ? '0.5rem 0.75rem' : '0.5rem 1rem',
      borderRadius: '0.75rem',
      border: '1px solid #f1f5f9',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    main: {
      maxWidth: isMobile ? 'none' : '1280px',
      margin: '0 auto',
      padding: isMobile ? '1rem' : isTablet ? '1.5rem' : '2rem',
    },
    section: {
      marginBottom: isMobile ? '1.5rem' : '2rem',
    },
    sectionTitle: {
      fontSize: isMobile ? '1.25rem' : '1.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: isMobile ? '0.75rem' : '1rem',
    },
    connectionStatus: {
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: isMobile ? '0.75rem' : '1rem',
      marginBottom: isMobile ? '1.5rem' : '2rem',
      padding: isMobile ? '0.75rem' : '1rem',
      backgroundColor: '#ffffff',
      borderRadius: '0.75rem',
      border: '1px solid #f1f5f9',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      flexDirection: isMobile ? 'column' : 'row',
    },
    statusBadge: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: isMobile ? '0.375rem 0.75rem' : '0.5rem 1rem',
      borderRadius: '9999px',
      fontSize: isMobile ? '0.8rem' : '0.875rem',
      fontWeight: '600',
    },
    kpiGrid: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: isMobile ? '1rem' : '1.5rem',
      marginBottom: isMobile ? '1.5rem' : '2rem',
    },
    kpiCard: {
      backgroundColor: '#ffffff',
      padding: isMobile ? '1rem' : '1.5rem',
      borderRadius: '1rem',
      border: '1px solid #f1f5f9',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.3s ease',
    },
    kpiHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: isMobile ? '0.75rem' : '1rem',
    },
    kpiLabel: {
      display: 'flex',
      alignItems: 'center',
      gap: isMobile ? '0.375rem' : '0.5rem',
      fontSize: isMobile ? '0.8rem' : '0.875rem',
      fontWeight: '600',
      color: '#64748b',
    },
    kpiValue: {
      fontSize: isMobile ? '2rem' : isTablet ? '2.25rem' : '2.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: isMobile ? '0.375rem' : '0.5rem',
    },
    kpiUnit: {
      fontSize: isMobile ? '0.875rem' : '1rem',
      color: '#64748b',
      marginLeft: '0.25rem',
    },
    kpiRange: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: isMobile ? '0.7rem' : '0.75rem',
      color: '#64748b',
    },
    alertsSection: {
      backgroundColor: '#ffffff',
      padding: isMobile ? '1rem' : '1.5rem',
      borderRadius: '1rem',
      border: '1px solid #f1f5f9',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      marginBottom: isMobile ? '1.5rem' : '2rem',
    },
    alertItem: {
      display: 'flex',
      alignItems: isMobile ? 'flex-start' : 'center',
      gap: isMobile ? '0.5rem' : '0.75rem',
      padding: isMobile ? '0.625rem' : '0.75rem',
      borderRadius: '0.5rem',
      border: '1px solid #e5e7eb',
      flexDirection: isMobile ? 'column' : 'row',
    },
    alertText: {
      fontSize: isMobile ? '0.8rem' : '0.875rem',
      color: '#374151',
    },
    alertTime: {
      fontSize: isMobile ? '0.7rem' : '0.75rem',
      color: '#9ca3af',
      marginLeft: isMobile ? '0' : 'auto',
    },
    navigationTabs: {
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: isMobile ? '0.75rem' : '1rem',
      marginBottom: isMobile ? '1.5rem' : '2rem',
    },
    navButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: isMobile ? '0.875rem' : '1rem',
      backgroundColor: '#ffffff',
      color: '#111827',
      borderRadius: '0.75rem',
      border: '1px solid #f1f5f9',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      fontSize: isMobile ? '0.9rem' : '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minHeight: isMobile && isTouchDevice ? '48px' : 'auto',
    },
    downloadSection: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '0.75rem' : '1rem',
    },
    downloadButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: isMobile ? '0.75rem 1.25rem' : '0.75rem 1.5rem',
      backgroundColor: '#ea580c',
      color: '#ffffff',
      borderRadius: '0.75rem',
      border: 'none',
      fontSize: isMobile ? '0.8rem' : '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minHeight: isMobile && isTouchDevice ? '48px' : 'auto',
    },
    footer: {
      backgroundColor: '#0f172a',
      color: '#ffffff',
      padding: isMobile ? '1.5rem 1rem' : '2rem',
      textAlign: 'center',
    },
    sparkline: {
      width: '100%',
      height: isMobile ? '30px' : '40px',
      marginTop: '0.5rem',
    },
  };
};

// Simple Sparkline Component
const Sparkline = ({ data, color = '#ea580c' }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '40px', marginTop: '0.5rem' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" style={{ vectorEffect: 'non-scaling-stroke' }} />
    </svg>
  );
};

const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isTouchDevice: typeof window !== 'undefined' ? 'ontouchstart' in window : false,
  });
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isTouchDevice: 'ontouchstart' in window,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return screenSize;
};

const CustomerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const buildZeroMetrics = (historyLen = 10) => ({
    voltage: { current: 0, min: 0, max: 0, status: 'offline', history: Array(historyLen).fill(0) },
    current: { current: 0, min: 0, max: 0, status: 'offline', history: Array(historyLen).fill(0) },
    power: { current: 0, min: 0, max: 0, status: 'offline', history: Array(historyLen).fill(0) },
    energy: { current: 0, min: 0, max: 0, status: 'offline', history: Array(historyLen).fill(0) },
    powerFactor: { current: 0, min: 0, max: 0, status: 'offline', history: Array(historyLen).fill(0) },
    frequency: { current: 0, min: 0, max: 0, status: 'offline', history: Array(historyLen).fill(0) }
  });
  const [meterData, setMeterData] = useState(buildZeroMetrics());
  const [alerts, setAlerts] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  // Start as offline; switch to online only after first realtime reading/event arrives
  const [deviceOnline, setDeviceOnline] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const lastRealtimeRef = useRef(null); // timestamp (ms) of last realtime reading
  const lastDataTimestampRef = useRef(null); // latest reading's embedded timestamp
  const lastDataArrivalRef = useRef(null);   // wall-clock when that reading first arrived
  const lastAnyArrivalRef = useRef(null);    // wall-clock of any readings callback (heartbeat)
  const initialReadingTsRef = useRef(null);  // reading timestamp present at mount (if any)
  const hasFreshAfterMountRef = useRef(false); // set true only when a new (advanced) reading arrives after mount
  const callbacksCountRef = useRef(0); // number of reading callbacks (heartbeats)
  const startTimeRef = useRef(Date.now());
  const navigate = useNavigate();
  const screenSize = useScreenSize();
  const isMobile = screenSize.width <= 768;
  const isTablet = screenSize.width > 768 && screenSize.width <= 1024;
  // Persistent ref to hold merged realtime + sample data; must be declared at top level (not inside useEffect)
  const stateRef = useRef(null);
  const realtimeReceivedRef = useRef({}); // tracks which keys have received realtime values
  const [usingSampleOnly, setUsingSampleOnly] = useState(true); // retained if needed for future UI, not used now
  const firstReadingReceivedRef = useRef(false); // prevents premature offline display after refresh
  const autoRefreshTimerRef = useRef(null); // timer for 10s auto refresh after data comes or stops
  // Consumer identity (from login stored in localStorage by ConsumerLogin)
  const [consumerLabel, setConsumerLabel] = useState('Consumer');
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        // Common possible keys: name, fullName, consumerName, consumerNumber, consumerId, id
        const label = parsed?.name || parsed?.fullName || parsed?.consumerName || parsed?.consumerNumber || parsed?.consumerId || parsed?.id;
        if (label) {
          // Shorten very long labels for UI neatness
          const trimmed = String(label).trim();
          setConsumerLabel(trimmed.length > 18 ? trimmed.slice(0,15) + '…' : trimmed);
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored user info', e);
    }
  }, []);
  // Get responsive styles
  const responsiveStyles = getResponsiveStyles(screenSize.width, screenSize.isTouchDevice);
  // Shorten label further for narrow mobile widths
  const displayConsumerLabel = React.useMemo(() => {
    if (!consumerLabel) return 'Consumer';
    if (isMobile) {
      const clean = consumerLabel.trim();
      return clean.length > 12 ? clean.slice(0, 9) + '…' : clean;
    }
    return consumerLabel;
  }, [consumerLabel, isMobile]);
  useEffect(() => {
    let unsubscribers = [];
    // Initialize accumulator (no sample data)
    stateRef.current = { currentUsage: null, powerQuality: null, meterReadings: {}, alerts: {} };

    function scheduleAutoRefresh({ reason, delayMs }) {
      if (autoRefreshTimerRef.current) clearTimeout(autoRefreshTimerRef.current);
      if (typeof window === 'undefined') return;
      autoRefreshTimerRef.current = setTimeout(() => {
        try {
          console.info('[AutoRefresh]', 'reloading due to', reason);
          window.location.reload();
        } catch (_) {}
      }, delayMs);
    }

    function recompute() {
      const readingsObj = stateRef.current.meterReadings || {};
      const allReadingsSorted = Object.values(readingsObj).sort((a,b)=>a.timestamp-b.timestamp);
      const THRESHOLDS = {
        FRESH_WINDOW_MS: 60000,          // reading timestamp not older than 60s
        ARRIVAL_WINDOW_MS: 60000,        // heartbeat within last 60s
        MAX_STATIC_AGE_MS: 10 * 60 * 1000, // timestamp unchanged for >10min => offline
        FUTURE_TOLERANCE_MS: 5000,       // allow 5s clock skew forward
        MIN_HEARTBEATS_FOR_ONLINE: 2     // allow online after 2 callbacks even if timestamp unchanged
      };
  // NOTE: We no longer auto-accept an old initial reading; must receive a NEW timestamp
      const now = Date.now();

      if (!allReadingsSorted.length) {
        // During initial mount grace period, don't flip UI to offline yet; keep loading spinner
        const MOUNT_GRACE_MS = 8000; // 8s grace
        const sinceMount = now - startTimeRef.current;
        if (sinceMount < MOUNT_GRACE_MS && !firstReadingReceivedRef.current) {
          // schedule a slower refresh (30s) only if still nothing
          scheduleAutoRefresh({ reason: 'no-initial-data', delayMs: 30000 });
          // Just wait for first data silently
          return;
        }
        if (firstReadingReceivedRef.current) {
          // We had data before, now none -> treat as offline
          setDeviceOnline(false);
          setMeterData(buildZeroMetrics());
          setAlerts([]);
          setLastUpdate(new Date());
          setLoading(false);
          scheduleAutoRefresh({ reason: 'lost-data', delayMs: 15000 });
        } else {
          // Still no data after grace, show offline state
          setDeviceOnline(false);
          setMeterData(buildZeroMetrics());
          setAlerts([]);
          setLastUpdate(new Date());
          setLoading(false);
          scheduleAutoRefresh({ reason: 'no-data-post-grace', delayMs: 15000 });
        }
        return;
      }

      const latestReading = allReadingsSorted[allReadingsSorted.length - 1];
      let latestTs = latestReading.timestamp;
      // Normalize seconds-based timestamps to ms if needed
      if (latestTs < 1e12) {
        latestTs = latestTs * 1000; // convert seconds to ms
      }
      const readingAge = now - latestTs;
      const futureSkew = latestTs - now;
      // Track first arrival of a new timestamp
      if (lastDataTimestampRef.current !== latestTs) {
        lastDataTimestampRef.current = latestTs;
        lastDataArrivalRef.current = now;
      }
      // Record initial reading timestamp once
      if (initialReadingTsRef.current === null) {
        initialReadingTsRef.current = latestTs;
      }

      // Determine if this qualifies as a fresh reading after mount:
      // Case A: timestamp advanced beyond the initial one
      // Case B: initial reading is itself very recent (age <= INITIAL_ACCEPTABLE_AGE_MS)
      if (!hasFreshAfterMountRef.current && latestTs !== initialReadingTsRef.current) {
        hasFreshAfterMountRef.current = true; // first post-mount new timestamp
      }
      const staticAge = lastDataArrivalRef.current ? now - lastDataArrivalRef.current : Infinity;
      const arrivalHeartbeatAge = lastAnyArrivalRef.current ? now - lastAnyArrivalRef.current : Infinity;
      // Online conditions:
      // 1. We have at least one reading
      // 2. Either timestamp age acceptable OR we recently received a heartbeat (callback fired)
      // 3. Timestamp not absurdly in future
      // 4. Timestamp not static for too long
      const timestampReasonable = readingAge <= THRESHOLDS.FRESH_WINDOW_MS && futureSkew <= THRESHOLDS.FUTURE_TOLERANCE_MS;
      const recentHeartbeat = arrivalHeartbeatAge <= THRESHOLDS.ARRIVAL_WINDOW_MS;
      const staticTooLong = staticAge > THRESHOLDS.MAX_STATIC_AGE_MS;
      const heartbeatsCount = callbacksCountRef.current;
      const heartbeatSufficient = heartbeatsCount >= THRESHOLDS.MIN_HEARTBEATS_FOR_ONLINE;
      // Extended acceptable age when we are at least receiving heartbeats (helps if device repeats last timestamp)
      const extendedAcceptableAge = THRESHOLDS.FRESH_WINDOW_MS * 5; // e.g., up to 5 minutes
      const shouldBeOnline = !staticTooLong && recentHeartbeat && (
        timestampReasonable ||
        (heartbeatSufficient && readingAge <= extendedAcceptableAge)
      );

      // Debug logging (can be disabled by commenting)
      if (process.env.NODE_ENV !== 'production') {
        console.info('[DeviceStatusDebug]', {
          latestTs,
          readingAge,
            futureSkew,
          timestampReasonable,
          recentHeartbeat,
          staticTooLong,
          hasFreshAfterMount: hasFreshAfterMountRef.current,
          shouldBeOnline,
          arrivalHeartbeatAge,
          staticAge,
          heartbeatsCount,
          heartbeatSufficient,
          extendedAcceptableAge
        });
      }

      if (!shouldBeOnline) {
        if (deviceOnline) setDeviceOnline(false);
        setMeterData(buildZeroMetrics());
        setLastUpdate(new Date());
        setLoading(false);
        // schedule refresh ONLY when offline (avoid loop while online)
        scheduleAutoRefresh({ reason: 'offline-retry', delayMs: 20000 });
        return;
      } else if (!deviceOnline) {
        setDeviceOnline(true);
        firstReadingReceivedRef.current = true; // mark that we have displayed at least one live reading
        // do NOT auto-refresh just because we became online
      }
      const currentUsage = stateRef.current.currentUsage; // set by subscription
      const powerQuality = stateRef.current.powerQuality;
      if (!currentUsage || !powerQuality) {
        // Shouldn't happen if subscription populated
        setLoading(false);
        return;
      }
      const readings = allReadingsSorted.slice(-10);
      const alertsObj = stateRef.current.alerts || {};
      const alertsArray = Object.values(alertsObj).sort((a,b)=>b.timestamp-a.timestamp);

      // --- Compute observed statistics from full historical set (not just window) ---
      const takeNumeric = (arr, key) => arr.map(r => r[key]).filter(v => v !== undefined && v !== null && !Number.isNaN(v));
  const observedVoltage = takeNumeric(allReadingsSorted, 'voltage');
      const observedCurrent = takeNumeric(allReadingsSorted, 'current');
      const observedPower = takeNumeric(allReadingsSorted, 'power');
      const observedPF = takeNumeric(allReadingsSorted, 'powerFactor');
      const observedFreq = takeNumeric(allReadingsSorted, 'frequency');
      const observedEnergy = takeNumeric(allReadingsSorted, 'energyToday');

      const minOr = (list, fallback) => list.length ? Math.min(...list) : fallback;
      const maxOr = (list, fallback) => list.length ? Math.max(...list) : fallback;

      // Daily energy delta (assumes energyToday is cumulative for the day)
      let energyDelta = currentUsage.energyToday;
      if (allReadingsSorted.length) {
        const latestTs = allReadingsSorted[allReadingsSorted.length - 1].timestamp;
        const dayStart = new Date(latestTs);
        dayStart.setHours(0,0,0,0);
        const baseline = allReadingsSorted.find(r => r.timestamp >= dayStart.getTime());
        if (baseline && baseline.energyToday !== undefined) {
          const latestEnergy = allReadingsSorted[allReadingsSorted.length - 1].energyToday ?? currentUsage.energyToday;
          if (latestEnergy !== undefined && !Number.isNaN(latestEnergy)) {
            energyDelta = Math.max(0, (latestEnergy - baseline.energyToday));
          }
        }
      }

      // Observed ranges
  const voltageMin = minOr(observedVoltage, currentUsage.voltage - 2);
      const voltageMax = maxOr(observedVoltage, currentUsage.voltage + 2);
      const currentMin = minOr(observedCurrent, Math.max(0, currentUsage.current - 2));
      const currentMax = maxOr(observedCurrent, currentUsage.current + 3);
      const powerMin = minOr(observedPower, Math.max(0, currentUsage.power - 600));
      const powerMax = maxOr(observedPower, currentUsage.power + 800);
      const pfMin = minOr(observedPF, 0.8);
      const pfMax = maxOr(observedPF, 0.95);
      const freqMin = minOr(observedFreq, 49.8);
      const freqMax = maxOr(observedFreq, 50.3);
      const energyMin = observedEnergy.length ? Math.min(...observedEnergy) : 0;
      const energyMax = observedEnergy.length ? Math.max(...observedEnergy) : currentUsage.energyToday;

  // If device went offline after previously having realtime data, skip overwriting zeros.
  // Allow recompute while offline only if we have never received realtime (lastRealtimeRef null) so sample shows.
      // (No offline overwrite guard needed—freshness enforced earlier)
      setMeterData(prev => ({
        voltage: {
          current: currentUsage.voltage,
          min: Number(voltageMin.toFixed(2)),
          max: Number(voltageMax.toFixed(2)),
          status: powerQuality.status?.toLowerCase() || 'normal',
          history: readings.map(r => r.voltage || currentUsage.voltage)
        },
        current: {
          current: currentUsage.current,
          min: Number(currentMin.toFixed(2)),
          max: Number(currentMax.toFixed(2)),
          status: 'normal',
          history: readings.map(r => r.current || currentUsage.current)
        },
        power: {
          current: currentUsage.power,
          min: Math.max(0, Math.round(powerMin)),
          max: Math.round(powerMax),
          status: currentUsage.power > 3000 ? 'warning' : 'normal',
          history: readings.map(r => r.power || currentUsage.power)
        },
        energy: {
          // Use derived daily consumption delta
          current: Number(energyDelta.toFixed(3)),
          min: Number(energyMin.toFixed(3)),
          max: Number(energyMax.toFixed(3)),
          status: 'normal',
          history: readings.map(r => r.energyToday || currentUsage.energyToday)
        },
        powerFactor: {
          current: currentUsage.powerFactor,
          min: Number(pfMin.toFixed(3)),
          max: Number(pfMax.toFixed(3)),
          status: currentUsage.powerFactor < 0.9 ? 'warning' : 'normal',
          history: readings.map(r => r.powerFactor || currentUsage.powerFactor)
        },
        frequency: {
          current: currentUsage.frequency,
          min: Number(freqMin.toFixed(3)),
          max: Number(freqMax.toFixed(3)),
          status: 'normal',
          history: readings.map(r => r.frequency || currentUsage.frequency)
        }
      }));

      const format24 = (d) => {
        const date = new Date(d);
        const hh = String(date.getHours()).padStart(2,'0');
        const mm = String(date.getMinutes()).padStart(2,'0');
        const ss = String(date.getSeconds()).padStart(2,'0');
        return `${hh}:${mm}:${ss}`;
      };
      setAlerts(alertsArray.slice(0, 5).map(a => ({
        id: a.id || a.timestamp,
        type: a.severity || 'info',
        message: a.message,
        time: a.originalTime || format24(a.timestamp)
      })));
      setLastUpdate(new Date());
      setLoading(false);
    }

    // Initial recompute (no data yet -> offline zeros)
    recompute();

    // NEW: subscribe to hierarchical schema
    const uReadings = subscribeReadings((flatArray) => {
      callbacksCountRef.current += 1; // increment heartbeat count
      lastAnyArrivalRef.current = Date.now();
      // Cancel any pending offline retry refresh because data is flowing
      if (autoRefreshTimerRef.current) {
        clearTimeout(autoRefreshTimerRef.current);
        autoRefreshTimerRef.current = null;
      }
      if (!flatArray.length) { recompute(); return; }
      realtimeReceivedRef.current.currentUsage = true;
      realtimeReceivedRef.current.meterReadings = true;
      const latest = flatArray[flatArray.length - 1];
      const usage = readingToUsage(latest);
      const powerQuality = {
        voltage: usage.voltage,
        frequency: usage.frequency,
        powerFactor: usage.powerFactor,
        status: usage.powerFactor < 0.9 ? 'Fair' : 'Good'
      };
      const readingsKeyed = flatArray.reduce((acc, r) => {
        const u = readingToUsage(r);
        acc[r.timestamp] = {
          timestamp: r.timestamp,
          energyToday: u.energyToday,
          voltage: u.voltage,
          current: u.current,
          power: u.power,
          powerFactor: u.powerFactor,
          frequency: u.frequency
        };
        return acc;
      }, {});
      stateRef.current = { ...stateRef.current, currentUsage: usage, powerQuality, meterReadings: readingsKeyed };
      setUsingSampleOnly(false);
      lastRealtimeRef.current = latest.timestamp;
      recompute();
    }, { currentDateOnly: false, log: true });
    unsubscribers.push(uReadings);

    const uEvents = subscribeEvents((flatEvents) => {
      if (!flatEvents.length) return;
      const alertsObj = flatEvents.slice(0, 50).reduce((acc, ev) => {
        const raw = ev.raw || {};
        const msg = raw.Event || raw.event || 'Event';
        acc[ev.timestamp] = {
          id: ev.timestamp,
          type: 'event',
          severity: /metal/i.test(msg) ? 'warning' : 'info',
          message: msg,
          timestamp: ev.timestamp,
          originalTime: raw.Time || raw.time || null,
          acknowledged: false
        };
        return acc;
      }, {});
      stateRef.current = { ...stateRef.current, alerts: alertsObj };
      recompute(); // Do not mark device online from events alone
    }, { currentDateOnly: false, log: true });
    unsubscribers.push(uEvents);

    return () => {
      unsubscribers.forEach(fn => { try { fn(); } catch(_) {} });
      if (autoRefreshTimerRef.current) clearTimeout(autoRefreshTimerRef.current);
    };
  }, []);

  // Heartbeat watcher: mark offline if no realtime update in threshold (e.g., 30s)
  useEffect(() => {
    const OFFLINE_THRESHOLD_MS = 30000; // 30 seconds without new data
    const interval = setInterval(() => {
      const last = lastRealtimeRef.current; // may be null if never received
      const referenceTime = last || startTimeRef.current; // if never received, use start time
      const age = Date.now() - referenceTime;
      if (age > OFFLINE_THRESHOLD_MS && deviceOnline) {
        // Transition to offline
        setDeviceOnline(false);
        setMeterData(prev => {
          const zeroHistory = (len) => Array.from({ length: len }, () => 0);
          const templateHistoryLength = prev?.voltage?.history?.length || 10;
          const build = (p = {}) => ({
            current: 0,
            min: 0,
            max: 0,
            status: 'offline',
            history: zeroHistory(templateHistoryLength)
          });
          return {
            voltage: build(prev?.voltage),
            current: build(prev?.current),
            power: build(prev?.power),
            energy: { ...build(prev?.energy), history: zeroHistory(templateHistoryLength) },
            powerFactor: build(prev?.powerFactor),
            frequency: build(prev?.frequency)
          };
        });
      }
      // If offline but new realtime arrives, other effect will set deviceOnline true
    }, 5000);
    return () => clearInterval(interval);
  }, [deviceOnline]);
  const getStatusColor = (status) => {
    switch (status) {
      case 'normal': return { borderLeft: '4px solid #10b981' };
      case 'warning': return { borderLeft: '4px solid #f59e0b' };
      case 'critical': return { borderLeft: '4px solid #ef4444' };
      case 'offline': return { borderLeft: '4px solid #6b7280' };
      default: return { borderLeft: '4px solid #10b981' };
    }
  };
  const getAlertStyle = (type) => {
    switch (type) {
      case 'critical': return { backgroundColor: '#fef2f2', borderColor: '#fecaca' };
      case 'warning': return { backgroundColor: '#fffbeb', borderColor: '#fed7aa' };
      case 'info': return { backgroundColor: '#f0f9ff', borderColor: '#bae6fd' };
      default: return { backgroundColor: '#f0f9ff', borderColor: '#bae6fd' };
    }
  };
  const getAlertIcon = (type) => {
    switch (type) {
      case 'critical': return <AlertIcon />;
      case 'warning': return <WarningIcon />;
      case 'info': return <InfoIcon />;
      default: return <InfoIcon />;
    }
  };
  const handleDownload = (period) => {
    console.log(`Downloading ${period} days data...`);
  };
  const handleNavigation = (path) => {
    navigate(path);
  };
  if (loading) {
    return (
      <div style={responsiveStyles.container}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontSize: '1rem', color: '#64748b' }}>
          <svg style={{ animation: 'spin 1s linear infinite', height: '20px', width: '20px', marginRight: '0.5rem' }} viewBox="0 0 24 24">
            <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading dashboard data...
        </div>
      </div>
    );
  }
  return (
    <div style={responsiveStyles.container}>
      {/* Header */}
      <header style={responsiveStyles.header}>
        <div style={responsiveStyles.headerContent}>
          <div style={responsiveStyles.logoSection}>
            <img src={Logo} alt="VoltSenseX Logo" style={responsiveStyles.logo} />
          </div>
          <h1 style={responsiveStyles.pageTitle}>Dashboard</h1>
          {/* Live / Sample indicator removed per request */}
          <div 
            style={responsiveStyles.userProfile}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(234, 88, 12, 0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <UserIcon />
            <span style={{ fontSize: isMobile ? '0.7rem' : '0.875rem', fontWeight: '600', color: '#111827', maxWidth: isMobile ? '90px' : '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayConsumerLabel}</span>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main style={responsiveStyles.main}>
        {/* Connection Status */}
        <div style={responsiveStyles.connectionStatus}>
          <div style={{ ...responsiveStyles.statusBadge, ...(deviceOnline ? { backgroundColor: '#dcfce7', color: '#166534' } : { backgroundColor: '#fee2e2', color: '#991b1b' }) }}>
            <StatusIcon online={deviceOnline} />
            {deviceOnline ? 'Device Online' : 'Device Offline'}
          </div>
          <span style={{ fontSize: isMobile ? '0.8rem' : '0.875rem', color: '#64748b' }}>
            Last update: {lastUpdate.toLocaleTimeString()}
          </span>
        </div>
        {/* KPI Cards */}
        <section style={responsiveStyles.section}>
          <h2 style={responsiveStyles.sectionTitle}>Live Meter Readings</h2>
          <div style={responsiveStyles.kpiGrid}>
            {/* Voltage Card */}
            <div style={{ ...responsiveStyles.kpiCard, ...getStatusColor(deviceOnline ? meterData?.voltage?.status : 'offline') }}>
              <div style={responsiveStyles.kpiHeader}>
                <div style={responsiveStyles.kpiLabel}>
                  <VoltageIcon />
                  Voltage
                </div>
              </div>
              <div style={responsiveStyles.kpiValue}>
                {meterData?.voltage?.current?.toFixed(1)}
                <span style={responsiveStyles.kpiUnit}>V</span>
              </div>
              <div style={responsiveStyles.kpiRange}>
                <span>Min: {meterData?.voltage?.min}V</span>
                <span>Max: {meterData?.voltage?.max}V</span>
              </div>
              <Sparkline data={meterData?.voltage?.history} color="#ea580c" />
            </div>
            {/* Current Card */}
            <div style={{ ...responsiveStyles.kpiCard, ...getStatusColor(deviceOnline ? meterData?.current?.status : 'offline') }}>
              <div style={responsiveStyles.kpiHeader}>
                <div style={responsiveStyles.kpiLabel}>
                  <CurrentIcon />
                  Current
                </div>
              </div>
              <div style={responsiveStyles.kpiValue}>
                {meterData?.current?.current?.toFixed(1)}
                <span style={responsiveStyles.kpiUnit}>A</span>
              </div>
              <div style={responsiveStyles.kpiRange}>
                <span>Min: {meterData?.current?.min}A</span>
                <span>Max: {meterData?.current?.max}A</span>
              </div>
              <Sparkline data={meterData?.current?.history} color="#0891b2" />
            </div>
            {/* Power Card */}
            <div style={{ ...responsiveStyles.kpiCard, ...getStatusColor(deviceOnline ? meterData?.power?.status : 'offline') }}>
              <div style={responsiveStyles.kpiHeader}>
                <div style={responsiveStyles.kpiLabel}>
                  <PowerIcon />
                  Power
                </div>
              </div>
              <div style={responsiveStyles.kpiValue}>
                {meterData?.power?.current?.toLocaleString()}
                <span style={responsiveStyles.kpiUnit}>W</span>
              </div>
              <div style={responsiveStyles.kpiRange}>
                <span>Min: {meterData?.power?.min}W</span>
                <span>Max: {meterData?.power?.max}W</span>
              </div>
              <Sparkline data={meterData?.power?.history} color="#ea580c" />
            </div>
            {/* Energy Card */}
            <div style={{ ...responsiveStyles.kpiCard, ...getStatusColor(deviceOnline ? meterData?.energy?.status : 'offline') }}>
              <div style={responsiveStyles.kpiHeader}>
                <div style={responsiveStyles.kpiLabel}>
                  <EnergyIcon />
                  Energy Consumed
                </div>
              </div>
              <div style={responsiveStyles.kpiValue}>
                {meterData?.energy?.current?.toFixed(2)}
                <span style={responsiveStyles.kpiUnit}>kWh</span>
              </div>
              <div style={responsiveStyles.kpiRange}>
                <span>Today</span>
                <span>Monthly: {meterData?.energy?.max}kWh</span>
              </div>
              <Sparkline data={meterData?.energy?.history} color="#0891b2" />
            </div>
            {/* Power Factor Card */}
            <div style={{ ...responsiveStyles.kpiCard, ...getStatusColor(deviceOnline ? meterData?.powerFactor?.status : 'offline') }}>
              <div style={responsiveStyles.kpiHeader}>
                <div style={responsiveStyles.kpiLabel}>
                  <PowerFactorIcon />
                  Power Factor
                </div>
              </div>
              <div style={responsiveStyles.kpiValue}>
                {meterData?.powerFactor?.current?.toFixed(2)}
              </div>
              <div style={responsiveStyles.kpiRange}>
                <span>Min: {meterData?.powerFactor?.min}</span>
                <span>Max: {meterData?.powerFactor?.max}</span>
              </div>
              <Sparkline data={meterData?.powerFactor?.history} color="#0891b2" />
            </div>
            {/* Frequency Card */}
            <div style={{ ...responsiveStyles.kpiCard, ...getStatusColor(deviceOnline ? meterData?.frequency?.status : 'offline') }}>
              <div style={responsiveStyles.kpiHeader}>
                <div style={responsiveStyles.kpiLabel}>
                  <FrequencyIcon />
                  Frequency
                </div>
              </div>
              <div style={responsiveStyles.kpiValue}>
                {meterData?.frequency?.current?.toFixed(2)}
                <span style={responsiveStyles.kpiUnit}>Hz</span>
              </div>
              <div style={responsiveStyles.kpiRange}>
                <span>Min: {meterData?.frequency?.min}Hz</span>
                <span>Max: {meterData?.frequency?.max}Hz</span>
              </div>
              <Sparkline data={meterData?.frequency?.history} color="#ea580c" />
            </div>
          </div>
        </section>
        {/* Alerts Section */}
        <section style={responsiveStyles.section}>
          <h2 style={responsiveStyles.sectionTitle}>Alerts & Notifications</h2>
          <div style={responsiveStyles.alertsSection}>
            {alerts.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', margin: 0, fontSize: isMobile ? '0.875rem' : '1rem' }}>No active alerts</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {alerts.map(alert => (
                  <div key={alert.id} style={{ ...responsiveStyles.alertItem, ...getAlertStyle(alert.type) }}>
                    {getAlertIcon(alert.type)}
                    <span style={responsiveStyles.alertText}>{alert.message}</span>
                    <span style={responsiveStyles.alertTime}>{alert.time}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
        {/* Navigation Tabs */}
        <section style={responsiveStyles.section}>
          <h2 style={responsiveStyles.sectionTitle}>Quick Actions</h2>
          <div style={responsiveStyles.navigationTabs}>
            <button
              style={{ ...responsiveStyles.navButton, ...(hoveredButton === 'charts' ? { backgroundColor: '#ea580c', color: '#fff', transform: 'translateY(-2px)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' } : {}) }}
              onMouseEnter={() => setHoveredButton('charts')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => handleNavigation('/detailedcharts')}
            >
              Detailed Charts
            </button>
            <button
              style={{ ...responsiveStyles.navButton, ...(hoveredButton === 'billing' ? { backgroundColor: '#ea580c', color: '#fff', transform: 'translateY(-2px)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' } : {}) }}
              onMouseEnter={() => setHoveredButton('billing')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => handleNavigation('/billspage')}
            >
              Billing & Reports
            </button>
            <button
              style={{ ...responsiveStyles.navButton, ...(hoveredButton === 'events' ? { backgroundColor: '#ea580c', color: '#fff', transform: 'translateY(-2px)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' } : {}) }}
              onMouseEnter={() => setHoveredButton('events')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => handleNavigation('/eventsAlerts')}
            >
              Events & Log
            </button>
            <button
              style={{ ...responsiveStyles.navButton, ...(hoveredButton === 'settings' ? { backgroundColor: '#ea580c', color: '#fff', transform: 'translateY(-2px)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' } : {}) }}
              onMouseEnter={() => setHoveredButton('settings')}
              onMouseLeave={() => setHoveredButton(null)}
              onClick={() => handleNavigation('/settingsconfig')}
            >
              Settings
            </button>
          </div>
        </section>
        {/* Download Section - Hidden per user request */}
        {false && (
          <section style={responsiveStyles.section}>
            <h2 style={responsiveStyles.sectionTitle}>Export Data</h2>
            <div style={responsiveStyles.downloadSection}>
              <button
                style={responsiveStyles.downloadButton}
                onClick={() => handleDownload(7)}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#dc2626';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#ea580c';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <DownloadIcon />
                Download 7 Days CSV
              </button>
              <button
                style={responsiveStyles.downloadButton}
                onClick={() => handleDownload(30)}
                onMouseOver={(e) => {
                  e.target.style.backgroundColor = '#dc2626';
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.target.style.backgroundColor = '#ea580c';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <DownloadIcon />
                Download 30 Days CSV
              </button>
            </div>
          </section>
        )}
      </main>
      {/* Footer */}
      <footer style={responsiveStyles.footer}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem' }}>
            Need help? Contact <a href="mailto:powerpulsepro.smartmetering@gmail.com" style={{ color: '#ea580c', textDecoration: 'underline' }}>PowerPulsePro Support</a>
          </p>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>
            © 2025 PowerPulsePro Smart Energy Meter. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default CustomerDashboard;