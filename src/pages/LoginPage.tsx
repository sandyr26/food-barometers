import React, { useState } from 'react';

type Language = 'fr' | 'en' | 'mfe' | 'rcf';

interface LoginPageProps {
  onBack: () => void;
  onLogin: () => void;
  language: Language;
}

const translations = {
  fr: {
    title: 'Connexion',
    email: 'Adresse e-mail',
    password: 'Mot de passe',
    loginButton: 'Se connecter',
    emailPlaceholder: 'Entrez votre e-mail',
    passwordPlaceholder: 'Entrez votre mot de passe'
  },
  en: {
    title: 'Login',
    email: 'Email Address',
    password: 'Password',
    loginButton: 'Login',
    emailPlaceholder: 'Enter your email',
    passwordPlaceholder: 'Enter your password'
  },
  mfe: {
    title: 'Koneksyon',
    email: 'Adres Email',
    password: 'Mo de Pas',
    loginButton: 'Konekte',
    emailPlaceholder: 'Antre to email',
    passwordPlaceholder: 'Antre to mo de pas'
  },
  rcf: {
    title: 'Konèksyon',
    email: 'Adrès Email',
    password: 'Mo d Pas',
    loginButton: 'Konèkté',
    emailPlaceholder: 'Antre ou email',
    passwordPlaceholder: 'Antre ou mo d pas'
  }
};

const LoginPage: React.FC<LoginPageProps> = ({ onBack, onLogin, language }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically validate credentials
    // For now, just call onLogin
    onLogin();
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
      <button
        onClick={onBack}
        style={{
          position: 'absolute',
          top: '1.5rem',
          left: '1.5rem',
          background: 'rgba(51, 51, 51, 0.1)',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          fontSize: '1.5rem',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(51, 51, 51, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(51, 51, 51, 0.1)';
        }}
      >
        ←
      </button>

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

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {/* Email Field */}
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
              {t.email}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
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
              marginTop: '0.5rem'
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
            {t.loginButton}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
