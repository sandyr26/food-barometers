import React from 'react';

interface ComingSoonPageProps {
  language: 'fr' | 'en' | 'mfe' | 'rcf';
  onNavigate: (page: string) => void;
}

const translations = {
  fr: {
    title: 'Bientôt disponible',
    message: 'Cette fonctionnalité sera bientôt disponible.',
    description: 'Nous travaillons dur pour vous apporter de nouvelles fonctionnalités.',
    backButton: 'Retour'
  },
  en: {
    title: 'Coming Soon',
    message: 'This feature will be available soon.',
    description: 'We are working hard to bring you new features.',
    backButton: 'Back'
  },
  mfe: {
    title: 'Pou vini bianto',
    message: 'Sa fonksyonalite pou vini bianto.',
    description: 'Nou pe travay dir pou amenn ou nouvo fonksyonalite.',
    backButton: 'Retour'
  },
  rcf: {
    title: 'Pou vini byinto',
    message: 'Sa fonksyonalité pou vini byinto.',
    description: 'Nou pe travay dir pou amènn ou nouvo fonksyonalité.',
    backButton: 'Rétour'
  }
};

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ language, onNavigate }) => {
  const t = translations[language];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #ffc000 0%, #ff8c00 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      textAlign: 'center'
    }}>
      {/* Icon/Emoji */}
      <div style={{
        fontSize: '80px',
        marginBottom: '20px',
        animation: 'pulse 2s ease-in-out infinite'
      }}>
        🚀
      </div>

      {/* Title */}
      <h1 style={{
        fontSize: '2.5rem',
        color: '#333',
        marginBottom: '20px',
        fontWeight: 'bold',
        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        {t.title}
      </h1>

      {/* Message */}
      <p style={{
        fontSize: '1.2rem',
        color: '#333',
        marginBottom: '10px',
        maxWidth: '600px'
      }}>
        {t.message}
      </p>

      {/* Description */}
      <p style={{
        fontSize: '1rem',
        color: '#555',
        marginBottom: '40px',
        maxWidth: '600px'
      }}>
        {t.description}
      </p>

      {/* Back Button */}
      <button
        onClick={() => onNavigate('home')}
        style={{
          padding: '15px 40px',
          fontSize: '18px',
          backgroundColor: '#333',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
          boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#555';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 8px rgba(0,0,0,0.3)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#333';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.2)';
        }}
      >
        {t.backButton}
      </button>

      {/* CSS Animation for pulse effect */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};

export default ComingSoonPage;
