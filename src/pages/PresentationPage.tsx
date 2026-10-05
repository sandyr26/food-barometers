import React, { useEffect, useRef, useState } from 'react';
import { api } from '../api';
import BackButton from '../components/BackButton';

interface PresentationPageProps {
  onBack: () => void;
  onContinue: (accepted: boolean) => void;
  authToken: string | null;
  selectedMascot: 'boy' | 'girl';
}

const paragraphs = [
  'Nous menons une enquête sur l’alimentation de personnes âgées de 12 à 15 ans à La Réunion. Cette recherche est réalisée dans le cadre du projet OR-ALIM – Observation et Recherche sur l’Alimentation, porté par l’Institut de Recherche pour le Développement et l’Université de La Réunion.',
  'Dans le questionnaire il ne sera demandé ni ton nom ni ton prénom. Tes réponses sont confidentielles et seront utilisées uniquement dans le cadre de la recherche OR-ALIM, dans le respect des règles de protection des données personnelles.',
  'Tu répondras toi-même au questionnaire. Il n’y a pas de bonne ou de mauvaise réponse : ce qui nous intéresse, c’est ce que toi, tu fais et ce que tu penses réellement. Tes réponses ne seront pas montrées à tes camarades, à tes enseignants ou à tes parents. Tu peux choisir de ne pas répondre à une question ou arrêter le questionnaire à tout moment, sans avoir à te justifier.',
  'Lis chaque question attentivement et réponds en choisissant la réponse qui te correspond le mieux. Pour certaines questions, tu pourras sélectionner plusieurs réponses ou écrire directement ta réponse. Ne t’inquiète pas pour les fautes d’orthographe : elles n’ont aucune importance pour tes réponses.',
  'Si tu ne comprends pas une question ou une consigne, n’hésite pas à nous demander une explication.',
];

const consentQuestion = 'Avant de commencer, après avoir pris connaissance de ces informations, acceptes-tu de participer à l’enquête OR-ALIM ?';
const yesOption = 'Oui, je souhaite participer.';
const noOption = 'Non, je ne souhaite pas participer.';

const playAudioBlob = (
  blob: Blob,
  audioRef: React.MutableRefObject<HTMLAudioElement | null>,
  audioUrlRef: React.MutableRefObject<string | null>,
  onEnded: () => void,
  onError: () => void
) => {
  audioRef.current?.pause();
  if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);

  const audioUrl = URL.createObjectURL(blob);
  audioUrlRef.current = audioUrl;
  const audio = new Audio(audioUrl);
  audioRef.current = audio;
  const cleanup = () => {
    URL.revokeObjectURL(audioUrl);
    if (audioUrlRef.current === audioUrl) audioUrlRef.current = null;
    if (audioRef.current === audio) audioRef.current = null;
  };

  audio.onended = () => {
    cleanup();
    onEnded();
  };
  audio.onerror = () => {
    cleanup();
    onError();
  };
  void audio.play().catch(() => {
    cleanup();
    onError();
  });
};

