import React from 'react';
import { FaMicrophone, FaStop } from 'react-icons/fa6';
import type { VoiceStatus } from '../hooks/useVoiceRecorder';
import { ICON_SIZE } from '../surveyStyles';

const formatElapsed = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

const voiceStatusText: Record<VoiceStatus, string> = {
  heard: 'Je t’entends',
  listening: 'Parle, je t’écoute…',
  quiet: 'Je n’entends pas ta voix. Parle plus près du micro.',
};

interface VoiceTranscriptCardProps {
  heard: string;
  reply: string;
  isProcessing: boolean;
}

export const VoiceTranscriptCard: React.FC<VoiceTranscriptCardProps> = ({ heard, reply, isProcessing }) => (
  <section style={styles.transcriptCard}>
    <div style={styles.transcriptHeader}><span>Ta réponse</span>{isProcessing && <span style={styles.processing}>Transcription…</span>}</div>
    <p style={heard ? styles.transcript : styles.transcriptPlaceholder}>{heard || 'Appuie sur le micro et réponds naturellement.'}</p>
    {reply && <p style={styles.aiReply}>{reply}</p>}
  </section>
);

interface VoiceReplyControlsProps {
  isRecording: boolean;
  isBusy: boolean;
  label: string;
  levels: number[];
  elapsedSeconds: number;
  voiceStatus: VoiceStatus;
  onClick: () => void;
}

export const VoiceReplyControls: React.FC<VoiceReplyControlsProps> = ({ isRecording, isBusy, label, levels, elapsedSeconds, voiceStatus, onClick }) => (
  <>
    {isRecording && (
      <div style={styles.recordingPanel}>
        <div style={styles.recordingRow}>
          <span style={styles.recordingDot} aria-hidden="true" />
          <span style={styles.recordingTimer}>{formatElapsed(elapsedSeconds)}</span>
          <div style={styles.waveform} aria-hidden="true">
            {levels.map((level, index) => <span key={`${index}-bar`} style={{ ...styles.waveBar, height: `${Math.max(10, Math.round(level * 100))}%` }} />)}
          </div>
        </div>
        <output style={voiceStatus === 'quiet' ? styles.voiceHintWarning : styles.voiceHint}>{voiceStatusText[voiceStatus]}</output>
      </div>
    )}
    <button type="button" onClick={onClick} disabled={isBusy} style={{ ...styles.micButton, ...(isRecording ? styles.micButtonActive : {}), ...(isBusy ? styles.micButtonDisabled : {}) }} aria-label={label}>
      <span style={styles.micIcon}>{isRecording ? <FaStop size={ICON_SIZE} aria-hidden="true" /> : <FaMicrophone size={ICON_SIZE} aria-hidden="true" />}</span><span>{label}</span>
    </button>
  </>
);

const styles: Record<string, React.CSSProperties> = {
  transcriptCard: { marginTop: '0.8rem', padding: '0.85rem 1rem', minHeight: 86, background: '#332d1c', color: '#fff', borderRadius: 10 },
  transcriptHeader: { display: 'flex', justifyContent: 'space-between', color: '#ffd45b', fontSize: '0.76rem', fontWeight: 800, textTransform: 'uppercase' },
  processing: { color: '#fff', fontWeight: 500, textTransform: 'none' },
  transcript: { margin: '0.65rem 0 0', fontSize: '1rem', lineHeight: 1.5 },
  transcriptPlaceholder: { margin: '0.65rem 0 0', color: '#cfc8b4', lineHeight: 1.5 },
  aiReply: { margin: '0.7rem 0 0', paddingTop: '0.65rem', borderTop: '1px solid #5a5038', color: '#ffe7a0', lineHeight: 1.5 },
  micButton: { width: '100%', marginTop: '0.4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.7rem', minHeight: 56, border: 0, borderRadius: 10, background: '#332d1c', color: '#fff', fontSize: '1rem', fontWeight: 800, cursor: 'pointer' },
  micButtonActive: { background: '#c83f32', boxShadow: '0 0 0 8px rgba(200,63,50,0.14)' },
  micButtonDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  micIcon: { display: 'flex', alignItems: 'center' },
  recordingPanel: { marginTop: '0.4rem', padding: '0.75rem 0.9rem', background: '#fff', border: '1px solid #f0b4ae', borderRadius: 10 },
  recordingRow: { display: 'flex', alignItems: 'center', gap: '0.7rem' },
  recordingDot: { width: 12, height: 12, flex: '0 0 auto', borderRadius: '50%', background: '#c83f32', animation: 'recordingPulse 1s ease-in-out infinite' },
  recordingTimer: { flex: '0 0 auto', minWidth: 40, color: '#332d1c', fontSize: '0.95rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums' },
  waveform: { flex: '1 1 auto', height: 36, display: 'flex', alignItems: 'center', gap: 3 },
  waveBar: { flex: '1 1 0', minWidth: 2, maxWidth: 6, borderRadius: 3, background: '#c83f32', transition: 'height 70ms linear' },
  voiceHint: { display: 'block', margin: '0.5rem 0 0', color: '#765800', fontSize: '0.85rem', fontWeight: 700 },
  voiceHintWarning: { display: 'block', margin: '0.5rem 0 0', color: '#a52a20', fontSize: '0.85rem', fontWeight: 700 },
};
