// Pure data and helpers; the narration script transpiles this file, so it must not import anything.
export type Mascot = 'boy' | 'girl';

export interface PresetGroup {
  id: string;
  label: string;
  options: string[];
  multiple?: boolean;
  exclusiveOption?: string;
  allowFreeText?: boolean;
}

export interface AnswerLite {
  mode: string;
  selections: Record<string, string[]>;
  typed?: string;
  voice?: string;
}

type AnswerLookup = (id: string) => AnswerLite | undefined;

export interface SurveyStep {
  id: string;
  number: number;
  label: string;
  text: string;
  intro?: string;
  hint?: string;
  ui: 'text' | 'choices' | 'occupations' | 'ranking';
  groups: PresetGroup[];
  textPrompt?: { label: string; when?: (selections: Record<string, string[]>) => boolean };
  expected: string;
  guidance: string;
  maxFollowUps: number;
  numeric?: { min: number; max: number; message: string };
  allowedValues?: string[];
  list?: { max: number };
  skipIf?: (get: AnswerLookup) => boolean;
}

// Recall of yesterday's intakes is one question (9) shown as "prise 1, 2, 3"; later questions are shifted by this count. Set to 2 for a separate question 10.
export const RECALL_ENABLED = true;
export const RECALL_QUESTION_COUNT = 1;
export const INTAKE_MAX = 15;

export type IntakeFieldId = 'time' | 'solids' | 'drinks' | 'name' | 'preparation' | 'place' | 'companionship' | 'context';
export type IntakeRecord = Partial<Record<IntakeFieldId, string | string[]>>;

export interface IntakeField {
  id: IntakeFieldId;
  label: string;
  kind: 'text' | 'single' | 'multi';
  options?: string[];
  question: string;
  guidance: string;
}

export const intakeIntro = 'On va maintenant revenir sur ta journée d’hier, depuis ton réveil jusqu’au moment où tu t’es couché(e). Essaie de te rappeler tout ce que tu as mangé et bu, même si cette journée était différente de d’habitude. On va avancer dans l’ordre, moment par moment.';
export const intakeOpeningFirst = 'Quelle est la première chose que tu as mangée ou bue après ton réveil ?';
export const intakeOpeningNext = 'Et après ça, quelle est la prochaine chose que tu as mangée ou bue ?';
export const intakeTimeFallback = 'C’était plutôt le matin, à midi, l’après-midi, le soir ou la nuit ?';
export const intakeSolidsMore = 'Est-ce qu’il y avait autre chose avec ?';
export const intakeEndCheck = 'Est-ce qu’il y avait autre chose que tu as mangé ou bu à ce moment-là ?';

