import React from 'react';

type Language = 'fr' | 'en' | 'mfe' | 'rcf';
type Page = 'splash' | 'auth' | 'register' | 'home' | 'addMeal' | 'profile' | 'notifications';

interface HomePageProps {
  language: Language;
  onNavigate: (page: Page) => void;
}

const translations = {
  fr: {
    welcome: "Bienvenue sur FOOD BAROMETERS",
    todaysMeals: "Repas d'aujourd'hui",
    addMeal: "Ajouter un repas",
    myStats: "Mes statistiques",
    recommendations: "Recommandations",
    breakfast: "Petit-déjeuner",
    lunch: "Déjeuner", 
    dinner: "Dîner",
    snack: "Collation",
    calories: "calories",
    waterIntake: "Consommation d'eau",
    glasses: "verres",
    dailyGoal: "Objectif journalier",
    weeklyProgress: "Progrès hebdomadaire",
    nutritionTips: "Conseils nutrition",
    tip1: "Buvez au moins 8 verres d'eau par jour",
    tip2: "Incluez des légumes dans chaque repas",
    tip3: "Préférez les céréales complètes"
  },
  en: {
    welcome: "Welcome to FOOD BAROMETERS",
    todaysMeals: "Today's meals",
    addMeal: "Add meal",
    myStats: "My statistics",
    recommendations: "Recommendations",
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner", 
    snack: "Snack",
    calories: "calories",
    waterIntake: "Water intake",
    glasses: "glasses",
    dailyGoal: "Daily goal",
    weeklyProgress: "Weekly progress",
    nutritionTips: "Nutrition tips",
    tip1: "Drink at least 8 glasses of water daily",
    tip2: "Include vegetables in every meal",
    tip3: "Choose whole grains"
  },
  mfe: {
    welcome: "Byenvini lor FOOD BAROMETERS",
    todaysMeals: "Manze zordi",
    addMeal: "Azout manze",
    myStats: "Mo statistik",
    recommendations: "Rekomandasyon",
    breakfast: "Dezepe",
    lunch: "Dine",
    dinner: "Soupe",
    snack: "Kolasyon",
    calories: "kalori",
    waterIntake: "Konsèm dilo",
    glasses: "ver",
    dailyGoal: "Objetif zournalye",
    weeklyProgress: "Progre lasemen",
    nutritionTips: "Konsey nitrisyon",
    tip1: "Bwar omwin 8 ver dilo sak zour",
    tip2: "Met legim dan sak manze",
    tip3: "Prefer sereal konplet"
  },
  rcf: {
    welcome: "Byenvini lor FOOD BAROMETERS",
    todaysMeals: "Manzé zordi",
    addMeal: "Azout manzé",
    myStats: "Amonk statistik",
    recommendations: "Rèkomandasyon",
    breakfast: "Dézépé",
    lunch: "Diné",
    dinner: "Soupé",
    snack: "Kolasyon",
    calories: "kalori",
    waterIntake: "Konsèrm dilo",
    glasses: "vèr",
    dailyGoal: "Objetif zournalé",
    weeklyProgress: "Progré lasmèn",
    nutritionTips: "Konsèy nitrisyon",
    tip1: "Bwar omwin 8 vèr dilo sak zour",
    tip2: "Mèt légim dan sak manzé",
    tip3: "Préfèr sèrèal konplè"
  }
};

const HomePage: React.FC<HomePageProps> = ({ language, onNavigate }) => {
  const t = translations[language];

  const todaysMeals = [
    { type: t.breakfast, food: "Pain complet + Confiture", calories: "320" },
    { type: t.lunch, food: "Riz + Poisson + Légumes", calories: "580" },
    { type: t.dinner, food: "Salade + Poulet grillé", calories: "420" }
  ];

  return (
    <div className="page-content">
      <h1 style={{ 
        fontSize: '1.8rem', 
        color: '#667eea', 
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        {t.welcome}
      </h1>

      {/* Quick stats */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }}>
        <div className="stat-card">
          <h3>1,320</h3>
          <p>{t.calories}</p>
        </div>
        <div className="stat-card">
          <h3>6/8</h3>
          <p>{t.waterIntake}</p>
        </div>
      </div>

      {/* Today's meals */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#333' }}>
          {t.todaysMeals}
        </h2>
        {todaysMeals.map((meal, index) => (
          <div key={index} className="meal-card">
            <div>
              <h4>{meal.type}</h4>
              <p>{meal.food}</p>
            </div>
            <span className="calories-badge">{meal.calories} {t.calories}</span>
          </div>
        ))}
      </div>

      {/* Add meal button */}
      <button 
        className="btn btn-primary"
        onClick={() => onNavigate('addMeal')}
        style={{ 
          width: '100%', 
          marginBottom: '2rem',
          padding: '1rem',
          fontSize: '1.1rem'
        }}
      >
        ➕ {t.addMeal}
      </button>

      {/* Weekly progress */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#333' }}>
          {t.weeklyProgress}
        </h2>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: '75%' }}></div>
        </div>
        <p style={{ textAlign: 'center', marginTop: '0.5rem', color: '#666' }}>
          75% {t.dailyGoal}
        </p>
      </div>

      {/* Nutrition tips */}
      <div>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#333' }}>
          {t.nutritionTips}
        </h2>
        <div className="tips-container">
          <div className="tip-item">💧 {t.tip1}</div>
          <div className="tip-item">🥬 {t.tip2}</div>
          <div className="tip-item">🌾 {t.tip3}</div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;