import React from 'react';
import type { IntakeFieldId, IntakeRecord } from '../surveyConfig';
import { activityNone, activityOptions, companionOptions, otherOption, placeOptions } from '../surveyConfig';
import type { DaySegmentKey } from '../daySegment';

const segments: { key: DaySegmentKey; label: string; sky: [string, string]; sunY: number; sleepy: boolean; hill: boolean; sun: string }[] = [
  { key: 'early', label: 'Tout-petit matin', sky: ['#bfe4e0', '#fbeec3'], sunY: 64, sleepy: false, hill: true, sun: '#ffd23f' },
  { key: 'morning', label: 'Matinée', sky: ['#c7e8e3', '#f7efc9'], sunY: 42, sleepy: false, hill: false, sun: '#ffd23f' },
  { key: 'noon', label: 'Midi', sky: ['#d3ece3', '#f6efca'], sunY: 22, sleepy: false, hill: false, sun: '#ffd23f' },
  { key: 'afternoon', label: 'Après-midi', sky: ['#dcefe0', '#f5eecb'], sunY: 40, sleepy: true, hill: false, sun: '#ffd23f' },
  { key: 'evening', label: 'Soir', sky: ['#6e9aa6', '#a9c3c0'], sunY: 66, sleepy: true, hill: true, sun: '#f0a63a' },
];

const rays = Array.from({ length: 8 }, (_, index) => (index * Math.PI) / 4);

const Sun: React.FC<{ y: number; color: string; sleepy: boolean }> = ({ y, color, sleepy }) => (
  <g transform={`translate(50 ${y})`}>
    {rays.map(angle => (
      <line key={angle} x1={Math.cos(angle) * 19} y1={Math.sin(angle) * 19} x2={Math.cos(angle) * 26} y2={Math.sin(angle) * 26} stroke={color} strokeWidth="3" strokeLinecap="round" />
    ))}
    <circle r="16" fill={color} stroke="#f0a63a" strokeWidth="2" />
    {sleepy ? (
      <>
        <path d="M-8 -3 q3 3 6 0" fill="none" stroke="#3a2c1c" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M2 -3 q3 3 6 0" fill="none" stroke="#3a2c1c" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ) : (
      <>
        <circle cx="-5" cy="-3" r="1.8" fill="#3a2c1c" />
        <circle cx="5" cy="-3" r="1.8" fill="#3a2c1c" />
      </>
    )}
    <path d="M-6 4 q6 6 12 0" fill="none" stroke="#3a2c1c" strokeWidth="1.8" strokeLinecap="round" />
  </g>
);

interface DayTimelineProps {
  active?: DaySegmentKey;
  // A segment the child can click (for example the rising sun), and a segment that blinks to attract attention.
  selectable?: DaySegmentKey;
  blinking?: DaySegmentKey;
  onSelect?: (key: DaySegmentKey) => void;
}

const blinkKeyframes = '@keyframes daySegmentBlink { 0%, 100% { box-shadow: inset 0 0 0 0 rgba(224,49,49,0); filter: none; } 50% { box-shadow: inset 0 0 0 5px #e03131; filter: brightness(1.12); } }';

