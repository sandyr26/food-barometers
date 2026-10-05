import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { api } from '../api';
import BackButton from '../components/BackButton';
import mascotIdle from '../assets/Mascotte1.png';
import mascotQuestion from '../assets/Mascotte2.png';
import mascotSpeaking from '../assets/Mascotte3.png';
import mascotListening from '../assets/Mascotte4.png';
import mascotThinking from '../assets/Mascotte5.png';
import mascotteBoy from '../assets/mascotte-boy.png';

type Mascot = 'boy' | 'girl';
type FlowPhase = 'questions' | 'intake' | 'moreIntakes' | 'saving' | 'complete';
type ConversationState = 'speaking' | 'listening' | 'recording' | 'thinking' | 'ready' | 'saving' | 'complete';

interface VoiceSurveyPageProps {
  authToken: string | null;
  selectedMascot: Mascot;
  onBack: () => void;
}

interface SurveyQuestion {
  number: number;
  text: string;
}

interface PresetGroup {
  id: string;
  label: string;
  options: string[];
  allowFreeText?: boolean;
}

type AnswerMode = 'voice' | 'text' | 'preset' | 'mixed' | 'skipped';

interface RecordedAnswer {
  text: string;
  mode: AnswerMode;
  selections: Record<string, string[]>;
  parentOccupations?: Record<string, { occupation: string; notWorking: boolean }>;
}

interface PresetChoicesProps {
  name: string;
  options: string[];
  values: string[];
  multiple?: boolean;
  exclusiveOption?: string;
  onChange: (values: string[]) => void;
}

const questions: SurveyQuestion[] = [
  { number: 1, text: 'Es-tu une fille, un garçon, ou préfères-tu ne pas répondre ?' },
  { number: 2, text: 'Quelle est ton année de naissance ?' },
  { number: 3, text: 'Dans quelle classe es-tu ?' },
  { number: 4, text: 'Quel est ton quartier de résidence ?' },
  { number: 5, text: 'Combien de personnes vivent chez toi, en t’incluant ?' },
  { number: 6, text: 'Parmi les personnes qui vivent chez toi, qui sont-elles ? Tu peux citer ton papa ou ton premier représentant légal, ta maman ou ton deuxième représentant légal, un beau-parent, tes frères ou sœurs, tes grands-parents, tes oncles ou tantes, d’autres personnes, des personnes sans lien familial, ou dire que tu vis en foyer d’accueil ou que tu préfères ne pas répondre. Tu peux donner plusieurs réponses.' },
  { number: 7, text: 'Si tes parents ou représentants légaux travaillent, quels sont leurs métiers ? Pour chacun, tu peux aussi dire qu’il ou elle ne travaille pas. Pense à ton papa, ta maman, ton représentant légal 1 et ton représentant légal 2.' },
  { number: 8, text: 'Est-ce que tu as de l’argent de poche ? Tu peux répondre : oui, de manière régulière ; de temps en temps ; ou non.' },
  { number: 9, text: 'Y a-t-il des choses que tu ne manges pas ou ne bois pas, quelle que soit la raison ?' },
  { number: 10, text: 'Lesquelles et quelles sont les raisons ? Si tu ne manges pas certaines viandes, précise lesquelles. Précise aussi les légumes, les grains et les légumes-racines concernés, comme le manioc ou le songe.' },
  { number: 11, text: 'Pour chacun de ces aliments — jus de fruits en brique, sodas, pizzas, pain bouchons ou Lord, hamburgers, biscuits, pâtisseries et gâteaux — pourquoi le consommes-tu ? Tu peux dire que tu trouves cela bon et que c’est un plaisir, que c’est facile à acheter, qu’il y en a à la maison, ou que tu n’en consommes pas. Tu peux donner plusieurs raisons pour chaque aliment.' },
  { number: 12, text: 'Pour chacun de ces aliments — jus de fruits en brique, sodas, pizzas, pain bouchons ou Lord, hamburgers, biscuits, pâtisseries et gâteaux — à quelle fréquence les consommes-tu : tous les jours ou presque, régulièrement dans la semaine, une à deux fois par mois, ou jamais ?' },
  { number: 13, text: 'Pour chacun de ces aliments — jus de fruits en brique, sodas, pizzas, pain bouchons ou Lord, hamburgers, biscuits, pâtisseries et gâteaux — avec qui les consommes-tu : en famille, avec des amis, seul ou seule, ou tu n’en consommes pas ? Tu peux choisir plusieurs réponses.' },
  { number: 14, text: 'Parmi les changements suivants, lesquels te sembleraient faciles ou difficiles ? Pour chacun, réponds : très difficile, difficile, ni difficile ni facile, facile, ou très facile. Manger moins de produits sucrés, moins de produits gras, moins de viande, boire moins de boissons sucrées, manger moins salé, manger moins de riz, manger plus de légumes, plus de fruits, plus de légumes-racines comme le manioc ou la patate douce, plus de grains ou légumineuses comme les lentilles, pois du Cap ou haricots secs, et manger plus de poissons ou fruits de mer.' },
  { number: 15, text: 'Qu’est-ce que c’est pour toi, bien manger, en une phrase ?' },
  { number: 16, text: 'Est-ce que tu peux décrire la composition d’un bon repas pour toi ?' },
  { number: 17, text: 'Y a-t-il selon toi des aliments qui sont bons pour la santé ? Si oui, peux-tu en citer trois ?' },
  { number: 18, text: 'Y a-t-il selon toi des aliments dont il faut limiter la consommation pour être en bonne santé ? Si oui, peux-tu en citer trois ?' },
  { number: 19, text: 'Lorsque tu fais un choix important, notamment dans ce que tu manges, qui sont les personnes dont l’avis compte le plus pour toi ou t’influence ? Classe jusqu’à trois réponses, de la plus importante à la moins importante : tes camarades ou amis, ta famille ou tes parents, les réseaux sociaux, les coachs sportifs, les professionnels de santé, toi-même, ou une autre personne que tu peux préciser.' },
  { number: 20, text: 'Cite trois plats ou aliments que tu aimes et qui sont faits-maison par tes proches.' },
  { number: 21, text: 'Cite trois plats ou aliments que tu aimes et que tu achètes à l’extérieur.' },
  { number: 22, text: 'Cite trois boissons que tu aimes.' },
  { number: 23, text: 'Est-ce que tu manges à la cantine ?' },
  { number: 24, text: 'En général, comment trouves-tu les repas proposés à la cantine : très bons, plutôt bons, plutôt pas bons, ou pas bons du tout ?' },
  { number: 25, text: 'Est-ce que tu dirais que la cantine est un lieu où on partage un bon moment avec des amis ? Tu peux répondre : tout à fait d’accord, plutôt d’accord, plutôt pas d’accord, ou pas d’accord.' },
  { number: 26, text: 'En général, le bruit à la cantine te gêne-t-il : pas du tout, un peu, ou beaucoup ?' },
  { number: 27, text: 'Est-ce que tu as déjà été concerné ou concernée par des actions de sensibilisation sur l’alimentation, par exemple pour connaître les familles d’aliments ou pour manger équilibré ?' },
  { number: 28, text: 'Si oui, est-ce que cela t’a amené ou amenée à changer des choses dans ton alimentation ?' },
];

