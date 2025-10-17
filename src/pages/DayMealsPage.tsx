import React from "react";

type Language = "fr" | "en" | "mfe" | "rcf";

interface MealData {
  id: number;
  time: string;
  name: string;
  duration: string;
  answers: string[];
  method: 'text' | 'voice';
  date: string;
}

interface DayMealsPageProps {
  language: Language;
  selectedDate: string; // YYYY-MM-DD format
  meals: MealData[];
  onBack: () => void;
  onMealSelect: (meal: MealData) => void;
  onDateChange: (date: string) => void;
}

const translations = {
  fr: {
    mealsFor: "Repas du",
    noMealsLogged: "Aucun repas enregistré",
    noMealsMessage: "Aucun repas n'a été enregistré pour cette journée.",
    addFirstMeal: "Ajoutez votre premier repas pour commencer !",
    previousDay: "Jour précédent",
    nextDay: "Jour suivant",
    voiceRecording: "Enregistrement vocal",
    duration: "Durée",
    dayNames: ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"],
    monthNames: [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ]
  },
  en: {
    mealsFor: "Meals for",
    noMealsLogged: "No meals logged",
    noMealsMessage: "No meals have been logged for this day.",
    addFirstMeal: "Add your first meal to get started!",
    previousDay: "Previous day",
    nextDay: "Next day",
    voiceRecording: "Voice recording",
    duration: "Duration",
    dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    monthNames: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ]
  },
  mfe: {
    mealsFor: "Manze pou",
    noMealsLogged: "Pa ena manze anrezistre",
    noMealsMessage: "Pa ena manze ki anrezistre pou sa zour la.",
    addFirstMeal: "Mete to premye manze pou kominse !",
    previousDay: "Zour devan",
    nextDay: "Zour apre",
    voiceRecording: "Diksyoner",
    duration: "Konbyen tan",
    dayNames: ["Dimans", "Lindi", "Mardi", "Merkredi", "Zedi", "Vandredi", "Samdi"],
    monthNames: [
      "Zanvye", "Fevriye", "Mars", "Avril", "Me", "Zin",
      "Zilye", "Out", "Septam", "Oktob", "Novam", "Desam"
    ]
  },
  rcf: {
    mealsFor: "Manzé pou",
    noMealsLogged: "Pa éna manzé anrézistré",
    noMealsMessage: "Pa éna manzé ki anrézistré pou sa zour la.",
    addFirstMeal: "Mété to prémyé manzé pou kominsé !",
    previousDay: "Zour dévan",
    nextDay: "Zour apré",
    voiceRecording: "Diksyoné",
    duration: "Konbyèn tan",
    dayNames: ["Dimans", "Lindi", "Mardi", "Mèrkredi", "Zédi", "Vandredi", "Samdi"],
    monthNames: [
      "Zanvyé", "Févriyé", "Mars", "Avril", "Mé", "Zin",
      "Zilé", "Out", "Sèptam", "Oktob", "Novam", "Désam"
    ]
  }
};

