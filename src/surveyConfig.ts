// Pure data and helpers; the narration script transpiles this file, so it must not import anything.
export type Mascot = 'boy' | 'girl';

export interface PresetGroup {
  id: string;
  label: string;
  options: string[];
  multiple?: boolean;
  exclusiveOption?: string;
  allowFreeText?: boolean;
  // Nominal options are shown in a random order per respondent; ordinal scales and Oui/Non are never shuffled.
  shuffle?: boolean;
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
  // Validated formulations the AI may use, word for word, when it needs a precision.
  followUps?: string[];
  skipIf?: (get: AnswerLookup) => boolean;
}

// The 24-hour recall is question 9 (shown as "prise 1, 2, 3"); the other questions are numbered as displayed.
export const RECALL_ENABLED = true;
export const INTAKE_MAX = 15;

export type IntakeFieldId = 'time' | 'solids' | 'drinks' | 'name' | 'place' | 'companionship' | 'talking' | 'screen' | 'posture';
export type IntakeRecord = Partial<Record<IntakeFieldId, string | string[]>>;

export interface IntakeField {
  id: IntakeFieldId;
  label: string;
  icon: string;
  kind: 'text' | 'single' | 'multi';
  options?: string[];
  question: string;
  guidance: string;
}

export const intakeIntroParagraphs = [
  'Nous allons maintenant revenir sur ta journée d’hier pour noter tout ce que tu as mangé et bu, et dans quelles conditions.',
  'Chaque fois que tu as mangé ou bu quelque chose, même une petite quantité, nous avons besoin des 9 compléments d’informations ci-après que tu peux me donner en bloc à l’oral ou à l’écrit. Je me charge de les ranger pour toi !',
];
export const intakeIntro = intakeIntroParagraphs.join(' ');
// Without the assistant nobody can be told "en bloc à l’oral": the same introduction asks to fill in the form.
export const intakeFormIntroParagraphs = [
  intakeIntroParagraphs[0],
  'Chaque fois que tu as mangé ou bu quelque chose, même une petite quantité, remplis les 9 informations ci-dessous.',
];
export const intakeOpeningFirst = 'Alors, le matin ?… Souviens-toi…';
export const intakeOpeningFirstSpeech = `${intakeIntro} ${intakeOpeningFirst}`;
export const intakeOpeningNext = 'Et après ça ? Souviens-toi : qu’as-tu encore mangé ou bu ?';
// Asked once per occasion: whatever is still missing afterwards is recorded as not given.
export const intakeMissingPrompt = 'Il me manque encore quelques informations. Regarde les questions en jaune à l’écran et donne-moi ce que tu peux, ou dis-moi qu’il n’y a rien d’autre.';