const intakePrompt = 'Nous allons maintenant remonter dans ta journée d’hier, depuis le moment où tu t’es levé ou levée jusqu’au moment où tu t’es couché ou couchée. Essaie de te rappeler de tout ce que tu as mangé et bu, même si cette journée était différente de tes habitudes. Une prise alimentaire correspond à chaque moment où tu as mangé ou bu quelque chose, y compris entre les repas. Décris une prise à la fois. Pour chacune, indique ce que tu as mangé de solide avec les accompagnements, ce que tu as bu, l’heure, le nom de cette prise, comment les aliments ont été cuisinés, où tu les as consommés, si tu étais seul ou accompagné, et si tu étais assis, debout ou en train de faire autre chose. Commence par la première chose consommée après ton réveil.';
const moreIntakesPrompt = 'As-tu eu une autre prise alimentaire hier ? Si oui, réponds oui et décris la prise suivante. Si tu as tout indiqué, réponds non.';

const householdChoices = ['Papa (ou représentant légal cité en premier)', 'Maman (ou représentant légal cité en deuxième)', 'Beau-père', 'Belle-mère', 'Frères/demi-frères', 'Sœurs/demi-sœurs', 'Grands-parents', 'Oncles/tantes', 'Autres', 'Personnes sans lien familial', 'Vit en foyer d’accueil', 'Ne préfère pas répondre'];
const parentRoles = ['Papa', 'Maman', 'Représentant légal 1', 'Représentant légal 2'];
const foodItems = ['Jus de fruits en brique', 'Sodas', 'Pizzas', 'Pain bouchons / Lord', 'Hamburger', 'Biscuits, pâtisseries, gâteaux'];
const motivationOptions = ['Je trouve ça bon et c’est un plaisir d’en manger/boire', 'C’est facile d’en acheter', 'Il y en a à la maison à disposition', 'Je n’en consomme pas'];
const frequencyOptions = ['Tous les jours ou presque', 'Régulièrement dans la semaine', 'Une à deux fois par mois', 'Jamais'];
const socialOptions = ['En famille', 'Avec des amis', 'Seul(e)', 'Je n’en consomme pas'];
const difficultyItems = ['Manger moins de produits sucrés', 'Manger moins de produits gras', 'Manger moins de viande', 'Boire moins de boissons sucrées', 'Manger moins salé', 'Manger moins de riz', 'Manger plus de légumes', 'Manger plus de fruits', 'Manger plus de légumes-racines (manioc, patate douce)', 'Manger plus de grains/légumineuses (lentilles, pois du Cap, haricots secs)', 'Manger plus de poissons ou fruits de mer'];
const difficultyOptions = ['Très difficile', 'Difficile', 'Ni difficile, ni facile', 'Facile', 'Très facile'];
const influenceOptions = ['Mes camarades, mes ami.e.s', 'Ma famille, mes parents', 'Les réseaux sociaux', 'Les coachs sportifs et équivalents', 'Les professionnels de santé (médecins…)', 'Moi-même', 'Autre'];

