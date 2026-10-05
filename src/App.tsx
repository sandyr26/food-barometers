import React, { useState, useEffect } from 'react';
import { api } from './api';
import './App.css';
import SplashScreen from './pages/SplashScreen';
import AuthPage from './pages/AuthPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import AddMealPage from './pages/AddMealPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import SuppliesPage from './pages/SuppliesPage';
import CalendarPage from './pages/CalendarPage.tsx';
import MealDetailPage from './pages/MealDetailPage';
import DayMealsPage from './pages/DayMealsPage';
import ComingSoonPage from './pages/ComingSoonPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import MascotSelectionPage from './pages/MascotSelectionPage';
import PresentationPage from './pages/PresentationPage';
import VoiceSurveyPage from './pages/VoiceSurveyPage';

type Language = 'fr' | 'en' | 'mfe' | 'rcf';
type Page = 'splash' | 'auth' | 'login' | 'register' | 'home' | 'mascotSelection' | 'presentation' | 'survey' | 'addMeal' | 'profile' | 'notifications' | 'supplies' | 'calendar' | 'mealDetail' | 'dayMeals' | 'comingSoon' | 'adminLogin' | 'adminDashboard';

interface MealData {
  id: number;
  time: string;
  name: string;
  duration: string;
  answers: string[];
  method: 'text' | 'voice';
  date: string;
}

