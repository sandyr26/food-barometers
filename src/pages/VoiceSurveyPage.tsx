import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { FaCircleArrowLeft, FaForwardStep } from 'react-icons/fa6';
import { api } from '../api';
import { loadNarration, preloadNarration } from '../narration';
import BackButton from '../components/BackButton';
import { MascotPanel, NextButton, PresetChoices, QuestionCard, SurveyPageLayout } from '../components/SurveyLayout';
import { VoiceReplyControls, VoiceTranscriptCard } from '../components/VoiceReply';
import { emptyLevels } from '../hooks/useVoiceRecorder';
import { ICON_SIZE, surveyStyles } from '../surveyStyles';
import { mascotByState } from '../voiceMascot';
import type { ConversationState } from '../voiceMascot';
import {
  INTAKE_MAX,
  RECALL_ENABLED,
  RECALL_QUESTION_COUNT,
  intakeFields,
  parentRoleNames,
  stepSpeech,
  surveySteps,
  validateTypedAnswer,
} from '../surveyConfig';
import type { IntakeFieldId, Mascot, PresetGroup, SurveyStep } from '../surveyConfig';
import {
  applyExtraction,
  emptyIntake,
  intakeHasContent,
  intakeSummary,
  intakeText,
  skipStage,
  stageIntro,
  stageQuestion,
  stageSpeech,
  stageTargetField,
} from '../intakeFlow';
import type { IntakeEntry, IntakeExtraction, IntakeOutcome, IntakeStage } from '../intakeFlow';
import { beginSurvey, flushSurveys, initSurveySync, recordSurvey, subscribeSurveySync } from '../surveySync';
import type { SurveyPatch, SyncStatus } from '../surveySync';

type FlowPhase = 'questions' | 'intake' | 'saving' | 'complete';

interface VoiceSurveyPageProps {
  authToken: string | null;
  selectedMascot: Mascot;
  aiEnabled?: boolean;
  onBack: () => void;
}

type AnswerMode = 'voice' | 'text' | 'preset' | 'mixed' | 'skipped';
type Occupations = Record<string, { occupation: string; notWorking: boolean }>;

interface AiTurn {
  transcript: string;
  answer: string;
  reply: string;
  followUp: boolean;
  needsRepeat: boolean;
  selectedGroups: Record<string, string[]>;
  freeTextGroups: Record<string, string>;
  at: string;
}

interface RecordedAnswer {
  text: string;
  mode: AnswerMode;
  selections: Record<string, string[]>;
  parentOccupations?: Occupations;
  typed?: string;
  voice?: string;
  aiReply?: string;
  aiTurns?: AiTurn[];
}

interface HistoryEntry {
  phase: FlowPhase;
  questionIndex: number;
  selectedOptions: Record<string, string[]>;
  parentOccupations: Occupations;
  typedAnswer: string;
  transcript: string;
  intakes: IntakeEntry[];
  currentIntake: IntakeEntry;
  intakeStage: IntakeStage;
  aiTurns: AiTurn[];
}

const INTAKE_QUESTION_NUMBER = 9;
const stepNumberShift = RECALL_ENABLED ? RECALL_QUESTION_COUNT : 0;
const displayNumber = (number: number) => (RECALL_ENABLED && number >= INTAKE_QUESTION_NUMBER ? number + stepNumberShift : number);
const displayLabel = (step: SurveyStep) => `${displayNumber(step.number)}${step.label.slice(String(step.number).length)}`;
const displayTotal = 28 + stepNumberShift;

const stepIndexById = new Map(surveySteps.map((step, index) => [step.id, index]));
const blankAnswer = (): RecordedAnswer => ({ text: '', mode: 'skipped', selections: {} });
const emptyOccupations = (): Occupations => Object.fromEntries(parentRoleNames.map(role => [role, { occupation: '', notWorking: false }]));
const serializeStep = (surveyStep: SurveyStep, answer: RecordedAnswer) => ({ id: surveyStep.id, number: surveyStep.number, question: surveyStep.text, ...answer });
const serializeIntake = (entry: IntakeEntry, index: number, ai: boolean) => ({ intake: index + 1, text: intakeText(entry), mode: ai ? 'ai' : 'form', fields: entry.fields, skipped: entry.skipped, heard: entry.heard, turns: entry.turns });

const findNextStep = (from: number, answers: RecordedAnswer[]) => {
  const get = (id: string) => {
    const index = stepIndexById.get(id);
    return index === undefined ? undefined : answers[index];
  };
  let next = from + 1;
  while (next < surveySteps.length && surveySteps[next].skipIf?.(get)) next++;
  return next;
};

const stopAudio = (audioRef: React.RefObject<HTMLAudioElement | null>) => {
  if (!audioRef.current) return;
  audioRef.current.pause();
  audioRef.current.onended = null;
  audioRef.current.onerror = null;
  audioRef.current = null;
};

const playBlob = (blob: Blob, audioRef: React.RefObject<HTMLAudioElement | null>, onEnded: () => void, onError: () => void) => {
  stopAudio(audioRef);
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audioRef.current = audio;
  const cleanup = () => {
    URL.revokeObjectURL(url);
    if (audioRef.current === audio) audioRef.current = null;
  };
  audio.onended = () => { const active = audioRef.current === audio; cleanup(); if (active) onEnded(); };
  audio.onerror = () => { const active = audioRef.current === audio; cleanup(); if (active) onError(); };
  void audio.play().catch(() => { const active = audioRef.current === audio; cleanup(); if (active) onError(); });
};