const PresentationPage: React.FC<PresentationPageProps> = ({ onBack, onContinue, authToken, selectedMascot }) => {
  const [participation, setParticipation] = useState<'yes' | 'no' | ''>('');
  const [isLoadingAudio, setIsLoadingAudio] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const audioBlobRef = useRef<Blob | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const speechText = [
    'Présentation.',
    'Bonjour,',
    ...paragraphs,
    'Le questionnaire dure environ 30 minutes.',
    consentQuestion,
    yesOption,
    noOption,
  ].join('\n\n');

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const loadAndPlay = async () => {
      if (!authToken) {
        setSpeechError('Connecte-toi pour écouter la présentation.');
        setIsLoadingAudio(false);
        return;
      }

      try {
        const response = await api.post('/api/ai/speech', {
          text: speechText,
          language: 'fr',
          mascot: selectedMascot,
        }, {
          headers: { Authorization: `Bearer ${authToken}` },
          responseType: 'blob',
          signal: controller.signal,
        });
        if (cancelled) return;

        audioBlobRef.current = response.data;
        setIsLoadingAudio(false);
        setIsPlayingAudio(true);
        playAudioBlob(
          response.data,
          audioRef,
          audioUrlRef,
          () => setIsPlayingAudio(false),
          () => {
            setIsPlayingAudio(false);
            setSpeechError('La lecture audio a échoué. Tu peux réessayer avec le bouton de lecture.');
          }
        );
      } catch {
        if (!cancelled) {
          setIsLoadingAudio(false);
          setSpeechError('La présentation audio est indisponible. Tu peux lire les informations à l’écran.');
        }
      }
    };

    void loadAndPlay();
    return () => {
      cancelled = true;
      controller.abort();
      audioRef.current?.pause();
      audioRef.current = null;
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    };
  }, [authToken, selectedMascot, speechText]);

  const replayPresentation = () => {
    if (!audioBlobRef.current) return;
    setSpeechError('');
    setIsPlayingAudio(true);
    playAudioBlob(
      audioBlobRef.current,
      audioRef,
      audioUrlRef,
      () => setIsPlayingAudio(false),
      () => {
        setIsPlayingAudio(false);
        setSpeechError('La lecture audio a échoué. Tu peux réessayer avec le bouton de lecture.');
      }
    );
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <BackButton onClick={onBack} />
        <h1 style={styles.title}>Présentation</h1>
        <span style={styles.headerSpacer} aria-hidden="true" />
      </header>

      <main style={styles.main}>
        <article style={styles.content}>
          <h2 style={styles.greeting}>Bonjour,</h2>
          <button type="button" onClick={replayPresentation} disabled={isLoadingAudio || isPlayingAudio || !audioBlobRef.current} style={styles.audioButton}>
            {isLoadingAudio ? 'Préparation de la lecture…' : isPlayingAudio ? 'Lecture en cours…' : 'Réécouter la présentation'}
          </button>
          {speechError && <p role="status" style={styles.speechError}>{speechError}</p>}
          {paragraphs.map(paragraph => <p key={paragraph} style={styles.paragraph}>{paragraph}</p>)}
          <p style={styles.duration}><strong>Le questionnaire dure environ 30 minutes.</strong></p>

          <fieldset style={styles.consent}>
            <legend style={styles.question}>
              {consentQuestion}
            </legend>
            <label style={styles.option}>
              <input
                type="radio"
                name="participation"
                value="yes"
                checked={participation === 'yes'}
                onChange={() => setParticipation('yes')}
              />
              <span>{yesOption}</span>
            </label>
            <label style={styles.option}>
              <input
                type="radio"
                name="participation"
                value="no"
                checked={participation === 'no'}
                onChange={() => setParticipation('no')}
              />
              <span>{noOption}</span>
            </label>
          </fieldset>

          <button
            type="button"
            disabled={!participation}
            onClick={() => onContinue(participation === 'yes')}
            style={{ ...styles.continueButton, ...(!participation ? styles.disabledButton : {}) }}
          >
            {participation === 'no' ? 'Terminer' : 'Continuer'}
          </button>
        </article>
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { width: '100%', height: '100dvh', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff9e8', color: '#332d1c' },
  header: { flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '1rem 1.5rem', background: '#ffc000', boxShadow: '0 2px 10px rgba(217,119,6,0.2)' },
  title: { margin: 0, fontSize: '1.25rem', fontWeight: 700 },
  headerSpacer: { width: 40 },
  main: { flex: '1 1 auto', minHeight: 0, overflowY: 'auto', padding: '1.5rem 1rem 3rem' },
  content: { width: '100%', maxWidth: 760, margin: '0 auto', padding: 'clamp(1.25rem, 4vw, 2.5rem)', boxSizing: 'border-box', background: '#fff', border: '1px solid #ead9a2', borderRadius: 12, boxShadow: '0 8px 28px rgba(91,67,0,0.08)' },
  greeting: { margin: '0 0 1rem', fontSize: '1.3rem' },
  audioButton: { minHeight: 42, margin: '0 0 1.25rem', padding: '0.5rem 0.85rem', border: '1px solid #8b6e15', borderRadius: 6, background: '#fff4cc', color: '#332d1c', fontWeight: 700, cursor: 'pointer' },
  speechError: { margin: '0 0 1rem', color: '#a52a20', fontSize: '0.9rem', lineHeight: 1.5 },
  paragraph: { margin: '0 0 1rem', fontSize: '1rem', lineHeight: 1.65 },
  duration: { margin: '0 0 1.5rem', lineHeight: 1.6 },
  consent: { display: 'flex', flexDirection: 'column', gap: '0.9rem', margin: 0, padding: '1.25rem', border: '1px solid #d9c47d', borderRadius: 8 },
  question: { padding: '0 0.35rem', fontSize: '1.05rem', lineHeight: 1.55, fontWeight: 700 },
  option: { display: 'flex', alignItems: 'flex-start', gap: '0.7rem', padding: '0.25rem 0', fontSize: '1rem', lineHeight: 1.5, cursor: 'pointer' },
  continueButton: { width: '100%', minHeight: 48, marginTop: '1.25rem', border: 0, borderRadius: 8, background: '#332d1c', color: '#fff', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' },
  disabledButton: { opacity: 0.45, cursor: 'not-allowed' },
};

export default PresentationPage;