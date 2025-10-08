import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../assets/Logo.jpg';
import HeroSectionImg from '../assets/HeroSectionImg.jpg';

const Homepage = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const styles = {
    container: {
      minHeight: '100vh',
      background: `
        linear-gradient(135deg, #fef7f0 0%, #f0f9ff 50%, #ecfeff 100%),
        radial-gradient(circle at 30% 20%, rgba(234, 88, 12, 0.03) 0%, transparent 60%),
        radial-gradient(circle at 70% 80%, rgba(8, 145, 178, 0.03) 0%, transparent 60%)
      `,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    },
    header: {
      background: 'rgba(255, 255, 255, 0.95)',
      boxShadow: '0 4px 20px 0 rgba(234, 88, 12, 0.2)',
      borderBottom: '2px solid #ea580c',
      backdropFilter: 'blur(20px)',
    },
    nav: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    logoImage: {
      height: '60px',
      width: 'auto',
      objectFit: 'contain',
    },
    logoImageMobile: {
      height: '48px',
      width: 'auto',
      objectFit: 'contain',
    },
    logoImageFooter: {
      height: '30px',
      width: 'auto',
      objectFit: 'contain',
      marginBottom: '1rem',
    },
    logoIcon: {
      width: '2.5rem',
      height: '2.5rem',
      backgroundColor: '#2563eb',
      borderRadius: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 'bold',
      fontSize: '1.125rem',
    },
    logoText: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#111827',
      margin: 0,
    },
    navLinks: {
      display: 'flex',
      gap: '1.5rem',
    },
    navLinksMobile: {
      display: 'none',
    },
    navLink: {
      color: '#64748b',
      textDecoration: 'none',
      transition: 'color 0.3s ease',
      fontWeight: '500',
      fontSize: '0.95rem',
    },
    hero: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '4rem 2rem',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '3rem',
      alignItems: 'center',
    },
    heroMobile: {
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '2rem 1rem',
      display: 'block',
      textAlign: 'center',
    },
    heroContent: {
      padding: 0,
    },
    heroContentMobile: {
      padding: 0,
      marginBottom: '2rem',
    },
    heroTitle: {
      fontSize: '3.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1.5rem',
      lineHeight: '1.1',
    },
    heroTitleMobile: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1.5rem',
      lineHeight: '1.1',
    },
    heroTitleTablet: {
      fontSize: '3rem',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '1.5rem',
      lineHeight: '1.1',
    },
    heroSubtitle: {
      color: '#ea580c',
      display: 'block',
      fontWeight: '600',
    },
    heroDescription: {
      fontSize: '1.25rem',
      color: '#374151',
      marginBottom: '2rem',
      lineHeight: '1.6',
    },
    heroDescriptionMobile: {
      fontSize: '1rem',
      color: '#374151',
      marginBottom: '2rem',
      lineHeight: '1.6',
    },
    buttonGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      marginBottom: '2rem',
    },
    buttonGroupMobile: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      marginBottom: '1.5rem',
    },
    buttonGroupTablet: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: '1rem',
      marginBottom: '2rem',
      justifyContent: 'center',
    },
    buttonPrimary: {
      background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
      color: '#ea580c',
      padding: '1rem 2rem',
      borderRadius: '0.75rem',
      border: '2px solid #ffffff',
      fontSize: '1rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 20px rgba(255, 255, 255, 0.3)',
    },
    buttonSecondary: {
      background: 'linear-gradient(135deg, #ffffff, #f0f9ff)',
      color: '#0891b2',
      padding: '1rem 2rem',
      borderRadius: '0.75rem',
      border: '2px solid #ffffff',
      fontSize: '1rem',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 8px 20px rgba(255, 255, 255, 0.3)',
    },
    buttonOutline: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#ffffff',
      padding: '1rem 2rem',
      borderRadius: '0.75rem',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      backdropFilter: 'blur(10px)',
    },
    badge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '0.5rem 1rem',
      background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
      color: '#ffffff',
      borderRadius: '9999px',
      fontSize: '0.875rem',
      fontWeight: '700',
      border: '1px solid #ffffff',
      boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)',
    },
    badgeDot: {
      width: '0.5rem',
      height: '0.5rem',
      backgroundColor: '#ffffff',
      borderRadius: '50%',
      marginRight: '0.5rem',
      boxShadow: '0 0 4px rgba(255, 255, 255, 0.8)',
    },
    heroImage: {
      position: 'relative',
    },
    imageContainer: {
      background: 'linear-gradient(135deg, #ea580c, #0891b2)',
      borderRadius: '1.5rem',
      padding: '2rem',
      boxShadow: '0 25px 50px -12px rgba(234, 88, 12, 0.25)',
    },
    placeholderImage: {
      width: '100%',
      height: '380px',
      borderRadius: '1rem',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
      objectFit: 'cover',
    },
    placeholderImageTablet: {
      width: '100%',
      height: '320px',
      borderRadius: '1rem',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
      objectFit: 'cover',
    },
    placeholderImageMobile: {
      width: '100%',
      height: '240px',
      borderRadius: '1rem',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
      objectFit: 'cover',
    },
    section: {
      background: 'rgba(255, 255, 255, 0.05)',
      padding: '4rem 2rem',
      backdropFilter: 'blur(25px)',
    },
    sectionMobile: {
      background: 'rgba(255, 255, 255, 0.05)',
      padding: '2rem 1rem',
      backdropFilter: 'blur(25px)',
    },
    sectionGray: {
      background: 'rgba(255, 255, 255, 0.1)',
      padding: '4rem 2rem',
      backdropFilter: 'blur(20px)',
    },
    sectionGrayMobile: {
      background: 'rgba(255, 255, 255, 0.1)',
      padding: '2rem 1rem',
      backdropFilter: 'blur(20px)',
    },
    sectionBlue: {
      background: 'linear-gradient(135deg, #0891b2, #0e7490)',
      padding: '2rem 1rem', // reduced from 4rem 2rem
    },
    sectionBlueMobile: {
      background: 'linear-gradient(135deg, #0891b2, #0e7490)',
      padding: '1rem 0.5rem', // reduced from 2rem 1rem
    },
    sectionContainer: {
      maxWidth: '1280px',
      margin: '0 auto',
    },
    sectionTitle: {
      textAlign: 'center',
      marginBottom: '2rem', // reduced from 4rem to decrease section height
    },
    sectionTitleText: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#ea580c',
      marginBottom: '1rem',
      marginTop: 0,
      textShadow: '1px 1px 2px rgba(234, 88, 12, 0.2)',
    },
    sectionTitleTextWhite: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#ea580c', // keep theme orange
      marginBottom: '1rem',
      marginTop: 0,
      textShadow: '1px 1px 2px rgba(234, 88, 12, 0.12)',
      paddingTop: 0,
    },
    sectionDescription: {
      fontSize: '1.25rem',
      color: '#0891b2',
      maxWidth: '32rem',
      margin: '0 auto',
      fontWeight: '500',
    },
    sectionDescriptionBlue: {
      fontSize: '1.25rem',
      color: '#bfdbfe',
      maxWidth: '32rem',
      margin: '0 auto',
      paddingTop: 0,
      paddingBottom: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
    },
    gridMobile: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1.5rem',
    },
    gridTablet: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1.5rem',
    },
    gridThree: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '2rem',
    },
    gridThreeMobile: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1.5rem',
    },
    gridThreeTablet: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1.5rem',
    },
    card: {
      backgroundColor: '#ffffff',
      padding: '2rem',
      borderRadius: '1rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.3s ease',
      border: '1px solid #f1f5f9',
    },
    cardIcon: {
      width: '3rem',
      height: '3rem',
      borderRadius: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1.5rem',
      fontSize: '1.5rem',
    },
    cardTitle: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#ea580c',
      marginBottom: '0.75rem',
    },
    cardText: {
      color: '#0891b2',
      lineHeight: '1.6',
      fontWeight: '500',
    },
    stepCard: {
      position: 'relative',
      backgroundColor: '#ffffff',
      padding: '2rem',
      borderRadius: '1rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      textAlign: 'center',
      border: '1px solid #f1f5f9',
      transition: 'all 0.3s ease',
    },
    stepIcon: {
      width: '4rem',
      height: '4rem',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1.5rem',
      color: 'white',
      fontSize: '1.5rem',
      fontWeight: 'bold',
      boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
    },
    statCard: {
      textAlign: 'center',
    },
    statNumber: {
      fontSize: '3rem',
      fontWeight: 'bold',
      color: '#ffffff',
      marginBottom: '0.5rem',
    },
    statLabel: {
      color: '#bfdbfe',
      fontSize: '1.125rem',
    },
    footer: {
      backgroundColor: '#0f172a',
      color: '#ffffff',
      padding: '3rem 2rem',
    },
    footerMobile: {
      backgroundColor: '#0f172a',
      color: '#ffffff',
      padding: '2rem 1rem',
    },
    footerGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '2rem',
      marginBottom: '2rem',
    },
    footerGridMobile: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    footerTitle: {
      fontSize: '1.125rem',
      fontWeight: '600',
      marginBottom: '1rem',
    },
    footerText: {
      color: '#9ca3af',
      fontSize: '0.875rem',
      marginBottom: '0.5rem',
    },
    footerLink: {
      color: '#9ca3af',
      textDecoration: 'none',
      fontSize: '0.875rem',
      display: 'block',
      marginBottom: '0.5rem',
      transition: 'color 0.2s',
    },
    footerBottom: {
      borderTop: '1px solid #374151',
      paddingTop: '2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '1rem',
    },
    // Media queries simulation through component state
    '@media (max-width: 768px)': {
      hero: {
        gridTemplateColumns: '1fr',
        textAlign: 'center',
      },
      heroTitle: {
        fontSize: '2.5rem',
      },
      buttonGroup: {
        flexDirection: 'column',
      },
      navLinks: {
        display: 'none',
      },
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <nav style={styles.nav}>
          <div style={styles.logo}>
            <img 
              src={Logo} 
              alt="PowerPulsePro Smart Energy Meter Logo"
              style={isMobile ? styles.logoImageMobile : styles.logoImage}
            />
          </div>
          <div style={isMobile ? styles.navLinksMobile : styles.navLinks}>
            <a 
              href="#features" 
              style={styles.navLink}
              onMouseOver={(e) => e.target.style.color = '#ea580c'}
              onMouseOut={(e) => e.target.style.color = '#64748b'}
            >
              Features
            </a>
            <a 
              href="#how-it-works" 
              style={styles.navLink}
              onMouseOver={(e) => e.target.style.color = '#0891b2'}
              onMouseOut={(e) => e.target.style.color = '#64748b'}
            >
              How It Works
            </a>
            <a 
              href="#contact" 
              style={styles.navLink}
              onMouseOver={(e) => e.target.style.color = '#ea580c'}
              onMouseOut={(e) => e.target.style.color = '#64748b'}
            >
              Contact
            </a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={isMobile ? styles.heroMobile : styles.hero}>
        <div style={isMobile ? styles.heroContentMobile : styles.heroContent}>
          <h1 style={isMobile ? styles.heroTitleMobile : isTablet ? styles.heroTitleTablet : styles.heroTitle}>
            PowerPulsePro
            <span style={styles.heroSubtitle}>Smart Energy Meter</span>
          </h1>
          <p style={isMobile ? styles.heroDescriptionMobile : styles.heroDescription}>
            Accurate, Real-Time IoT Energy Monitoring and Tamper Detection
          </p>
          <div style={isMobile ? styles.buttonGroupMobile : isTablet ? styles.buttonGroupTablet : styles.buttonGroup}>
            <button 
              style={styles.buttonPrimary}
              aria-label="Consumer Login"
              onClick={() => navigate('/consumer-login')}
              onMouseOver={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #ea580c, #dc2626)';
                e.target.style.color = '#ffffff';
                e.target.style.transform = 'translateY(-3px) scale(1.05)';
                e.target.style.boxShadow = '0 4px 12px rgba(234, 88, 12, 0.18)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #ffffff, #f8fafc)';
                e.target.style.color = '#ea580c';
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 2px 6px rgba(234, 88, 12, 0.10)';
              }}
            >
              Consumer Login
            </button>
            <button 
              style={styles.buttonSecondary}
              aria-label="Admin Login"
              onClick={() => navigate('/admin-login')}
              onMouseOver={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #0891b2, #0e7490)';
                e.target.style.color = '#ffffff';
                e.target.style.transform = 'translateY(-3px) scale(1.05)';
                e.target.style.boxShadow = '0 4px 12px rgba(8, 145, 178, 0.18)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #ffffff, #f0f9ff)';
                e.target.style.color = '#0891b2';
                e.target.style.transform = 'translateY(0) scale(1)';
                e.target.style.boxShadow = '0 2px 6px rgba(8, 145, 178, 0.10)';
              }}
            >
              Admin Login
            </button>
            </div>
        </div>
        <div style={styles.heroImage}>
          <div style={styles.imageContainer}>
            <img 
              src={HeroSectionImg}
              alt="PowerPulsePro Smart Meter Hardware"
              style={{
                width: '100%',
                maxHeight: isMobile ? '240px' : isTablet ? '320px' : '380px',
                borderRadius: '1rem',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                objectFit: 'contain',
                background: '#f3f4f6',
                display: 'block',
                margin: '0 auto',
                height: isMobile ? '240px' : isTablet ? '320px' : '380px',
                verticalAlign: 'middle',
              }}
            />
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="features" style={isMobile ? styles.sectionGrayMobile : styles.sectionGray}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionTitle}>
            <h2 style={styles.sectionTitleText}>Key Features</h2>
            <p style={styles.sectionDescription}>
              Comprehensive energy monitoring solution with advanced IoT capabilities
            </p>
          </div>
          
          <div style={isMobile ? styles.gridMobile : isTablet ? styles.gridTablet : styles.grid}>
            <div 
              style={styles.card}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px -4px rgba(0, 0, 0, 0.12)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
              }}
            >
              <div style={{...styles.cardIcon, backgroundColor: '#ecfdf5'}}>
                <span style={{color: '#0891b2'}}>📊</span>
              </div>
              <h3 style={styles.cardTitle}>Real-time Energy Monitoring</h3>
              <p style={styles.cardText}>
                Monitor electricity consumption in real-time with precise measurements and instant updates.
              </p>
            </div>

            <div 
              style={styles.card}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px -4px rgba(0, 0, 0, 0.12)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
              }}
            >
              <div style={{...styles.cardIcon, backgroundColor: '#f0f9ff'}}>
                <span style={{color: '#0891b2'}}>☁️</span>
              </div>
              <h3 style={styles.cardTitle}>Firebase Cloud Integration</h3>
              <p style={styles.cardText}>
                Secure cloud storage and synchronization with Firebase for reliable data management.
              </p>
            </div>

            <div 
              style={styles.card}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px -4px rgba(234, 88, 12, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
              }}
            >
              <div style={{...styles.cardIcon, backgroundColor: '#fff7ed'}}>
                <span style={{color: '#ea580c'}}>🚨</span>
              </div>
              <h3 style={styles.cardTitle}>Tamper Alerts</h3>
              <p style={styles.cardText}>
                Advanced tamper detection system with instant notifications for security breaches.
              </p>
            </div>

            <div 
              style={styles.card}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px -4px rgba(0, 0, 0, 0.12)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
              }}
            >
              <div style={{...styles.cardIcon, backgroundColor: '#ecfdf5'}}>
                <span style={{color: '#0891b2'}}>📱</span>
              </div>
              <h3 style={styles.cardTitle}>Web/Mobile Dashboard</h3>
              <p style={styles.cardText}>
                Responsive dashboard accessible on all devices for convenient monitoring anywhere.
              </p>
            </div>

            <div 
              style={styles.card}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px -4px rgba(234, 88, 12, 0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
              }}
            >
              <div style={{...styles.cardIcon, backgroundColor: '#fff7ed'}}>
                <span style={{color: '#ea580c'}}>📈</span>
              </div>
              <h3 style={styles.cardTitle}>Historical Analysis</h3>
              <p style={styles.cardText}>
                Comprehensive historical data analysis with trends, patterns, and insights.
              </p>
            </div>

            <div 
              style={styles.card}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px -4px rgba(0, 0, 0, 0.12)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
              }}
            >
              <div style={{...styles.cardIcon, backgroundColor: '#f0f9ff'}}>
                <span style={{color: '#0891b2'}}>💾</span>
              </div>
              <h3 style={styles.cardTitle}>Data Export</h3>
              <p style={styles.cardText}>
                Export energy data in multiple formats for reporting and external analysis.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={isMobile ? styles.sectionMobile : styles.section}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionTitle}>
            <h2 style={styles.sectionTitleText}>How It Works</h2>
            <p style={styles.sectionDescription}>
              Simple three-step process for comprehensive energy monitoring
            </p>
          </div>

          <div style={isMobile ? styles.gridThreeMobile : isTablet ? styles.gridThreeTablet : styles.gridThree}>
            <div 
              style={styles.stepCard}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 16px 32px -8px rgba(234, 88, 12, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
              }}
            >
              <div style={{...styles.stepIcon, backgroundColor: '#ea580c'}}>
                <span>⚡</span>
              </div>
              <h3 style={styles.cardTitle}>Smart Meter Collection</h3>
              <p style={styles.cardText}>
                IoT-enabled smart meter collects real-time energy consumption data with high precision sensors.
              </p>
            </div>

            <div 
              style={styles.stepCard}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 16px 32px -8px rgba(8, 145, 178, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
              }}
            >
              <div style={{...styles.stepIcon, backgroundColor: '#0891b2'}}>
                <span>☁️</span>
              </div>
              <h3 style={styles.cardTitle}>Cloud Processing</h3>
              <p style={styles.cardText}>
                Data is securely transmitted to Firebase cloud for processing, storage, and analysis.
              </p>
            </div>

            <div 
              style={styles.stepCard}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-6px)';
                e.currentTarget.style.boxShadow = '0 16px 32px -8px rgba(14, 116, 144, 0.2)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
              }}
            >
              <div style={{...styles.stepIcon, backgroundColor: '#0e7490'}}>
                <span>📊</span>
              </div>
              <h3 style={styles.cardTitle}>Dashboard & Alerts</h3>
              <p style={styles.cardText}>
                Real-time dashboard displays insights, analytics, and sends instant tamper alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Project Stats */}
      <section style={isMobile ? styles.sectionBlueMobile : styles.sectionBlue}>
        <div style={styles.sectionContainer}>
          <div style={styles.sectionTitle}>
            <h2 style={styles.sectionTitleTextWhite}>Project Excellence</h2>
            <p style={styles.sectionDescriptionBlue}>
              Delivering accurate and reliable energy monitoring solutions
            </p>
          </div>
          
          <div style={isMobile ? styles.gridThreeMobile : isTablet ? styles.gridThreeTablet : styles.gridThree}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>99.5%</div>
              <div style={styles.statLabel}>Accuracy Rate</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>&lt;1s</div>
              <div style={styles.statLabel}>Response Time</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>24/7</div>
              <div style={styles.statLabel}>Monitoring</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" style={isMobile ? styles.footerMobile : styles.footer}>
        <div style={styles.sectionContainer}>
          <div style={isMobile ? styles.footerGridMobile : styles.footerGrid}>
            <div>
              <img 
                src={Logo} 
                alt="PowerPulsePro Smart Energy Meter Logo"
                style={styles.logoImageFooter}
              />
              <p style={{...styles.footerText, marginBottom: '1rem'}}>
                Smart Energy Meter with IoT Integration and Tamper Detection
              </p>
              <div style={styles.badge}>
                Innovation-2k25
              </div>
            </div>

            <div>
              <h4 style={styles.footerTitle}>Institution</h4>
              <p style={styles.footerText}>
                Bharati Vidyapeeth College of Engineering, Pune
              </p>
              <p style={styles.footerText}>
                Department of Electrical & Computer Engineering
              </p>
            </div>

            <div>
              <h4 style={styles.footerTitle}>Project Team</h4>
              <p style={styles.footerText}>
                Students: Aaditya Vijay Ghanwat, Aditya Atul Bhongale, Om Sudam Dalavi, Vishvajit Rajendra Pawar
              </p>
              <p style={styles.footerText}>
                Guide: Mr. Swapnil A. Namekar
              </p>
            </div>

            <div>
              <h4 style={styles.footerTitle}>Contact</h4>
              <a 
                href="mailto:powerpulsepro.smartmetering@gmail.com" 
                style={styles.footerLink}
                onMouseOver={(e) => e.target.style.color = '#ffffff'}
                onMouseOut={(e) => e.target.style.color = '#9ca3af'}
              >
                powerpulsepro.smartmetering@gmail.com
              </a>
              <a 
                href="#" 
                style={styles.footerLink}
                aria-label="Project Documentation"
                onMouseOver={(e) => e.target.style.color = '#ffffff'}
                onMouseOut={(e) => e.target.style.color = '#9ca3af'}
              >
                Documentation
              </a>
              <a 
                href="#" 
                style={styles.footerLink}
                aria-label="GitHub Repository"
                onMouseOver={(e) => e.target.style.color = '#ffffff'}
                onMouseOut={(e) => e.target.style.color = '#9ca3af'}
              >
                GitHub Repository
              </a>
            </div>
          </div>

          <div style={styles.footerBottom}>
            <p style={styles.footerText}>
              © 2025 PowerPulsePro Smart Energy Meter. All rights reserved.
            </p>
            <div style={{display: 'flex', gap: '1.5rem'}}>
              <a 
                href="#" 
                style={styles.footerLink}
                aria-label="Privacy Policy"
                onMouseOver={(e) => e.target.style.color = '#ffffff'}
                onMouseOut={(e) => e.target.style.color = '#9ca3af'}
              >
                Privacy Policy
              </a>
              <a 
                href="#" 
                style={styles.footerLink}
                aria-label="Terms of Service"
                onMouseOver={(e) => e.target.style.color = '#ffffff'}
                onMouseOut={(e) => e.target.style.color = '#9ca3af'}
              >
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;