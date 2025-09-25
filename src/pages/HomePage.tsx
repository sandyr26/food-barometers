import React from "react";

type Language = "fr" | "en" | "mfe" | "rcf";
type Page =
  | "splash"
  | "auth"
  | "register"
  | "home"
  | "addMeal"
  | "profile"
  | "notifications"
  | "calendar";

interface MealData {
  id: number;
  time: string;
  name: string;
  duration: string;
  answers: string[];
  method: 'text' | 'voice';
  date: string;
}

interface HomePageProps {
  language: Language;
  onNavigate: (page: Page) => void;
  name?: string;
  meals: MealData[];
}

const translations = {
  fr: {
    welcome: "Bienvenue sur FOOD BAROMETERS",
    welcomeUser: "Bienvenue",
    todaysMeals: "Repas d'aujourd'hui",
    addMeal: "Ajouter un repas",
    myStats: "Mes statistiques",
    recommendations: "Recommandations",
    breakfast: "Petit-déjeuner",
    lunch: "Déjeuner",
    dinner: "Dîner",
    snack: "Collation",
    calories: "Info 1",
    waterIntake: "Info 2",
    glasses: "verres",
    dailyGoal: "Objectif journalier",
    weeklyProgress: "Jours",
    days: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
    nutritionTips: "Conseils nutrition",
    tip1: "Buvez au moins 8 verres d'eau par jour",
    tip2: "Incluez des légumes dans chaque repas",
    tip3: "Préférez les céréales complètes",
  },
  en: {
    welcome: "Welcome to FOOD BAROMETERS",
    welcomeUser: "Welcome",
    todaysMeals: "Today's meals",
    addMeal: "Add meal",
    myStats: "My statistics",
    recommendations: "Recommendations",
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    snack: "Snack",
    calories: "Info 1",
    waterIntake: "Info 2",
    glasses: "glasses",
    dailyGoal: "Daily goal",
    weeklyProgress: "Days",
    days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    nutritionTips: "Nutrition tips",
    tip1: "Drink at least 8 glasses of water daily",
    tip2: "Include vegetables in every meal",
    tip3: "Choose whole grains",
  },
  mfe: {
    welcome: "Byenvini lor FOOD BAROMETERS",
    welcomeUser: "Byenvini",
    todaysMeals: "Manze zordi",
    addMeal: "Azout manze",
    myStats: "Mo statistik",
    recommendations: "Rekomandasyon",
    breakfast: "Dezepe",
    lunch: "Dine",
    dinner: "Soupe",
    snack: "Kolasyon",
    calories: "Info 1",
    waterIntake: "Info 2",
    glasses: "ver",
    dailyGoal: "Objetif zournalye",
    weeklyProgress: "Zour",
    days: ["Lun", "Mar", "Mer", "Zed", "Ven", "Sam", "Dim"],
    nutritionTips: "Konsey nitrisyon",
    tip1: "Bwar omwin 8 ver dilo sak zour",
    tip2: "Met legim dan sak manze",
    tip3: "Prefer sereal konplet",
  },
  rcf: {
    welcome: "Byenvini lor FOOD BAROMETERS",
    welcomeUser: "Byenvini",
    todaysMeals: "Manzé zordi",
    addMeal: "Azout manzé",
    myStats: "Amonk statistik",
    recommendations: "Rèkomandasyon",
    breakfast: "Dézépé",
    lunch: "Diné",
    dinner: "Soupé",
    snack: "Kolasyon",
    calories: "Info 1",
    waterIntake: "Info 2",
    glasses: "vèr",
    dailyGoal: "Objetif zournalé",
    weeklyProgress: "Zour",
    days: ["Lun", "Mar", "Mèr", "Zed", "Ven", "Sam", "Dim"],
    nutritionTips: "Konsèy nitrisyon",
    tip1: "Bwar omwin 8 vèr dilo sak zour",
    tip2: "Mèt légim dan sak manzé",
    tip3: "Préfèr sèrèal konplè",
  },
};

