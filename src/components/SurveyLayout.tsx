import React from 'react';
import { FaCircleArrowRight } from 'react-icons/fa6';
import BackButton from './BackButton';
import { ICON_SIZE, surveyStyles } from '../surveyStyles';
import { conversationStateLabel, mascotByState } from '../voiceMascot';
import type { ConversationState } from '../voiceMascot';
import type { Mascot } from '../surveyConfig';

interface SurveyPageLayoutProps {
  title: string;
  progressLabel: string;
  isVoice: boolean;
  onBack: () => void;
  children: React.ReactNode;
}

export const SurveyPageLayout: React.FC<SurveyPageLayoutProps> = ({ title, progressLabel, isVoice, onBack, children }) => (
  <div style={surveyStyles.page}>
    <header style={surveyStyles.header}><BackButton onClick={onBack} /><h1 style={surveyStyles.title}>{title}</h1><div style={surveyStyles.headerSpacer} /></header>
    <main style={surveyStyles.content}>
      <div style={surveyStyles.progressRow}><span>{progressLabel}</span>{isVoice && <span style={surveyStyles.liveBadge}>Questionnaire vocal</span>}</div>
      {children}
    </main>
  </div>
);

interface MascotPanelProps {
  mascot: Mascot;
  state: ConversationState;
}

export const MascotPanel: React.FC<MascotPanelProps> = ({ mascot, state }) => (
  <section style={surveyStyles.mascotPanel} aria-live="polite">
    <div style={{ ...surveyStyles.mascotGlow, ...(state === 'listening' ? surveyStyles.listeningGlow : {}) }}>
      <img src={mascotByState[mascot][state]} alt="Mascotte FOOD BAROMETER" style={{ ...surveyStyles.mascot, ...(state === 'thinking' ? surveyStyles.thinkingMascot : {}) }} />
    </div>
    <div style={surveyStyles.stateLabel}>{conversationStateLabel[state]}</div>
  </section>
);

interface QuestionCardProps {
  kicker: string;
  intros?: React.ReactNode[];
  question: string;
  repeatLabel?: string;
  repeatDisabled?: boolean;
  onRepeat?: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ kicker, intros = [], question, repeatLabel, repeatDisabled = false, onRepeat }) => (
  <section style={surveyStyles.questionCard}>
    <span style={surveyStyles.questionKicker}>{kicker}</span>
    {intros.map((intro, index) => <p key={index} style={surveyStyles.intro}>{intro}</p>)}
    <h2 style={surveyStyles.question}>{question}</h2>
    {onRepeat && <button type="button" onClick={onRepeat} disabled={repeatDisabled} style={{ ...surveyStyles.repeatButton, ...(repeatDisabled ? surveyStyles.disabledButton : {}) }}>{repeatLabel}</button>}
  </section>
);

interface PresetChoicesProps {
  name: string;
  options: string[];
  values: string[];
  multiple?: boolean;
  exclusiveOption?: string;
  onChange: (values: string[]) => void;
}

export const PresetChoices: React.FC<PresetChoicesProps> = ({ name, options, values, multiple = false, exclusiveOption, onChange }) => (
  <fieldset style={surveyStyles.presetGroup}>
    {options.map(option => {
      const checked = values.includes(option);
      return (
        <label key={option} style={surveyStyles.presetOption}>
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

interface NextButtonProps {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

export const NextButton: React.FC<NextButtonProps> = ({ label, disabled = false, onClick }) => (
  <button type="button" onClick={onClick} disabled={disabled} style={{ ...surveyStyles.nextButton, ...(disabled ? surveyStyles.disabledButton : {}) }}>
    {label}
    <FaCircleArrowRight size={ICON_SIZE} aria-hidden="true" style={surveyStyles.buttonIcon} />
  </button>
);
