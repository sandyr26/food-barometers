import React, { useState, useEffect } from 'react';
import './App.css';
import SplashScreen from './pages/SplashScreen';
import AuthPage from './pages/AuthPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import AddMealPage from './pages/AddMealPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';

type Language = 'fr' | 'en' | 'mfe' | 'rcf';
type Page = 'splash' | 'auth' | 'register' | 'home' | 'addMeal' | 'profile' | 'notifications';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('splash');
  const [language, setLanguage] = useState<Language>('fr');
  const [notificationCount] = useState(3);

  useEffect(() => {
    if (currentPage === 'splash') {
      const timer = setTimeout(() => {
        setCurrentPage('auth');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentPage]);

  const handleLogin = () => {
    setCurrentPage('home');
  };

  const handleRegister = () => {
    setCurrentPage('register');
  };

  const handleRegistrationComplete = () => {
    setCurrentPage('home');
  };

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'splash':
        return (
          <SplashScreen 
            onComplete={() => setCurrentPage('auth')}
            language={language}
          />
        );

      case 'auth':
        return (
          <AuthPage
            onLogin={handleLogin}
            onRegister={handleRegister}
            language={language}
            onLanguageChange={handleLanguageChange}
          />
        );

      case 'register':
        return (
          <RegisterPage
            onBack={() => setCurrentPage('auth')}
            onComplete={handleRegistrationComplete}
            language={language}
          />
        );

      case 'home':
        return (
          <>
            <HomePage 
              language={language}
              onNavigate={handleNavigate}
            />
            <div className="navbar">
              <button 
                className="nav-item"
                onClick={() => handleNavigate('home')}
              >
                🏠
              </button>
              <button 
                className="nav-item"
                onClick={() => handleNavigate('addMeal')}
              >
                ➕
              </button>
              <button 
                className="nav-item notification-btn"
                onClick={() => handleNavigate('notifications')}
              >
                🔔
                {notificationCount > 0 && (
                  <span className="notification-count">{notificationCount}</span>
                )}
              </button>
              <button 
                className="nav-item"
                onClick={() => handleNavigate('profile')}
              >
                👤
              </button>
            </div>
          </>
        );

      case 'addMeal':
        return (
          <>
            <AddMealPage 
              language={language}
              onBack={() => handleNavigate('home')}
            />
            <div className="navbar">
              <button 
                className="nav-item"
                onClick={() => handleNavigate('home')}
              >
                🏠
              </button>
              <button 
                className="nav-item active"
                onClick={() => handleNavigate('addMeal')}
              >
                ➕
              </button>
              <button 
                className="nav-item notification-btn"
                onClick={() => handleNavigate('notifications')}
              >
                🔔
                {notificationCount > 0 && (
                  <span className="notification-count">{notificationCount}</span>
                )}
              </button>
              <button 
                className="nav-item"
                onClick={() => handleNavigate('profile')}
              >
                👤
              </button>
            </div>
          </>
        );

      case 'profile':
        return (
          <>
            <ProfilePage 
              language={language}
              onBack={() => handleNavigate('home')}
              onLanguageChange={handleLanguageChange}
            />
            <div className="navbar">
              <button 
                className="nav-item"
                onClick={() => handleNavigate('home')}
              >
                🏠
              </button>
              <button 
                className="nav-item"
                onClick={() => handleNavigate('addMeal')}
              >
                ➕
              </button>
              <button 
                className="nav-item notification-btn"
                onClick={() => handleNavigate('notifications')}
              >
                🔔
                {notificationCount > 0 && (
                  <span className="notification-count">{notificationCount}</span>
                )}
              </button>
              <button 
                className="nav-item active"
                onClick={() => handleNavigate('profile')}
              >
                👤
              </button>
            </div>
          </>
        );

      case 'notifications':
        return (
          <>
            <NotificationsPage 
              language={language}
              onBack={() => handleNavigate('home')}
            />
            <div className="navbar">
              <button 
                className="nav-item"
                onClick={() => handleNavigate('home')}
              >
                🏠
              </button>
              <button 
                className="nav-item"
                onClick={() => handleNavigate('addMeal')}
              >
                ➕
              </button>
              <button 
                className="nav-item notification-btn active"
                onClick={() => handleNavigate('notifications')}
              >
                🔔
                {notificationCount > 0 && (
                  <span className="notification-count">{notificationCount}</span>
                )}
              </button>
              <button 
                className="nav-item"
                onClick={() => handleNavigate('profile')}
              >
                👤
              </button>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
};

export default App;