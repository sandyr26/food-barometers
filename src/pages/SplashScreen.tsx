import React from 'react';
import logo from '../assets/logo.png';

interface SplashScreenProps {
  onComplete: () => void;
  language: 'fr' | 'en' | 'mfe' | 'rcf';
}

const translations = {
  fr: { 
    welcome: 'Bienvenue à Food Barometer',
    connectButton: 'Se connecter'
  },
  en: { 
    welcome: 'Welcome to Food Barometer',
    connectButton: 'Connect'
  },
  mfe: { 
    welcome: 'Byenvini dan Food Barometer',
    connectButton: 'Konekte'
  },
  rcf: { 
    welcome: 'Byenvini dan Food Barometer',
    connectButton: 'Konèkté'
  }
};

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, language }) => {
  const t = translations[language];

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#ffc000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '3rem 2rem',
      textAlign: 'center'
    }}>
      {/* Welcome Text */}
      <div style={{
        marginTop: '2rem'
      }}>
        <h1 style={{
          fontSize: '2.2rem',
          fontWeight: '700',
          color: '#333',
          margin: 0,
          lineHeight: '1.2',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {t.welcome}
        </h1>
      </div>

      {/* Picture in the middle */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '2rem 0'
      }}>
        <div style={{
          width: '200px',
          height: '200px',
          backgroundColor: 'white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          border: '4px solid rgba(255,255,255,0.8)'
        }}>
          <img src={logo} alt="Logo" style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover'
          }} />
        </div>
      </div>

      {/* Se connecter Button */}
      <button
        onClick={onComplete}
        style={{
          backgroundColor: '#333',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          padding: '1rem 2.5rem',
          fontSize: '1.1rem',
          fontWeight: '600',
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease',
          minWidth: '200px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#555';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#333';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
        }}
      >
        {t.connectButton}
      </button>
    </div>
  );
};

export default SplashScreen;