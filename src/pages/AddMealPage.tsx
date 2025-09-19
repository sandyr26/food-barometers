import React, { useState } from 'react';

type Language = 'fr' | 'en' | 'mfe' | 'rcf';
type InputMethod = 'text' | 'voice' | null;

interface AddMealPageProps {
  language: Language;
  onBack: () => void;
}

const translations = {
  fr: {
    addMeal: "Ajouter un repas",
    chooseMethod: "Choisissez votre méthode",
    textInput: "Saisie texte",
    voiceInput: "Saisie vocale",
    textDescription: "Répondez aux questions une par une",
    voiceDescription: "Enregistrez vos réponses vocalement",
    questions: [
      "À quelle heure avez-vous consommé ce repas ?",
      "Quelle est la dénomination de cette prise alimentaire ?",
      "Quels sont les aliments qui composent ce repas ?",
      "Comment ces aliments ont-ils été préparés ?",
      "Où avez-vous consommé ce repas ?",
      "Dans quel contexte social ?",
      "Quelles sont les modalités de consommation ?",
      "Combien de temps a duré ce repas ?",
      "Y a-t-il des différences par rapport à vos habitudes ?"
    ],
    startRecording: "Commencer l'enregistrement",
    stopRecording: "Arrêter l'enregistrement",
    recording: "Enregistrement en cours...",
    next: "Suivant",
    previous: "Précédent",
    finish: "Terminer",
    yourAnswer: "Votre réponse",
    saveMeal: "Enregistrer le repas"
  },
  en: {
    addMeal: "Add meal",
    chooseMethod: "Choose your method",
    textInput: "Text Input",
    voiceInput: "Voice Input",
    textDescription: "Answer questions one by one",
    voiceDescription: "Record your answers vocally",
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
    startRecording: "Start Recording",
    stopRecording: "Stop Recording",
    recording: "Recording...",
    next: "Next",
    previous: "Previous",
    finish: "Finish",
    yourAnswer: "Your answer",
    saveMeal: "Save meal"
  },
  mfe: {
    addMeal: "Azout manze",
    chooseMethod: "Swazir to fason",
    textInput: "Ekrir",
    voiceInput: "Diksyoner",
    textDescription: "Repond bann kesyon en par en",
    voiceDescription: "Enrezistre to bann repons",
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
    startRecording: "Komas anrezitre",
    stopRecording: "Aret anrezitre",
    recording: "Ape anrezitre...",
    next: "Swivan",
    previous: "Devan",
    finish: "Fini",
    yourAnswer: "To repons",
    saveMeal: "Sov manze"
  },
  rcf: {
    addMeal: "Azout manzé",
    chooseMethod: "Swazir to fason",
    textInput: "Ékrir",
    voiceInput: "Diksyoné",
    textDescription: "Répond bann késyon ènn par ènn",
    voiceDescription: "Anrézistré to bann répons",
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
    startRecording: "Komans anrézistré",
    stopRecording: "Arèt anrézistré",
    recording: "Apé anrézistré...",
    next: "Swivan",
    previous: "Dovan",
    finish: "Fini",
    yourAnswer: "To répons",
    saveMeal: "Sov manzé"
  }
};

