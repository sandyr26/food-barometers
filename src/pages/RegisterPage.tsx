import React, { useState } from 'react';

type Language = 'fr' | 'en' | 'mfe' | 'rcf';

interface RegisterPageProps {
  onBack: () => void;
  onComplete: () => void;
  language: Language;
  onLanguageChange?: (lang: Language) => void;
}

interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
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
  householdCount: string;
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
    
    // Account Information
    accountInfo: "Informations de compte",
    email: "Adresse email",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    
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
    relationshipOptions: [
      "Conjoint.e / partenaire",
      "Enfant (fils, fille) (garde exclusive)",
      "Enfant (en garde alternée)",
      "Enfant du/de la conjoint.e (en garde alternée)",
      "Parent (père, mère)",
      "Beau-parent",
      "Frère / sœur",
      "Autre membre de la famille (oncle, tante, cousin, etc.)",
      "Colocataire",
      "Ami.e",
      "Autre. Précisez"
    ],
    remove: "Supprimer"
  },
  en: {
    register: "Register",
    next: "Next", 
    previous: "Previous",
    finish: "Finish",
    question: "Question",
    of: "of",
    
    // Account Information
    accountInfo: "Account Information",
    email: "Email Address",
    password: "Password",
    confirmPassword: "Confirm Password",
    
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
    relationshipOptions: [
      "Spouse / partner",
      "Child (son, daughter) (exclusive custody)",
      "Child (shared custody)",
      "Partner's child (shared custody)",
      "Parent (father, mother)",
      "Step-parent",
      "Brother / sister",
      "Other family member (uncle, aunt, cousin, etc.)",
      "Roommate",
      "Friend",
      "Other. Please specify"
    ],
    remove: "Remove"
  },
  mfe: {
    register: "Anrezistre",
    next: "Swivan",
    previous: "Avan", 
    finish: "Fini",
    question: "Kesyon",
    of: "lor",
    
    // Account Information
    accountInfo: "Informasyon kont",
    email: "Adres email",
    password: "Mo de pas",
    confirmPassword: "Konfirm mo de pas",
    
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
    relationshipOptions: [
      "Madame/Monsiè/Partner",
      "Pitit (garson, fiy) (gard eksklizif)",
      "Pitit (gard alterne)",
      "Pitit Madame/Monsiè (gard alterne)",
      "Parent (papa, mama)",
      "Bo-parent",
      "Frè/Sèr",
      "Lot fami (tonton, tantinn, kozin, etc.)",
      "Kolokater",
      "Kamarad",
      "Lot bagay. Dir sa"
    ],
    remove: "Retire"
  },
  rcf: {
    register: "Anrèjistré",
    next: "Swivan",
    previous: "Avan",
    finish: "Fini", 
    question: "Késyon",
    of: "lor",
    
    // Account Information
    accountInfo: "Informasyon kont",
    email: "Adres email",
    password: "Mo de pas",
    confirmPassword: "Konfirm mo de pas",
    
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
    relationshipOptions: [
      "Madame/Monsiè/Partenèr",
      "Pitit (garson, fiy) (gard ékskluzif)",
      "Pitit (gard altèrné)",
      "Pitit Madame/Monsiè (gard altèrné)",
      "Parent (papa, mama)",
      "Bo-parent",
      "Frèr/Sèr",
      "Lot fami (tonton, tantinn, kouzin, etc.)",
      "Kolokatèr",
      "Kamarad",
      "Lot bagay. Dir sa"
    ],
    remove: "Rétiré"
  }
};

