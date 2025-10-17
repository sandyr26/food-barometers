import React, { useState } from "react";

type Language = "fr" | "en" | "mfe" | "rcf";

interface MealData {
  id: number;
  time: string;
  name: string;
  duration: string;
  answers: string[];
}

interface CalendarPageProps {
  language: Language;
  meals: MealData[];
  onBack: () => void;
  onDaySelect: (date: string) => void;
}

const translations = {
  fr: {
    title: "Calendrier des Repas",
    prevMonth: "← Mois précédent",
    nextMonth: "Mois suivant →",
    mealsLogged: "repas enregistrés",
    noMeals: "Aucun repas",
    legend: "Légende:",
    lowActivity: "Faible activité (1-2 repas)",
    moderateActivity: "Activité modérée (3-4 repas)",
    highActivity: "Forte activité (5+ repas)"
  },
  en: {
    title: "Meal Calendar",
    prevMonth: "← Previous Month",
    nextMonth: "Next Month →",
    mealsLogged: "meals logged",
    noMeals: "No meals",
    legend: "Legend:",
    lowActivity: "Low activity (1-2 meals)",
    moderateActivity: "Moderate activity (3-4 meals)",
    highActivity: "High activity (5+ meals)"
  },
  mfe: {
    title: "Kalandriye Manze",
    prevMonth: "← Mwa Devan",
    nextMonth: "Mwa Apre →",
    mealsLogged: "manze anrezistre",
    noMeals: "Pa ena manze",
    legend: "Lezann:",
    lowActivity: "Aktivite fèb (1-2 manze)",
    moderateActivity: "Aktivite modere (3-4 manze)",
    highActivity: "Aktivite fo (5+ manze)"
  },
  rcf: {
    title: "Kalandriye Manzé",
    prevMonth: "← Mwa Douvan",
    nextMonth: "Mwa Dèyè →",
    mealsLogged: "manzé ki anrèjistré",
    noMeals: "Pa ni manzé",
    legend: "Lèjann:",
    lowActivity: "Aktivité fèb (1-2 manzé)",
    moderateActivity: "Aktivité modéré (3-4 manzé)",
    highActivity: "Aktivité fò (5+ manzé)"
  }
};

