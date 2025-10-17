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

interface MealDetailPageProps {
  language: Language;
  meal: MealData;
  onBack: () => void;
}

const translations = {
  fr: {
    mealDetails: "Détails du repas",
    mealName: "Nom du repas",
    mealTime: "Heure du repas",
    mealDate: "Date du repas",
    duration: "Durée",
    method: "Méthode d'enregistrement",
    textMethod: "Saisie de texte",
    voiceMethod: "Enregistrement vocal",
    answers: "Réponses détaillées",
    questions: [
      "Quelle heure avez-vous consommé ce repas ?",
      "Quel est le nom de cette prise alimentaire ?",
      "Quels aliments composent ce repas ?",
      "Comment ces aliments ont-ils été préparés ?",
      "Où avez-vous consommé ce repas ?",
      "Dans quel contexte social ?",
      "Quelles sont les modalités de consommation ?",
      "Combien de temps a duré ce repas ?",
      "Y a-t-il des différences par rapport à vos habitudes ?"
    ],
    noAnswerProvided: "Aucune réponse fournie"
  },
  en: {
    mealDetails: "Meal Details",
    mealName: "Meal Name",
    mealTime: "Meal Time", 
    mealDate: "Meal Date",
    duration: "Duration",
    method: "Recording Method",
    textMethod: "Text Input",
    voiceMethod: "Voice Recording",
    answers: "Detailed Answers",
    questions: [
      "What time did you consume this meal?",
      "What is the name of this food intake?",
      "What foods make up this meal?",
      "How were these foods prepared?",
      "Where did you consume this meal?",
      "In what social context?",
      "What are the consumption modalities?",
      "How long did this meal last?",
      "Are there any differences from your usual habits?"
    ],
    noAnswerProvided: "No answer provided"
  },
  mfe: {
    mealDetails: "Detay manze",
    mealName: "Non manze",
    mealTime: "Ler manze",
    mealDate: "Dat manze", 
    duration: "Konbyen tan",
    method: "Fason anrezitre",
    textMethod: "Ekrir",
    voiceMethod: "Diksyoner",
    answers: "Bann repons detaye",
    questions: [
      "Ki ler ou ti manze sa?",
      "Ki kalite manze sa?",
      "Ki bann manze ki ena dan sa repa?",
      "Kouma bann manze la ti prepare?",
      "Kot ou ti manze sa?",
      "Dan ki konteks sosyal?",
      "Kouma ou ti manze?",
      "Konbyen tan ou ti pran pou manze?",
      "Ena diferans ek to fason manze abitiel?"
    ],
    noAnswerProvided: "Pa ena repons"
  },
  rcf: {
    mealDetails: "Détay manzé",
    mealName: "Non manzé", 
    mealTime: "Lèr manzé",
    mealDate: "Dat manzé",
    duration: "Konbyèn tan",
    method: "Fason anrézistré",
    textMethod: "Ékrir",
    voiceMethod: "Diksyoné",
    answers: "Bann répons détayé",
    questions: [
      "Ki lèr ou té manzé sa?",
      "Ki kalité manzé sa?",
      "Ki bann manzé ki éna dan sa répa?",
      "Kouma bann manzé la té prépâré?",
      "Kot ou té manzé sa?",
      "Dan ki kontèks sosyal?",
      "Kouma ou té manzé?",
      "Konbyèn tan ou té pran pou manzé?",
      "Éna diférèns èk to fason manzé abitiyèl?"
    ],
    noAnswerProvided: "Pa éna répons"
  }
};

const MealDetailPage: React.FC<MealDetailPageProps> = ({
  language,
  meal,
  onBack,
}) => {
  const t = translations[language];
  
  // Format date and time for display
  const mealDate = new Date(meal.time);
  const formattedDate = mealDate.toLocaleDateString(language === 'en' ? 'en-US' : 'fr-FR');
  const formattedTime = mealDate.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  });

  return (
    <>
      <div className="app-header">
        <button onClick={onBack} className="header-icon">
          ←
        </button>
        <h1 className="app-header-title">
          {t.mealDetails}
        </h1>
        <div></div>
      </div>
      
      <div className="page-content-full">
        <div style={{ 
          maxWidth: '600px', 
          margin: '0 auto', 
          padding: '0 1rem'
        }}>
          
          {/* Main meal info card */}
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
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                fontSize: '2.5rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                padding: '0.5rem',
                minWidth: '60px',
                textAlign: 'center'
              }}>
                🍽️
              </div>
              <div style={{ flex: 1 }}>
                <h2 style={{ 
                  margin: '0 0 0.25rem 0', 
                  fontSize: '1.4rem', 
                  color: '#333'
                }}>
                  {meal.name}
                </h2>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  color: '#666',
                  fontSize: '0.9rem'
                }}>
                  {meal.method === 'voice' ? (
                    <>
                      <svg style={{ width: '16px', height: '16px', fill: '#667eea' }} viewBox="0 0 24 24">
                        <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>
                      </svg>
                      <span>{t.voiceMethod}</span>
                    </>
                  ) : (
                    <>
                      <svg style={{ width: '16px', height: '16px', fill: '#667eea' }} viewBox="0 0 24 24">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                      </svg>
                      <span>{t.textMethod}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Basic info grid */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '1rem',
              marginTop: '1rem'
            }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.8rem', 
                  color: '#666', 
                  marginBottom: '0.25rem',
                  fontWeight: '600'
                }}>
                  {t.mealTime}
                </label>
                <div style={{ 
                  fontSize: '1rem', 
                  color: '#333', 
                  fontWeight: '500' 
                }}>
                  {formattedTime}
                </div>
              </div>
              
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.8rem', 
                  color: '#666', 
                  marginBottom: '0.25rem',
                  fontWeight: '600'
                }}>
                  {t.mealDate}
                </label>
                <div style={{ 
                  fontSize: '1rem', 
                  color: '#333', 
                  fontWeight: '500' 
                }}>
                  {formattedDate}
                </div>
              </div>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.8rem', 
                  color: '#666', 
                  marginBottom: '0.25rem',
                  fontWeight: '600'
                }}>
                  {t.duration}
                </label>
                <div style={{ 
                  fontSize: '1rem', 
                  color: '#333', 
                  fontWeight: '500' 
                }}>
                  {meal.duration}
                </div>
              </div>
            </div>
          </div>
          
          {/* Detailed answers section */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            border: '1px solid #f0f0f0'
          }}>
            <h3 style={{ 
              margin: '0 0 1.5rem 0', 
              fontSize: '1.2rem', 
              color: '#333',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>📝</span>
              {t.answers}
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {t.questions.map((question, index) => {
                const answer = meal.answers[index];
                return (
                  <div key={index} style={{
                    padding: '1rem',
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{ 
                      fontSize: '0.85rem', 
                      color: '#667eea', 
                      marginBottom: '0.5rem',
                      fontWeight: '600'
                    }}>
                      {question}
                    </div>
                    <div style={{ 
                      fontSize: '0.95rem', 
                      color: answer ? '#333' : '#999',
                      lineHeight: '1.4',
                      fontStyle: answer ? 'normal' : 'italic'
                    }}>
                      {answer || t.noAnswerProvided}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MealDetailPage;