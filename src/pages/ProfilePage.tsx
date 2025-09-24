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
    <>
      <div className="app-header">
        <button onClick={onBack} className="header-icon">
          ←
        </button>
        <h1 className="app-header-title">
          {t.profile}
        </h1>
        <div></div>
      </div>
      <div className="page-content-full">

      {/* Profile Header with Avatar */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        padding: '2rem 1rem',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="white" fill-opacity="0.1"%3E%3Cpath d="M20 20c0 0-8-8-8-8s8-8 8-8 8 8 8 8-8 8-8 8z"/%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.1
        }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Avatar */}
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
            border: '3px solid rgba(255, 255, 255, 0.3)'
          }}>
            👤
          </div>
          
          <h2 style={{ 
            margin: '0 0 0.5rem 0', 
            fontSize: '1.5rem', 
            fontWeight: '600' 
          }}>
            {profileData.name}
          </h2>
          
          <p style={{ 
            margin: 0, 
            opacity: 0.9, 
            fontSize: '0.9rem' 
          }}>
            {profileData.email}
          </p>
          
          {/* Edit Button */}
          {!editMode ? (
            <button 
              onClick={handleEdit} 
              style={{
                marginTop: '1rem',
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                margin: '1rem auto 0'
              }}
            >
              ✏️ {t.edit}
            </button>
          ) : (
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem', 
              marginTop: '1rem',
              justifyContent: 'center'
            }}>
              <button 
                onClick={handleSave} 
                style={{
                  background: '#28a745',
                  border: 'none',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                ✅ {t.save}
              </button>
              <button 
                onClick={handleCancel} 
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                ❌ {t.cancel}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Personal Information */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #f0f0f0'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '2px solid #f0f0f0'
        }}>
          <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>📋</span>
          <h2 style={{ margin: 0, color: '#333', fontSize: '1.3rem', fontWeight: '600' }}>
            {t.personalInfo}
          </h2>
        </div>

        <div style={{ display: 'grid', gap: '1rem' }}>
          {/* Name */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: editMode ? '2px solid #667eea' : '1px solid #e9ecef'
          }}>
            <span style={{ fontSize: '1.2rem', marginRight: '1rem', width: '30px' }}>👤</span>
            <div style={{ flex: 1 }}>
              <label style={{ 
                display: 'block', 
                fontWeight: '600', 
                color: '#666', 
                fontSize: '0.85rem',
                marginBottom: '0.25rem'
              }}>
                {t.name}
              </label>
              {editMode ? (
                <input
                  type="text"
                  value={tempData.name}
                  onChange={(e) => setTempData({...tempData, name: e.target.value})}
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'white',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
              ) : (
                <span style={{ fontSize: '1rem', color: '#333', fontWeight: '500' }}>
                  {profileData.name}
                </span>
              )}
            </div>
          </div>

          {/* Email */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '1rem',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: editMode ? '2px solid #667eea' : '1px solid #e9ecef'
          }}>
            <span style={{ fontSize: '1.2rem', marginRight: '1rem', width: '30px' }}>📧</span>
            <div style={{ flex: 1 }}>
              <label style={{ 
                display: 'block', 
                fontWeight: '600', 
                color: '#666', 
                fontSize: '0.85rem',
                marginBottom: '0.25rem'
              }}>
                {t.email}
              </label>
              {editMode ? (
                <input
                  type="email"
                  value={tempData.email}
                  onChange={(e) => setTempData({...tempData, email: e.target.value})}
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'white',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    fontSize: '1rem'
                  }}
                />
              ) : (
                <span style={{ fontSize: '1rem', color: '#333', fontWeight: '500' }}>
                  {profileData.email}
                </span>
              )}
            </div>
          </div>

          {/* Age, Height, Weight in a row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
            {/* Age */}
            <div style={{
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: editMode ? '2px solid #667eea' : '1px solid #e9ecef',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>🎂</span>
              <label style={{ 
                display: 'block', 
                fontWeight: '600', 
                color: '#666', 
                fontSize: '0.8rem',
                marginBottom: '0.25rem'
              }}>
                {t.age}
              </label>
              {editMode ? (
                <input
                  type="number"
                  value={tempData.age}
                  onChange={(e) => setTempData({...tempData, age: e.target.value})}
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'white',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    textAlign: 'center'
                  }}
                />
              ) : (
                <span style={{ fontSize: '1rem', color: '#333', fontWeight: '600' }}>
                  {profileData.age} {t.years}
                </span>
              )}
            </div>

            {/* Height */}
            <div style={{
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: editMode ? '2px solid #667eea' : '1px solid #e9ecef',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>📏</span>
              <label style={{ 
                display: 'block', 
                fontWeight: '600', 
                color: '#666', 
                fontSize: '0.8rem',
                marginBottom: '0.25rem'
              }}>
                {t.height}
              </label>
              {editMode ? (
                <input
                  type="number"
                  value={tempData.height}
                  onChange={(e) => setTempData({...tempData, height: e.target.value})}
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'white',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    textAlign: 'center'
                  }}
                />
              ) : (
                <span style={{ fontSize: '1rem', color: '#333', fontWeight: '600' }}>
                  {profileData.height} {t.cm}
                </span>
              )}
            </div>

            {/* Weight */}
            <div style={{
              padding: '1rem',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: editMode ? '2px solid #667eea' : '1px solid #e9ecef',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}>⚖️</span>
              <label style={{ 
                display: 'block', 
                fontWeight: '600', 
                color: '#666', 
                fontSize: '0.8rem',
                marginBottom: '0.25rem'
              }}>
                {t.weight}
              </label>
              {editMode ? (
                <input
                  type="number"
                  value={tempData.weight}
                  onChange={(e) => setTempData({...tempData, weight: e.target.value})}
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'white',
                    padding: '0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.9rem',
                    textAlign: 'center'
                  }}
                />
              ) : (
                <span style={{ fontSize: '1rem', color: '#333', fontWeight: '600' }}>
                  {profileData.weight} {t.kg}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Goals */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #f0f0f0'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '2px solid #f0f0f0'
        }}>
          <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>🎯</span>
          <h2 style={{ margin: 0, color: '#333', fontSize: '1.3rem', fontWeight: '600' }}>
            {t.goals}
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          {/* Calorie Goal */}
          <div style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              fontSize: '4rem',
              opacity: 0.2
            }}>🔥</div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>🔥</span>
              <label style={{ 
                display: 'block', 
                fontSize: '0.85rem',
                marginBottom: '0.5rem',
                opacity: 0.9
              }}>
                {t.dailyCalorieGoal}
              </label>
              {editMode ? (
                <input
                  type="number"
                  value={tempData.calorieGoal}
                  onChange={(e) => setTempData({...tempData, calorieGoal: e.target.value})}
                  style={{
                    width: '80%',
                    border: 'none',
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    textAlign: 'center',
                    backdropFilter: 'blur(10px)'
                  }}
                  placeholder="1800"
                />
              ) : (
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  {profileData.calorieGoal} <span style={{ fontSize: '0.9rem' }}>{t.calories}</span>
                </div>
              )}
            </div>
          </div>

          {/* Water Goal */}
          <div style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #4dabf7, #339af0)',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              fontSize: '4rem',
              opacity: 0.2
            }}>💧</div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>💧</span>
              <label style={{ 
                display: 'block', 
                fontSize: '0.85rem',
                marginBottom: '0.5rem',
                opacity: 0.9
              }}>
                {t.waterGoal}
              </label>
              {editMode ? (
                <input
                  type="number"
                  value={tempData.waterGoal}
                  onChange={(e) => setTempData({...tempData, waterGoal: e.target.value})}
                  style={{
                    width: '80%',
                    border: 'none',
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    textAlign: 'center',
                    backdropFilter: 'blur(10px)'
                  }}
                  placeholder="8"
                />
              ) : (
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  {profileData.waterGoal} <span style={{ fontSize: '0.9rem' }}>{t.glasses}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Statistics */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #f0f0f0'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '2px solid #f0f0f0'
        }}>
          <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>📊</span>
          <h2 style={{ margin: 0, color: '#333', fontSize: '1.3rem', fontWeight: '600' }}>
            {t.weeklyStats}
          </h2>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #51cf66, #40c057)',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              fontSize: '3rem',
              opacity: 0.2
            }}>⚡</div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem' }}>1,654</div>
              <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>{t.averageCalories}</p>
            </div>
          </div>
          
          <div style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #74c0fc, #4dabf7)',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              fontSize: '3rem',
              opacity: 0.2
            }}>💧</div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem' }}>7.2</div>
              <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>{t.waterConsumption}</p>
            </div>
          </div>
          
          <div style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #ffd43b, #fab005)',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              fontSize: '3rem',
              opacity: 0.2
            }}>🍽️</div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem' }}>18</div>
              <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>{t.mealsLogged}</p>
            </div>
          </div>
          
          <div style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, #845ef7, #7048e8)',
            borderRadius: '12px',
            color: 'white',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: '-10px',
              right: '-10px',
              fontSize: '3rem',
              opacity: 0.2
            }}>🎯</div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '0.25rem' }}>85%</div>
              <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9 }}>{t.goals}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #f0f0f0'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '2px solid #f0f0f0'
        }}>
          <span style={{ fontSize: '1.5rem', marginRight: '0.75rem' }}>⚙️</span>
          <h2 style={{ margin: 0, color: '#333', fontSize: '1.3rem', fontWeight: '600' }}>
            {t.settings}
          </h2>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem', marginRight: '0.75rem' }}>🌐</span>
              <span style={{ color: '#333', fontWeight: '500' }}>{t.language}</span>
            </div>
            <select
              value={language}
              onChange={(e) => onLanguageChange(e.target.value as Language)}
              style={{
                padding: '0.5rem 1rem',
                border: '1px solid #ddd',
                borderRadius: '6px',
                background: 'white',
                color: '#333',
                fontWeight: '500'
              }}
            >
              {languageOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '1.2rem', marginRight: '0.75rem' }}>🔔</span>
              <span style={{ color: '#333', fontWeight: '500' }}>{t.notifications}</span>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              style={{
                padding: '0.5rem 1rem',
                border: 'none',
                borderRadius: '20px',
                background: notificationsEnabled ? '#51cf66' : '#868e96',
                color: 'white',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {notificationsEnabled ? t.enabled : t.disabled}
            </button>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          width: '100%',
          padding: '1rem',
          background: 'linear-gradient(135deg, #4dabf7, #339af0)',
          border: 'none',
          borderRadius: '12px',
          color: 'white',
          fontSize: '1rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 12px rgba(77, 171, 247, 0.3)'
        }}>
          <span style={{ fontSize: '1.2rem' }}>📊</span>
          {t.dataExport}
        </button>
        
        <button 
          onClick={() => {
            if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
              // Handle logout
              alert('Déconnexion...');
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            width: '100%',
            padding: '1rem',
            background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
            border: 'none',
            borderRadius: '12px',
            color: 'white',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>🚪</span>
          {t.logout}
        </button>
      </div>
      </div>
    </>
  );
};

export default ProfilePage;