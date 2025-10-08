import React, { useState } from 'react';
import Logo from '../assets/Logo.jpg';

const SETTINGS_CSS = `
:root { --sc-font: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif; --sc-primary:#ea580c; --sc-bg:#fef7f0; --sc-bg-mid:#f0f9ff; --sc-bg-end:#ecfeff; --sc-surface:#fff; --sc-border:#e2e8f0; --sc-text:#111827; --sc-text-dim:#64748b; }
.sc-container { font-family: var(--sc-font); min-height:100vh; background:linear-gradient(135deg,var(--sc-bg) 0%,var(--sc-bg-mid) 50%,var(--sc-bg-end) 100%); color:var(--sc-text); display:flex; flex-direction:column; }
.sc-header { position:sticky; top:0; z-index:40; background:rgba(255,255,255,0.95); backdrop-filter:blur(20px); border-bottom:2px solid var(--sc-primary); box-shadow:0 4px 20px rgba(234,88,12,0.2); }
.sc-header-content { max-width:1280px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:.65rem 1rem; position:relative; }
.sc-logo { height:42px; width:auto; object-fit:contain; }
.sc-title { font-size:1.35rem; font-weight:700; margin:0; color:var(--sc-primary); letter-spacing:.5px; }
.sc-back-btn { background:var(--sc-primary); color:#fff; border:none; padding:.55rem .9rem; border-radius:.65rem; cursor:pointer; font-weight:600; font-size:.75rem; letter-spacing:.5px; box-shadow:0 2px 6px -1px rgba(234,88,12,0.5); transition:.25s; }
.sc-back-btn:hover { background:#c2410c; transform:translateY(-2px); }
.sc-main { width:100%; max-width:1280px; margin:0 auto; padding:1.1rem .9rem 2.4rem; box-sizing:border-box; }
.sc-tabs { display:flex; gap:2.2rem; border-bottom:2px solid var(--sc-border); margin-bottom:1.2rem; font-size:.98rem; font-weight:600; color:var(--sc-text-dim); }
.sc-tab { padding:.5rem 0; cursor:pointer; border:none; background:none; outline:none; color:inherit; border-bottom:2px solid transparent; transition:.2s; }
.sc-tab.active { color:var(--sc-primary); border-bottom:2px solid var(--sc-primary); }
.sc-card { background:var(--sc-surface); border:1px solid var(--sc-border); border-radius:18px; box-shadow:0 8px 24px -8px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04); padding:1.2rem 1.2rem 1.1rem; margin-bottom:2rem; }
.sc-section { font-size:1.05rem; font-weight:700; color:var(--sc-primary); margin-bottom:.7rem; margin-top:.5rem; }
.sc-fields { display:grid; grid-template-columns:repeat(4,1fr); gap:1.1rem 1.2rem; margin-bottom:1.2rem; }
.sc-field { display:flex; flex-direction:column; gap:.35rem; }
.sc-label { font-size:.72rem; font-weight:600; color:var(--sc-text-dim); letter-spacing:.2px; }
.sc-input, .sc-select { background:#f8fafc; border:1px solid var(--sc-border); border-radius:10px; padding:.55rem .6rem; font-size:.85rem; outline:none; font-weight:500; color:var(--sc-text); transition:border-color .25s, background .25s; }
.sc-input:focus, .sc-select:focus { border-color:var(--sc-primary); box-shadow:0 0 0 2px rgba(234,88,12,0.25); }
.sc-row { display:flex; gap:1.2rem; margin-bottom:1.2rem; }
.sc-btn-row { display:flex; gap:1.1rem; margin-top:1.2rem; flex-wrap:wrap; }
.sc-btn { border:none; border-radius:10px; padding:.7rem 1.2rem; font-size:.95rem; font-weight:700; letter-spacing:.4px; cursor:pointer; display:inline-flex; align-items:center; gap:.4rem; box-shadow:0 2px 6px rgba(0,0,0,0.15); transition:.25s; background:#fff; }
.sc-btn-primary { background:#6366f1; color:#fff; }
.sc-btn-primary:hover { background:#4f46e5; }
.sc-btn-danger { background:#dc2626; color:#fff; }
.sc-btn-danger:hover { background:#b91c1c; }
.sc-btn-secondary { background:#f1f5f9; color:#111827; }
.sc-btn-secondary:hover { background:#e2e8f0; }
.sc-status { font-size:.85rem; color:var(--sc-text-dim); margin-top:.3rem; }
.sc-btn-compact { padding:.45rem .7rem; font-size:.78rem; border-radius:8px; }
/* Footer styles matching previous pages */
.sc-footer { text-align:center; font-size:.65rem; color:#cbd5e1; letter-spacing:.5px; padding:1rem 1.25rem 1.05rem; background:#0f172a; border-top:1px solid #1e293b; margin-top:auto; display:flex; flex-direction:column; gap:.5rem; }
.sc-footer-link { color:var(--sc-primary); font-weight:600; text-decoration:none; }
.sc-footer-link:hover { text-decoration:underline; }
.sc-footer-id { font-size:.7rem; color:#cbd5e1; }
@media (max-width:1020px){ .sc-fields{grid-template-columns:repeat(2,1fr);} }
@media (max-width:700px){ .sc-fields{grid-template-columns:1fr;} .sc-main{padding:.7rem .5rem 1.2rem;} .sc-card{padding:.8rem .7rem .7rem;} .sc-btn-row{gap:.7rem;} }
@media (max-width:560px){ .sc-header-content{display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:.5rem; padding:.5rem .6rem;} .sc-logo{height:26px;} .sc-title{grid-column:2; justify-self:center; font-size:1rem; font-weight:700; text-align:center; margin:0;} .sc-back-btn{background:transparent; color:var(--sc-primary); box-shadow:none; padding:.35rem .5rem; font-size:.7rem;} .sc-back-btn:hover{background:transparent; text-decoration:underline; transform:none;} }
.sc-account-form { display:flex; flex-direction:column; gap:2.2rem; }
.sc-account-section-title { font-weight:700; font-size:1.08rem; margin-bottom:1.1rem; }
.sc-account-profile-row { display:grid; grid-template-columns:repeat(4,1fr); gap:1.1rem 1.2rem; margin-bottom:1.2rem; }
.sc-account-field { display:flex; flex-direction:column; gap:.35rem; }
.sc-account-btn { width:100%; min-width:120px; }
.sc-account-notify-row { display:flex; gap:2.2rem; margin-bottom:1.2rem; flex-wrap:wrap; }
.sc-account-checkbox { display:flex; align-items:center; gap:.6rem; font-weight:600; font-size:.98rem; }
.sc-account-checkbox input[type="checkbox"] { accent-color:var(--sc-primary); width:1.2em; height:1.2em; }
.sc-account-save-row { margin-top:1.2rem; display:flex; justify-content:flex-start; align-items:center; flex-wrap:wrap; gap:1rem; }
.sc-account-save-row .sc-btn { width:auto; min-width:0; padding:.45rem 1.1rem; font-size:.78rem; border-radius:8px; background:var(--sc-primary); color:#fff; box-shadow:none; margin:0; }
.sc-account-save-row .sc-btn:hover { background:#c2410c; }
.sc-account-save-row .sc-btn-danger { background:#dc2626; }
.sc-account-save-row .sc-btn-danger:hover { background:#b91c1c; }
@media (max-width:700px){
  .sc-account-profile-row { grid-template-columns:1fr; gap:.7rem; }
  .sc-account-btn { min-width:0; }
  .sc-account-notify-row { gap:1.1rem; }
  .sc-account-save-row { flex-direction:column; align-items:stretch; }
  .sc-account-save-row .sc-btn { min-width:0; width:100%; }
}
`;

