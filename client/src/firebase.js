// Frontend Firebase Realtime Database integration (client side only)
// NOTE: Do NOT hardcode secrets here. Create a .env file at project root with:
// VITE_FIREBASE_API_KEY=xxx
// VITE_FIREBASE_AUTH_DOMAIN=xxx
// VITE_FIREBASE_DATABASE_URL=xxx
// VITE_FIREBASE_PROJECT_ID=xxx
// VITE_FIREBASE_STORAGE_BUCKET=xxx
// VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
// VITE_FIREBASE_APP_ID=xxx

import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, onValue, off, get } from 'firebase/database';

// Provided fallback values (will only be used if env vars are missing)
// IMPORTANT: apiKey is public (okay to expose) but protect your database with proper security rules.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyB289UhJJQCj23oZFSCQhgoCUwjczoJNDw',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'powerpulsepro-e3f49.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://powerpulsepro-e3f49-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'powerpulsepro-e3f49',
  // NOTE: Typical storage bucket format is <projectId>.appspot.com. If the provided one fails, adjust manually.
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'powerpulsepro-e3f49.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '739221726577',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:739221726577:web:d6032b62c59f1279bac2d0',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-K0J9NRDK8G'
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const db = getDatabase(app);
export { ref, onValue, off, get };

// Helper subscribe function returning an unsubscribe
export function subscribe(path, callback, { log = true } = {}) {
  const r = ref(db, path);
  const handler = (snapshot) => {
    const val = snapshot.val();
    if (log) {
      console.info('[Firebase:onValue]', path, val === null ? 'null (no data)' : typeof val === 'object' ? JSON.stringify(val).slice(0, 200) + (JSON.stringify(val).length > 200 ? '…' : '') : val);
    }
    callback(val);
  };
  const errorHandler = (error) => {
    console.error('[Firebase:onValue:error]', path, error?.message || error);
  };
  try {
    onValue(r, handler, errorHandler);
  } catch (e) {
    console.error('[Firebase:onValue:throw]', path, e);
  }
  return () => {
    try { off(r, 'value', handler); } catch (_) {}
  };
}

// One-time fetch helper (for debugging / manual invocation)
export async function fetchValue(path) {
  const r = ref(db, path);
  try {
    const snap = await get(r);
    const val = snap.val();
    console.info('[Firebase:get]', path, val);
    return val;
  } catch (e) {
    console.error('[Firebase:get:error]', path, e);
    throw e;
  }
}

export function buildSampleData() {
  const now = Date.now();
  return {
    currentUsage: {
      power: 2834,
      voltage: 230.5,
      current: 12.3,
      frequency: 50.02,
      powerFactor: 0.85,
      energyToday: 156.78,
      energyMonth: 4520.5,
      lastUpdated: new Date().toISOString()
    },
    billing: {
      currentBill: 2850.75,
      dueDate: new Date(now + 15*24*60*60*1000).toISOString(),
      unitsConsumed: 548,
      tariffRate: 5.2,
      status: 'pending'
    },
    alerts: {
      a1: { id: 'a1', type: 'power_quality', severity: 'warning', message: 'Power factor below optimal (0.85)', timestamp: now - 2*60*1000, acknowledged: false },
      a2: { id: 'a2', type: 'consumption', severity: 'info', message: 'Monthly usage at 75% threshold', timestamp: now - 60*60*1000, acknowledged: false },
      a3: { id: 'a3', type: 'tamper', severity: 'critical', message: 'Tamper detection event', timestamp: now - 3*60*60*1000, acknowledged: false }
    },
    meterReadings: {
      [now - 6*60*60*1000]: { timestamp: now - 6*60*60*1000, energyToday: 120, voltage: 231, current: 11.5, power: 2500, powerFactor: 0.86 },
      [now - 3*60*60*1000]: { timestamp: now - 3*60*60*1000, energyToday: 138, voltage: 229.5, current: 12.0, power: 2700, powerFactor: 0.84 },
      [now - 1*60*60*1000]: { timestamp: now - 1*60*60*1000, energyToday: 150, voltage: 230.7, current: 12.2, power: 2780, powerFactor: 0.85 },
      [now]: { timestamp: now, energyToday: 156.78, voltage: 230.5, current: 12.3, power: 2834, powerFactor: 0.85 }
    },
    powerQuality: {
      voltage: 230.5,
      frequency: 50.02,
      powerFactor: 0.85,
      thd: 2.1,
      status: 'Good'
    }
  };
}

// ----------------------
// New helpers for date/hour segmented schema:
// Readings/YYYY-MM-DD/HH/<epochSeconds> => { Voltage, Current, Power, ActivePower, Frequency, PF, Energy, Time }
// Events/YYYY-MM-DD/HH/<epochSeconds> => { Event, Time }
// ----------------------

// Returns UTC date (legacy) key
function formatDateUTC(d = new Date()) {
  return d.toISOString().slice(0,10); // YYYY-MM-DD (UTC based)
}

