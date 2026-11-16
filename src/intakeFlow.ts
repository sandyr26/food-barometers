import {
  companionshipAccompanied,
  intakeFields,
  intakeFlowSpeech,
  intakeFormIntroParagraphs,
  intakePhaseNext,
  intakePhaseOpening,
} from './surveyConfig';
import type { IntakeFieldId, IntakeRecord } from './surveyConfig';
import type { DaySegmentKey } from './daySegment';

export type FoodFieldId = 'solids' | 'drinks';
export type FoodDetails = Partial<Record<FoodFieldId, string>>;

export interface IntakeTurn {
  stage: IntakeStage['kind'];
  transcript: string;
  reply: string;
  updates: IntakeRecord;
  at: string;
}

export interface IntakeEntry {
  fields: IntakeRecord;
  // Fields the participant could not or did not want to give.
  skipped: IntakeFieldId[];
  // Fields that are finished: answered and, for foods and drinks, precise enough.
  settled: IntakeFieldId[];
  // The precision still expected about foods or drinks, and how many times it was asked.
  details: FoodDetails;
  detailRounds: Partial<Record<FoodFieldId, number>>;
  heard: string[];
  turns: IntakeTurn[];
  // Part of the day the occasion was recorded in.
  phase?: DaySegmentKey;
}

// 'opening' collects whatever the respondent says first; 'field' asks for one field; 'detail' asks for a precision about foods or drinks.
export type IntakeStage = { kind: 'opening' } | { kind: 'field'; field: IntakeFieldId } | { kind: 'detail'; field: FoodFieldId };

export interface IntakeExtraction {
  transcript: string;
  reply?: string;
  updates: IntakeRecord;
  nothingMore?: boolean;
  nothingInPhase?: boolean;
  needsClarification?: boolean;
  cannotSayTime?: boolean;
  declined?: boolean;
  details?: FoodDetails;
}

// 'nothing' is nothing eaten or drunk in this part of the day; 'endOfDay' ends the whole recall.
export type IntakeOutcome = 'continue' | 'complete' | 'nothing' | 'endOfDay' | 'clarify';

// Foods and drinks come first and must be precise; the other details are then asked one at a time.
export const intakeFlow: IntakeFieldId[] = ['solids', 'drinks', 'time', 'name', 'place', 'companionship', 'companions', 'activities'];

export const emptyIntake = (): IntakeEntry => ({ fields: {}, skipped: [], settled: [], details: {}, detailRounds: {}, heard: [], turns: [] });

const hasValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value.length > 0 : Boolean(value?.trim()));

export const isFoodField = (id: IntakeFieldId): id is FoodFieldId => id === 'solids' || id === 'drinks';

// Only someone who was with other people has anybody to name.
const isNeeded = (entry: IntakeEntry, id: IntakeFieldId) => id !== 'companions' || entry.fields.companionship === companionshipAccompanied;
const isDone = (entry: IntakeEntry, id: IntakeFieldId) => entry.settled.includes(id) || entry.skipped.includes(id);

export const pendingField = (entry: IntakeEntry) => intakeFlow.find(id => isNeeded(entry, id) && !isDone(entry, id));

// The fields shown so far: the finished ones and the one being asked. Foods and drinks are always shown together.
export const visibleFields = (entry: IntakeEntry) => {
  const needed = intakeFlow.filter(id => isNeeded(entry, id));
  const pending = pendingField(entry);
  return pending ? needed.slice(0, Math.max(needed.indexOf(pending), needed.indexOf('drinks')) + 1) : needed;
};

// The fields that can be answered right now: the foods and drinks not yet finished, otherwise the one being asked.
export const answerableFields = (entry: IntakeEntry): IntakeFieldId[] => {
  const pending = pendingField(entry);
  if (!pending) return [];
  return isFoodField(pending) ? (['solids', 'drinks'] as FoodFieldId[]).filter(id => !isDone(entry, id)) : [pending];
};

const isUntouched = (entry: IntakeEntry) => entry.heard.length === 0 && entry.settled.length === 0 && entry.skipped.length === 0 && Object.keys(entry.fields).length === 0;

// The stage of an answer given for one field: a precision when one is expected for it, otherwise the question of the field.
export const stageForField = (entry: IntakeEntry, field: IntakeFieldId): IntakeStage => (
  isFoodField(field) && entry.details[field] ? { kind: 'detail', field } : { kind: 'field', field }
);

export const intakeStageOf = (entry: IntakeEntry): IntakeStage => {
  const field = pendingField(entry);
  return !field || isUntouched(entry) ? { kind: 'opening' } : stageForField(entry, field);
};

