import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import mascotIdle from "../assets/Mascotte1.png";
import mascotQuestion from "../assets/Mascotte2.png";
import mascotSpeaking from "../assets/Mascotte3.png";
import mascotListening from "../assets/Mascotte4.png";
import mascotThinking from "../assets/Mascotte5.png";

type Language = "fr" | "en" | "mfe" | "rcf";
type Page =
  | "splash"
  | "auth"
  | "login"
  | "register"
  | "home"
  | "addMeal"
  | "profile"
  | "notifications"
  | "supplies"
  | "calendar"
  | "mealDetail"
  | "dayMeals";

interface MealData {
  id: number;
  time: string;
  name: string;
  duration: string;
  answers: string[];
  method: "text" | "voice";
  date: string;
}

interface AddMealPageAIProps {
  language: Language;
  onBack: () => void;
  onAddMeal: (mealData: MealData) => void;
  onNavigate: (page: Page) => void;
}

type ConversationState = "speaking" | "listening" | "thinking" | "ready" | "complete";

const questions = [
  "À quelle heure avez-vous commencé votre repas ?",
  "Comment appelez-vous ce moment ?",
  "Quels aliments et quelles boissons avez-vous consommés ?",
  "Où avez-vous pris votre repas ?",
  "Étiez-vous seul(e) ou accompagné(e) ?",
];

const demoAnswers = [
  "Vers huit heures du matin.",
  "Le petit-déjeuner.",
  "Du pain complet, un café et un fruit.",
  "À la maison, dans la cuisine.",
  "J'étais seul(e).",
];

const mascotByState: Record<ConversationState, string> = {
  speaking: mascotSpeaking,
  listening: mascotListening,
  thinking: mascotThinking,
  ready: mascotQuestion,
  complete: mascotIdle,
};

const speechLocales: Record<Language, string> = {
  fr: "fr-FR",
  en: "en-US",
  mfe: "fr-FR",
  rcf: "fr-FR",
};

