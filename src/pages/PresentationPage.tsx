import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { api } from '../api';
import { loadNarration } from '../narration';
import { MascotPanel, NextButton, PresetChoices, QuestionCard, SurveyPageLayout } from '../components/SurveyLayout';
import { VoiceReplyControls, VoiceTranscriptCard } from '../components/VoiceReply';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';
import { surveyStyles } from '../surveyStyles';
import type { ConversationState } from '../voiceMascot';
import { CONSENT_PAUSE_MS, aiConsentQuestion, consentIntroSpeech, consentNoOption, consentParagraphs, consentQuestionSpeech, consentYesOption, declineMessage } from '../surveyConfig';

interface PresentationPageProps {
  onBack: () => void;
  onContinue: (accepted: boolean) => void;
  authToken: string | null;
  selectedMascot: 'boy' | 'girl';
  audioEnabled?: boolean;
}

const paragraphs = [
  'Nous menons une enquête sur l’alimentation de personnes âgées de 12 à 15 ans à La Réunion. Cette recherche est réalisée dans le cadre du projet OR-ALIM – Observation et Recherche sur l’Alimentation, porté par l’Institut de Recherche pour le Développement et l’Université de La Réunion.',
  'Dans le questionnaire il ne sera demandé ni ton nom ni ton prénom. Tes réponses sont confidentielles et seront utilisées uniquement dans le cadre de la recherche OR-ALIM, dans le respect des règles de protection des données personnelles.',
  'Tu répondras toi-même au questionnaire. Il n’y a pas de bonne ou de mauvaise réponse : ce qui nous intéresse, c’est ce que toi, tu fais et ce que tu penses réellement. Tes réponses ne seront pas montrées à tes camarades, à tes enseignants ou à tes parents. Tu peux choisir de ne pas répondre à une question ou arrêter le questionnaire à tout moment, sans avoir à te justifier.',
  'Lis chaque question attentivement et réponds en choisissant la réponse qui te correspond le mieux. Pour certaines questions, tu pourras sélectionner plusieurs réponses ou écrire directement ta réponse. Ne t’inquiète pas pour les fautes d’orthographe : elles n’ont aucune importance pour tes réponses.',
  'Si tu ne comprends pas une question ou une consigne, n’hésite pas à nous demander une explication.',
];

const consentQuestion = 'Avant de commencer, après avoir pris connaissance de ces informations, acceptes-tu de participer à l’enquête OR-ALIM ?';
const PARTICIPATION_GROUP_ID = 'participation';
const participationChoices = [{ id: PARTICIPATION_GROUP_ID, label: 'Participation à l’enquête OR-ALIM', options: [consentYesOption, consentNoOption] }];

const audioBlobFromBase64 = (data: string) => new Blob([Uint8Array.from(atob(data), character => character.codePointAt(0) ?? 0)], { type: 'audio/mpeg' });

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
    const active = audioRef.current === audio;
    cleanup();
    if (active) onEnded();
  };
  audio.onerror = () => {
    const active = audioRef.current === audio;
    cleanup();
    if (active) onError();
  };
  void audio.play().catch(() => {
    const active = audioRef.current === audio;
    cleanup();
    if (active) onError();
  });
};

const playSequence = (
  blobs: Blob[],
  audioRef: React.RefObject<HTMLAudioElement | null>,
  audioUrlRef: React.RefObject<string | null>,
  timerRef: React.RefObject<number | undefined>,
  onDone: () => void,
  onError: () => void,
  index = 0
) => {
  playAudioBlob(
    blobs[index],
    audioRef,
    audioUrlRef,
    () => {
      if (index + 1 >= blobs.length) {
        onDone();
        return;
      }
      timerRef.current = window.setTimeout(() => playSequence(blobs, audioRef, audioUrlRef, timerRef, onDone, onError, index + 1), CONSENT_PAUSE_MS);
    },
    onError
  );
};

