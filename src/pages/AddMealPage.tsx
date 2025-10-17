import React, { useState } from "react";

type Language = "fr" | "en" | "mfe" | "rcf";
type InputMethod = "text" | "voice" | null;
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

interface AddMealPageProps {
  language: Language;
  onBack: () => void;
  onAddMeal: (mealData: MealData) => void;
  onNavigate: (page: Page) => void;
}

const translations = {
  fr: {
    addMeal: "Ajouter un repas",
    initialQuestion:
      "Pouvez-vous décrire chacune de vos prises alimentaires que vous avez eues hier, depuis le moment où vous vous êtes levé jusqu'au moment du coucher ?",
    infoDetails: `COMPOSITION, aliments solides et liquides : en clair, le plus détaillé possible.
Si marques/label : les intégrer.
Si pain : Précisez (blanc, complet, autre) 
Si riz : type de riz
Si eau : eau courante (du robinet) OU eau en bouteille (eau minérale ou eau de source, eau plate ou gazeuse) 
Quand  jus de fruit  préciser si en brique, en bouteille ou "frais fait maison" 

PROVENANCE ET MODES DE PRÉPARATION DES ALIMENTS :
Cuisiné par qui ? Livré …
Si acheté : lieu d'achat ? mode de distribution ? provenance géographique ?

LIEU, SOCIABILITE ET MODALITÉS DE CONSOMMATION :
Lieu : au domicile, au travail (préciser où exactement dans ce contexte), lieu d'étude (cantine, cafétéria, RU…), à côté du lieu d'étude, dans la rue, au restaurant, chez des amis, autres…préciser.
Sociabilité :  Seul.e ? accompagné.e ? Durée du repas ?
Modalités : Debout ? Assis ?  Est-ce que vous faisiez quelque chose en mangeant ?`,
    chooseMethod: "Choisissez votre méthode",
    textInput: "Saisie texte",
    voiceInput: "Saisie vocale",
    textDescription: "Répondez aux questions une par une",
    voiceDescription: "Enregistrez vos réponses vocalement",
    questions: [
      "À quelle heure avez-vous commencé votre repas ?",
      "Comment appelez-vous ce moment ?",
      "Indiquez les ingrédients consommés",
      "Ce repas a-t-il été cuisiné par vous-même ou par un membre de votre famille ?",
      "Où avez-vous pris votre repas ?",
      "Étiez-vous seul·e ou accompagné·e ?",
      "Étiez-vous debout ou assis·e ? Faisiez-vous autre chose en mangeant ?",
      "Combien de temps a duré ce repas ?",
      "En quoi ce repas diffère-t-il de vos habitudes alimentaires ?",
    ],
    questionDetails: [
      "HEURE DE LA CONSOMMATION\nÀ quelle heure avez-vous commencé votre repas ?",
      "DÉNOMINATION DE LA PRISE\nChacun a son propre vocabulaire pour désigner une prise alimentaire. Il peut s'agir d'un goûter, d'un apéro, d'un petit-déjeuner…\nComment appelez-vous ce moment ?",
      "COMPOSITION — ALIMENTS SOLIDES ET LIQUIDES\nIndiquez les ingrédients consommés.\nSi vous avez mangé du pain, précisez le type de pain.\nSi vous avez mangé du riz, indiquez le type de riz.\nSi vous avez bu de l'eau, précisez s'il s'agit d'eau du robinet ou d'eau en bouteille (minérale, de source, plate ou gazeuse).\nSi vous avez bu du jus de fruits, indiquez le type de jus.\nMentionnez les marques et labels si possible.",
      "MODE DE PRÉPARATION DES ALIMENTS\nCe repas a-t-il été cuisiné par vous-même ou par un membre de votre famille ?\nA-t-il été acheté ou livré ?\nSi oui, quel est le lieu d'achat ou de livraison ?",
      "LIEU\nOù avez-vous pris votre repas ?\n– au domicile\n– au travail (précisez l'endroit exact)\n– sur le lieu d'étude (cantine, cafétéria, restaurant universitaire…)\n– à proximité du lieu d'étude\n– dans la rue\n– au restaurant\n– chez des amis\n– autre (à préciser)",
      "SOCIABILITÉ\nÉtiez-vous seul·e ou accompagné·e ?",
      "MODALITÉS\nÉtiez-vous debout ou assis·e ?\nFaisiez-vous autre chose en mangeant ?",
      "DURÉE\nCombien de temps a duré ce repas ?",
      "DIFFÉRENCES PAR RAPPORT À L'HABITUDE\nEn quoi ce repas diffère-t-il de vos habitudes alimentaires ?",
    ],
    startRecording: "Commencer l'enregistrement",
    stopRecording: "Arrêter l'enregistrement",
    recording: "Enregistrement en cours...",
    next: "Suivant",
    previous: "Précédent",
    finish: "Terminer",
    yourAnswer: "Votre réponse",
    saveMeal: "Enregistrer le repas",
    locations: {
      home: "À domicile",
      work: "Au travail",
      school: "À l'école/université",
      canteen: "Cantine/cafétéria",
      restaurant: "Restaurant",
      fastfood: "Fast-food",
      friends: "Chez des amis/famille",
      street: "Dans la rue",
      transport: "Dans les transports",
      other: "Autre",
    },
    otherLocation: "Précisez le lieu",
    selectTime: "Sélectionnez l'heure",
    duration: "Durée",
    minutes: "minutes",
    hours: "heures",
    mealAddedSuccess: "Repas ajouté avec succès !",
    mealSavedMessage:
      "Votre repas a été enregistré dans votre journal alimentaire.",
    nextQuestion: "Question suivante",
    addAnotherMeal: "Ajouter un autre repas",
    backToHome: "Retour à l'accueil",
  },
  en: {
    addMeal: "Add meal",
    initialQuestion:
      "Can you describe each of your food intakes that you had yesterday, from the moment you woke up until bedtime?",
    infoDetails: `COMPOSITION, solid and liquid foods: clearly, as detailed as possible.
If brands/labels: include them.
If bread: Specify (white, whole grain, other)
If rice: type of rice
If water: tap water OR bottled water (mineral water or spring water, still or sparkling)
When fruit juice specify if carton, bottle or "fresh homemade"

ORIGIN AND FOOD PREPARATION METHODS:
Cooked by whom? Delivered...
If bought: place of purchase? distribution method? geographical origin?

PLACE, SOCIABILITY AND CONSUMPTION METHODS:
Place: at home, at work (specify exactly where in this context), place of study (canteen, cafeteria, university restaurant...), next to the place of study, on the street, at a restaurant, at friends' place, others...specify.
Sociability: Alone? accompanied? Meal duration?
Methods: Standing? Sitting? Were you doing something while eating?`,
    chooseMethod: "Choose your method",
    textInput: "Text Input",
    voiceInput: "Voice Input",
    textDescription: "Answer questions one by one",
    voiceDescription: "Record your answers vocally",
    questions: [
      "What time did you start your meal?",
      "What do you call this moment?",
      "Indicate the ingredients consumed",
      "Was this meal cooked by yourself or by a family member?",
      "Where did you have your meal?",
      "Were you alone or accompanied?",
      "Were you standing or sitting? Were you doing something else while eating?",
      "How long did this meal last?",
      "How does this meal differ from your eating habits?",
    ],
    questionDetails: [
      "CONSUMPTION TIME\nWhat time did you start your meal?",
      "MEAL DESIGNATION\nEveryone has their own vocabulary to designate a food intake. It can be a snack, an aperitif, breakfast...\nWhat do you call this moment?",
      "COMPOSITION — SOLID AND LIQUID FOODS\nIndicate the ingredients consumed.\nIf you ate bread, specify the type of bread.\nIf you ate rice, indicate the type of rice.\nIf you drank water, specify whether it was tap water or bottled water (mineral, spring, still or sparkling).\nIf you drank fruit juice, indicate the type of juice.\nMention brands and labels if possible.",
      "FOOD PREPARATION METHOD\nWas this meal cooked by yourself or by a family member?\nWas it bought or delivered?\nIf yes, what is the place of purchase or delivery?",
      "LOCATION\nWhere did you have your meal?\n– at home\n– at work (specify the exact location)\n– at the place of study (canteen, cafeteria, university restaurant...)\n– near the place of study\n– on the street\n– at a restaurant\n– at friends' place\n– other (to specify)",
      "SOCIABILITY\nWere you alone or accompanied?",
      "MODALITIES\nWere you standing or sitting?\nWere you doing something else while eating?",
      "DURATION\nHow long did this meal last?",
      "DIFFERENCES FROM HABIT\nHow does this meal differ from your eating habits?",
    ],
    startRecording: "Start Recording",
    stopRecording: "Stop Recording",
    recording: "Recording...",
    next: "Next",
    previous: "Previous",
    finish: "Finish",
    yourAnswer: "Your answer",
    saveMeal: "Save meal",
    locations: {
      home: "At home",
      work: "At work",
      school: "At school/university",
      canteen: "Canteen/cafeteria",
      restaurant: "Restaurant",
      fastfood: "Fast food",
      friends: "At friends/family",
      street: "On the street",
      transport: "In transport",
      other: "Other",
    },
    otherLocation: "Specify location",
    selectTime: "Select time",
    duration: "Duration",
    minutes: "minutes",
    hours: "hours",
    mealAddedSuccess: "Meal added successfully!",
    mealSavedMessage: "Your meal has been saved to your food diary.",
    nextQuestion: "Next question",
    addAnotherMeal: "Add another meal",
    backToHome: "Back to home",
  },
  mfe: {
    addMeal: "Azout manze",
    initialQuestion:
      "Eske ou kapav dekrir sak manze ou ti manze yer, depi kan ou ti leve ziska kan ou ti dormi?",
    infoDetails: `KONPOZISYON: Dekrir to manze solid ek likid byen detaye.
Si ena marka/label: mete li.
Si du pen: dir ki kalite (blan, konple, lot)
Si diri: ki kalite diri
Si dilo: dilo robine OU dilo boutey (mineral, gazez)
Si zu fri: boutey, brik OU "fer lakaz"

KOT LI SORTI EK KOUMA PREPARE:
Kizine par ki? Livre...
Si asete: kot asete? ki distibisyon?

KOTE, AR KI EK KOUMA MANZE:
Kot: lakaz, travay, lekol, restoran, ar kamarad...
Ar ki: sel OU ar dimoun? Konbyen tan?
Kouma: debout? asiz? To ti pe fer kisaz kan to manze?`,
    chooseMethod: "Swazir to fason",
    textInput: "Ekrir",
    voiceInput: "Diksyoner",
    textDescription: "Repond bann kesyon en par en",
    voiceDescription: "Enrezistre to bann repons",
    questions: [
      "Ki ler ou ti komas manze?",
      "Kouma ou apel sa moman la?",
      "Dir ki bann ingedient ou ti manze",
      "Sa manze la, to mem ou en dimoun lakaz ki ti kizine?",
      "Kot ou ti pran to manze?",
      "To ti sel ou to ti ar dimoun?",
      "To ti debout ou asiz? To ti pe fer lot kisaz kan to manze?",
      "Konbyen tan to ti pran pou manze?",
      "Kouma sa manze la diferan ek to fason manze abitiel?",
    ],
    questionDetails: [
      "LER KONSOMATION\nKi ler ou ti komas manze?",
      "DENOMINASYON PRIZ\nSakenn ena so prop vokabiler pou dir en priz alimanter. Li kapav en gouter, en apero, en ti dezene...\nKouma ou apel sa moman la?",
      "KONPOZISYON — MANZE SOLID EK LIKID\nDir ki bann ingedient ou ti manze.\nSi ou ti manze dipen, dir ki kalite dipen.\nSi ou ti manze diri, dir ki kalite diri.\nSi ou ti bwar dilo, dir si ti dilo robinet ou dilo boutey (mineral, lasours, plat ou gazoz).\nSi ou ti bwar zu fri, dir ki kalite zu.\nMet bann mark ek label si posib.",
      "FASON PREPARE MANZE\nSa manze la, to mem ou en dimoun lakaz ki ti kizine?\nLi ti asete ou livre?\nSi wi, kot ki kote asete ou livrer?",
      "KOTE\nKot ou ti pran to manze?\n– lakaz\n– travay (dir ekzakteman kot)\n– kote etid (kantin, kafeteria, restoran iniversite...)\n– kote pres kote etid\n– dan lari\n– restoran\n– lakaz kamarad\n– lot (eksplik)",
      "SOSYABILITE\nTo ti sel ou to ti ar dimoun?",
      "MODALITE\nTo ti debout ou asiz?\nTo ti pe fer lot kisaz kan to manze?",
      "DIRE\nKonbyen tan to ti pran pou manze?",
      "DIFERANS EK ABITYID\nKouma sa manze la diferan ek to fason manze abitiel?",
    ],
    startRecording: "Komas anrezitre",
    stopRecording: "Aret anrezitre",
    recording: "Ape anrezitre...",
    next: "Swivan",
    previous: "Devan",
    finish: "Fini",
    yourAnswer: "To repons",
    saveMeal: "Sov manze",
    locations: {
      home: "Lakaz",
      work: "Travay",
      school: "Lekol/iniversite",
      canteen: "Kantin/kafeteria",
      restaurant: "Restoran",
      fastfood: "Fast-food",
      friends: "Lakaz kamarad/lafamiy",
      street: "Dan lari",
      transport: "Dan transpor",
      other: "Lot",
    },
    otherLocation: "Dir kot",
    selectTime: "Swazir ler",
    duration: "Konbyen tan",
    minutes: "minit",
    hours: "ler",
    mealAddedSuccess: "Manze finn azout !",
    mealSavedMessage: "To manze finn anrezistre dan to zurnal manze.",
    nextQuestion: "Kesyon sivan",
    addAnotherMeal: "Azout en lot manze",
    backToHome: "Retour lakaz",
  },
  rcf: {
    addMeal: "Azout manzé",
    initialQuestion:
      "Èske ou kapav dékrir sak manzé ou té manzé yèr, dépi kan ou té lévé ziska kan ou té dormi?",
    infoDetails: `KONPOZISYON: Dékrir to manzé solid èk likid byin détayé.
Si èna mark/label: mèt li.
Si di pin: dir ki kalité (blan, konplè, lot)
Si diri: ki kalité diri
Si dilo: dilo robinèt OU dilo boutèy (minéral, gazèz)
Si zi fri: boutèy, brik OU "fèr lakaz"

KOT LI SORTI ÈK KOUMA PRÉPARE:
Kizinn par ki? Livré...
Si astè: kot astè? ki distribisyon?

KOTÉ, AR KI ÈK KOUMA MANZÉ:
Kot: lakaz, travay, lékol, restoran, ar kamarad...
Ar ki: sèl OU ar dimoun? Konbyin tan?
Kouma: débout? asiz? To té pé fèr kisaz kan to manzé?`,
    chooseMethod: "Swazir to fason",
    textInput: "Ékrir",
    voiceInput: "Diksyoné",
    textDescription: "Répond bann késyon ènn par ènn",
    voiceDescription: "Anrézistré to bann répons",
    questions: [
      "Ki lèr ou té komans manzé?",
      "Kouma ou apèl sa moman la?",
      "Dir ki bann ingrédiàn ou té manzé",
      "Sa manzé la, to mèm ou ènn dimoun lakaz ki té kizinn?",
      "Koté ou té pran to manzé?",
      "To té sèl ou to té ar dimoun?",
      "To té débout ou asiz? To té pé fèr lot kisaz kan to manzé?",
      "Konbyèn tan to té pran pou manzé?",
      "Kouma sa manzé la diférèn èk to fason manzé abitiyèl?",
    ],
    questionDetails: [
      "LÈR KONSOMATION\nKi lèr ou té komans manzé?",
      "DÉNOMINATION PRIZ\nSakènn éna so prop vokabiyé pou dir ènn priz alimantèr. Li kapav ènn goutèr, ènn apéro, ènn ti dézènè...\nKouma ou apèl sa moman la?",
      "KONPOZISYON — MANZÉ SOLID ÈK LIKID\nDir ki bann ingrédiàn ou té manzé.\nSi ou té manzé dipèn, dir ki kalité dipèn.\nSi ou té manzé diri, dir ki kalité diri.\nSi ou té bwar dilo, dir si té dilo robinèt ou dilo boutèy (minéral, lasours, plat ou gazèz).\nSi ou té bwar zi fri, dir ki kalité zi.\nMèt bann mark èk labèl si posib.",
      "FASON PRÉPARE MANZÉ\nSa manzé la, to mèm ou ènn dimoun lakaz ki té kizinn?\nLi té astè ou livré?\nSi wi, koté ki koté astè ou livrè?",
      "KOTÉ\nKoté ou té pran to manzé?\n– lakaz\n– travay (dir èkzakteman koté)\n– koté étid (kantin, kafétèria, rèstoran inivèrsité...)\n– koté prè koté étid\n– dan lari\n– rèstoran\n– lakaz kamarad\n– lot (èksplik)",
      "SOSYABILITÉ\nTo té sèl ou to té ar dimoun?",
      "MODALITÉ\nTo té débout ou asiz?\nTo té pé fèr lot kisaz kan to manzé?",
      "DIRÉ\nKonbyèn tan to té pran pou manzé?",
      "DIFÉRÈNS ÈK ABITIYID\nKouma sa manzé la diférèn èk to fason manzé abitiyèl?",
    ],
    startRecording: "Komans anrézistré",
    stopRecording: "Arèt anrézistré",
    recording: "Apé anrézistré...",
    next: "Swivan",
    previous: "Dovan",
    finish: "Fini",
    yourAnswer: "To répons",
    saveMeal: "Sov manzé",
    locations: {
      home: "Lakaz",
      work: "Travay",
      school: "Lékol/inivèrsité",
      canteen: "Kantin/kafétèria",
      restaurant: "Restoran",
      fastfood: "Fast-food",
      friends: "Lakaz kamarad/lafamiy",
      street: "Dan lari",
      transport: "Dan transpor",
      other: "Lot",
    },
    otherLocation: "Dir koté",
    selectTime: "Swazir lèr",
    duration: "Konbyèn tan",
    minutes: "minit",
    hours: "lèr",
    mealAddedSuccess: "Manzé finn azouté !",
    mealSavedMessage: "To manzé finn anrézistré dan to zournal manzé.",
    nextQuestion: "Kèsyon sivan",
    addAnotherMeal: "Azout ènn lot manzé",
    backToHome: "Rétour lakaz",
  },
};

