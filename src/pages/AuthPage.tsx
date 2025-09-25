import React, { useState } from 'react';

type Language = 'fr' | 'en' | 'mfe' | 'rcf';

interface AuthPageProps {
  onLogin: () => void;
  onRegister: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onRegister }) => {
  const [language, setLanguage] = useState<Language>('en');

  const translations = {
    fr: {
      welcome: 'Bienvenue sur FOOD BAROMETERS',
      subtitle: 'Suivez votre apport nutritionnel quotidien',
      email: 'Email',
      password: 'Mot de passe',
      login: 'Se connecter',
      loginWithFacebook: 'Se connecter avec Facebook',
      loginWithGoogle: 'Se connecter avec Google',
      noAccount: "Pas de compte ? S'inscrire",
      or: 'ou'
    },
    en: {
      welcome: 'Welcome to FOOD BAROMETERS',
      subtitle: 'Track your daily nutritional intake',
      email: 'Email',
      password: 'Password',
      login: 'Login',
      loginWithFacebook: 'Login with Facebook',
      loginWithGoogle: 'Login with Google',
      noAccount: 'No account? Register',
      or: 'or'
    },
    mfe: {
      welcome: 'Bienvini lor FOOD BAROMETERS',
      subtitle: 'Swiv to konsommasion manze',
      email: 'Email',
      password: 'Mo de pas',
      login: 'Konekte',
      loginWithFacebook: 'Konekte ek Facebook',
      loginWithGoogle: 'Konekte ek Google',
      noAccount: 'Pa ena kont? Anregistre',
      or: 'oswa'
    },
    rcf: {
      welcome: 'Bienvini dan FOOD BAROMETERS',
      subtitle: 'Gade sa ou ka manzé',
      email: 'Email',
      password: 'Kòd',
      login: 'Konekté',
      loginWithFacebook: 'Konekté ek Facebook',
      loginWithGoogle: 'Konekté ek Google',
      noAccount: 'Pa ni kont? Enskriw',
      or: 'oswa'
    }
  };

  const t = translations[language];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Main Auth Container */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        position: 'relative'
      }}>
        {/* Language Selector */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center'
          }}>
            <svg style={{ marginRight: '8px', width: '20px', height: '20px', fill: '#667eea' }} viewBox="0 0 24 24">
              <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
            </svg>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value as Language)}
              style={{ 
                background: '#f8fafc', 
                border: '2px solid #e2e8f0', 
                borderRadius: '8px', 
                color: '#2d3748', 
                padding: '8px 12px',
                fontSize: '14px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="mfe">Kreol Morisien</option>
              <option value="rcf">Kreol Réunionnais</option>
            </select>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            color: '#2d3748', 
            marginBottom: '0.5rem', 
            fontSize: '28px', 
            fontWeight: 'bold' 
          }}>
            {t.welcome}
          </h1>
          <p style={{ 
            color: '#718096', 
            fontSize: '16px',
            margin: 0
          }}>
            {t.subtitle}
          </p>
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <input 
            type="email" 
            placeholder={t.email}
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: '8px',
              border: '2px solid #e2e8f0',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              backgroundColor: '#f8fafc',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <input 
            type="password" 
            placeholder={t.password}
            style={{
              width: '100%',
              padding: '0.875rem',
              borderRadius: '8px',
              border: '2px solid #e2e8f0',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              backgroundColor: '#f8fafc',
              boxSizing: 'border-box'
            }}
          />
        </div>
        
        <button 
          className="btn btn-primary" 
          onClick={onLogin} 
          style={{
            width: '100%',
            padding: '0.875rem',
            marginBottom: '1.5rem',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
          }}
        >
          {t.login}
        </button>
        
        <div style={{ 
          textAlign: 'center', 
          margin: '1.5rem 0', 
          position: 'relative',
          color: '#a0aec0'
        }}>
          <hr style={{ border: '1px solid #e2e8f0', margin: 0 }} />
          <span style={{ 
            position: 'absolute', 
            top: '-10px', 
            left: '50%', 
            transform: 'translateX(-50%)', 
            background: 'rgba(255, 255, 255, 0.95)', 
            padding: '0 1rem',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            {t.or}
          </span>
        </div>
        
        <button className="btn btn-secondary" style={{ 
          marginBottom: '0.75rem', 
          background: '#1877f2', 
          color: 'white', 
          border: 'none', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '100%',
          padding: '0.875rem',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          <svg style={{ marginRight: '8px', width: '20px', height: '20px' }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          {t.loginWithFacebook}
        </button>
        
        <button className="btn btn-secondary" style={{ 
          marginBottom: '1.5rem', 
          background: '#db4437', 
          color: 'white', 
          border: 'none', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '100%',
          padding: '0.875rem',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          <svg style={{ marginRight: '8px', width: '20px', height: '20px' }} viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {t.loginWithGoogle}
        </button>
        
        <p style={{ 
          textAlign: 'center',
          margin: 0,
          fontSize: '14px',
          color: '#718096'
        }}>
          <a href="#" onClick={onRegister} style={{ 
            color: '#667eea', 
            textDecoration: 'none',
            fontWeight: '500'
          }}>
            {t.noAccount}
          </a>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;