const HomePage: React.FC<HomePageProps> = ({
  language,
  onNavigate,
  name = "User",
  meals = [],
}) => {
  const t = translations[language];

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Filter meals for today and convert to display format
  const todaysMeals = meals
    .filter(meal => meal.date === today)
    .map(meal => ({
      fullMeal: meal,
      type: meal.name,
      time: new Date(meal.time).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      }),
      name: meal.answers[2] || meal.name, // Use food description from answers if available
      duration: meal.duration,
      isVoice: meal.method === 'voice'
    }));

  // Sample weekly data - number of meals logged per day (0-5)
  // Friday morning scenario: Mon-Thu have meals, Fri-Sun have no meals yet
  const weeklyData = [3, 2, 4, 0, 0, 0, 0]; // Mon to Sun
  const currentDayIndex = 4; // Friday (0=Monday, 4=Friday)

  const getDayColor = (mealsLogged: number, dayIndex: number) => {
    // Future days (after current day) should be grey
    if (dayIndex > currentDayIndex) return "#95a5a6"; // Grey - future days
    // Past/current days with no meals logged should be red
    if (mealsLogged === 0) return "#ff4757"; // Red - not logged at all
    if (mealsLogged >= 3) return "#2ed573"; // Green - logged at least 3 meals
    return "#ffa502"; // Yellow - logged less than 3 meals
  };

  return (
    <>
      <div className="page-content-full">
        {/* Welcome message */}
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <h2
            style={{
              color: "#667eea",
              fontSize: "1.5rem",
              marginBottom: "0.5rem",
            }}
          >
            {t.welcomeUser} {name}
          </h2>
        </div>

      {/* Today's meals */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem", color: "#333" }}>
          {t.todaysMeals}
        </h2>
        {todaysMeals.length === 0 ? (
          <div className="meal-card" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            <p>No meals logged yet</p>
            <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Add your first meal to get started!</p>
          </div>
        ) : (
          todaysMeals.map((meal) => (
            <div key={meal.fullMeal.id} className="meal-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  {meal.isVoice ? (
                    <>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: '#333', marginBottom: '0.5rem' }}>{meal.type}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <svg style={{ width: '18px', height: '18px', fill: '#667eea' }} viewBox="0 0 24 24">
                          <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                        </svg>
                        <span style={{ color: '#667eea', fontSize: '0.9rem' }}>Voice recording</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1rem', color: '#333' }}>{meal.type}</h4>
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>• {meal.time}</span>
                      </div>
                      <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', color: '#555' }}>{meal.name}</p>
                      <div style={{ fontSize: '0.9rem', color: '#888' }}>
                        Duration: {meal.duration}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add meal button */}
      <button
        className="btn btn-primary"
        onClick={() => onNavigate("addMeal")}
        style={{
          width: "100%",
          marginBottom: "2rem",
          padding: "1rem",
          fontSize: "1.1rem",
          display: "block",
          margin: "0 auto 2rem auto",
        }}
      >
        ➕ {t.addMeal}
      </button>

      {/* Weekly progress - Days */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem", color: "#333" }}>
          {t.weeklyProgress}
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          {t.days.map((day, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "0.75rem 0.5rem",
                borderRadius: "8px",
                backgroundColor: getDayColor(weeklyData[index], index),
                color: "white",
                fontSize: "0.9rem",
                fontWeight: "600",
                minHeight: "60px",
                justifyContent: "center",
              }}
            >
              <div style={{ marginBottom: "0.25rem" }}>{day}</div>
              <div style={{ fontSize: "0.7rem", opacity: 0.9 }}>
                {weeklyData[index]} meals
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "0.75rem",
            fontSize: "0.8rem",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#ff4757",
                borderRadius: "2px",
              }}
            ></div>
            <span>No meals</span>
          </div>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#ffa502",
                borderRadius: "2px",
              }}
            ></div>
            <span>&lt;3 meals</span>
          </div>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
          >
            <div
              style={{
                width: "12px",
                height: "12px",
                backgroundColor: "#2ed573",
                borderRadius: "2px",
              }}
            ></div>
            <span>3+ meals</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem", color: "#333" }}>
          Info
        </h2>
        {/* Quick stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginBottom: "0",
          }}
        >
        <div className="stat-card">
          <h3>1,320</h3>
          <p>{t.calories}</p>
        </div>
        <div className="stat-card">
          <h3>6/8</h3>
          <p>{t.waterIntake}</p>
        </div>
        </div>
      </div>

        {/* Nutrition tips */}
        <div>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem", color: "#333" }}>
            {t.nutritionTips}
          </h2>
          <div className="tips-container">
            <div className="tip-item">💧 {t.tip1}</div>
            <div className="tip-item">🥬 {t.tip2}</div>
            <div className="tip-item">🌾 {t.tip3}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