export const DayTimeline: React.FC<DayTimelineProps> = ({ active, selectable, blinking, onSelect }) => {
  // The phases before the one we are in are finished.
  const activeIndex = segments.findIndex(segment => segment.key === active);
  return (
  <figure style={styles.timeline} aria-label="Ta journée d’hier, du tout-petit matin au soir">
    <style>{blinkKeyframes}</style>
    {segments.map((segment, index) => {
      const clickable = Boolean(onSelect) && segment.key === selectable;
      const completed = index < activeIndex;
      const content = (
        <>
          {completed && <span style={styles.tick} role="img" aria-label="Terminé">✓</span>}
          <svg viewBox="0 0 100 80" style={styles.sky} aria-hidden="true" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id={`sky-${segment.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor={segment.sky[0]} />
                <stop offset="1" stopColor={segment.sky[1]} />
              </linearGradient>
            </defs>
            <rect width="100" height="80" fill={`url(#sky-${segment.key})`} />
            <Sun y={segment.sunY} color={segment.sun} sleepy={segment.sleepy} />
            {segment.hill && <path d="M0 80 L0 72 Q50 56 100 72 L100 80 Z" fill={segment.key === 'evening' ? '#3f6578' : '#6f9aaa'} />}
          </svg>
          <figcaption style={styles.segmentLabel}>{segment.label}</figcaption>
        </>
      );
      const segmentStyle = {
        ...styles.segment,
        ...(segment.key === active ? styles.segmentActive : {}),
        ...(segment.key === blinking ? styles.segmentBlinking : {}),
      };
      return clickable ? (
        <button key={segment.key} type="button" onClick={() => onSelect?.(segment.key)} style={{ ...segmentStyle, ...styles.segmentButton }} aria-label={`${segment.label} : commencer`}>
          {content}
        </button>
      ) : (
        <div key={segment.key} style={segmentStyle} aria-current={segment.key === active ? 'true' : undefined}>
          {content}
        </div>
      );
    })}
  </figure>
  );
};

const phaseLabels = Object.fromEntries(segments.map(segment => [segment.key, segment.label])) as Record<DaySegmentKey, string>;

interface ChoiceTile { value: string; icon: string; label: string }

const placeIcons: Record<string, string> = {
  'Maison': '🏠',
  'Chez quelqu’un': '👨‍👩‍👧',
  'Collège': '🏫',
  'Trajet (bus, rue…)': '🚌',
  'Commerce (snack…)': '🏪',
  [otherOption]: '⋯',
};
const placeTiles: ChoiceTile[] = placeOptions.map(option => ({ value: option, icon: placeIcons[option] ?? '📍', label: option }));
const companionshipTiles: ChoiceTile[] = [
  { value: 'Seul(e)', icon: '👤', label: 'Seul(e)' },
  { value: 'Accompagné(e)', icon: '👥', label: 'Avec quelqu’un' },
];
const activityIcons: Record<string, string> = {
  [activityNone]: '🚫',
  'Un écran (TV, téléphone, tablette, console)': '📺',
  'Je discutais': '💬',
  'Je marchais': '🚶',
  'J’étais dans le bus': '🚌',
  'Je faisais mes devoirs': '📖',
  [otherOption]: '⋯',
};
const activityTiles: ChoiceTile[] = activityOptions.map(option => ({ value: option, icon: activityIcons[option] ?? '•', label: option }));

// The part of the day as it is said in « dans … ».
const phaseIn: Record<DaySegmentKey, string> = {
  early: 'dans le tout-petit matin',
  morning: 'dans la matinée',
  noon: 'à midi',
  afternoon: 'dans l’après-midi',
  evening: 'dans la soirée',
};

const isOther = (value: string) => value === otherOption || value.startsWith(`${otherOption} : `);
const otherText = (value: string) => value.slice(`${otherOption} : `.length);

interface IntakeBlockProps {
  phase: DaySegmentKey;
  // Occasions already recorded in this phase.
  recorded: number;
  fields: IntakeRecord;
  onChange: (id: IntakeFieldId, value: string | string[]) => void;
  onAdd: () => void;
  onNothing: () => void;
  addDisabled: boolean;
  nothingDisabled: boolean;
}

// What the child is asked for each occasion, laid out like a form card; the voice assistant fills it in and every field can be corrected by hand.
export const IntakeBlock: React.FC<IntakeBlockProps> = ({ phase, recorded, fields, onChange, onAdd, onNothing, addDisabled, nothingDisabled }) => {
  const text = (id: IntakeFieldId) => (typeof fields[id] === 'string' ? fields[id] as string : '');
  const list = (id: IntakeFieldId) => {
    const value = fields[id];
    return Array.isArray(value) ? value : (value ? [value] : []);
  };
  const textRow = (id: IntakeFieldId, icon: string, title: string, hint: string | undefined, placeholder: string) => (
    <div style={styles.blockRow}>
      <span style={styles.blockIcon} aria-hidden="true">{icon}</span>
      <label style={styles.blockQuestion}>
        <span><strong>{title}</strong>{hint && <small style={styles.blockHint}> {hint}</small>}</span>
        <input style={styles.blockInput} value={text(id)} placeholder={placeholder} onChange={event => onChange(id, event.target.value)} />
      </label>
    </div>
  );
  // The clock only accepts HH:MM (24 h); a time said aloud ("vers 7 heures et demie") is converted when it can be read.
  const clockValue = () => {
    const spoken = /(\d{1,2})\s*(?:h|heures?|:)\s*(\d{2})?/i.exec(text('time'));
    if (!spoken || Number(spoken[1]) > 23) return '';
    return `${spoken[1].padStart(2, '0')}:${spoken[2] ?? '00'}`;
  };
  const timeRow = () => (
    <div style={styles.blockRow}>
      <span style={styles.blockIcon} aria-hidden="true">🕒</span>
      <label style={styles.blockQuestion}>
        <span><strong>C’était vers quelle heure, à peu près ?</strong></span>
        <input type="time" style={{ ...styles.blockInput, width: 'auto', alignSelf: 'flex-start' }} value={clockValue()} onChange={event => onChange('time', event.target.value)} />
      </label>
    </div>
  );
  const tiles = (id: IntakeFieldId, options: ChoiceTile[]) => (
    <div style={styles.tiles} role="radiogroup" aria-label={id}>
      {options.map(option => {
        const current = text(id);
        const checked = current === option.value || (id === 'place' && option.value === otherOption && isOther(current));
        return (
          <button key={option.value} type="button" role="radio" aria-checked={checked} onClick={() => onChange(id, checked ? '' : option.value)} style={{ ...styles.tile, ...(checked ? styles.tileChecked : {}) }}>
            <span style={styles.tileIcon} aria-hidden="true">{option.icon}</span>
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
  // Several answers can be chosen; « exclusive » is alone when chosen, and « Autre » asks the child to write it.
  const multiTiles = (id: IntakeFieldId, options: ChoiceTile[], exclusive?: string) => {
    const chosen = list(id);
    const other = chosen.find(isOther);
    const toggle = (value: string) => {
      const checked = value === otherOption ? other !== undefined : chosen.includes(value);
      if (checked) onChange(id, chosen.filter(item => (value === otherOption ? !isOther(item) : item !== value)));
      else if (value === exclusive) onChange(id, [value]);
      else onChange(id, [...chosen.filter(item => item !== exclusive), value]);
    };
    return (
      <>
        <div style={styles.tiles} role="group" aria-label={id}>
          {options.map(option => {
            const checked = option.value === otherOption ? other !== undefined : chosen.includes(option.value);
            return (
              <button key={option.value} type="button" role="checkbox" aria-checked={checked} onClick={() => toggle(option.value)} style={{ ...styles.tile, ...(checked ? styles.tileChecked : {}) }}>
                <span style={styles.tileIcon} aria-hidden="true">{option.icon}</span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
        {other !== undefined && (
          <input
            style={styles.blockInput}
            aria-label="Précise"
            placeholder="Précise…"
            value={otherText(other)}
            onChange={event => onChange(id, chosen.map(item => (isOther(item) ? (event.target.value.trim() ? `${otherOption} : ${event.target.value}` : otherOption) : item)))}
          />
        )}
      </>
    );
  };
  const companionIcons: Record<string, string> = { 'Parents': '👪', 'Copains, copines': '🧑‍🤝‍🧑', 'Frères et sœurs': '👫', 'Adultes du collège': '🧑‍🏫', 'Autre famille': '👵', [otherOption]: '⋯' };
  const companionTiles: ChoiceTile[] = companionOptions.map(option => ({ value: option, icon: companionIcons[option] ?? '•', label: option }));
  return (
    <section style={styles.block} aria-label={`Prise ${recorded + 1} – ${phaseLabels[phase]}`}>
      <header style={styles.blockHeader}>
        <span style={styles.blockNumber}>{recorded + 1}</span>
        <strong style={styles.blockTitle}>Prise {recorded + 1} – {phaseLabels[phase]}</strong>
        <span style={styles.blockBadge}>{recorded} {recorded > 1 ? 'prises enregistrées' : 'prise enregistrée'}</span>
      </header>
      {textRow('solids', '🍽️', 'Qu’as-tu mangé ?', '(aliments solides)', 'Ex. : un sandwich, des fruits, un gâteau…')}
      {textRow('drinks', '🥤', 'Qu’as-tu bu ?', '(boissons)', 'Ex. : de l’eau, un jus, un soda…')}
      {timeRow()}
      {textRow('name', '🏷️', 'Comment appelles-tu ce moment ?', '(Petit-déjeuner, déjeuner, goûter, grignotage…)', 'Ex. : goûter, collation…')}
      <div style={styles.blockRow}>
        <span style={styles.blockIcon} aria-hidden="true">📍</span>
        <div style={styles.blockQuestion}>
          <strong>Où étais-tu ?</strong>
          {tiles('place', placeTiles)}
          {isOther(text('place')) && (
            <input
              style={styles.blockInput}
              aria-label="Précise le lieu"
              placeholder="Précise le lieu…"
              value={otherText(text('place'))}
              onChange={event => onChange('place', event.target.value.trim() ? `${otherOption} : ${event.target.value}` : otherOption)}
            />
          )}
        </div>
      </div>
      <div style={styles.blockRow}>
        <span style={styles.blockIcon} aria-hidden="true">👥</span>
        <div style={styles.blockQuestion}>
          <strong>Tu étais seul(e) ou avec quelqu’un ?</strong>
          {tiles('companionship', companionshipTiles)}
          {text('companionship') === 'Accompagné(e)' && (
            <>
              <span><strong>Avec qui ?</strong><small style={styles.blockHint}> (plusieurs choix possibles)</small></span>
              {multiTiles('companions', companionTiles)}
            </>
          )}
        </div>
      </div>
      <div style={styles.blockRow}>
        <span style={styles.blockIcon} aria-hidden="true">🥄</span>
        <div style={styles.blockQuestion}>
          <span><strong>Pendant que tu mangeais ou buvais, tu faisais autre chose ?</strong><small style={styles.blockHint}> (plusieurs choix possibles)</small></span>
          {multiTiles('activities', activityTiles, activityNone)}
        </div>
      </div>
      <div style={styles.blockActions}>
        <button type="button" onClick={onAdd} disabled={addDisabled} style={{ ...styles.addButton, ...(addDisabled ? styles.buttonDisabled : {}) }}>
          <span style={styles.actionIcon} aria-hidden="true">＋</span>
          Ajouter une autre prise {phaseIn[phase]}
        </button>
        <button type="button" onClick={onNothing} disabled={nothingDisabled} style={{ ...styles.nothingButton, ...(nothingDisabled ? styles.buttonDisabled : {}) }}>
          <span style={styles.actionIcon} aria-hidden="true">🚫</span>
          Je n’ai rien mangé ni bu {phaseIn[phase]}
        </button>
      </div>
    </section>
  );
};

const styles: Record<string, React.CSSProperties> = {
  tick: { position: 'absolute', top: 4, right: 4, zIndex: 3, width: 20, height: 20, borderRadius: '50%', background: '#2f9e44', color: '#fff', fontSize: '0.8rem', fontWeight: 900, lineHeight: '20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' },
  timeline: { display: 'flex', margin: '0.75rem 0 0', padding: 0, gap: 0, borderRadius: 10, overflow: 'hidden', border: '1px solid #ead9a2', background: '#fff' },
  segment: { position: 'relative', flex: '1 1 0', minWidth: 0, boxSizing: 'border-box', borderRight: '1px solid rgba(60,90,100,0.25)', display: 'flex', flexDirection: 'column' },
  segmentActive: { outline: '3px solid #e03131', outlineOffset: -3, zIndex: 1 },
  segmentBlinking: { animation: 'daySegmentBlink 0.9s ease-in-out infinite', zIndex: 2 },
  segmentButton: { padding: 0, border: 'none', borderRight: '1px solid rgba(60,90,100,0.25)', background: 'transparent', font: 'inherit', cursor: 'pointer' },
  sky: { display: 'block', width: '100%', height: 64 },
  segmentLabel: { padding: '0.3rem 0.15rem', background: '#e9efe6', color: '#23415a', fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.15 },
  block: { marginTop: '0.75rem', border: '1px solid #ead9a2', borderRadius: 10, background: '#fffdf6', overflow: 'hidden', color: '#332d1c' },
  blockHeader: { display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.55rem 0.7rem', background: '#fdf1d0', borderBottom: '1px solid #ead9a2' },
  blockNumber: { flex: '0 0 auto', width: 26, height: 26, borderRadius: '50%', background: '#e8590c', color: '#fff', fontWeight: 800, textAlign: 'center', lineHeight: '26px' },
  blockTitle: { flex: '1 1 auto', fontSize: '1rem' },
  blockBadge: { flex: '0 0 auto', padding: '0.2rem 0.6rem', border: '1px solid #ead9a2', borderRadius: 999, background: '#fff', fontSize: '0.75rem', fontWeight: 700 },
  blockRow: { display: 'flex', alignItems: 'flex-start', gap: '0.6rem', padding: '0.6rem 0.7rem', borderBottom: '1px solid #f1e6c3' },
  blockIcon: { flex: '0 0 auto', width: 32, textAlign: 'center', fontSize: '1.6rem', lineHeight: 1.2, fontFamily: '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif' },
  blockQuestion: { flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem', fontSize: '0.9rem' },
  blockHint: { color: '#6b5e3a', fontSize: '0.75rem' },
  blockInput: { width: '100%', minHeight: 36, padding: '0.4rem 0.6rem', boxSizing: 'border-box', border: '1px solid #d9c98d', borderRadius: 6, background: '#fff', color: '#332d1c', font: 'inherit' },
  tiles: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem' },
  blockActions: { display: 'flex', flexWrap: 'wrap', gap: '0.6rem', padding: '0.7rem' },
  addButton: { flex: '1 1 14rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', minHeight: 56, padding: '0.5rem 0.8rem', border: '1px solid #4c8ed9', borderRadius: 12, background: '#dbeafe', color: '#12385f', font: 'inherit', fontWeight: 800, cursor: 'pointer' },
  nothingButton: { flex: '1 1 14rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', minHeight: 56, padding: '0.5rem 0.8rem', border: '1px solid #c9c9c9', borderRadius: 12, background: '#fff', color: '#332d1c', font: 'inherit', fontWeight: 800, cursor: 'pointer' },
  buttonDisabled: { opacity: 0.45, cursor: 'not-allowed' },
  actionIcon: { fontSize: '1.5rem', lineHeight: 1, fontFamily: '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif' },
  tile: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem', minWidth: 72, padding: '0.4rem 0.5rem', border: '1px solid #d9c98d', borderRadius: 8, background: '#fff', color: '#332d1c', font: 'inherit', fontSize: '0.75rem', fontWeight: 700, textAlign: 'center', cursor: 'pointer' },
  tileChecked: { borderColor: '#e8590c', background: '#fff1e0', boxShadow: '0 0 0 2px rgba(232,89,12,0.35)' },
  tileIcon: { fontSize: '1.4rem', lineHeight: 1.2, fontFamily: '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif' },
};
