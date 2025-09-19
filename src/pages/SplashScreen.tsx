import React, { useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
  language: 'fr' | 'en' | 'mfe' | 'rcf';
}

const translations = {
  fr: { appName: 'FOOD BAROMETERS', subtitle: 'Suivez votre alimentation' },
  en: { appName: 'FOOD BAROMETERS', subtitle: 'Track your food intake' },
  mfe: { appName: 'FOOD BAROMETERS', subtitle: 'Swiv to manze' },
  rcf: { appName: 'FOOD BAROMETERS', subtitle: 'Swiv aou manzé' }
};

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, language }) => {
  const t = translations[language];
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <div className="app-logo">
          <div className="logo-icon">🍽️</div>
          <h1 className="app-title">{t.appName}</h1>
        </div>
        <p className="app-subtitle">{t.subtitle}</p>
        <div className="loading-indicator">
          <div className="spinner"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;