const DayMealsPage: React.FC<DayMealsPageProps> = ({
  language,
  selectedDate,
  meals,
  onBack,
  onMealSelect,
  onDateChange,
}) => {
  const t = translations[language];
  
  // Filter meals for the selected date
  const dayMeals = meals
    .filter(meal => meal.date === selectedDate)
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
    .map(meal => ({
      fullMeal: meal,
      type: meal.name,
      time: new Date(meal.time).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      name: meal.name,
      duration: meal.duration,
      isVoice: meal.method === 'voice'
    }));

  // Format the selected date for display
  const selectedDateObj = new Date(selectedDate + 'T00:00:00');
  const dayName = t.dayNames[selectedDateObj.getDay()];
  const monthName = t.monthNames[selectedDateObj.getMonth()];
  const dayNumber = selectedDateObj.getDate();
  const year = selectedDateObj.getFullYear();
  
  // Navigation functions
  const goToPreviousDay = () => {
    const prevDate = new Date(selectedDate + 'T00:00:00');
    prevDate.setDate(prevDate.getDate() - 1);
    const newDate = prevDate.toISOString().split('T')[0];
    onDateChange(newDate);
  };
  
  const goToNextDay = () => {
    const nextDate = new Date(selectedDate + 'T00:00:00');
    nextDate.setDate(nextDate.getDate() + 1);
    const newDate = nextDate.toISOString().split('T')[0];
    onDateChange(newDate);
  };

  return (
    <>
      <div className="app-header">
        <button onClick={onBack} className="header-icon">
          ←
        </button>
        <h1 className="app-header-title">
          {t.mealsFor}
        </h1>
        <div></div>
      </div>
      
      <div className="page-content-full">
        <div style={{ 
          maxWidth: '600px', 
          margin: '0 auto', 
          padding: '0 1rem'
        }}>
          
          {/* Date header with navigation */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid #f0f0f0'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <button
                onClick={goToPreviousDay}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  color: 'white',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  minWidth: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={t.previousDay}
              >
                ←
              </button>
              
              <div style={{ textAlign: 'center', flex: 1, margin: '0 1rem' }}>
                <div style={{ 
                  fontSize: '1.8rem', 
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  marginBottom: '0.25rem'
                }}>
                  {dayName}
                </div>
                <div style={{ 
                  fontSize: '1.1rem', 
                  color: '#666',
                  fontWeight: '500'
                }}>
                  {dayNumber} {monthName} {year}
                </div>
              </div>
              
              <button
                onClick={goToNextDay}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.75rem',
                  color: 'white',
                  fontSize: '1.2rem',
                  cursor: 'pointer',
                  minWidth: '50px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={t.nextDay}
              >
                →
              </button>
            </div>
            
            {/* Meal count indicator */}
            <div style={{ 
              textAlign: 'center', 
              fontSize: '0.95rem', 
              color: '#888',
              padding: '0.5rem',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              {dayMeals.length === 0 ? t.noMealsLogged : `${dayMeals.length} meal${dayMeals.length !== 1 ? 's' : ''}`}
            </div>
          </div>
          
          {/* Meals list */}
          {dayMeals.length === 0 ? (
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '3rem 1.5rem',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: '1px solid #f0f0f0'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
              <h3 style={{ 
                margin: '0 0 0.5rem 0', 
                fontSize: '1.2rem', 
                color: '#333' 
              }}>
                {t.noMealsLogged}
              </h3>
              <p style={{ 
                margin: '0 0 0.5rem 0', 
                color: '#666',
                fontSize: '0.95rem'
              }}>
                {t.noMealsMessage}
              </p>
              <p style={{ 
                margin: 0, 
                color: '#888',
                fontSize: '0.9rem',
                fontStyle: 'italic'
              }}>
                {t.addFirstMeal}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {dayMeals.map((meal) => (
                <div 
                  key={meal.fullMeal.id}
                  onClick={() => onMealSelect(meal.fullMeal)}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    border: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      fontSize: '2rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '12px',
                      padding: '0.75rem',
                      minWidth: '60px',
                      textAlign: 'center'
                    }}>
                      🍽️
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.5rem',
                        marginBottom: '0.5rem'
                      }}>
                        <h4 style={{ 
                          margin: 0, 
                          fontSize: '1.1rem', 
                          color: '#333',
                          fontWeight: '600'
                        }}>
                          {meal.type}
                        </h4>
                        <span style={{ 
                          fontSize: '0.9rem', 
                          color: '#667eea',
                          fontWeight: '500'
                        }}>
                          • {meal.time}
                        </span>
                      </div>
                      
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1rem',
                        flexWrap: 'wrap'
                      }}>
                        <div style={{ 
                          fontSize: '0.9rem', 
                          color: '#666',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <span>{t.duration}:</span>
                          <span style={{ fontWeight: '500' }}>{meal.duration}</span>
                        </div>
                        
                        {meal.isVoice && (
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem',
                            color: '#667eea',
                            fontSize: '0.85rem'
                          }}>
                            <svg style={{ width: '16px', height: '16px', fill: '#667eea' }} viewBox="0 0 24 24">
                              <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                            </svg>
                            <span>{t.voiceRecording}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div style={{ 
                      color: '#ccc', 
                      fontSize: '1.2rem',
                      alignSelf: 'center'
                    }}>
                      →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default DayMealsPage;