export const intakeFields: IntakeField[] = [
  { id: 'time', label: 'Heure', icon: '🕒', kind: 'text', question: 'À quelle heure ?', guidance: 'Heure approximative ou précise de la prise, retranscrite telle que dite par le répondant (par exemple « vers 7 heures »). Ne jamais déduire une heure.' },
  { id: 'solids', label: 'Aliments', icon: '🍽️', kind: 'text', question: 'Qu’as-tu mangé ? N’oublie pas les accompagnements !', guidance: 'Tous les aliments solides et accompagnements explicitement cités, avec les précisions données. Une prise sans aliment solide est possible : accepter « rien » (retranscrire « rien »). Ne pas inventer la composition d’un plat.' },
  { id: 'drinks', label: 'Boissons', icon: '🥤', kind: 'text', question: 'Qu’as-tu bu ?', guidance: 'Boisson(s) explicitement citée(s). Une prise sans boisson est possible : accepter « rien » (retranscrire « rien »). Ne pas déduire une boisson à partir des aliments.' },
  { id: 'name', label: 'Nom du moment', icon: '🏷️', kind: 'text', question: 'Comment appelles-tu ce moment ? (Petit-déjeuner, déjeuner, goûter, grignotage…)', guidance: 'Nom donné spontanément par le répondant, avec ses propres mots. Ne jamais déduire « petit-déjeuner », « déjeuner », « goûter », « dîner » à partir de l’heure ou des aliments.' },
  { id: 'place', label: 'Lieu', icon: '📍', kind: 'single', options: ['Là où je vis ou chez mes proches', 'Au collège ou aux abords du collège', 'À l’extérieur'], question: 'Où étais-tu ?', guidance: 'Une modalité uniquement si le lieu a été explicitement donné. Ne pas recoder un lieu ambigu à sa place.' },
  { id: 'companionship', label: 'Avec qui', icon: '👥', kind: 'single', options: ['Accompagné(e)', 'Seul(e)'], question: 'Avec qui étais-tu ? Ou étais-tu seul(e) ?', guidance: '« Seul(e) » ou « Accompagné(e) » uniquement si explicitement dit. L’identité des personnes n’est pas demandée.' },
  { id: 'talking', label: 'Conversation', icon: '💬', kind: 'single', options: ['En discutant', 'En silence'], question: 'Discutais-tu avec des gens ?', guidance: 'Une modalité uniquement si explicitement donnée. Ne pas interpréter à sa place.' },
  { id: 'screen', label: 'Écran', icon: '📱', kind: 'single', options: ['Devant un écran de TV', 'Devant une tablette ou un smartphone', 'Sans écran'], question: 'Y avait-il un écran ? (Télévision, téléphone, tablette…)', guidance: 'Une modalité uniquement si explicitement donnée. Ne pas interpréter à sa place.' },
  { id: 'posture', label: 'Posture', icon: '🪑', kind: 'single', options: ['Assis', 'Debout'], question: 'Étais-tu assis(e) ou debout ?', guidance: 'Une modalité uniquement si explicitement donnée. Ne pas interpréter à sa place.' },
];

export const mascotNames: Record<Mascot, string> = { girl: 'NAÏA', boy: 'NOAH' };
// What the narrator says on the mascot page, and what each mascot says about itself (also generated ahead of time).
// A title that already ends with punctuation ("Choisis ton enquêteur !") is not followed by an extra full stop.
export const mascotSelectionSpeech = (title: string, subtitle: string) => `${title}${/[.!?]$/.test(title) ? ' ' : '. '}${subtitle}`;
export const mascotPickSpeech = 'Tu peux me choisir !';
export const aiConsentQuestion = 'Avant de commencer, après avoir écouté les explications des animateurs, acceptes-tu de participer à l’enquête OR-ALIM ?';
export const consentYesOption = 'Oui, je souhaite participer.';
export const consentNoOption = 'Non, je ne souhaite pas participer.';
export const declineMessage = 'Merci et peut-être à bientôt.';

export const consentParagraphs = (mascot: Mascot) => [
  'Bonjour,',
  `${mascot === 'girl' ? 'Enchantée' : 'Enchanté'} ! Je m’appelle ${mascotNames[mascot]} et je vais t’accompagner pour répondre à l’enquête sur l’alimentation. Si tu as des questions ou que tu as besoin d’aide, n’hésite pas à demander à un animateur.`,
  'Je te rassure, il n’y a pas de bonne ou de mauvaise réponse : ce qui nous intéresse, c’est ce que toi, tu fais et tu penses réellement. Tu peux choisir de ne pas répondre à une question ou d’arrêter le questionnaire à tout moment, sans avoir à te justifier.',
  'Le questionnaire dure environ 30 minutes.',
];

export const consentIntroSpeech = (mascot: Mascot) => consentParagraphs(mascot).join('\n\n');
// The voice spells "OR-ALIM" letter by letter, so the spoken text writes the name as one word.
export const consentQuestionSpeech = [aiConsentQuestion.replace('OR-ALIM', 'ORALIM'), consentYesOption, consentNoOption].join('\n\n');
export const CONSENT_PAUSE_MS = 2000;

const NEVER = 'Jamais';
const yesNo = ['Oui', 'Non'];
const influenceOptions = ['Camarades', 'Famille/parents', 'Réseaux sociaux', 'Coachs sportifs et équivalents', 'Professionnels de santé', 'Moi-même', 'Autre'];
const householdOptions = ['Papa / tuteur', 'Maman / tutrice', 'Beau-père', 'Belle-mère', 'Frères/demi-frères', 'Sœurs/demi-sœurs', 'Grands-parents', 'Oncles/tantes', 'Autres', 'Personnes sans lien familial', 'Vit en foyer d’accueil', 'Préfère ne pas répondre'];
const parentRoles = ['Papa', 'Maman', 'Tuteur 1', 'Tuteur 2'];
const consumptionOptions = ['Régulièrement dans la semaine', 'Une à deux fois par mois', 'Rarement', NEVER];
const difficultyOptions = ['Très difficile', 'Difficile', 'Ni difficile ni facile', 'Facile', 'Très facile'];

