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
      welcome: 'Bienvenue sur Food Barometers',
      subtitle: 'Votre parcours nutritionnel commence ici',
      login: 'Se connecter',
      register: "S'inscrire"
    },
    en: {
      welcome: 'Welcome to Food Barometers',
      subtitle: 'Your nutritional journey starts here',
      login: 'Login',
      register: 'Register'
    },
    mfe: {
      welcome: 'Bienvini lor Food Barometers',
      subtitle: 'To voyage nutritionnel komiense isi',
      login: 'Konekte',
      register: 'Anregistre'
    },
    rcf: {
      welcome: 'Bienvini dan Food Barometers',
      subtitle: 'Aou voyage nutritionnel komiense isi',
      login: 'Konèkté',
      register: 'Anrèjistré'
    }
  };

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
      {/* Language Selector */}
      <div style={{
        alignSelf: 'flex-end',
        marginBottom: '2rem'
      }}>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value as Language)}
          style={{ 
            background: 'white', 
            border: '2px solid #333', 
            borderRadius: '8px', 
            color: '#333', 
            padding: '8px 12px',
            fontSize: '14px',
            outline: 'none',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          <option value="en">English</option>
          <option value="fr">Français</option>
          <option value="mfe">Kreol Morisien</option>
          <option value="rcf">Kreol Réunionnais</option>
        </select>
      </div>

      {/* Welcome Section */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Logo/Icon */}
        <div style={{
          marginBottom: '2rem'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            backgroundColor: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            border: '4px solid rgba(255,255,255,0.8)',
            margin: '0 auto 2rem'
          }}>
            <div style={{
              fontSize: '3rem',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
            }}>
              🍽️
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#333',
            margin: '0 0 1rem 0',
            lineHeight: '1.2',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {t.welcome}
          </h1>
          <p style={{
            fontSize: '1.1rem',
            color: '#555',
            margin: '0 0 3rem 0',
            fontWeight: '500'
          }}>
            {t.subtitle}
          </p>
        </div>
      </div>

      {/* Buttons Section */}
      <div style={{
        width: '100%',
        maxWidth: '300px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
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
          {t.login}
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
          {t.register}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;