import React, { useEffect, useState } from 'react';
import logo from '../assets/LOGO.png';

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
  const [isVisible, setIsVisible] = useState(false);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Trigger entrance animations
    const timer1 = setTimeout(() => setIsVisible(true), 100);
    const timer2 = setTimeout(() => setShowButton(true), 1500);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  return (
    <>
      {/* CSS Keyframes */}
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              box-shadow: 0 8px 32px rgba(0,0,0,0.15);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 12px 40px rgba(0,0,0,0.25);
            }
          }
          
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          
          @keyframes slideInUp {
            from {
              opacity: 0;
              transform: translateY(50px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes backgroundGradient {
            0% {
              background: linear-gradient(45deg, #ffc000, #ffb000);
            }
            25% {
              background: linear-gradient(45deg, #ffb000, #ffa000);
            }
            50% {
              background: linear-gradient(45deg, #ffa000, #ff9000);
            }
            75% {
              background: linear-gradient(45deg, #ff9000, #ffa000);
            }
            100% {
              background: linear-gradient(45deg, #ffa000, #ffc000);
            }
          }
        `}
      </style>
      
      <div style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#ffc000',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '3rem 2rem',
        textAlign: 'center',
        overflow: 'hidden'
      }}>
        {/* Welcome Text */}
        <div style={{
          marginTop: '2rem',
          opacity: isVisible ? 1 : 0,
          animation: isVisible ? 'fadeInUp 1s ease-out forwards' : 'none',
          animationDelay: '0.2s'
        }}>
          <h1 style={{
            fontSize: '2.2rem',
            fontWeight: '700',
            color: '#333',
            margin: 0,
            lineHeight: '1.2',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            background: 'linear-gradient(45deg, #333, #555)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
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
          margin: '2rem 0',
          opacity: isVisible ? 1 : 0,
          animation: isVisible ? 'fadeInScale 1.2s ease-out forwards' : 'none',
          animationDelay: '0.6s'
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
            border: '4px solid rgba(255,255,255,0.8)',
            position: 'relative'
          }}>
            {/* Animated rings around logo */}
            <div style={{
              position: 'absolute',
              width: '220px',
              height: '220px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '50%'
            }} />
            <div style={{
              position: 'absolute',
              width: '240px',
              height: '240px',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '50%'
            }} />
            
            <img src={logo} alt="Logo" style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
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
            minWidth: '200px',
            opacity: showButton ? 1 : 0,
            animation: showButton ? 'slideInUp 0.8s ease-out forwards' : 'none',
            transform: showButton ? 'translateY(0)' : 'translateY(30px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#555';
            e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#333';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
          }}
        >
          {t.connectButton}
        </button>
      </div>
    </>
  );
};

export default SplashScreen;