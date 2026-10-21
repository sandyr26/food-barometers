import React from 'react';
import { intakeFields } from '../surveyConfig';
import type { IntakeFieldId, IntakeRecord } from '../surveyConfig';
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

export const DayTimeline: React.FC<{ active?: DaySegmentKey }> = ({ active }) => (
  <figure style={styles.timeline} aria-label="Ta journée d’hier, du tout-petit matin au soir">
    {segments.map(segment => (
      <div key={segment.key} style={{ ...styles.segment, ...(segment.key === active ? styles.segmentActive : {}) }} aria-current={segment.key === active ? 'true' : undefined}>
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
      </div>
    ))}
  </figure>
);

interface IntakeChecklistProps {
  fields: IntakeRecord;
  skipped: IntakeFieldId[];
  highlightMissing: boolean;
}

export const IntakeChecklist: React.FC<IntakeChecklistProps> = ({ fields, skipped, highlightMissing }) => (
  <section style={styles.checklist} aria-label="Les 9 informations à donner pour chaque prise">
    <ul style={styles.list}>
      {intakeFields.map(field => {
        const raw = fields[field.id];
        const value = Array.isArray(raw) ? raw.join(', ') : (raw ?? '').trim();
        const filled = value !== '';
        const missing = highlightMissing && !filled && !skipped.includes(field.id);
        return (
          <li key={field.id} style={{ ...styles.row, ...(filled ? styles.rowFilled : {}), ...(missing ? styles.rowMissing : {}) }} data-state={filled ? 'filled' : missing ? 'missing' : 'pending'}>
            <span style={styles.icon} aria-hidden="true">{field.icon}</span>
            <span style={styles.question}>{field.question}</span>
            {filled && <strong style={styles.value}>{value}</strong>}
          </li>
        );
      })}
    </ul>
  </section>
);

const styles: Record<string, React.CSSProperties> = {
  timeline: { display: 'flex', margin: '0.75rem 0 0', padding: 0, gap: 0, borderRadius: 10, overflow: 'hidden', border: '1px solid #ead9a2', background: '#fff' },
  segment: { position: 'relative', flex: '1 1 0', minWidth: 0, boxSizing: 'border-box', borderRight: '1px solid rgba(60,90,100,0.25)', display: 'flex', flexDirection: 'column' },
  segmentActive: { outline: '3px solid #e03131', outlineOffset: -3, zIndex: 1 },
  sky: { display: 'block', width: '100%', height: 64 },
  segmentLabel: { padding: '0.3rem 0.15rem', background: '#e9efe6', color: '#23415a', fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.15 },
  checklist: { marginTop: '0.75rem', padding: '0.6rem', border: '1px solid #ead9a2', borderRadius: 8, background: '#fffdf6' },
  list: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  row: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.2rem 0.6rem', padding: '0.4rem 0.55rem', borderRadius: 6, background: '#fff', border: '1px solid #eee4c5', fontSize: '0.88rem', lineHeight: 1.35, color: '#332d1c' },
  rowFilled: { background: '#eef8e6', borderColor: '#bcdca3' },
  rowMissing: { background: '#fff3bf', borderColor: '#f0b400', fontWeight: 700 },
  icon: { flex: '0 0 auto', width: 26, textAlign: 'center', fontSize: '1.25rem', fontFamily: '"Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif' },
  question: { flex: '1 1 12rem', minWidth: 0 },
  value: { flex: '0 1 auto', color: '#2b6a1f', overflowWrap: 'anywhere' },
};
