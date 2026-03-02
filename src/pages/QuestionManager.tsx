import React, { useState, useEffect } from 'react';
import { GripVertical } from 'lucide-react';
import type { Theme } from '../theme';

type Language = 'fr' | 'en' | 'mfe' | 'rcf';
type QuestionCategory = 'register' | 'addMeal' | 'supplies';

interface Question {
  id: string;
  category: QuestionCategory;
  questionKey: string;
  type: 'text' | 'multiple' | 'single' | 'dropdown';
  translations: {
    [key in Language]: {
      question: string;
      description?: string;
      options?: string[];
      placeholder?: string;
    }
  };
  required: boolean;
  order: number;
}

interface QuestionManagerProps {
  theme: Theme;
}

interface QuestionFormModalProps {
  question: Question | null;
  activeCategory: QuestionCategory;
  filteredQuestionsCount: number;
  theme: Theme;
  onSave: (question: Question) => void;
  onCancel: () => void;
}

const QuestionFormModal: React.FC<QuestionFormModalProps> = ({
  question,
  activeCategory,
  filteredQuestionsCount,
  theme,
  onSave,
  onCancel
}) => {
  const [activeLanguage, setActiveLanguage] = useState<Language>('fr');
  const [formData, setFormData] = useState<Question>(
    question || {
      id: '',
      category: activeCategory,
      questionKey: '',
      type: 'text',
      translations: {
        fr: { question: '', description: '', options: [], placeholder: '' },
        en: { question: '', description: '', options: [], placeholder: '' },
        mfe: { question: '', description: '', options: [], placeholder: '' },
        rcf: { question: '', description: '', options: [], placeholder: '' }
      },
      required: false,
      order: filteredQuestionsCount + 1
    }
  );

  const handleTranslationChange = (lang: Language, field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: {
          ...prev.translations[lang],
          [field]: value
        }
      }
    }));
  };

  const handleOptionChange = (lang: Language, index: number, value: string) => {
    const currentOptions = formData.translations[lang].options || [];
    const newOptions = [...currentOptions];
    newOptions[index] = value;
    handleTranslationChange(lang, 'options', newOptions);
  };

  const addOption = (lang: Language) => {
    const currentOptions = formData.translations[lang].options || [];
    handleTranslationChange(lang, 'options', [...currentOptions, '']);
  };

  const removeOption = (lang: Language, index: number) => {
    const currentOptions = formData.translations[lang].options || [];
    const newOptions = currentOptions.filter((_: string, i: number) => i !== index);
    handleTranslationChange(lang, 'options', newOptions);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.overlayBg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: theme.cardBg,
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        border: `2px solid ${theme.borderAccent}`
      }}>
        <h3 style={{ color: theme.accent, margin: '0 0 2rem 0' }}>
          {question ? 'Edit Question' : 'Add New Question'}
        </h3>

        {/* Basic Info */}
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ color: theme.textPrimary, display: 'block', marginBottom: '0.5rem' }}>
            Question Key:
          </label>
          <input
            type="text"
            value={formData.questionKey}
            onChange={(e) => setFormData(prev => ({ ...prev, questionKey: e.target.value }))}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '6px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.inputBg,
              color: theme.textPrimary,
              marginBottom: '1rem'
            }}
            placeholder="e.g., mealTime, fullName"
          />

          <label style={{ color: theme.textPrimary, display: 'block', marginBottom: '0.5rem' }}>
            Question Type:
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Question['type'] }))}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '6px',
              border: `1px solid ${theme.border}`,
              backgroundColor: theme.inputBg,
              color: theme.textPrimary,
              marginBottom: '1rem'
            }}
          >
            <option value="text">Text Input</option>
            <option value="multiple">Multiple Choice</option>
            <option value="single">Single Choice</option>
            <option value="dropdown">Dropdown</option>
          </select>

          <label style={{ color: theme.textPrimary, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="checkbox"
              checked={formData.required}
              onChange={(e) => setFormData(prev => ({ ...prev, required: e.target.checked }))}
            />
            Required Question
          </label>
        </div>

        {/* Language Tabs */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            {(['fr', 'en', 'mfe', 'rcf'] as Language[]).map(lang => (
              <button
                key={lang}
                onClick={() => setActiveLanguage(lang)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: activeLanguage === lang ? theme.accent : theme.barBg,
                  color: activeLanguage === lang ? theme.textOnAccent : theme.textPrimary,
                  cursor: 'pointer'
                }}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Translation Form */}
          <div>
            <label style={{ color: theme.textPrimary, display: 'block', marginBottom: '0.5rem' }}>
              Question Text ({activeLanguage.toUpperCase()}):
            </label>
            <input
              type="text"
              value={formData.translations[activeLanguage].question}
              onChange={(e) => handleTranslationChange(activeLanguage, 'question', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.inputBg,
                color: theme.textPrimary,
                marginBottom: '1rem'
              }}
            />

            <label style={{ color: theme.textPrimary, display: 'block', marginBottom: '0.5rem' }}>
              Description ({activeLanguage.toUpperCase()}):
            </label>
            <textarea
              value={formData.translations[activeLanguage].description || ''}
              onChange={(e) => handleTranslationChange(activeLanguage, 'description', e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '6px',
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.inputBg,
                color: theme.textPrimary,
                marginBottom: '1rem',
                minHeight: '100px',
                resize: 'vertical'
              }}
            />

            {formData.type === 'text' && (
              <>
                <label style={{ color: theme.textPrimary, display: 'block', marginBottom: '0.5rem' }}>
                  Placeholder ({activeLanguage.toUpperCase()}):
                </label>
                <input
                  type="text"
                  value={formData.translations[activeLanguage].placeholder || ''}
                  onChange={(e) => handleTranslationChange(activeLanguage, 'placeholder', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: `1px solid ${theme.border}`,
                    backgroundColor: theme.inputBg,
                    color: theme.textPrimary,
                    marginBottom: '1rem'
                  }}
                />
              </>
            )}

            {(formData.type === 'multiple' || formData.type === 'single' || formData.type === 'dropdown') && (
              <>
                <label style={{ color: theme.textPrimary, display: 'block', marginBottom: '0.5rem' }}>
                  Options ({activeLanguage.toUpperCase()}):
                </label>
                {(formData.translations[activeLanguage].options || []).map((option, index) => (
                  <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(activeLanguage, index, e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: `1px solid ${theme.border}`,
                        backgroundColor: theme.inputBg,
                        color: theme.textPrimary
                      }}
                      placeholder={`Option ${index + 1}`}
                    />
                    <button
                      onClick={() => removeOption(activeLanguage, index)}
                      style={{
                        padding: '0.5rem',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: theme.danger,
                        color: '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addOption(activeLanguage)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: theme.accent,
                    color: theme.textOnAccent,
                    cursor: 'pointer',
                    marginBottom: '1rem'
                  }}
                >
                  Add Option
                </button>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              border: `2px solid ${theme.textMuted}`,
              backgroundColor: 'transparent',
              color: theme.textMuted,
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: theme.accent,
              color: theme.textOnAccent,
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Save Question
          </button>
        </div>
      </div>
    </div>
  );
};

const QuestionManager: React.FC<QuestionManagerProps> = ({ theme }) => {
  const [activeCategory, setActiveCategory] = useState<QuestionCategory>('register');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Sample initial questions data
  const initialQuestions: Question[] = [
    // Register Questions
    {
      id: 'reg_1',
      category: 'register',
      questionKey: 'gender',
      type: 'single',
      translations: {
        fr: { question: 'Êtes-vous ?', options: ['Homme', 'Femme', 'Autre'] },
        en: { question: 'What is your gender?', options: ['Male', 'Female', 'Other'] },
        mfe: { question: 'Ki ou ete?', options: ['Dimoun', 'Fanm', 'Lot'] },
        rcf: { question: 'Kosa ou lé?', options: ['Nonm', 'Fanm', 'Ot'] }
      },
      required: true,
      order: 1
    },
    {
      id: 'reg_2',
      category: 'register',
      questionKey: 'birthYear',
      type: 'text',
      translations: {
        fr: { question: 'Quelle est votre année de naissance ?', placeholder: 'Année de naissance' },
        en: { question: 'What is your birth year?', placeholder: 'Birth year' },
        mfe: { question: 'Ki anne ou finn ne?', placeholder: 'Anne nesans' },
        rcf: { question: 'Dan kel ané ou nésé?', placeholder: 'Ané nésans' }
      },
      required: true,
      order: 2
    },
    {
      id: 'reg_3',
      category: 'register',
      questionKey: 'heightWeight',
      type: 'text',
      translations: {
        fr: { question: 'Pouvez-vous indiquer approximativement votre taille et votre poids ?', description: 'Taille (cm) et Poids (kg)' },
        en: { question: 'Can you indicate approximately your height and weight?', description: 'Height (cm) and Weight (kg)' },
        mfe: { question: 'Ou kapav dir aprosimatman ou oteur ek ou pwa?', description: 'Oteur (cm) ek Pwa (kg)' },
        rcf: { question: 'Ou kap dir aprosimatman aou otèr èk aou pwa?', description: 'Otèr (cm) èk Pwa (kg)' }
      },
      required: true,
      order: 3
    },
    {
      id: 'reg_4',
      category: 'register',
      questionKey: 'professionalStatus',
      type: 'single',
      translations: {
        fr: {
          question: 'Quelle est votre situation professionnelle ?',
          options: ['En activité professionnelle', 'Sans activité professionnelle', 'En recherche d\'emploi', 'Étudiant avec une activité professionnelle', 'Étudiant sans activité professionnelle', 'Retraité en conservant une activité professionnelle', 'Retraité sans autre activité professionnelle']
        },
        en: {
          question: 'What is your professional situation?',
          options: ['Professionally active', 'Not professionally active', 'Looking for employment', 'Student with professional activity', 'Student without professional activity', 'Retired with professional activity', 'Retired without other professional activity']
        },
        mfe: {
          question: 'Ki ou sitiyasyon travay?',
          options: ['Pe travay', 'Pa pe travay', 'Pe rod travay', 'Etidyan ki pe travay', 'Etidyan ki pa pe travay', 'Retrèt ki pe travay', 'Retrèt ki pa pe travay']
        },
        rcf: {
          question: 'Kosa aou sitiyasyon travay?',
          options: ['Pé travay', 'Pa pé travay', 'Pé rod travay', 'Étidyan ki pé travay', 'Étidyan ki pa pé travay', 'Retrété ki pé travay', 'Retrété ki pa pé travay']
        }
      },
      required: true,
      order: 4
    },
    {
      id: 'reg_5',
      category: 'register',
      questionKey: 'professionalActivity',
      type: 'text',
      translations: {
        fr: { question: 'Quelle est votre activité professionnelle ?', placeholder: 'Activité professionnelle' },
        en: { question: 'What is your professional activity?', placeholder: 'Professional activity' },
        mfe: { question: 'Ki travay ou pe fer?', placeholder: 'Travay' },
        rcf: { question: 'Kel travay ou pé fèr?', placeholder: 'Travay' }
      },
      required: false,
      order: 5
    },
    {
      id: 'reg_6',
      category: 'register',
      questionKey: 'workTime',
      type: 'single',
      translations: {
        fr: { question: 'Est-ce un temps plein ou un temps partiel ?', options: ['Plein', 'Partiel'] },
        en: { question: 'Is it full-time or part-time?', options: ['Full-time', 'Part-time'] },
        mfe: { question: 'Li enn tan plen oswa tan paryèl?', options: ['Tan plen', 'Tan paryèl'] },
        rcf: { question: 'Li tan plen oswa tan paryèl?', options: ['Tan plen', 'Tan paryèl'] }
      },
      required: false,
      order: 6
    },
    {
      id: 'reg_7',
      category: 'register',
      questionKey: 'educationLevel',
      type: 'single',
      translations: {
        fr: {
          question: 'Quel est le niveau de diplôme le plus haut que vous avez obtenu ?',
          options: ['N\'a jamais été scolarisé', 'Niveau primaire : CEP ou PSAC', 'Niveau secondaire : School certificate / grade 10', 'HSC / grade 12', 'Éducation tertiaire (Undergraduate)', 'Éducation tertiaire (PG)', 'Doctorat', 'Autre diplôme', 'Diplôme à l\'étranger équivalent', 'Formation qualifiante certifiante']
        },
        en: {
          question: 'What is the highest level of education you have obtained?',
          options: ['Never been to school', 'Primary level: CEP or PSAC', 'Secondary level: School certificate / grade 10', 'HSC / grade 12', 'Tertiary education (Undergraduate)', 'Tertiary education (PG)', 'Doctorate', 'Other diploma', 'Equivalent foreign diploma', 'Qualifying certification training']
        },
        mfe: {
          question: 'Ki diplom pi o ou finn gagn?',
          options: ['Zame al lekol', 'Nivo primèr: CEP oswa PSAC', 'Nivo sekondar: School certificate / grade 10', 'HSC / grade 12', 'Edikasyon tersyer (Undergraduate)', 'Edikasyon tersyer (PG)', 'Doktra', 'Lot diplom', 'Diplom deor ekivalan', 'Formasyon kalifyan']
        },
        rcf: {
          question: 'Kel diplom pi o ou finn gagn?',
          options: ['Zamé alé lékol', 'Nivo primèr: CEP oswa PSAC', 'Nivo sékondar: School certificate / grade 10', 'HSC / grade 12', 'Édikasyon tersyèr (Undergraduate)', 'Édikasyon tersyèr (PG)', 'Doktora', 'Ot diplom', 'Diplom déor ékivalan', 'Formasyon kalifyan']
        }
      },
      required: true,
      order: 7
    },
    {
      id: 'reg_8',
      category: 'register',
      questionKey: 'maritalStatus',
      type: 'single',
      translations: {
        fr: { question: 'Quelle est votre situation conjugale parmi les suivantes ?', options: ['Marié(e)', 'Union libre', 'Union reconnue religieusement', 'Veuf(ve)', 'Divorcé(e)', 'Célibataire'] },
        en: { question: 'What is your marital status among the following?', options: ['Married', 'Civil union', 'Religiously recognized union', 'Widowed', 'Divorced', 'Single'] },
        mfe: { question: 'Ki ou sitiyasyon kouple?', options: ['Marye', 'Viv ansam', 'Maryaz relizye', 'Vèv', 'Divorce', 'Selibatèr'] },
        rcf: { question: 'Kosa aou sitiyasyon kouple?', options: ['Maryé', 'Viv ansam', 'Maryaz rèlijyé', 'Vèv', 'Divorsé', 'Sélibatèr'] }
      },
      required: true,
      order: 8
    },
    {
      id: 'reg_9',
      category: 'register',
      questionKey: 'spouseProfActivity',
      type: 'single',
      translations: {
        fr: { question: 'Est-ce que votre conjoint·e exerce une activité professionnelle ?', options: ['Oui', 'Non'] },
        en: { question: 'Does your spouse/partner have professional activity?', options: ['Yes', 'No'] },
        mfe: { question: 'Ou kouple pe travay?', options: ['Wi', 'Non'] },
        rcf: { question: 'Aou kouple pé travay?', options: ['Wi', 'Non'] }
      },
      required: false,
      order: 9
    },
    {
      id: 'reg_10',
      category: 'register',
      questionKey: 'spouseJob',
      type: 'text',
      translations: {
        fr: { question: 'Quelle activité exerce-t-il/elle ?', placeholder: 'Activité du conjoint' },
        en: { question: 'What activity does he/she do?', placeholder: 'Spouse\'s activity' },
        mfe: { question: 'Ki travay li pe fer?', placeholder: 'Travay kouple' },
        rcf: { question: 'Kel travay li pé fèr?', placeholder: 'Travay kouple' }
      },
      required: false,
      order: 10
    },
    {
      id: 'reg_11',
      category: 'register',
      questionKey: 'spouseEducation',
      type: 'single',
      translations: {
        fr: {
          question: 'Quel est le niveau de diplôme de votre conjoint·e ?',
          options: ['N\'a jamais été scolarisé', 'Niveau primaire : CEP ou PSAC', 'Niveau secondaire : School certificate / grade 10', 'HSC / grade 12', 'Éducation tertiaire (Undergraduate)', 'Éducation tertiaire (PG)', 'Doctorat', 'Autre diplôme', 'Diplôme à l\'étranger équivalent', 'Formation qualifiante certifiante']
        },
        en: {
          question: 'What is your spouse\'s level of education?',
          options: ['Never been to school', 'Primary level: CEP or PSAC', 'Secondary level: School certificate / grade 10', 'HSC / grade 12', 'Tertiary education (Undergraduate)', 'Tertiary education (PG)', 'Doctorate', 'Other diploma', 'Equivalent foreign diploma', 'Qualifying certification training']
        },
        mfe: {
          question: 'Ki diplom ou kouple ena?',
          options: ['Zame al lekol', 'Nivo primèr: CEP oswa PSAC', 'Nivo sekondar: School certificate / grade 10', 'HSC / grade 12', 'Edikasyon tersyer (Undergraduate)', 'Edikasyon tersyer (PG)', 'Doktra', 'Lot diplom', 'Diplom deor ekivalan', 'Formasyon kalifyan']
        },
        rcf: {
          question: 'Kel diplom aou kouple nana?',
          options: ['Zamé alé lékol', 'Nivo primèr: CEP oswa PSAC', 'Nivo sékondar: School certificate / grade 10', 'HSC / grade 12', 'Édikasyon tersyèr (Undergraduate)', 'Édikasyon tersyèr (PG)', 'Doktora', 'Ot diplom', 'Diplom déor ékivalan', 'Formasyon kalifyan']
        }
      },
      required: false,
      order: 11
    },
    {
      id: 'reg_12',
      category: 'register',
      questionKey: 'monthlyIncome',
      type: 'single',
      translations: {
        fr: {
          question: 'Dans quelle tranche de revenus mensuels (après impôts) se situe votre foyer ?',
          options: ['Moins de 10 000 Rs', '10 000 à 15 000 Rs', '15 000 à 20 000 Rs', '20 000 à 25 000 Rs', '25 000 à 30 000 Rs', '30 000 à 35 000 Rs', '35 000 à 40 000 Rs', '40 000 à 50 000 Rs', '50 000 à 60 000 Rs', '60 000 à 70 000 Rs', '70 000 à 80 000 Rs', '80 000 à 90 000 Rs', '90 000 à 100 000 Rs', '100 000 à 125 000 Rs', 'Plus de 125 000 Rs']
        },
        en: {
          question: 'What monthly income range (after taxes) does your household fall into?',
          options: ['Less than 10,000 Rs', '10,000 to 15,000 Rs', '15,000 to 20,000 Rs', '20,000 to 25,000 Rs', '25,000 to 30,000 Rs', '30,000 to 35,000 Rs', '35,000 to 40,000 Rs', '40,000 to 50,000 Rs', '50,000 to 60,000 Rs', '60,000 to 70,000 Rs', '70,000 to 80,000 Rs', '80,000 to 90,000 Rs', '90,000 to 100,000 Rs', '100,000 to 125,000 Rs', 'More than 125,000 Rs']
        },
        mfe: {
          question: 'Dan ki tranz revni mensyèl ou foye tombe?',
          options: ['Mwin ki 10,000 Rs', '10,000 a 15,000 Rs', '15,000 a 20,000 Rs', '20,000 a 25,000 Rs', '25,000 a 30,000 Rs', '30,000 a 35,000 Rs', '35,000 a 40,000 Rs', '40,000 a 50,000 Rs', '50,000 a 60,000 Rs', '60,000 a 70,000 Rs', '70,000 a 80,000 Rs', '80,000 a 90,000 Rs', '90,000 a 100,000 Rs', '100,000 a 125,000 Rs', 'Plis ki 125,000 Rs']
        },
        rcf: {
          question: 'Dan kel trans rèvni mensyèl aou foye tonbé?',
          options: ['Mwin ki 10,000 Rs', '10,000 a 15,000 Rs', '15,000 a 20,000 Rs', '20,000 a 25,000 Rs', '25,000 a 30,000 Rs', '30,000 a 35,000 Rs', '35,000 a 40,000 Rs', '40,000 a 50,000 Rs', '50,000 a 60,000 Rs', '60,000 a 70,000 Rs', '70,000 a 80,000 Rs', '80,000 a 90,000 Rs', '90,000 a 100,000 Rs', '100,000 a 125,000 Rs', 'Plis ki 125,000 Rs']
        }
      },
      required: true,
      order: 12
    },
    {
      id: 'reg_13',
      category: 'register',
      questionKey: 'householdMembers',
      type: 'text',
      translations: {
        fr: { question: 'Hormis vous, combien de personnes vivent actuellement sous votre toit ?', description: 'Indiquez l\'âge et le lien de parenté de chaque personne.' },
        en: { question: 'Apart from you, how many people currently live under your roof?', description: 'Indicate the age and relationship of each person.' },
        mfe: { question: 'Apa ou, konmye dimoun pe viv dan ou lakaz?', description: 'Dir laz ek ki li ete pou sak dimoun.' },
        rcf: { question: 'Apa ou, konbyèn dimoun pé viv dan aou lakaz?', description: 'Dir laz èk ki li lé pou sak dimoun.' }
      },
      required: true,
      order: 13
    },
    // Add Meal Questions
    {
      id: 'meal_1',
      category: 'addMeal',
      questionKey: 'mealTime',
      type: 'text',
      translations: {
        fr: {
          question: 'À quelle heure avez-vous commencé votre repas ?',
          description: 'HEURE DE LA CONSOMMATION\nÀ quelle heure avez-vous commencé votre repas ?'
        },
        en: {
          question: 'What time did you start your meal?',
          description: 'CONSUMPTION TIME\nWhat time did you start your meal?'
        },
        mfe: {
          question: 'Ki ler ou ti komas manze?',
          description: 'LER KONSOMATION\nKi ler ou ti komas manze?'
        },
        rcf: {
          question: 'Ki lèr ou té komans manzé?',
          description: 'LÈR KONSOMATION\nKi lèr ou té komans manzé?'
        }
      },
      required: true,
      order: 1
    },
    {
      id: 'meal_2',
      category: 'addMeal',
      questionKey: 'mealName',
      type: 'text',
      translations: {
        fr: {
          question: 'Comment appelez-vous ce moment ?',
          description: 'DÉNOMINATION DE LA PRISE\nChacun a son propre vocabulaire pour désigner une prise alimentaire. Il peut s\'agir d\'un goûter, d\'un apéro, d\'un petit-déjeuner…\nComment appelez-vous ce moment ?'
        },
        en: {
          question: 'What do you call this moment?',
          description: 'MEAL DESIGNATION\nEveryone has their own vocabulary to designate a food intake. It can be a snack, an aperitif, breakfast...\nWhat do you call this moment?'
        },
        mfe: {
          question: 'Kouma ou apel sa moman la?',
          description: 'DENOMINASYON PRIZ\nSakenn ena so prop vokabiler pou dir en priz alimanter. Li kapav en gouter, en apero, en ti dezene...\nKouma ou apel sa moman la?'
        },
        rcf: {
          question: 'Kouma ou apèl sa moman la?',
          description: 'DÉNOMINATION PRIZ\nSakènn éna so prop vokabiyé pou dir ènn priz alimantèr. Li kapav ènn goutèr, ènn apéro, ènn ti dézènè...\nKouma ou apèl sa moman la?'
        }
      },
      required: true,
      order: 2
    },
    {
      id: 'meal_3',
      category: 'addMeal',
      questionKey: 'ingredients',
      type: 'text',
      translations: {
        fr: {
          question: 'Indiquez les ingrédients consommés',
          description: 'COMPOSITION — ALIMENTS SOLIDES ET LIQUIDES\nIndiquez les ingrédients consommés.\nSi vous avez mangé du pain, précisez le type de pain.\nSi vous avez mangé du riz, indiquez le type de riz.\nSi vous avez bu de l\'eau, précisez s\'il s\'agit d\'eau du robinet ou d\'eau en bouteille (minérale, de source, plate ou gazeuse).\nSi vous avez bu du jus de fruits, indiquez le type de jus.\nMentionnez les marques et labels si possible.'
        },
        en: {
          question: 'Indicate the ingredients consumed',
          description: 'COMPOSITION — SOLID AND LIQUID FOODS\nIndicate the ingredients consumed.\nIf you ate bread, specify the type of bread.\nIf you ate rice, indicate the type of rice.\nIf you drank water, specify whether it was tap water or bottled water (mineral, spring, still or sparkling).\nIf you drank fruit juice, indicate the type of juice.\nMention brands and labels if possible.'
        },
        mfe: {
          question: 'Dir ki bann ingedient ou ti manze',
          description: 'KONPOZISYON — MANZE SOLID EK LIKID\nDir ki bann ingedient ou ti manze.\nSi ou ti manze dipen, dir ki kalite dipen.\nSi ou ti manze diri, dir ki kalite diri.\nSi ou ti bwar dilo, dir si ti dilo robinet ou dilo boutey (mineral, lasours, plat ou gazoz).\nSi ou ti bwar zu fri, dir ki kalite zu.\nMet bann mark ek label si posib.'
        },
        rcf: {
          question: 'Dir ki bann ingrédiàn ou té manzé',
          description: 'KONPOZISYON — MANZÉ SOLID ÈK LIKID\nDir ki bann ingrédiàn ou té manzé.\nSi ou té manzé dipèn, dir ki kalité dipèn.\nSi ou té manzé diri, dir ki kalité diri.\nSi ou té bwar dilo, dir si té dilo robinèt ou dilo boutèy (minéral, lasours, plat ou gazèz).\nSi ou té bwar zi fri, dir ki kalité zi.\nMèt bann mark èk labèl si posib.'
        }
      },
      required: true,
      order: 3
    },
    {
      id: 'meal_4',
      category: 'addMeal',
      questionKey: 'preparationMethod',
      type: 'text',
      translations: {
        fr: {
          question: 'Ce repas a-t-il été cuisiné par vous-même ou par un membre de votre famille ?',
          description: 'MODE DE PRÉPARATION DES ALIMENTS\nCe repas a-t-il été cuisiné par vous-même ou par un membre de votre famille ?\nA-t-il été acheté ou livré ?\nSi oui, quel est le lieu d\'achat ou de livraison ?'
        },
        en: {
          question: 'Was this meal cooked by yourself or by a family member?',
          description: 'FOOD PREPARATION METHOD\nWas this meal cooked by yourself or by a family member?\nWas it bought or delivered?\nIf yes, what is the place of purchase or delivery?'
        },
        mfe: {
          question: 'Sa manze la, to mem ou en dimoun lakaz ki ti kizine?',
          description: 'FASON PREPARE MANZE\nSa manze la, to mem ou en dimoun lakaz ki ti kizine?\nLi ti asete ou livre?\nSi wi, kot ki kote asete ou livrer?'
        },
        rcf: {
          question: 'Sa manzé la, to mèm ou ènn dimoun lakaz ki té kizinn?',
          description: 'FASON PRÉPARE MANZÉ\nSa manzé la, to mèm ou ènn dimoun lakaz ki té kizinn?\nLi té astè ou livré?\nSi wi, koté ki koté astè ou livrè?'
        }
      },
      required: true,
      order: 4
    },
    {
      id: 'meal_5',
      category: 'addMeal',
      questionKey: 'location',
      type: 'dropdown',
      translations: {
        fr: {
          question: 'Où avez-vous pris votre repas ?',
          description: 'LIEU\nOù avez-vous pris votre repas ?\n– au domicile\n– au travail (précisez l\'endroit exact)\n– sur le lieu d\'étude (cantine, cafétéria, restaurant universitaire…)\n– à proximité du lieu d\'étude\n– dans la rue\n– au restaurant\n– chez des amis\n– autre (à préciser)',
          options: ['À domicile', 'Au travail', 'À l\'école/université', 'Cantine/cafétéria', 'Restaurant', 'Fast-food', 'Chez des amis/famille', 'Dans la rue', 'Dans les transports', 'Autre']
        },
        en: {
          question: 'Where did you have your meal?',
          description: 'LOCATION\nWhere did you have your meal?\n– at home\n– at work (specify the exact location)\n– at the place of study (canteen, cafeteria, university restaurant...)\n– near the place of study\n– on the street\n– at a restaurant\n– at friends\' place\n– other (to specify)',
          options: ['At home', 'At work', 'At school/university', 'Canteen/cafeteria', 'Restaurant', 'Fast food', 'At friends/family', 'On the street', 'In transport', 'Other']
        },
        mfe: {
          question: 'Kot ou ti pran to manze?',
          description: 'KOTE\nKot ou ti pran to manze?\n– lakaz\n– travay (dir ekzakteman kot)\n– kote etid (kantin, kafeteria, restoran iniversite...)\n– kote pres kote etid\n– dan lari\n– restoran\n– lakaz kamarad\n– lot (eksplik)',
          options: ['Lakaz', 'Travay', 'Lekol/iniversite', 'Kantin/kafeteria', 'Restoran', 'Fast-food', 'Lakaz kamarad/lafamiy', 'Dan lari', 'Dan transpor', 'Lot']
        },
        rcf: {
          question: 'Koté ou té pran to manzé?',
          description: 'KOTÉ\nKoté ou té pran to manzé?\n– lakaz\n– travay (dir èkzakteman koté)\n– koté étid (kantin, kafétèria, rèstoran inivèrsité...)\n– koté prè koté étid\n– dan lari\n– rèstoran\n– lakaz kamarad\n– lot (èksplik)',
          options: ['Lakaz', 'Travay', 'Lékol/inivèrsité', 'Kantin/kafétèria', 'Restoran', 'Fast-food', 'Lakaz kamarad/lafamiy', 'Dan lari', 'Dan transpor', 'Lot']
        }
      },
      required: true,
      order: 5
    },
    {
      id: 'meal_6',
      category: 'addMeal',
      questionKey: 'sociability',
      type: 'text',
      translations: {
        fr: {
          question: 'Étiez-vous seul·e ou accompagné·e ?',
          description: 'SOCIABILITÉ\nÉtiez-vous seul·e ou accompagné·e ?'
        },
        en: {
          question: 'Were you alone or accompanied?',
          description: 'SOCIABILITY\nWere you alone or accompanied?'
        },
        mfe: {
          question: 'To ti sel ou to ti ar dimoun?',
          description: 'SOSYABILITE\nTo ti sel ou to ti ar dimoun?'
        },
        rcf: {
          question: 'To té sèl ou to té ar dimoun?',
          description: 'SOSYABILITÉ\nTo té sèl ou to té ar dimoun?'
        }
      },
      required: true,
      order: 6
    },
    {
      id: 'meal_7',
      category: 'addMeal',
      questionKey: 'modalities',
      type: 'text',
      translations: {
        fr: {
          question: 'Étiez-vous debout ou assis·e ? Faisiez-vous autre chose en mangeant ?',
          description: 'MODALITÉS\nÉtiez-vous debout ou assis·e ?\nFaisiez-vous autre chose en mangeant ?'
        },
        en: {
          question: 'Were you standing or sitting? Were you doing something else while eating?',
          description: 'MODALITIES\nWere you standing or sitting?\nWere you doing something else while eating?'
        },
        mfe: {
          question: 'To ti debout ou asiz? To ti pe fer lot kisaz kan to manze?',
          description: 'MODALITE\nTo ti debout ou asiz?\nTo ti pe fer lot kisaz kan to manze?'
        },
        rcf: {
          question: 'To té débout ou asiz? To té pé fèr lot kisaz kan to manzé?',
          description: 'MODALITÉ\nTo té débout ou asiz?\nTo té pé fèr lot kisaz kan to manzé?'
        }
      },
      required: true,
      order: 7
    },
    {
      id: 'meal_8',
      category: 'addMeal',
      questionKey: 'duration',
      type: 'text',
      translations: {
        fr: {
          question: 'Combien de temps a duré ce repas ?',
          description: 'DURÉE\nCombien de temps a duré ce repas ?'
        },
        en: {
          question: 'How long did this meal last?',
          description: 'DURATION\nHow long did this meal last?'
        },
        mfe: {
          question: 'Konbyen tan to ti pran pou manze?',
          description: 'DIRE\nKonbyen tan to ti pran pou manze?'
        },
        rcf: {
          question: 'Konbyèn tan to té pran pou manzé?',
          description: 'DIRÉ\nKonbyèn tan to té pran pou manzé?'
        }
      },
      required: true,
      order: 8
    },
    {
      id: 'meal_9',
      category: 'addMeal',
      questionKey: 'differences',
      type: 'text',
      translations: {
        fr: {
          question: 'En quoi ce repas diffère-t-il de vos habitudes alimentaires ?',
          description: 'DIFFÉRENCES PAR RAPPORT À L\'HABITUDE\nEn quoi ce repas diffère-t-il de vos habitudes alimentaires ?'
        },
        en: {
          question: 'How does this meal differ from your eating habits?',
          description: 'DIFFERENCES FROM HABIT\nHow does this meal differ from your eating habits?'
        },
        mfe: {
          question: 'Kouma sa manze la diferan ek to fason manze abitiel?',
          description: 'DIFERANS EK ABITYID\nKouma sa manze la diferan ek to fason manze abitiel?'
        },
        rcf: {
          question: 'Kouma sa manzé la diférèn èk to fason manzé abitiyèl?',
          description: 'DIFÉRÈNS ÈK ABITIYID\nKouma sa manzé la diférèn èk to fason manzé abitiyèl?'
        }
      },
      required: true,
      order: 9
    },
    // Supplies Questions
    {
      id: 'supply_1',
      category: 'supplies',
      questionKey: 'shoppingLocations',
      type: 'multiple',
      translations: {
        fr: {
          question: 'Où faites-vous vos courses ?',
          description: 'Indiquez les lieux où vous faites vos achats alimentaires, souvent ou parfois.',
          options: ['Supermarché / Hypermarché hors discount', 'Magasin hard discount', 'Épicerie Supérette', 'Boulangerie – pâtisserie', 'Commerces de proximité spécialisés (boucherie, poissonnerie)', 'Magasin de surgelés', 'Magasin BIO', 'Marché forain', 'Vendeur en bord de route', 'Primeur', 'Paniers de producteurs', 'Commerçant ambulant', 'Station-service', 'Centre d\'aide alimentaire', 'Achat par internet, téléphone ou catalogue', 'Jardin, verger, élevage personnel', 'Pêche / cueillette personnelle', 'Produits reçus']
        },
        en: {
          question: 'Where do you shop for food?',
          description: 'Indicate the places where you buy food, often or sometimes.',
          options: ['Supermarket / Hypermarket', 'Hard discount store', 'Grocery / Mini-mart', 'Bakery – Pastry shop', 'Specialized local shops (butcher, fishmonger)', 'Frozen food store', 'Organic store', 'Open-air market', 'Roadside vendor', 'Greengrocer', 'Producer baskets', 'Mobile vendor', 'Gas station', 'Food aid center', 'Online, phone or catalog purchase', 'Personal garden, orchard, farming', 'Personal fishing / foraging', 'Received products']
        },
        mfe: {
          question: 'Kot ou fer ou lasas?',
          description: 'Dir kot ou aste manze, souvan ou parfwa.',
          options: ['Supermarke / Hipermarke', 'Magazin discount', 'Laboutik', 'Boulanzri – patisri', 'Magazin spesyal (bouse, pwason)', 'Magazin sirzele', 'Magazin BIO', 'Bazar', 'Marsan lor bor simin', 'Marsan legim', 'Panye prodikter', 'Marsan anbilan', 'Stasyon servis', 'Sant led alimanter', 'Aste lor internet, telefon ou katalog', 'Zardin, verze, elevaz personel', 'Lapes / ramase personel', 'Prodwi resevwar']
        },
        rcf: {
          question: 'Koté ou fé aou lasas?',
          description: 'Dir koté ou asté manzé, souvan ou parfwa.',
          options: ['Supèrmarké / Hipèrmarké', 'Magazinn diskount', 'Laboutik', 'Boulanzri – patisri', 'Magazinn spésyal (bousé, pwason)', 'Magazinn sirjélé', 'Magazinn BIO', 'Bazar', 'Marsan lor bor simin', 'Marsan légim', 'Panyé prodiktèr', 'Marsan anbilan', 'Stasyon sèrvis', 'Sant léd alimantèr', 'Asté lor intèrnèt, téléfon ou katalog', 'Zardin, vèrzé, élevaz pèrsonèl', 'Lapès / ramas pèrsonèl', 'Prodwi résèvwar']
        }
      },
      required: true,
      order: 1
    },
    {
      id: 'supply_2',
      category: 'supplies',
      questionKey: 'shoppingReasons',
      type: 'multiple',
      translations: {
        fr: {
          question: 'Quelles sont les raisons pour lesquelles vous avez fréquenté ces lieux durant ces 4 dernières semaines ?',
          options: ['Les prix', 'La proximité', 'La praticité', 'La publicité/Promotion', 'La qualité', 'Autres']
        },
        en: {
          question: 'What are the reasons you visited these places in the last 4 weeks?',
          options: ['Prices', 'Proximity', 'Convenience', 'Advertising/Promotion', 'Quality', 'Other']
        },
        mfe: {
          question: 'Kifer ou ti al dan sa bann landrwa la pandan sa 4 dernye semenn la?',
          options: ['Bann pri', 'Proximite', 'Pratik', 'Piblisite/Promosyon', 'Kalite', 'Lot']
        },
        rcf: {
          question: 'Kifèr ou té al dan sa bann landrwa la pandan sa 4 dèrnyé semènn la?',
          options: ['Bann pri', 'Proximité', 'Pratik', 'Piblisité/Promosyon', 'Kalité', 'Lot']
        }
      },
      required: true,
      order: 2
    },
    {
      id: 'supply_3',
      category: 'supplies',
      questionKey: 'stcUsage',
      type: 'single',
      translations: {
        fr: { question: 'Utilisez-vous le STC (subventionnés) pour faire vos achats alimentaires ?', options: ['Oui', 'Non'] },
        en: { question: 'Do you use the STC (subsidized) for food purchases?', options: ['Yes', 'No'] },
        mfe: { question: 'Ou servi STC (sibvansyone) pou aste manze?', options: ['Wi', 'Non'] },
        rcf: { question: 'Ou sèrvi STC (sibvansyoné) pou asté manzé?', options: ['Wi', 'Non'] }
      },
      required: true,
      order: 3
    },
    {
      id: 'supply_4',
      category: 'supplies',
      questionKey: 'expenseAttention',
      type: 'single',
      translations: {
        fr: { question: 'Au cours des quatre dernières semaines, vous est-il arrivé de devoir faire attention à vos dépenses totales du foyer ?', description: 'Loyer, factures diverses, alimentation, loisirs...', options: ['Oui', 'Non'] },
        en: { question: 'In the past four weeks, have you had to watch your total household expenses?', description: 'Rent, various bills, food, leisure...', options: ['Yes', 'No'] },
        mfe: { question: 'Dan sa 4 dernye semenn la, ou ti bizin fer atansyon dan ou depans total lakaz?', description: 'Lwaye, bann faktur, manze, lwazir...', options: ['Wi', 'Non'] },
        rcf: { question: 'Dan sa 4 dèrnyé semènn la, ou té bizin fèr atansyon dan aou dépans total lakaz?', description: 'Lwayé, bann faktir, manzé, lwazir...', options: ['Wi', 'Non'] }
      },
      required: true,
      order: 4
    },
    {
      id: 'supply_5',
      category: 'supplies',
      questionKey: 'expenseAdjustments',
      type: 'multiple',
      translations: {
        fr: {
          question: 'Dans quels domaines avez-vous ajusté vos dépenses ?',
          options: ['Alimentation (quantité, qualité, produits achetés)', 'Logement (loyer, réparations, charges)', 'Transports (essence, entretien, déplacements)', 'Santé (consultations, soins, médicaments)', 'Énergie (gaz, climatisation)', 'Communication (téléphone, internet)', 'Loisirs et sorties (restaurant...)', 'Achats personnels (vêtements, électroménager)', 'Cigarettes et Alcool', 'Autre']
        },
        en: {
          question: 'In which areas have you adjusted your expenses?',
          options: ['Food (quantity, quality, products purchased)', 'Housing (rent, repairs, charges)', 'Transportation (gas, maintenance, travel)', 'Health (consultations, care, medications)', 'Energy (gas, air conditioning)', 'Communication (phone, internet)', 'Leisure and outings (restaurant...)', 'Personal purchases (clothing, appliances)', 'Cigarettes and Alcohol', 'Other']
        },
        mfe: {
          question: 'Dan ki domenn ou finn aziste ou depans?',
          options: ['Manze (kantite, kalite, prodwi aste)', 'Lozman (lwaye, reparasyon, sarz)', 'Transpor (lesans, antretyen, deplasman)', 'Lasante (konsiltasyon, swen, medikaman)', 'Lenerzi (gaz, klimatizasyon)', 'Kominikasyon (telefon, internet)', 'Lwazir ek sorti (restoran...)', 'Asa personel (linz, elektromenazer)', 'Sigaret ek Lalkol', 'Lot']
        },
        rcf: {
          question: 'Dan kel domènn ou finn azisté aou dépans?',
          options: ['Manzé (kantité, kalité, prodwi asté)', 'Lozman (lwayé, réparasyon, sarz)', 'Transpor (lésans, antrètyen, déplasman)', 'Lasanté (konsiltasyon, swèn, médikaman)', 'Lénèrzi (gaz, klimatizasyon)', 'Kominikasyon (téléfon, intèrnèt)', 'Lwazir èk sorti (rèstoran...)', 'Asa pèrsonèl (linz, élèktroménajèr)', 'Sigarèt èk Lalkol', 'Lot']
        }
      },
      required: false,
      order: 5
    },
    {
      id: 'supply_6',
      category: 'supplies',
      questionKey: 'foodSecurity',
      type: 'multiple',
      translations: {
        fr: {
          question: 'Au cours des 4 dernières semaines, vous êtes-vous trouvé(e) dans une situation où, faute de moyens :',
          options: ['Vous avez été inquiet(e) de ne pas avoir assez à manger', 'Vous ne pouviez pas manger des aliments nourrissants', 'Vous ne pouviez pas manger des aliments bons pour la santé', 'Vous mangiez presque toujours la même chose', 'Vous aviez dû sauter un repas', 'Vous n\'avez pas mangé autant qu\'il aurait fallu', 'Il n\'y avait plus rien à manger à la maison', 'Vous aviez faim mais n\'avez pas mangé', 'Vous n\'aviez rien mangé de toute la journée']
        },
        en: {
          question: 'In the past 4 weeks, have you found yourself in a situation where, due to lack of means:',
          options: ['You were worried about not having enough to eat', 'You could not eat nutritious food', 'You could not eat healthy food', 'You ate almost always the same thing', 'You had to skip a meal', 'You did not eat as much as you should have', 'There was nothing left to eat at home', 'You were hungry but did not eat', 'You had not eaten anything all day']
        },
        mfe: {
          question: 'Dan sa 4 dernye semenn la, ou ti dan enn sitiyasyon kot, fot mwayen:',
          options: ['Ou ti inkyet pa gagn ase manze', 'Ou pa ti kapav manz manze nourisan', 'Ou pa ti kapav manz manze bon pou lasante', 'Ou ti manz preske toultan mem kitsoz', 'Ou ti bizin sot enn repa', 'Ou pa ti manz ase', 'Pa ti ena nanye pou manze lakaz', 'Ou ti ena fen me pa ti manze', 'Ou pa ti manz nanye toutlajourné']
        },
        rcf: {
          question: 'Dan sa 4 dèrnyé semènn la, ou té dan ènn sitiyasyon koté, fot mwayèn:',
          options: ['Ou té inkiyé pa gagn asé manzé', 'Ou pa té kapav manz manzé nourisan', 'Ou pa té kapav manz manzé bon pou lasanté', 'Ou té manz prèsk toultan mèm kitsoz', 'Ou té bizin sot ènn répa', 'Ou pa té manz asé', 'Pa té éna nanyé pou manzé lakaz', 'Ou té éna fin mé pa té manzé', 'Ou pa té manz nanyé toutlajournée']
        }
      },
      required: true,
      order: 6
    },
    {
      id: 'supply_7',
      category: 'supplies',
      questionKey: 'mealQualityReasons',
      type: 'multiple',
      translations: {
        fr: {
          question: 'Pouvez-vous indiquer les éléments qui ont pu vous amener à penser que ce que vous mangiez n\'était pas un "bon repas" ?',
          options: ['Imprévus', 'Contrainte de contexte, de lieu', 'Temps insuffisant', 'Aspect ou odeur attractifs et tentant', 'Moyens insuffisants', 'Pas seul·e à décider', 'Offre inadaptée', 'Volonté', 'Indisponibilité des proches', 'Les émotions (angoisses, tristesse...)', 'Autre']
        },
        en: {
          question: 'Can you indicate what made you think what you were eating was not a "good meal"?',
          options: ['Unexpected events', 'Context or location constraint', 'Insufficient time', 'Attractive and tempting appearance or smell', 'Insufficient means', 'Not alone in deciding', 'Unsuitable offer', 'Will', 'Unavailability of close ones', 'Emotions (anxiety, sadness...)', 'Other']
        },
        mfe: {
          question: 'Ki bann kitsoz ki finn fer ou panse ki saki ou pe manze pa ti enn "bon repa"?',
          options: ['Inprevu', 'Kontrent konteks, landrwa', 'Pa ase letan', 'Laper ou loder atiran', 'Pa ase mwayen', 'Pa sel ki desid', 'Lof pa adapte', 'Volonte', 'Pros pa disponib', 'Bann emosyon (angwas, tristès...)', 'Lot']
        },
        rcf: {
          question: 'Ki bann kitsoz ki finn fèr ou pans ki saki ou pé manzé pa té ènn "bon répa"?',
          options: ['Inprévir', 'Kontrènt kontèks, landrwa', 'Pa asé létan', 'Lapèr ou lodèr atiran', 'Pa asé mwayèn', 'Pa sèl ki désid', 'Lof pa adapté', 'Volonté', 'Pros pa disponib', 'Bann émosyon (angwas, tristès...)', 'Lot']
        }
      },
      required: true,
      order: 7
    },
    {
      id: 'supply_8',
      category: 'supplies',
      questionKey: 'cookingFrequency',
      type: 'single',
      translations: {
        fr: {
          question: 'Au cours des quatre dernières semaines, à quelle fréquence avez-vous cuisiné ?',
          options: ['Tous les jours', '2 ou 3 fois par semaine', '1 fois par semaine', '0 fois']
        },
        en: {
          question: 'In the past four weeks, how often did you cook?',
          options: ['Every day', '2 or 3 times a week', 'Once a week', 'Never']
        },
        mfe: {
          question: 'Dan sa 4 dernye semenn la, konmye fwa ou finn kwizine?',
          options: ['Tou le zour', '2 ou 3 fwa par semenn', '1 fwa par semenn', '0 fwa']
        },
        rcf: {
          question: 'Dan sa 4 dèrnyé semènn la, konbyèn fwa ou finn kwizinn?',
          options: ['Tou lé zour', '2 ou 3 fwa par semènn', '1 fwa par semènn', '0 fwa']
        }
      },
      required: true,
      order: 8
    },
    {
      id: 'supply_9',
      category: 'supplies',
      questionKey: 'dietChanges',
      type: 'multiple',
      translations: {
        fr: {
          question: 'Lors des 4 dernières semaines, avez-vous modifié ou voulu modifier votre alimentation pour une des raisons suivantes ?',
          options: ['Pour améliorer ma forme et mon bien-être', 'Parce que ma vie ou celle de mes proches est en jeu', 'Pour des raisons de convictions et d\'éthique', 'Du fait d\'un changement de mode de vie', 'Suite à un changement de schéma familial', 'Du fait de me retrouver seul·e', 'Parce que je n\'avais pas d\'autres alternatives']
        },
        en: {
          question: 'In the past 4 weeks, have you changed or wanted to change your diet for any of the following reasons?',
          options: ['To improve my fitness and well-being', 'Because my life or that of my loved ones is at stake', 'For ethical or conviction reasons', 'Due to a lifestyle change', 'Following a change in family situation', 'Finding myself alone', 'Because I had no other alternatives']
        },
        mfe: {
          question: 'Dan sa 4 dernye semenn la, ou finn sanz ou fason manze pou enn sa bann rezon la?',
          options: ['Pou amelyor mo form ek mo byenet', 'Parski mo lavi ou sa mo pros an ze', 'Pou bann rezon konviksyon ek etik', 'Akoz enn sanzman mod lavi', 'Apre enn sanzman sitiyasyon familyal', 'Akoz mo retrouv mwa sel', 'Parski mo pa ti ena lot solisyon']
        },
        rcf: {
          question: 'Dan sa 4 dèrnyé semènn la, ou finn sanz aou fason manzé pou ènn sa bann rézon la?',
          options: ['Pou amélyoré mo form èk mo byènèt', 'Parski mo lavi ou sa mo pros an jé', 'Pou bann rézon konviksyon èk étik', 'Akoz ènn sanzman mod lavi', 'Aprè ènn sanzman sitiyasyon familyal', 'Akoz mo rétrouve mwa sèl', 'Parski mo pa té éna lot solisyon']
        }
      },
      required: true,
      order: 9
    },
    {
      id: 'supply_10',
      category: 'supplies',
      questionKey: 'foodConcerns',
      type: 'multiple',
      translations: {
        fr: {
          question: 'Au cours des quatre dernières semaines, avez-vous eu des préoccupations par rapport à l\'alimentation ?',
          options: ['Aucune préoccupation', 'Hausse des prix', 'Effets sur la santé', 'Perte de tradition et d\'identité', 'Effets sur le corps (prise de poids...)', 'Pénuries, crises, manque de nourriture', 'Qualité ou fraîcheur des produits vendus', 'Produits importés (traçabilité, qualité)', 'Rappels de produits pour des raisons sanitaires', 'Équité du système alimentaire', 'Avenir pour nos enfants', 'Produits (ultra) transformés', 'Effets sur l\'environnement']
        },
        en: {
          question: 'In the past four weeks, have you had any concerns about food?',
          options: ['No concerns', 'Rising prices', 'Health effects', 'Loss of tradition and identity', 'Effects on the body (weight gain...)', 'Shortages, crises, lack of food', 'Quality or freshness of products sold', 'Imported products (traceability, quality)', 'Product recalls for health reasons', 'Fairness of the food system', 'Future for our children', 'Ultra-processed products', 'Effects on the environment']
        },
        mfe: {
          question: 'Dan sa 4 dernye semenn la, ou ti ena bann preokipasyon lor manze?',
          options: ['Okenn preokipasyon', 'Ogmantasyon pri', 'Lefe lor lasante', 'Pert tradisyon ek lidantite', 'Lefe lor lekor (priz pwa...)', 'Peniri, kriz, mank manze', 'Kalite ou fresher prodwi vande', 'Prodwi inporte (trasabilite, kalite)', 'Rapel prodwi pou rezon saniter', 'Ekite sistem alimanter', 'Lavenir pou nou zanfan', 'Prodwi (iltra) transforme', 'Lefe lor lanvironnman']
        },
        rcf: {
          question: 'Dan sa 4 dèrnyé semènn la, ou té éna bann préokipasyon lor manzé?',
          options: ['Okènn préokipasyon', 'Ogmantasyon pri', 'Léfè lor lasanté', 'Pèrt tradisyon èk lidantité', 'Léfèt lor lékol (priz pwa...)', 'Péniri, kriz, mank manzé', 'Kalité ou frèshèr prodwi vandé', 'Prodwi inporté (trasabilité, kalité)', 'Rapèl prodwi pou rézon sanitèr', 'Ékité sistèm alimantèr', 'Lavnir pou nou zanfan', 'Prodwi (iltra) transformé', 'Léfè lor lanvironman']
        }
      },
      required: true,
      order: 10
    }
  ];

  useEffect(() => {
    setQuestions(initialQuestions);
  }, []);

  const filteredQuestions = questions
    .filter(q => q.category === activeCategory)
    .sort((a, b) => a.order - b.order);

  const handleSaveQuestion = (question: Question) => {
    if (editingQuestion) {
      setQuestions(prev => prev.map(q => q.id === question.id ? question : q));
    } else {
      const newQuestion = {
        ...question,
        id: `${activeCategory}_${Date.now()}`,
        category: activeCategory
      };
      setQuestions(prev => [...prev, newQuestion]);
    }
    setEditingQuestion(null);
    setShowAddModal(false);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
    setShowDeleteConfirm(null);
  };

  const handleDragStart = (questionId: string) => {
    setDraggedId(questionId);
  };

  const handleDragOver = (e: React.DragEvent, questionId: string) => {
    e.preventDefault();
    if (draggedId !== questionId) {
      setDragOverId(questionId);
    }
  };

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const categoryQuestions = questions
      .filter(q => q.category === activeCategory)
      .sort((a, b) => a.order - b.order);

    const draggedIndex = categoryQuestions.findIndex(q => q.id === draggedId);
    const targetIndex = categoryQuestions.findIndex(q => q.id === targetId);
    if (draggedIndex < 0 || targetIndex < 0) return;

    // Remove dragged item and insert at target position
    const reordered = [...categoryQuestions];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, moved);

    // Reassign order values
    const orderMap = new Map<string, number>();
    reordered.forEach((q, i) => orderMap.set(q.id, i + 1));

    setQuestions(prev => prev.map(q => {
      const newOrder = orderMap.get(q.id);
      return newOrder !== undefined ? { ...q, order: newOrder } : q;
    }));

    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    }}>
      {/* Top bar: category tabs + add button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {([
            { key: 'register', label: 'Registration' },
            { key: 'addMeal', label: 'Add Meal' },
            { key: 'supplies', label: 'Supplies' }
          ] as { key: QuestionCategory; label: string }[]).map(category => (
            <button
              key={category.key}
              onClick={() => setActiveCategory(category.key)}
              style={{
                backgroundColor: activeCategory === category.key ? theme.accent : 'transparent',
                color: activeCategory === category.key ? theme.textOnAccent : theme.textSecondary,
                border: 'none',
                borderRadius: '8px',
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                fontWeight: activeCategory === category.key ? '600' : '400',
                cursor: 'pointer',
                outline: 'none',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => {
                if (activeCategory !== category.key) {
                  e.currentTarget.style.backgroundColor = theme.inputBg;
                  e.currentTarget.style.color = theme.textPrimary;
                }
              }}
              onMouseLeave={(e) => {
                if (activeCategory !== category.key) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.textSecondary;
                }
              }}
            >
              {category.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            backgroundColor: theme.accent,
            color: theme.textOnAccent,
            border: 'none',
            borderRadius: '8px',
            padding: '0.5rem 1.25rem',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          + Add Question
        </button>
      </div>
        <div style={{
          backgroundColor: theme.cardBg,
          borderRadius: '12px',
          padding: '2rem',
          border: `2px solid ${theme.borderAccent}`
        }}>
          <h3 style={{
            color: theme.accent,
            fontSize: '1.2rem',
            margin: '0 0 2rem 0'
          }}>
            {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Questions
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredQuestions.map((question) => (
              <div
                key={question.id}
                draggable
                onDragStart={() => handleDragStart(question.id)}
                onDragOver={(e) => handleDragOver(e, question.id)}
                onDrop={() => handleDrop(question.id)}
                onDragEnd={handleDragEnd}
                style={{
                  backgroundColor: theme.inputBg,
                  borderRadius: '8px',
                  padding: '1.5rem',
                  border: `1px solid ${dragOverId === question.id && draggedId !== question.id ? theme.accent : theme.border}`,
                  borderTop: dragOverId === question.id && draggedId !== question.id ? `3px solid ${theme.accent}` : `1px solid ${dragOverId === question.id && draggedId !== question.id ? theme.accent : theme.border}`,
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'start',
                  opacity: draggedId === question.id ? 0.4 : 1,
                  transition: 'opacity 0.2s ease, border-color 0.2s ease',
                  cursor: 'grab',
                }}
              >
                {/* Drag handle + order number */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.25rem',
                  minWidth: '36px',
                }}>
                  <GripVertical size={18} color={theme.textMuted} style={{ cursor: 'grab' }} />
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: theme.accent,
                    color: theme.textOnAccent,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                  }}>
                    {question.order}
                  </div>
                </div>

                {/* Question content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: theme.accent, margin: '0 0 0.5rem 0' }}>
                        {question.questionKey} ({question.type})
                      </h4>
                      <p style={{ color: theme.textPrimary, margin: '0 0 0.5rem 0' }}>
                        {question.translations.fr.question}
                      </p>
                      {question.translations.fr.description && (
                        <p style={{ color: theme.textSecondary, fontSize: '0.9rem', margin: 0 }}>
                          {question.translations.fr.description.split('\n')[0]}...
                        </p>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => setEditingQuestion(question)}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: theme.success,
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(question.id)}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: theme.danger,
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Language Preview */}
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                    <span style={{ color: theme.textSecondary }}>EN: {question.translations.en.question}</span>
                    <span style={{ color: theme.textSecondary }}>MFE: {question.translations.mfe.question}</span>
                    <span style={{ color: theme.textSecondary }}>RCF: {question.translations.rcf.question}</span>
                  </div>
                </div>
              </div>
            ))}

            {filteredQuestions.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: theme.textMuted
              }}>
                <p>No questions found for {activeCategory}</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: theme.accent,
                    color: theme.textOnAccent,
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Add First Question
                </button>
              </div>
            )}
          </div>
        </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingQuestion) && (
        <QuestionFormModal
          question={editingQuestion}
          activeCategory={activeCategory}
          filteredQuestionsCount={filteredQuestions.length}
          theme={theme}
          onSave={handleSaveQuestion}
          onCancel={() => { setEditingQuestion(null); setShowAddModal(false); }}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: theme.overlayBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: theme.cardBg,
            borderRadius: '12px',
            padding: '2rem',
            border: `2px solid ${theme.danger}`,
            maxWidth: '400px'
          }}>
            <h3 style={{ color: theme.danger, margin: '0 0 1rem 0' }}>Delete Question</h3>
            <p style={{ color: theme.textPrimary, margin: '0 0 2rem 0' }}>
              Are you sure you want to delete this question? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  border: `2px solid ${theme.textMuted}`,
                  backgroundColor: 'transparent',
                  color: theme.textMuted,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteQuestion(showDeleteConfirm)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: theme.danger,
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManager;
