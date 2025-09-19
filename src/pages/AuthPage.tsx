import React, { useState } from 'react';

type Language = 'fr' | 'en' | 'mfe' | 'rcf';

interface AuthPageProps {
  onLogin: () => void;
  onRegister: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const translations = {
  fr: {
    appName: 'FOOD BAROMETERS',
    email: 'Email',
    password: 'Mot de passe',
    login: 'Se connecter',
    loginWithFacebook: 'Se connecter avec Facebook',
    loginWithGoogle: 'Se connecter avec Google',
    noAccount: "Pas encore de compte ? S'inscrire",
    languages: { fr: 'Français', en: 'English', mfe: 'Kreol Morisien', rcf: 'Kréol Rényoné' }
  },
  en: {
    appName: 'FOOD BAROMETERS',
    email: 'Email',
    password: 'Password',
    login: 'Login',
    loginWithFacebook: 'Login with Facebook',
    loginWithGoogle: 'Login with Google',
    noAccount: "Don't have an account? Register",
    languages: { fr: 'Français', en: 'English', mfe: 'Kreol Morisien', rcf: 'Kréol Rényoné' }
  },
  mfe: {
    appName: 'FOOD BAROMETERS',
    email: 'Email',
    password: 'Mo de pas',
    login: 'Konekte',
    loginWithFacebook: 'Konekte ek Facebook',
    loginWithGoogle: 'Konekte ek Google',
    noAccount: "Pa ena kont? Anrezistre",
    languages: { fr: 'Français', en: 'English', mfe: 'Kreol Morisien', rcf: 'Kréol Rényoné' }
  },
  rcf: {
    appName: 'FOOD BAROMETERS',
    email: 'Email',
    password: 'Mo de pas',
    login: 'Konèkt',
    loginWithFacebook: 'Konèkt èk Facebook',
    loginWithGoogle: 'Konèkt èk Google',
    noAccount: "Nana pa kont? Anrèjistré",
    languages: { fr: 'Français', en: 'English', mfe: 'Kreol Morisien', rcf: 'Kréol Rényoné' }
  }
};

const LanguageSelector: React.FC<{ language: Language; onLanguageChange: (lang: Language) => void }> = ({ 
  language, 
  onLanguageChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const t = translations[language];

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '8px 12px',
          border: '1px solid #ddd',
          borderRadius: '6px',
          background: 'white',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        🌐 {t.languages[language]}
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '6px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}>
          {Object.entries(t.languages).map(([code, name]) => (
            <button
              key={code}
              onClick={() => {
                onLanguageChange(code as Language);
                setIsOpen(false);
              }}
              style={{
                width: '100%',
                padding: '12px',
                border: 'none',
                background: language === code ? '#f0f0f0' : 'white',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onRegister, language, onLanguageChange }) => {
  const t = translations[language];
  
  return (
    <div className="form-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>{t.appName}</h2>
        <LanguageSelector language={language} onLanguageChange={onLanguageChange} />
      </div>
      
      <div style={{ marginBottom: '1rem' }}>
        <input 
          type="email" 
          placeholder={t.email}
          className="input-field"
        />
      </div>
      <div style={{ marginBottom: '2rem' }}>
        <input 
          type="password" 
          placeholder={t.password}
          className="input-field"
        />
      </div>
      <button className="btn btn-primary" onClick={onLogin} style={{ marginBottom: '1rem' }}>
        {t.login}
      </button>
      <button className="btn btn-secondary" style={{ marginBottom: '1rem' }}>
        📘 {t.loginWithFacebook}
      </button>
      <button className="btn btn-secondary" style={{ marginBottom: '2rem' }}>
        📧 {t.loginWithGoogle}
      </button>
      <p style={{ textAlign: 'center' }}>
        <a href="#" onClick={onRegister} style={{ color: '#667eea' }}>{t.noAccount}</a>
      </p>
    </div>
  );
};

export default AuthPage;