const AddMealPage: React.FC<AddMealPageProps> = ({ language, onBack }) => {
  const t = translations[language];
  const [inputMethod, setInputMethod] = useState<InputMethod>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(new Array(t.questions.length).fill(''));
  const [isRecording, setIsRecording] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState('');

  const handleMethodSelect = (method: InputMethod) => {
    setInputMethod(method);
    setCurrentQuestionIndex(0);
  };

  const handleNextQuestion = () => {
    if (inputMethod === 'text') {
      const updatedAnswers = [...answers];
      updatedAnswers[currentQuestionIndex] = currentAnswer;
      setAnswers(updatedAnswers);
      setCurrentAnswer('');
    }
    
    if (currentQuestionIndex < t.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Finished all questions
      handleFinish();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      if (inputMethod === 'text') {
        setCurrentAnswer(answers[currentQuestionIndex - 1] || '');
      }
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleRecordingToggle = () => {
    setIsRecording(!isRecording);
    // Here you would implement actual voice recording logic
    // For now, we'll just simulate it
  };

  const handleFinish = () => {
    if (inputMethod === 'text') {
      const updatedAnswers = [...answers];
      updatedAnswers[currentQuestionIndex] = currentAnswer;
      setAnswers(updatedAnswers);
    }
    
    // Here you would save the meal data
    alert(`Repas enregistré avec ${inputMethod === 'text' ? 'saisie texte' : 'enregistrement vocal'}!`);
    onBack();
  };

  const isLastQuestion = currentQuestionIndex === t.questions.length - 1;

  // Method selection screen
  if (inputMethod === null) {
    return (
      <div className="page-content">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}>
            ←
          </button>
          <h1 style={{ margin: '0 auto', fontSize: '1.5rem', color: '#667eea' }}>
            {t.addMeal}
          </h1>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>
            {t.chooseMethod}
          </h2>
        </div>

        <div className="meal-method-selector">
          <button 
            className="meal-method-button"
            onClick={() => handleMethodSelect('text')}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{t.textInput}</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>{t.textDescription}</div>
          </button>

          <button 
            className="meal-method-button"
            onClick={() => handleMethodSelect('voice')}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎤</div>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{t.voiceInput}</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>{t.voiceDescription}</div>
          </button>
        </div>
      </div>
    );
  }

  // Questions screen
  return (
    <div className="page-content">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        <button 
          onClick={currentQuestionIndex === 0 ? () => setInputMethod(null) : handlePreviousQuestion} 
          style={{ background: 'none', border: 'none', fontSize: '1.5rem' }}
        >
          ←
        </button>
        <h1 style={{ margin: '0 auto', fontSize: '1.5rem', color: '#667eea' }}>
          {t.addMeal} ({currentQuestionIndex + 1}/{t.questions.length})
        </h1>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.2rem', marginBottom: '2rem', lineHeight: '1.5' }}>
          {t.questions[currentQuestionIndex]}
        </h2>

        {inputMethod === 'text' && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              {t.yourAnswer}:
            </label>
            <textarea
              className="input-field"
              rows={4}
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Tapez votre réponse ici..."
              style={{ minHeight: '100px', resize: 'vertical' }}
            />
          </div>
        )}

      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
        {currentQuestionIndex > 0 && (
          <button
            className="btn btn-secondary"
            onClick={handlePreviousQuestion}
            style={{ flex: 1 }}
          >
            {t.previous}
          </button>
        )}
        
        <button
          className="btn btn-primary"
          onClick={isLastQuestion ? handleFinish : handleNextQuestion}
          disabled={inputMethod === 'text' && !currentAnswer.trim()}
          style={{ flex: 2 }}
        >
          {isLastQuestion ? t.finish : t.next}
        </button>
      </div>
      
        {inputMethod === 'voice' && (
          <div className="voice-recorder">
            <div className="voice-icon" style={{ fontSize: '4rem', marginBottom: '2rem' }}>
              🎤
            </div>
            
            {isRecording && (
              <div style={{ marginBottom: '2rem', color: '#dc3545', fontWeight: '600' }}>
                {t.recording}
              </div>
            )}

            <button
              className={`btn ${isRecording ? 'btn-danger' : 'btn-primary'}`}
              onClick={handleRecordingToggle}
              style={{ 
                marginBottom: '2rem',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                borderRadius: '50px'
              }}
            >
              {isRecording ? t.stopRecording : t.startRecording}
            </button>

            {isRecording && (
              <div style={{ 
                width: '60px', 
                height: '60px', 
                border: '3px solid #dc3545', 
                borderRadius: '50%', 
                margin: '0 auto',
                animation: 'pulse 1.5s infinite'
              }} />
            )}
          </div>
        )}
    </div>
  );
};

export default AddMealPage;