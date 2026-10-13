import React from 'react';
import BackButton from '../components/BackButton';

type Language = 'fr' | 'en' | 'mfe' | 'rcf';

interface SurveyModePageProps {
  onBack: () => void;
  onSelectMode: (withAi: boolean) => void;
  language: Language;
}

const translations = {
  fr: { title: 'Enquête récurrente', subtitle: 'Comment souhaites-tu répondre ?', withAi: 'Avec l’IA', withoutAi: 'Sans l’IA' },
  en: { title: 'Recurrent Survey', subtitle: 'How would you like to answer?', withAi: 'With AI', withoutAi: 'Without AI' },
  mfe: { title: 'Ankyet Rekirant', subtitle: 'Kouma ou ule reponn ?', withAi: 'Avek IA', withoutAi: 'San IA' },
  rcf: { title: 'Ankèt Rékiran', subtitle: 'Koman ou lé répon ?', withAi: 'Avèk IA', withoutAi: 'San IA' },
};

const SurveyModePage: React.FC<SurveyModePageProps> = ({ onBack, onSelectMode, language }) => {
  const t = translations[language];

  return (
    <div style={styles.page}>
      <div style={styles.back}><BackButton onClick={onBack} /></div>
      <h1 style={styles.title}>{t.title}</h1>
      <p style={styles.subtitle}>{t.subtitle}</p>
      <div style={styles.choices}>
        <button type="button" style={styles.card} onClick={() => onSelectMode(true)}>
          <span style={{ ...styles.imageFrame, background: 'linear-gradient(135deg, #7c5cff, #3fb4ff)' }} aria-hidden="true"><span style={styles.emoji}>🤖</span></span>
          <span style={styles.label}>{t.withAi}</span>
        </button>
        <button type="button" style={styles.card} onClick={() => onSelectMode(false)}>
          <span style={{ ...styles.imageFrame, background: 'linear-gradient(135deg, #ff7eb3, #ff9d57)' }} aria-hidden="true"><span style={styles.emoji}>✍️</span></span>
          <span style={styles.label}>{t.withoutAi}</span>
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { width: '100vw', height: '100vh', backgroundColor: '#ffc000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', boxSizing: 'border-box', position: 'relative', overflowY: 'auto' },
  back: { position: 'absolute', top: '1.5rem', left: '1.5rem' },
  title: { fontSize: '2.5rem', fontWeight: 700, color: '#333', marginBottom: '1rem', textAlign: 'center' },
  subtitle: { fontSize: '1.2rem', color: '#666', marginBottom: '2rem', textAlign: 'center' },
  choices: { display: 'flex', gap: '2.5rem', justifyContent: 'center', flexWrap: 'wrap' },
  card: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', padding: 0, border: 0, background: 'transparent', cursor: 'pointer', font: 'inherit' },
  imageFrame: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 220, height: 220, borderRadius: 20, border: '4px solid rgba(255,255,255,0.8)', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', boxSizing: 'border-box' },
  emoji: { fontSize: '7rem', lineHeight: 1 },
  label: { backgroundColor: '#333', color: 'white', borderRadius: 25, padding: '0.8rem 2rem', fontSize: '1.2rem', fontWeight: 600, boxShadow: '0 6px 20px rgba(0,0,0,0.2)' },
};

export default SurveyModePage;
