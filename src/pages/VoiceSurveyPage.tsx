import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { FaCircleArrowLeft, FaForwardStep } from 'react-icons/fa6';
import { api } from '../api';
import { loadNarration, preloadNarration } from '../narration';
import BackButton from '../components/BackButton';
import { MascotPanel, NextButton, PresetChoices, QuestionCard, SurveyPageLayout } from '../components/SurveyLayout';
import { DayTimeline, IntakeChecklist } from '../components/IntakeGuide';
import { VoiceReplyControls, VoiceTranscriptCard } from '../components/VoiceReply';
import { emptyLevels } from '../hooks/useVoiceRecorder';
import { daySegmentFor } from '../daySegment';
import { orderedOptions } from '../randomize';
import { ICON_SIZE, surveyStyles } from '../surveyStyles';
import { mascotByState } from '../voiceMascot';
import type { ConversationState } from '../voiceMascot';
import {
  INTAKE_MAX,
  RECALL_ENABLED,
  RECALL_MUSIC_MS,
  endThanksSpeech,
  intakeFields,
  parentRoleNames,
  recallConcentrationScript,
  recallInviteSpeech,
  recallIntroParagraphs,
  recallIntroSpeech,
  recallPrepSpeeches,
  stepSpeech,
  surveySteps,
  validateTypedAnswer,
} from '../surveyConfig';
import type { IntakeFieldId, Mascot, PresetGroup, SurveyStep } from '../surveyConfig';
import {
  applyExtraction,
  emptyIntake,
  intakeHasContent,
  intakeText,
  skipStage,
  stageIntros,
  stageQuestion,
  stageSpeech,
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

interface PairRow {
  item: string;
  reason: string;
}

interface RecordedAnswer {
  text: string;
  mode: AnswerMode;
  selections: Record<string, string[]>;
  // Order in which shuffled options were shown to the respondent.
  optionOrder?: Record<string, string[]>;
  parentOccupations?: Occupations;
  pairs?: PairRow[];
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
  pairRows: PairRow[];
  typedAnswer: string;
  transcript: string;
  intakes: IntakeEntry[];
  currentIntake: IntakeEntry;
  intakeStage: IntakeStage;
  aiTurns: AiTurn[];
}

const INTAKE_QUESTION_NUMBER = 9;
// Shown numbers follow the order of the questions (internal numbers have gaps, and a few steps sit between two numbers).
const questionNumbers = [...new Set([...surveySteps.map(step => step.number), INTAKE_QUESTION_NUMBER])].sort((a, b) => a - b);
const shownNumber = (number: number) => questionNumbers.indexOf(number) + 1;
const shownLabel = (label: string) => label.replace(/^[\d.]+/, digits => String(shownNumber(Number(digits))));
const displayTotal = questionNumbers.length;

const stepIndexById = new Map(surveySteps.map((step, index) => [step.id, index]));
const blankAnswer = (): RecordedAnswer => ({ text: '', mode: 'skipped', selections: {} });
const emptyOccupations = (): Occupations => Object.fromEntries(parentRoleNames.map(role => [role, { occupation: '', notWorking: false }]));
const emptyPairRows = (): PairRow[] => [{ item: '', reason: '' }];
const answeredPairs = (rows: PairRow[]) => rows.map(row => ({ item: row.item.trim(), reason: row.reason.trim() })).filter(row => row.item || row.reason);
const pairsText = (rows: PairRow[]) => answeredPairs(rows).map(row => (row.reason ? `${row.item} : ${row.reason}` : row.item)).join('\n');
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

// A login token lasts 24 hours; once it has expired every voice request is refused, which must not look like a broken button.
const speechFailureMessage = (error: unknown, fallback: string) => {
  const status = axios.isAxiosError(error) ? error.response?.status : undefined;
  return status === 401 || status === 403 ? 'Ta session a expiré. Reconnecte-toi pour écouter la question.' : fallback;
};

const VoiceSurveyPage: React.FC<VoiceSurveyPageProps> = ({ authToken, selectedMascot, aiEnabled = true, onBack }) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState<FlowPhase>('questions');
  const [conversationState, setConversationState] = useState<ConversationState>('speaking');
  const [isLoadingNarration, setIsLoadingNarration] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [typedAnswer, setTypedAnswer] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [requiresRepeat, setRequiresRepeat] = useState(false);
  const [followUpsDone, setFollowUpsDone] = useState(0);
  const [aiTurns, setAiTurns] = useState<AiTurn[]>([]);
  const [parentOccupations, setParentOccupations] = useState<Occupations>(emptyOccupations);
  const [pairRows, setPairRows] = useState<PairRow[]>(emptyPairRows);
  const [highlightedOption, setHighlightedOption] = useState<string | undefined>();
  const [recallPrepDone, setRecallPrepDone] = useState(false);
  const [recallStep, setRecallStep] = useState<'intro' | 'concentrate' | 'invite' | 'waiting' | 'blinking'>('intro');
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
  const [orderSeed] = useState(() => Math.random().toString(36).slice(2));

  const step = surveySteps[questionIndex];
  const isFirstIntake = intakes.length === 0;
  // Guided start of the recall (music, calm-down script, invitation to click on the rising sun) before the first answer.
  const prepActive = phase === 'intake' && aiEnabled && isFirstIntake && intakeStage.kind === 'opening' && currentIntake.heard.length === 0 && !recallPrepDone;
  const prepInvited = prepActive && ['invite', 'waiting', 'blinking'].includes(recallStep);
  let currentQuestion = stepSpeech(step);
  if (phase === 'intake') currentQuestion = prepActive ? '' : stageSpeech(intakeStage, isFirstIntake);
  const voiceMascot = selectedMascot;
  const optionsToRead = phase === 'questions' && step.readOptions ? step.groups[0]?.options ?? [] : [];

  // Says each option in turn and highlights it while it is spoken; resolves false when interrupted.
  const readOptionsAloud = async (labels: string[], signal: AbortSignal) => {
    try {
      for (const label of labels) {
        const audio = await loadNarration(label, 'fr', voiceMascot, authToken, signal);
        if (signal.aborted) return false;
        setHighlightedOption(label);
        await new Promise<void>(resolve => {
          signal.addEventListener('abort', () => resolve(), { once: true });
          playBlob(audio, audioRef, resolve, resolve);
        });
        if (signal.aborted) return false;
      }
      return true;
    } catch {
      return !signal.aborted;
    } finally {
      setHighlightedOption(undefined);
    }
  };
  const optionsReaderRef = useRef({ optionsToRead, readOptionsAloud });
  optionsReaderRef.current = { optionsToRead, readOptionsAloud };

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
    if (!currentQuestion) {
      speechCleanupRef.current();
      return;
    }
    setConversationState('speaking');
    setIsLoadingNarration(true);
    const controller = new AbortController();
    let cancelled = false;

    const requestQuestionAudio = async () => {
      const { optionsToRead: labels, readOptionsAloud: readLabels } = optionsReaderRef.current;
      try {
        labels.forEach(label => preloadNarration(label, 'fr', voiceMascot, authToken));
        const audio = await loadNarration(currentQuestion, 'fr', voiceMascot, authToken, controller.signal);
        if (cancelled) return;
        setIsLoadingNarration(false);
        const afterQuestion = () => {
          if (labels.length === 0) {
            setConversationState('listening');
            return;
          }
          void readLabels(labels, controller.signal).then(finished => {
            if (finished) setConversationState('listening');
          });
        };
        playBlob(audio, audioRef, afterQuestion, () => {
          setError('La synthèse vocale a échoué. Tu peux lire la question et répondre.');
          setConversationState('listening');
        });
      } catch (caught) {
        if (!cancelled) {
          setIsLoadingNarration(false);
          setError(speechFailureMessage(caught, 'La synthèse vocale a échoué. Tu peux lire la question et répondre.'));
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
      setHighlightedOption(undefined);
    };

    return () => speechCleanupRef.current();
  }, [aiEnabled, authToken, currentQuestion, voiceMascot]);

  useEffect(() => {
    if (!aiEnabled) return;
    if (phase === 'questions') {
      const nextStep = surveySteps[questionIndex + 1];
      if (RECALL_ENABLED && step.id === '8') {
        recallPrepSpeeches.forEach(text => preloadNarration(text, 'fr', voiceMascot, authToken));
        preloadNarration(stageSpeech({ kind: 'opening' }, true), 'fr', voiceMascot, authToken);
      } else if (nextStep) preloadNarration(stepSpeech(nextStep), 'fr', voiceMascot, authToken);
    }
  }, [aiEnabled, authToken, phase, questionIndex, step.id, voiceMascot]);

  useEffect(() => {
    if (phase !== 'intake') setRecallPrepDone(false);
  }, [phase]);

  useEffect(() => {
    if (!prepActive) return;
    const controller = new AbortController();
    const { signal } = controller;
    const music = new Audio('/audio/music/zen.mp3');
    music.loop = true;
    music.volume = 0.3;
    const wait = (ms: number) => new Promise<void>(resolve => {
      const timer = window.setTimeout(resolve, ms);
      signal.addEventListener('abort', () => { window.clearTimeout(timer); resolve(); }, { once: true });
    });
    const say = async (text: string) => {
      const audio = await loadNarration(text, 'fr', voiceMascot, authToken, signal);
      if (signal.aborted) return;
      await new Promise<void>(resolve => {
        signal.addEventListener('abort', () => resolve(), { once: true });
        playBlob(audio, audioRef, resolve, resolve);
      });
    };
    const fadeOut = async () => {
      for (let volume = music.volume; volume > 0.03 && !signal.aborted; volume -= 0.03) {
        music.volume = Math.max(0, volume);
        await wait(100);
      }
      music.pause();
    };
    const run = async () => {
      try {
        await say(recallIntroSpeech);
        if (signal.aborted) return;
        setRecallStep('concentrate');
        void music.play().catch(() => {});
        for (const part of recallConcentrationScript) {
          await say(part.text);
          if (signal.aborted) return;
          if (part.pauseMs) await wait(part.pauseMs);
          if (signal.aborted) return;
        }
        setRecallStep('invite');
        await say(recallInviteSpeech);
        if (signal.aborted) return;
        setRecallStep('waiting');
        setConversationState('listening');
        await wait(RECALL_MUSIC_MS);
        if (signal.aborted) return;
        await fadeOut();
        if (signal.aborted) return;
        setRecallStep('blinking');
      } catch {
        if (signal.aborted) return;
        setRecallStep('blinking');
        setConversationState('listening');
      }
    };
    const stop = () => {
      controller.abort();
      stopAudio(audioRef);
      music.pause();
    };
    recallPrepSpeeches.forEach(text => preloadNarration(text, 'fr', voiceMascot, authToken));
    setRecallStep('intro');
    setConversationState('speaking');
    speechCleanupRef.current = stop;
    void run();
    return stop;
  }, [authToken, prepActive, voiceMascot]);

  // When a choice opens a follow-up text field (for example « Autre »), the mascot says what to specify, once per question.
  const promptSpeech = phase === 'questions' && step.textPrompt?.when?.(selectedOptions) ? step.textPrompt.speech : undefined;
  const spokenPromptRef = useRef('');
  useEffect(() => {
    if (!promptSpeech) {
      spokenPromptRef.current = '';
      return;
    }
    if (!aiEnabled || spokenPromptRef.current === step.id || !['listening', 'ready'].includes(conversationState)) return;
    spokenPromptRef.current = step.id;
    const controller = new AbortController();
    setConversationState('speaking');
    speechCleanupRef.current = () => {
      controller.abort();
      stopAudio(audioRef);
    };
    loadNarration(promptSpeech, 'fr', voiceMascot, authToken, controller.signal)
      .then(audio => playBlob(audio, audioRef, () => setConversationState('listening'), () => setConversationState('listening')))
      .catch(() => { if (!controller.signal.aborted) setConversationState('listening'); });
  }, [aiEnabled, authToken, conversationState, promptSpeech, step.id, voiceMascot]);

  // The mascot thanks the participant once the survey is complete.
  useEffect(() => {
    if (phase !== 'complete' || !aiEnabled) return;
    const controller = new AbortController();
    loadNarration(endThanksSpeech, 'fr', voiceMascot, authToken, controller.signal)
      .then(audio => playBlob(audio, audioRef, () => {}, () => {}))
      .catch(() => {});
    return () => {
      controller.abort();
      stopAudio(audioRef);
    };
  }, [aiEnabled, authToken, phase, voiceMascot]);

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
    setIsLoadingNarration(false);
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
    setPairRows(emptyPairRows());
    setError('');
  };

  const updatePairRow = (index: number, update: Partial<PairRow>) => {
    interruptNarration();
    setRequiresRepeat(false);
    setPairRows(current => current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...update } : row)));
  };

  const makeCurrentAnswer = (typedOverride?: string): RecordedAnswer => {
    const isPairs = phase === 'questions' && step.ui === 'pairs';
    const pairs = isPairs ? answeredPairs(pairRows) : [];
    const typed = isPairs ? pairsText(pairRows) : (typedOverride ?? typedAnswer).trim();
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
    const optionOrder = phase === 'questions' && step.ui !== 'occupations'
      ? Object.fromEntries(step.groups.filter(group => group.shuffle).map(group => [group.id, optionsFor(group)]))
      : {};
    return {
      text: parts.join('\n'), mode, selections, ...(Object.keys(optionOrder).length ? { optionOrder } : {}),
      parentOccupations: answeredParentOccupations, ...(pairs.length ? { pairs } : {}), typed, voice, aiReply: aiTurns.at(-1)?.reply ?? '', aiTurns,
    };
  };

  // The three choices of a ranking question share one order so the same option sits at the same place in each list.
  const optionsFor = (group: PresetGroup) => orderedOptions(group, orderSeed, step.ui === 'ranking' ? step.id : group.id);

  const renderChoices = (group: PresetGroup) => (
    <PresetChoices
      key={group.id}
      name={group.id}
      options={optionsFor(group)}
      values={selectedOptions[group.id] || []}
      multiple={group.multiple}
      exclusiveOption={group.exclusiveOption}
      images={group.images}
      wideImages={group.wideImages}
      maxSelections={group.maxSelections}
      highlighted={highlightedOption}
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

  const renderPairs = () => {
    const [itemLabel, reasonLabel] = step.pairLabels ?? ['', ''];
    return (
      <div style={styles.presetCard}>
        {step.hint && <p style={styles.presetHeading}>{step.hint}</p>}
        <div style={styles.pairRow} aria-hidden="true">
          <strong>{itemLabel}</strong>
          <strong>{reasonLabel}</strong>
        </div>
        {pairRows.map((row, index) => (
          <div key={index} style={styles.pairRow}>
            <input style={styles.textInput} aria-label={`${itemLabel} ${index + 1}`} value={row.item} onChange={event => updatePairRow(index, { item: event.target.value })} />
            <input style={styles.textInput} aria-label={`${reasonLabel} ${index + 1}`} value={row.reason} onChange={event => updatePairRow(index, { reason: event.target.value })} />
          </div>
        ))}
        <button type="button" onClick={() => { interruptNarration(); setPairRows(current => [...current, { item: '', reason: '' }]); }} style={styles.addRowButton}>
          <span aria-hidden="true" style={styles.addRowIcon}>+</span>
          <span>Ajouter</span>
        </button>
      </div>
    );
  };

  // Ranking: the options are touched in order of influence and climb a podium (1st in the middle, 2nd left, 3rd right).
  const podiumColors = ['#f5b400', '#adb5bd', '#c98a4b'];
  const podiumHeights = [78, 54, 38];
  const renderRanking = () => {
    const rankGroups = step.groups;
    const [pictureGroup] = rankGroups;
    const chosen = rankGroups.map(group => selectedOptions[group.id]?.[0] ?? '').filter(Boolean);
    const setRanking = (next: string[]) => {
      interruptNarration();
      setRequiresRepeat(false);
      setSelectedOptions(current => {
        const updated = { ...current };
        rankGroups.forEach((group, index) => { updated[group.id] = next[index] ? [next[index]] : []; });
        return updated;
      });
    };
    const slot = (rankIndex: number) => {
      const option = chosen[rankIndex];
      return (
        <div key={rankIndex} style={styles.podiumSlot}>
          {option ? (
            <button type="button" onClick={() => setRanking(chosen.filter(value => value !== option))} style={styles.podiumPick} aria-label={`Retirer : ${option}`}>
              {pictureGroup.images?.[option] && <img src={pictureGroup.images[option]} alt="" aria-hidden="true" style={styles.podiumImage} />}
              <span style={styles.podiumName}>{option}</span>
            </button>
          ) : <span style={styles.podiumEmpty}>{rankIndex + 1}{rankIndex === 0 ? 'er' : 'e'} choix</span>}
          <div style={{ ...styles.podiumStep, height: podiumHeights[rankIndex], background: podiumColors[rankIndex] }}>{rankIndex + 1}</div>
        </div>
      );
    };
    return (
      <div style={styles.presetCard}>
        {step.hint && <p style={styles.presetHeading}>{step.hint}</p>}
        <div style={styles.podium} role="img" aria-label="Podium des influences">
          {slot(1)}
          {slot(0)}
          {slot(2)}
        </div>
        <PresetChoices
          name="influences"
          options={pictureGroup.options}
          values={chosen}
          multiple
          maxSelections={rankGroups.length}
          images={pictureGroup.images}
          onChange={setRanking}
        />
        {renderTextPrompt()}
      </div>
    );
  };

  const updateIntakeField = (id: IntakeFieldId, value: string | string[]) => {
    interruptNarration();
    setCurrentIntake(current => ({ ...current, fields: { ...current.fields, [id]: value } }));
  };

  const intakeTimeline = () => (
    <DayTimeline
      active={isFirstIntake && !currentIntake.heard.length ? 'early' : daySegmentFor(currentIntake.fields.time ?? intakes.at(-1)?.fields.time)}
      selectable={prepInvited ? 'early' : undefined}
      blinking={prepActive && recallStep === 'blinking' ? 'early' : undefined}
      onSelect={() => setRecallPrepDone(true)}
    />
  );

  const intakeGuide = (highlightMissing: boolean) => (
    <>
      {intakeTimeline()}
      <IntakeChecklist fields={currentIntake.fields} skipped={currentIntake.skipped} highlightMissing={highlightMissing} />
    </>
  );

  // The form is its own checklist: every field carries its icon and the validated question.
  const renderIntakeForm = () => (
    <>
      {intakeTimeline()}
      <div style={styles.presetCard}>
        <p style={styles.presetHeading}>Décris cette prise alimentaire.</p>
        {intakeFields.map(field => {
          const value = currentIntake.fields[field.id];
          if (field.kind === 'text') {
            return (
              <label key={field.id} style={styles.fieldLabel}>{field.icon} {field.question}
                <input style={styles.textInput} value={typeof value === 'string' ? value : ''} onChange={event => updateIntakeField(field.id, event.target.value)} />
              </label>
            );
          }
          const values = Array.isArray(value) ? value : (value ? [value] : []);
          return (
            <div key={field.id} style={styles.fieldLabel}>
              <span>{field.icon} {field.question}</span>
              <PresetChoices name={`intake-${field.id}`} options={field.options ?? []} values={values} multiple={field.kind === 'multi'} onChange={chosen => updateIntakeField(field.id, field.kind === 'multi' ? chosen : (chosen[0] ?? ''))} />
            </div>
          );
        })}
      </div>
    </>
  );

  const renderIntakeAssistant = () => (
    <>
      {intakeGuide(intakeStage.kind === 'missing')}
      {intakeStage.kind === 'opening' && <button type="button" onClick={() => handleNoMoreIntakes()} disabled={busy} style={styles.shortcutButton}>{isFirstIntake ? 'Je n’ai rien mangé ni bu' : 'Je n’ai plus rien mangé ni bu jusqu’au coucher'}</button>}
      {intakeStage.kind === 'missing' && <button type="button" onClick={() => handleNothingMore()} disabled={busy} style={styles.shortcutButton}>Rien d’autre à ajouter</button>}
    </>
  );

  const renderPresetAnswers = () => {
    if (phase === 'intake') return aiEnabled ? renderIntakeAssistant() : renderIntakeForm();
    if (phase !== 'questions') return null;
    if (step.ui === 'occupations') return renderOccupations();
    if (step.ui === 'pairs') return renderPairs();
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
    || (phase === 'questions' && step.ui === 'pairs' && answeredPairs(pairRows).length > 0)
  );
  if (phase === 'intake') {
    if (!aiEnabled) hasCurrentAnswer = intakeHasContent(currentIntake);
    else hasCurrentAnswer = Boolean(typedAnswer.trim());
  }
  const busy = conversationState === 'saving' || conversationState === 'thinking' || conversationState === 'recording';
  const presetAnswers = renderPresetAnswers();
  const showTypedAnswer = (phase === 'intake' && aiEnabled) || (phase === 'questions' && step.ui === 'text');
  const hasReplied = hasCurrentAnswer && !requiresRepeat;
  let micLabel = hasCurrentAnswer && phase === 'questions' ? 'Compléter ou corriger' : 'Répondre';
  if (conversationState === 'recording') micLabel = 'Terminer l’enregistrement';
  if (isSendingVoice) micLabel = 'Envoi de la voix…';

  // Replies the server did not synthesise are played from a recorded or pre-generated clip (or synthesised once and kept).
  const playReply = (reply: string, audioData: string | undefined, onEnded: () => void, onError: () => void) => {
    if (audioData) {
      playBase64Audio(audioData, audioRef, onEnded, onError);
      return;
    }
    const controller = new AbortController();
    speechCleanupRef.current = () => {
      controller.abort();
      stopAudio(audioRef);
    };
    loadNarration(reply, 'fr', voiceMascot, authToken, controller.signal)
      .then(blob => { if (!controller.signal.aborted) playBlob(blob, audioRef, onEnded, onError); })
      .catch(() => { if (!controller.signal.aborted) onError(); });
  };

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
        followUps: step.followUps,
        residence: step.residence,
      }));
    }
    // Fixed replies are played from recorded or pre-generated clips, so the server does not synthesise them.
    formData.append('replyAudio', 'client');
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
      if (!nextTranscript || !nextReply) throw new Error('Incomplete AI response');
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
      playReply(nextReply, response.data.audio, () => setConversationState(expectsMore ? 'listening' : 'ready'), () => {
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

  const pushHistory = () => setHistory(current => [...current, { phase, questionIndex, selectedOptions, parentOccupations, pairRows, typedAnswer, transcript, intakes, currentIntake, intakeStage, aiTurns }]);

  const finishIntakes = (finished: IntakeEntry[]) => {
    clearCurrentAnswer();
    setIntakeHeard('');
    setIntakes(finished);
    setCurrentIntake(emptyIntake());
    setIntakeStage({ kind: 'opening' });
    setPhase('questions');
    setQuestionIndex(stepIndexById.get('10') ?? 0);
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
    formData.append('replyAudio', 'client');
    formData.append('payload', JSON.stringify({ stage: intakeStage.kind, record: currentIntake.fields, fields: intakeFields }));
    setConversationState('thinking');
    setError('');

    try {
      const response = await api.post('/api/ai/intake', formData, { headers: { Authorization: `Bearer ${authToken}` }, timeout: 60000 });
      const result = response.data as IntakeExtraction & { reply?: string; audio?: string };
      setIntakeHeard(result.transcript);
      const { entry, outcome } = applyExtraction(currentIntake, intakeStage, result);
      if (outcome === 'clarify' && result.reply) {
        setAiReply(result.reply);
        setCurrentIntake(entry);
        setConversationState('speaking');
        playReply(result.reply, result.audio, () => setConversationState('listening'), () => setConversationState('listening'));
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
    const text = typedAnswer.trim();
    if (text) void sendIntake(null, text);
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
      : phase === 'questions' && step.ui === 'pairs' ? pairsText(pairRows).split('\n').filter(Boolean) : [];
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
    setPairRows(entry.pairRows);
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
      setHighlightedOption(undefined);
    };
    const repeatFailure = 'Impossible de relire la question. Tu peux quand même répondre.';
    setError('');
    setConversationState('speaking');
    setIsLoadingNarration(true);
    try {
      const audio = await loadNarration(currentQuestion, 'fr', voiceMascot, authToken, controller.signal);
      if (controller.signal.aborted) return;
      setIsLoadingNarration(false);
      const afterQuestion = () => {
        if (optionsToRead.length === 0) {
          setConversationState('listening');
          return;
        }
        void readOptionsAloud(optionsToRead, controller.signal).then(finished => {
          if (finished) setConversationState('listening');
        });
      };
      playBlob(audio, audioRef, afterQuestion, () => {
        setError(repeatFailure);
        setConversationState('listening');
      });
    } catch (caught) {
      if (controller.signal.aborted) return;
      setIsLoadingNarration(false);
      setError(speechFailureMessage(caught, repeatFailure));
      setConversationState('listening');
    }
  };

  let questionLabel = 'Questionnaire terminé';
  let kicker = 'Rappel de la journée d’hier';
  if (phase === 'questions') {
    questionLabel = `Question ${shownNumber(step.number)} sur ${displayTotal}`;
    kicker = `Question ${shownLabel(step.label)}`;
  } else if (phase === 'intake') {
    questionLabel = `Question ${shownNumber(INTAKE_QUESTION_NUMBER)} sur ${displayTotal} · prise ${intakes.length + 1}`;
    kicker = `Question ${shownNumber(INTAKE_QUESTION_NUMBER)} · Rappel de la journée d’hier`;
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
        <main style={styles.completePanel}><img src="/images/end/thanks.svg" alt="" aria-hidden="true" style={styles.completeBanner} /><img src={mascotByState[voiceMascot].complete} alt="Mascotte" style={styles.completeMascot} /><h2 style={styles.completeTitle}>{endThanksSpeech}</h2>{offlineNotice && <p style={styles.errorMessage}>Pas de connexion : tes réponses sont enregistrées sur cet appareil et seront envoyées automatiquement dès que la connexion revient.</p>}<button type="button" onClick={onBack} style={styles.primaryButton}>Retour à l’accueil</button></main>
      </div>
    );
  }

  const nextDisabled = !hasCurrentAnswer || requiresRepeat || !['speaking', 'ready', 'listening'].includes(conversationState);

  let intros: string[] = [];
  if (phase === 'questions') intros = step.intro ? [step.intro] : [];
  else if (phase === 'intake') intros = prepActive ? recallIntroParagraphs : stageIntros(intakeStage, isFirstIntake, aiEnabled);

  return (
    <SurveyPageLayout title="Questionnaire OR-ALIM" progressLabel={questionLabel} isVoice={aiEnabled} onBack={onBack}>
        {aiEnabled && <MascotPanel mascot={voiceMascot} state={conversationState} />}
        <QuestionCard
          kicker={kicker}
          intros={intros}
          question={phase === 'questions' ? step.text : (prepActive ? (prepInvited ? recallInviteSpeech : '') : stageQuestion(intakeStage, isFirstIntake))}
          image={phase === 'questions' ? step.image : undefined}
          repeatLabel={isLoadingNarration ? 'Préparation de la lecture…' : '🔊 Réécouter la question'}
          repeatDisabled={isLoadingNarration}
          onRepeat={aiEnabled && !prepActive ? () => void handleRepeatQuestion() : undefined}
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
  shortcutButton: { marginTop: '0.6rem', minHeight: 44, padding: '0.55rem 0.8rem', border: '1px solid #8b6e15', borderRadius: 8, background: '#fff4cc', color: '#332d1c', fontWeight: 700, cursor: 'pointer' },
  parentOccupation: { display: 'grid', gridTemplateColumns: 'minmax(115px, 0.6fr) minmax(130px, 1fr)', alignItems: 'center', gap: '0.5rem' },
  pairRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem', fontSize: '0.85rem', color: '#765800' },
  addRowButton: { alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.6rem', minHeight: 44, padding: '0 0.9rem', border: '1px solid #8b6e15', borderRadius: 8, background: '#fff4cc', color: '#332d1c', font: 'inherit', fontWeight: 800, cursor: 'pointer' },
  addRowIcon: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, fontSize: '1.4rem', lineHeight: 1 },
  fieldLabel: { display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.9rem', fontWeight: 700 },
  textInput: { width: '100%', minHeight: 40, padding: '0.5rem 0.6rem', boxSizing: 'border-box', border: '1px solid #c8b879', borderRadius: 6, background: '#fff', color: '#332d1c', font: 'inherit' },
  typedAnswer: { display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.75rem', color: '#765800', fontSize: '0.85rem', fontWeight: 700 },
  answerInput: { width: '100%', minHeight: 68, padding: '0.6rem 0.7rem', boxSizing: 'border-box', border: '1px solid #c8b879', borderRadius: 7, resize: 'vertical', font: 'inherit', fontWeight: 400 },
  skipButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', minHeight: 44, padding: '0.55rem 0.7rem', border: '1px solid #8b6e15', borderRadius: 8, background: '#fff4cc', color: '#332d1c', fontWeight: 700, cursor: 'pointer' },
  completePanel: { width: '100%', maxWidth: 560, margin: '0 auto', padding: '2rem 1rem', boxSizing: 'border-box', textAlign: 'center' },
  completeBanner: { width: '100%', maxWidth: 320, height: 'auto' },
  completeMascot: { width: 160, height: 160, objectFit: 'contain' },
  completeTitle: { fontSize: '1.35rem', lineHeight: 1.4 },
  primaryButton: { marginTop: '1rem', padding: '0.8rem 1.2rem', border: 0, borderRadius: 8, background: '#332d1c', color: '#fff', fontWeight: 800, cursor: 'pointer' },
};

export default VoiceSurveyPage;