const foods = [
  { key: 'a', name: 'Jus de fruits en brique', ask: 'des jus de fruits en brique' },
  { key: 'b', name: 'Sodas', ask: 'des sodas' },
  { key: 'c', name: 'Pizzas', ask: 'des pizzas' },
  { key: 'd', name: 'Pains bouchons ou Lords', ask: 'des pains bouchons ou des Lords' },
  { key: 'e', name: 'Hamburgers', ask: 'des hamburgers' },
  { key: 'f', name: 'Biscuits, pâtisseries ou gâteaux', ask: 'des biscuits, des pâtisseries ou des gâteaux' },
];

const changes = [
  'Qu’en est-il pour toi lorsqu’il s’agit de manger moins de produits sucrés ?',
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

// The context question only follows a food that is actually consumed (a frequency other than "Jamais").
const consumed = (get: AnswerLookup, key: string) => {
  const frequency = get(`11${key}`)?.selections[`q11${key}`]?.[0];
  return Boolean(frequency) && frequency !== NEVER;
};

const plainAnswer = (text: string) => ` ${text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim()} `;
const declinePhrases = [
  'je ne sais pas', 'je sais pas', 'sais pas', 'chais pas', 'j sais pas', 'aucune idee', 'pas d idee', 'je n ai pas d idee',
  'je ne me souviens pas', 'je me souviens pas', 'je ne connais pas', 'je prefere ne pas repondre', 'prefere ne pas repondre',
  'je ne veux pas repondre', 'je veux pas repondre', 'je ne souhaite pas repondre', 'pas envie de repondre', 'je ne reponds pas', 'je passe', 'sans reponse',
];
const declineFillers = ['ben', 'bah', 'euh', 'alors', 'desole', 'desolee', 'franchement', 'vraiment', 'moi', 'merci', 'non', 'oui'];

// « Je ne sais pas » and refusals to answer are valid answers: the survey never forces a reply.
export const isDeclineAnswer = (text: string) => {
  let rest = plainAnswer(text);
  const original = rest;
  for (const phrase of declinePhrases) rest = rest.split(` ${phrase} `).join(' ');
  if (rest === original) return false;
  for (const filler of declineFillers) rest = rest.split(` ${filler} `).join(' ');
  return rest.trim() === '';
};

const listGuidance = 'Recueillir les éléments cités : un seul suffit, c’est une réponse valide (relevant=true). L’objectif est d’en obtenir jusqu’à trois. Si moins de trois sont cités, c’est une relance (followUp=true) : demander si le répondant souhaite en ajouter, sans jamais l’exiger. Si le répondant dit qu’il n’a rien à ajouter (par exemple « non » ou « c’est tout »), garder sa réponse telle quelle avec relevant=true et followUp=false. Si plus de trois sont cités spontanément, c’est aussi une relance (followUp=true) : lui demander lesquels il souhaite retenir parmi les trois, sans sélectionner à sa place. Une fois trois éléments obtenus, ne plus relancer.';
const listFollowUps = ['Veux-tu en ajouter un autre ?', 'Peux-tu en choisir trois seulement ?'];
const listRules: Partial<SurveyStep> = { maxFollowUps: 2, list: { max: 3 }, followUps: listFollowUps };
const openGuidance = 'Recueillir la réponse telle qu’elle est formulée par le répondant. Si la réponse est très courte, vague ou difficile à comprendre, effectuer une seule relance neutre : « Tu peux m’en dire un peu plus ? ». Ne pas interpréter, catégoriser, compléter ou suggérer de réponse.';

const single = (id: string, number: number, text: string, options: string[], expected: string, guidance: string, extra: Partial<SurveyStep> = {}, shuffle = false): SurveyStep => ({
  id, number, label: id, text, ui: 'choices', groups: [{ id: `q${id}`, label: text, options, ...(shuffle ? { shuffle } : {}) }], expected, guidance, maxFollowUps: 0, ...extra,
});

const open = (id: string, number: number, text: string, expected: string, guidance: string, extra: Partial<SurveyStep> = {}): SurveyStep => ({
  id, number, label: id, text, ui: 'text', groups: [], expected, guidance, maxFollowUps: 0, ...extra,
});

export const surveySteps: SurveyStep[] = [
  single('1', 1, 'Es-tu une fille ou un garçon ?', ['Fille', 'Garçon'], 'Genre', 'Accepter la réponse. Accepter un refus de répondre sans relancer.', {}, true),
  open('2', 2, 'Quelle est ton année de naissance ?', 'Année de naissance : 2009–2018', 'Si la réponse est hors intervalle, ambiguë ou donnée sous une autre forme, demander une précision sans suggérer de réponse.', { numeric: { min: 2009, max: 2018, message: 'Ton année de naissance semble incorrecte. Peux-tu me la redonner ?' }, maxFollowUps: 2 }),
  open('3', 3, 'Dans quelle classe es-tu ?', 'Niveau scolaire : 6e, 5e, 4e ou 3e', 'Reconnaître les formulations équivalentes : 6e/sixième, 5e/cinquième, 4e/quatrième, 3e/troisième. Sinon demander de préciser.', { allowedValues: ['6e', '5e', '4e', '3e'], maxFollowUps: 2 }),
  open('4', 4, 'Où habites-tu ? Dans quelle ville ? Et si tu connais ton quartier de résidence, indique-le !', 'Commune de résidence à La Réunion (974) et, si connu, quartier', 'Recueillir la commune et, si le répondant le connaît, le quartier ; ne pas insister si le quartier n’est pas connu. Accepter les variantes orthographiques identifiables. Si le répondant indique plusieurs lieux de résidence (par exemple parents séparés ou divorcés), demander de préciser celui où il a dormi hier soir. Si la commune manque, la demander.', {
    maxFollowUps: 2,
    followUps: ['Dans quelle ville habites-tu ?', 'Où as-tu dormi hier soir ?'],
  }),
  open('5', 5, 'En te comptant, combien de personnes vivent chez toi ?', 'Nombre entier de 2 à 20', 'Si la réponse est vague, non numérique ou hors intervalle : demander un nombre précis.', { numeric: { min: 2, max: 20, message: 'Ce nombre me semble incorrect. Peux-tu me redonner le nombre de personnes qui vivent chez toi, en te comptant ?' }, maxFollowUps: 2 }),
  single('6', 6, 'Et parmi les personnes qui vivent chez toi, qui sont-elles ? Tu peux, par exemple, dire « mon père », « ma sœur »…', householdOptions, 'Une ou plusieurs catégories décrivant les personnes vivant avec l’adolescent', 'Recoder les réponses spontanées dans les catégories. Si la réponse est trop générale, demander uniquement la précision nécessaire. Ne pas relancer si le répondant préfère ne pas répondre.', {
    groups: [{ id: 'q6-personnes-du-foyer', label: 'Personnes vivant au foyer', options: householdOptions, multiple: true, shuffle: true }],
    textPrompt: { label: 'Précise qui', when: selections => Boolean(selections['q6-personnes-du-foyer']?.includes('Autres')) },
    maxFollowUps: 1,
  }),
  {
    id: '7', number: 7, label: '7', text: 'Quels métiers font tes parents ou tes tuteurs ?', ui: 'occupations',
    hint: 'Pour chaque personne, indique son métier ou coche « Ne travaille pas ».',
    groups: parentRoles.map(role => ({ id: `q7-${role}`, label: `Situation professionnelle de ${role}`, options: ['Ne travaille pas'], allowFreeText: true })),
    expected: 'Métier de chaque parent ou tuteur, ou indication qu’il/elle ne travaille pas',
    guidance: 'Demander des précisions successives jusqu’à disposer de suffisamment d’informations pour identifier la catégorie socioprofessionnelle : métier exercé, fonction ou tâches principales, statut si nécessaire. Ne pas suggérer de métier ni de catégorie au répondant. Pour chaque personne, la valeur libre doit regrouper le métier, les tâches et le statut déjà connus.',
    maxFollowUps: 3,
  },
  single('8', 8, 'Est-ce que tu as de l’argent de poche : régulièrement, de temps en temps, ou pas du tout ?', ['Oui, de manière régulière', 'De temps en temps', 'Non'], 'Fréquence / existence d’argent de poche', 'Accepter une formulation équivalente et la recoder dans l’une des trois modalités.'),
  open('10', 10, 'Y a-t-il des choses que tu ne manges pas ou ne bois pas, quelle que soit la raison ? Si oui, lesquelles et pour quelle raison ?', 'Aliment(s) ou boisson(s) évité(s) et raison(s) associée(s), ou aucune éviction', 'Accepter « non », « rien » ou « je ne sais pas » comme réponse complète. Si le répondant cite des éléments, obtenir si possible l’aliment précis et la raison pour chacun ; une seule relance neutre si la raison manque. Pour la viande, préciser s’il s’agit de toute viande ou d’un type de viande. Pour les catégories générales (légumes, grains, légumes-racines), demander lesquels, sans suggérer d’exemples sauf nécessité de compréhension. Ne pas interpréter les raisons.', {
    maxFollowUps: 2,
    followUps: ['Pour quelle raison ?', 'Peux-tu préciser lesquels ?'],
  }),
  ...foods.flatMap((food, index): SurveyStep[] => [
    {
      id: `11${food.key}`, number: 11, label: `11${food.key}`, text: `Est-ce qu’il t’arrive de consommer ${food.ask} ?`, ui: 'choices',
      intro: index === 0 ? '« Je vais te citer quelques aliments et boissons. Pour chacun, dis-moi à quelle fréquence tu en consommes : régulièrement dans la semaine, une à deux fois par mois, rarement ou jamais. »' : undefined,
      groups: [{ id: `q11${food.key}`, label: food.name, options: consumptionOptions }],
      expected: 'Une réponse', guidance: 'Énoncer les 4 possibilités si besoin. Recueillir une seule réponse.', maxFollowUps: 0,
    },
    {
      id: `11${food.key}-ctx`, number: 11, label: `11${food.key} · contexte`, text: `Avec qui consommes-tu ${food.ask} et dans quel contexte ?`, ui: 'text', groups: [],
      expected: 'Avec qui et dans quel contexte l’aliment est consommé, dans les mots du répondant',
      guidance: `${openGuidance} Si seul(e) « avec qui » ou seul « dans quel contexte » est donné, une seule relance neutre pour obtenir l’autre partie.`,
      maxFollowUps: 1,
      followUps: ['Avec qui ?', 'Dans quel contexte ?'],
      skipIf: get => !consumed(get, food.key),
    },
  ]),
  ...changes.map((script, index): SurveyStep => ({
    id: `12${letter(index)}`, number: 12, label: `12${letter(index)}`, text: script, ui: 'choices',
    intro: index === 0 ? '« On dit souvent qu’il faut manger moins gras, moins sucré, moins salé. »' : undefined,
    groups: [{ id: `q12${letter(index)}`, label: script.replace(/ \?$/, ''), options: difficultyOptions }],
    expected: 'Une réponse', guidance: 'Attendre une réponse parmi les 5 modalités (très difficile, difficile, ni difficile ni facile, facile, très facile). Les rappeler si la réponse ne correspond pas clairement à l’une d’elles.', maxFollowUps: 0,
  })),
  open('13', 13, 'Pour toi, qu’est-ce que ça veut dire « bien manger » ? Dis-le avec tes propres mots.', 'Représentation personnelle de « bien manger »', `${openGuidance} Relance possible : « Qu’est-ce que tu veux dire par là ? ».`, { maxFollowUps: 1, followUps: ['Qu’est-ce que tu veux dire par là ?'] }),
  open('14', 14, 'Pour toi, qu’est-ce qu’il y a dans un « bon repas » ?', 'Composition précise d’un « bon repas » selon le répondant, de quoi imaginer le contenu de l’assiette', 'Faire préciser la composition du repas jusqu’à pouvoir imaginer le contenu de l’assiette : aliments, accompagnements, boisson éventuelle. Si la réponse reste générale (par exemple « équilibré », « sain », « bon ») ou ne cite que quelques éléments, relancer pour obtenir la composition, sans suggérer d’aliments. Une relance de plus est possible si la composition reste floue. Ne pas interpréter ni compléter la composition à la place du répondant.', { maxFollowUps: 2, followUps: ['Qu’est-ce qu’il y aurait dans l’assiette ?', 'Tu peux me dire tout ce que tu mettrais dedans ?'] }),
  open('15', 15, 'Selon toi, y a-t-il des aliments qui sont bons pour la santé ? Si oui, peux-tu m’en citer jusqu’à trois ?', 'Jusqu’à 3 aliments considérés comme bons pour la santé', listGuidance, listRules),
  open('16', 16, 'Selon toi, y a-t-il des aliments qu’il faut limiter pour la santé ? Si oui, peux-tu m’en citer jusqu’à trois ?', 'Jusqu’à 3 aliments dont la consommation devrait être limitée pour la santé', listGuidance, listRules),
  {
    id: '17', number: 17, label: '17', text: 'Quand tu fais un choix important, notamment sur ce que tu manges, quelles sont les personnes ou les sources dont l’avis compte le plus pour toi ? Par exemple : tes camarades, ta famille ou tes parents, les réseaux sociaux, les coachs sportifs, les professionnels de santé, toi-même, ou une autre personne ou source. Tu peux en choisir jusqu’à trois. Indique-les du plus influent au moins influent.', ui: 'ranking',
    hint: 'Tu peux en choisir jusqu’à 3, du plus influent au moins influent.',
    groups: [1, 2, 3].map(rank => ({ id: `q17-choix-${rank}`, label: `Choix ${rank}`, options: influenceOptions, shuffle: true })),
    textPrompt: { label: 'Précise l’autre influence', when: selections => [1, 2, 3].some(rank => selections[`q17-choix-${rank}`]?.includes('Autre')) },
    expected: 'Jusqu’à 3 sources d’influence classées de la plus influente à la moins influente',
    guidance: 'Recueillir jusqu’à trois réponses et leur classement (choix 1 = la plus influente). Une seule relance au maximum : si plusieurs réponses sont citées sans ordre de priorité, demander au répondant de les classer du plus influent au moins influent. Si « Autre » est choisi, demander de préciser. Ne jamais établir le classement à la place du répondant.',
    maxFollowUps: 1,
    followUps: ['Peux-tu les classer, du plus influent au moins influent ?'],
  },
  single('18', 18, 'Est-ce que tu manges à la cantine ?', yesNo, 'Fréquentation de la cantine', 'Si oui : poser les questions 19 et 20. Si non : terminer le questionnaire.'),
  single('19', 19, 'En général, comment trouves-tu les repas proposés à la cantine : très bons, plutôt bons, plutôt pas bons ou pas bons du tout ?', ['Très bons', 'Plutôt bons', 'Plutôt pas bons', 'Pas bons du tout'], 'Appréciation des repas de la cantine', 'Recueillir une réponse parmi les quatre modalités. Si la réponse ne correspond pas clairement à une modalité, rappeler les quatre choix et demander d’en choisir un.', { skipIf: get => answeredNo(get('18')) }),
  open('20', 20, 'Au-delà du goût des repas, quels sont les deux premiers mots qui te viennent à l’esprit quand tu penses à la cantine de ton collège ?', 'Les deux premiers mots ou expressions qui viennent à l’esprit à propos de la cantine, tels que dits par le répondant', 'Recueillir les deux premiers mots ou expressions tels que dits, sans les interpréter ni les compléter. Un seul mot est une réponse valide : une seule relance neutre pour en obtenir un second. Si plus de deux sont donnés, garder ce qui est dit sans trier à la place du répondant.', {
    maxFollowUps: 1,
    list: { max: 2 },
    followUps: ['Et quel est le deuxième mot ?'],
    skipIf: get => answeredNo(get('18')),
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
  if (isDeclineAnswer(trimmed)) return { ok: true, value: trimmed, message: '' };
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