export const intakeFields: IntakeField[] = [
  { id: 'time', label: 'Heure', kind: 'text', question: 'Vers quelle heure c’était ?', guidance: 'Heure approximative ou précise de la prise, retranscrite telle que dite par le répondant (par exemple « vers 7 heures »). Si le répondant ne peut pas donner d’heure, cannotSayTime=true. Ne jamais déduire une heure.' },
  { id: 'solids', label: 'Aliments', kind: 'text', question: 'Qu’est-ce que tu as mangé ? Pense aussi aux accompagnements.', guidance: 'Tous les aliments solides et accompagnements explicitement cités, avec les précisions données. Ne pas inventer la composition d’un plat.' },
  { id: 'drinks', label: 'Boissons', kind: 'text', question: 'Et qu’est-ce que tu as bu ?', guidance: 'Boisson(s) explicitement citée(s). Accepter « rien » ou équivalent (retranscrire « rien »). Ne pas déduire une boisson à partir des aliments.' },
  { id: 'name', label: 'Nom du moment', kind: 'text', question: 'Comment tu appelles ce moment où tu as mangé ou bu ?', guidance: 'Nom donné spontanément par le répondant, avec ses propres mots. Ne jamais déduire « petit-déjeuner », « déjeuner », « goûter », « dîner » à partir de l’heure ou des aliments.' },
  { id: 'preparation', label: 'Préparation', kind: 'single', options: ['Fait-maison', 'Prêt à cuire', 'Achété extérieur', 'Mixte entre fait-maison et achété extérieur'], question: 'Ces aliments étaient plutôt faits maison, prêts à cuire, achetés à l’extérieur, ou un mélange de fait maison et d’acheté extérieur ?', guidance: 'Une modalité uniquement si le répondant l’a explicitement donnée. Ne pas choisir ni recoder à sa place.' },
  { id: 'place', label: 'Lieu', kind: 'single', options: ['Là où je vis ou chez mes proches', 'Au collège ou aux abords du collège', 'À l’extérieur'], question: 'Où est-ce que tu les as mangés ou bus : là où tu vis ou chez des proches, au collège ou aux abords du collège, ou à l’extérieur ?', guidance: 'Une modalité uniquement si le lieu a été explicitement donné. Ne pas recoder un lieu ambigu à sa place.' },
  { id: 'companionship', label: 'Avec qui', kind: 'single', options: ['Accompagné(e)', 'Seul(e)'], question: 'Tu étais seul(e) ou avec quelqu’un ?', guidance: '« Seul(e) » ou « Accompagné(e) » uniquement si explicitement dit. L’identité des personnes n’est pas demandée.' },
  { id: 'context', label: 'Contexte', kind: 'multi', options: ['Assis', 'Debout', 'Devant un écran TV', 'Devant un téléphone ou tablette', 'Sans autre activité', 'En discutant', 'En silence'], question: 'Et pendant que tu mangeais ou buvais, comment ça se passait ? Tu peux choisir plusieurs réponses : assis, debout, devant la télé, devant un téléphone ou une tablette, sans autre activité, en discutant ou en silence.', guidance: 'Une ou plusieurs modalités uniquement si explicitement données. Ne pas interpréter à sa place.' },
];

export const mascotNames: Record<Mascot, string> = { girl: 'NAÏA', boy: 'NOAH' };
export const aiConsentQuestion = 'Avant de commencer, après avoir écouté les explications des animateurs, acceptes-tu de participer à l’enquête OR-ALIM ?';
export const consentYesOption = 'Oui, je souhaite participer.';
export const consentNoOption = 'Non, je ne souhaite pas participer.';
export const declineMessage = 'Merci et peut-être à bientôt.';

export const consentParagraphs = (mascot: Mascot) => [
  'Bonjour,',
  `Enchanté ! Je m’appelle ${mascotNames[mascot]} et je vais t’accompagner pour répondre à l’enquête sur l’alimentation. Si tu as des questions ou que tu as besoin d’aide, n’hésite pas à demander à un animateur.`,
  'Je te rassure, il n’y a pas de bonne ou de mauvaise réponse : ce qui nous intéresse, c’est ce que toi, tu fais et tu penses réellement. Tu peux choisir de ne pas répondre à une question ou arrêter le questionnaire à tout moment, sans avoir à te justifier.',
  'Le questionnaire dure environ 30 minutes.',
];

export const consentIntroSpeech = (mascot: Mascot) => consentParagraphs(mascot).join('\n\n');
// The voice spells "OR-ALIM" letter by letter, so the spoken text writes the name as one word.
export const consentQuestionSpeech = [aiConsentQuestion.replace('OR-ALIM', 'ORALIM'), consentYesOption, consentNoOption].join('\n\n');
export const CONSENT_PAUSE_MS = 2000;

const NOT_CONSUMED = 'Je n’en consomme pas';
const yesNo = ['Oui', 'Non'];
const influenceOptions = ['Camarades', 'Famille/parents', 'Réseaux sociaux', 'Coachs sportifs et équivalents', 'Professionnels de santé', 'Moi-même', 'Autre'];
const householdOptions = ['Papa / représentant légal', 'Maman / représentant légal', 'Beau-père', 'Belle-mère', 'Frères/demi-frères', 'Sœurs/demi-sœurs', 'Grands-parents', 'Oncles/tantes', 'Autres', 'Personnes sans lien familial', 'Vit en foyer d’accueil', 'Préfère ne pas répondre'];
const parentRoles = ['Papa', 'Maman', 'Représentant légal 1', 'Représentant légal 2'];
const motivationOptions = ['Ça me fait plaisir', 'C’est tentant et facile d’en acheter', 'Il y en a à la maison', NOT_CONSUMED];
const frequencyOptions = ['Presque tous les jours', 'Régulièrement dans la semaine', 'Une à deux fois par mois'];
const socialOptions = ['En famille', 'Avec des amis', 'Seul(e)'];
const difficultyOptions = ['Très difficile', 'Difficile', 'Ni difficile ni facile', 'Facile', 'Très facile'];

