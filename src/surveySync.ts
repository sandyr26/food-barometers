import { api } from './api';

type Mascot = 'boy' | 'girl' | 'none';
type Row = Record<string, unknown>;

interface PendingSurvey {
  clientId: string;
  surveyId?: string;
  selectedMascot: Mascot;
  rev: number;
  questions: Record<string, Row>;
  dirtyQuestions: Record<string, number>;
  yesterdayIntakes?: Row[];
  currentIntake?: Row | null;
  intakesRev: number;
  complete: boolean;
  completeRev: number;
  completeSent: boolean;
}

export interface SurveyPatch {
  questions?: Row[];
  yesterdayIntakes?: Row[];
  currentIntake?: Row | null;
  complete?: boolean;
}

export interface SyncStatus {
  pending: boolean;
  failed: boolean;
}

const STORAGE_KEY = 'fb.surveyQueue';
const listeners = new Set<(status: SyncStatus) => void>();
let activeClientId: string | null = null;
let flushing: Promise<boolean> | null = null;
let retryTimer: ReturnType<typeof setTimeout> | undefined;
let attempts = 0;
let failed = false;
let initialised = false;

const getToken = () => localStorage.getItem('authToken');

const readQueue = (): PendingSurvey[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeQueue = (queue: PendingSurvey[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));

const isClean = (survey: PendingSurvey) => Object.keys(survey.dirtyQuestions).length === 0 && !survey.intakesRev && (!survey.complete || survey.completeSent);

const notify = () => {
  const status = { pending: readQueue().some(survey => !isClean(survey)), failed };
  listeners.forEach(listener => listener(status));
};

const newId = () => (typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`);

const scheduleRetry = () => {
  attempts += 1;
  clearTimeout(retryTimer);
  retryTimer = setTimeout(() => void flushSurveys(), Math.min(60000, 2000 * 2 ** attempts));
};

const runFlush = async (): Promise<boolean> => {
  try {
    for (;;) {
      const token = getToken();
      if (!token) throw new Error('No token');
      const headers = { Authorization: `Bearer ${token}` };
      const survey = readQueue().find(item => !isClean(item));
      if (!survey) {
        failed = false;
        attempts = 0;
        clearTimeout(retryTimer);
        notify();
        return true;
      }

      if (!survey.surveyId) {
        const started = await api.post('/api/surveys/start', { consentGiven: true, selectedMascot: survey.selectedMascot, clientId: survey.clientId }, { headers, timeout: 20000 });
        const queue = readQueue();
        const stored = queue.find(item => item.clientId === survey.clientId);
        if (stored) {
          stored.surveyId = started.data.id as string;
          writeQueue(queue);
        }
        survey.surveyId = started.data.id as string;
      }

      const sentQuestions = { ...survey.dirtyQuestions };
      const payload: Row = { questions: Object.keys(sentQuestions).map(id => survey.questions[id]) };
      const sentIntakesRev = survey.intakesRev;
      if (sentIntakesRev) {
        if (survey.yesterdayIntakes) payload.yesterdayIntakes = survey.yesterdayIntakes;
        if (survey.currentIntake !== undefined) payload.currentIntake = survey.currentIntake;
      }
      const sentCompleteRev = survey.complete && !survey.completeSent ? survey.completeRev : 0;
      if (sentCompleteRev) payload.complete = true;
      if ((payload.questions as Row[]).length === 0) delete payload.questions;

      await api.put(`/api/surveys/${survey.surveyId}/answers`, payload, { headers, timeout: 20000 });

      const queue = readQueue();
      const stored = queue.find(item => item.clientId === survey.clientId);
      if (stored) {
        for (const [id, rev] of Object.entries(sentQuestions)) if (stored.dirtyQuestions[id] === rev) delete stored.dirtyQuestions[id];
        if (sentIntakesRev && stored.intakesRev === sentIntakesRev) stored.intakesRev = 0;
        if (sentCompleteRev && stored.completeRev === sentCompleteRev) stored.completeSent = true;
      }
      writeQueue(queue.filter(item => !(isClean(item) && (item.completeSent || item.clientId !== activeClientId))));
      notify();
    }
  } catch {
    failed = true;
    scheduleRetry();
    notify();
    return false;
  }
};

export const flushSurveys = (): Promise<boolean> => {
  flushing ??= runFlush().finally(() => {
    flushing = null;
    if (!failed && readQueue().some(survey => !isClean(survey))) void flushSurveys();
  });
  return flushing;
};

export const initSurveySync = () => {
  if (initialised) return;
  initialised = true;
  window.addEventListener('online', () => void flushSurveys());
  void flushSurveys();
};

export const beginSurvey = (selectedMascot: Mascot) => {
  const queue = readQueue();
  const survey: PendingSurvey = {
    clientId: newId(), selectedMascot, rev: 0, questions: {}, dirtyQuestions: {}, intakesRev: 0, complete: false, completeRev: 0, completeSent: false,
  };
  queue.push(survey);
  writeQueue(queue);
  activeClientId = survey.clientId;
};

export const recordSurvey = (patch: SurveyPatch) => {
  const queue = readQueue();
  const survey = queue.find(item => item.clientId === activeClientId);
  if (!survey) return;
  survey.rev += 1;
  for (const question of patch.questions ?? []) {
    const id = String(question.id);
    survey.questions[id] = question;
    survey.dirtyQuestions[id] = survey.rev;
  }
  if (patch.yesterdayIntakes) survey.yesterdayIntakes = patch.yesterdayIntakes;
  if (patch.currentIntake !== undefined) survey.currentIntake = patch.currentIntake;
  if (patch.yesterdayIntakes || patch.currentIntake !== undefined) survey.intakesRev = survey.rev;
  if (patch.complete) {
    survey.complete = true;
    survey.completeRev = survey.rev;
  }
  writeQueue(queue);
  notify();
  void flushSurveys();
};

export const subscribeSurveySync = (listener: (status: SyncStatus) => void) => {
  listeners.add(listener);
  listener({ pending: readQueue().some(survey => !isClean(survey)), failed });
  return () => { listeners.delete(listener); };
};
