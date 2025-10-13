import React from 'react';

interface AuthPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onRegister }) => {

  return (
    <div style={{
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
      {/* Title */}
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#333',
        margin: '0',
        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        Food Barometers
      </h1>

      {/* Buttons Container */}
      <div style={{
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
  );
};

export default AuthPage;
