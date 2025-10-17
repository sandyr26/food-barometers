import React, { useState, useEffect } from 'react';
import logo from '../assets/LOGO.png';

interface AuthPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onRegister }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style>
        {`
          @keyframes authFadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes authFadeInScale {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes authSlideInUp {
            from {
              opacity: 0;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .auth-container {
            animation: ${isVisible ? 'authFadeInUp 0.8s ease-out' : 'none'};
          }

          .auth-logo {
            animation: ${isVisible ? 'authFadeInScale 1s ease-out 0.3s both' : 'none'};
          }

          .auth-title {
            animation: ${isVisible ? 'authFadeInUp 0.8s ease-out 0.6s both' : 'none'};
          }

          .auth-buttons {
            animation: ${isVisible ? 'authSlideInUp 0.8s ease-out 0.9s both' : 'none'};
          }
        `}
      </style>
      <div className="auth-container" style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#ffc000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      gap: '2rem'
    }}>
      {/* Logo */}
      <div className="auth-logo" style={{
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

      {/* Title */}
      <h1 className="auth-title" style={{
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#333',
        margin: '0',
        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        Food Barometer
      </h1>

      {/* Buttons Container */}
      <div className="auth-buttons" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '100%',
        maxWidth: '300px'
      }}>
        {/* Login Button */}
        <button
          onClick={onLogin}
          style={{
            backgroundColor: '#333',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
            width: '100%'
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
          Login
        </button>

        {/* Register Button */}
        <button
          onClick={onRegister}
          style={{
            backgroundColor: 'white',
            color: '#333',
            border: '2px solid #333',
            borderRadius: '25px',
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
            width: '100%'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#333';
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.color = '#333';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
          }}
        >
          Register
        </button>
      </div>
      </div>
    </>
  );
};

export default AuthPage;