const CalendarPage: React.FC<CalendarPageProps> = ({ language, meals, onBack, onDaySelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const t = translations[language];

  // Get first day of the month and number of days in month
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  // Get meals count for each day
  const getMealsForDay = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = date.toISOString().split('T')[0];
    return meals.filter(meal => {
      const mealDate = new Date(meal.time).toISOString().split('T')[0];
      return mealDate === dateStr;
    });
  };

  const getActivityColor = (mealCount: number) => {
    if (mealCount === 0) return '#f5f5f5';
    if (mealCount <= 2) return '#e8f5e8';
    if (mealCount <= 4) return '#a8d5a8';
    return '#4a9d4a';
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(currentDate.getMonth() - 1);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // Create calendar grid
  const calendarDays = [];
  
  // Add empty cells for days before the first day of month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayMeals = getMealsForDay(day);
    const mealCount = dayMeals.length;
    
    // Create the date string for this day
    const dayDate = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    calendarDays.push(
      <div 
        key={day} 
        className="calendar-day"
        style={{ 
          backgroundColor: getActivityColor(mealCount),
          cursor: 'pointer'
        }}
        onClick={() => onDaySelect(dayDate)}
        title={`${day} - ${mealCount > 0 ? `${mealCount} ${t.mealsLogged}` : t.noMeals}`}
      >
        <div className="day-number">{day}</div>
        <div className="meal-count">
          {mealCount > 0 ? `${mealCount}` : ''}
        </div>
      </div>
    );
  }

  const monthNames = {
    fr: [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ],
    en: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
    mfe: [
      'Zanvye', 'Fevriye', 'Mars', 'Avril', 'Me', 'Zin',
      'Zilye', 'Out', 'Septam', 'Oktob', 'Novam', 'Desam'
    ],
    rcf: [
      'Janvyé', 'Févryé', 'Mas', 'Avril', 'Mé', 'Jin',
      'Jiyè', 'Out', 'Sèptanm', 'Oktòb', 'Novanm', 'Désanm'
    ]
  };

  const dayNames = {
    fr: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    mfe: ['Dim', 'Lin', 'Mar', 'Mer', 'Zed', 'Van', 'Sam'],
    rcf: ['Dim', 'Lin', 'Madi', 'Mèkrédi', 'Jédi', 'Vanndrédi', 'Samdi']
  };

  return (
    <>
      <div className="app-header">
        <button onClick={onBack} className="header-icon">
          ←
        </button>
        <h1 className="app-header-title">
          {t.title}
        </h1>
        <div></div>
      </div>
      <div className="page-content-full">
        <div className="calendar-page">
          <style>
            {`
              .calendar-page {
                padding: 10px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                width: 100%;
                overflow-x: hidden;
                box-sizing: border-box;
                border-radius: 16px;
                margin-bottom: 20px;
              }
          
          .calendar-header {
            text-align: center;
            margin-bottom: 20px;
          }
          
          .calendar-navigation {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            max-width: 400px;
            margin: 0 auto 20px;
          }
          
          .nav-button {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            padding: 10px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s ease;
          }
          
          .nav-button:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
          }
          
          .current-month {
            font-size: 20px;
            font-weight: bold;
          }
          
          .calendar-grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 2px;
            width: 100%;
            margin: 0;
            background: rgba(255, 255, 255, 0.1);
            padding: 8px;
            border-radius: 12px;
            backdrop-filter: blur(10px);
            box-sizing: border-box;
            max-width: 100%;
            overflow: hidden;
          }
          
          .day-header {
            text-align: center;
            font-weight: bold;
            padding: 10px 5px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            font-size: 14px;
          }
          
          .calendar-day {
            aspect-ratio: 1;
            border-radius: 6px;
            padding: 4px;
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-height: 50px;
            max-width: 100%;
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.2s ease;
            font-size: 12px;
            box-sizing: border-box;
          }
          
          .calendar-day:hover:not(.empty) {
            transform: scale(1.05);
          }
          
          .calendar-day.empty {
            background: transparent !important;
            border: none;
          }
          
          .day-number {
            font-weight: bold;
            font-size: 14px;
            color: #333;
          }
          
          .meal-count {
            font-size: 10px;
            color: #666;
            margin-top: 2px;
            line-height: 1.1;
          }
          
          .calendar-legend {
            margin-top: 20px;
            margin-bottom: 20px;
            width: 100%;
            margin-left: auto;
            margin-right: auto;
            box-sizing: border-box;
            padding-bottom: 20px;
          }
          
          .legend-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            text-align: center;
          }
          
          .legend-items {
            display: flex;
            flex-wrap: nowrap;
            gap: 15px;
            justify-content: center;
            overflow-x: auto;
          }
          
          .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
            background: rgba(255, 255, 255, 0.1);
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 14px;
          }
          
          .legend-color {
            width: 20px;
            height: 20px;
            border-radius: 4px;
            border: 1px solid rgba(255, 255, 255, 0.3);
          }
          
            @media (max-width: 768px) {
            .calendar-page {
              padding: 5px;
            }
            
            .calendar-grid {
              gap: 1px;
              padding: 6px;
            }
            
            .calendar-day {
              min-height: 40px;
              padding: 2px;
              font-size: 10px;
            }
            
            .day-number {
              font-size: 12px;
            }
            
            .meal-count {
              font-size: 9px;
            }
            
            .legend-items {
              gap: 8px;
            }
            
            .legend-item {
              font-size: 11px;
              padding: 4px 8px;
            }
          }
        `}
      </style>
      
      <div className="calendar-header">
        <div className="calendar-navigation">
          <button className="nav-button" onClick={() => navigateMonth('prev')}>
            {t.prevMonth}
          </button>
          <div className="current-month">
            {monthNames[language][currentDate.getMonth()]} {currentDate.getFullYear()}
          </div>
          <button className="nav-button" onClick={() => navigateMonth('next')}>
            {t.nextMonth}
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        {dayNames[language].map((day, index) => (
          <div key={index} className="day-header">
            {day}
          </div>
        ))}
        {calendarDays}
      </div>

      <div className="calendar-legend">
        <h3 className="legend-title">{t.legend}</h3>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#f5f5f5' }}></div>
            <span>{t.noMeals}</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#e8f5e8' }}></div>
            <span>{t.lowActivity}</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#a8d5a8' }}></div>
            <span>{t.moderateActivity}</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#4a9d4a' }}></div>
            <span>{t.highActivity}</span>
          </div>
        </div>
      </div>
        </div>
      </div>
    </>
  );
};

export default CalendarPage;