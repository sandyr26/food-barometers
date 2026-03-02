import React, { useState, useMemo, useEffect } from 'react';
import { Settings as SettingsIcon, Sun, Moon, User, LogOut, Globe, ArrowLeft, Eye, Download, Trash2 } from 'lucide-react';
import logo from '../assets/LOGO.png';
import QuestionManager from './QuestionManager';
import { getTheme, THEME_STORAGE_KEY } from '../theme';

interface MealData {
  id: number;
  time: string;
  name: string;
  duration: string;
  answers: string[];
  method: 'text' | 'voice';
  date: string;
}

interface AdminDashboardProps {
  meals: MealData[];
  onLogout: () => void;
}

interface DashboardStats {
  totalMeals: number;
  totalUsers: number;
  averageMealDuration: number;
  textVsVoiceRatio: { text: number; voice: number };
  mealsByDay: { [date: string]: number };
  mealsByType: { [name: string]: number };
  dailyAverage: number;
}

const MEAL_QUESTIONS = [
  'What time did you start your meal?',
  'What do you call this moment?',
  'Indicate the ingredients consumed',
  'Was this meal cooked by yourself or by a family member?',
  'Where did you have your meal?',
  'Were you alone or accompanied?',
  'Were you standing or sitting? Were you doing something else while eating?',
  'How long did this meal last?',
  'How does this meal differ from your eating habits?'
];

