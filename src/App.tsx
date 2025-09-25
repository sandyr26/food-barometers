import React, { useState, useEffect } from 'react';
import './App.css';
import SplashScreen from './pages/SplashScreen';
import AuthPage from './pages/AuthPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import AddMealPage from './pages/AddMealPage';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import SuppliesPage from './pages/SuppliesPage';
import CalendarPage from './pages/CalendarPage.tsx';
import MealDetailPage from './pages/MealDetailPage';
import DayMealsPage from './pages/DayMealsPage';

type Language = 'fr' | 'en' | 'mfe' | 'rcf';
type Page = 'splash' | 'auth' | 'register' | 'home' | 'addMeal' | 'profile' | 'notifications' | 'supplies' | 'calendar' | 'mealDetail' | 'dayMeals';

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
  const [currentPage, setCurrentPage] = useState<Page>('splash');
  const [language, setLanguage] = useState<Language>('fr');
  const [notificationCount] = useState(3);
  const [selectedMeal, setSelectedMeal] = useState<MealData | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [meals, setMeals] = useState<MealData[]>([
    // Sample meals for September 1-15, 2025
    { id: 1, time: '2025-09-01T08:00:00', name: 'Breakfast', duration: '15 min', answers: ['Bread', 'Coffee'], method: 'text', date: '2025-09-01' },
    { id: 2, time: '2025-09-01T12:30:00', name: 'Lunch', duration: '25 min', answers: ['Rice', 'Fish curry'], method: 'text', date: '2025-09-01' },
    { id: 3, time: '2025-09-02T07:45:00', name: 'Breakfast', duration: '10 min', answers: ['Cereal', 'Milk'], method: 'text', date: '2025-09-02' },
    { id: 4, time: '2025-09-02T13:00:00', name: 'Lunch', duration: '20 min', answers: ['Sandwich', 'Juice'], method: 'voice', date: '2025-09-02' },
    { id: 5, time: '2025-09-02T19:30:00', name: 'Dinner', duration: '30 min', answers: ['Pasta', 'Salad'], method: 'text', date: '2025-09-02' },
    { id: 6, time: '2025-09-03T08:15:00', name: 'Breakfast', duration: '12 min', answers: ['Toast', 'Jam'], method: 'text', date: '2025-09-03' },
    { id: 7, time: '2025-09-04T12:45:00', name: 'Lunch', duration: '35 min', answers: ['Curry', 'Rice', 'Vegetables'], method: 'text', date: '2025-09-04' },
    { id: 8, time: '2025-09-04T19:00:00', name: 'Dinner', duration: '40 min', answers: ['Grilled chicken', 'Potatoes'], method: 'text', date: '2025-09-04' },
    { id: 9, time: '2025-09-04T20:30:00', name: 'Snack', duration: '5 min', answers: ['Fruit'], method: 'voice', date: '2025-09-04' },
    { id: 10, time: '2025-09-05T08:30:00', name: 'Breakfast', duration: '18 min', answers: ['Pancakes', 'Syrup'], method: 'text', date: '2025-09-05' },
    { id: 11, time: '2025-09-05T13:15:00', name: 'Lunch', duration: '28 min', answers: ['Soup', 'Bread'], method: 'text', date: '2025-09-05' },
    { id: 12, time: '2025-09-06T07:50:00', name: 'Breakfast', duration: '8 min', answers: ['Yogurt'], method: 'voice', date: '2025-09-06' },
    { id: 13, time: '2025-09-07T12:20:00', name: 'Lunch', duration: '22 min', answers: ['Salad', 'Chicken'], method: 'text', date: '2025-09-07' },
    { id: 14, time: '2025-09-07T19:45:00', name: 'Dinner', duration: '45 min', answers: ['Pizza', 'Soda'], method: 'text', date: '2025-09-07' },
    { id: 15, time: '2025-09-08T08:10:00', name: 'Breakfast', duration: '14 min', answers: ['Oatmeal', 'Berries'], method: 'text', date: '2025-09-08' },
    { id: 16, time: '2025-09-08T12:50:00', name: 'Lunch', duration: '30 min', answers: ['Burger', 'Fries'], method: 'text', date: '2025-09-08' },
    { id: 17, time: '2025-09-08T18:30:00', name: 'Dinner', duration: '25 min', answers: ['Fish', 'Rice'], method: 'voice', date: '2025-09-08' },
    { id: 18, time: '2025-09-09T09:00:00', name: 'Breakfast', duration: '16 min', answers: ['Eggs', 'Bacon'], method: 'text', date: '2025-09-09' },
    { id: 19, time: '2025-09-09T13:30:00', name: 'Lunch', duration: '20 min', answers: ['Wrap', 'Chips'], method: 'text', date: '2025-09-09' },
    { id: 20, time: '2025-09-10T08:20:00', name: 'Breakfast', duration: '11 min', answers: ['Smoothie'], method: 'voice', date: '2025-09-10' },
    { id: 21, time: '2025-09-10T12:40:00', name: 'Lunch', duration: '35 min', answers: ['Stir fry', 'Noodles'], method: 'text', date: '2025-09-10' },
    { id: 22, time: '2025-09-10T19:15:00', name: 'Dinner', duration: '50 min', answers: ['Steak', 'Vegetables', 'Wine'], method: 'text', date: '2025-09-10' },
    { id: 23, time: '2025-09-11T07:40:00', name: 'Breakfast', duration: '9 min', answers: ['Coffee', 'Croissant'], method: 'voice', date: '2025-09-11' },
    { id: 24, time: '2025-09-12T13:10:00', name: 'Lunch', duration: '24 min', answers: ['Tacos', 'Salsa'], method: 'text', date: '2025-09-12' },
    { id: 25, time: '2025-09-12T20:00:00', name: 'Dinner', duration: '38 min', answers: ['Curry', 'Naan'], method: 'text', date: '2025-09-12' },
    { id: 26, time: '2025-09-13T08:35:00', name: 'Breakfast', duration: '13 min', answers: ['Granola', 'Yogurt'], method: 'text', date: '2025-09-13' },
    { id: 27, time: '2025-09-13T12:25:00', name: 'Lunch', duration: '27 min', answers: ['Sushi', 'Miso soup'], method: 'text', date: '2025-09-13' },
    { id: 28, time: '2025-09-14T08:05:00', name: 'Breakfast', duration: '17 min', answers: ['French toast'], method: 'voice', date: '2025-09-14' },
    { id: 29, time: '2025-09-14T13:45:00', name: 'Lunch', duration: '32 min', answers: ['Ramen', 'Vegetables'], method: 'text', date: '2025-09-14' },
    { id: 30, time: '2025-09-14T19:20:00', name: 'Dinner', duration: '42 min', answers: ['Roast beef', 'Potatoes'], method: 'text', date: '2025-09-14' },
    { id: 31, time: '2025-09-15T08:25:00', name: 'Breakfast', duration: '15 min', answers: ['Muesli', 'Fruit'], method: 'text', date: '2025-09-15' },
    { id: 32, time: '2025-09-15T12:15:00', name: 'Lunch', duration: '26 min', answers: ['Quinoa bowl', 'Avocado'], method: 'voice', date: '2025-09-15' },
    // Today's meals (September 25, 2025) for testing
    { id: 33, time: '2025-09-25T08:00:00', name: 'Croissant', duration: '12 min', answers: ['Coffee', 'Croissant', 'Fresh croissant with butter and jam'], method: 'text', date: '2025-09-25' },
    { id: 34, time: '2025-09-25T12:30:00', name: 'Chicken salad', duration: '25 min', answers: ['Salad', 'Chicken salad', 'Mixed green salad with grilled chicken'], method: 'text', date: '2025-09-25' }
  ]);

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

  const handleAddMeal = (mealData: MealData) => {
    setMeals(prevMeals => [...prevMeals, mealData]);
    // Don't navigate immediately - let AddMealPage show success page first
  };

  const handleMealSelect = (meal: MealData) => {
    setSelectedMeal(meal);
    setCurrentPage('mealDetail');
  };

  const handleDaySelect = (date: string) => {
    setSelectedDate(date);
    setCurrentPage('dayMeals');
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
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
            {/* Header with notification and profile icons */}
            <div className="app-header">
              <h1 className="app-header-title">FOOD BAROMETERS</h1>
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
              name="John"
              meals={meals}
              onMealSelect={handleMealSelect}
            />
            <div className="navbar">
              <button 
                className="nav-item active"
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
                className="nav-item"
                onClick={() => handleNavigate('calendar')}
              >
                📅
              </button>
            </div>
          </>
        );

      case 'addMeal':
        return (
          <AddMealPage 
            language={language}
            onBack={() => handleNavigate('home')}
            onAddMeal={handleAddMeal}
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
              onDaySelect={handleDaySelect}
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
            onBack={() => setCurrentPage('home')}
          />
        ) : null;

      case 'dayMeals':
        return selectedDate ? (
          <DayMealsPage
            language={language}
            selectedDate={selectedDate}
            meals={meals}
            onBack={() => setCurrentPage('calendar')}
            onMealSelect={handleMealSelect}
            onDateChange={handleDateChange}
          />
        ) : null;

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