const App: React.FC = () => {
  // Function to get page from URL
  const getPageFromUrl = (): Page => {
    const path = window.location.pathname;
    switch (path) {
      case '/admin':
        return 'adminLogin';
      case '/admin/dashboard':
        return 'adminDashboard';
      case '/auth':
        return 'auth';
      case '/login':
        return 'login';
      case '/register':
        return 'register';
      case '/home':
        return 'home';
      case '/mascot-selection':
        return 'mascotSelection';
      case '/presentation':
        return 'presentation';
      case '/add-meal-ai':
        return 'mascotSelection';
      case '/survey':
        return 'survey';
      default:
        return 'splash';
    }
  };

  const [currentPage, setCurrentPage] = useState<Page>(getPageFromUrl());
  const [language, setLanguage] = useState<Language>('fr');
  const [notificationCount] = useState(3);
  const [selectedMeal, setSelectedMeal] = useState<MealData | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [authToken, setAuthToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [meals, setMeals] = useState<MealData[]>([]);
  const [selectedMascot, setSelectedMascot] = useState<'boy' | 'girl' | null>(null);
  const [hasAcceptedSurveyConsent, setHasAcceptedSurveyConsent] = useState(false);

  // URL routing effect
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(getPageFromUrl());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Fetch meals from API when token is available
  useEffect(() => {
    if (authToken) {
      const fetchMeals = async () => {
        try {
          const response = await api.get('/api/meals', {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
          
          if (Array.isArray(response.data)) {
            // Convert API meals to frontend format
            const formattedMeals: MealData[] = response.data.map((meal: any, index: number) => ({
              id: index + 1,
              time: meal.time,
              name: meal.name,
              duration: meal.duration || '0 min',
              answers: meal.answers || [],
              method: meal.method || 'text',
              date: meal.date
            }));
            setMeals(formattedMeals);
          }
        } catch (error) {
          console.error('Failed to fetch meals:', error);
          // Keep meals as empty array if fetch fails
        }
      };
      
      fetchMeals();
    }
  }, [authToken]);

  // Function to navigate and update URL
  const navigateToPage = (page: Page) => {
    let url = '/';
    switch (page) {
      case 'adminLogin':
        url = '/admin';
        break;
      case 'adminDashboard':
        url = '/admin/dashboard';
        break;
      case 'auth':
        url = '/auth';
        break;
      case 'login':
        url = '/login';
        break;
      case 'register':
        url = '/register';
        break;
      case 'home':
        url = '/home';
        break;
      case 'mascotSelection':
        url = '/mascot-selection';
        break;
      case 'presentation':
        url = '/presentation';
        break;
      case 'survey':
        url = '/survey';
        break;
      case 'splash':
      default:
        url = '/';
        break;
    }
    
    window.history.pushState({}, '', url);
    setCurrentPage(page);
  };



  const handleLogin = () => {
    navigateToPage('login');
  };

  const handleLoginSubmit = (token: string) => {
    setAuthToken(token);
    navigateToPage('home');
  };

  const handleRegister = () => {
    navigateToPage('register');
  };

  const handleRegistrationComplete = () => {
    navigateToPage('home');
  };

  const handleNavigate = (page: Page) => {
    navigateToPage(page);
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
  };

  const handleAddMeal = (mealData: MealData) => {
    setMeals(prevMeals => [...prevMeals, mealData]);
    // Don't navigate immediately - let AddMealPage show success page first
  };

  const handleMascotSelect = (mascot: 'boy' | 'girl') => {
    setSelectedMascot(mascot);
    navigateToPage('presentation');
  };

  const handlePresentationConsent = (accepted: boolean) => {
    setHasAcceptedSurveyConsent(accepted);
    navigateToPage(accepted ? 'survey' : 'home');
  };

  const handleMealSelect = (meal: MealData) => {
    setSelectedMeal(meal);
    navigateToPage('mealDetail');
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    navigateToPage('dayMeals');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'splash':
        return (
          <SplashScreen 
            onComplete={() => navigateToPage('auth')}
            onAdminAccess={() => navigateToPage('adminLogin')}
            language={language}
          />
        );

      case 'auth':
        return (
          <AuthPage
            onLogin={handleLogin}
            onRegister={handleRegister}
            onAdmin={() => navigateToPage('adminLogin')}
          />
        );

      case 'login':
        return (
          <LoginPage
            onBack={() => navigateToPage('auth')}
            onLogin={handleLoginSubmit}
            language={language}
          />
        );

      case 'register':
        return (
          <RegisterPage
            onBack={() => navigateToPage('auth')}
            onComplete={handleRegistrationComplete}
            language={language}
          />
        );

      case 'mascotSelection':
        return (
          <MascotSelectionPage
            onBack={() => navigateToPage('home')}
            onSelectMascot={handleMascotSelect}
            language={language}
            authToken={authToken}
          />
        );

      case 'presentation':
        return (
          <PresentationPage
            onBack={() => navigateToPage('mascotSelection')}
            onContinue={handlePresentationConsent}
            authToken={authToken}
            selectedMascot={selectedMascot ?? 'girl'}
          />
        );

      case 'home':
        return (
          <>
            {/* Header with notification and profile icons */}
            <div className="app-header">
              <h1 className="app-header-title">FOOD BAROMETER</h1>
              <div className="header-icons">
                <button 
                  className="header-icon notification-btn"
                  onClick={() => handleNavigate('notifications')}
                >
                  🔔
                  {notificationCount > 0 && (
                    <span className="notification-count">{notificationCount}</span>
                  )}
                </button>
                <button 
                  className="header-icon"
                  onClick={() => handleNavigate('profile')}
                >
                  👤
                </button>
              </div>
            </div>
            <HomePage 
              language={language}
              onNavigate={handleNavigate}
            />
          </>
        );

      case 'survey':
        return hasAcceptedSurveyConsent ? (
          <VoiceSurveyPage
            authToken={authToken}
            selectedMascot={selectedMascot ?? 'girl'}
            onBack={() => handleNavigate('home')}
          />
        ) : (
          <PresentationPage
            onBack={() => navigateToPage('mascotSelection')}
            onContinue={handlePresentationConsent}
            authToken={authToken}
            selectedMascot={selectedMascot ?? 'girl'}
          />
        );

      case 'addMeal':
        return (
          <AddMealPage 
            language={language}
            onBack={() => handleNavigate('home')}
            onAddMeal={handleAddMeal}
            onNavigate={handleNavigate}
          />
        );

      case 'profile':
        return (
          <ProfilePage 
            language={language}
            onBack={() => handleNavigate('home')}
            onLanguageChange={handleLanguageChange}
          />
        );

      case 'notifications':
        return (
          <NotificationsPage 
            language={language}
            onBack={() => handleNavigate('home')}
            onNavigate={handleNavigate}
          />
        );

      case 'supplies':
        return (
          <SuppliesPage 
            language={language}
            onBack={() => handleNavigate('notifications')}
            onNavigate={handleNavigate}
          />
        );

      case 'calendar':
        return (
          <>
            <CalendarPage 
              language={language}
              meals={meals}
              onBack={() => handleNavigate('home')}
              onDaySelect={handleDateChange}
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
                className="nav-item active"
                onClick={() => handleNavigate('calendar')}
              >
                📅
              </button>
            </div>
          </>
        );

      case 'mealDetail':
        return selectedMeal ? (
          <MealDetailPage
            language={language}
            meal={selectedMeal}
            onBack={() => navigateToPage('home')}
          />
        ) : null;

      case 'dayMeals':
        return selectedDate ? (
          <DayMealsPage
            language={language}
            selectedDate={selectedDate}
            meals={meals}
            onBack={() => navigateToPage('calendar')}
            onMealSelect={handleMealSelect}
            onDateChange={handleDateChange}
          />
        ) : null;

      case 'comingSoon':
        return (
          <ComingSoonPage
            language={language}
            onNavigate={(page: string) => handleNavigate(page as Page)}
          />
        );

      case 'adminLogin':
        return (
          <AdminLoginPage
            onLogin={() => navigateToPage('adminDashboard')}
            onBack={() => navigateToPage('splash')}
          />
        );

      case 'adminDashboard':
        return (
          <AdminDashboard
            meals={meals}
            onLogout={() => navigateToPage('splash')}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className={`App ${currentPage === 'splash' || currentPage === 'auth' ? 'App--fullscreen' : ''}`}>
      {renderPage()}
    </div>
  );
};

export default App;