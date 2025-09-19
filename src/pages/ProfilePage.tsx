import React, { useState } from 'react';

type Language = 'fr' | 'en' | 'mfe' | 'rcf';

interface ProfilePageProps {
  language: Language;
  onBack: () => void;
  onLanguageChange: (lang: Language) => void;
}

const translations = {
  fr: {
    profile: "Profil",
    personalInfo: "Informations personnelles",
    settings: "Paramètres",
    goals: "Objectifs",
    statistics: "Statistiques",
    name: "Nom",
    email: "Email",
    age: "Âge",
    height: "Taille",
    weight: "Poids",
    dailyCalorieGoal: "Objectif calorique quotidien",
    waterGoal: "Objectif d'hydratation",
    language: "Langue",
    notifications: "Notifications",
    dataExport: "Exporter mes données",
    logout: "Se déconnecter",
    edit: "Modifier",
    save: "Sauvegarder",
    cancel: "Annuler",
    calories: "calories",
    glasses: "verres",
    cm: "cm",
    kg: "kg",
    years: "ans",
    french: "Français",
    english: "English",
    mauritian: "Kreol Morisien",
    reunion: "Kreol Réunionnais",
    weeklyStats: "Statistiques hebdomadaires",
    averageCalories: "Calories moyennes",
    waterConsumption: "Consommation d'eau",
    mealsLogged: "Repas enregistrés",
    enabled: "Activé",
    disabled: "Désactivé"
  },
  en: {
    profile: "Profile",
    personalInfo: "Personal information",
    settings: "Settings",
    goals: "Goals", 
    statistics: "Statistics",
    name: "Name",
    email: "Email",
    age: "Age",
    height: "Height",
    weight: "Weight",
    dailyCalorieGoal: "Daily calorie goal",
    waterGoal: "Water goal",
    language: "Language",
    notifications: "Notifications",
    dataExport: "Export my data",
    logout: "Logout",
    edit: "Edit",
    save: "Save",
    cancel: "Cancel",
    calories: "calories",
    glasses: "glasses",
    cm: "cm",
    kg: "kg",
    years: "years",
    french: "Français",
    english: "English",
    mauritian: "Kreol Morisien",
    reunion: "Kreol Réunionnais",
    weeklyStats: "Weekly statistics",
    averageCalories: "Average calories",
    waterConsumption: "Water consumption",
    mealsLogged: "Meals logged",
    enabled: "Enabled",
    disabled: "Disabled"
  },
  mfe: {
    profile: "Profil",
    personalInfo: "Informasyon personel",
    settings: "Parametr",
    goals: "Objetif",
    statistics: "Statistik",
    name: "Non",
    email: "Email",
    age: "Laz",
    height: "Oteur",
    weight: "Pwa",
    dailyCalorieGoal: "Objetif kalori zournalye",
    waterGoal: "Objetif dilo",
    language: "Lang",
    notifications: "Notifikasyon",
    dataExport: "Export mo done",
    logout: "Dekonte",
    edit: "Modifye",
    save: "Sov",
    cancel: "Aret",
    calories: "kalori",
    glasses: "ver",
    cm: "cm",
    kg: "kg",
    years: "ane",
    french: "Franse",
    english: "Angle",
    mauritian: "Kreol Morisien",
    reunion: "Kreol Reunion",
    weeklyStats: "Statistik lasemen",
    averageCalories: "Kalori mwayen",
    waterConsumption: "Konsèm dilo",
    mealsLogged: "Manze enrezistre",
    enabled: "Aktive",
    disabled: "Desaktive"
  },
  rcf: {
    profile: "Profil",
    personalInfo: "Informasyon pèrsonèl",
    settings: "Paramètr",
    goals: "Objetif",
    statistics: "Statistik",
    name: "Non",
    email: "Email", 
    age: "Laz",
    height: "Otèr",
    weight: "Pwa",
    dailyCalorieGoal: "Objetif kalori zournalé",
    waterGoal: "Objetif dilo",
    language: "Lang",
    notifications: "Notifikasyon",
    dataExport: "Èksport amonk doné",
    logout: "Dékonèkt",
    edit: "Modifyé",
    save: "Sové",
    cancel: "Arèt",
    calories: "kalori",
    glasses: "vèr",
    cm: "cm",
    kg: "kg",
    years: "ané",
    french: "Fransé",
    english: "Anglé",
    mauritian: "Kréol Morisyin",
    reunion: "Kréol Rényoné",
    weeklyStats: "Statistik lasmèn",
    averageCalories: "Kalori mwayèn",
    waterConsumption: "Konsèrm dilo",
    mealsLogged: "Manzé anrèzistrè",
    enabled: "Aktivé",
    disabled: "Dèzaktivé"
  }
};