export const stageQuestion = (entry: IntakeEntry, firstInPhase: boolean, phase: DaySegmentKey = 'early') => {
  const stage = intakeStageOf(entry);
  if (stage.kind === 'opening') return (firstInPhase ? intakePhaseOpening : intakePhaseNext)[phase];
  if (stage.kind === 'detail') return entry.details[stage.field] ?? '';
  return intakeFlowSpeech[stage.field];
};

export const stageSpeech = stageQuestion;

export const stageIntros = (entry: IntakeEntry, isFirstIntake: boolean, assistant = true) => {
  if (intakeStageOf(entry).kind !== 'opening' || !isFirstIntake) return [];
  return assistant ? [] : intakeFormIntroParagraphs;
};

export const withField = (entry: IntakeEntry, id: IntakeFieldId, value: string | string[]): IntakeEntry => ({ ...entry, fields: { ...entry.fields, [id]: value } });

export const settleField = (entry: IntakeEntry, id: IntakeFieldId): IntakeEntry => ({ ...entry, settled: [...new Set([...entry.settled, id])] });

const withoutDetail = (details: FoodDetails, id: IntakeFieldId): FoodDetails => Object.fromEntries(Object.entries(details).filter(([key]) => key !== id));

export const applyExtraction = (entry: IntakeEntry, stage: IntakeStage, result: IntakeExtraction): { entry: IntakeEntry; outcome: IntakeOutcome } => {
  let next: IntakeEntry = {
    ...entry,
    fields: { ...entry.fields, ...result.updates },
    skipped: [...entry.skipped],
    settled: [...entry.settled],
    details: { ...entry.details },
    detailRounds: { ...entry.detailRounds },
    heard: result.transcript ? [...entry.heard, result.transcript] : entry.heard,
    turns: result.transcript || result.reply
      ? [...entry.turns, { stage: stage.kind, transcript: result.transcript, reply: result.reply ?? '', updates: result.updates, at: new Date().toISOString() }]
      : entry.turns,
  };

  if (stage.kind === 'opening' && result.nothingInPhase) return { entry: next, outcome: 'nothing' };

  const given = (Object.keys(result.updates) as IntakeFieldId[]).filter(id => hasValue(result.updates[id]));
  // Everything the participant stated is finished, except the foods and drinks that are checked for precision.
  for (const id of given.filter(field => !isFoodField(field))) next = settleField(next, id);

  if (result.needsClarification) return { entry: next, outcome: 'clarify' };

  const checked = stage.kind === 'detail' ? [stage.field] : given.filter(isFoodField);
  for (const id of checked) {
    const question = result.details?.[id];
    if (question) {
      next = {
        ...next,
        settled: next.settled.filter(settled => settled !== id),
        details: { ...next.details, [id]: question },
        detailRounds: { ...next.detailRounds, [id]: (next.detailRounds[id] ?? 0) + 1 },
      };
    } else {
      next = { ...next, details: withoutDetail(next.details, id) };
      if (hasValue(next.fields[id])) next = settleField(next, id);
    }
  }

  // « Je ne sais pas » to the question about a field: it is recorded as not given.
  if (stage.kind === 'field' && !isDone(next, stage.field) && (result.declined || (stage.field === 'time' && result.cannotSayTime))) {
    next = { ...next, skipped: [...next.skipped, stage.field] };
  }

  return { entry: next, outcome: pendingField(next) ? 'continue' : 'complete' };
};

// The field being asked is left as it is when it has a value (a precision is then no longer expected), otherwise recorded as not given.
export const skipPending = (entry: IntakeEntry): IntakeEntry => {
  const id = pendingField(entry);
  if (!id) return entry;
  const next = { ...entry, details: withoutDetail(entry.details, id) };
  return hasValue(entry.fields[id]) ? settleField(next, id) : { ...next, skipped: [...next.skipped, id] };
};

// The occasion is kept as it is: whatever is still to be asked is recorded as not given.
export const completeEarly = (entry: IntakeEntry): IntakeEntry => {
  let next = entry;
  for (let id = pendingField(next); id; id = pendingField(next)) next = skipPending(next);
  return next;
};

export const intakeSummary = (entry: IntakeEntry) => intakeFields
  .map(field => {
    const value = entry.fields[field.id];
    return { id: field.id, label: field.label, value: Array.isArray(value) ? value.join(', ') : (value ?? '').trim() };
  })
  .filter(line => line.value);

export const intakeText = (entry: IntakeEntry) => intakeSummary(entry).map(line => `${line.label}: ${line.value}`).join('\n');

export const intakeHasContent = (entry: IntakeEntry) => hasValue(entry.fields.solids) || hasValue(entry.fields.drinks);
