import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import BackButton from '../components/BackButton';
import mascotteGirl from '../assets/Mascotte1.png';
import mascotteBoy from '../assets/mascotte-boy.png';

type Language = 'fr' | 'en' | 'mfe' | 'rcf';

interface MascotSelectionPageProps {
  onBack: () => void;
  onSelectMascot: (mascot: 'boy' | 'girl') => void;
  language: Language;
  authToken: string | null;
}

const translations = {
  fr: {
    title: 'Choisir une mascotte',
    boy: 'Garçon',
    girl: 'Fille',
    subtitle: 'Choisissez la mascotte qui vous accompagnera.'
  },
  en: {
    title: 'Choose a Mascot',
    boy: 'Boy',
    girl: 'Girl',
    subtitle: 'Select your preferred mascot'
  },
  mfe: {
    title: 'Chwazi yon Maskòt',
    boy: 'Gason',
    girl: 'Fi',
    subtitle: 'Seleksyone maskòt ou pi renmen'
  },
  rcf: {
    title: 'Chwazi yon Maskòt',
    boy: 'Gason',
    girl: 'Fi',
    subtitle: 'Seleksyone maskòt ou pi renmen'
  }
};

const MascotSelectionPage: React.FC<MascotSelectionPageProps> = ({
  onBack,
  onSelectMascot,
  language,
  authToken
}) => {
  const t = translations[language];
  const [activeMascot, setActiveMascot] = useState<'boy' | 'girl' | null>(null);
  const [speechError, setSpeechError] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    const speak = async (text: string, mascot: 'narrator' | 'boy' | 'girl', speechLanguage: Language) => {
      const response = await axios.post('http://localhost:5000/api/ai/speech', {
        text,
        language: speechLanguage,
        mascot
      }, {
        headers: { Authorization: `Bearer ${authToken}` },
        responseType: 'blob',
        signal: controller.signal
      });

      if (cancelled) return;
      const audioUrl = URL.createObjectURL(response.data);
      audioUrlRef.current = audioUrl;
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      await new Promise<void>((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = () => reject(new Error('Audio playback failed'));
        void audio.play().catch(reject);
      });

      URL.revokeObjectURL(audioUrl);
      if (audioUrlRef.current === audioUrl) audioUrlRef.current = null;
      if (audioRef.current === audio) audioRef.current = null;
    };

    const introduceMascots = async () => {
      try {
        if (!authToken) throw new Error('Authentication is required for mascot audio.');
        setSpeechError('');
        await speak(`${t.title}. ${t.subtitle}`, 'narrator', language);
        if (cancelled) return;

        setActiveMascot('girl');
        await speak('Tu peux me choisir !', 'girl', 'fr');
        if (cancelled) return;

        setActiveMascot('boy');
        await speak('Tu peux me choisir !', 'boy', 'fr');
      } catch {
        if (!cancelled) setSpeechError('La présentation audio des mascottes est indisponible.');
      } finally {
        if (!cancelled) setActiveMascot(null);
      }
    };

    void introduceMascots();

    return () => {
      cancelled = true;
      controller.abort();
      audioRef.current?.pause();
      audioRef.current = null;
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    };
  }, [authToken, language, t.subtitle]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      backgroundColor: '#ffc000',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative'
    }}>
      {/* Back Button */}
      <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem' }}>
        <BackButton onClick={onBack} />
      </div>

      {/* Title */}
      <style>{`
        @keyframes mascotGreeting {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06) translateY(-6px); }
        }
      `}</style>
      <h1 style={{
        fontSize: '2.5rem',
        fontWeight: '700',
        color: '#333',
        marginBottom: '1rem',
        textAlign: 'center'
      }}>
        {t.title}
      </h1>

      <p style={{
        fontSize: '1.2rem',
        color: '#666',
        marginBottom: '3rem',
        textAlign: 'center'
      }}>
        {t.subtitle}
      </p>
      {speechError && <p role="status" style={{ color: '#6a281f', marginTop: '-2rem', marginBottom: '2rem' }}>{speechError}</p>}

      {/* Mascot Selection Container */}
      <div style={{
        display: 'flex',
        gap: '4rem',
        justifyContent: 'center',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
        maxWidth: '900px'
      }}>
        {/* Girl Mascot */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          cursor: 'pointer',
          transition: 'transform 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        onClick={() => onSelectMascot('girl')}
        >
          <div style={{
            width: '220px',
            height: '280px',
            backgroundColor: 'white',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            border: activeMascot === 'girl' ? '4px solid #e8793f' : '4px solid rgba(255,255,255,0.8)',
            overflow: 'hidden',
            animation: activeMascot === 'girl' ? 'mascotGreeting 800ms ease-in-out infinite' : undefined
          }}>
            <img
              src={mascotteGirl}
              alt="Girl Mascot"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
          <button style={{
            backgroundColor: '#333',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            padding: '0.8rem 2rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#555';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#333';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
          }}
          >
            {t.girl}
          </button>
        </div>

        {/* Boy Mascot */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          cursor: 'pointer',
          transition: 'transform 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
        onClick={() => onSelectMascot('boy')}
        >
          <div style={{
            width: '220px',
            height: '280px',
            backgroundColor: 'white',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            border: activeMascot === 'boy' ? '4px solid #e8793f' : '4px solid rgba(255,255,255,0.8)',
            overflow: 'hidden',
            animation: activeMascot === 'boy' ? 'mascotGreeting 800ms ease-in-out infinite' : undefined
          }}>
            <img
              src={mascotteBoy}
              alt="Boy Mascot"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          </div>
          <button style={{
            backgroundColor: '#333',
            color: 'white',
            border: 'none',
            borderRadius: '25px',
            padding: '0.8rem 2rem',
            fontSize: '1.1rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#555';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#333';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
          }}
          >
            {t.boy}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MascotSelectionPage;