// Returns local timezone date key (preferred for user-facing grouping / paths when device writes local dates)
export function formatDateLocal(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

// Backwards compatibility export (some code may still import formatDate)
export const formatDate = formatDateLocal;

// Traverse readings tree and return sorted flat array of { timestamp, raw }
export function flattenReadingsTree(tree) {
  if (!tree || typeof tree !== 'object') return [];
  const out = [];
  Object.entries(tree).forEach(([dateKey, hoursObj]) => {
    if (!hoursObj || typeof hoursObj !== 'object') return;
    Object.entries(hoursObj).forEach(([hourKey, readings]) => {
      if (!readings || typeof readings !== 'object') return;
      Object.entries(readings).forEach(([tsKey, rec]) => {
        const ts = Number(tsKey) * (tsKey.length <= 10 ? 1000 : 1); // if seconds convert to ms
        out.push({ timestamp: ts, date: dateKey, hour: hourKey, raw: rec });
      });
    });
  });
  return out.sort((a,b)=>a.timestamp-b.timestamp);
}

export function readingToUsage(rec) {
  if (!rec) return null;
  const r = rec.raw || rec; // allow raw record
  const get = (k) => r[k] !== undefined ? r[k] : r[k.toLowerCase()] !== undefined ? r[k.toLowerCase()] : undefined;
  const parseNum = (k, def=0) => {
    const v = get(k);
    if (v === undefined || v === null || v === '') return def;
    const n = parseFloat(v);
    return isNaN(n) ? def : n;
  };
  const voltage = parseNum('Voltage', 230);
  const current = parseNum('Current', 0);
  const pf = parseNum('PF', 1);
  const rawActive = get('ActivePower') ?? get('activepower');
  const rawPower = get('Power') ?? get('power');
  const numActive = rawActive !== undefined && rawActive !== '' ? parseFloat(rawActive) : NaN;
  const numPower = rawPower !== undefined && rawPower !== '' ? parseFloat(rawPower) : NaN;
  // Derived estimates
  const derivedApparent = voltage * current; // VA (approx W if pf~1)
  const derivedWithPF = derivedApparent * (pf > 0 && pf <= 1 ? pf : 1);
  // Primary selection (leave final decision for consumer component if needed)
  let primary = 0;
  if (!isNaN(numActive) && numActive > 0) primary = numActive;
  else if (!isNaN(numPower) && numPower > 0) primary = numPower;
  else primary = derivedWithPF || 0;
  // Timestamp reconciliation: folder date + optional Time field vs epoch key.
  let baseTs = rec.timestamp || Date.now();
  let parsedTs = null;
  const timeStr = get('Time') || get('time');
  if (timeStr && rec.date) {
    const match = /^([0-2]?\d):([0-5]\d):?([0-5]\d)?$/.exec(timeStr.trim());
    if (match) {
      const [, hh, mm, ss] = match;
      const [y, m, d] = rec.date.split('-').map(Number);
      const dt = new Date(y, (m||1)-1, d||1, Number(hh), Number(mm), ss? Number(ss):0, 0);
      parsedTs = dt.getTime();
    }
  }
  // If parsed time differs from epoch by more than 2 minutes, trust parsed time (device likely stores local vs epoch mismatch)
  let finalTs = baseTs;
  let tsDelta = null;
  if (parsedTs) {
    tsDelta = Math.abs(parsedTs - baseTs);
    if (tsDelta > 120000) {
      finalTs = parsedTs;
    }
  }
  return {
    voltage,
    current,
    power: primary,
    frequency: parseNum('Frequency', 50),
    powerFactor: pf,
    energyToday: parseNum('Energy', 0),
    timestamp: finalTs,
    _rawEpochTs: baseTs,
    _parsedTs: parsedTs,
    _tsDeltaMs: tsDelta,
    _rawActivePower: isNaN(numActive)? null : numActive,
    _rawPower: isNaN(numPower)? null : numPower,
    _derivedVA: derivedApparent,
    _derivedReal: derivedWithPF
  };
}

export function flattenEventsTree(tree) {
  if (!tree || typeof tree !== 'object') return [];
  const out = [];
  Object.entries(tree).forEach(([dateKey, hoursObj]) => {
    if (!hoursObj || typeof hoursObj !== 'object') return;
    Object.entries(hoursObj).forEach(([hourKey, events]) => {
      if (!events || typeof events !== 'object') return;
      Object.entries(events).forEach(([tsKey, rec]) => {
        const ts = Number(tsKey) * (tsKey.length <= 10 ? 1000 : 1);
        out.push({ timestamp: ts, date: dateKey, hour: hourKey, raw: rec });
      });
    });
  });
  return out.sort((a,b)=>b.timestamp-a.timestamp); // newest first
}

// Subscribe to the entire Readings tree (simple approach). For large data, narrow to current date.
export function subscribeReadings(callback, { currentDateOnly = false, log = true } = {}) {
  if (!currentDateOnly) {
    return subscribe('Readings', (val) => {
      callback(flattenReadingsTree(val));
    }, { log });
  }
  const localKey = formatDateLocal();
  const utcKey = formatDateUTC();
  const primaryPath = `Readings/${localKey}`;
  let unsub = subscribe(primaryPath, (val) => {
    if (val) {
      callback(flattenReadingsTree({ [localKey]: val }));
    } else if (localKey !== utcKey) {
      // Fallback fetch once to UTC path if local empty (handles earlier UTC-based storage)
      const fallbackPath = `Readings/${utcKey}`;
      get(ref(db, fallbackPath)).then(snap => {
        const fv = snap.val();
        if (fv) callback(flattenReadingsTree({ [utcKey]: fv }));
      }).catch(()=>{});
    }
  }, { log });
  return unsub;
}

export function subscribeEvents(callback, { currentDateOnly = false, log = true } = {}) {
  if (!currentDateOnly) {
    return subscribe('Events', (val) => callback(flattenEventsTree(val)), { log });
  }
  const localKey = formatDateLocal();
  const utcKey = formatDateUTC();
  const primaryPath = `Events/${localKey}`;
  let unsub = subscribe(primaryPath, (val) => {
    if (val) {
      callback(flattenEventsTree({ [localKey]: val }));
    } else if (localKey !== utcKey) {
      const fallbackPath = `Events/${utcKey}`;
      get(ref(db, fallbackPath)).then(snap => {
        const fv = snap.val();
        if (fv) callback(flattenEventsTree({ [utcKey]: fv }));
      }).catch(()=>{});
    }
  }, { log });
  return unsub;
}