const speakQuestion = (text: string, language: Language, onComplete: () => void) => {
  if (!("speechSynthesis" in window)) {
    onComplete();
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = speechLocales[language];
  utterance.rate = 0.95;
  utterance.pitch = 1;
  utterance.onend = onComplete;
  utterance.onerror = onComplete;
  window.speechSynthesis.speak(utterance);
};

const AddMealPageAI: React.FC<AddMealPageAIProps> = ({ language, onAddMeal }) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [conversationState, setConversationState] = useState<ConversationState>("speaking");
  const [transcript, setTranscript] = useState("");
  const [answers, setAnswers] = useState<string[]>([]);
  const timerRef = useRef<number | null>(null);

  const handleBack = () => {
    window.location.assign("/home");
  };

  useEffect(() => {
    setConversationState("speaking");
    speakQuestion(questions[questionIndex], language, () => setConversationState("listening"));

    return () => {
      window.speechSynthesis?.cancel();
    };
  }, [questionIndex, language]);

  const handleMicClick = () => {
    if (conversationState !== "listening" && conversationState !== "ready") {
      return;
    }

    setConversationState("thinking");
    timerRef.current = window.setTimeout(() => {
      setTranscript(demoAnswers[questionIndex]);
      setConversationState("ready");
    }, 1400);
  };

  const handleRepeatQuestion = () => {
    setConversationState("speaking");
    speakQuestion(questions[questionIndex], language, () => setConversationState("listening"));
  };

  const handleNext = () => {
    const updatedAnswers = [...answers];
    updatedAnswers[questionIndex] = transcript;
    setAnswers(updatedAnswers);
    setTranscript("");

    if (questionIndex === questions.length - 1) {
      const today = new Date().toISOString().split("T")[0];
      onAddMeal({
        id: Date.now(),
        time: `${today}T08:00:00`,
        name: updatedAnswers[1] || "Repas enregistré",
        duration: "30 minutes",
        answers: updatedAnswers,
        method: "voice",
        date: today,
      });
      setConversationState("complete");
      return;
    }

    setQuestionIndex(questionIndex + 1);
    setConversationState("speaking");
  };

  const stateLabel = {
    speaking: "La mascotte vous pose une question...",
    listening: "Je vous écoute...",
    thinking: "Je transcris votre réponse...",
    ready: "Réponse enregistrée",
    complete: "Votre repas est prêt à être enregistré",
  }[conversationState];

  if (conversationState === "complete") {
    return (
      <div style={styles.page}>
        <header style={styles.header}>
          <button type="button" onClick={handleBack} style={styles.backButton} aria-label="Retour">
            <ArrowLeft size={20} strokeWidth={2.5} aria-hidden="true" />
          </button>
          <h1 style={styles.title}>Ajouter un repas</h1>
          <div style={styles.headerSpacer} />
        </header>
        <main style={styles.completePanel}>
          <img src={mascotIdle} alt="Mascotte" style={styles.completeMascot} />
          <h2 style={styles.completeTitle}>Merci, votre réponse est complète.</h2>
          <p style={styles.supportingText}>Le repas a été préparé avec vos réponses vocales.</p>
          <button type="button" onClick={handleBack} style={styles.primaryButton}>Retour à l'accueil</button>
        </main>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <button type="button" onClick={handleBack} style={styles.backButton} aria-label="Retour">
          <ArrowLeft size={20} strokeWidth={2.5} aria-hidden="true" />
        </button>
        <h1 style={styles.title}>Ajouter un repas</h1>
        <div style={styles.headerSpacer} />
      </header>

      <main style={styles.content}>
        <div style={styles.progressRow}>
          <span>Question {questionIndex + 1} sur {questions.length}</span>
          <span style={styles.liveBadge}>AI prototype</span>
        </div>

        <section style={styles.mascotPanel} aria-live="polite">
          <div style={{ ...styles.mascotGlow, ...(conversationState === "listening" ? styles.listeningGlow : {}) }}>
            <img
              src={mascotByState[conversationState]}
              alt="Mascotte FOOD BAROMETER"
              style={{ ...styles.mascot, ...(conversationState === "thinking" ? styles.thinkingMascot : {}) }}
            />
          </div>
          <div style={styles.stateLabel}>{stateLabel}</div>
        </section>

        <section style={styles.questionCard}>
          <span style={styles.questionKicker}>La question</span>
          <h2 style={styles.question}>{questions[questionIndex]}</h2>
          <button
            type="button"
            onClick={handleRepeatQuestion}
            style={styles.repeatButton}
          >
            🔊 Réécouter la question
          </button>
        </section>

        <section style={styles.transcriptCard}>
          <div style={styles.transcriptHeader}>
            <span>Votre réponse</span>
            {conversationState === "thinking" && <span style={styles.processing}>Transcription...</span>}
          </div>
          <p style={transcript ? styles.transcript : styles.transcriptPlaceholder}>
            {transcript || "Appuyez sur le micro et répondez naturellement."}
          </p>
        </section>

        <button
          type="button"
          onClick={handleMicClick}
          disabled={conversationState === "speaking" || conversationState === "thinking"}
          style={{
            ...styles.micButton,
            ...(conversationState === "listening" ? styles.micButtonActive : {}),
          }}
          aria-label="Répondre avec le microphone"
        >
          <span style={styles.micIcon}>{conversationState === "listening" ? "●" : "🎙"}</span>
          <span>{conversationState === "listening" ? "Je vous écoute" : "Répondre"}</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={!transcript}
          style={{ ...styles.nextButton, ...(!transcript ? styles.disabledButton : {}) }}
        >
          {questionIndex === questions.length - 1 ? "Terminer" : "Question suivante"} →
        </button>
      </main>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { width: "100%", minHeight: "100vh", background: "#fff9e8", color: "#333", overflowX: "hidden" },
  header: { width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.5rem", background: "#ffc000", boxShadow: "0 2px 10px rgba(217,119,6,0.2)", position: "sticky", top: 0, zIndex: 2, boxSizing: "border-box" },
  backButton: { width: 40, height: 40, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, border: 0, borderRadius: 8, background: "rgba(51,51,51,0.14)", color: "#333", fontSize: "1.6rem", lineHeight: 1, cursor: "pointer", appearance: "none" },
  title: { margin: 0, fontSize: "1.2rem", fontWeight: 700 },
  headerSpacer: { width: 40 },
  content: { width: "100%", maxWidth: 680, margin: "0 auto", padding: "1.25rem 1rem 3rem", boxSizing: "border-box" },
  progressRow: { display: "flex", justifyContent: "space-between", alignItems: "center", color: "#765800", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.8rem" },
  liveBadge: { padding: "0.35rem 0.65rem", borderRadius: 999, background: "#fff0bd", color: "#765800", fontSize: "0.72rem", letterSpacing: "0.04em", textTransform: "uppercase" },
  mascotPanel: { textAlign: "center", padding: "0.5rem 0 1rem" },
  mascotGlow: { width: 180, height: 180, margin: "0 auto 0.75rem", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle, #fff 45%, #ffe38a 70%, transparent 71%)", transition: "transform 0.3s ease, box-shadow 0.3s ease" },
  listeningGlow: { transform: "scale(1.04)", boxShadow: "0 0 0 12px rgba(255,192,0,0.14)" },
  mascot: { width: 150, height: 150, objectFit: "contain", animation: "aiMascotFloat 3s ease-in-out infinite" },
  thinkingMascot: { animation: "aiMascotThink 0.8s ease-in-out infinite alternate" },
  stateLabel: { color: "#765800", fontSize: "0.95rem", fontWeight: 600 },
  questionCard: { padding: "1.25rem", background: "#fff", border: "1px solid #f1d681", borderRadius: 12, boxShadow: "0 6px 20px rgba(120,88,0,0.08)" },
  questionKicker: { display: "block", marginBottom: "0.5rem", color: "#a87900", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" },
  question: { margin: 0, fontSize: "clamp(1.1rem, 3vw, 1.5rem)", lineHeight: 1.35, overflowWrap: "break-word" },
  repeatButton: { marginTop: "1rem", border: 0, background: "transparent", color: "#8c6500", fontWeight: 700, cursor: "pointer", padding: 0 },
  transcriptCard: { marginTop: "1rem", padding: "1rem 1.1rem", minHeight: 104, background: "#332d1c", color: "#fff", borderRadius: 12 },
  transcriptHeader: { display: "flex", justifyContent: "space-between", color: "#ffd45b", fontSize: "0.78rem", fontWeight: 800, letterSpacing: "0.06em", textTransform: "uppercase" },
  processing: { color: "#fff", fontWeight: 500, textTransform: "none", letterSpacing: 0 },
  transcript: { margin: "0.75rem 0 0", fontSize: "1.05rem", lineHeight: 1.5 },
  transcriptPlaceholder: { margin: "0.75rem 0 0", color: "#cfc8b4", lineHeight: 1.5 },
  micButton: { width: "100%", marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.7rem", minHeight: 62, border: 0, borderRadius: 12, background: "#332d1c", color: "#fff", fontSize: "1.05rem", fontWeight: 800, cursor: "pointer", boxShadow: "0 6px 18px rgba(51,45,28,0.18)" },
  micButtonActive: { background: "#c83f32", boxShadow: "0 0 0 8px rgba(200,63,50,0.14)" },
  micIcon: { fontSize: "1.35rem" },
  nextButton: { width: "100%", marginTop: "0.75rem", minHeight: 48, border: 0, borderRadius: 10, background: "#ffc000", color: "#332d1c", fontWeight: 800, fontSize: "1rem", cursor: "pointer" },
  disabledButton: { opacity: 0.45, cursor: "not-allowed" },
  completePanel: { width: "100%", maxWidth: 560, margin: "0 auto", padding: "4rem 1rem", boxSizing: "border-box", textAlign: "center" },
  completeMascot: { width: 180, height: 180, objectFit: "contain" },
  completeTitle: { fontSize: "1.5rem", lineHeight: 1.3 },
  supportingText: { color: "#765800", lineHeight: 1.5 },
  primaryButton: { marginTop: "1.25rem", padding: "0.9rem 1.4rem", border: 0, borderRadius: 10, background: "#332d1c", color: "#fff", fontWeight: 800, cursor: "pointer" },
};

export default AddMealPageAI;
