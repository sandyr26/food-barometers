import React, { useState } from 'react';
import logo from '../assets/LOGO.png';

interface AdminLoginPageProps {
  onLogin: () => void;
  onBack: () => void;
}

const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onLogin, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simple admin credentials validation
    if (username === 'admin' && password === 'admin123') {
      setTimeout(() => {
        setIsLoading(false);
        onLogin();
      }, 1000);
    } else {
      setTimeout(() => {
        setIsLoading(false);
        setError('Invalid username or password');
      }, 1000);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      textAlign: 'center',
      gap: '2rem'
    }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          position: 'absolute',
          top: '2rem',
          left: '2rem',
          backgroundColor: 'transparent',
          color: '#ffc000',
          border: '2px solid #ffc000',
          borderRadius: '8px',
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#ffc000';
          e.currentTarget.style.color = '#1a1a1a';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#ffc000';
        }}
      >
        ← Back
      </button>

      {/* Logo */}
      <div style={{
        width: '120px',
        height: '120px',
        backgroundColor: 'white',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 32px rgba(255,192,0,0.3)',
        border: '4px solid rgba(255,192,0,0.5)'
      }}>
        <img src={logo} alt="Logo" style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          objectFit: 'cover'
        }} />
      </div>

      {/* Title */}
      <div>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#ffc000',
          margin: '0 0 0.5rem 0',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)'
        }}>
          Admin Dashboard
        </h1>
        <p style={{
          fontSize: '1rem',
          color: '#ccc',
          margin: 0
        }}>
          Sign in to access analytics and reports
        </p>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} style={{
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        <div>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              border: '2px solid #333',
              borderRadius: '8px',
              backgroundColor: '#2a2a2a',
              color: '#fff',
              outline: 'none',
              transition: 'border-color 0.3s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#ffc000';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#333';
            }}
          />
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '1rem',
              fontSize: '1rem',
              border: '2px solid #333',
              borderRadius: '8px',
              backgroundColor: '#2a2a2a',
              color: '#fff',
              outline: 'none',
              transition: 'border-color 0.3s ease',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#ffc000';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = '#333';
            }}
          />
        </div>

        {error && (
          <div style={{
            color: '#ff4444',
            fontSize: '0.9rem',
            textAlign: 'center',
            padding: '0.5rem',
            backgroundColor: 'rgba(255, 68, 68, 0.1)',
            borderRadius: '4px',
            border: '1px solid rgba(255, 68, 68, 0.3)'
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          style={{
            backgroundColor: isLoading ? '#666' : '#ffc000',
            color: '#1a1a1a',
            border: 'none',
            borderRadius: '8px',
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            boxShadow: '0 6px 20px rgba(255,192,0,0.3)',
            transition: 'all 0.3s ease',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = '#ffcc33';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(255,192,0,0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = '#ffc000';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(255,192,0,0.3)';
            }
          }}
        >
          {isLoading && (
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #1a1a1a',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          )}
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      {/* Demo credentials info */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: 'rgba(255,192,0,0.1)',
        borderRadius: '8px',
        border: '1px solid rgba(255,192,0,0.3)',
        fontSize: '0.9rem',
        color: '#ffc000'
      }}>
        <strong>Demo Credentials:</strong><br />
        Username: admin<br />
        Password: admin123
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default AdminLoginPage;