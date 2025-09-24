import React, { useState } from 'react';

type Language = 'fr' | 'en' | 'mfe' | 'rcf';

interface RegisterPageProps {
  onBack: () => void;
  onComplete: () => void;
  language: Language;
  onLanguageChange?: (lang: Language) => void;
}

interface RegistrationData {
  gender: string;
  birthYear: string;
  height: string;
  weight: string;
  professionalStatus: string;
  activity: string;
  workTime: string;
  education: string;
  otherEducation: string;
  maritalStatus: string;
  spouseActivity: string;
  spouseJob: string;
  spouseEducation: string;
  monthlyIncome: string;
  householdMembers: Array<{ age: string; relationship: string }>;
}

const translations = {
  fr: {
    register: "S'inscrire",
    next: "Suivant",
    previous: "Précédent",
    finish: "Terminer",
    question: "Question",
    of: "sur",
    
    // Questions
    q1: "Êtes-vous ?",
    q1Options: ["Homme", "Femme", "Autre"],
    
    q2: "Quelle est votre année de naissance ?",
    birthYear: "Année de naissance",
    
    q3: "Pouvez-vous indiquer approximativement votre taille et votre poids ?",
    height: "Taille (cm)",
    weight: "Poids (kg)",
    
    q4: "Quelle est votre situation professionnelle ?",
    q4Options: [
      "En activité professionnelle",
      "Sans activité professionnelle", 
      "En recherche d'emploi",
      "Étudiant avec une activité professionnelle",
      "Étudiant sans activité professionnelle",
      "Retraité en conservant une activité professionnelle",
      "Retraité sans autre activité professionnelle"
    ],
    
    q5: "Quelle est votre activité professionnelle ?",
    activity: "Activité professionnelle",
    
    q6: "Est-ce un temps plein ou un temps partiel ?",
    q6Options: ["Plein", "Partiel"],
    
    q7: "Quel est le niveau de diplôme le plus haut que vous avez obtenu ?",
    q7Options: [
      "N'a jamais été scolarisé",
      "Niveau primaire : CEP ou PSAC",
      "Niveau secondaire : School certificate / grade 10",
      "HSC / grade 12",
      "Éducation tertiaire (Undergraduate)",
      "Éducation tertiaire (PG)",
      "Doctorat",
      "Autre diplôme. Précisez.",
      "Diplôme à l'étranger équivalent. Précisez.",
      "Formation qualifiante certifiante. Précisez."
    ],
    
    q8: "Quelle est votre situation conjugale parmi les suivantes ?",
    q8Options: [
      "Marié(e)",
      "Union libre",
      "Union reconnue religieusement",
      "Veuf(ve)",
      "Divorcé(e)",
      "Célibataire"
    ],
    
    q9: "Est-ce que votre conjoint.e exerce une activité professionnelle ?",
    q9Options: ["Oui", "Non"],
    
    q10: "Quelle activité exerce-t-il/elle ?",
    spouseJob: "Activité du conjoint",
    
    q11: "Quel est le niveau de diplôme de votre conjoint.e ?",
    
    q12: "Dans quelle tranche de revenus mensuels (après impôts) se situe votre foyer ?",
    q12Options: [
      "Moins de 10 000 Rs",
      "10 000 à 15 000 Rs",
      "15 000 à 20 000 Rs", 
      "20 000 à 25 000 Rs",
      "25 000 à 30 000 Rs",
      "30 000 à 35 000 Rs",
      "35 000 à 40 000 Rs",
      "40 000 à 50 000 Rs",
      "50 000 à 60 000 Rs",
      "60 000 à 70 000 Rs",
      "70 000 à 80 000 Rs",
      "80 000 à 90 000 Rs",
      "90 000 à 100 000 Rs",
      "100 000 à 125 000 Rs",
      "Plus de 125 000 Rs"
    ],
    
    q13: "Hormis vous, combien de personnes vivent actuellement sous votre toit ?",
    addMember: "Ajouter une personne",
    age: "Âge",
    relationship: "Lien de parenté",
    remove: "Supprimer"
  },
  en: {
    register: "Register",
    next: "Next", 
    previous: "Previous",
    finish: "Finish",
    question: "Question",
    of: "of",
    
    q1: "What is your gender?",
    q1Options: ["Male", "Female", "Other"],
    
    q2: "What is your birth year?",
    birthYear: "Birth year",
    
    q3: "Can you indicate approximately your height and weight?",
    height: "Height (cm)",
    weight: "Weight (kg)",
    
    q4: "What is your professional situation?",
    q4Options: [
      "Professionally active",
      "Not professionally active",
      "Looking for employment", 
      "Student with professional activity",
      "Student without professional activity",
      "Retired with professional activity",
      "Retired without other professional activity"
    ],
    
    q5: "What is your professional activity?",
    activity: "Professional activity",
    
    q6: "Is it full-time or part-time?",
    q6Options: ["Full-time", "Part-time"],
    
    q7: "What is the highest level of education you have obtained?",
    q7Options: [
      "Never been to school",
      "Primary level: CEP or PSAC",
      "Secondary level: School certificate / grade 10",
      "HSC / grade 12",
      "Tertiary education (Undergraduate)",
      "Tertiary education (PG)",
      "Doctorate",
      "Other diploma. Please specify.",
      "Equivalent foreign diploma. Please specify.",
      "Qualifying certification training. Please specify."
    ],
    
    q8: "What is your marital status among the following?",
    q8Options: [
      "Married",
      "Civil union",
      "Religiously recognized union",
      "Widowed",
      "Divorced", 
      "Single"
    ],
    
    q9: "Does your spouse/partner have professional activity?",
    q9Options: ["Yes", "No"],
    
    q10: "What activity does he/she do?",
    spouseJob: "Spouse's activity",
    
    q11: "What is your spouse's level of education?",
    
    q12: "What monthly income range (after taxes) does your household fall into?",
    q12Options: [
      "Less than 10,000 Rs",
      "10,000 to 15,000 Rs",
      "15,000 to 20,000 Rs",
      "20,000 to 25,000 Rs", 
      "25,000 to 30,000 Rs",
      "30,000 to 35,000 Rs",
      "35,000 to 40,000 Rs",
      "40,000 to 50,000 Rs",
      "50,000 to 60,000 Rs",
      "60,000 to 70,000 Rs",
      "70,000 to 80,000 Rs",
      "80,000 to 90,000 Rs",
      "90,000 to 100,000 Rs",
      "100,000 to 125,000 Rs",
      "More than 125,000 Rs"
    ],
    
    q13: "Apart from you, how many people currently live under your roof?",
    addMember: "Add person",
    age: "Age",
    relationship: "Relationship",
    remove: "Remove"
  },
  mfe: {
    register: "Anrezistre",
    next: "Swivan",
    previous: "Avan", 
    finish: "Fini",
    question: "Kesyon",
    of: "lor",
    
    q1: "Ki ou ete?",
    q1Options: ["Dimoun", "Fanm", "Lot"],
    
    q2: "Ki anne ou finn ne?",
    birthYear: "Anne nesans",
    
    q3: "Ou kapav dir aprosimatman ou oteur ek ou pwa?",
    height: "Oteur (cm)",
    weight: "Pwa (kg)",
    
    q4: "Ki ou sitiyasyon travay?",
    q4Options: [
      "Pe travay",
      "Pa pe travay",
      "Pe rod travay",
      "Etidyan ki pe travay",
      "Etidyan ki pa pe travay", 
      "Retrèt ki pe travay",
      "Retrèt ki pa pe travay"
    ],
    
    q5: "Ki travay ou pe fer?",
    activity: "Travay",
    
    q6: "Li enn tan plen oswa tan paryèl?",
    q6Options: ["Tan plen", "Tan paryèl"],
    
    q7: "Ki diplom pi o ou finn gagn?",
    q7Options: [
      "Zame al lekol",
      "Nivo primèr: CEP oswa PSAC",
      "Nivo sekondar: School certificate / grade 10",
      "HSC / grade 12",
      "Edikasyon tersyer (Undergraduate)",
      "Edikasyon tersyer (PG)",
      "Doktra",
      "Lot diplom. Eksplik.",
      "Diplom deor ekivalan. Eksplik.",
      "Formasyon kalifyan. Eksplik."
    ],
    
    q8: "Ki ou sitiyasyon kouple?",
    q8Options: [
      "Marye",
      "Viv ansam",
      "Maryaz relizye",
      "Vèv",
      "Divorce",
      "Selibatèr"
    ],
    
    q9: "Ou kouple pe travay?",
    q9Options: ["Wi", "Non"],
    
    q10: "Ki travay li pe fer?",
    spouseJob: "Travay kouple",
    
    q11: "Ki diplom ou kouple ena?",
    
    q12: "Dan ki tranz revni mensyèl ou foye tombe?",
    q12Options: [
      "Mwin ki 10,000 Rs",
      "10,000 a 15,000 Rs",
      "15,000 a 20,000 Rs",
      "20,000 a 25,000 Rs",
      "25,000 a 30,000 Rs",
      "30,000 a 35,000 Rs", 
      "35,000 a 40,000 Rs",
      "40,000 a 50,000 Rs",
      "50,000 a 60,000 Rs",
      "60,000 a 70,000 Rs",
      "70,000 a 80,000 Rs",
      "80,000 a 90,000 Rs",
      "90,000 a 100,000 Rs",
      "100,000 a 125,000 Rs",
      "Plis ki 125,000 Rs"
    ],
    
    q13: "Apa ou, konmye dimoun pe viv dan ou lakaz?",
    addMember: "Azout dimoun",
    age: "Laz",
    relationship: "Ki li ete",
    remove: "Retire"
  },
  rcf: {
    register: "Anrèjistré",
    next: "Swivan",
    previous: "Avan",
    finish: "Fini", 
    question: "Késyon",
    of: "lor",
    
    q1: "Kosa ou lé?",
    q1Options: ["Nonm", "Fanm", "Ot"],
    
    q2: "Dan kel ané ou nésé?",
    birthYear: "Ané nésans",
    
    q3: "Ou kap dir aprosimatman aou otèr èk aou pwa?",
    height: "Otèr (cm)",
    weight: "Pwa (kg)",
    
    q4: "Kosa aou sitiyasyon travay?",
    q4Options: [
      "Pé travay",
      "Pa pé travay",
      "Pé rod travay",
      "Étidyan ki pé travay",
      "Étidyan ki pa pé travay",
      "Retrété ki pé travay",
      "Retrété ki pa pé travay"
    ],
    
    q5: "Kel travay ou pé fèr?",
    activity: "Travay",
    
    q6: "Li tan plen oswa tan paryèl?",
    q6Options: ["Tan plen", "Tan paryèl"],
    
    q7: "Kel diplom pi o ou finn gagn?",
    q7Options: [
      "Zamé alé lékol",
      "Nivo primèr: CEP oswa PSAC",
      "Nivo sékondar: School certificate / grade 10",
      "HSC / grade 12",
      "Édikasyon tersyèr (Undergraduate)",
      "Édikasyon tersyèr (PG)",
      "Doktora",
      "Ot diplom. Ésplik.",
      "Diplom déor ékivalan. Ésplik.",
      "Formasyon kalifyan. Ésplik."
    ],
    
    q8: "Kosa aou sitiyasyon kouple?",
    q8Options: [
      "Maryé",
      "Viv ansam",
      "Maryaz rèlijyé",
      "Vèv",
      "Divorsé",
      "Sélibatèr"
    ],
    
    q9: "Aou kouple pé travay?",
    q9Options: ["Wi", "Non"],
    
    q10: "Kel travay li pé fèr?",
    spouseJob: "Travay kouple",
    
    q11: "Kel diplom aou kouple nana?",
    
    q12: "Dan kel trans rèvni mensyèl aou foye tonbé?",
    q12Options: [
      "Mwin ki 10,000 Rs",
      "10,000 a 15,000 Rs",
      "15,000 a 20,000 Rs",
      "20,000 a 25,000 Rs",
      "25,000 a 30,000 Rs",
      "30,000 a 35,000 Rs",
      "35,000 a 40,000 Rs",
      "40,000 a 50,000 Rs",
      "50,000 a 60,000 Rs",
      "60,000 a 70,000 Rs",
      "70,000 a 80,000 Rs",
      "80,000 a 90,000 Rs",
      "90,000 a 100,000 Rs",
      "100,000 a 125,000 Rs",
      "Plis ki 125,000 Rs"
    ],
    
    q13: "Apa ou, konbyèn dimoun pé viv dan aou lakaz?",
    addMember: "Azout dimoun", 
    age: "Laz",
    relationship: "Ki li lé",
    remove: "Rétiré"
  }
};