const playBase64Audio = (audioData: string, audioRef: React.RefObject<HTMLAudioElement | null>, onEnded: () => void, onError: () => void) => {
  const bytes = Uint8Array.from(atob(audioData), character => character.codePointAt(0) ?? 0);
  playBlob(new Blob([bytes], { type: 'audio/mpeg' }), audioRef, onEnded, onError);
};

const VoiceSurveyPage: React.FC<VoiceSurveyPageProps> = ({ authToken, selectedMascot, aiEnabled = true, onBack }) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<FlowPhase>('questions');
  const [conversationState, setConversationState] = useState<ConversationState>('speaking');
  const [transcript, setTranscript] = useState('');
  const [typedAnswer, setTypedAnswer] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [requiresRepeat, setRequiresRepeat] = useState(false);
  const [followUpsDone, setFollowUpsDone] = useState(0);
  const [aiTurns, setAiTurns] = useState<AiTurn[]>([]);
  const [parentOccupations, setParentOccupations] = useState<Occupations>(emptyOccupations);
  const [aiReply, setAiReply] = useState('');
  const [error, setError] = useState('');
  const [responses, setResponses] = useState<RecordedAnswer[]>(() => surveySteps.map(blankAnswer));
  const [intakes, setIntakes] = useState<IntakeEntry[]>([]);
  const [currentIntake, setCurrentIntake] = useState<IntakeEntry>(emptyIntake);
  const [intakeStage, setIntakeStage] = useState<IntakeStage>({ kind: 'opening' });
  const [intakeHeard, setIntakeHeard] = useState('');
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechCleanupRef = useRef<() => void>(() => {});
  const audioContextRef = useRef<AudioContext | null>(null);
  const levelFrameRef = useRef(0);
  const [levels, setLevels] = useState<number[]>(emptyLevels);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [voiceStatus, setVoiceStatus] = useState<'heard' | 'listening' | 'quiet'>('listening');
  const [isSendingVoice, setIsSendingVoice] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ pending: false, failed: false });
  const [offlineNotice, setOfflineNotice] = useState(false);

  const step = surveySteps[questionIndex];
  const isFirstIntake = intakes.length === 0;
  const intakeFieldDefinition = phase === 'intake' ? intakeFields.find(field => field.id === stageTargetField(intakeStage)) : undefined;
  const intakeChoiceField = intakeFieldDefinition && intakeFieldDefinition.kind !== 'text' ? intakeFieldDefinition : undefined;
  let currentQuestion = stepSpeech(step);
  if (phase === 'intake') currentQuestion = stageSpeech(intakeStage, isFirstIntake);
  const voiceMascot = selectedMascot;

  useEffect(() => {
    initSurveySync();
    beginSurvey(aiEnabled ? voiceMascot : 'none');
    return subscribeSurveySync(setSyncStatus);
  }, [aiEnabled, voiceMascot]);

  useEffect(() => {
    setError('');
    if (!aiEnabled) {
      setConversationState('listening');
      return;
    }
    setConversationState('speaking');
    const controller = new AbortController();
    let cancelled = false;

    const requestQuestionAudio = async () => {
      try {
        const audio = await loadNarration(currentQuestion, 'fr', voiceMascot, authToken, controller.signal);
        if (cancelled) return;
        playBlob(audio, audioRef, () => setConversationState('listening'), () => {
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
  }, [aiEnabled, authToken, currentQuestion, voiceMascot]);

  useEffect(() => {
    if (!aiEnabled) return;
    if (phase === 'questions') {
      const nextStep = surveySteps[questionIndex + 1];
      if (RECALL_ENABLED && step.id === '8') preloadNarration(stageSpeech({ kind: 'opening' }, true), 'fr', voiceMascot);
      else if (nextStep) preloadNarration(stepSpeech(nextStep), 'fr', voiceMascot);
    }
  }, [aiEnabled, phase, questionIndex, step.id, voiceMascot]);

  useEffect(() => () => {
    stopAudio(audioRef);
    cancelAnimationFrame(levelFrameRef.current);
    void audioContextRef.current?.close();
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    mediaStreamRef.current?.getTracks().forEach(track => track.stop());
  }, []);

  const allPreviousAnswers = [
    ...responses.slice(0, questionIndex).map(answer => answer.text),
    ...intakes.map(intake => intakeText(intake)),
  ].filter(Boolean).slice(-12);

  const interruptNarration = () => {
    speechCleanupRef.current();
    speechCleanupRef.current = () => {};
    stopAudio(audioRef);
    if (conversationState === 'speaking') setConversationState('listening');
  };

  const setSelection = (key: string, values: string[]) => {
    interruptNarration();
    setSelectedOptions(current => ({ ...current, [key]: values }));
    setRequiresRepeat(false);
  };

  const updateParentOccupation = (role: string, update: Partial<Occupations[string]>) => {
    interruptNarration();
    setParentOccupations(current => ({ ...current, [role]: { ...current[role], ...update } }));
  };

  const clearCurrentAnswer = () => {
    setTranscript('');
    setTypedAnswer('');
    setRequiresRepeat(false);
    setFollowUpsDone(0);
    setAiTurns([]);
    setAiReply('');
    setSelectedOptions({});
    setParentOccupations(emptyOccupations());
    setError('');
  };

  const makeCurrentAnswer = (typedOverride?: string): RecordedAnswer => {
    const typed = (typedOverride ?? typedAnswer).trim();
    const voice = transcript.trim();
    const selections = Object.fromEntries(Object.entries(selectedOptions).filter(([, values]) => values.length > 0));
    const answeredParentOccupations = Object.fromEntries(Object.entries(parentOccupations).filter(([, value]) => value.occupation.trim() || value.notWorking));
    const parts = [
      ...Object.entries(selections).map(([key, values]) => `${key}: ${values.join(', ')}`),
      ...Object.entries(answeredParentOccupations).map(([role, value]) => `${role}: ${value.notWorking ? 'ne travaille pas' : value.occupation}`),
      typed ? `Réponse écrite: ${typed}` : '',
      voice ? `Réponse vocale: ${voice}` : '',
    ].filter(Boolean);
    const inputMethods = [
      Object.keys(selections).length || Object.keys(answeredParentOccupations).length ? 'preset' : '',
      typed ? 'text' : '',
      voice ? 'voice' : '',
    ].filter(Boolean);
    let mode: AnswerMode = 'skipped';
    if (inputMethods.length === 1) mode = inputMethods[0] as AnswerMode;
    if (inputMethods.length > 1) mode = 'mixed';
    return { text: parts.join('\n'), mode, selections, parentOccupations: answeredParentOccupations, typed, voice, aiReply: aiTurns.at(-1)?.reply ?? '', aiTurns };
  };

  const renderChoices = (group: PresetGroup) => (
    <PresetChoices
      key={group.id}
      name={group.id}
      options={group.options}
      values={selectedOptions[group.id] || []}
      multiple={group.multiple}
      exclusiveOption={group.exclusiveOption}
      onChange={values => setSelection(group.id, values)}
    />
  );

  const renderTextPrompt = () => {
    const prompt = step.textPrompt;
    if (!prompt || (prompt.when && !prompt.when(selectedOptions))) return null;
    return <label style={styles.fieldLabel}>{prompt.label}<input style={styles.textInput} value={typedAnswer} onChange={event => setTypedAnswer(event.target.value)} /></label>;
  };

  const renderOccupations = () => (
    <div style={styles.presetCard}>
      {step.hint && <p style={styles.presetHeading}>{step.hint}</p>}
      {parentRoleNames.map(role => (
        <div key={role} style={styles.parentOccupation}>
          <strong>{role}</strong>
          <input style={styles.textInput} aria-label={`Métier de ${role}`} disabled={parentOccupations[role].notWorking} value={parentOccupations[role].occupation} onChange={event => updateParentOccupation(role, { occupation: event.target.value })} />
          <label style={styles.presetOption}>
            <input type="checkbox" checked={parentOccupations[role].notWorking} onChange={event => updateParentOccupation(role, { notWorking: event.target.checked, occupation: event.target.checked ? '' : parentOccupations[role].occupation })} />
            <span>Ne travaille pas</span>
          </label>
        </div>
      ))}
    </div>
  );

  const renderRanking = () => (
    <div style={styles.presetCard}>
      {step.hint && <p style={styles.presetHeading}>{step.hint}</p>}
      {step.groups.map(group => {
        const otherRanks = new Set(step.groups.filter(other => other.id !== group.id).flatMap(other => selectedOptions[other.id] || []));
        return (
          <label key={group.id} style={styles.fieldLabel}>{group.label}
            <select style={styles.textInput} value={selectedOptions[group.id]?.[0] || ''} onChange={event => setSelection(group.id, event.target.value ? [event.target.value] : [])}>
              <option value="">Choisir</option>
              {group.options.filter(option => !otherRanks.has(option)).map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        );
      })}
      {renderTextPrompt()}
    </div>
  );

  const updateIntakeField = (id: IntakeFieldId, value: string | string[]) => {
    interruptNarration();
    setCurrentIntake(current => ({ ...current, fields: { ...current.fields, [id]: value } }));
  };

  const renderIntakeForm = () => (
    <div style={styles.presetCard}>
      <p style={styles.presetHeading}>Décris cette prise alimentaire.</p>
      {intakeFields.map(field => {
        const value = currentIntake.fields[field.id];
        if (field.kind === 'text') {
          return (
            <label key={field.id} style={styles.fieldLabel}>{field.label}
              <input style={styles.textInput} value={typeof value === 'string' ? value : ''} onChange={event => updateIntakeField(field.id, event.target.value)} />
            </label>
          );
        }
        const values = Array.isArray(value) ? value : (value ? [value] : []);
        return (
          <div key={field.id} style={styles.fieldLabel}>
            <span>{field.label}</span>
            <PresetChoices name={`intake-${field.id}`} options={field.options ?? []} values={values} multiple={field.kind === 'multi'} onChange={chosen => updateIntakeField(field.id, field.kind === 'multi' ? chosen : (chosen[0] ?? ''))} />
          </div>
        );
      })}
    </div>
  );

  const renderIntakeAssistant = () => {
    const summary = intakeSummary(currentIntake);
    return (
      <>
        {summary.length > 0 && (
          <div style={styles.presetCard}>
            <p style={styles.presetHeading}>Prise {intakes.length + 1} en cours</p>
            {summary.map(line => <div key={line.id} style={styles.summaryRow}><strong>{line.label}</strong><span>{line.value}</span></div>)}
          </div>
        )}
        {intakeChoiceField && (
          <div style={styles.presetCard}>
            <PresetChoices
              name={`intake-${intakeChoiceField.id}`}
              options={intakeChoiceField.options ?? []}
              values={selectedOptions[intakeChoiceField.id] || []}
              multiple={intakeChoiceField.kind === 'multi'}
              onChange={values => setSelection(intakeChoiceField.id, values)}
            />
          </div>
        )}
        {intakeStage.kind === 'opening' && <button type="button" onClick={() => handleNoMoreIntakes()} disabled={busy} style={styles.shortcutButton}>{isFirstIntake ? 'Je n’ai rien mangé ni bu' : 'Je n’ai plus rien mangé ni bu jusqu’au coucher'}</button>}
        {(intakeStage.kind === 'solidsMore' || intakeStage.kind === 'endCheck') && <button type="button" onClick={() => handleNothingMore()} disabled={busy} style={styles.shortcutButton}>Non, rien d’autre</button>}
      </>
    );
  };

  const renderPresetAnswers = () => {
    if (phase === 'intake') return aiEnabled ? renderIntakeAssistant() : renderIntakeForm();
    if (phase !== 'questions') return null;
    if (step.ui === 'occupations') return renderOccupations();
    if (step.ui === 'ranking') return renderRanking();
    if (step.ui === 'choices') {
      return (
        <div style={styles.presetCard}>
          {step.hint && <p style={styles.presetHeading}>{step.hint}</p>}
          {step.groups.map(renderChoices)}
          {renderTextPrompt()}
        </div>
      );
    }
    return null;
  };

  let hasCurrentAnswer = Boolean(
    transcript.trim()
    || typedAnswer.trim()
    || Object.values(selectedOptions).some(values => values.length > 0)
    || Object.values(parentOccupations).some(value => value.occupation.trim() || value.notWorking)
  );
  if (phase === 'intake') {
    if (!aiEnabled) hasCurrentAnswer = intakeHasContent(currentIntake);
    else if (intakeChoiceField) hasCurrentAnswer = (selectedOptions[intakeChoiceField.id]?.length ?? 0) > 0;
    else hasCurrentAnswer = Boolean(typedAnswer.trim());
  }
  const busy = conversationState === 'saving' || conversationState === 'thinking' || conversationState === 'recording';
  const presetAnswers = renderPresetAnswers();
  const showTypedAnswer = (phase === 'intake' && aiEnabled && !intakeChoiceField) || (phase === 'questions' && step.ui === 'text');
  const hasReplied = hasCurrentAnswer && !requiresRepeat;
  let micLabel = hasCurrentAnswer && phase === 'questions' ? 'Compléter ou corriger' : 'Répondre';
  if (conversationState === 'recording') micLabel = 'Terminer l’enregistrement';
  if (isSendingVoice) micLabel = 'Envoi de la voix…';

  const transcribeAnswer = async (audio: Blob, previous: { transcript: string; selections: Record<string, string[]> } | null) => {
    if (!authToken) {
      setError('Ta session a expiré. Reconnecte-toi pour répondre.');
      setConversationState('listening');
      return;
    }

    const formData = new FormData();
    let extension = 'webm';
    if (audio.type.includes('ogg')) extension = 'ogg';
    else if (audio.type.includes('mp4')) extension = 'mp4';
    else if (audio.type.includes('wav')) extension = 'wav';
    formData.append('audio', audio, `survey-answer.${extension}`);
    formData.append('question', currentQuestion);
    formData.append('language', 'fr');
    formData.append('mascot', voiceMascot);
    formData.append('previousAnswers', JSON.stringify(allPreviousAnswers));
    const presetGroups = phase === 'questions' ? step.groups : [];
    if (presetGroups.length > 0) formData.append('presetGroups', JSON.stringify(presetGroups));
    if (phase === 'questions') {
      formData.append('rules', JSON.stringify({
        guidance: step.guidance,
        expected: step.expected,
        maxFollowUps: step.maxFollowUps,
        followUpsDone,
        numeric: step.numeric,
        allowedValues: step.allowedValues,
        list: step.list,
      }));
    }
    if (previous) {
      formData.append('currentTranscript', previous.transcript);
      formData.append('currentSelections', JSON.stringify(previous.selections));
    }

    try {
      const response = await api.post('/api/ai/turn', formData, {
        headers: { Authorization: `Bearer ${authToken}` },
        timeout: 60000,
      });
      const nextTranscript = (response.data.answer ?? response.data.transcript)?.trim();
      const nextReply = response.data.reply?.trim();
      if (!nextTranscript || !nextReply || !response.data.audio) throw new Error('Incomplete AI response');
      const matchedGroups = response.data.selectedGroups as Record<string, string[]> | undefined;
      const freeTextGroups = (response.data.freeTextGroups ?? {}) as Record<string, string>;
      const needsRepeat = response.data.needsRepeat === true;
      const followUp = response.data.followUp === true;
      const keepPrevious = needsRepeat && previous !== null;
      const blocksNext = needsRepeat && !keepPrevious;
      const expectsMore = blocksNext || followUp;
      if (!keepPrevious) setTranscript(nextTranscript);
      setAiTurns(current => [...current, {
        transcript: String(response.data.transcript ?? ''),
        answer: nextTranscript,
        reply: nextReply,
        followUp,
        needsRepeat,
        selectedGroups: matchedGroups ?? {},
        freeTextGroups,
        at: new Date().toISOString(),
      }]);
      if (followUp) setFollowUpsDone(count => count + 1);
      if (!needsRepeat && Object.keys(freeTextGroups).length > 0) {
        setSelectedOptions(current => {
          const updated = { ...current };
          for (const key of Object.keys(freeTextGroups)) delete updated[key];
          return updated;
        });
        setParentOccupations(current => {
          const updated = { ...current };
          for (const role of parentRoleNames) {
            const occupation = freeTextGroups[`q7-${role}`];
            if (occupation) updated[role] = { occupation, notWorking: false };
          }
          return updated;
        });
      }
      if (!needsRepeat && matchedGroups) {
        setSelectedOptions(current => ({ ...current, ...matchedGroups }));
        setParentOccupations(current => {
          const updated = { ...current };
          for (const role of parentRoleNames) {
            const roleSelection = matchedGroups[`q7-${role}`];
            if (roleSelection?.includes('Ne travaille pas')) {
              updated[role] = { occupation: '', notWorking: true };
            } else if (roleSelection && previous) {
              updated[role] = { ...updated[role], notWorking: false };
            }
          }
          return updated;
        });
      }
      setRequiresRepeat(blocksNext);
      setAiReply(nextReply);
      setConversationState('speaking');
      playBase64Audio(response.data.audio, audioRef, () => setConversationState(expectsMore ? 'listening' : 'ready'), () => {
        setError('La réponse vocale a échoué. Tu peux continuer en lisant la réponse.');
        setConversationState(expectsMore ? 'listening' : 'ready');
      });
    } catch (requestError) {
      let message = 'Impossible de traiter cet enregistrement. Réessaie.';
      if (axios.isAxiosError(requestError)) {
        message = requestError.code === 'ECONNABORTED'
          ? 'Le serveur met trop de temps à répondre. Réessaie.'
          : requestError.response?.data?.error || message;
      }
      setError(message);
      setConversationState('listening');
    }
  };

  const saveInBackground = (patch: SurveyPatch) => recordSurvey(patch);

  const pushHistory = () => setHistory(current => [...current, { phase, questionIndex, selectedOptions, parentOccupations, typedAnswer, transcript, intakes, currentIntake, intakeStage, aiTurns }]);

  const finishIntakes = (finished: IntakeEntry[]) => {
    clearCurrentAnswer();
    setIntakeHeard('');
    setIntakes(finished);
    setCurrentIntake(emptyIntake());
    setIntakeStage({ kind: 'opening' });
    setPhase('questions');
    setQuestionIndex(stepIndexById.get('9') ?? 0);
  };

  const settleIntake = (entry: IntakeEntry, outcome: IntakeOutcome) => {
    if (outcome === 'clarify') {
      setCurrentIntake(entry);
      return;
    }
    interruptNarration();
    pushHistory();
    if (outcome === 'endOfDay') {
      saveInBackground({ yesterdayIntakes: intakes.map((item, index) => serializeIntake(item, index, aiEnabled)), currentIntake: null });
      finishIntakes(intakes);
      return;
    }
    clearCurrentAnswer();
    if (outcome === 'complete') {
      const finished = [...intakes, entry];
      saveInBackground({ yesterdayIntakes: finished.map((item, index) => serializeIntake(item, index, aiEnabled)), currentIntake: null });
      if (finished.length >= INTAKE_MAX) {
        finishIntakes(finished);
        return;
      }
      setIntakes(finished);
      setCurrentIntake(emptyIntake());
      setIntakeStage({ kind: 'opening' });
      return;
    }
    saveInBackground({ currentIntake: serializeIntake(entry, intakes.length, aiEnabled) });
    setCurrentIntake(entry);
    setIntakeStage(outcome);
  };

  const sendIntake = async (audio: Blob | null, text: string) => {
    if (!authToken) {
      setError('Ta session a expiré. Reconnecte-toi pour répondre.');
      setConversationState('listening');
      return;
    }

    const formData = new FormData();
    if (audio) {
      let extension = 'webm';
      if (audio.type.includes('ogg')) extension = 'ogg';
      else if (audio.type.includes('mp4')) extension = 'mp4';
      else if (audio.type.includes('wav')) extension = 'wav';
      formData.append('audio', audio, `intake-answer.${extension}`);
    } else {
      formData.append('text', text);
    }
    formData.append('language', 'fr');
    formData.append('mascot', voiceMascot);
    formData.append('payload', JSON.stringify({ stage: intakeStage.kind, targetField: stageTargetField(intakeStage), record: currentIntake.fields, fields: intakeFields }));
    setConversationState('thinking');
    setError('');

    try {
      const response = await api.post('/api/ai/intake', formData, { headers: { Authorization: `Bearer ${authToken}` }, timeout: 60000 });
      const result = response.data as IntakeExtraction & { reply?: string; audio?: string };
      setIntakeHeard(result.transcript);
      const { entry, outcome } = applyExtraction(currentIntake, intakeStage, result);
      if (outcome === 'clarify' && result.audio) {
        setAiReply(result.reply ?? '');
        setCurrentIntake(entry);
        setConversationState('speaking');
        playBase64Audio(result.audio, audioRef, () => setConversationState('listening'), () => setConversationState('listening'));
        return;
      }
      setAiReply('');
      setConversationState('listening');
      settleIntake(entry, outcome);
    } catch (requestError) {
      let message = 'Impossible de traiter cette réponse. Réessaie.';
      if (axios.isAxiosError(requestError)) {
        message = requestError.code === 'ECONNABORTED' ? 'Le serveur met trop de temps à répondre. Réessaie.' : requestError.response?.data?.error || message;
      }
      setError(message);
      setConversationState('listening');
    }
  };

  const handleNothingMore = () => {
    const { entry, outcome } = applyExtraction(currentIntake, intakeStage, { transcript: 'Non', updates: {}, nothingMore: true });
    settleIntake(entry, outcome);
  };

  const handleNoMoreIntakes = () => settleIntake(currentIntake, 'endOfDay');

  const handleIntakeNext = () => {
    const target = stageTargetField(intakeStage);
    if (intakeChoiceField && target) {
      const values = selectedOptions[target] ?? [];
      if (values.length === 0) return;
      const value = intakeChoiceField.kind === 'multi' ? values : values[0];
      const { entry, outcome } = applyExtraction(currentIntake, intakeStage, { transcript: '', updates: { [target]: value } });
      settleIntake(entry, outcome);
      return;
    }
    const text = typedAnswer.trim();
    if (!text) return;
    if (target) {
      const { entry, outcome } = applyExtraction(currentIntake, intakeStage, { transcript: text, updates: { [target]: text } });
      settleIntake(entry, outcome);
    } else if (intakeStage.kind === 'solidsMore') {
      const { entry, outcome } = applyExtraction(currentIntake, intakeStage, { transcript: text, updates: {}, additions: { solids: text } });
      settleIntake(entry, outcome);
    } else {
      void sendIntake(null, text);
    }
  };

  const finishFormIntakes = () => {
    pushHistory();
    const finished = intakeHasContent(currentIntake) ? [...intakes, currentIntake] : intakes;
    saveInBackground({ yesterdayIntakes: finished.map((item, index) => serializeIntake(item, index, aiEnabled)), currentIntake: null });
    finishIntakes(finished);
  };

  const handleFormNext = () => {
    if (!intakeHasContent(currentIntake)) return;
    pushHistory();
    const finished = [...intakes, currentIntake];
    saveInBackground({ yesterdayIntakes: finished.map((item, index) => serializeIntake(item, index, aiEnabled)), currentIntake: null });
    if (finished.length >= INTAKE_MAX) {
      finishIntakes(finished);
      return;
    }
    clearCurrentAnswer();
    setIntakes(finished);
    setCurrentIntake(emptyIntake());
  };

  const stopLevelMeter = () => {
    cancelAnimationFrame(levelFrameRef.current);
    void audioContextRef.current?.close();
    audioContextRef.current = null;
  };

  const startLevelMeter = (stream: MediaStream) => {
    const context = new AudioContext();
    void context.resume();
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    context.createMediaStreamSource(stream).connect(analyser);
    audioContextRef.current = context;

    const samples = new Uint8Array(analyser.fftSize);
    const startedAt = performance.now();
    let lastVoiceAt = startedAt;
    let lastTick = 0;
    setLevels(emptyLevels());
    setElapsedSeconds(0);
    setVoiceStatus('listening');

    const tick = (now: number) => {
      levelFrameRef.current = requestAnimationFrame(tick);
      if (now - lastTick < 70) return;
      lastTick = now;
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (const sample of samples) {
        const normalized = (sample - 128) / 128;
        sum += normalized * normalized;
      }
      const level = Math.min(1, Math.sqrt(sum / samples.length) * 5);
      if (level > 0.12) lastVoiceAt = now;
      const silentFor = now - lastVoiceAt;
      let status: 'heard' | 'listening' | 'quiet' = 'listening';
      if (silentFor < 700) status = 'heard';
      else if (silentFor > 3000) status = 'quiet';
      setLevels(current => [...current.slice(1), level]);
      setElapsedSeconds(Math.floor((now - startedAt) / 1000));
      setVoiceStatus(status);
    };
    levelFrameRef.current = requestAnimationFrame(tick);
  };

  const handleMicClick = async () => {
    if (conversationState === 'recording') {
      mediaRecorderRef.current?.stop();
      setIsSendingVoice(true);
      setConversationState('thinking');
      return;
    }
    if (!['speaking', 'listening', 'ready'].includes(conversationState)) return;

    interruptNarration();
    setConversationState('thinking');
    setError('');
    setRequiresRepeat(false);
    setAiReply('');
    const occupationLines = phase === 'questions' && step.ui === 'occupations'
      ? Object.entries(parentOccupations).filter(([, value]) => value.occupation.trim()).map(([role, value]) => `${role}: ${value.occupation.trim()}`)
      : [];
    const previous = phase === 'questions' && hasReplied
      ? {
        transcript: [transcript.trim(), ...occupationLines].filter(Boolean).join('\n'),
        selections: Object.fromEntries(Object.entries(selectedOptions).filter(([, values]) => values.length > 0)),
      }
      : null;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'].find(type => MediaRecorder.isTypeSupported(type));
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = event => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
      recorder.onstop = () => {
        stopLevelMeter();
        stream.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
        const recorded = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const request = phase === 'intake' ? sendIntake(recorded, '') : transcribeAnswer(recorded, previous);
        void request.finally(() => setIsSendingVoice(false));
      };
      recorder.start();
      startLevelMeter(stream);
      if (!previous) setTranscript('');
      setConversationState('recording');
    } catch {
      setError('L’accès au microphone a échoué. Vérifie les autorisations du navigateur.');
      setConversationState('listening');
    }
  };

  const saveSurvey = async (stepAnswers: RecordedAnswer[], intakeAnswers: IntakeEntry[]) => {
    setConversationState('saving');
    setError('');
    recordSurvey({
      questions: surveySteps.map((surveyStep, index) => serializeStep(surveyStep, stepAnswers[index] || blankAnswer())),
      yesterdayIntakes: intakeAnswers.map((entry, index) => serializeIntake(entry, index, aiEnabled)),
      currentIntake: null,
      complete: true,
    });
    setOfflineNotice(!(await flushSurveys()));
    setPhase('complete');
    setConversationState('complete');
  };

  const handlePrevious = () => {
    const entry = history.at(-1);
    if (!entry) return;
    interruptNarration();
    setHistory(current => current.slice(0, -1));
    setPhase(entry.phase);
    setQuestionIndex(entry.questionIndex);
    setSelectedOptions(entry.selectedOptions);
    setParentOccupations(entry.parentOccupations);
    setTypedAnswer(entry.typedAnswer);
    setTranscript(entry.transcript);
    setIntakes(entry.intakes);
    setCurrentIntake(entry.currentIntake);
    setIntakeStage(entry.intakeStage);
    setIntakeHeard('');
    setRequiresRepeat(false);
    setFollowUpsDone(0);
    setAiTurns(entry.aiTurns);
    setAiReply('');
    setError('');
    setConversationState('listening');
  };

  const advanceWithAnswer = (answer: RecordedAnswer) => {
    interruptNarration();
    pushHistory();

    const updatedAnswers = [...responses];
    updatedAnswers[questionIndex] = answer;

    if (RECALL_ENABLED && step.id === '8') {
      saveInBackground({ questions: [serializeStep(step, answer)] });
      setResponses(updatedAnswers);
      clearCurrentAnswer();
      setIntakeHeard('');
      setIntakes([]);
      setCurrentIntake(emptyIntake());
      setIntakeStage({ kind: 'opening' });
      setPhase('intake');
      return;
    }

    const next = findNextStep(questionIndex, updatedAnswers);
    for (let index = questionIndex + 1; index < Math.min(next, surveySteps.length); index++) updatedAnswers[index] = blankAnswer();

    if (next >= surveySteps.length) {
      void saveSurvey(updatedAnswers, intakes);
      return;
    }

    saveInBackground({
      questions: Array.from({ length: next - questionIndex }, (_, offset) => questionIndex + offset).map(index => serializeStep(surveySteps[index], updatedAnswers[index])),
    });

    setResponses(updatedAnswers);
    clearCurrentAnswer();
    setQuestionIndex(next);
  };

  const handleNext = () => {
    if (phase === 'intake') {
      if (aiEnabled) handleIntakeNext();
      else handleFormNext();
      return;
    }
    if (phase === 'questions') {
      const validation = validateTypedAnswer(step, typedAnswer);
      if (!validation.ok) {
        setError(validation.message);
        return;
      }
      advanceWithAnswer(makeCurrentAnswer(validation.value));
      return;
    }
    advanceWithAnswer(makeCurrentAnswer());
  };

  const handleSkip = () => {
    if (phase !== 'intake') {
      advanceWithAnswer(aiTurns.length > 0 ? { ...blankAnswer(), aiReply: aiTurns.at(-1)?.reply ?? '', aiTurns } : blankAnswer());
      return;
    }
    if (!aiEnabled) {
      finishFormIntakes();
    } else if (intakeStage.kind === 'opening') {
      handleNoMoreIntakes();
    } else {
      const { entry, outcome } = skipStage(currentIntake, intakeStage);
      settleIntake(entry, outcome);
    }
  };

  const handleRepeatQuestion = async () => {
    interruptNarration();
    const controller = new AbortController();
    speechCleanupRef.current = () => {
      controller.abort();
      stopAudio(audioRef);
    };
    setError('');
    setConversationState('speaking');
    try {
      const audio = await loadNarration(currentQuestion, 'fr', voiceMascot, authToken, controller.signal);
      if (controller.signal.aborted) return;
      playBlob(audio, audioRef, () => setConversationState('listening'), () => setConversationState('listening'));
    } catch {
      if (controller.signal.aborted) return;
      setError('Impossible de relire la question. Tu peux quand même répondre.');
      setConversationState('listening');
    }
  };

  let questionLabel = 'Questionnaire terminé';
  let kicker = 'Rappel de la journée d’hier';
  if (phase === 'questions') {
    questionLabel = `Question ${displayNumber(step.number)} sur ${displayTotal}`;
    kicker = `Question ${displayLabel(step)}`;
  } else if (phase === 'intake') {
    questionLabel = `Question ${INTAKE_QUESTION_NUMBER} sur ${displayTotal} · prise ${intakes.length + 1}`;
    kicker = `Question ${INTAKE_QUESTION_NUMBER} · Rappel de la journée d’hier`;
  } else if (phase === 'saving') {
    questionLabel = 'Enregistrement du questionnaire…';
  }

  const projectedAnswers = [...responses];
  projectedAnswers[questionIndex] = makeCurrentAnswer();
  const isLastStep = phase === 'questions' && findNextStep(questionIndex, projectedAnswers) >= surveySteps.length;
  let nextLabel = isLastStep ? 'Terminer' : 'Question suivante';
  if (phase === 'intake') nextLabel = aiEnabled ? 'Valider' : 'Valider cette prise';

  if (phase === 'complete') {
    return (
      <div style={styles.page}>
        <header style={styles.header}><BackButton onClick={onBack} /><h1 style={styles.title}>Questionnaire terminé</h1><div style={styles.headerSpacer} /></header>
        <main style={styles.completePanel}><img src={mascotByState[voiceMascot].complete} alt="Mascotte" style={styles.completeMascot} /><h2 style={styles.completeTitle}>Merci d’avoir répondu aux questions.</h2>{offlineNotice && <p style={styles.errorMessage}>Pas de connexion : tes réponses sont enregistrées sur cet appareil et seront envoyées automatiquement dès que la connexion revient.</p>}<button type="button" onClick={onBack} style={styles.primaryButton}>Retour à l’accueil</button></main>
      </div>
    );
  }

  const nextDisabled = !hasCurrentAnswer || requiresRepeat || !['speaking', 'ready', 'listening'].includes(conversationState);

  let intro: string | undefined;
  if (phase === 'questions') intro = step.intro;
  else if (phase === 'intake') intro = stageIntro(intakeStage, isFirstIntake) || undefined;

  return (
    <SurveyPageLayout title="Questionnaire OR-ALIM" progressLabel={questionLabel} isVoice={aiEnabled} onBack={onBack}>
        {aiEnabled && <MascotPanel mascot={voiceMascot} state={conversationState} />}
        <QuestionCard
          kicker={kicker}
          intros={intro ? [intro] : []}
          question={phase === 'questions' ? step.text : stageQuestion(intakeStage, isFirstIntake)}
          repeatLabel="🔊 Réécouter la question"
          onRepeat={aiEnabled ? () => void handleRepeatQuestion() : undefined}
        />
        <div onChangeCapture={interruptNarration}>
          {presetAnswers}
        </div>
        {showTypedAnswer && <label style={styles.typedAnswer}>
          <span>{aiEnabled ? 'Ou écris ta réponse' : 'Écris ta réponse'}</span>
          <textarea value={typedAnswer} onChange={event => { interruptNarration(); setTypedAnswer(event.target.value); setRequiresRepeat(false); setError(''); }} placeholder="Écris ta réponse ici…" rows={3} style={styles.answerInput} />
        </label>}
        {aiEnabled && <VoiceTranscriptCard heard={phase === 'intake' ? intakeHeard : transcript} reply={aiReply} isProcessing={conversationState === 'thinking'} />}
        {aiEnabled && <p style={styles.privacyNotice}>Ton enregistrement est envoyé à OpenAI pour transcription et traitement. Tu peux passer une question.</p>}
        {error && <p role="alert" style={styles.errorMessage}>{error}</p>}
        {syncStatus.pending && syncStatus.failed && <output style={styles.errorMessage}>Connexion perdue : tes réponses sont gardées sur cet appareil et seront envoyées automatiquement dès que la connexion revient.</output>}
        {aiEnabled && (
          <VoiceReplyControls
            isRecording={conversationState === 'recording'}
            isBusy={conversationState === 'thinking' || conversationState === 'saving'}
            label={micLabel}
            levels={levels}
            elapsedSeconds={elapsedSeconds}
            voiceStatus={voiceStatus}
            onClick={() => void handleMicClick()}
          />
        )}
        <div style={styles.actions}>
          {history.length > 0 && <button type="button" onClick={handlePrevious} disabled={busy}           style={styles.skipButton}>
                      <FaCircleArrowLeft size={ICON_SIZE} aria-hidden="true" style={styles.buttonIcon} />
                      Précédent
                    </button>}
                    <button type="button" onClick={handleSkip} disabled={busy} style={styles.skipButton}>
                      {phase === 'intake' && !aiEnabled ? 'Aucune autre prise' : 'Passer cette question'}
                      <FaForwardStep size={ICON_SIZE} aria-hidden="true" style={styles.buttonIcon} />
                    </button>
                    <NextButton label={nextLabel} disabled={nextDisabled} onClick={handleNext} />
        </div>
    </SurveyPageLayout>
  );
};

const styles: Record<string, React.CSSProperties> = {
  ...surveyStyles,
  summaryRow: { display: 'grid', gridTemplateColumns: 'minmax(90px, 0.35fr) 1fr', gap: '0.5rem', fontSize: '0.9rem', lineHeight: 1.4 },
  shortcutButton: { marginTop: '0.6rem', minHeight: 44, padding: '0.55rem 0.8rem', border: '1px solid #8b6e15', borderRadius: 8, background: '#fff4cc', color: '#332d1c', fontWeight: 700, cursor: 'pointer' },
  parentOccupation: { display: 'grid', gridTemplateColumns: 'minmax(115px, 0.6fr) minmax(130px, 1fr)', alignItems: 'center', gap: '0.5rem' },
  fieldLabel: { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.9rem', fontWeight: 700 },
  textInput: { width: '100%', minHeight: 40, padding: '0.5rem 0.6rem', boxSizing: 'border-box', border: '1px solid #c8b879', borderRadius: 6, background: '#fff', color: '#332d1c', font: 'inherit' },
  typedAnswer: { display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.75rem', color: '#765800', fontSize: '0.85rem', fontWeight: 700 },
  answerInput: { width: '100%', minHeight: 68, padding: '0.6rem 0.7rem', boxSizing: 'border-box', border: '1px solid #c8b879', borderRadius: 7, resize: 'vertical', font: 'inherit', fontWeight: 400 },
  skipButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', minHeight: 44, padding: '0.55rem 0.7rem', border: '1px solid #8b6e15', borderRadius: 8, background: '#fff4cc', color: '#332d1c', fontWeight: 700, cursor: 'pointer' },
  completePanel: { width: '100%', maxWidth: 560, margin: '0 auto', padding: '2rem 1rem', boxSizing: 'border-box', textAlign: 'center' },
  completeMascot: { width: 160, height: 160, objectFit: 'contain' },
  completeTitle: { fontSize: '1.35rem', lineHeight: 1.4 },
  primaryButton: { marginTop: '1rem', padding: '0.8rem 1.2rem', border: 0, borderRadius: 8, background: '#332d1c', color: '#fff', fontWeight: 800, cursor: 'pointer' },
};

export default VoiceSurveyPage;