const ProfilePage: React.FC<ProfilePageProps> = ({ language, onBack, onLanguageChange }) => {
  const t = translations[language];
  const [editMode, setEditMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const [profileData, setProfileData] = useState({
    name: "Marie Dupont",
    email: "marie.dupont@email.com",
    age: "28",
    height: "165",
    weight: "58",
    calorieGoal: "1800",
    waterGoal: "8"
  });

  const [tempData, setTempData] = useState(profileData);

  const handleEdit = () => {
    setTempData(profileData);
    setEditMode(true);
  };

  const handleSave = () => {
    setProfileData(tempData);
    setEditMode(false);
  };

  const handleCancel = () => {
    setTempData(profileData);
    setEditMode(false);
  };

  const languageOptions = [
    { value: 'fr', label: t.french },
    { value: 'en', label: t.english },
    { value: 'mfe', label: t.mauritian },
    { value: 'rcf', label: t.reunion }
  ];

  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}>
          ←
        </button>
        <h1 style={{ margin: '0 auto', fontSize: '1.5rem', color: '#667eea' }}>
          {t.profile}
        </h1>
      </div>

      {/* Personal Information */}
      <div className="profile-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>{t.personalInfo}</h2>
          {!editMode ? (
            <button onClick={handleEdit} className="btn btn-secondary btn-sm">
              {t.edit}
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={handleSave} className="btn btn-primary btn-sm">
                {t.save}
              </button>
              <button onClick={handleCancel} className="btn btn-secondary btn-sm">
                {t.cancel}
              </button>
            </div>
          )}
        </div>

        <div className="profile-info">
          <div className="info-row">
            <label>{t.name}:</label>
            {editMode ? (
              <input
                type="text"
                value={tempData.name}
                onChange={(e) => setTempData({...tempData, name: e.target.value})}
                className="input-field"
              />
            ) : (
              <span>{profileData.name}</span>
            )}
          </div>

          <div className="info-row">
            <label>{t.email}:</label>
            {editMode ? (
              <input
                type="email"
                value={tempData.email}
                onChange={(e) => setTempData({...tempData, email: e.target.value})}
                className="input-field"
              />
            ) : (
              <span>{profileData.email}</span>
            )}
          </div>

          <div className="info-row">
            <label>{t.age}:</label>
            {editMode ? (
              <input
                type="number"
                value={tempData.age}
                onChange={(e) => setTempData({...tempData, age: e.target.value})}
                className="input-field"
              />
            ) : (
              <span>{profileData.age} {t.years}</span>
            )}
          </div>

          <div className="info-row">
            <label>{t.height}:</label>
            {editMode ? (
              <input
                type="number"
                value={tempData.height}
                onChange={(e) => setTempData({...tempData, height: e.target.value})}
                className="input-field"
              />
            ) : (
              <span>{profileData.height} {t.cm}</span>
            )}
          </div>

          <div className="info-row">
            <label>{t.weight}:</label>
            {editMode ? (
              <input
                type="number"
                value={tempData.weight}
                onChange={(e) => setTempData({...tempData, weight: e.target.value})}
                className="input-field"
              />
            ) : (
              <span>{profileData.weight} {t.kg}</span>
            )}
          </div>
        </div>
      </div>

      {/* Goals */}
      <div className="profile-section">
        <h2>{t.goals}</h2>
        <div className="profile-info">
          <div className="info-row">
            <label>{t.dailyCalorieGoal}:</label>
            {editMode ? (
              <input
                type="number"
                value={tempData.calorieGoal}
                onChange={(e) => setTempData({...tempData, calorieGoal: e.target.value})}
                className="input-field"
              />
            ) : (
              <span>{profileData.calorieGoal} {t.calories}</span>
            )}
          </div>

          <div className="info-row">
            <label>{t.waterGoal}:</label>
            {editMode ? (
              <input
                type="number"
                value={tempData.waterGoal}
                onChange={(e) => setTempData({...tempData, waterGoal: e.target.value})}
                className="input-field"
              />
            ) : (
              <span>{profileData.waterGoal} {t.glasses}</span>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Statistics */}
      <div className="profile-section">
        <h2>{t.weeklyStats}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div className="stat-card">
            <h3>1,654</h3>
            <p>{t.averageCalories}</p>
          </div>
          <div className="stat-card">
            <h3>7.2</h3>
            <p>{t.waterConsumption}</p>
          </div>
          <div className="stat-card">
            <h3>18</h3>
            <p>{t.mealsLogged}</p>
          </div>
          <div className="stat-card">
            <h3>85%</h3>
            <p>{t.goals}</p>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="profile-section">
        <h2>{t.settings}</h2>
        <div className="profile-info">
          <div className="info-row">
            <label>{t.language}:</label>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              className="input-field"
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="info-row">
            <label>{t.notifications}:</label>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`toggle-btn ${notificationsEnabled ? 'active' : ''}`}
            >
              {notificationsEnabled ? t.enabled : t.disabled}
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button className="btn btn-secondary">
          📊 {t.dataExport}
        </button>
        <button 
          className="btn btn-danger"
          onClick={() => {
            if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
              // Handle logout
              alert('Déconnexion...');
            }
          }}
        >
          🚪 {t.logout}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;