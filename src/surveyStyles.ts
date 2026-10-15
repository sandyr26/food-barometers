import type { CSSProperties } from 'react';

export const ICON_SIZE = 22;

// Layout shared by the survey and the presentation page so the two screens look identical.
export const surveyStyles: Record<string, CSSProperties> = {
  page: { width: '100%', height: '100dvh', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff9e8', color: '#333', overflow: 'hidden' },
  header: { width: '100%', flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem', background: '#ffc000', boxShadow: '0 2px 10px rgba(217,119,6,0.2)', boxSizing: 'border-box' },
  title: { margin: 0, fontSize: '1.2rem', fontWeight: 700 },
  headerSpacer: { width: 40 },
  content: { width: '100%', maxWidth: 680, flex: '1 1 auto', minHeight: 0, margin: '0 auto', padding: '1rem 1rem 2rem', boxSizing: 'border-box', overflowY: 'auto' },
  progressRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', color: '#765800', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem' },
  liveBadge: { padding: '0.35rem 0.65rem', borderRadius: 999, background: '#fff0bd', color: '#765800', fontSize: '0.72rem', textTransform: 'uppercase' },
  mascotPanel: { textAlign: 'center', padding: '0.25rem 0 0.65rem' },
  mascotGlow: { width: 160, height: 160, margin: '0 auto 0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, #fff 45%, #ffe38a 70%, transparent 71%)', transition: 'transform 0.3s ease, box-shadow 0.3s ease' },
  listeningGlow: { transform: 'scale(1.04)', boxShadow: '0 0 0 12px rgba(255,192,0,0.14)' },
  mascot: { width: 138, height: 138, objectFit: 'contain', animation: 'aiMascotFloat 3s ease-in-out infinite' },
  thinkingMascot: { animation: 'aiMascotThink 0.8s ease-in-out infinite alternate' },
  stateLabel: { color: '#765800', fontSize: '0.95rem', fontWeight: 600 },
  questionCard: { padding: '1rem 1.1rem', background: '#fff', border: '1px solid #f1d681', borderRadius: 10, boxShadow: '0 6px 20px rgba(120,88,0,0.08)' },
  questionKicker: { display: 'block', marginBottom: '0.35rem', color: '#a87900', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase' },
  intro: { margin: '0 0 0.7rem', color: '#5c4a12', fontSize: '0.95rem', lineHeight: 1.5, fontStyle: 'italic' },
  question: { margin: 0, fontSize: '1.1rem', lineHeight: 1.45, overflowWrap: 'break-word' },
  presetCard: { display: 'flex', flexDirection: 'column', gap: '0.65rem', marginTop: '0.75rem', padding: '0.9rem', border: '1px solid #ead9a2', borderRadius: 8, background: '#fffdf6' },
  presetHeading: { margin: 0, color: '#765800', fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.45 },
  presetGroup: { display: 'flex', flexDirection: 'column', gap: '0.45rem', margin: 0, padding: '0.65rem', border: '1px solid #eee4c5', borderRadius: 6, background: '#fff' },
  presetOption: { display: 'flex', alignItems: 'flex-start', gap: '0.55rem', fontSize: '0.9rem', lineHeight: 1.4, cursor: 'pointer' },
  repeatButton: { marginTop: '0.7rem', border: 0, background: 'transparent', color: '#8c6500', fontWeight: 700, cursor: 'pointer', padding: 0 },
  privacyNotice: { margin: '0.65rem 0', color: '#765800', fontSize: '0.76rem', lineHeight: 1.4, textAlign: 'center' },
  errorMessage: { margin: '0.5rem 0', color: '#a52a20', fontSize: '0.9rem', lineHeight: 1.4, textAlign: 'center' },
  actions: { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.6rem', marginTop: '0.6rem' },
  nextButton: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', minHeight: 44, border: 0, borderRadius: 8, background: '#ffc000', color: '#332d1c', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer' },
  disabledButton: { opacity: 0.45, cursor: 'not-allowed' },
  buttonIcon: { flex: '0 0 auto' },
};