const getPresetGroups = (phase: FlowPhase, questionIndex: number): PresetGroup[] => {
  if (phase === 'moreIntakes') return [{ id: 'moreIntakes', label: 'Autres prises alimentaires', options: ['Oui', 'Non'] }];
  if (phase !== 'questions') return [];

  switch (questionIndex) {
    case 0:
      return [{ id: 'q1', label: questions[0].text, options: ['Fille', 'Garçon', 'Préfère ne pas répondre'] }];
    case 5:
      return [{ id: 'q6-personnes-du-foyer', label: questions[5].text, options: householdChoices, multiple: true } as PresetGroup];
    case 6:
      return parentRoles.map(role => ({ id: `q7-${role}`, label: `Situation professionnelle de ${role}`, options: ['Ne travaille pas'], allowFreeText: true }));
    case 7:
      return [{ id: 'q8-argent-de-poche', label: questions[7].text, options: ['Oui, de manière régulière', 'De temps en temps', 'Non'] }];
    case 8:
      return [{ id: 'q9-evictions', label: questions[8].text, options: ['Oui', 'Non'] }];
    case 10:
      return foodItems.map(food => ({ id: `q11-${food}`, label: food, options: motivationOptions, multiple: true } as PresetGroup));
    case 11:
      return foodItems.map(food => ({ id: `q12-${food}`, label: food, options: frequencyOptions }));
    case 12:
      return foodItems.map(food => ({ id: `q13-${food}`, label: food, options: socialOptions, multiple: true } as PresetGroup));
    case 13:
      return difficultyItems.map(item => ({ id: `q14-${item}`, label: item, options: difficultyOptions }));
    case 18:
      return [0, 1, 2].map(rank => ({ id: `q19-rang-${rank + 1}`, label: `Rang ${rank + 1}`, options: influenceOptions }));
    case 22:
      return [{ id: 'q23-cantine', label: questions[22].text, options: ['Oui', 'Non'] }];
    case 23:
      return [{ id: 'q24-qualite-cantine', label: questions[23].text, options: ['Très bons', 'Plutôt bons', 'Plutôt pas bons', 'Pas bons du tout'] }];
    case 24:
      return [{ id: 'q25-moment-amis', label: questions[24].text, options: ['Tout à fait d’accord', 'Plutôt d’accord', 'Plutôt pas d’accord', 'Pas d’accord'] }];
    case 25:
      return [{ id: 'q26-bruit-cantine', label: questions[25].text, options: ['Pas du tout', 'Un peu', 'Beaucoup'] }];
    case 26:
      return [{ id: 'q27-sensibilisation', label: questions[26].text, options: ['Oui', 'Non'] }];
    case 27:
      return [{ id: 'q28-changement', label: questions[27].text, options: ['Oui', 'Non'] }];
    default:
      return [];
  }
};

const mascotByState: Record<Mascot, Record<ConversationState, string>> = {
  girl: { speaking: mascotSpeaking, listening: mascotListening, recording: mascotListening, thinking: mascotThinking, ready: mascotQuestion, saving: mascotThinking, complete: mascotIdle },
  boy: { speaking: mascotteBoy, listening: mascotteBoy, recording: mascotteBoy, thinking: mascotteBoy, ready: mascotteBoy, saving: mascotteBoy, complete: mascotteBoy },
};

const yesAnswer = (answer: string) => /^(oui|ouais|oui\b)/i.test(answer.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));

const stopAudio = (audioRef: React.MutableRefObject<HTMLAudioElement | null>) => {
  if (!audioRef.current) return;
  audioRef.current.pause();
  audioRef.current.onended = null;
  audioRef.current.onerror = null;
  audioRef.current = null;
};

const playBlob = (blob: Blob, audioRef: React.MutableRefObject<HTMLAudioElement | null>, onEnded: () => void, onError: () => void) => {
  stopAudio(audioRef);
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audioRef.current = audio;
  const cleanup = () => {
    URL.revokeObjectURL(url);
    if (audioRef.current === audio) audioRef.current = null;
  };
  audio.onended = () => { cleanup(); onEnded(); };
  audio.onerror = () => { cleanup(); onError(); };
  void audio.play().catch(() => { cleanup(); onError(); });
};

const playBase64Audio = (audioData: string, audioRef: React.MutableRefObject<HTMLAudioElement | null>, onEnded: () => void, onError: () => void) => {
  const bytes = Uint8Array.from(atob(audioData), character => character.charCodeAt(0));
  playBlob(new Blob([bytes], { type: 'audio/mpeg' }), audioRef, onEnded, onError);
};

const PresetChoices: React.FC<PresetChoicesProps> = ({ name, options, values, multiple = false, exclusiveOption, onChange }) => (
  <fieldset style={styles.presetGroup}>
    {options.map(option => {
      const checked = values.includes(option);
      return (
        <label key={option} style={styles.presetOption}>
          <input
            type={multiple ? 'checkbox' : 'radio'}
            name={name}
            checked={checked}
            onChange={() => {
              if (!multiple) {
                onChange([option]);
                return;
              }
              if (option === exclusiveOption) {
                onChange(checked ? [] : [option]);
                return;
              }
              const withoutExclusive = exclusiveOption ? values.filter(value => value !== exclusiveOption) : values;
              onChange(checked ? withoutExclusive.filter(value => value !== option) : [...withoutExclusive, option]);
            }}
          />
          <span>{option}</span>
        </label>
      );
    })}
  </fieldset>
);

