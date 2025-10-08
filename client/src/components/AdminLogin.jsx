import React, { useState, useEffect } from 'react';
import Logo from '../assets/Logo.jpg';

// Icons with inline styles (no Tailwind classes)
const UserIcon = () => (
  <svg style={{ width: '22px', height: '22px', color: '#ea580c', display: 'block' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);
const PasswordIcon = () => (
  <svg style={{ width: '22px', height: '22px', color: '#ea580c', display: 'block' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
);
const EyeIcon = ({ open }) => (
  open ? (
    <svg style={{ width: '20px', height: '20px', color: '#ea580c', display: 'block' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.478 0-8.268-2.943-9.542-7z" /></svg>
  ) : (
    <svg style={{ width: '20px', height: '20px', color: '#ea580c', display: 'block' }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L12 12m7.07-7.07L21 3" /></svg>
  )
);

const styles = {
  page: {
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    background: `
      linear-gradient(135deg, #fef7f0 0%, #f0f9ff 50%, #ecfeff 100%),
      radial-gradient(circle at 30% 20%, rgba(234, 88, 12, 0.03) 0%, transparent 60%),
      radial-gradient(circle at 70% 80%, rgba(8, 145, 178, 0.03) 0%, transparent 60%)
    `,
    padding: 0,
  },
  branding: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  logo: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    boxShadow: '0 4px 16px rgba(234,88,12,0.10)',
    marginBottom: '0.5rem',
    objectFit: 'cover',
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: 'bold',
    color: '#111827',
    letterSpacing: '-1px',
    margin: 0,
    textAlign: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#ea580c',
    fontWeight: 600,
    marginTop: '0.25rem',
    textAlign: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#ffffff',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    padding: '2.5rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
    border: '1px solid #f1f5f9',
    transition: 'all 0.3s ease',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#ea580c',
    fontWeight: 700,
    fontSize: '1.05rem',
    marginBottom: '0.25rem',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  inputWrapper: {
    position: 'relative',
    width: '100%',
    marginBottom: '0.5rem',
  },
  inputIcon: {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '22px',
    height: '22px',
    color: '#ea580c',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  input: {
    width: '100%',
    padding: '0.85rem 1rem 0.85rem 2.8rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.75rem',
    fontSize: '1.08rem',
    color: '#111827',
    outline: 'none',
    background: '#ffffff',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  inputFocus: {
    border: '2px solid #ea580c',
    boxShadow: '0 0 0 3px rgba(234, 88, 12, 0.1)',
    background: '#ffffff',
    transform: 'translateY(-2px)',
  },
  inputError: {
    border: '2px solid #dc2626',
    boxShadow: '0 0 0 3px rgba(220, 38, 38, 0.1)',
    background: '#ffffff',
  },
  passwordWrapper: {
    position: 'relative',
    width: '100%',
  },
  eyeButton: {
    position: 'absolute',
    right: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
    margin: '0',
    outline: 'none',
    color: '#ea580c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '0.5rem',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '1rem',
    color: '#0891b2',
    fontWeight: 500,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  forgotLink: {
    fontSize: '0.95rem',
    color: '#ea580c',
    textDecoration: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    outline: 'none',
    marginLeft: '1rem',
    padding: 0,
    transition: 'all 0.3s ease',
  },
  error: {
    color: '#dc2626',
    fontSize: '1rem',
    fontWeight: 600,
    marginTop: '0.5rem',
    marginBottom: '0.5rem',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
    borderRadius: '0.75rem',
    padding: '0.75rem',
    border: '1px solid #fecaca',
  },
  button: {
    width: '100%',
    padding: '1rem',
    borderRadius: '0.75rem',
    fontWeight: 700,
    fontSize: '1.15rem',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #ea580c, #dc2626)',
    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.18)',
    border: 'none',
    cursor: 'pointer',
    marginTop: '0.5rem',
    transition: 'all 0.3s ease',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  buttonHover: {
    background: 'linear-gradient(135deg, #dc2626, #ea580c)',
    transform: 'translateY(-3px) scale(1.05)',
    boxShadow: '0 8px 20px rgba(234, 88, 12, 0.25)',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  buttonLoading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  },
  footer: {
    marginTop: '1.5rem',
    textAlign: 'center',
    width: '100%',
    maxWidth: '400px',
    padding: '0.5rem 0',
    background: 'none',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  backLink: {
    color: '#ea580c',
    fontWeight: 600,
    textDecoration: 'none',
    fontSize: '0.95rem',
    cursor: 'pointer',
    marginBottom: '0.5rem',
    display: 'inline-block',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    transition: 'all 0.3s ease',
  },
  backLinkHover: {
    background: 'rgba(234, 88, 12, 0.1)',
    textDecoration: 'underline',
    transform: 'translateY(-1px)',
  },
  support: {
    marginTop: '0.5rem',
    fontSize: '0.85rem',
    color: '#0891b2',
  },
  copyright: {
    marginTop: '0.5rem',
    fontSize: '0.8rem',
    color: '#64748b',
  },
};

// Hook to detect screen size and touch device
const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    isTouchDevice: typeof window !== 'undefined' ? 'ontouchstart' in window : false,
  });

  React.useEffect(() => {
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

// Responsive styles function
const getResponsiveStyles = (screenWidth, isTouchDevice = false) => {
  const isMobile = screenWidth <= 768;
  const isTablet = screenWidth > 768 && screenWidth <= 1024;
  
  return {
    page: {
      ...styles.page,
      padding: isMobile ? '1rem' : '2rem',
      minHeight: '100vh',
    },
    branding: {
      ...styles.branding,
      marginBottom: isMobile ? '1.5rem' : '2rem',
    },
    logo: {
      ...styles.logo,
      width: isMobile ? '180px' : '220px',
      height: 'auto',
      borderRadius: '0.5rem',
      objectFit: 'contain',
    },
    title: {
      ...styles.title,
      fontSize: isMobile ? '1.8rem' : '2.2rem',
      letterSpacing: isMobile ? '-0.5px' : '-1px',
      marginBottom: isMobile ? '0.5rem' : '0.25rem',
    },
    subtitle: {
      ...styles.subtitle,
      fontSize: isMobile ? '1rem' : '1.1rem',
    },
    card: {
      ...styles.card,
      maxWidth: isMobile ? '350px' : '400px',
      padding: isMobile ? '2rem 1.5rem' : '2.5rem 2rem',
      margin: isMobile ? '0 1rem' : '0',
      gap: isMobile ? '1.25rem' : '1.5rem',
    },
    label: {
      ...styles.label,
      fontSize: isMobile ? '1rem' : '1.05rem',
    },
    input: {
      ...styles.input,
      padding: isMobile ? '0.75rem 1rem 0.75rem 2.5rem' : '0.85rem 1rem 0.85rem 2.8rem',
      fontSize: isMobile ? '1rem' : '1.08rem',
      // Prevent zoom on focus for iOS devices
      ...(isMobile && isTouchDevice ? { fontSize: '16px' } : {}),
    },
    inputIcon: {
      ...styles.inputIcon,
      left: isMobile ? '0.75rem' : '1rem',
      width: isMobile ? '20px' : '22px',
      height: isMobile ? '20px' : '22px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1,
    },

    optionsRow: {
      ...styles.optionsRow,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0',
    },
    checkboxLabel: {
      ...styles.checkboxLabel,
      fontSize: isMobile ? '0.95rem' : '1rem',
    },
    forgotLink: {
      ...styles.forgotLink,
      fontSize: isMobile ? '0.9rem' : '0.95rem',
      marginLeft: isMobile ? '0' : '1rem',
    },
    error: {
      ...styles.error,
      fontSize: isMobile ? '0.95rem' : '1rem',
      padding: isMobile ? '0.75rem' : '0.5rem',
    },
    button: {
      ...styles.button,
      padding: isMobile ? '0.875rem' : '1rem',
      fontSize: isMobile ? '1.1rem' : '1.15rem',
      // Touch-friendly button size
      minHeight: isMobile ? '44px' : 'auto',
    },
    eyeButton: {
      ...styles.eyeButton,
      right: isMobile ? '0.75rem' : '1rem',
      // Touch-friendly button size
      minWidth: isMobile ? '44px' : 'auto',
      minHeight: isMobile ? '44px' : 'auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transform: 'translateY(-50%)',
    },
    footer: {
      ...styles.footer,
      maxWidth: isMobile ? '350px' : '400px',
      padding: isMobile ? '1rem 0' : '0.5rem 0',
    },
    backLink: {
      ...styles.backLink,
      fontSize: isMobile ? '0.9rem' : '0.95rem',
    },
    support: {
      ...styles.support,
      fontSize: isMobile ? '0.8rem' : '0.85rem',
    },
    copyright: {
      ...styles.copyright,
      fontSize: isMobile ? '0.75rem' : '0.8rem',
    },
  };
};

const AdminLogin = () => {
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);
  
  // Get screen size for responsive design
  const screenSize = useScreenSize();
  const responsiveStyles = getResponsiveStyles(screenSize.width, screenSize.isTouchDevice);

  // Input validation
  const isAdminIdValid = adminId.trim().length > 0 && /^[\w@.\-]+$/.test(adminId);
  const isPasswordValid = password.length >= 8;
  const isFormValid = isAdminIdValid && isPasswordValid;

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!isFormValid) {
      setError('Please enter valid credentials.');
      return;
    }
    setLoading(true);
    // TODO: Integrate with backend/Firebase authentication here
    // Never store plain passwords; always hash/encrypt before sending
    setTimeout(() => {
      setLoading(false);
      // Simulate error for demo
      setError('Invalid credentials. Please try again.');
    }, 1500);
  };

  return (
    <div style={responsiveStyles.page}>
      <div style={responsiveStyles.branding}>
        <img src={Logo} alt="PowerPulsePro Logo" style={responsiveStyles.logo} />
        <span style={responsiveStyles.subtitle}>Smart Energy Meter</span>
      </div>
      <form style={responsiveStyles.card} onSubmit={handleSubmit} aria-label="Admin Login Form">
        <div style={styles.inputWrapper}>
          <label htmlFor="adminId" style={responsiveStyles.label}>
            Admin Username
          </label>
          <div style={{ position: 'relative', width: '100%' }}>
            <span style={responsiveStyles.inputIcon}><UserIcon /></span>
            <input
              id="adminId"
              name="adminId"
              type="text"
              autoComplete="username"
              placeholder="Enter your admin username"
              style={{ ...responsiveStyles.input, ...(error && !isAdminIdValid ? styles.inputError : {}), ...(adminId && isAdminIdValid ? styles.inputFocus : {}) }}
              value={adminId}
              onChange={e => setAdminId(e.target.value)}
              onFocus={(e) => {
                e.target.style.border = '2px solid #ea580c';
                e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.1)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onBlur={(e) => {
                if (!error && !isAdminIdValid) {
                  e.target.style.border = '1px solid #d1d5db';
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
              required
              aria-required="true"
            />
          </div>
        </div>
        <div style={styles.inputWrapper}>
          <label htmlFor="password" style={responsiveStyles.label}>
            Password
          </label>
          <div style={styles.passwordWrapper}>
            <span style={responsiveStyles.inputIcon}><PasswordIcon /></span>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              style={{ ...responsiveStyles.input, ...(error && !isPasswordValid ? styles.inputError : {}), ...(password && isPasswordValid ? styles.inputFocus : {}), paddingLeft: screenSize.width <= 768 ? '2.5rem' : '2.8rem', paddingRight: screenSize.width <= 768 ? '2.25rem' : '2.5rem' }}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={(e) => {
                e.target.style.border = '2px solid #ea580c';
                e.target.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.1)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onBlur={(e) => {
                if (!error && !isPasswordValid) {
                  e.target.style.border = '1px solid #d1d5db';
                  e.target.style.boxShadow = 'none';
                  e.target.style.transform = 'translateY(0)';
                }
              }}
              minLength={8}
              required
              aria-required="true"
            />
            <button
              type="button"
              tabIndex={0}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              style={responsiveStyles.eyeButton}
              onClick={() => setShowPassword(v => !v)}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>
        </div>
        {error && (
          <div style={responsiveStyles.error} role="alert">
            {error}
          </div>
        )}
        <button
          type="submit"
          style={{ ...responsiveStyles.button, ...(buttonHovered ? styles.buttonHover : {}), ...((!isFormValid || loading) ? styles.buttonDisabled : {}) }}
          disabled={!isFormValid || loading}
          aria-disabled={!isFormValid || loading}
          onMouseEnter={() => setButtonHovered(true)}
          onMouseLeave={() => setButtonHovered(false)}
        >
          {loading ? (
            <span style={styles.buttonLoading}>
              <svg style={{ animation: 'spin 1s linear infinite', height: '20px', width: '20px', color: '#fff' }} viewBox="0 0 24 24"><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
              Logging In...
            </span>
          ) : 'Log In'}
        </button>
      </form>
      <footer style={responsiveStyles.footer}>
        <a 
          href="/" 
          style={responsiveStyles.backLink}
          onMouseOver={(e) => {
            e.target.style.background = 'rgba(234, 88, 12, 0.1)';
            e.target.style.textDecoration = 'underline';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.target.style.background = 'none';
            e.target.style.textDecoration = 'none';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          ← Back to Homepage
        </a>
        <div style={responsiveStyles.support}>
          Need help? Contact <a 
            href="mailto:powerpulsepro.smartmetering@gmail.com" 
            style={{ 
              textDecoration: 'underline', 
              color: '#ea580c', 
              fontSize: screenSize.width <= 768 ? '0.8rem' : '0.85rem',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.color = '#dc2626'}
            onMouseOut={(e) => e.target.style.color = '#ea580c'}
          >
            powerpulsepro.smartmetering@gmail.com
          </a>
        </div>
        <div style={responsiveStyles.copyright}>© 2025 PowerPulsePro. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default AdminLogin;