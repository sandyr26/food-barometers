import React from "react";
import logo from '../assets/LOGO.png';

type Language = "fr" | "en" | "mfe" | "rcf";
type Page =
  | "splash"
  | "auth"
  | "register"
  | "home"
  | "addMeal"
  | "profile"
  | "notifications"
  | "calendar"
  | "comingSoon";

interface HomePageProps {
  language: Language;
  onNavigate: (page: Page) => void;
}

const translations = {
  fr: {
    welcome: "Bienvenue sur FOOD BAROMETER",
    recurrentSurvey: "Enquête récurrente",
    focus: "Focus"
  },
  en: {
    welcome: "Welcome to FOOD BAROMETER",
    recurrentSurvey: "Recurrent Survey",
    focus: "Focus"
  },
  mfe: {
    welcome: "Byenvini lor FOOD BAROMETER",
    recurrentSurvey: "Ankyet Rekirant",
    focus: "Fokis"
  },
  rcf: {
    welcome: "Byenvini lor FOOD BAROMETER",
    recurrentSurvey: "Ankèt Rékiran",
    focus: "Fokis"
  }
};

const HomePage: React.FC<HomePageProps> = ({
  language,
  onNavigate,
}) => {
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
      textAlign: 'center',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0
    }}>
      {/* Welcome Section */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {/* Logo */}
        <div style={{
          marginBottom: '2rem'
        }}>
          {/* Logo container */}
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
            margin: '0 auto',
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

        {/* Welcome Text */}
        <div>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: '#333',
            margin: '0 0 3rem 0',
            lineHeight: '1.2',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {t.welcome}
          </h1>
        </div>
      </div>

      {/* Buttons Section */}
      <div style={{
        width: '100%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        {/* Enquête récurrente Button */}
        <button
          onClick={() => onNavigate('addMeal')}
          style={{
            backgroundColor: '#333',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            padding: '1.2rem 2rem',
            fontSize: '1.2rem',
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
          {t.recurrentSurvey}
        </button>

        {/* Focus Button */}
        <button
          onClick={() => onNavigate('comingSoon')}
          style={{
            backgroundColor: 'white',
            color: '#333',
            border: '2px solid #333',
            borderRadius: '25px',
            padding: '1.2rem 2rem',
            fontSize: '1.2rem',
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
          {t.focus}
        </button>
      </div>
    </div>
  );
};

export default HomePage;