const AddMealPage: React.FC<AddMealPageProps> = ({
  language,
  onBack,
  onAddMeal,
  onNavigate,
}) => {
  const t = translations[language];
  const [showInitialQuestion, setShowInitialQuestion] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showSuccessPage, setShowSuccessPage] = useState(false);
  const [inputMethod, setInputMethod] = useState<InputMethod>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(
    new Array(t.questions.length).fill("")
  );
  const [isRecording, setIsRecording] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [mealCount, setMealCount] = useState(1);
  const maxMeals = 10;

  // Special input states
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [otherLocationText, setOtherLocationText] = useState("");
  const [durationNumber, setDurationNumber] = useState("");
  const [durationUnit, setDurationUnit] = useState("minutes");
  const [savedMealData, setSavedMealData] = useState<MealData | null>(null);

  const [showQuestionDetail, setShowQuestionDetail] = useState(false);

  // Helper functions to identify question types
  const isTimeQuestion = (index: number) => index === 0; // "What time did you consume this meal?"
  const isLocationQuestion = (index: number) => index === 4; // "Where did you consume this meal?"
  const isDurationQuestion = (index: number) => index === 7; // "How long did this meal last?"

  // Get current answer based on question type
  const getCurrentAnswerValue = () => {
    if (isTimeQuestion(currentQuestionIndex)) {
      return selectedTime;
    } else if (isLocationQuestion(currentQuestionIndex)) {
      return selectedLocation === "other"
        ? otherLocationText
        : selectedLocation;
    } else if (isDurationQuestion(currentQuestionIndex)) {
      return durationNumber && durationUnit
        ? `${durationNumber} ${durationUnit}`
        : "";
    } else {
      return currentAnswer;
    }
  };

  // Reset special inputs when changing questions
  const resetSpecialInputs = () => {
    setSelectedTime("");
    setSelectedLocation("");
    setOtherLocationText("");
    setDurationNumber("");
    setDurationUnit("minutes");
  };

  const handleMethodSelect = (method: InputMethod) => {
    setInputMethod(method);
    setCurrentQuestionIndex(0);
  };

  const handleNextQuestion = () => {
    if (inputMethod === "text") {
      const updatedAnswers = [...answers];
      updatedAnswers[currentQuestionIndex] = getCurrentAnswerValue();
      setAnswers(updatedAnswers);
      setCurrentAnswer("");
      resetSpecialInputs();
    }

    setShowQuestionDetail(false); // Reset question detail display

    if (currentQuestionIndex < t.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Finished all questions
      handleFinish();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      if (inputMethod === "text") {
        const previousAnswer = answers[currentQuestionIndex - 1] || "";
        setCurrentAnswer(previousAnswer);
        resetSpecialInputs();

        // Parse previous answers for special input types
        const prevIndex = currentQuestionIndex - 1;
        if (isTimeQuestion(prevIndex)) {
          setSelectedTime(previousAnswer);
        } else if (isLocationQuestion(prevIndex)) {
          const locationKeys = Object.keys(t.locations);
          if (locationKeys.includes(previousAnswer)) {
            setSelectedLocation(previousAnswer);
          } else {
            setSelectedLocation("other");
            setOtherLocationText(previousAnswer);
          }
        } else if (isDurationQuestion(prevIndex)) {
          const match = previousAnswer.match(
            /^(\d+)\s+(minutes|hours|minit|ler|lèr|heures)$/
          );
          if (match) {
            setDurationNumber(match[1]);
            setDurationUnit(match[2]);
          }
        }
      }
      setShowQuestionDetail(false); // Reset question detail display
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleRecordingToggle = () => {
    setIsRecording(!isRecording);
    // Here you would implement actual voice recording logic
    // For now, we'll just simulate it
  };

  const handleFinish = () => {
    let finalAnswers = answers;
    if (inputMethod === "text") {
      const updatedAnswers = [...answers];
      updatedAnswers[currentQuestionIndex] = getCurrentAnswerValue();
      finalAnswers = updatedAnswers;
      setAnswers(updatedAnswers);
    }

    // Create meal data object
    const timeString = finalAnswers[0] || "12:00"; // Time from first question
    const dateString = new Date().toISOString().split("T")[0]; // Today's date in YYYY-MM-DD format
    const fullDateTime = `${dateString}T${timeString}:00`; // Create full datetime string

    const mealData: MealData = {
      id: Date.now(), // Simple ID generation
      time: fullDateTime, // Full datetime string
      name:
        finalAnswers[1] ||
        `${t.addMeal} ${new Date().getHours()}:${new Date()
          .getMinutes()
          .toString()
          .padStart(2, "0")}`, // Meal name from second question or default
      duration: finalAnswers[7] || "30 minutes", // Duration from eighth question
      answers: finalAnswers,
      method: inputMethod || "text",
      date: dateString, // Today's date in YYYY-MM-DD format
    };

    // Store meal data for later saving
    setSavedMealData(mealData);

    // Show success page
    setShowSuccessPage(true);
  };

  const isLastQuestion = currentQuestionIndex === t.questions.length - 1;

  // Success page
  if (showSuccessPage) {
    return (
      <>
        <div className="app-header">
          <div></div>
          <h1 className="app-header-title">{t.addMeal}</h1>
          <div></div>
        </div>
        <div className="page-content-full">
          <div
            style={{
              textAlign: "center",
              padding: "3rem 2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "60vh",
            }}
          >
            {/* Success Icon */}
            <div
              style={{
                fontSize: "4rem",
                marginBottom: "2rem",
                color: "#28a745",
              }}
            >
              ✅
            </div>
            {/* Meal counter */}
            <div
              style={{ marginBottom: "1rem", color: "#333", fontWeight: 600 }}
            >
              {mealCount} / {maxMeals} {t.addMeal}
            </div>
            {/* Success Message */}
            <h2
              style={{
                fontSize: "1.5rem",
                marginBottom: "1rem",
                color: "#28a745",
                fontWeight: "600",
              }}
            >
              {t.mealAddedSuccess}
            </h2>
            <p
              style={{
                fontSize: "1rem",
                marginBottom: "3rem",
                color: "#666",
                lineHeight: "1.5",
                maxWidth: "300px",
              }}
            >
              {t.mealSavedMessage}
            </p>
            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                width: "100%",
                maxWidth: "280px",
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowSuccessPage(false);
                  setShowInitialQuestion(true);
                  setInputMethod(null);
                  setCurrentQuestionIndex(0);
                  setAnswers(new Array(t.questions.length).fill(""));
                  setCurrentAnswer("");
                  setSelectedTime("");
                  setSelectedLocation("");
                  setOtherLocationText("");
                  setDurationNumber("");
                  setDurationUnit("minutes");
                  setSavedMealData(null);
                  setMealCount(mealCount + 1);
                }}
                style={{
                  backgroundColor: mealCount >= maxMeals ? "#ccc" : "white",
                  color: mealCount >= maxMeals ? "#888" : "#333",
                  border: mealCount >= maxMeals ? "2px solid #ccc" : "2px solid #333",
                  borderRadius: "25px",
                  padding: "1.2rem 2rem",
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  cursor: mealCount >= maxMeals ? "not-allowed" : "pointer",
                  boxShadow: mealCount >= maxMeals ? "none" : "0 6px 20px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                  width: "100%",
                  marginBottom: "0.5rem",
                  pointerEvents: mealCount >= maxMeals ? "none" : "auto",
                }}
                disabled={mealCount >= maxMeals}
                onMouseEnter={(e) => {
                  if (mealCount < maxMeals) {
                    e.currentTarget.style.backgroundColor = "#333";
                    e.currentTarget.style.color = "white";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.2)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (mealCount < maxMeals) {
                    e.currentTarget.style.backgroundColor = "white";
                    e.currentTarget.style.color = "#333";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)";
                  }
                }}
              >
                {t.addAnotherMeal}
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (savedMealData) {
                    onAddMeal(savedMealData);
                  }
                  onNavigate("supplies");
                }}
                style={{
                  backgroundColor: "#333",
                  color: "white",
                  border: "none",
                  borderRadius: "25px",
                  padding: "1.2rem 2rem",
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                  transition: "all 0.3s ease",
                  width: "100%",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#555";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#333";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.2)";
                }}
              >
                {t.nextQuestion}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Initial question screen
  if (showInitialQuestion) {
    return (
      <>
        <div className="app-header">
          <button onClick={onBack} className="header-icon">
            ←
          </button>
          <h1 className="app-header-title">{t.addMeal}</h1>
          <div></div>
        </div>
        <div className="page-content-full">
          <div
            style={{
              textAlign: "center",
              marginBottom: "3rem",
              padding: "2rem 1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                gap: "0.5rem",
                marginBottom: "2rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.3rem",
                  lineHeight: "1.5",
                  color: "#333",
                  margin: 0,
                  flex: 1,
                  textAlign: "left",
                }}
              >
                {t.initialQuestion}
              </h2>
              <button
                onClick={() => setShowInfoModal(true)}
                style={{
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  fontSize: "14px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: "2px",
                }}
              >
                i
              </button>
            </div>
            <button
              className="btn btn-primary"
              onClick={() => setShowInitialQuestion(false)}
              style={{ width: "100%", padding: "1rem", fontSize: "1.1rem" }}
            >
              {t.addMeal}
            </button>
          </div>
        </div>

        {/* Info Modal */}
        {showInfoModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "1rem",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "1.5rem",
                maxWidth: "90%",
                maxHeight: "80%",
                overflow: "auto",
                position: "relative",
              }}
            >
              <button
                onClick={() => setShowInfoModal(false)}
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "15px",
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                ×
              </button>
              <h3 style={{ marginTop: 0, marginBottom: "1rem", color: "#333" }}>
                Instructions détaillées
              </h3>
              <pre
                style={{
                  whiteSpace: "pre-wrap",
                  fontFamily: "inherit",
                  fontSize: "14px",
                  lineHeight: "1.5",
                  margin: 0,
                  color: "#333",
                }}
              >
                {t.infoDetails}
              </pre>
            </div>
          </div>
        )}
      </>
    );
  }

  // Method selection screen
  if (inputMethod === null) {
    return (
      <>
        <div className="app-header">
          <button onClick={onBack} className="header-icon">
            ←
          </button>
          <h1 className="app-header-title">{t.addMeal}</h1>
          <div></div>
        </div>
        <div className="page-content-full">
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>
              {t.chooseMethod}
            </h2>
          </div>

          <div className="meal-method-selector">
            <button
              className="meal-method-button"
              onClick={() => handleMethodSelect("text")}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📝</div>
              <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                {t.textInput}
              </div>
              <div style={{ fontSize: "0.9rem", opacity: 0.7 }}>
                {t.textDescription}
              </div>
            </button>

            <button
              className="meal-method-button"
              onClick={() => handleMethodSelect("voice")}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎤</div>
              <div style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                {t.voiceInput}
              </div>
              <div style={{ fontSize: "0.9rem", opacity: 0.7 }}>
                {t.voiceDescription}
              </div>
            </button>
          </div>
        </div>
      </>
    );
  }

  // Questions screen
  return (
    <>
      <div className="app-header">
        <button
          onClick={
            currentQuestionIndex === 0
              ? () => setInputMethod(null)
              : handlePreviousQuestion
          }
          className="header-icon"
        >
          ←
        </button>
        <h1 className="app-header-title">
          {t.addMeal} ({currentQuestionIndex + 1}/{t.questions.length})
        </h1>
        <div></div>
      </div>
      <div className="page-content-full">
        <div style={{ marginBottom: "2rem" }}>
          <div style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "0.5rem",
            marginBottom: "1rem",
          }}>
            <h2
              style={{
                fontSize: "1.2rem",
                marginBottom: "0",
                lineHeight: "1.5",
                flex: 1,
              }}
            >
              {t.questions[currentQuestionIndex]}
            </h2>
            <button
              onClick={() => setShowQuestionDetail(!showQuestionDetail)}
              style={{
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                fontSize: "14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: "2px",
              }}
            >
              i
            </button>
          </div>

          {/* Detailed question information */}
          {showQuestionDetail && (
            <div
              style={{
                backgroundColor: "#f8f9fa",
                border: "1px solid #e9ecef",
                borderRadius: "8px",
                padding: "1rem",
                marginBottom: "1rem",
                fontSize: "0.9rem",
                lineHeight: "1.5",
                whiteSpace: "pre-line",
              }}
            >
              {t.questionDetails[currentQuestionIndex]}
            </div>
          )}

          {inputMethod === "text" && (
            <div>
              {/* Time selector for question 0 */}
              {isTimeQuestion(currentQuestionIndex) && (
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                    }}
                  >
                    {t.selectTime}:
                  </label>
                  <input
                    type="time"
                    className="input-field"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    style={{ fontSize: "1rem", padding: "0.75rem" }}
                  />
                </div>
              )}

              {/* Location dropdown for question 4 */}
              {isLocationQuestion(currentQuestionIndex) && (
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                    }}
                  >
                    {t.yourAnswer}:
                  </label>
                  <select
                    className="input-field"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    style={{
                      fontSize: "1rem",
                      padding: "0.75rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <option value="">Sélectionnez un lieu...</option>
                    {Object.entries(t.locations).map(([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    ))}
                  </select>

                  {selectedLocation === "other" && (
                    <input
                      type="text"
                      className="input-field"
                      placeholder={t.otherLocation}
                      value={otherLocationText}
                      onChange={(e) => setOtherLocationText(e.target.value)}
                      style={{ fontSize: "1rem", padding: "0.75rem" }}
                    />
                  )}
                </div>
              )}

              {/* Duration selector for question 7 */}
              {isDurationQuestion(currentQuestionIndex) && (
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "600",
                    }}
                  >
                    {t.duration}:
                  </label>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="number"
                      min="1"
                      max="999"
                      className="input-field"
                      placeholder="0"
                      value={durationNumber}
                      onChange={(e) => setDurationNumber(e.target.value)}
                      style={{
                        fontSize: "1rem",
                        padding: "0.75rem",
                        width: "100px",
                      }}
                    />
                    <select
                      className="input-field"
                      value={durationUnit}
                      onChange={(e) => setDurationUnit(e.target.value)}
                      style={{
                        fontSize: "1rem",
                        padding: "0.75rem",
                        width: "auto",
                      }}
                    >
                      <option value="minutes">{t.minutes}</option>
                      <option value="hours">{t.hours}</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Regular text input for other questions */}
              {!isTimeQuestion(currentQuestionIndex) &&
                !isLocationQuestion(currentQuestionIndex) &&
                !isDurationQuestion(currentQuestionIndex) && (
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "600",
                      }}
                    >
                      {t.yourAnswer}:
                    </label>
                    <textarea
                      className="input-field"
                      rows={4}
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="Tapez votre réponse ici..."
                      style={{ minHeight: "100px", resize: "vertical" }}
                    />
                  </div>
                )}
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "auto" }}>
          {currentQuestionIndex > 0 && (
            <button
              className="btn btn-secondary"
              onClick={handlePreviousQuestion}
              style={{ flex: 1 }}
            >
              {t.previous}
            </button>
          )}

          <button
            className="btn btn-primary"
            onClick={isLastQuestion ? handleFinish : handleNextQuestion}
            disabled={inputMethod === "text" && !getCurrentAnswerValue().trim()}
            style={{ flex: 2 }}
          >
            {isLastQuestion ? t.finish : t.next}
          </button>
        </div>

        {inputMethod === "voice" && (
          <div className="voice-recorder">
            <div
              className="voice-icon"
              style={{ fontSize: "4rem", marginBottom: "2rem" }}
            >
              🎤
            </div>

            {isRecording && (
              <div
                style={{
                  marginBottom: "2rem",
                  color: "#dc3545",
                  fontWeight: "600",
                }}
              >
                {t.recording}
              </div>
            )}

            <button
              className={`btn ${isRecording ? "btn-danger" : "btn-primary"}`}
              onClick={handleRecordingToggle}
              style={{
                marginBottom: "2rem",
                padding: "1rem 2rem",
                fontSize: "1.1rem",
                borderRadius: "50px",
              }}
            >
              {isRecording ? t.stopRecording : t.startRecording}
            </button>

            {isRecording && (
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  border: "3px solid #dc3545",
                  borderRadius: "50%",
                  margin: "0 auto",
                  animation: "pulse 1.5s infinite",
                }}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default AddMealPage;