const foods = [
  { key: 'a', name: 'Jus de fruits en brique', why: 'Pour les jus de fruits en brique ?', short: 'Les jus de fruits en brique ?' },
  { key: 'b', name: 'Sodas', why: 'Pour les sodas ?', short: 'Les sodas ?' },
  { key: 'c', name: 'Pizzas', why: 'Pour les pizzas ?', short: 'Les pizzas ?' },
  { key: 'd', name: 'Pains bouchons ou Lords', why: 'Pour les pains bouchons ou les Lords ?', short: 'Les pains bouchons ou les Lords ?' },
  { key: 'e', name: 'Hamburgers', why: 'Pour les hamburgers ?', short: 'Les hamburgers ?' },
  { key: 'f', name: 'Biscuits, pâtisseries ou gâteaux', why: 'Pour les biscuits, pâtisseries ou gâteaux ?', short: 'Les biscuits, pâtisseries ou gâteaux ?' },
];

const changes = [
  'Manger moins de produits sucrés ?',
  'Manger moins de produits gras ?',
  'Manger moins de viande ?',
  'Boire moins de boissons sucrées ?',
  'Manger moins salé ?',
  'Manger moins de riz ?',
  'Manger plus de légumes ?',
  'Manger plus de fruits ?',
  'Manger plus de légumes-racines, comme le manioc ou la patate douce ?',
  'Manger plus de grains ou de légumineuses, comme les lentilles, les pois du Cap ou les haricots secs ?',
  'Manger plus de produits locaux ?',
  'Manger plus de poissons ou de fruits de mer ?',
];

const letter = (index: number) => String.fromCharCode(97 + index);

export const firstValue = (answer: AnswerLite | undefined) => {
  if (!answer) return '';
  const selected = Object.values(answer.selections).flat()[0];
  return selected || answer.typed || answer.voice || '';
};

export const isYes = (value: string) => /^(oui|ouais)\b/i.test(value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, ''));

const answeredNo = (answer: AnswerLite | undefined) => Boolean(answer && answer.mode !== 'skipped' && firstValue(answer).trim() && !isYes(firstValue(answer)));

const notConsumed = (get: AnswerLookup, key: string) => Boolean(get(`11${key}`)?.selections[`q11${key}`]?.includes(NOT_CONSUMED));

const listGuidance = 'Recueillir les éléments cités : un seul suffit, c’est une réponse valide (relevant=true). L’objectif est d’en obtenir jusqu’à trois. Si moins de trois sont cités, c’est une relance (followUp=true) : demander si le répondant souhaite en ajouter, sans jamais l’exiger. Si le répondant dit qu’il n’a rien à ajouter (par exemple « non » ou « c’est tout »), garder sa réponse telle quelle avec relevant=true et followUp=false, et simplement accuser réception. Si plus de trois sont cités spontanément, c’est aussi une relance (followUp=true) : lui demander lesquels il souhaite retenir parmi les trois, sans sélectionner à sa place. Une fois trois éléments obtenus, ne plus relancer.';
const listRules: Partial<SurveyStep> = { maxFollowUps: 2, list: { max: 3 } };
const openGuidance = 'Recueillir la réponse telle qu’elle est formulée par le répondant. Si la réponse est très courte, vague ou difficile à comprendre, effectuer une seule relance neutre : « Tu peux m’en dire un peu plus ? ». Ne pas interpréter, catégoriser, compléter ou suggérer de réponse.';