const initialConfig = {
  overVoltage: '260',
  underVoltage: '190',
  overCurrent: '50',
  pfLow: '0.9',
  pfHyst: '0.03',
  samplingInterval: '100',
  dataInterval: '60',
  timezone: 'Asia/Kolkata',
  rtcStatus: 'Last synced 2025-09-30 10:00:00',
  voltageOffset: '0.5',
  currentOffset: '0.01',
  powerOffset: '1',
};

export default function SettingsConfig() {
  const [tab, setTab] = useState(0);
  const [config, setConfig] = useState(initialConfig);
  const [saveStatus, setSaveStatus] = useState('');
  const [consumerData, setConsumerData] = useState(null);
  const deviceId = 'PPPRO-001';

  function parseNum(v){ const n = parseFloat(v); return isNaN(n)? null : n; }

  function handleLogout() {
    try {
      // Clear all stored user data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('isLoggedIn');
      
      // Clear any device-specific configs if needed
      // localStorage.removeItem(`pppro:config:${deviceId}`);
      
      // Redirect to landing page
      window.location.href = '/';
    } catch (e) {
      console.error('Logout error:', e);
      // Force redirect even if localStorage fails
      window.location.href = '/';
    }
  }

  function validateConfig(c){
    const ov = parseNum(c.overVoltage);
    const uv = parseNum(c.underVoltage);
    const oc = parseNum(c.overCurrent);
    const pfL = parseNum(c.pfLow);
    const pfH = parseNum(c.pfHyst);
    if(ov===null || uv===null || oc===null || pfL===null || pfH===null) return 'All threshold fields must be numeric';
    if(uv >= ov) return 'Under Voltage must be less than Over Voltage';
    if(pfL <= 0 || pfL >= 1) return 'PF Low Limit must be between 0 and 1';
    if(pfH < 0 || pfH > 0.5) return 'PF Hysteresis looks invalid';
    if(oc <=0) return 'Over Current must be > 0';
    return null;
  }

  function handleApply(){
    setSaveStatus('');
    const err = validateConfig(config);
    if(err){ setSaveStatus(err); return; }
    try {
      const key = `pppro:config:${deviceId}`;
      localStorage.setItem(key, JSON.stringify({ ...config, _savedAt: new Date().toISOString(), deviceId }));
      // Notify other tabs/components (EventsAlerts listens)
      window.dispatchEvent(new CustomEvent('device-config-updated', { detail:{ deviceId, config }}));
      setSaveStatus('Saved ✓');
      setTimeout(()=> setSaveStatus(''), 4000);
    } catch(e){
      setSaveStatus('Save failed: ' + e.message);
    }
  }

  React.useEffect(() => {
    if (!document.getElementById('settings-config-css')) {
      const tag = document.createElement('style');
      tag.id = 'settings-config-css';
      tag.innerHTML = SETTINGS_CSS;
      document.head.appendChild(tag);
    }
    return () => {};
  }, []);

  // Load persisted config and consumer data on first mount
  React.useEffect(()=>{
    try {
      // Load device config
      const raw = localStorage.getItem(`pppro:config:${deviceId}`);
      if(raw){
        const saved = JSON.parse(raw);
        // Only merge known keys to avoid polluting state
        const allowedKeys = Object.keys(initialConfig);
        const merged = { ...config };
        allowedKeys.forEach(k=>{ if(saved[k] !== undefined) merged[k] = String(saved[k]); });
        setConfig(merged);
        setSaveStatus('Loaded saved config');
        setTimeout(()=> setSaveStatus(''), 3000);
      }
      
      // Load consumer data from localStorage (stored by ConsumerLogin)
      const userRaw = localStorage.getItem('user');
      if (userRaw) {
        const userData = JSON.parse(userRaw);
        setConsumerData(userData);
      }
    } catch(e){ 
      console.warn('Failed to load config or user data:', e);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="sc-container">
      <header className="sc-header" role="banner">
        <div className="sc-header-content">
          <img src={Logo} alt="Logo" className="sc-logo" />
          <h1 className="sc-title">Settings &amp; Configuration</h1>
          <button className="sc-back-btn" onClick={()=>window.location.href='/dashboard'}>← Dashboard</button>
        </div>
      </header>
      <main className="sc-main">
        <nav className="sc-tabs" role="tablist">
          <button className={"sc-tab" + (tab===0?" active":"")} onClick={()=>setTab(0)} role="tab" aria-selected={tab===0}>Device Configuration (PPPRO-001)</button>
          <button className={"sc-tab" + (tab===1?" active":"")} onClick={()=>setTab(1)} role="tab" aria-selected={tab===1}>Account &amp; Notifications</button>
        </nav>
        {tab===0 && (
          <section className="sc-card" aria-label="Device Configuration">
            <div className="sc-fields">
              <div className="sc-field"><label className="sc-label">Over Voltage Threshold (V)</label><input className="sc-input" value={config.overVoltage} onChange={e=>setConfig({...config,overVoltage:e.target.value})} /></div>
              <div className="sc-field"><label className="sc-label">Under Voltage Threshold (V)</label><input className="sc-input" value={config.underVoltage} onChange={e=>setConfig({...config,underVoltage:e.target.value})} /></div>
              <div className="sc-field"><label className="sc-label">Over Current Threshold (A)</label><input className="sc-input" value={config.overCurrent} onChange={e=>setConfig({...config,overCurrent:e.target.value})} /></div>
              <div className="sc-field"><label className="sc-label">Power Factor Low Limit</label><input className="sc-input" value={config.pfLow} onChange={e=>setConfig({...config,pfLow:e.target.value})} /></div>
              <div className="sc-field"><label className="sc-label">PF Hysteresis (for alerts)</label><input className="sc-input" value={config.pfHyst} onChange={e=>setConfig({...config,pfHyst:e.target.value})} /></div>
            </div>
            <div className="sc-section">Intervals &amp; Time</div>
            <div className="sc-fields">
              <div className="sc-field"><label className="sc-label">Sampling Interval (ms)</label><input className="sc-input" value={config.samplingInterval} onChange={e=>setConfig({...config,samplingInterval:e.target.value})} /></div>
              <div className="sc-field"><label className="sc-label">Data Publish Interval (seconds)</label><input className="sc-input" value={config.dataInterval} onChange={e=>setConfig({...config,dataInterval:e.target.value})} /></div>
              <div className="sc-field"><label className="sc-label">Timezone</label><select className="sc-select" value={config.timezone} onChange={e=>setConfig({...config,timezone:e.target.value})}><option value="Asia/Kolkata">Asia/Kolkata</option></select></div>
              <div className="sc-field"><label className="sc-label">RTC Sync Status</label><input className="sc-input" value={config.rtcStatus} readOnly /></div>
            </div>
            <div className="sc-section">Calibration Offsets</div>
            <div className="sc-fields">
              <div className="sc-field"><label className="sc-label">Voltage Offset (V)</label><input className="sc-input" value={config.voltageOffset} onChange={e=>setConfig({...config,voltageOffset:e.target.value})} /></div>
              <div className="sc-field"><label className="sc-label">Current Offset (A)</label><input className="sc-input" value={config.currentOffset} onChange={e=>setConfig({...config,currentOffset:e.target.value})} /></div>
              <div className="sc-field"><label className="sc-label">Power Offset (W)</label><input className="sc-input" value={config.powerOffset} onChange={e=>setConfig({...config,powerOffset:e.target.value})} /></div>
            </div>
            <div className="sc-btn-row">
              <button type="button" onClick={handleApply} className="sc-btn sc-btn-primary sc-btn-compact">Apply Changes</button>
              {saveStatus && <span className="sc-status" style={{minWidth:'140px'}}>{saveStatus}</span>}
            </div>
          </section>
        )}
        {tab===1 && (
          <section className="sc-card" aria-label="Account & Notifications">
              <form className="sc-account-form">
                <div>
                  <div className="sc-account-section-title">Consumer Profile</div>
                  {consumerData ? (
                    <>
                      <div className="sc-account-profile-row">
                        <div className="sc-account-field">
                          <label className="sc-label">Consumer Name</label>
                          <input className="sc-input" value={consumerData.name || 'N/A'} readOnly />
                        </div>
                        <div className="sc-account-field">
                          <label className="sc-label">Email Address</label>
                          <input className="sc-input" value={consumerData.email || 'N/A'} readOnly />
                        </div>
                        <div className="sc-account-field">
                          <label className="sc-label">Mobile Number</label>
                          <input className="sc-input" value={consumerData.phone || 'N/A'} readOnly />
                        </div>
                        <div className="sc-account-field">
                          <label className="sc-label">Consumer Number</label>
                          <input className="sc-input" value={consumerData.consumerNumber || 'N/A'} readOnly />
                        </div>
                      </div>
                      <div className="sc-account-profile-row">
                        <div className="sc-account-field">
                          <label className="sc-label">Connection Type</label>
                          <input className="sc-input" value={consumerData.connectionType?.toUpperCase() || 'N/A'} readOnly />
                        </div>
                        <div className="sc-account-field">
                          <label className="sc-label">Tariff Plan</label>
                          <input className="sc-input" value={consumerData.tariffPlan?.toUpperCase() || 'N/A'} readOnly />
                        </div>
                        <div className="sc-account-field">
                          <label className="sc-label">Account Status</label>
                          <input className="sc-input" value={consumerData.status?.toUpperCase() || 'N/A'} readOnly />
                        </div>
                        <div className="sc-account-field">
                          <label className="sc-label">Meter ID</label>
                          <input className="sc-input" value={consumerData.meterDetails?.meterId || 'Not Assigned'} readOnly />
                        </div>
                      </div>
                      {consumerData.address && (
                        <div className="sc-account-profile-row">
                          <div className="sc-account-field" style={{ gridColumn: '1 / -1' }}>
                            <label className="sc-label">Address</label>
                            <input 
                              className="sc-input" 
                              value={`${consumerData.address.street}, ${consumerData.address.city}, ${consumerData.address.state} - ${consumerData.address.pincode}`} 
                              readOnly 
                            />
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="sc-account-profile-row">
                      <div className="sc-account-field">
                        <label className="sc-label">Consumer Name</label>
                        <input className="sc-input" value="Loading..." readOnly />
                      </div>
                      <div className="sc-account-field">
                        <label className="sc-label">Email Address</label>
                        <input className="sc-input" value="Loading..." readOnly />
                      </div>
                      <div className="sc-account-field">
                        <label className="sc-label">Mobile Number</label>
                        <input className="sc-input" value="Loading..." readOnly />
                      </div>
                      <div className="sc-account-field">
                        <label className="sc-label">Consumer Number</label>
                        <input className="sc-input" value="Loading..." readOnly />
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <div className="sc-account-section-title">Notification Preferences</div>
                  <div className="sc-account-notify-row">
                    <label className="sc-account-checkbox">
                      <input 
                        type="checkbox" 
                        checked={consumerData?.preferences?.notifications?.email ?? true} 
                        readOnly 
                      /> 
                      Receive Email Alerts
                    </label>
                    <label className="sc-account-checkbox">
                      <input 
                        type="checkbox" 
                        checked={consumerData?.preferences?.notifications?.sms ?? false} 
                        readOnly 
                      /> 
                      Receive SMS Alerts
                    </label>
                  </div>
                </div>
                <div>
                  <div className="sc-account-section-title">Developer Access</div>
                  <div className="sc-account-field"><label className="sc-label">API Token</label><input className="sc-input" value="pppr-********-******-**" readOnly /></div>
                </div>
                <div className="sc-account-save-row">
                  <button type="button" className="sc-btn sc-btn-primary sc-account-btn">Save Account Preferences</button>
                  {consumerData && (
                    <button 
                      type="button" 
                      onClick={handleLogout}
                      className="sc-btn sc-btn-danger sc-account-btn"
                      style={{ marginLeft: '1rem' }}
                    >
                      Logout
                    </button>
                  )}
                </div>
              </form>
          </section>
        )}
      </main>
      <footer className="sc-footer" role="contentinfo">
        <div>Need help? Contact <a href="mailto:powerpulsepro.smartmetering@gmail.com" className="sc-footer-link">PowerPulsePro Support</a></div>
        <div>© {new Date().getFullYear()} PowerPulsePro Smart Energy Meter. All rights reserved.</div>
      </footer>
    </div>
  );
}