const getDummyAnswers = (meal: MealData): string[] => {
  const mealTime = new Date(meal.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return [
    mealTime,
    meal.name,
    meal.answers.join(', ') || 'No details provided',
    'Cooked at home by a family member',
    'At home',
    'With family',
    'Sitting at the table, watching TV',
    meal.duration,
    'No significant differences from usual habits'
  ];
};

const formatAudioTime = (progress: number): string => {
  const totalSeconds = Math.round((progress / 100) * 30);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
};

const MEALS_PER_PAGE = 10;

const DUMMY_MEALS: MealData[] = [
  { id: 1, time: '2026-02-16T07:30:00', name: 'Breakfast', duration: '20 min', answers: ['Toast', 'Orange juice', 'Butter'], method: 'text', date: '2026-02-16' },
  { id: 2, time: '2026-02-16T12:15:00', name: 'Lunch', duration: '35 min', answers: ['Rice', 'Grilled chicken', 'Salad'], method: 'text', date: '2026-02-16' },
  { id: 3, time: '2026-02-16T19:00:00', name: 'Dinner', duration: '40 min', answers: ['Fish curry', 'Roti', 'Lentils'], method: 'voice', date: '2026-02-16' },
  { id: 4, time: '2026-02-17T08:00:00', name: 'Breakfast', duration: '15 min', answers: ['Cereal', 'Milk', 'Banana'], method: 'text', date: '2026-02-17' },
  { id: 5, time: '2026-02-17T12:30:00', name: 'Lunch', duration: '30 min', answers: ['Pasta', 'Tomato sauce', 'Cheese'], method: 'voice', date: '2026-02-17' },
  { id: 6, time: '2026-02-17T16:00:00', name: 'Snack', duration: '10 min', answers: ['Apple', 'Yogurt'], method: 'text', date: '2026-02-17' },
  { id: 7, time: '2026-02-17T19:30:00', name: 'Dinner', duration: '45 min', answers: ['Biryani', 'Raita', 'Salad'], method: 'text', date: '2026-02-17' },
  { id: 8, time: '2026-02-18T07:45:00', name: 'Breakfast', duration: '20 min', answers: ['Eggs', 'Toast', 'Coffee'], method: 'voice', date: '2026-02-18' },
  { id: 9, time: '2026-02-18T12:00:00', name: 'Lunch', duration: '25 min', answers: ['Sandwich', 'Chips', 'Juice'], method: 'text', date: '2026-02-18' },
  { id: 10, time: '2026-02-18T18:30:00', name: 'Dinner', duration: '35 min', answers: ['Steak', 'Mashed potatoes', 'Green beans'], method: 'text', date: '2026-02-18' },
  { id: 11, time: '2026-02-19T08:15:00', name: 'Breakfast', duration: '15 min', answers: ['Pancakes', 'Syrup', 'Tea'], method: 'voice', date: '2026-02-19' },
  { id: 12, time: '2026-02-19T13:00:00', name: 'Lunch', duration: '30 min', answers: ['Fried noodles', 'Vegetables', 'Soy sauce'], method: 'text', date: '2026-02-19' },
  { id: 13, time: '2026-02-19T15:30:00', name: 'Goûter', duration: '10 min', answers: ['Biscuits', 'Tea'], method: 'text', date: '2026-02-19' },
  { id: 14, time: '2026-02-19T19:00:00', name: 'Dinner', duration: '40 min', answers: ['Grilled fish', 'Rice', 'Chutney'], method: 'voice', date: '2026-02-19' },
  { id: 15, time: '2026-02-20T07:30:00', name: 'Breakfast', duration: '20 min', answers: ['Oatmeal', 'Berries', 'Honey'], method: 'text', date: '2026-02-20' },
  { id: 16, time: '2026-02-20T12:30:00', name: 'Lunch', duration: '35 min', answers: ['Dal', 'Rice', 'Pickle'], method: 'text', date: '2026-02-20' },
  { id: 17, time: '2026-02-20T19:15:00', name: 'Dinner', duration: '30 min', answers: ['Pizza', 'Salad'], method: 'voice', date: '2026-02-20' },
  { id: 18, time: '2026-02-21T08:00:00', name: 'Breakfast', duration: '15 min', answers: ['Croissant', 'Coffee', 'Jam'], method: 'text', date: '2026-02-21' },
  { id: 19, time: '2026-02-21T10:30:00', name: 'Brunch', duration: '25 min', answers: ['Eggs Benedict', 'Hash browns', 'Orange juice'], method: 'text', date: '2026-02-21' },
  { id: 20, time: '2026-02-21T13:00:00', name: 'Lunch', duration: '30 min', answers: ['Chicken wrap', 'Fries', 'Cola'], method: 'voice', date: '2026-02-21' },
  { id: 21, time: '2026-02-21T19:00:00', name: 'Dinner', duration: '45 min', answers: ['Lamb curry', 'Naan', 'Rice'], method: 'text', date: '2026-02-21' },
  { id: 22, time: '2026-02-22T07:45:00', name: 'Breakfast', duration: '20 min', answers: ['Smoothie bowl', 'Granola'], method: 'voice', date: '2026-02-22' },
  { id: 23, time: '2026-02-22T12:15:00', name: 'Lunch', duration: '25 min', answers: ['Sushi', 'Miso soup', 'Green tea'], method: 'text', date: '2026-02-22' },
  { id: 24, time: '2026-02-22T16:00:00', name: 'Apéro', duration: '15 min', answers: ['Crackers', 'Cheese', 'Wine'], method: 'text', date: '2026-02-22' },
  { id: 25, time: '2026-02-22T19:30:00', name: 'Dinner', duration: '40 min', answers: ['Rougaille', 'Rice', 'Salad', 'Lentils'], method: 'voice', date: '2026-02-22' },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ meals, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'meals' | 'users' | 'analytics' | 'questions'>('overview');
  const [fullScreenView, setFullScreenView] = useState<'settings' | 'profile' | null>(null);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('fr');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored !== 'false';
  });
  const [viewingMeal, setViewingMeal] = useState<MealData | null>(null);
  const [localMeals, setLocalMeals] = useState<MealData[]>(meals.length > 0 ? meals : DUMMY_MEALS);
  const [deleteConfirmMeal, setDeleteConfirmMeal] = useState<MealData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  const theme = useMemo(() => getTheme(isDarkMode), [isDarkMode]);

  useEffect(() => {
    if (meals.length > 0) {
      setLocalMeals(meals);
    }
  }, [meals]);

  useEffect(() => {
    if (viewingMeal) {
      setAudioPlaying(false);
      setAudioProgress(0);
    }
  }, [viewingMeal]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (audioPlaying && audioProgress < 100) {
      interval = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 100) {
            setAudioPlaying(false);
            return 100;
          }
          return prev + 1;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [audioPlaying, audioProgress]);

  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem(THEME_STORAGE_KEY, String(next));
      return next;
    });
  };

  const handleExportMeal = (meal: MealData) => {
    const exportData = {
      ...meal,
      exportDate: new Date().toISOString(),
      questions: MEAL_QUESTIONS.map((q, i) => ({
        question: q,
        answer: getDummyAnswers(meal)[i]
      }))
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meal-${meal.id}-${meal.date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteMeal = (meal: MealData) => {
    setLocalMeals(prev => {
      const updated = prev.filter(m => m.id !== meal.id);
      const newTotalPages = Math.ceil(updated.length / MEALS_PER_PAGE);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }
      return updated;
    });
    setDeleteConfirmMeal(null);
  };

  // Calculate dashboard statistics
  const stats: DashboardStats = useMemo(() => {
    const totalMeals = localMeals.length;
    const totalUsers = 156; // Simulated user count

    // Calculate average meal duration
    const totalDuration = localMeals.reduce((acc, meal) => {
      const duration = parseInt(meal.duration.replace(/\D/g, '')) || 0;
      return acc + duration;
    }, 0);
    const averageMealDuration = Math.round(totalDuration / totalMeals);

    // Calculate text vs voice ratio
    const textMeals = localMeals.filter(meal => meal.method === 'text').length;
    const voiceMeals = localMeals.filter(meal => meal.method === 'voice').length;
    const textVsVoiceRatio = {
      text: Math.round((textMeals / totalMeals) * 100),
      voice: Math.round((voiceMeals / totalMeals) * 100)
    };

    // Group meals by day
    const mealsByDay = localMeals.reduce((acc, meal) => {
      const date = meal.date;
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as { [date: string]: number });

    // Group meals by type
    const mealsByType = localMeals.reduce((acc, meal) => {
      const type = meal.name.toLowerCase();
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as { [name: string]: number });

    // Calculate daily average
    const uniqueDays = Object.keys(mealsByDay).length;
    const dailyAverage = Math.round(totalMeals / uniqueDays * 10) / 10;

    return {
      totalMeals,
      totalUsers,
      averageMealDuration,
      textVsVoiceRatio,
      mealsByDay,
      mealsByType,
      dailyAverage
    };
  }, [localMeals]);

  const renderStatsCard = (title: string, value: string | number, subtitle?: string, color: string = theme.accent) => (
    <div style={{
      backgroundColor: theme.cardBg,
      borderRadius: '12px',
      padding: '1.5rem',
      border: `2px solid ${color}`,
      boxShadow: `0 4px 20px ${theme.shadow}`,
      transition: 'transform 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
    }}
    >
      <h3 style={{
        color: color,
        fontSize: '1rem',
        margin: '0 0 0.5rem 0',
        fontWeight: '600'
      }}>
        {title}
      </h3>
      <div style={{
        color: theme.textPrimary,
        fontSize: '2rem',
        fontWeight: '700',
        margin: '0 0 0.5rem 0'
      }}>
        {value}
      </div>
      {subtitle && (
        <p style={{
          color: theme.textSecondary,
          fontSize: '0.9rem',
          margin: 0
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );

  const renderBarChart = (data: { [key: string]: number }, title: string) => {
    const maxValue = Math.max(...Object.values(data));
    const sortedData = Object.entries(data).sort(([,a], [,b]) => b - a).slice(0, 10);

    return (
      <div style={{
        backgroundColor: theme.cardBg,
        borderRadius: '12px',
        padding: '1.5rem',
        border: `2px solid ${theme.borderAccent}`,
        boxShadow: `0 4px 20px ${theme.shadow}`
      }}>
        <h3 style={{
          color: theme.accent,
          fontSize: '1.2rem',
          margin: '0 0 1rem 0',
          fontWeight: '600'
        }}>
          {title}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {sortedData.map(([key, value]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                color: theme.textPrimary,
                fontSize: '0.9rem',
                minWidth: '100px',
                textAlign: 'left',
                textTransform: 'capitalize'
              }}>
                {key}
              </div>
              <div style={{
                flex: 1,
                height: '24px',
                backgroundColor: theme.barBg,
                borderRadius: '12px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{
                  height: '100%',
                  width: `${(value / maxValue) * 100}%`,
                  backgroundColor: theme.accent,
                  borderRadius: '12px',
                  transition: 'width 1s ease'
                }} />
              </div>
              <div style={{
                color: theme.textSecondary,
                fontSize: '0.9rem',
                minWidth: '40px',
                textAlign: 'right'
              }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPieChart = (data: { text: number; voice: number }) => (
    <div style={{
      backgroundColor: theme.cardBg,
      borderRadius: '12px',
      padding: '1.5rem',
      border: `2px solid ${theme.borderAccent}`,
      boxShadow: `0 4px 20px ${theme.shadow}`
    }}>
      <h3 style={{
        color: theme.accent,
        fontSize: '1.2rem',
        margin: '0 0 1rem 0',
        fontWeight: '600'
      }}>
        Input Method Distribution
      </h3>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem'
      }}>
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: `conic-gradient(${theme.accent} 0deg ${data.text * 3.6}deg, ${theme.pieSecondary} ${data.text * 3.6}deg 360deg)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: theme.pieCenter,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme.textPrimary,
            fontSize: '0.9rem',
            fontWeight: '600'
          }}>
            {data.text}%
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '16px',
              height: '16px',
              backgroundColor: theme.accent,
              borderRadius: '3px'
            }} />
            <span style={{ color: theme.textPrimary, fontSize: '0.9rem' }}>
              Text ({data.text}%)
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '16px',
              height: '16px',
              backgroundColor: theme.pieSecondary,
              borderRadius: '3px'
            }} />
            <span style={{ color: theme.textPrimary, fontSize: '0.9rem' }}>
              Voice ({data.voice}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLineChart = (data: { [date: string]: number }) => {
    const sortedEntries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
    const values = sortedEntries.map(([, value]) => value);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const range = maxValue - minValue || 1;

    return (
      <div style={{
        backgroundColor: theme.cardBg,
        borderRadius: '12px',
        padding: '1.5rem',
        border: `2px solid ${theme.borderAccent}`,
        boxShadow: `0 4px 20px ${theme.shadow}`
      }}>
        <h3 style={{
          color: theme.accent,
          fontSize: '1.2rem',
          margin: '0 0 1rem 0',
          fontWeight: '600'
        }}>
          Daily Meal Trends
        </h3>
        <div style={{
          height: '200px',
          position: 'relative',
          backgroundColor: theme.inputBg,
          borderRadius: '8px',
          padding: '1rem',
          overflow: 'hidden'
        }}>
          <svg width="100%" height="100%" viewBox="0 0 400 150">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={i}
                x1="0"
                y1={i * 30}
                x2="400"
                y2={i * 30}
                stroke={theme.barBg}
                strokeWidth="1"
              />
            ))}

            {/* Line chart */}
            <polyline
              fill="none"
              stroke={theme.accent}
              strokeWidth="3"
              points={values.map((value, index) => {
                const x = (index / (values.length - 1)) * 380 + 10;
                const y = 140 - ((value - minValue) / range) * 120;
                return `${x},${y}`;
              }).join(' ')}
            />

            {/* Data points */}
            {values.map((value, index) => {
              const x = (index / (values.length - 1)) * 380 + 10;
              const y = 140 - ((value - minValue) / range) * 120;
              return (
                <circle
                  key={index}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={theme.accent}
                  stroke={theme.cardBg}
                  strokeWidth="2"
                />
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: theme.pageBg,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <header style={{
        backgroundColor: theme.cardBg,
        borderBottom: `2px solid ${theme.borderAccent}`,
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: `0 2px 10px ${theme.shadow}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: `2px solid ${theme.borderAccent}`
          }}>
            <img src={logo} alt="Logo" style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              objectFit: 'cover'
            }} />
          </div>
          <h1 style={{
            color: theme.accent,
            fontSize: '1.5rem',
            fontWeight: '700',
            margin: 0
          }}>
            Food Barometer Admin
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => {
              setFullScreenView('settings');
            }}
            title="Settings"
            style={{
              backgroundColor: 'transparent',
              color: theme.textSecondary,
              border: `2px solid ${theme.textSecondary}`,
              borderRadius: '50%',
              padding: '0.5rem',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
            }}
          >
            <SettingsIcon size={20} />
          </button>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowAvatarMenu(prev => !prev)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: theme.accent,
                color: theme.textOnAccent,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'opacity 0.3s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              <span style={{ fontSize: '0.85rem', fontWeight: '700', lineHeight: 1 }}>SR</span>
            </button>

            {showAvatarMenu && (
              <>
                <div
                  onClick={() => setShowAvatarMenu(false)}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 49,
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  backgroundColor: theme.cardBg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '8px',
                  boxShadow: `0 4px 20px ${theme.shadow}`,
                  minWidth: '160px',
                  zIndex: 50,
                  overflow: 'hidden',
                }}>
                  <button
                    onClick={() => {
                      setShowAvatarMenu(false);
                      setFullScreenView('profile');
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'transparent',
                      color: theme.textPrimary,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.inputBg; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <User size={16} />
                    Profile
                  </button>
                  <div style={{ height: '1px', backgroundColor: theme.border }} />
                  <button
                    onClick={() => {
                      setShowAvatarMenu(false);
                      onLogout();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      backgroundColor: 'transparent',
                      color: theme.danger,
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.inputBg; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav style={{
        backgroundColor: theme.cardBg,
        borderBottom: `1px solid ${theme.border}`,
        padding: '0.5rem 2rem',
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'center'
      }}>
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'meals', label: 'Meals Data' },
          { key: 'users', label: 'User Stats' },
          { key: 'analytics', label: 'Analytics' },
          { key: 'questions', label: 'Questions' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key as any);
            }}
            style={{
              backgroundColor: activeTab === tab.key ? theme.accent : 'transparent',
              color: activeTab === tab.key ? theme.textOnAccent : theme.textSecondary,
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              fontWeight: activeTab === tab.key ? '600' : '400',
              cursor: 'pointer',
              outline: 'none',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.key) {
                e.currentTarget.style.backgroundColor = theme.inputBg;
                e.currentTarget.style.color = theme.textPrimary;
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.key) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = theme.textSecondary;
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{
        flex: 1,
        padding: '2rem',
        overflow: 'auto'
      }}>
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              {renderStatsCard('Total Meals', stats.totalMeals, 'Recorded entries')}
              {renderStatsCard('Active Users', stats.totalUsers, 'Registered participants', theme.success)}
              {renderStatsCard('Avg Duration', `${stats.averageMealDuration} min`, 'Per meal', theme.info)}
              {renderStatsCard('Daily Average', stats.dailyAverage, 'Meals per day', theme.warning)}
            </div>

            {/* Charts */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '2rem'
            }}>
              {renderPieChart(stats.textVsVoiceRatio)}
              {renderLineChart(stats.mealsByDay)}
            </div>
          </div>
        )}

        {activeTab === 'meals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {renderBarChart(stats.mealsByType, 'Meal Types Distribution')}

            {/* Recent Meals Table */}
            <div style={{
              backgroundColor: theme.cardBg,
              borderRadius: '12px',
              padding: '1.5rem',
              border: `2px solid ${theme.borderAccent}`,
              boxShadow: `0 4px 20px ${theme.shadow}`
            }}>
              <h3 style={{
                color: theme.accent,
                fontSize: '1.2rem',
                margin: '0 0 1rem 0',
                fontWeight: '600'
              }}>
                All Meals
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ color: theme.accent, padding: '0.75rem', textAlign: 'left', borderBottom: `2px solid ${theme.border}`, width: '1%', whiteSpace: 'nowrap' }}>Actions</th>
                      <th style={{ color: theme.accent, padding: '0.75rem', textAlign: 'left', borderBottom: `2px solid ${theme.border}` }}>Meal ID</th>
                      <th style={{ color: theme.accent, padding: '0.75rem', textAlign: 'left', borderBottom: `2px solid ${theme.border}` }}>Date</th>
                      <th style={{ color: theme.accent, padding: '0.75rem', textAlign: 'left', borderBottom: `2px solid ${theme.border}` }}>Time</th>
                      <th style={{ color: theme.accent, padding: '0.75rem', textAlign: 'left', borderBottom: `2px solid ${theme.border}` }}>Meal</th>
                      <th style={{ color: theme.accent, padding: '0.75rem', textAlign: 'left', borderBottom: `2px solid ${theme.border}` }}>Duration</th>
                      <th style={{ color: theme.accent, padding: '0.75rem', textAlign: 'left', borderBottom: `2px solid ${theme.border}` }}>User ID</th>
                      <th style={{ color: theme.accent, padding: '0.75rem', textAlign: 'left', borderBottom: `2px solid ${theme.border}` }}>Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const sortedMeals = [...localMeals].reverse();
                      const paginatedMeals = sortedMeals.slice((currentPage - 1) * MEALS_PER_PAGE, currentPage * MEALS_PER_PAGE);
                      return paginatedMeals.map(meal => (
                      <tr key={meal.id}>
                        <td style={{ color: theme.textPrimary, padding: '0.75rem', borderBottom: `1px solid ${theme.border}`, width: '1%', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                              onClick={() => setViewingMeal(meal)}
                              title="View"
                              style={{
                                backgroundColor: theme.info,
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.4rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleExportMeal(meal)}
                              title="Export"
                              style={{
                                backgroundColor: theme.success,
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.4rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Download size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirmMeal(meal)}
                              title="Delete"
                              style={{
                                backgroundColor: theme.danger,
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.4rem',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                        <td style={{ color: theme.textSecondary, padding: '0.75rem', borderBottom: `1px solid ${theme.border}`, fontSize: '0.85rem', fontFamily: 'monospace' }}>
                          #{meal.id}
                        </td>
                        <td style={{ color: theme.textPrimary, padding: '0.75rem', borderBottom: `1px solid ${theme.border}` }}>
                          {new Date(meal.date).toLocaleDateString()}
                        </td>
                        <td style={{ color: theme.textPrimary, padding: '0.75rem', borderBottom: `1px solid ${theme.border}` }}>
                          {new Date(meal.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ color: theme.textPrimary, padding: '0.75rem', borderBottom: `1px solid ${theme.border}` }}>
                          {meal.name}
                        </td>
                        <td style={{ color: theme.textPrimary, padding: '0.75rem', borderBottom: `1px solid ${theme.border}` }}>
                          {meal.duration}
                        </td>
                        <td style={{ color: theme.textSecondary, padding: '0.75rem', borderBottom: `1px solid ${theme.border}`, fontSize: '0.85rem', fontFamily: 'monospace' }}>
                          USR-{meal.id.toString().padStart(4, '0')}
                        </td>
                        <td style={{ color: theme.textPrimary, padding: '0.75rem', borderBottom: `1px solid ${theme.border}` }}>
                          <span style={{
                            backgroundColor: meal.method === 'text' ? theme.success : theme.info,
                            color: 'white',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            textTransform: 'capitalize'
                          }}>
                            {meal.method}
                          </span>
                        </td>
                      </tr>
                    ));
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {(() => {
                const totalItems = localMeals.length;
                const totalPages = Math.ceil(totalItems / MEALS_PER_PAGE);
                const startItem = (currentPage - 1) * MEALS_PER_PAGE + 1;
                const endItem = Math.min(currentPage * MEALS_PER_PAGE, totalItems);

                return totalPages > 1 ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '1.5rem',
                    paddingTop: '1rem',
                    borderTop: `1px solid ${theme.border}`,
                    flexWrap: 'wrap',
                    gap: '1rem',
                  }}>
                    <span style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
                      Showing {startItem}-{endItem} of {totalItems} meals
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: currentPage === 1 ? theme.barBg : theme.accent,
                          color: currentPage === 1 ? theme.textMuted : theme.textOnAccent,
                          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                        }}
                      >
                        Previous
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: currentPage === page ? theme.accent : 'transparent',
                            color: currentPage === page ? theme.textOnAccent : theme.textPrimary,
                            cursor: 'pointer',
                            fontWeight: currentPage === page ? '700' : '400',
                            fontSize: '0.9rem',
                          }}
                        >
                          {page}
                        </button>
                      ))}

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '6px',
                          border: 'none',
                          backgroundColor: currentPage === totalPages ? theme.barBg : theme.accent,
                          color: currentPage === totalPages ? theme.textMuted : theme.textOnAccent,
                          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {renderStatsCard('Total Users', 156, 'Registered accounts', theme.success)}
            {renderStatsCard('Active Today', 23, 'Users with activity', theme.info)}
            {renderStatsCard('New This Week', 8, 'New registrations', theme.warning)}
            {renderStatsCard('Avg Sessions', '3.2', 'Per user per day', theme.purple)}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {renderLineChart(stats.mealsByDay)}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem'
            }}>
              {renderStatsCard('Completion Rate', '87%', 'Surveys completed', theme.success)}
              {renderStatsCard('Response Time', '2.3 min', 'Average per question', theme.info)}
              {renderStatsCard('Data Quality', '92%', 'Complete responses', theme.warning)}
            </div>
          </div>
        )}

        {activeTab === 'questions' && (
          <QuestionManager theme={theme} />
        )}
      </main>

      {/* Full-Screen Settings Overlay */}
      {fullScreenView === 'settings' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          backgroundColor: theme.pageBg,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <header style={{
            backgroundColor: theme.cardBg,
            borderBottom: `2px solid ${theme.borderAccent}`,
            padding: '1rem 2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: `0 2px 10px ${theme.shadow}`,
          }}>
            <button
              onClick={() => setFullScreenView(null)}
              style={{
                backgroundColor: 'transparent',
                color: theme.textPrimary,
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.inputBg; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <ArrowLeft size={24} />
            </button>
            <h1 style={{
              color: theme.accent,
              fontSize: '1.5rem',
              fontWeight: '700',
              margin: 0,
            }}>
              Settings
            </h1>
          </header>

          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '2rem',
          }}>
            <div style={{
              maxWidth: '600px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem',
            }}>
              <div style={{
                backgroundColor: theme.cardBg,
                borderRadius: '12px',
                padding: '1.5rem',
                border: `2px solid ${theme.borderAccent}`,
                boxShadow: `0 4px 20px ${theme.shadow}`,
              }}>
                <h3 style={{
                  color: theme.accent,
                  fontSize: '1.2rem',
                  margin: '0 0 1.5rem 0',
                  fontWeight: '600',
                }}>
                  Appearance
                </h3>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {isDarkMode ? <Moon size={20} color={theme.textPrimary} /> : <Sun size={20} color={theme.textPrimary} />}
                    <div>
                      <div style={{ color: theme.textPrimary, fontWeight: '600' }}>
                        {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                      </div>
                      <div style={{ color: theme.textSecondary, fontSize: '0.85rem' }}>
                        {isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={toggleTheme}
                    style={{
                      width: '52px',
                      height: '28px',
                      borderRadius: '14px',
                      border: 'none',
                      backgroundColor: isDarkMode ? theme.accent : theme.barBg,
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background-color 0.3s ease',
                      padding: 0,
                    }}
                  >
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      position: 'absolute',
                      top: '3px',
                      left: isDarkMode ? '27px' : '3px',
                      transition: 'left 0.3s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                    }} />
                  </button>
                </div>
              </div>

              <div style={{
                backgroundColor: theme.cardBg,
                borderRadius: '12px',
                padding: '1.5rem',
                border: `2px solid ${theme.borderAccent}`,
                boxShadow: `0 4px 20px ${theme.shadow}`,
              }}>
                <h3 style={{
                  color: theme.accent,
                  fontSize: '1.2rem',
                  margin: '0 0 1.5rem 0',
                  fontWeight: '600',
                }}>
                  Language
                </h3>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Globe size={20} color={theme.textPrimary} />
                    <div>
                      <div style={{ color: theme.textPrimary, fontWeight: '600' }}>
                        Display Language
                      </div>
                      <div style={{ color: theme.textSecondary, fontSize: '0.85rem' }}>
                        Choose your preferred language
                      </div>
                    </div>
                  </div>

                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '8px',
                      border: `1px solid ${theme.border}`,
                      backgroundColor: theme.inputBg,
                      color: theme.textPrimary,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="mfe">Kreol Morisien</option>
                    <option value="rcf">Kreol Réyoné</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Profile Overlay */}
      {fullScreenView === 'profile' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          backgroundColor: theme.pageBg,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <header style={{
            backgroundColor: theme.cardBg,
            borderBottom: `2px solid ${theme.borderAccent}`,
            padding: '1rem 2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: `0 2px 10px ${theme.shadow}`,
          }}>
            <button
              onClick={() => setFullScreenView(null)}
              style={{
                backgroundColor: 'transparent',
                color: theme.textPrimary,
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.inputBg; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <ArrowLeft size={24} />
            </button>
            <h1 style={{
              color: theme.accent,
              fontSize: '1.5rem',
              fontWeight: '700',
              margin: 0,
            }}>
              Profile
            </h1>
          </header>

          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '2rem',
          }}>
            <div style={{
              maxWidth: '600px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem',
            }}>
              {/* Avatar & Name */}
              <div style={{
                backgroundColor: theme.cardBg,
                borderRadius: '12px',
                padding: '2rem',
                border: `2px solid ${theme.borderAccent}`,
                boxShadow: `0 4px 20px ${theme.shadow}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
              }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: theme.accent,
                  color: theme.textOnAccent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  fontWeight: '700',
                }}>
                  SR
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: theme.textPrimary, fontSize: '1.3rem', fontWeight: '700' }}>
                    SR
                  </div>
                  <div style={{ color: theme.textSecondary, fontSize: '0.9rem' }}>
                    Administrator
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <div style={{
                backgroundColor: theme.cardBg,
                borderRadius: '12px',
                padding: '1.5rem',
                border: `2px solid ${theme.borderAccent}`,
                boxShadow: `0 4px 20px ${theme.shadow}`,
              }}>
                <h3 style={{
                  color: theme.accent,
                  fontSize: '1.2rem',
                  margin: '0 0 1.5rem 0',
                  fontWeight: '600',
                }}>
                  Account Information
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div>
                    <label style={{ color: theme.textSecondary, fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>
                      Full Name
                    </label>
                    <div style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: theme.inputBg,
                      color: theme.textPrimary,
                      border: `1px solid ${theme.border}`,
                    }}>
                      SR
                    </div>
                  </div>

                  <div>
                    <label style={{ color: theme.textSecondary, fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>
                      Email
                    </label>
                    <div style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: theme.inputBg,
                      color: theme.textPrimary,
                      border: `1px solid ${theme.border}`,
                    }}>
                      admin@foodbarometer.com
                    </div>
                  </div>

                  <div>
                    <label style={{ color: theme.textSecondary, fontSize: '0.85rem', display: 'block', marginBottom: '0.25rem' }}>
                      Role
                    </label>
                    <div style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: theme.inputBg,
                      color: theme.textPrimary,
                      border: `1px solid ${theme.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}>
                      <span style={{
                        backgroundColor: theme.accent,
                        color: theme.textOnAccent,
                        padding: '0.15rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                      }}>
                        Admin
                      </span>
                      Administrator
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen Meal Detail Overlay */}
      {viewingMeal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 100,
          backgroundColor: theme.pageBg,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <header style={{
            backgroundColor: theme.cardBg,
            borderBottom: `2px solid ${theme.borderAccent}`,
            padding: '1rem 2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            boxShadow: `0 2px 10px ${theme.shadow}`,
          }}>
            <button
              onClick={() => setViewingMeal(null)}
              style={{
                backgroundColor: 'transparent',
                color: theme.textPrimary,
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.inputBg; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <ArrowLeft size={24} />
            </button>
            <h1 style={{
              color: theme.accent,
              fontSize: '1.5rem',
              fontWeight: '700',
              margin: 0,
            }}>
              Meal Details
            </h1>
          </header>

          <div style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>
            <div style={{
              maxWidth: '700px',
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '2rem',
            }}>
              {/* Meal Summary Card */}
              <div style={{
                backgroundColor: theme.cardBg,
                borderRadius: '12px',
                padding: '1.5rem',
                border: `2px solid ${theme.borderAccent}`,
                boxShadow: `0 4px 20px ${theme.shadow}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h2 style={{ color: theme.textPrimary, margin: '0 0 0.5rem 0', fontSize: '1.4rem' }}>
                      {viewingMeal.name}
                    </h2>
                    <p style={{ color: theme.textSecondary, margin: '0 0 0.25rem 0' }}>
                      {new Date(viewingMeal.date).toLocaleDateString()} at {new Date(viewingMeal.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p style={{ color: theme.textSecondary, margin: 0 }}>
                      Duration: {viewingMeal.duration}
                    </p>
                    <p style={{ color: theme.textSecondary, margin: '0.25rem 0 0 0', fontSize: '0.9rem' }}>
                      User ID: USR-{viewingMeal.id.toString().padStart(4, '0')}
                    </p>
                  </div>
                  <span style={{
                    backgroundColor: viewingMeal.method === 'text' ? theme.success : theme.info,
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    fontSize: '0.85rem',
                    textTransform: 'capitalize',
                    fontWeight: '600',
                  }}>
                    {viewingMeal.method}
                  </span>
                </div>
              </div>

              {/* Text method: Q&A Section */}
              {viewingMeal.method === 'text' ? (
                <div style={{
                  backgroundColor: theme.cardBg,
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: `2px solid ${theme.borderAccent}`,
                  boxShadow: `0 4px 20px ${theme.shadow}`,
                }}>
                  <h3 style={{ color: theme.accent, fontSize: '1.2rem', margin: '0 0 1.5rem 0', fontWeight: '600' }}>
                    Detailed Answers
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {MEAL_QUESTIONS.map((question, index) => {
                      const answers = getDummyAnswers(viewingMeal);
                      return (
                        <div key={index} style={{
                          padding: '1rem',
                          backgroundColor: theme.inputBg,
                          borderRadius: '8px',
                          border: `1px solid ${theme.border}`,
                        }}>
                          <div style={{
                            fontSize: '0.85rem',
                            color: theme.accent,
                            marginBottom: '0.5rem',
                            fontWeight: '600',
                          }}>
                            Q{index + 1}: {question}
                          </div>
                          <div style={{
                            fontSize: '0.95rem',
                            color: theme.textPrimary,
                            lineHeight: '1.4',
                          }}>
                            {answers[index]}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Voice method: Audio Player */
                <div style={{
                  backgroundColor: theme.cardBg,
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: `2px solid ${theme.borderAccent}`,
                  boxShadow: `0 4px 20px ${theme.shadow}`,
                }}>
                  <h3 style={{ color: theme.accent, fontSize: '1.2rem', margin: '0 0 1.5rem 0', fontWeight: '600' }}>
                    Voice Recording
                  </h3>

                  {/* Waveform visualization */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '3px',
                    height: '60px',
                    marginBottom: '1.5rem',
                  }}>
                    {Array.from({ length: 40 }, (_, i) => {
                      const height = 15 + Math.sin(i * 0.5) * 20 + ((i * 7 + 3) % 15);
                      const isPlayed = (i / 40) * 100 <= audioProgress;
                      return (
                        <div key={i} style={{
                          width: '4px',
                          height: `${height}px`,
                          backgroundColor: isPlayed ? theme.accent : theme.barBg,
                          borderRadius: '2px',
                          transition: 'background-color 0.2s ease',
                        }} />
                      );
                    })}
                  </div>

                  {/* Controls row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                      onClick={() => {
                        if (audioProgress >= 100) {
                          setAudioProgress(0);
                        }
                        setAudioPlaying(!audioPlaying);
                      }}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: theme.accent,
                        color: theme.textOnAccent,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        flexShrink: 0,
                      }}
                    >
                      {audioPlaying ? '\u23F8' : '\u25B6'}
                    </button>

                    <div
                      style={{ flex: 1, cursor: 'pointer' }}
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const pct = ((e.clientX - rect.left) / rect.width) * 100;
                        setAudioProgress(Math.min(100, Math.max(0, pct)));
                      }}
                    >
                      <div style={{
                        height: '6px',
                        backgroundColor: theme.barBg,
                        borderRadius: '3px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${audioProgress}%`,
                          backgroundColor: theme.accent,
                          borderRadius: '3px',
                          transition: 'width 0.1s linear',
                        }} />
                      </div>
                    </div>

                    <div style={{
                      color: theme.textSecondary,
                      fontSize: '0.85rem',
                      minWidth: '80px',
                      textAlign: 'right',
                      fontFamily: 'monospace',
                    }}>
                      {formatAudioTime(audioProgress)} / 0:30
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Meal Confirmation */}
      {deleteConfirmMeal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.overlayBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200,
        }}>
          <div style={{
            backgroundColor: theme.cardBg,
            borderRadius: '12px',
            padding: '2rem',
            border: `2px solid ${theme.danger}`,
            maxWidth: '400px',
          }}>
            <h3 style={{ color: theme.danger, margin: '0 0 1rem 0' }}>Delete Meal</h3>
            <p style={{ color: theme.textPrimary, margin: '0 0 2rem 0' }}>
              Are you sure you want to delete &quot;{deleteConfirmMeal.name}&quot; from {new Date(deleteConfirmMeal.date).toLocaleDateString()}? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteConfirmMeal(null)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  border: `2px solid ${theme.textMuted}`,
                  backgroundColor: 'transparent',
                  color: theme.textMuted,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteMeal(deleteConfirmMeal)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: theme.danger,
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