const single = (id: string, number: number, text: string, options: string[], expected: string, guidance: string, extra: Partial<SurveyStep> = {}): SurveyStep => ({
  id, number, label: id, text, ui: 'choices', groups: [{ id: `q${id}`, label: text, options }], expected, guidance, maxFollowUps: 0, ...extra,
});

const open = (id: string, number: number, text: string, expected: string, guidance: string, extra: Partial<SurveyStep> = {}): SurveyStep => ({
  id, number, label: id, text, ui: 'text', groups: [], expected, guidance, maxFollowUps: 0, ...extra,
});

export const surveySteps: SurveyStep[] = [
  single('1', 1, 'Es-tu une fille, un garçon, autre ou tu ne souhaites pas répondre ?', ['Fille', 'Garçon', 'Autre', 'Préfère ne pas répondre'], 'Genre ou refus de réponse', 'Accepter la réponse. Ne pas relancer en cas de refus de réponse.'),
  open('2', 2, 'Quelle est ton année de naissance ?', 'Année de naissance : 2009–2018', 'Si la réponse est hors intervalle, ambiguë ou donnée sous une autre forme, demander une précision sans suggérer de réponse.', { numeric: { min: 2009, max: 2018, message: 'Ton année de naissance semble incorrecte. Peux-tu me la redonner ?' }, maxFollowUps: 2 }),
  open('3', 3, 'Dans quelle classe es-tu ?', 'Niveau scolaire : 6e, 5e, 4e ou 3e', 'Reconnaître les formulations équivalentes : 6e/sixième, 5e/cinquième, 4e/quatrième, 3e/troisième. Sinon demander de préciser.', { allowedValues: ['6e', '5e', '4e', '3e'], maxFollowUps: 2 }),
  open('4', 4, 'Dans quel quartier habites-tu ?', 'Quartier de résidence à La Réunion (974)', 'Si une commune est donnée à la place du quartier : demander plus précisément le quartier. Accepter les variantes orthographiques identifiables. Si ambigu, demander une précision.', { maxFollowUps: 2 }),
  open('5', 5, 'En te comptant, combien de personnes vivent chez toi ?', 'Nombre entier de 2 à 20', 'Si la réponse est vague, non numérique ou hors intervalle : demander un nombre précis.', { numeric: { min: 2, max: 20, message: 'Ce nombre me semble incorrect. Peux-tu me redonner le nombre de personnes qui vivent chez toi, en te comptant ?' }, maxFollowUps: 2 }),
  single('6', 6, 'Et parmi les personnes qui vivent chez toi, qui sont-elles ? Tu peux, par exemple, dire « mon père », « ma sœur »…', householdOptions, 'Une ou plusieurs catégories décrivant les personnes vivant avec l’adolescent', 'Recoder les réponses spontanées dans les catégories. Si la réponse est trop générale, demander uniquement la précision nécessaire. Ne pas relancer si le répondant préfère ne pas répondre.', {
    groups: [{ id: 'q6-personnes-du-foyer', label: 'Personnes vivant au foyer', options: householdOptions, multiple: true }],
    textPrompt: { label: 'Précise qui', when: selections => Boolean(selections['q6-personnes-du-foyer']?.includes('Autres')) },
    maxFollowUps: 1,
  }),
  {
    id: '7', number: 7, label: '7', text: 'Quels métiers font tes parents ou tes représentants légaux ?', ui: 'occupations',
    hint: 'Pour chaque personne, indique son métier ou coche « Ne travaille pas ».',
    groups: parentRoles.map(role => ({ id: `q7-${role}`, label: `Situation professionnelle de ${role}`, options: ['Ne travaille pas'], allowFreeText: true })),
    expected: 'Métier de chaque parent ou représentant légal, ou indication qu’il/elle ne travaille pas',
    guidance: 'Demander des précisions successives jusqu’à disposer de suffisamment d’informations pour identifier la catégorie socioprofessionnelle : métier exercé, fonction ou tâches principales, statut si nécessaire. Ne pas suggérer de métier ni de catégorie au répondant. Pour chaque personne, la valeur libre doit regrouper le métier, les tâches et le statut déjà connus.',
    maxFollowUps: 3,
  },
  single('8', 8, 'Est-ce que tu as de l’argent de poche : régulièrement, de temps en temps, ou pas du tout ?', ['Oui, de manière régulière', 'De temps en temps', 'Non'], 'Fréquence / existence d’argent de poche', 'Accepter une formulation équivalente et la recoder dans l’une des trois modalités.'),
  single('9', 9, 'Y a-t-il des choses que tu ne manges pas ou ne bois pas, quelle que soit la raison ?', yesNo, 'Présence ou absence d’aliments/boissons évités', 'Si oui : passer à la question sur les aliments évités et leurs raisons. Si non : poursuivre.'),
  open('10', 10, 'Qu’est-ce que tu ne manges pas ou ne bois pas, et pour quelle raison ?', 'Aliment(s) évité(s) et raison(s) associée(s)', 'Pour chaque élément cité, obtenir si possible l’aliment précis et la raison. Pour la viande, préciser s’il s’agit de toute viande ou d’un type de viande. Pour les catégories générales (légumes, grains, légumes-racines), demander lesquels, sans suggérer d’exemples sauf nécessité de compréhension.', {
    maxFollowUps: 3,
    skipIf: get => answeredNo(get('9')),
  }),
  ...foods.map((food, index): SurveyStep => ({
    id: `11${food.key}`, number: 11, label: `11${food.key}`, text: food.why, ui: 'choices',
    intro: index === 0 ? '« Pour chacun des aliments que je vais te citer, dis-moi pourquoi tu en consommes. Tu peux choisir plusieurs réponses : parce que ça te fait plaisir ; parce que c’est tentant et facile à acheter ; parce qu’il y en a à la maison ; ou parce que tu n’en consommes pas. »' : undefined,
    hint: 'Tu peux choisir plusieurs réponses.',
    groups: [{ id: `q11${food.key}`, label: food.name, options: motivationOptions, multiple: true, exclusiveOption: NOT_CONSUMED }],
    expected: 'Une ou plusieurs réponses', guidance: 'Énoncer les 4 possibilités si besoin. Recueillir la ou les réponses.', maxFollowUps: 0,
  })),
  ...foods.map((food, index): SurveyStep => ({
    id: `12${food.key}`, number: 12, label: `12${food.key}`, text: food.short, ui: 'choices',
    intro: index === 0 ? '« Maintenant, pour ceux que tu consommes, dis-moi à quelle fréquence : presque tous les jours, régulièrement dans la semaine, ou une à deux fois par mois. »' : undefined,
    groups: [{ id: `q12${food.key}`, label: food.name, options: frequencyOptions }],
    expected: 'Une réponse', guidance: 'Énoncer les 3 possibilités si besoin. Poser seulement si consommé en Q11.', maxFollowUps: 0,
    skipIf: get => notConsumed(get, food.key),
  })),
  ...foods.map((food, index): SurveyStep => ({
    id: `13${food.key}`, number: 13, label: `13${food.key}`, text: food.short, ui: 'choices',
    intro: index === 0 ? '« Et maintenant, pour ces mêmes aliments, dis-moi avec qui tu en consommes généralement : en famille, avec des amis ou seul(e). Tu peux choisir plusieurs réponses. »' : undefined,
    hint: 'Tu peux choisir plusieurs réponses.',
    groups: [{ id: `q13${food.key}`, label: food.name, options: socialOptions, multiple: true }],
    expected: 'Une ou plusieurs réponses', guidance: 'Énoncer les 3 possibilités si besoin. Poser seulement si consommé en Q11.', maxFollowUps: 0,
    skipIf: get => notConsumed(get, food.key),
  })),
  ...changes.map((script, index): SurveyStep => ({
    id: `14${letter(index)}`, number: 14, label: `14${letter(index)}`, text: script, ui: 'choices',
    intro: index === 0 ? '« Je vais maintenant te proposer plusieurs changements dans ton alimentation. Pour chacun, dis-moi si ça te semblerait très difficile, difficile, ni difficile ni facile, facile ou très facile. »' : undefined,
    groups: [{ id: `q14${letter(index)}`, label: script.replace(/ \?$/, ''), options: difficultyOptions }],
    expected: 'Une réponse', guidance: 'Attendre une réponse parmi les 5 modalités. Les rappeler si la réponse ne correspond pas clairement à l’une d’elles.', maxFollowUps: 0,
  })),
  open('15', 15, 'Pour toi, qu’est-ce que ça veut dire « bien manger » ? Dis-le avec tes propres mots.', 'Représentation personnelle de « bien manger »', `${openGuidance} Relance possible : « Qu’est-ce que tu veux dire par là ? ».`, { maxFollowUps: 1 }),
  open('16', 16, 'Pour toi, qu’est-ce qu’il y a dans un « bon repas » ?', 'Composition d’un « bon repas » selon le répondant', `${openGuidance} Relance possible : « Tu peux m’en dire un peu plus ? Qu’est-ce qu’il y aurait dans ce repas ? ».`, { maxFollowUps: 1 }),
  open('17', 17, 'Selon toi, y a-t-il des aliments qui sont bons pour la santé ? Si oui, peux-tu m’en citer jusqu’à trois ?', 'Jusqu’à 3 aliments considérés comme bons pour la santé', listGuidance, listRules),
  open('18', 18, 'Selon toi, y a-t-il des aliments qu’il faut limiter pour la santé ? Si oui, peux-tu m’en citer jusqu’à trois ?', 'Jusqu’à 3 aliments dont la consommation devrait être limitée pour la santé', listGuidance, listRules),
  {
    id: '19', number: 19, label: '19', text: 'Quand tu fais un choix important, notamment sur ce que tu manges, quelles sont les personnes ou les sources dont l’avis compte le plus pour toi ? Par exemple : tes camarades, ta famille ou tes parents, les réseaux sociaux, les coachs sportifs, les professionnels de santé, toi-même, ou une autre personne ou source. Choisis-en jusqu’à trois et classe-les.', ui: 'ranking',
    hint: 'Classe jusqu’à trois réponses, de la plus importante à la moins importante.',
    groups: [1, 2, 3].map(rank => ({ id: `q19-rang-${rank}`, label: `Rang ${rank}`, options: influenceOptions })),
    textPrompt: { label: 'Précise l’autre influence', when: selections => [1, 2, 3].some(rank => selections[`q19-rang-${rank}`]?.includes('Autre')) },
    expected: 'Jusqu’à 3 sources d’influence classées de la plus importante à la moins importante',
    guidance: 'Recueillir jusqu’à trois réponses et leur classement (rang 1 = la plus importante). Si plusieurs réponses sont citées sans ordre de priorité, demander au répondant de les classer de la plus importante à la moins importante. Si « Autre » est choisi, demander de préciser. Ne jamais établir le classement à la place du répondant.',
    maxFollowUps: 2,
  },
  open('20', 20, 'Cite jusqu’à trois plats ou aliments que tu aimes et qui sont faits maison par tes proches.', 'Jusqu’à 3 plats ou aliments appréciés, faits maison par les proches', listGuidance, listRules),
  open('21', 21, 'Cite jusqu’à trois plats ou aliments que tu aimes et que tu achètes à l’extérieur.', 'Jusqu’à 3 plats ou aliments appréciés, achetés à l’extérieur', listGuidance, listRules),
  open('22', 22, 'Cite jusqu’à trois boissons que tu aimes.', 'Jusqu’à 3 boissons appréciées', listGuidance.replace(/éléments/g, 'boissons'), listRules),
  single('23', 23, 'Est-ce que tu manges à la cantine ?', yesNo, 'Fréquentation de la cantine', 'Si oui : poser les questions 24 à 26. Si non : passer directement à la question 27.'),
  single('24', 24, 'En général, comment trouves-tu les repas proposés à la cantine : très bons, plutôt bons, plutôt pas bons ou pas bons du tout ?', ['Très bons', 'Plutôt bons', 'Plutôt pas bons', 'Pas bons du tout'], 'Appréciation des repas de la cantine', 'Recueillir une réponse parmi les quatre modalités. Si la réponse ne correspond pas clairement à une modalité, rappeler les quatre choix et demander d’en choisir un.', { skipIf: get => answeredNo(get('23')) }),
  single('25', 25, 'Dirais-tu que la cantine est un lieu où tu passes un bon moment avec des amis ?', ['Tout à fait d’accord', 'Plutôt d’accord', 'Plutôt pas d’accord', 'Pas d’accord'], 'Perception de la cantine comme moment partagé avec des amis', 'Recueillir une réponse parmi les quatre modalités. Si la réponse ne correspond pas clairement à une modalité, rappeler les quatre choix et demander d’en choisir un.', { skipIf: get => answeredNo(get('23')) }),
  single('26', 26, 'En général, est-ce que le bruit à la cantine te gêne : pas du tout, un peu ou beaucoup ?', ['Pas du tout', 'Un peu', 'Beaucoup'], 'Gêne liée au bruit à la cantine', 'Recueillir une réponse parmi les trois modalités. Si la réponse ne correspond pas clairement à une modalité, rappeler les trois choix et demander d’en choisir un.', { skipIf: get => answeredNo(get('23')) }),
  single('27', 27, 'Est-ce que tu as déjà participé ou été concerné par des actions sur l’alimentation, par exemple pour mieux connaître les familles d’aliments ou parler d’alimentation équilibrée ?', yesNo, 'Exposition à des actions de sensibilisation sur l’alimentation', 'Si oui : poser la question 28. Si non : terminer le questionnaire.'),
  single('28', 28, 'Est-ce que ces actions t’ont amené à changer quelque chose dans ton alimentation ? Si oui, peux-tu me dire ce qui a changé, que ce soit de façon positive ou négative ?', yesNo, 'Existence d’un changement et, si oui, description des effets positifs ou négatifs perçus', 'Recueillir d’abord Oui ou Non. Si Oui, recueillir la précision telle qu’elle est formulée par le répondant, qu’elle décrive un effet positif ou négatif. Si la réponse est trop vague pour comprendre ce qui a changé, effectuer une seule relance neutre : « Tu peux m’en dire un peu plus ? ». Ne pas suggérer de changement ni orienter la réponse vers un effet positif ou négatif.', {
    textPrompt: { label: 'Si oui, précise ce qui a changé', when: selections => Boolean(selections.q28?.includes('Oui')) },
    maxFollowUps: 1,
    skipIf: get => answeredNo(get('27')),
  }),
];

