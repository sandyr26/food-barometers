import React, { useState } from 'react';
import axios from 'axios';
import BackButton from '../components/BackButton';

type Language = 'fr' | 'en' | 'mfe' | 'rcf';

interface LoginPageProps {
  onBack: () => void;
  onLogin: (token: string) => void;
  language: Language;
}

const translations = {
  fr: {
    title: 'Connexion',
    username: 'Nom d\'utilisateur',
    password: 'Mot de passe',
    loginButton: 'Se connecter',
    usernamePlaceholder: 'Entrez votre nom d\'utilisateur',
    passwordPlaceholder: 'Entrez votre mot de passe'
  },
  en: {
    title: 'Login',
    username: 'Username',
    password: 'Password',
    loginButton: 'Login',
    usernamePlaceholder: 'Enter your username',
    passwordPlaceholder: 'Enter your password'
  },
  mfe: {
    title: 'Koneksyon',
    username: 'Non Itilizatè',
    password: 'Mo de Pas',
    loginButton: 'Konekte',
    usernamePlaceholder: 'Antre to non itilizatè',
    passwordPlaceholder: 'Antre to mo de pas'
  },
  rcf: {
    title: 'Konèksyon',
    username: 'Non Itilizatè',
    password: 'Mo d Pas',
    loginButton: 'Konèkté',
    usernamePlaceholder: 'Antre ou non itilizatè',
    passwordPlaceholder: 'Antre ou mo d pas'
  }
};

const LoginPage: React.FC<LoginPageProps> = ({ onBack, onLogin, language }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password
      });

      if (response.data.success) {
        // Store token in localStorage
        localStorage.setItem('authToken', response.data.token);
        // Call onLogin with token so App.tsx can store it
        onLogin(response.data.token);
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError('Invalid username or password');
      } else if (axios.isAxiosError(err)) {
        setError('Network error. Please check the server.');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

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
      position: 'relative'
    }}>
      {/* Back Button */}
      <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem' }}>
        <BackButton onClick={onBack} />
      </div>

      {/* Login Form Container */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        padding: '2.5rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        width: '100%',
        maxWidth: '400px'
      }}>
        {/* Title */}
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '700',
          color: '#333',
          margin: '0 0 2rem 0',
          textAlign: 'center'
        }}>
          {t.title}
        </h1>

        {/* Error Message */}
        {error && (
          <div style={{
            backgroundColor: '#ffebee',
            color: '#c62828',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            fontSize: '0.9rem',
            textAlign: 'center',
            border: '1px solid #ef5350'
          }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {/* Username Field */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <label style={{
              fontSize: '0.95rem',
              fontWeight: '600',
              color: '#333'
            }}>
              {t.username}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t.usernamePlaceholder}
              required
              style={{
                padding: '0.875rem',
                fontSize: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                outline: 'none',
                transition: 'border-color 0.3s ease',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#ffc000';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }}
            />
          </div>

          {/* Password Field */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <label style={{
              fontSize: '0.95rem',
              fontWeight: '600',
              color: '#333'
            }}>
              {t.password}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t.passwordPlaceholder}
              required
              style={{
                padding: '0.875rem',
                fontSize: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                outline: 'none',
                transition: 'border-color 0.3s ease',
                fontFamily: 'inherit'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#ffc000';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
              }}
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? '#999' : '#333',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease',
              marginTop: '0.5rem',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#555';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.25)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.backgroundColor = '#333';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
              }
            }}
          >
            {loading ? 'Logging in...' : t.loginButton}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