const PresentationPage: React.FC<PresentationPageProps> = ({ onBack, onContinue, authToken, selectedMascot, audioEnabled = true }) => {
  const [participation, setParticipation] = useState<'yes' | 'no' | ''>('');
  const [declined, setDeclined] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPlayingReply, setIsPlayingReply] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const recorder = useVoiceRecorder();
  const [isSendingVoice, setIsSendingVoice] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [heard, setHeard] = useState('');
  const [aiReply, setAiReply] = useState('');
  const narrationStoppedRef = useRef(false);
  const audioBlobsRef = useRef<Blob[]>([]);
  const pauseTimerRef = useRef<number | undefined>(undefined);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const shownParagraphs = audioEnabled ? consentParagraphs(selectedMascot) : ['Bonjour,', ...paragraphs, <strong key="duration">Le questionnaire dure environ 30 minutes.</strong>];
  const shownQuestion = audioEnabled ? aiConsentQuestion : consentQuestion;
  const error = voiceError || speechError;
  let micLabel = 'Répondre';
  if (recorder.isRecording) micLabel = 'Terminer l’enregistrement';
  if (isSendingVoice) micLabel = 'Envoi de la voix…';
  let conversationState: ConversationState = 'listening';
  if (recorder.isRecording) conversationState = 'recording';
  else if (isSendingVoice) conversationState = 'thinking';
  else if (isLoadingAudio || isPlayingAudio || isPlayingReply) conversationState = 'speaking';
  else if (participation) conversationState = 'ready';
  let repeatLabel = '🔊 Réécouter la présentation';
  if (isLoadingAudio) repeatLabel = 'Préparation de la lecture…';
  else if (isPlayingAudio) repeatLabel = 'Lecture en cours…';

  useEffect(() => {
    if (!audioEnabled) {
      setIsLoadingAudio(false);
      return;
    }

    const controller = new AbortController();
    let cancelled = false;

    const loadAndPlay = async () => {
      try {
        const blobs = await Promise.all([
          loadNarration(consentIntroSpeech(selectedMascot), 'fr', selectedMascot, authToken, controller.signal),
          loadNarration(consentQuestionSpeech, 'fr', selectedMascot, authToken, controller.signal),
        ]);
        if (cancelled) return;

        audioBlobsRef.current = blobs;
        setIsLoadingAudio(false);
        if (narrationStoppedRef.current) return;
        setIsPlayingAudio(true);
        playSequence(
          blobs,
          audioRef,
          audioUrlRef,
          pauseTimerRef,
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
      window.clearTimeout(pauseTimerRef.current);
      audioRef.current?.pause();
      audioRef.current = null;
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    };
  }, [audioEnabled, authToken, selectedMascot]);

  const handleContinue = () => {
    if (participation === 'yes') {
      onContinue(true);
      return;
    }
    setDeclined(true);
    if (!audioEnabled) return;
    window.clearTimeout(pauseTimerRef.current);
    audioRef.current?.pause();
    void loadNarration(declineMessage, 'fr', selectedMascot, authToken)
      .then(blob => playAudioBlob(blob, audioRef, audioUrlRef, () => {}, () => {}))
      .catch(() => {});
  };

  const sendVoiceAnswer = async (audio: Blob) => {
    if (!authToken) {
      setVoiceError('Ta session a expiré. Reconnecte-toi pour répondre.');
      return;
    }

    const formData = new FormData();
    let extension = 'webm';
    if (audio.type.includes('ogg')) extension = 'ogg';
    else if (audio.type.includes('mp4')) extension = 'mp4';
    else if (audio.type.includes('wav')) extension = 'wav';
    formData.append('audio', audio, `consent-answer.${extension}`);
    formData.append('question', consentQuestionSpeech);
    formData.append('language', 'fr');
    formData.append('mascot', selectedMascot);
    formData.append('previousAnswers', '[]');
    formData.append('presetGroups', JSON.stringify(participationChoices));

    try {
      const response = await api.post('/api/ai/turn', formData, {
        headers: { Authorization: `Bearer ${authToken}` },
        timeout: 60000,
      });
      const transcript = (response.data.answer ?? response.data.transcript)?.trim();
      const reply = response.data.reply?.trim();
      if (!transcript || !reply || !response.data.audio) throw new Error('Incomplete AI response');

      const choice = (response.data.selectedGroups as Record<string, string[]> | undefined)?.[PARTICIPATION_GROUP_ID]?.[0];
      if (response.data.needsRepeat !== true) {
        if (choice === consentYesOption) setParticipation('yes');
        else if (choice === consentNoOption) setParticipation('no');
      }
      setHeard(transcript);
      setAiReply(reply);
      setIsPlayingReply(true);
      playAudioBlob(audioBlobFromBase64(response.data.audio), audioRef, audioUrlRef, () => setIsPlayingReply(false), () => {
        setIsPlayingReply(false);
        setVoiceError('La réponse vocale a échoué. Tu peux continuer en lisant la réponse.');
      });
    } catch (requestError) {
      let message = 'Impossible de traiter cet enregistrement. Réessaie.';
      if (axios.isAxiosError(requestError)) {
        message = requestError.code === 'ECONNABORTED'
          ? 'Le serveur met trop de temps à répondre. Réessaie.'
          : requestError.response?.data?.error || message;
      }
      setVoiceError(message);
    }
  };

  const interruptAudio = () => {
    narrationStoppedRef.current = true;
    window.clearTimeout(pauseTimerRef.current);
    const playing = audioRef.current;
    audioRef.current = null;
    playing?.pause();
    setIsPlayingAudio(false);
    setIsPlayingReply(false);
  };

  const handleMicClick = async () => {
    if (recorder.isRecording) {
      setIsSendingVoice(true);
      try {
        await sendVoiceAnswer(await recorder.stop());
      } finally {
        setIsSendingVoice(false);
      }
      return;
    }

    interruptAudio();
    setVoiceError('');
    setAiReply('');
    try {
      await recorder.start();
    } catch {
      setVoiceError('L’accès au microphone a échoué. Vérifie les autorisations du navigateur.');
    }
  };

  const replayPresentation = () => {
    if (audioBlobsRef.current.length === 0) return;
    setSpeechError('');
    setIsPlayingReply(false);
    setIsPlayingAudio(true);
    playSequence(
      audioBlobsRef.current,
      audioRef,
      audioUrlRef,
      pauseTimerRef,
      () => setIsPlayingAudio(false),
      () => {
        setIsPlayingAudio(false);
        setSpeechError('La lecture audio a échoué. Tu peux réessayer avec le bouton de lecture.');
      }
    );
  };

  if (declined) {
    return (
      <SurveyPageLayout title="Questionnaire OR-ALIM" progressLabel="Présentation" isVoice={audioEnabled} onBack={onBack}>
        {audioEnabled && <MascotPanel mascot={selectedMascot} state="complete" />}
        <QuestionCard kicker="Présentation" question={declineMessage} />
        <div style={surveyStyles.actions}>
          <NextButton label="Retour à l’accueil" onClick={() => onContinue(false)} />
        </div>
      </SurveyPageLayout>
    );
  }

  const selectedChoices = { yes: [consentYesOption], no: [consentNoOption], '': [] }[participation];

  return (
    <SurveyPageLayout title="Questionnaire OR-ALIM" progressLabel="Présentation" isVoice={audioEnabled} onBack={onBack}>
      {audioEnabled && <MascotPanel mascot={selectedMascot} state={conversationState} />}
      <QuestionCard
        kicker="Présentation"
        intros={shownParagraphs}
        question={shownQuestion}
        repeatLabel={repeatLabel}
        repeatDisabled={isLoadingAudio || isPlayingAudio || !audioBlobsRef.current.length}
        onRepeat={audioEnabled ? replayPresentation : undefined}
      />
      <div onChangeCapture={interruptAudio}>
        <div style={surveyStyles.presetCard}>
          <PresetChoices
            name="participation"
            options={[consentYesOption, consentNoOption]}
            values={selectedChoices}
            onChange={values => setParticipation(values[0] === consentYesOption ? 'yes' : 'no')}
          />
        </div>
      </div>
      {audioEnabled && <VoiceTranscriptCard heard={heard} reply={aiReply} isProcessing={isSendingVoice} />}
      {audioEnabled && <p style={surveyStyles.privacyNotice}>Ton enregistrement est envoyé à OpenAI pour transcription et traitement. Tu peux aussi cocher ta réponse.</p>}
      {error && <p role="alert" style={surveyStyles.errorMessage}>{error}</p>}
      {audioEnabled && (
        <VoiceReplyControls
          isRecording={recorder.isRecording}
          isBusy={isSendingVoice}
          label={micLabel}
          levels={recorder.levels}
          elapsedSeconds={recorder.elapsedSeconds}
          voiceStatus={recorder.voiceStatus}
          onClick={() => void handleMicClick()}
        />
      )}
      <div style={surveyStyles.actions}>
        <NextButton
          label={participation === 'no' ? 'Terminer' : 'Continuer'}
          disabled={!participation || recorder.isRecording || isSendingVoice}
          onClick={handleContinue}
        />
      </div>
    </SurveyPageLayout>
  );
};

export default PresentationPage;