const RegisterPage: React.FC<RegisterPageProps> = ({ onBack, onComplete, language }) => {
  const t = translations[language];
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [formData, setFormData] = useState<RegistrationData>({
    gender: '',
    birthYear: '',
    height: '',
    weight: '',
    professionalStatus: '',
    activity: '',
    workTime: '',
    education: '',
    otherEducation: '',
    maritalStatus: '',
    spouseActivity: '',
    spouseJob: '',
    spouseEducation: '',
    monthlyIncome: '',
    householdMembers: []
  });

  const handleNext = () => {
    if (currentQuestion < 13) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      onBack();
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const addHouseholdMember = () => {
    setFormData({
      ...formData,
      householdMembers: [...formData.householdMembers, { age: '', relationship: '' }]
    });
  };

  const updateHouseholdMember = (index: number, field: string, value: string) => {
    const updatedMembers = [...formData.householdMembers];
    updatedMembers[index] = { ...updatedMembers[index], [field]: value };
    setFormData({ ...formData, householdMembers: updatedMembers });
  };

  const removeHouseholdMember = (index: number) => {
    const updatedMembers = formData.householdMembers.filter((_, i) => i !== index);
    setFormData({ ...formData, householdMembers: updatedMembers });
  };

  const renderQuestion = () => {
    switch (currentQuestion) {
      case 1:
        return (
          <div>
            <p style={{ marginBottom: '2rem', color: '#666', fontSize: '1.1rem' }}>{t.q1}</p>
            {t.q1Options.map((option) => (
              <label key={option} style={{ display: 'block', marginBottom: '1rem', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="gender" 
                  value={option}
                  checked={formData.gender === option}
                  onChange={(e) => updateFormData('gender', e.target.value)}
                  style={{ marginRight: '12px' }} 
                />
                <span style={{ fontSize: '1rem' }}>{option}</span>
              </label>
            ))}
          </div>
        );

      case 2:
        return (
          <div>
            <p style={{ marginBottom: '2rem', color: '#666', fontSize: '1.1rem' }}>{t.q2}</p>
            <input 
              type="number" 
              placeholder={t.birthYear}
              className="input-field"
              value={formData.birthYear}
              onChange={(e) => updateFormData('birthYear', e.target.value)}
              min="1920"
              max="2010"
            />
          </div>
        );

      case 3:
        return (
          <div>
            <p style={{ marginBottom: '2rem', color: '#666', fontSize: '1.1rem' }}>{t.q3}</p>
            <input 
              type="number" 
              placeholder={t.height}
              className="input-field"
              value={formData.height}
              onChange={(e) => updateFormData('height', e.target.value)}
              min="100"
              max="250"
            />
            <input 
              type="number" 
              placeholder={t.weight}
              className="input-field"
              value={formData.weight}
              onChange={(e) => updateFormData('weight', e.target.value)}
              min="30"
              max="200"
            />
          </div>
        );

      case 4:
        return (
          <div>
            <p style={{ marginBottom: '2rem', color: '#666', fontSize: '1.1rem' }}>{t.q4}</p>
            {t.q4Options.map((option) => (
              <label key={option} style={{ display: 'block', marginBottom: '1rem', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="professionalStatus" 
                  value={option}
                  checked={formData.professionalStatus === option}
                  onChange={(e) => updateFormData('professionalStatus', e.target.value)}
                  style={{ marginRight: '12px' }} 
                />
                <span style={{ fontSize: '0.95rem' }}>{option}</span>
              </label>
            ))}
          </div>
        );

      case 5:
        return (
          <div>
            <p style={{ marginBottom: '2rem', color: '#666', fontSize: '1.1rem' }}>{t.q5}</p>
            <input 
              type="text" 
              placeholder={t.activity}
              className="input-field"
              value={formData.activity}
              onChange={(e) => updateFormData('activity', e.target.value)}
            />
          </div>
        );

      case 6:
        return (
          <div>
            <p style={{ marginBottom: '2rem', color: '#666', fontSize: '1.1rem' }}>{t.q6}</p>
            {t.q6Options.map((option) => (
              <label key={option} style={{ display: 'block', marginBottom: '1rem', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="workTime" 
                  value={option}
                  checked={formData.workTime === option}
                  onChange={(e) => updateFormData('workTime', e.target.value)}
                  style={{ marginRight: '12px' }} 
                />
                <span style={{ fontSize: '1rem' }}>{option}</span>
              </label>
            ))}
          </div>
        );

      case 7:
        return (
          <div>
            <p style={{ marginBottom: '2rem', color: '#666', fontSize: '1.1rem' }}>{t.q7}</p>
            {t.q7Options.map((option) => (
              <label key={option} style={{ display: 'block', marginBottom: '1rem', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="education" 
                  value={option}
                  checked={formData.education === option}
                  onChange={(e) => updateFormData('education', e.target.value)}
                  style={{ marginRight: '12px' }} 
                />
                <span style={{ fontSize: '0.9rem' }}>{option}</span>
              </label>
            ))}
            {formData.education.includes('Précisez') && (
              <input 
                type="text" 
                placeholder="Précisez..."
                className="input-field"
                value={formData.otherEducation}
                onChange={(e) => updateFormData('otherEducation', e.target.value)}
                style={{ marginTop: '1rem' }}
              />
            )}
          </div>
        );

      case 8:
        return (
          <div>
            <p style={{ marginBottom: '2rem', color: '#666', fontSize: '1.1rem' }}>{t.q8}</p>
            {t.q8Options.map((option) => (
              <label key={option} style={{ display: 'block', marginBottom: '1rem', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="maritalStatus" 
                  value={option}
                  checked={formData.maritalStatus === option}
                  onChange={(e) => updateFormData('maritalStatus', e.target.value)}
                  style={{ marginRight: '12px' }} 
                />
                <span style={{ fontSize: '1rem' }}>{option}</span>
              </label>
            ))}
          </div>
        );

      case 9:
        return (
          <div>
            <p style={{ marginBottom: '2rem', color: '#666', fontSize: '1.1rem' }}>{t.q9}</p>
            {t.q9Options.map((option) => (
              <label key={option} style={{ display: 'block', marginBottom: '1rem', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="spouseActivity" 
                  value={option}
                  checked={formData.spouseActivity === option}
                  onChange={(e) => updateFormData('spouseActivity', e.target.value)}
                  style={{ marginRight: '12px' }} 
                />
                <span style={{ fontSize: '1rem' }}>{option}</span>
              </label>
            ))}
          </div>
        );

      case 10:
        return (
          <div>
            <p style={{ marginBottom: '2rem', color: '#666', fontSize: '1.1rem' }}>{t.q10}</p>
            <input 
              type="text" 
              placeholder={t.spouseJob}
              className="input-field"
              value={formData.spouseJob}
              onChange={(e) => updateFormData('spouseJob', e.target.value)}
            />
          </div>
        );

      case 11:
        return (
          <div>
            <p style={{ marginBottom: '2rem', color: '#666', fontSize: '1.1rem' }}>{t.q11}</p>
            {t.q7Options.map((option) => (
              <label key={option} style={{ display: 'block', marginBottom: '1rem', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="spouseEducation" 
                  value={option}
                  checked={formData.spouseEducation === option}
                  onChange={(e) => updateFormData('spouseEducation', e.target.value)}
                  style={{ marginRight: '12px' }} 
                />
                <span style={{ fontSize: '0.9rem' }}>{option}</span>
              </label>
            ))}
          </div>
        );

      case 12:
        return (
          <div>
            <p style={{ marginBottom: '2rem', color: '#666', fontSize: '1.1rem' }}>{t.q12}</p>
            {t.q12Options.map((option) => (
              <label key={option} style={{ display: 'block', marginBottom: '1rem', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="monthlyIncome" 
                  value={option}
                  checked={formData.monthlyIncome === option}
                  onChange={(e) => updateFormData('monthlyIncome', e.target.value)}
                  style={{ marginRight: '12px' }} 
                />
                <span style={{ fontSize: '0.95rem' }}>{option}</span>
              </label>
            ))}
          </div>
        );

      case 13:
        return (
          <div>
            <p style={{ marginBottom: '2rem', color: '#666', fontSize: '1.1rem' }}>{t.q13}</p>
            {formData.householdMembers.map((member, index) => (
              <div key={index} style={{ 
                padding: '1rem', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '8px', 
                marginBottom: '1rem',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <input 
                    type="number" 
                    placeholder={t.age}
                    className="input-field"
                    value={member.age}
                    onChange={(e) => updateHouseholdMember(index, 'age', e.target.value)}
                    style={{ flex: 1, marginBottom: 0 }}
                    min="0"
                    max="100"
                  />
                  <input 
                    type="text" 
                    placeholder={t.relationship}
                    className="input-field"
                    value={member.relationship}
                    onChange={(e) => updateHouseholdMember(index, 'relationship', e.target.value)}
                    style={{ flex: 2, marginBottom: 0 }}
                  />
                </div>
                <button 
                  onClick={() => removeHouseholdMember(index)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  {t.remove}
                </button>
              </div>
            ))}
            <button 
              onClick={addHouseholdMember}
              className="btn btn-secondary"
              style={{ marginBottom: '1rem' }}
            >
              ➕ {t.addMember}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <div className="app-header">
        <button onClick={handlePrevious} className="header-icon">
          ←
        </button>
        <h1 className="app-header-title">{t.register}</h1>
        <div></div>
      </div>
      <div className="page-content-full">
      
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <p style={{ color: '#667eea', fontWeight: '600', fontSize: '1.1rem' }}>
          {t.question} {currentQuestion} {t.of} 13
        </p>
        <div style={{ 
          width: '100%', 
          height: '4px', 
          backgroundColor: '#e1e5e9', 
          borderRadius: '2px',
          marginTop: '1rem'
        }}>
          <div style={{ 
            width: `${(currentQuestion / 13) * 100}%`, 
            height: '100%', 
            backgroundColor: '#667eea', 
            borderRadius: '2px',
            transition: 'width 0.3s ease'
          }}></div>
        </div>
      </div>
      
      {renderQuestion()}
      
      <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem' }}>
        {currentQuestion > 1 && (
          <button 
            className="btn btn-secondary" 
            onClick={handlePrevious}
            style={{ flex: 1 }}
          >
            {t.previous}
          </button>
        )}
        <button 
          className="btn btn-primary" 
          onClick={handleNext}
          style={{ flex: 1 }}
        >
          {currentQuestion === 13 ? t.finish : t.next}
        </button>
      </div>
      </div>
    </>
  );
};

export default RegisterPage;