const VoiceSurveyPage: React.FC<VoiceSurveyPageProps> = ({ authToken, selectedMascot, onBack }) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<FlowPhase>('questions');
  const [conversationState, setConversationState] = useState<ConversationState>('speaking');
  const [transcript, setTranscript] = useState('');
  const [typedAnswer, setTypedAnswer] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [requiresRepeat, setRequiresRepeat] = useState(false);
  const [parentOccupations, setParentOccupations] = useState<Record<string, { occupation: string; notWorking: boolean }>>(
    () => Object.fromEntries(parentRoles.map(role => [role, { occupation: '', notWorking: false }]))
  );
  const [aiReply, setAiReply] = useState('');
  const [error, setError] = useState('');
  const [responses, setResponses] = useState<RecordedAnswer[]>(() => Array.from({ length: questions.length }, () => ({ text: '', mode: 'skipped', selections: {} })));
  const [intakes, setIntakes] = useState<RecordedAnswer[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechCleanupRef = useRef<() => void>(() => {});

  const currentQuestion = phase === 'intake'
    ? intakePrompt
    : phase === 'moreIntakes'
      ? moreIntakesPrompt
      : questions[questionIndex].text;
  const voiceMascot = selectedMascot;

  useEffect(() => {
    setConversationState('speaking');
    setError('');
    const controller = new AbortController();
    let cancelled = false;

    const requestQuestionAudio = async () => {
      if (!authToken) {
        setError('Connecte-toi pour utiliser le questionnaire vocal.');
        setConversationState('listening');
        return;
      }

      try {
        const response = await api.post('/api/ai/speech', {
          text: currentQuestion,
          language: 'fr',
          mascot: voiceMascot,
        }, {
          headers: { Authorization: `Bearer ${authToken}` },
          responseType: 'blob',
          signal: controller.signal,
        });
        if (cancelled) return;
        playBlob(response.data, audioRef, () => setConversationState('listening'), () => {
          setError('La synthèse vocale a échoué. Tu peux lire la question et répondre.');
          setConversationState('listening');
        });
      } catch {
        if (!cancelled) {
          setError('La synthèse vocale a échoué. Tu peux lire la question et répondre.');
          setConversationState('listening');
        }
      }
    };

    speechCleanupRef.current();
    void requestQuestionAudio();
    speechCleanupRef.current = () => {
      cancelled = true;
      controller.abort();
      stopAudio(audioRef);
    };

    return () => speechCleanupRef.current();
  }, [authToken, currentQuestion, voiceMascot]);

  useEffect(() => () => {
    stopAudio(audioRef);
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
  }, []);

  const answeredQuestionCount = phase === 'intake' || phase === 'moreIntakes' ? questionIndex + 1 : questionIndex;
  const allPreviousAnswers = [...responses.slice(0, answeredQuestionCount).map(answer => answer.text), ...intakes.map(intake => intake.text)];

  const setSelection = (key: string, values: string[]) => {
    setSelectedOptions(current => ({ ...current, [key]: values }));
    setRequiresRepeat(false);
  };

  const updateParentOccupation = (role: string, update: Partial<{ occupation: string; notWorking: boolean }>) => {
    setParentOccupations(current => ({ ...current, [role]: { ...current[role], ...update } }));
  };

  const clearCurrentAnswer = () => {
    setTranscript('');
    setTypedAnswer('');
    setRequiresRepeat(false);
    setAiReply('');
    setSelectedOptions({});
    setParentOccupations(Object.fromEntries(parentRoles.map(role => [role, { occupation: '', notWorking: false }])));
    setError('');
  };

  const makeCurrentAnswer = (): RecordedAnswer => {
    const selections = Object.fromEntries(Object.entries(selectedOptions).filter(([, values]) => values.length > 0));
    const answeredParentOccupations = Object.fromEntries(Object.entries(parentOccupations).filter(([, value]) => value.occupation.trim() || value.notWorking));
    const parts = [
      ...Object.entries(selections).map(([key, values]) => `${key}: ${values.join(', ')}`),
      ...Object.entries(answeredParentOccupations).map(([role, value]) => `${role}: ${value.notWorking ? 'ne travaille pas' : value.occupation}`),
      typedAnswer.trim() ? `Réponse écrite: ${typedAnswer.trim()}` : '',
      transcript.trim() ? `Réponse vocale: ${transcript.trim()}` : '',
    ].filter(Boolean);
    const inputMethods = [
      Object.keys(selections).length || Object.keys(answeredParentOccupations).length ? 'preset' : '',
      typedAnswer.trim() ? 'text' : '',
      transcript.trim() ? 'voice' : '',
    ].filter(Boolean);
    const mode: AnswerMode = inputMethods.length === 0 ? 'skipped' : inputMethods.length > 1 ? 'mixed' : inputMethods[0] as AnswerMode;
    return { text: parts.join('\n'), mode, selections, parentOccupations: answeredParentOccupations };
  };

  const renderPresetAnswers = () => {
    const choices = (key: string, options: string[], multiple = false, exclusiveOption?: string) => (
      <PresetChoices
        key={key}
        name={key}
        options={options}
        values={selectedOptions[key] || []}
        multiple={multiple}
        exclusiveOption={exclusiveOption}
        onChange={values => setSelection(key, values)}
      />
    );

    if (phase === 'moreIntakes') return <>{choices('moreIntakes', ['Oui', 'Non'])}</>;
    if (phase !== 'questions') return null;
    switch (questionIndex) {
      case 0:
        return <>{choices('q1', ['Fille', 'Garçon', 'Préfère ne pas répondre'])}</>;
      case 5:
        return <div style={styles.presetCard}>{choices('q6-personnes-du-foyer', householdChoices, true)}{selectedOptions['q6-personnes-du-foyer']?.includes('Autres') && <label style={styles.fieldLabel}>Précise qui<input style={styles.textInput} value={typedAnswer} onChange={event => setTypedAnswer(event.target.value)} /></label>}</div>;
      case 6:
        return <div style={styles.presetCard}><p style={styles.presetHeading}>Pour chaque personne, indique son métier ou coche « Ne travaille pas ».</p>{parentRoles.map(role => <div key={role} style={styles.parentOccupation}><strong>{role}</strong><input style={styles.textInput} aria-label={`Métier de ${role}`} disabled={parentOccupations[role].notWorking} value={parentOccupations[role].occupation} onChange={event => updateParentOccupation(role, { occupation: event.target.value })} /><label style={styles.presetOption}><input type="checkbox" checked={parentOccupations[role].notWorking} onChange={event => updateParentOccupation(role, { notWorking: event.target.checked, occupation: event.target.checked ? '' : parentOccupations[role].occupation })} /><span>Ne travaille pas</span></label></div>)}</div>;
      case 7:
        return <>{choices('q8-argent-de-poche', ['Oui, de manière régulière', 'De temps en temps', 'Non'])}</>;
      case 8:
        return <>{choices('q9-evictions', ['Oui', 'Non'])}</>;
      case 10:
        return <div style={styles.presetCard}><p style={styles.presetHeading}>Sélectionne une ou plusieurs raisons pour chaque aliment.</p>{foodItems.map(food => <div key={food} style={styles.presetRow}><strong>{food}</strong>{choices(`q11-${food}`, motivationOptions, true, 'Je n’en consomme pas')}</div>)}</div>;
      case 11:
        return <div style={styles.presetCard}><p style={styles.presetHeading}>Choisis une fréquence pour chaque aliment.</p>{foodItems.map(food => <div key={food} style={styles.presetRow}><strong>{food}</strong>{choices(`q12-${food}`, frequencyOptions)}</div>)}</div>;
      case 12:
        return <div style={styles.presetCard}><p style={styles.presetHeading}>Choisis avec qui tu consommes chaque aliment.</p>{foodItems.map(food => <div key={food} style={styles.presetRow}><strong>{food}</strong>{choices(`q13-${food}`, socialOptions, true, 'Je n’en consomme pas')}</div>)}</div>;
      case 13:
        return <div style={styles.presetCard}><p style={styles.presetHeading}>Choisis une réponse pour chaque changement.</p>{difficultyItems.map(item => <div key={item} style={styles.presetRow}><strong>{item}</strong>{choices(`q14-${item}`, difficultyOptions)}</div>)}</div>;
      case 18:
        return <div style={styles.presetCard}><p style={styles.presetHeading}>Classe jusqu’à trois réponses, de la plus importante à la moins importante.</p>{[0, 1, 2].map(rank => {
          const key = `q19-rang-${rank + 1}`;
          const otherRanks = [0, 1, 2].filter(index => index !== rank).flatMap(index => selectedOptions[`q19-rang-${index + 1}`] || []);
          return <React.Fragment key={key}><label style={styles.fieldLabel}>Rang {rank + 1}<select style={styles.textInput} value={selectedOptions[key]?.[0] || ''} onChange={event => setSelection(key, event.target.value ? [event.target.value] : [])}><option value="">Choisir</option>{influenceOptions.filter(option => !otherRanks.includes(option)).map(option => <option key={option} value={option}>{option}</option>)}</select></label>{selectedOptions[key]?.[0] === 'Autre' && <label style={styles.fieldLabel}>Précise l’autre influence<input style={styles.textInput} value={typedAnswer} onChange={event => setTypedAnswer(event.target.value)} /></label>}</React.Fragment>;
        })}</div>;
      case 22:
        return <>{choices('q23-cantine', ['Oui', 'Non'])}</>;
      case 23:
        return <>{choices('q24-qualite-cantine', ['Très bons', 'Plutôt bons', 'Plutôt pas bons', 'Pas bons du tout'])}</>;
      case 24:
        return <>{choices('q25-moment-amis', ['Tout à fait d’accord', 'Plutôt d’accord', 'Plutôt pas d’accord', 'Pas d’accord'])}</>;
      case 25:
        return <>{choices('q26-bruit-cantine', ['Pas du tout', 'Un peu', 'Beaucoup'])}</>;
      case 26:
        return <>{choices('q27-sensibilisation', ['Oui', 'Non'])}</>;
      case 27:
        return <>{choices('q28-changement', ['Oui', 'Non'])}</>;
      default:
        return null;
    }
  };

  const hasCurrentAnswer = Boolean(
    transcript.trim()
    || typedAnswer.trim()
    || Object.values(selectedOptions).some(values => values.length > 0)
    || Object.values(parentOccupations).some(value => value.occupation.trim() || value.notWorking)
  );
  const presetAnswers = renderPresetAnswers();
  const showTypedAnswer = phase === 'intake' || presetAnswers === null;

  const transcribeAnswer = async (audio: Blob) => {
    if (!authToken) {
      setError('Ta session a expiré. Reconnecte-toi pour répondre.');
      setConversationState('listening');
      return;
    }

    const formData = new FormData();
    const extension = audio.type.includes('ogg') ? 'ogg' : audio.type.includes('mp4') ? 'mp4' : audio.type.includes('wav') ? 'wav' : 'webm';
    formData.append('audio', audio, `survey-answer.${extension}`);
    formData.append('question', currentQuestion);
    formData.append('language', 'fr');
    formData.append('mascot', voiceMascot);
    formData.append('previousAnswers', JSON.stringify(allPreviousAnswers));
    const presetGroups = getPresetGroups(phase, questionIndex);
    if (presetGroups.length > 0) formData.append('presetGroups', JSON.stringify(presetGroups));

    try {
      const response = await api.post('/api/ai/turn', formData, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const nextTranscript = response.data.transcript?.trim();
      const nextReply = response.data.reply?.trim();
      if (!nextTranscript || !nextReply || !response.data.audio) throw new Error('Incomplete AI response');
      const matchedGroups = response.data.selectedGroups as Record<string, string[]> | undefined;
      const needsRepeat = response.data.needsRepeat === true;
      setTranscript(nextTranscript);
      if (!needsRepeat && matchedGroups) {
        setSelectedOptions(current => ({ ...current, ...matchedGroups }));
        setParentOccupations(current => {
          const updated = { ...current };
          for (const role of parentRoles) {
            if (matchedGroups[`q7-${role}`]?.includes('Ne travaille pas')) {
              updated[role] = { occupation: '', notWorking: true };
            }
          }
          return updated;
        });
      }
      setRequiresRepeat(needsRepeat);
      setAiReply(nextReply);
      setConversationState('speaking');
      playBase64Audio(response.data.audio, audioRef, () => setConversationState(needsRepeat ? 'listening' : 'ready'), () => {
        setError('La réponse vocale a échoué. Tu peux continuer en lisant la réponse.');
        setConversationState(needsRepeat ? 'listening' : 'ready');
      });
    } catch (requestError) {
      setError(axios.isAxiosError(requestError) ? requestError.response?.data?.error || 'Impossible de traiter cet enregistrement. Réessaie.' : 'Impossible de traiter cet enregistrement. Réessaie.');
      setConversationState('listening');
    }
  };

  const handleMicClick = async () => {
    if (conversationState === 'recording') {
      mediaRecorderRef.current?.stop();
      setConversationState('thinking');
      return;
    }
    if (conversationState !== 'listening' && conversationState !== 'ready') return;

    setError('');
    setRequiresRepeat(false);
    setAiReply('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'].find(type => MediaRecorder.isTypeSupported(type));
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = event => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
        void transcribeAnswer(new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' }));
      };
      recorder.start();
      setTranscript('');
      setConversationState('recording');
    } catch {
      setError('L’accès au microphone a échoué. Vérifie les autorisations du navigateur.');
      setConversationState('listening');
    }
  };

  const saveSurvey = async (numberedAnswers: RecordedAnswer[], intakeAnswers: RecordedAnswer[]) => {
    if (!authToken) {
      setError('Ta session a expiré. Reconnecte-toi pour envoyer le questionnaire.');
      setConversationState('ready');
      return;
    }

    setConversationState('saving');
    setError('');
    try {
      await api.post('/api/surveys', {
        consentGiven: true,
        selectedMascot: voiceMascot,
        answers: {
          questions: questions.map((question, index) => ({ ...question, ...(numberedAnswers[index] || { text: '', mode: 'skipped', selections: {} }) })),
          yesterdayIntakes: intakeAnswers.map((answer, index) => ({ intake: index + 1, ...answer })),
        },
      }, { headers: { Authorization: `Bearer ${authToken}` } });
      setPhase('complete');
      setConversationState('complete');
    } catch (requestError) {
      setError(axios.isAxiosError(requestError) ? requestError.response?.data?.error || 'Impossible d’envoyer le questionnaire. Réessaie.' : 'Impossible d’envoyer le questionnaire. Réessaie.');
      setConversationState('ready');
    }
  };

  const advanceWithAnswer = (answer: RecordedAnswer) => {
    if (phase === 'intake') {
      setIntakes(current => answer.text.trim() ? [...current, answer] : current);
      clearCurrentAnswer();
      setPhase('moreIntakes');
      return;
    }

    if (phase === 'moreIntakes') {
      const moreIntakesAnswer = selectedOptions.moreIntakes?.[0] || transcript.trim() || typedAnswer.trim() || answer.text;
      if (yesAnswer(moreIntakesAnswer)) {
        clearCurrentAnswer();
        setPhase('intake');
      } else {
        clearCurrentAnswer();
        setPhase('questions');
        setQuestionIndex(8);
      }
      return;
    }

    const updatedAnswers = [...responses];
    updatedAnswers[questionIndex] = answer;

    if (questionIndex === 7) {
      setResponses(updatedAnswers);
      clearCurrentAnswer();
      setPhase('intake');
      return;
    }

    const q9Answer = selectedOptions['q9-evictions']?.[0] || typedAnswer.trim() || transcript.trim();
    const q23Answer = selectedOptions['q23-cantine']?.[0] || typedAnswer.trim() || transcript.trim();
    const q27Answer = selectedOptions['q27-sensibilisation']?.[0] || typedAnswer.trim() || transcript.trim();
    if (questionIndex === 8 && q9Answer.trim() && !yesAnswer(q9Answer)) updatedAnswers[9] = { text: '', mode: 'skipped', selections: {} };
    if (questionIndex === 22 && q23Answer.trim() && !yesAnswer(q23Answer)) updatedAnswers.splice(23, 3, { text: '', mode: 'skipped', selections: {} }, { text: '', mode: 'skipped', selections: {} }, { text: '', mode: 'skipped', selections: {} });
    if (questionIndex === 26 && q27Answer.trim() && !yesAnswer(q27Answer)) updatedAnswers[27] = { text: '', mode: 'skipped', selections: {} };

    if (questionIndex === questions.length - 1 || (questionIndex === 26 && q27Answer.trim() && !yesAnswer(q27Answer))) {
      void saveSurvey(updatedAnswers, intakes);
      return;
    }

    const nextQuestionIndex = questionIndex === 8 && q9Answer.trim() && !yesAnswer(q9Answer)
      ? 10
      : questionIndex === 22 && q23Answer.trim() && !yesAnswer(q23Answer)
        ? 26
        : questionIndex + 1;
    setResponses(updatedAnswers);
    clearCurrentAnswer();
    setQuestionIndex(nextQuestionIndex);
  };

  const handleNext = () => {
    advanceWithAnswer(makeCurrentAnswer());
  };

  const handleSkip = () => advanceWithAnswer({ text: '', mode: 'skipped', selections: {} });

  const handleRepeatQuestion = async () => {
    if (!authToken) return;
    setError('');
    setConversationState('speaking');
    try {
      const response = await api.post('/api/ai/speech', {
        text: currentQuestion,
        language: 'fr',
        mascot: voiceMascot,
      }, { headers: { Authorization: `Bearer ${authToken}` }, responseType: 'blob' });
      playBlob(response.data, audioRef, () => setConversationState('listening'), () => setConversationState('listening'));
    } catch {
      setError('Impossible de relire la question. Tu peux quand même répondre.');
      setConversationState('listening');
    }
  };

  const questionLabel = phase === 'questions'
    ? `Question ${questions[questionIndex].number} sur 28`
    : phase === 'intake'
      ? `Rappel d’hier · prise ${intakes.length + 1}`
      : phase === 'moreIntakes'
        ? 'Rappel des prises alimentaires'
        : phase === 'saving'
          ? 'Enregistrement du questionnaire…'
          : 'Questionnaire terminé';

  const stateLabel: Record<ConversationState, string> = {
    speaking: 'La mascotte pose la question…',
    listening: 'Je t’écoute…',
    recording: 'Enregistrement en cours… Appuie pour terminer.',
    thinking: 'Je transcris ta réponse…',
    ready: 'Réponse enregistrée',
    saving: 'Enregistrement du questionnaire…',
    complete: 'Merci pour ta participation.',
  };

  if (phase === 'complete') {
    return (
      <div style={styles.page}>
        <header style={styles.header}><BackButton onClick={onBack} /><h1 style={styles.title}>Questionnaire terminé</h1><div style={styles.headerSpacer} /></header>
        <main style={styles.completePanel}><img src={mascotByState[voiceMascot].complete} alt="Mascotte" style={styles.completeMascot} /><h2 style={styles.completeTitle}>Merci d’avoir répondu aux questions.</h2><button type="button" onClick={onBack} style={styles.primaryButton}>Retour à l’accueil</button></main>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}><BackButton onClick={onBack} /><h1 style={styles.title}>Questionnaire OR-ALIM</h1><div style={styles.headerSpacer} /></header>
      <main style={styles.content}>
        <div style={styles.progressRow}><span>{questionLabel}</span><span style={styles.liveBadge}>Questionnaire vocal</span></div>
        <section style={styles.mascotPanel} aria-live="polite">
          <div style={{ ...styles.mascotGlow, ...(conversationState === 'listening' ? styles.listeningGlow : {}) }}>
            <img src={mascotByState[voiceMascot][conversationState]} alt="Mascotte FOOD BAROMETER" style={{ ...styles.mascot, ...(conversationState === 'thinking' ? styles.thinkingMascot : {}) }} />
          </div>
          <div style={styles.stateLabel}>{stateLabel[conversationState]}</div>
        </section>
        <section style={styles.questionCard}>
          <span style={styles.questionKicker}>{phase === 'questions' ? `Question ${questions[questionIndex].number}` : 'Rappel de la journée d’hier'}</span>
          <h2 style={styles.question}>{currentQuestion}</h2>
          <button type="button" onClick={() => void handleRepeatQuestion()} style={styles.repeatButton}>🔊 Réécouter la question</button>
        </section>
        {presetAnswers}
        {showTypedAnswer && <label style={styles.typedAnswer}>
          <span>Ou écris ta réponse</span>
          <textarea value={typedAnswer} onChange={event => { setTypedAnswer(event.target.value); setRequiresRepeat(false); }} placeholder="Écris ta réponse ici…" rows={3} style={styles.answerInput} />
        </label>}
        <section style={styles.transcriptCard}>
          <div style={styles.transcriptHeader}><span>Ta réponse</span>{conversationState === 'thinking' && <span style={styles.processing}>Transcription…</span>}</div>
          <p style={transcript ? styles.transcript : styles.transcriptPlaceholder}>{transcript || 'Appuie sur le micro et réponds naturellement.'}</p>
          {aiReply && <p style={styles.aiReply}>{aiReply}</p>}
        </section>
        <p style={styles.privacyNotice}>Ton enregistrement est envoyé à OpenAI pour transcription et traitement. Tu peux passer une question.</p>
        {error && <p role="alert" style={styles.errorMessage}>{error}</p>}
        <button type="button" onClick={() => void handleMicClick()} disabled={conversationState === 'speaking' || conversationState === 'thinking' || conversationState === 'saving'} style={{ ...styles.micButton, ...(conversationState === 'recording' ? styles.micButtonActive : {}) }} aria-label="Répondre avec le microphone">
          <span style={styles.micIcon}>{conversationState === 'recording' ? '■' : '🎙'}</span><span>{conversationState === 'recording' ? 'Terminer l’enregistrement' : 'Répondre'}</span>
        </button>
        <div style={styles.actions}>
          <button type="button" onClick={handleSkip} disabled={conversationState === 'saving' || conversationState === 'speaking' || conversationState === 'thinking' || conversationState === 'recording'} style={styles.skipButton}>Passer cette question</button>
          <button type="button" onClick={handleNext} disabled={!hasCurrentAnswer || requiresRepeat || !['ready', 'listening'].includes(conversationState)} style={{ ...styles.nextButton, ...(!hasCurrentAnswer || requiresRepeat || !['ready', 'listening'].includes(conversationState) ? styles.disabledButton : {}) }}>
            {phase === 'intake' ? 'Valider cette prise' : phase === 'moreIntakes' ? 'Continuer' : questionIndex === questions.length - 1 ? 'Terminer' : 'Question suivante'} →
          </button>
        </div>
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { width: '100%', height: '100dvh', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff9e8', color: '#333', overflow: 'hidden' },
  header: { width: '100%', flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', background: '#ffc000', boxShadow: '0 2px 10px rgba(217,119,6,0.2)', boxSizing: 'border-box' },
  title: { margin: 0, fontSize: '1.2rem', fontWeight: 700 },
  headerSpacer: { width: 40 },
  content: { width: '100%', maxWidth: 680, flex: '1 1 auto', minHeight: 0, margin: '0 auto', padding: '1rem 1rem 2rem', boxSizing: 'border-box', overflowY: 'auto' },
  progressRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', color: '#765800', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' },
  liveBadge: { padding: '0.35rem 0.65rem', borderRadius: 999, background: '#fff0bd', color: '#765800', fontSize: '0.72rem', textTransform: 'uppercase' },
  mascotPanel: { textAlign: 'center', padding: '0.25rem 0 0.65rem' },
  mascotGlow: { width: 160, height: 160, margin: '0 auto 0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, #fff 45%, #ffe38a 70%, transparent 71%)', transition: 'transform 0.3s ease, box-shadow 0.3s ease' },
  listeningGlow: { transform: 'scale(1.04)', boxShadow: '0 0 0 12px rgba(255,192,0,0.14)' },
  mascot: { width: 138, height: 138, objectFit: 'contain', animation: 'aiMascotFloat 3s ease-in-out infinite' },
  thinkingMascot: { animation: 'aiMascotThink 0.8s ease-in-out infinite alternate' },
  stateLabel: { color: '#765800', fontSize: '0.95rem', fontWeight: 600 },
  questionCard: { padding: '1rem 1.1rem', background: '#fff', border: '1px solid #f1d681', borderRadius: 10, boxShadow: '0 6px 20px rgba(120,88,0,0.08)' },
  questionKicker: { display: 'block', marginBottom: '0.35rem', color: '#a87900', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' },
  question: { margin: 0, fontSize: '1.1rem', lineHeight: 1.45, overflowWrap: 'break-word' },
  presetCard: { display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.75rem', padding: '0.9rem', border: '1px solid #ead9a2', borderRadius: 8, background: '#fffdf6' },
  presetHeading: { margin: 0, color: '#765800', fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.45 },
  presetGroup: { display: 'flex', flexDirection: 'column', gap: '0.45rem', margin: 0, padding: '0.65rem', border: '1px solid #eee4c5', borderRadius: 6, background: '#fff' },
  presetOption: { display: 'flex', alignItems: 'flex-start', gap: '0.55rem', fontSize: '0.9rem', lineHeight: 1.4, cursor: 'pointer' },
  presetRow: { display: 'grid', gap: '0.35rem', padding: '0.65rem 0', borderTop: '1px solid #eee4c5' },
  parentOccupation: { display: 'grid', gridTemplateColumns: 'minmax(115px, 0.6fr) minmax(130px, 1fr)', alignItems: 'center', gap: '0.5rem' },
  fieldLabel: { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.9rem', fontWeight: 700 },
  textInput: { width: '100%', minHeight: 40, padding: '0.5rem 0.6rem', boxSizing: 'border-box', border: '1px solid #c8b879', borderRadius: 6, background: '#fff', color: '#332d1c', font: 'inherit' },
  typedAnswer: { display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.75rem', color: '#765800', fontSize: '0.85rem', fontWeight: 700 },
  answerInput: { width: '100%', minHeight: 68, padding: '0.6rem 0.7rem', boxSizing: 'border-box', border: '1px solid #c8b879', borderRadius: 7, resize: 'vertical', font: 'inherit', fontWeight: 400 },
  repeatButton: { marginTop: '0.7rem', border: 0, background: 'transparent', color: '#8c6500', fontWeight: 700, cursor: 'pointer', padding: 0 },
  transcriptCard: { marginTop: '0.8rem', padding: '0.85rem 1rem', minHeight: 86, background: '#332d1c', color: '#fff', borderRadius: 10 },
  transcriptHeader: { display: 'flex', justifyContent: 'space-between', color: '#ffd45b', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase' },
  processing: { color: '#fff', fontWeight: 500, textTransform: 'none' },
  transcript: { margin: '0.65rem 0 0', fontSize: '1rem', lineHeight: 1.5 },
  transcriptPlaceholder: { margin: '0.65rem 0 0', color: '#cfc8b4', lineHeight: 1.5 },
  aiReply: { margin: '0.7rem 0 0', paddingTop: '0.65rem', borderTop: '1px solid #5a5038', color: '#ffe7a0', lineHeight: 1.5 },
  privacyNotice: { margin: '0.65rem 0', color: '#765800', fontSize: '0.76rem', lineHeight: 1.4, textAlign: 'center' },
  errorMessage: { margin: '0.5rem 0', color: '#a52a20', fontSize: '0.9rem', lineHeight: 1.4, textAlign: 'center' },
  micButton: { width: '100%', marginTop: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.7rem', minHeight: 56, border: 0, borderRadius: 10, background: '#332d1c', color: '#fff', fontSize: '1rem', fontWeight: 800, cursor: 'pointer' },
  micButtonActive: { background: '#c83f32', boxShadow: '0 0 0 8px rgba(200,63,50,0.14)' },
  micIcon: { fontSize: '1.25rem' },
  actions: { display: 'flex', justifyContent: 'space-between', gap: '0.6rem', marginTop: '0.6rem' },
  skipButton: { minHeight: 44, padding: '0.55rem 0.7rem', border: '1px solid #8b6e15', borderRadius: 8, background: '#fff4cc', color: '#332d1c', fontWeight: 700, cursor: 'pointer' },
  nextButton: { flex: 1, minHeight: 44, border: 0, borderRadius: 8, background: '#ffc000', color: '#332d1c', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer' },
  disabledButton: { opacity: 0.45, cursor: 'not-allowed' },
  completePanel: { width: '100%', maxWidth: 560, margin: '0 auto', padding: '2rem 1rem', boxSizing: 'border-box', textAlign: 'center' },
  completeMascot: { width: 160, height: 160, objectFit: 'contain' },
  completeTitle: { fontSize: '1.35rem', lineHeight: 1.4 },
  primaryButton: { marginTop: '1rem', padding: '0.8rem 1.2rem', border: 0, borderRadius: 8, background: '#332d1c', color: '#fff', fontWeight: 800, cursor: 'pointer' },
};

export default VoiceSurveyPage;