const RegisterPage: React.FC<RegisterPageProps> = ({ onBack, onComplete, language }) => {
  const t = translations[language];
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [formData, setFormData] = useState<RegistrationData>({
    email: '',
    password: '',
    confirmPassword: '',
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
    householdCount: '',
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
    if (currentQuestion > 0) {
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

  // Reusable radio button component
  const renderRadioOptions = (question: string, options: string[], fieldName: string, selectedValue: string) => (
    <div>
      <h3 style={{ 
        marginBottom: '2rem', 
        color: '#333', 
        fontSize: '1.3rem',
        fontWeight: '600',
        lineHeight: '1.4'
      }}>
        {question}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {options.map((option) => (
          <label 
            key={option} 
            style={{ 
              display: 'flex',
              alignItems: 'center',
              padding: '1.25rem',
              borderRadius: '16px',
              border: `2px solid ${selectedValue === option ? '#d97706' : '#e1e5e9'}`,
              background: selectedValue === option 
                ? 'linear-gradient(135deg, rgba(217, 119, 6, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
                : 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              if (selectedValue !== option) {
                e.currentTarget.style.borderColor = '#d97706';
                e.currentTarget.style.background = 'rgba(217, 119, 6, 0.02)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedValue !== option) {
                e.currentTarget.style.borderColor = '#e1e5e9';
                e.currentTarget.style.background = 'white';
              }
            }}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: `2px solid ${selectedValue === option ? '#d97706' : '#ccc'}`,
              marginRight: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: selectedValue === option ? '#d97706' : 'white',
              transition: 'all 0.3s ease',
              flexShrink: 0
            }}>
              {selectedValue === option && (
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'white'
                }} />
              )}
            </div>
            <input 
              type="radio" 
              name={fieldName} 
              value={option}
              checked={selectedValue === option}
              onChange={(e) => updateFormData(fieldName, e.target.value)}
              style={{ display: 'none' }}
            />
            <span style={{ 
              fontSize: '1rem',
              fontWeight: '500',
              color: selectedValue === option ? '#d97706' : '#333',
              lineHeight: '1.4',
              flex: 1
            }}>
              {option}
            </span>
            {selectedValue === option && (
              <div style={{
                marginLeft: '1rem',
                color: '#d97706',
                fontSize: '1.2rem',
                flexShrink: 0
              }}>
                ✓
              </div>
            )}
          </label>
        ))}
      </div>
    </div>
  );

  const renderQuestion = () => {
    switch (currentQuestion) {
      case 0:
        return (
          <div>
            <h3 style={{ 
              marginBottom: '2rem', 
              color: '#333', 
              fontSize: '1.3rem',
              fontWeight: '600',
              lineHeight: '1.4'
            }}>
              {t.accountInfo}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="email" 
                  placeholder={t.email}
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '1.25rem 1.5rem',
                    borderRadius: '16px',
                    border: '2px solid #e1e5e9',
                    fontSize: '1.1rem',
                    fontWeight: '500',
                    background: 'white',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#d97706';
                    e.target.style.boxShadow = '0 0 0 4px rgba(217, 119, 6, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e1e5e9';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              
              <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  placeholder={t.password}
                  value={formData.password}
                  onChange={(e) => updateFormData('password', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '1.25rem 1.5rem',
                    borderRadius: '16px',
                    border: '2px solid #e1e5e9',
                    fontSize: '1.1rem',
                    fontWeight: '500',
                    background: 'white',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#d97706';
                    e.target.style.boxShadow = '0 0 0 4px rgba(217, 119, 6, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e1e5e9';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              
              <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  placeholder={t.confirmPassword}
                  value={formData.confirmPassword}
                  onChange={(e) => updateFormData('confirmPassword', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '1.25rem 1.5rem',
                    borderRadius: '16px',
                    border: '2px solid #e1e5e9',
                    fontSize: '1.1rem',
                    fontWeight: '500',
                    background: 'white',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#d97706';
                    e.target.style.boxShadow = '0 0 0 4px rgba(217, 119, 6, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e1e5e9';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
          </div>
        );
      
      case 1:
        return (
          <div>
            <h3 style={{ 
              marginBottom: '2rem', 
              color: '#333', 
              fontSize: '1.3rem',
              fontWeight: '600',
              lineHeight: '1.4'
            }}>
              {t.q1}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {t.q1Options.map((option) => (
                <label 
                  key={option} 
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1.25rem',
                    borderRadius: '16px',
                    border: `2px solid ${formData.gender === option ? '#d97706' : '#e1e5e9'}`,
                    background: formData.gender === option 
                      ? 'linear-gradient(135deg, rgba(217, 119, 6, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
                      : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (formData.gender !== option) {
                      e.currentTarget.style.borderColor = '#d97706';
                      e.currentTarget.style.background = 'rgba(217, 119, 6, 0.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (formData.gender !== option) {
                      e.currentTarget.style.borderColor = '#e1e5e9';
                      e.currentTarget.style.background = 'white';
                    }
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: `2px solid ${formData.gender === option ? '#d97706' : '#ccc'}`,
                    marginRight: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: formData.gender === option ? '#d97706' : 'white',
                    transition: 'all 0.3s ease'
                  }}>
                    {formData.gender === option && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'white'
                      }} />
                    )}
                  </div>
                  <input 
                    type="radio" 
                    name="gender" 
                    value={option}
                    checked={formData.gender === option}
                    onChange={(e) => updateFormData('gender', e.target.value)}
                    style={{ display: 'none' }}
                  />
                  <span style={{ 
                    fontSize: '1.1rem',
                    fontWeight: '500',
                    color: formData.gender === option ? '#d97706' : '#333'
                  }}>
                    {option}
                  </span>
                  {formData.gender === option && (
                    <div style={{
                      marginLeft: 'auto',
                      color: '#d97706',
                      fontSize: '1.2rem'
                    }}>
                      ✓
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h3 style={{ 
              marginBottom: '2rem', 
              color: '#333', 
              fontSize: '1.3rem',
              fontWeight: '600',
              lineHeight: '1.4'
            }}>
              {t.q2}
            </h3>
            <div style={{ position: 'relative' }}>
              <input 
                type="number" 
                placeholder={t.birthYear}
                value={formData.birthYear}
                onChange={(e) => updateFormData('birthYear', e.target.value)}
                min="1920"
                max="2010"
                style={{
                  width: '100%',
                  padding: '1.25rem 1.5rem',
                  borderRadius: '16px',
                  border: '2px solid #e1e5e9',
                  fontSize: '1.1rem',
                  fontWeight: '500',
                  background: 'white',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#d97706';
                  e.target.style.boxShadow = '0 0 0 4px rgba(217, 119, 6, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e1e5e9';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <div style={{
                marginTop: '0.75rem',
                fontSize: '0.85rem',
                color: '#888',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>📅</span>
                <span>Enter year between 1920 and 2010</span>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h3 style={{ 
              marginBottom: '2rem', 
              color: '#333', 
              fontSize: '1.3rem',
              fontWeight: '600',
              lineHeight: '1.4'
            }}>
              {t.q3}
            </h3>
            <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="number" 
                  placeholder={t.height}
                  value={formData.height}
                  onChange={(e) => updateFormData('height', e.target.value)}
                  min="100"
                  max="250"
                  style={{
                    width: '100%',
                    padding: '1.25rem 1.5rem',
                    borderRadius: '16px',
                    border: '2px solid #e1e5e9',
                    fontSize: '1.1rem',
                    fontWeight: '500',
                    background: 'white',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#d97706';
                    e.target.style.boxShadow = '0 0 0 4px rgba(217, 119, 6, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e1e5e9';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <div style={{
                  position: 'absolute',
                  right: '1.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.9rem',
                  color: '#888',
                  pointerEvents: 'none'
                }}>
                  📏 cm
                </div>
              </div>
              
              <div style={{ position: 'relative' }}>
                <input 
                  type="number" 
                  placeholder={t.weight}
                  value={formData.weight}
                  onChange={(e) => updateFormData('weight', e.target.value)}
                  min="30"
                  max="200"
                  style={{
                    width: '100%',
                    padding: '1.25rem 1.5rem',
                    borderRadius: '16px',
                    border: '2px solid #e1e5e9',
                    fontSize: '1.1rem',
                    fontWeight: '500',
                    background: 'white',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#d97706';
                    e.target.style.boxShadow = '0 0 0 4px rgba(217, 119, 6, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e1e5e9';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <div style={{
                  position: 'absolute',
                  right: '1.5rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: '0.9rem',
                  color: '#888',
                  pointerEvents: 'none'
                }}>
                  ⚖️ kg
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return renderRadioOptions(t.q4, t.q4Options, 'professionalStatus', formData.professionalStatus);

      case 5:
        return (
          <div>
            <h3 style={{ 
              marginBottom: '2rem', 
              color: '#333', 
              fontSize: '1.3rem',
              fontWeight: '600',
              lineHeight: '1.4'
            }}>
              {t.q5}
            </h3>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder={t.activity}
                value={formData.activity}
                onChange={(e) => updateFormData('activity', e.target.value)}
                style={{
                  width: '100%',
                  padding: '1.25rem 1.5rem',
                  borderRadius: '16px',
                  border: '2px solid #e1e5e9',
                  fontSize: '1.1rem',
                  fontWeight: '500',
                  background: 'white',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#d97706';
                  e.target.style.boxShadow = '0 0 0 4px rgba(217, 119, 6, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e1e5e9';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <div style={{
                marginTop: '0.75rem',
                fontSize: '0.85rem',
                color: '#888',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>💼</span>
                <span>Describe your professional activity</span>
              </div>
            </div>
          </div>
        );

      case 6:
        return renderRadioOptions(t.q6, t.q6Options, 'workTime', formData.workTime);

      case 7:
        return (
          <div>
            <h3 style={{ 
              marginBottom: '2rem', 
              color: '#333', 
              fontSize: '1.3rem',
              fontWeight: '600',
              lineHeight: '1.4'
            }}>
              {t.q7}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {t.q7Options.map((option) => (
                <label 
                  key={option} 
                  style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1.25rem',
                    borderRadius: '16px',
                    border: `2px solid ${formData.education === option ? '#d97706' : '#e1e5e9'}`,
                    background: formData.education === option 
                      ? 'linear-gradient(135deg, rgba(217, 119, 6, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
                      : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (formData.education !== option) {
                      e.currentTarget.style.borderColor = '#d97706';
                      e.currentTarget.style.background = 'rgba(217, 119, 6, 0.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (formData.education !== option) {
                      e.currentTarget.style.borderColor = '#e1e5e9';
                      e.currentTarget.style.background = 'white';
                    }
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: `2px solid ${formData.education === option ? '#d97706' : '#ccc'}`,
                    marginRight: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: formData.education === option ? '#d97706' : 'white',
                    transition: 'all 0.3s ease',
                    flexShrink: 0
                  }}>
                    {formData.education === option && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'white'
                      }} />
                    )}
                  </div>
                  <input 
                    type="radio" 
                    name="education" 
                    value={option}
                    checked={formData.education === option}
                    onChange={(e) => updateFormData('education', e.target.value)}
                    style={{ display: 'none' }}
                  />
                  <span style={{ 
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: formData.education === option ? '#d97706' : '#333',
                    lineHeight: '1.4',
                    flex: 1
                  }}>
                    {option}
                  </span>
                  {formData.education === option && (
                    <div style={{
                      marginLeft: '1rem',
                      color: '#d97706',
                      fontSize: '1.2rem',
                      flexShrink: 0
                    }}>
                      ✓
                    </div>
                  )}
                </label>
              ))}
            </div>
            
            {formData.education.includes('Précisez') && (
              <div style={{ marginTop: '2rem', position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Précisez..."
                  value={formData.otherEducation}
                  onChange={(e) => updateFormData('otherEducation', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '1.25rem 1.5rem',
                    borderRadius: '16px',
                    border: '2px solid #e1e5e9',
                    fontSize: '1.1rem',
                    fontWeight: '500',
                    background: 'white',
                    transition: 'all 0.3s ease',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#d97706';
                    e.target.style.boxShadow = '0 0 0 4px rgba(217, 119, 6, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e1e5e9';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            )}
          </div>
        );

      case 8:
        return renderRadioOptions(t.q8, t.q8Options, 'maritalStatus', formData.maritalStatus);

      case 9:
        return renderRadioOptions(t.q9, t.q9Options, 'spouseActivity', formData.spouseActivity);

      case 10:
        return (
          <div>
            <h3 style={{ 
              marginBottom: '2rem', 
              color: '#333', 
              fontSize: '1.3rem',
              fontWeight: '600',
              lineHeight: '1.4'
            }}>
              {t.q10}
            </h3>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder={t.spouseJob}
                value={formData.spouseJob}
                onChange={(e) => updateFormData('spouseJob', e.target.value)}
                style={{
                  width: '100%',
                  padding: '1.25rem 1.5rem',
                  borderRadius: '16px',
                  border: '2px solid #e1e5e9',
                  fontSize: '1.1rem',
                  fontWeight: '500',
                  background: 'white',
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#d97706';
                  e.target.style.boxShadow = '0 0 0 4px rgba(217, 119, 6, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e1e5e9';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>
        );

      case 11:
        return renderRadioOptions(t.q11, t.q7Options, 'spouseEducation', formData.spouseEducation);

      case 12:
        return renderRadioOptions(t.q12, t.q12Options, 'monthlyIncome', formData.monthlyIncome);

      case 13:
        return (
          <div>
            <h3 style={{ 
              marginBottom: '2rem', 
              color: '#333', 
              fontSize: '1.3rem',
              fontWeight: '600',
              lineHeight: '1.4'
            }}>
              {t.q13}
            </h3>
            
            {formData.householdMembers.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                background: 'rgba(217, 119, 6, 0.02)',
                borderRadius: '16px',
                border: '2px dashed rgba(217, 119, 6, 0.2)',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>👥</div>
                <p style={{ color: '#888', margin: 0, fontSize: '0.95rem' }}>
                  No household members added yet
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                {formData.householdMembers.map((member, index) => (
                  <div key={index} style={{ 
                    padding: '1.5rem', 
                    background: 'white',
                    borderRadius: '16px', 
                    border: '2px solid #e1e5e9',
                    position: 'relative'
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      gap: '1rem', 
                      marginBottom: '1rem',
                      flexDirection: 'column'
                    }}>
                      <div style={{ display: 'flex', gap: '1rem' }}>
                        <input 
                          type="number" 
                          placeholder={t.age}
                          value={member.age}
                          onChange={(e) => updateHouseholdMember(index, 'age', e.target.value)}
                          min="0"
                          max="100"
                          style={{
                            flex: 1,
                            padding: '1rem',
                            borderRadius: '12px',
                            border: '2px solid #e1e5e9',
                            fontSize: '1rem',
                            fontWeight: '500',
                            background: 'white',
                            transition: 'all 0.3s ease',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#d97706';
                            e.target.style.boxShadow = '0 0 0 4px rgba(217, 119, 6, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e1e5e9';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                        <select 
                          value={member.relationship}
                          onChange={(e) => updateHouseholdMember(index, 'relationship', e.target.value)}
                          style={{
                            flex: 2,
                            padding: '1rem',
                            borderRadius: '12px',
                            border: '2px solid #e1e5e9',
                            fontSize: '1rem',
                            fontWeight: '500',
                            background: 'white',
                            transition: 'all 0.3s ease',
                            outline: 'none',
                            boxSizing: 'border-box',
                            cursor: 'pointer'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#d97706';
                            e.target.style.boxShadow = '0 0 0 4px rgba(217, 119, 6, 0.1)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = '#e1e5e9';
                            e.target.style.boxShadow = 'none';
                          }}
                        >
                          <option value="">{t.relationship}</option>
                          {t.relationshipOptions.map((option, optionIndex) => (
                            <option key={optionIndex} value={option}>{option}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeHouseholdMember(index)}
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        padding: '0.5rem',
                        background: '#fff',
                        border: '2px solid #ff6b6b',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        color: '#ff6b6b',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '36px',
                        height: '36px'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#ff6b6b';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#fff';
                        e.currentTarget.style.color = '#ff6b6b';
                      }}
                      title={t.remove}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <button 
              onClick={addHouseholdMember}
              style={{
                width: '100%',
                padding: '1.25rem',
                borderRadius: '16px',
                border: '2px dashed #d97706',
                background: 'rgba(217, 119, 6, 0.05)',
                color: '#d97706',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(217, 119, 6, 0.1)';
                e.currentTarget.style.borderColor = '#b45309';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(217, 119, 6, 0.05)';
                e.currentTarget.style.borderColor = '#d97706';
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>+</span>
              {t.addMember}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffc000',
      padding: 0,
      margin: 0,
      width: '100vw'
    }}>
      {/* Main Container */}
      <div style={{
        backgroundColor: '#ffc000',
        width: '100%',
        maxWidth: '100%',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        margin: 0,
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Sticky Header */}
        <div style={{
          position: 'sticky',
          top: 0,
          background: '#ffc000',
          zIndex: 10,
          padding: '2rem 2rem 1rem',
          borderBottom: '1px solid rgba(217, 119, 6, 0.1)',
          backdropFilter: 'blur(10px)',
          width: '100%'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '2rem'
          }}>
            <button 
              onClick={handlePrevious}
              style={{
                background: 'rgba(217, 119, 6, 0.1)',
                border: 'none',
                borderRadius: '12px',
                padding: '0.75rem',
                cursor: 'pointer',
                fontSize: '1.2rem',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '48px',
                height: '48px'
              }}
            >
              ←
            </button>
            
            <div style={{ textAlign: 'center', flex: 1, margin: '0 1rem' }}>
              <h1 style={{
                fontSize: '1.8rem',
                fontWeight: '700',
                color: '#333',
                margin: 0
              }}>
                {t.register}
              </h1>
            </div>
            
            <div style={{ minWidth: '48px' }}></div>
          </div>

          {/* Progress Section */}
          <div style={{ 
            textAlign: 'center',
            padding: '1.5rem',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '16px',
            border: '1px solid rgba(217, 119, 6, 0.2)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <div style={{
              background: '#d97706',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              {currentQuestion + 1}
            </div>
            <span style={{ 
              color: '#333', 
              fontWeight: '600', 
              fontSize: '1.1rem'
            }}>
              {t.question} {currentQuestion + 1} {t.of} 14
            </span>
          </div>
          
          {/* Progress Bar */}
          <div style={{ 
            width: '100%', 
            height: '8px', 
            backgroundColor: 'rgba(217, 119, 6, 0.1)', 
            borderRadius: '4px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{ 
              width: `${(currentQuestion / 13) * 100}%`, 
              height: '100%', 
              backgroundColor: '#d97706',
              borderRadius: '4px',
              transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '20px',
                height: '100%',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 100%)',
                animation: currentQuestion > 0 ? 'shimmer 2s ease-in-out infinite' : 'none'
              }} />
            </div>
          </div>
          
          <div style={{ 
            marginTop: '0.75rem',
            fontSize: '0.85rem',
            color: '#555',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>Progress</span>
            <span>{Math.round((currentQuestion / 13) * 100)}%</span>
          </div>
          </div>
        </div>
        
        {/* Scrollable Content Area */}
        <div style={{
          flex: 1,
          padding: '2rem',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          width: '100%'
        }}>
          {/* Question Content */}
          <div style={{
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            flex: 1
          }}>
            {renderQuestion()}
          </div>
          
          {/* Navigation Buttons */}
          <div style={{ 
            marginTop: '3rem', 
            display: 'flex', 
            gap: '1rem',
            alignItems: 'center',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(217, 119, 6, 0.1)'
          }}>
            {currentQuestion > 0 ? (
              <button 
                onClick={handlePrevious}
                style={{
                  flex: 1,
                  padding: '1rem 1.5rem',
                  borderRadius: '16px',
                  border: '2px solid #d97706',
                  background: 'white',
                  color: '#d97706',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(217, 119, 6, 0.05)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>←</span>
                {t.previous}
              </button>
            ) : (
              <div style={{ flex: 1 }}></div>
            )}
            
            <button 
              onClick={handleNext}
              style={{
                flex: 1,
                padding: '1rem 1.5rem',
                borderRadius: '16px',
                border: 'none',
                background: '#d97706',
                color: 'white',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 8px 24px rgba(217, 119, 6, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 32px rgba(217, 119, 6, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(217, 119, 6, 0.3)';
              }}
            >
              {currentQuestion === 13 ? t.finish : t.next}
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Shimmer Animation */}
      <style>{`
        @keyframes shimmer {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default RegisterPage;