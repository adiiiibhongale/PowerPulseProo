import React, { useState, useEffect } from 'react';
import Logo from '../assets/Logo.jpg';

// Icons with the same styling as CustomerDashboard
const SearchIcon = () => (
  <svg style={{ width: '20px', height: '20px', color: '#64748b' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);

const UserIcon = () => (
  <svg style={{ width: '24px', height: '24px', color: '#ea580c' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const EditIcon = () => (
  <svg style={{ width: '20px', height: '20px', color: '#ea580c' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const PowerIcon = () => (
  <svg style={{ width: '24px', height: '24px', color: '#ea580c' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v10" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18.4 6.6a9 9 0 1 1-12.77.02" />
  </svg>
);

const SettingsIcon = () => (
  <svg style={{ width: '24px', height: '24px', color: '#ea580c' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const StatusIcon = ({ online }) => (
  online ? (
    <svg style={{ width: '12px', height: '12px', color: '#10b981' }} fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" /></svg>
  ) : (
    <svg style={{ width: '12px', height: '12px', color: '#ef4444' }} fill="currentColor" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" /></svg>
  )
);

// Responsive styles function matching CustomerDashboard
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
    card: {
      backgroundColor: '#ffffff',
      padding: isMobile ? '1rem' : '1.5rem',
      borderRadius: '1rem',
      border: '1px solid #f1f5f9',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.3s ease',
    },
    searchBox: {
      position: 'relative',
      marginBottom: isMobile ? '1rem' : '1.5rem',
    },
    searchInput: {
      width: '100%',
      padding: isMobile ? '0.75rem 1rem 0.75rem 2.5rem' : '0.875rem 1.25rem 0.875rem 3rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.75rem',
      fontSize: isMobile ? '0.875rem' : '1rem',
      color: '#111827',
      outline: 'none',
      background: '#ffffff',
      boxSizing: 'border-box',
      transition: 'all 0.3s ease',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    searchIcon: {
      position: 'absolute',
      left: isMobile ? '0.75rem' : '1rem',
      top: '50%',
      transform: 'translateY(-50%)',
      pointerEvents: 'none',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: isMobile ? '0.8rem' : '0.875rem',
    },
    tableHeader: {
      backgroundColor: '#f8fafc',
      borderBottom: '1px solid #e5e7eb',
    },
    tableHeaderCell: {
      padding: isMobile ? '0.75rem 0.5rem' : '1rem',
      textAlign: 'left',
      fontWeight: '600',
      color: '#374151',
      borderBottom: '1px solid #e5e7eb',
    },
    tableCell: {
      padding: isMobile ? '0.75rem 0.5rem' : '1rem',
      borderBottom: '1px solid #f3f4f6',
      color: '#111827',
    },
    statusBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.375rem',
      padding: '0.25rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '600',
    },
    button: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      padding: isMobile ? '0.5rem 1rem' : '0.75rem 1.25rem',
      backgroundColor: '#ea580c',
      color: '#ffffff',
      borderRadius: '0.75rem',
      border: 'none',
      fontSize: isMobile ? '0.8rem' : '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      minHeight: isMobile && isTouchDevice ? '44px' : 'auto',
    },
    footer: {
      backgroundColor: '#0f172a',
      color: '#ffffff',
      padding: isMobile ? '1.5rem 1rem' : '2rem',
      textAlign: 'center',
    },
  };
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


// --- Main Admin Dashboard Component ---

export default function AdminDashboard() {
  // --- State Management ---
  // TODO: Replace mock data with API/Firebase calls
  const [users, setUsers] = useState([
    { id: 'USR001', email: 'alice@example.com', role: 'Consumer', deviceIds: ['DEV001'], status: 'Active' },
    { id: 'USR003', email: 'charlie@example.com', role: 'Consumer', deviceIds: [], status: 'Inactive' },
  ]);
  const [devices, setDevices] = useState([
    { id: 'DEV001', location: '123 Oak St, Springfield', status: 'Online', user: 'USR001', lastSeen: '2025-10-04T10:30:00Z', firmware: 'v1.2.3' },
    { id: 'DEV002', location: '456 Maple Ave, Shelbyville', status: 'Offline', user: 'USR002', lastSeen: '2025-10-03T18:45:12Z', firmware: 'v1.2.1' },
    { id: 'DEV003', location: '789 Pine Ln, Capital City', status: 'Online', user: 'USR002', lastSeen: '2025-10-04T10:32:15Z', firmware: 'v1.2.3' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(devices[0]);
  const [showConfirmation, setShowConfirmation] = useState(null); // { title, message, onConfirm }
  const [notification, setNotification] = useState(null); // { type, message }

  // Filtered data based on search
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Effects ---
  // Effect to fetch initial data
  useEffect(() => {
    // TODO: Fetch users and devices from your backend
    // E.g., fetch('/api/admin/users').then(res => res.json()).then(data => setUsers(data));
    // E.g., fetch('/api/admin/devices').then(res => res.json()).then(data => setDevices(data));
  }, []);

  // --- Handlers ---
  const handleAction = (action, data) => {
    setShowConfirmation({
      title: `Confirm ${action}`,
      message: `Are you sure you want to ${action.toLowerCase()} ${data.id}? This action cannot be undone.`,
      onConfirm: () => {
        console.log(`Performing ${action} on ${data.id}`);
        // TODO: Call API to perform the action
        showNotification('success', `${data.id} has been ${action.toLowerCase()}d successfully.`);
        setShowConfirmation(null);
      },
    });
  };
  
  const handleSaveSettings = (section) => {
      setShowConfirmation({
      title: 'Confirm Save Settings',
      message: `Are you sure you want to apply the new ${section} settings?`,
      onConfirm: () => {
          console.log(`Saving ${section} settings...`);
           // TODO: Call API to save settings
          showNotification('success', `${section} settings saved successfully!`);
          setShowConfirmation(null);
      },
    });
  }

  const showNotification = (type, message) => {
      setNotification({ type, message });
      setTimeout(() => setNotification(null), 5000);
  }

  // --- Render Functions ---
  const renderStatusBadge = (status) => {
    const baseClasses = 'px-3 py-1 text-xs font-semibold rounded-full';
    switch (status) {
      case 'Active':
      case 'Online':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>{status}</span>;
      case 'Inactive':
      case 'Offline':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>{status}</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  // Get responsive styles
  const screenSize = useScreenSize();
  const responsiveStyles = getResponsiveStyles(screenSize.width, screenSize.isTouchDevice);
  const isMobile = screenSize.width <= 768;

  return (
    <div style={responsiveStyles.container}>
      {/* Header */}
      <header style={responsiveStyles.header}>
        <div style={responsiveStyles.headerContent}>
          <div style={responsiveStyles.logoSection}>
            <img src={Logo} alt="PowerPulsePro Logo" style={responsiveStyles.logo} />
          </div>
          <h1 style={responsiveStyles.pageTitle}>Admin Dashboard</h1>
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
            {!isMobile && <span style={{ fontSize: isMobile ? '0.8rem' : '0.875rem', fontWeight: '600', color: '#111827' }}>Admin</span>}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={responsiveStyles.main}>
        {/* User Management */}
        <section style={responsiveStyles.section}>
          <h2 style={responsiveStyles.sectionTitle}>User Management</h2>
          <div style={responsiveStyles.card}>
            <div style={responsiveStyles.searchBox}>
              <div style={responsiveStyles.searchIcon}>
                <SearchIcon />
              </div>
              <input
                type="text"
                placeholder="Search by Consumer ID or Email..."
                style={responsiveStyles.searchInput}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={(e) => {
                  e.target.style.border = '2px solid #ea580c';
                  e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.border = '1px solid #d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={responsiveStyles.table}>
                <thead style={responsiveStyles.tableHeader}>
                  <tr>
                    <th style={responsiveStyles.tableHeaderCell}>Consumer ID</th>
                    <th style={responsiveStyles.tableHeaderCell}>Email</th>
                    <th style={responsiveStyles.tableHeaderCell}>Role</th>
                    <th style={responsiveStyles.tableHeaderCell}>Status</th>
                    <th style={responsiveStyles.tableHeaderCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td style={responsiveStyles.tableCell}>{user.id}</td>
                      <td style={responsiveStyles.tableCell}>{user.email}</td>
                      <td style={responsiveStyles.tableCell}>{user.role}</td>
                      <td style={responsiveStyles.tableCell}>{renderStatusBadge(user.status)}</td>
                      <td style={responsiveStyles.tableCell}>
                        <button 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
                          aria-label={`Edit user ${user.id}`}
                          onMouseOver={(e) => e.target.style.opacity = '0.7'}
                          onMouseOut={(e) => e.target.style.opacity = '1'}
                        >
                          <EditIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Device Management */}
        <section style={responsiveStyles.section}>
          <h2 style={responsiveStyles.sectionTitle}>Device Management</h2>
          <div style={responsiveStyles.card}>
            <div style={{ overflowX: 'auto' }}>
              <table style={responsiveStyles.table}>
                <thead style={responsiveStyles.tableHeader}>
                  <tr>
                    <th style={responsiveStyles.tableHeaderCell}>Device ID</th>
                    <th style={responsiveStyles.tableHeaderCell}>Location</th>
                    <th style={responsiveStyles.tableHeaderCell}>Status</th>
                    <th style={responsiveStyles.tableHeaderCell}>Last Seen</th>
                    <th style={responsiveStyles.tableHeaderCell}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {devices.map(device => (
                    <tr 
                      key={device.id} 
                      style={{ cursor: 'pointer', transition: 'background-color 0.3s ease' }}
                      onClick={() => setSelectedDevice(device)}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <td style={responsiveStyles.tableCell}>{device.id}</td>
                      <td style={responsiveStyles.tableCell}>{device.location}</td>
                      <td style={responsiveStyles.tableCell}>{renderStatusBadge(device.status)}</td>
                      <td style={responsiveStyles.tableCell}>{new Date(device.lastSeen).toLocaleString()}</td>
                      <td style={responsiveStyles.tableCell}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            onClick={(e) => {e.stopPropagation(); handleAction('Reboot', device)}}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#f59e0b',
                              fontSize: isMobile ? '0.75rem' : '0.8rem',
                              cursor: 'pointer',
                              fontWeight: '600',
                              transition: 'color 0.3s ease'
                            }}
                            onMouseOver={(e) => e.target.style.color = '#d97706'}
                            onMouseOut={(e) => e.target.style.color = '#f59e0b'}
                          >
                            Reboot
                          </button>
                          <button 
                            onClick={(e) => {e.stopPropagation(); handleAction('Reset', device)}}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              fontSize: isMobile ? '0.75rem' : '0.8rem',
                              cursor: 'pointer',
                              fontWeight: '600',
                              transition: 'color 0.3s ease'
                            }}
                            onMouseOver={(e) => e.target.style.color = '#dc2626'}
                            onMouseOut={(e) => e.target.style.color = '#ef4444'}
                          >
                            Reset
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Configuration Sections */}
        <section style={responsiveStyles.section}>
          <h2 style={responsiveStyles.sectionTitle}>System Configuration</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: isMobile ? '1rem' : '1.5rem' }}>
            {/* Threshold & Alert Configuration */}
            <div style={responsiveStyles.card}>
              <h3 style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>Threshold & Alert Config</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
                  <label htmlFor="over-voltage" style={{ color: '#64748b', fontSize: isMobile ? '0.8rem' : '0.875rem' }}>Over-voltage (V)</label>
                  <input 
                    id="over-voltage" 
                    type="number" 
                    defaultValue="250" 
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: isMobile ? '0.8rem' : '0.875rem',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#ea580c'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
                  <label htmlFor="over-current" style={{ color: '#64748b', fontSize: isMobile ? '0.8rem' : '0.875rem' }}>Over-current (A)</label>
                  <input 
                    id="over-current" 
                    type="number" 
                    defaultValue="15" 
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: isMobile ? '0.8rem' : '0.875rem',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#ea580c'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label htmlFor="tamper-detection" style={{ color: '#64748b', fontSize: isMobile ? '0.8rem' : '0.875rem' }}>Tamper Detection</label>
                  <input id="tamper-detection" type="checkbox" defaultChecked style={{ accentColor: '#ea580c' }} />
                </div>
                <button 
                  onClick={() => handleSaveSettings('Threshold')} 
                  style={{
                    ...responsiveStyles.button,
                    width: '100%',
                    marginTop: '0.5rem'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#dc2626';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#ea580c';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Save Thresholds
                </button>
              </div>
            </div>
            
            {/* Sampling and Reporting */}
            <div style={responsiveStyles.card}>
              <h3 style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>Sampling & Reporting</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
                  <label htmlFor="sample-interval" style={{ color: '#64748b', fontSize: isMobile ? '0.8rem' : '0.875rem' }}>Sample Interval (s)</label>
                  <input 
                    id="sample-interval" 
                    type="number" 
                    defaultValue="30" 
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: isMobile ? '0.8rem' : '0.875rem',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#ea580c'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
                  <label htmlFor="report-interval" style={{ color: '#64748b', fontSize: isMobile ? '0.8rem' : '0.875rem' }}>Reporting Interval (m)</label>
                  <input 
                    id="report-interval" 
                    type="number" 
                    defaultValue="5" 
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: isMobile ? '0.8rem' : '0.875rem',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#ea580c'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', alignItems: 'center' }}>
                  <label htmlFor="billing-rate" style={{ color: '#64748b', fontSize: isMobile ? '0.8rem' : '0.875rem' }}>Billing Rate ($/kWh)</label>
                  <input 
                    id="billing-rate" 
                    type="number" 
                    step="0.01" 
                    defaultValue="0.12" 
                    style={{
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: isMobile ? '0.8rem' : '0.875rem',
                      outline: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#ea580c'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                </div>
                <button 
                  onClick={() => handleSaveSettings('Sampling')} 
                  style={{
                    ...responsiveStyles.button,
                    width: '100%',
                    marginTop: '0.5rem'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#dc2626';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#ea580c';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Save Intervals
                </button>
              </div>
            </div>

            {/* Security & System */}
            <div style={responsiveStyles.card}>
              <h3 style={{ fontSize: isMobile ? '1.1rem' : '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>Security & System</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontSize: isMobile ? '0.8rem' : '0.875rem' }}>Two-Factor Auth (2FA)</span>
                  <button 
                    style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: '#f1f5f9',
                      color: '#374151',
                      borderRadius: '0.375rem',
                      border: 'none',
                      fontSize: isMobile ? '0.75rem' : '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                  >
                    Manage
                  </button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontSize: isMobile ? '0.8rem' : '0.875rem' }}>User Permissions</span>
                  <button 
                    style={{
                      padding: '0.375rem 0.75rem',
                      backgroundColor: '#f1f5f9',
                      color: '#374151',
                      borderRadius: '0.375rem',
                      border: 'none',
                      fontSize: isMobile ? '0.75rem' : '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                  >
                    Configure
                  </button>
                </div>
                <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '0.5rem 0' }} />
                <button 
                  style={{
                    ...responsiveStyles.button,
                    width: '100%',
                    backgroundColor: '#0891b2'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#0e7490';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#0891b2';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Schedule Firmware Update
                </button>
                <button 
                  style={{
                    ...responsiveStyles.button,
                    width: '100%',
                    backgroundColor: '#f59e0b'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#d97706';
                    e.target.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#f59e0b';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  Schedule Maintenance
                </button>
              </div>
            </div>
          </div>
        </section>
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

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          backgroundColor: 'rgba(0, 0, 0, 0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 50 
        }}>
          <div style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '0.75rem', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', 
            padding: '1.5rem', 
            width: '100%', 
            maxWidth: '24rem' 
          }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#111827' }}>{showConfirmation.title}</h3>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>{showConfirmation.message}</p>
            <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button 
                onClick={() => setShowConfirmation(null)} 
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#f1f5f9',
                  color: '#374151',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#f1f5f9'}
              >
                Cancel
              </button>
              <button 
                onClick={showConfirmation.onConfirm} 
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#ea580c',
                  color: '#ffffff',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#ea580c'}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div style={{ 
          position: 'fixed', 
          bottom: '1.25rem', 
          right: '1.25rem', 
          padding: '1rem', 
          borderRadius: '0.75rem', 
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
          color: '#ffffff',
          backgroundColor: notification.type === 'success' ? '#10b981' : '#ef4444'
        }}>
          {notification.message}
        </div>
      )}

    </div>
  );
}