export const stepSpeech = (step: SurveyStep) => (step.intro ? `${step.intro} ${step.text}` : step.text);

export const parentRoleNames = parentRoles;

const normalizeClass = (text: string) => {
  const plain = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  if (/^(6|six)/.test(plain)) return '6e';
  if (/^(5|cinq)/.test(plain)) return '5e';
  if (/^(4|quatr)/.test(plain)) return '4e';
  if (/^(3|troi)/.test(plain)) return '3e';
  return '';
};

export const validateTypedAnswer = (step: SurveyStep, text: string): { ok: boolean; value: string; message: string } => {
  const trimmed = text.trim();
  if (!trimmed) return { ok: true, value: '', message: '' };
  if (step.numeric) {
    const match = /\d+/.exec(trimmed);
    const value = match ? Number(match[0]) : Number.NaN;
    if (Number.isNaN(value) || value < step.numeric.min || value > step.numeric.max) {
      return { ok: false, value: trimmed, message: step.numeric.message };
    }
    return { ok: true, value: String(value), message: '' };
  }
  if (step.allowedValues) {
    const value = normalizeClass(trimmed);
    if (!step.allowedValues.includes(value)) return { ok: false, value: trimmed, message: 'Indique ta classe : 6e, 5e, 4e ou 3e.' };
    return { ok: true, value, message: '' };
  }
  return { ok: true, value: trimmed, message: '' };
};
