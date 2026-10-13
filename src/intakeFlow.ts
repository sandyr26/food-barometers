import {
  intakeEndCheck,
  intakeFields,
  intakeIntro,
  intakeOpeningFirst,
  intakeOpeningNext,
  intakeSolidsMore,
  intakeTimeFallback,
} from './surveyConfig';
import type { IntakeFieldId, IntakeRecord } from './surveyConfig';

export interface IntakeTurn {
  stage: IntakeStage['kind'];
  transcript: string;
  reply: string;
  updates: IntakeRecord;
  additions?: { solids?: string; drinks?: string };
  at: string;
}

export interface IntakeEntry {
  fields: IntakeRecord;
  skipped: IntakeFieldId[];
  solidsMoreDone: boolean;
  endCheckDone: boolean;
  heard: string[];
  turns: IntakeTurn[];
}

export type IntakeStage =
  | { kind: 'opening' }
  | { kind: 'field'; field: IntakeFieldId }
  | { kind: 'timeFallback' }
  | { kind: 'solidsMore' }
  | { kind: 'endCheck' };

export interface IntakeExtraction {
  transcript: string;
  reply?: string;
  updates: IntakeRecord;
  additions?: { solids?: string; drinks?: string };
  cannotSayTime?: boolean;
  nothingMore?: boolean;
  endOfDay?: boolean;
  needsClarification?: boolean;
}

export type IntakeOutcome = IntakeStage | 'complete' | 'endOfDay' | 'clarify';

export const emptyIntake = (): IntakeEntry => ({ fields: {}, skipped: [], solidsMoreDone: false, endCheckDone: false, heard: [], turns: [] });

const hasValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value.length > 0 : Boolean(value?.trim()));

export const isFieldFilled = (entry: IntakeEntry, id: IntakeFieldId) => hasValue(entry.fields[id]) || entry.skipped.includes(id);

export const nextStageFor = (entry: IntakeEntry): IntakeStage | 'complete' => {
  const missing = intakeFields.find(field => !isFieldFilled(entry, field.id));
  if (missing) return { kind: 'field', field: missing.id };
  if (!entry.endCheckDone) return { kind: 'endCheck' };
  return 'complete';
};

export const stageTargetField = (stage: IntakeStage): IntakeFieldId | undefined => {
  if (stage.kind === 'field') return stage.field;
  if (stage.kind === 'timeFallback') return 'time';
  return undefined;
};

export const stageQuestion = (stage: IntakeStage, isFirstIntake: boolean) => {
  if (stage.kind === 'opening') return isFirstIntake ? intakeOpeningFirst : intakeOpeningNext;
  if (stage.kind === 'timeFallback') return intakeTimeFallback;
  if (stage.kind === 'solidsMore') return intakeSolidsMore;
  if (stage.kind === 'endCheck') return intakeEndCheck;
  return intakeFields.find(field => field.id === stage.field)?.question ?? '';
};

export const stageSpeech = (stage: IntakeStage, isFirstIntake: boolean) => {
  const question = stageQuestion(stage, isFirstIntake);
  return stage.kind === 'opening' && isFirstIntake ? `${intakeIntro} ${question}` : question;
};

export const stageIntro = (stage: IntakeStage, isFirstIntake: boolean) => (stage.kind === 'opening' && isFirstIntake ? intakeIntro : '');

const joinText = (existing: string | string[] | undefined, extra: string) => [typeof existing === 'string' ? existing.trim() : '', extra.trim()].filter(Boolean).join(', ');

export const applyExtraction = (entry: IntakeEntry, stage: IntakeStage, result: IntakeExtraction): { entry: IntakeEntry; outcome: IntakeOutcome } => {
  const next: IntakeEntry = {
    ...entry,
    fields: { ...entry.fields, ...result.updates },
    skipped: [...entry.skipped],
    heard: result.transcript ? [...entry.heard, result.transcript] : entry.heard,
    turns: result.transcript || result.reply
      ? [...entry.turns, { stage: stage.kind, transcript: result.transcript, reply: result.reply ?? '', updates: result.updates, additions: result.additions, at: new Date().toISOString() }]
      : entry.turns,
  };

  if (stage.kind === 'opening' && result.endOfDay) return { entry: next, outcome: 'endOfDay' };

  if (result.additions?.solids) next.fields.solids = joinText(next.fields.solids, result.additions.solids);
  if (result.additions?.drinks) next.fields.drinks = joinText(next.fields.drinks, result.additions.drinks);

  if (result.needsClarification) return { entry: next, outcome: 'clarify' };

  if (stage.kind === 'solidsMore') next.solidsMoreDone = true;
  if (stage.kind === 'endCheck') next.endCheckDone = true;

  if (stage.kind === 'field' && stage.field === 'time' && result.cannotSayTime && !isFieldFilled(next, 'time')) {
    return { entry: next, outcome: { kind: 'timeFallback' } };
  }
  if (stage.kind === 'field' && stage.field === 'solids' && hasValue(next.fields.solids) && !next.solidsMoreDone) {
    return { entry: next, outcome: { kind: 'solidsMore' } };
  }
  return { entry: next, outcome: nextStageFor(next) };
};

export const skipStage = (entry: IntakeEntry, stage: IntakeStage): { entry: IntakeEntry; outcome: IntakeOutcome } => {
  const next: IntakeEntry = { ...entry, fields: { ...entry.fields }, skipped: [...entry.skipped] };
  const target = stageTargetField(stage);
  if (target && !next.skipped.includes(target)) next.skipped.push(target);
  if (stage.kind === 'solidsMore') next.solidsMoreDone = true;
  if (stage.kind === 'endCheck') next.endCheckDone = true;
  return { entry: next, outcome: nextStageFor(next) };
};

export const intakeSummary = (entry: IntakeEntry) => intakeFields
  .map(field => {
    const value = entry.fields[field.id];
    return { id: field.id, label: field.label, value: Array.isArray(value) ? value.join(', ') : (value ?? '').trim() };
  })
  .filter(line => line.value);

export const intakeText = (entry: IntakeEntry) => intakeSummary(entry).map(line => `${line.label}: ${line.value}`).join('\n');

export const intakeHasContent = (entry: IntakeEntry) => hasValue(entry.fields.solids) || hasValue(entry.fields.drinks);
