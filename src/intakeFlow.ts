import {
  intakeFields,
  intakeFormIntroParagraphs,
  intakeIntroParagraphs,
  intakeMissingPrompt,
  intakeOpeningFirst,
  intakeOpeningFirstSpeech,
  intakeOpeningNext,
} from './surveyConfig';
import type { IntakeFieldId, IntakeRecord } from './surveyConfig';

export interface IntakeTurn {
  stage: IntakeStage['kind'];
  transcript: string;
  reply: string;
  updates: IntakeRecord;
  at: string;
}

export interface IntakeEntry {
  fields: IntakeRecord;
  skipped: IntakeFieldId[];
  missingAsked: boolean;
  heard: string[];
  turns: IntakeTurn[];
}

// 'opening' collects everything the respondent says in one go; 'missing' asks once for what is still missing.
export type IntakeStage = { kind: 'opening' } | { kind: 'missing' };

export interface IntakeExtraction {
  transcript: string;
  reply?: string;
  updates: IntakeRecord;
  nothingMore?: boolean;
  endOfDay?: boolean;
  needsClarification?: boolean;
}

export type IntakeOutcome = IntakeStage | 'complete' | 'endOfDay' | 'clarify';

export const emptyIntake = (): IntakeEntry => ({ fields: {}, skipped: [], missingAsked: false, heard: [], turns: [] });

const hasValue = (value: string | string[] | undefined) => (Array.isArray(value) ? value.length > 0 : Boolean(value?.trim()));

export const isFieldFilled = (entry: IntakeEntry, id: IntakeFieldId) => hasValue(entry.fields[id]) || entry.skipped.includes(id);

export const missingFields = (entry: IntakeEntry) => intakeFields.filter(field => !isFieldFilled(entry, field.id));

export const stageQuestion = (stage: IntakeStage, isFirstIntake: boolean) => {
  if (stage.kind === 'missing') return intakeMissingPrompt;
  return isFirstIntake ? intakeOpeningFirst : intakeOpeningNext;
};

export const stageSpeech = (stage: IntakeStage, isFirstIntake: boolean) => (
  stage.kind === 'opening' && isFirstIntake ? intakeOpeningFirstSpeech : stageQuestion(stage, isFirstIntake)
);

export const stageIntros = (stage: IntakeStage, isFirstIntake: boolean, assistant = true) => {
  if (stage.kind !== 'opening' || !isFirstIntake) return [];
  return assistant ? [intakeIntroParagraphs[1]] : intakeFormIntroParagraphs;
};

const completeWithoutMissing = (entry: IntakeEntry): IntakeEntry => ({
  ...entry,
  missingAsked: true,
  skipped: [...new Set([...entry.skipped, ...missingFields(entry).map(field => field.id)])],
});

export const applyExtraction = (entry: IntakeEntry, stage: IntakeStage, result: IntakeExtraction): { entry: IntakeEntry; outcome: IntakeOutcome } => {
  const next: IntakeEntry = {
    ...entry,
    fields: { ...entry.fields, ...result.updates },
    skipped: [...entry.skipped],
    heard: result.transcript ? [...entry.heard, result.transcript] : entry.heard,
    turns: result.transcript || result.reply
      ? [...entry.turns, { stage: stage.kind, transcript: result.transcript, reply: result.reply ?? '', updates: result.updates, at: new Date().toISOString() }]
      : entry.turns,
  };

  if (stage.kind === 'opening' && result.endOfDay) return { entry: next, outcome: 'endOfDay' };
  if (result.needsClarification) return { entry: next, outcome: 'clarify' };

  // The missing items are asked once: whatever is still missing afterwards is recorded as not given.
  if (stage.kind === 'missing') return { entry: completeWithoutMissing(next), outcome: 'complete' };
  if (missingFields(next).length > 0) return { entry: next, outcome: { kind: 'missing' } };
  return { entry: next, outcome: 'complete' };
};

export const skipStage = (entry: IntakeEntry, stage: IntakeStage): { entry: IntakeEntry; outcome: IntakeOutcome } => {
  if (stage.kind === 'opening') return { entry, outcome: 'endOfDay' };
  return { entry: completeWithoutMissing(entry), outcome: 'complete' };
};

export const intakeSummary = (entry: IntakeEntry) => intakeFields
  .map(field => {
    const value = entry.fields[field.id];
    return { id: field.id, label: field.label, value: Array.isArray(value) ? value.join(', ') : (value ?? '').trim() };
  })
  .filter(line => line.value);

export const intakeText = (entry: IntakeEntry) => intakeSummary(entry).map(line => `${line.label}: ${line.value}`).join('\n');

export const intakeHasContent = (entry: IntakeEntry) => hasValue(entry.fields.solids) || hasValue(entry.fields.drinks);
