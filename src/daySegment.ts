export type DaySegmentKey = 'early' | 'morning' | 'noon' | 'afternoon' | 'evening';

export const daySegmentOrder: DaySegmentKey[] = ['early', 'morning', 'noon', 'afternoon', 'evening'];

export const laterSegment = (a: DaySegmentKey, b: DaySegmentKey | undefined): DaySegmentKey => (
  b && daySegmentOrder.indexOf(b) > daySegmentOrder.indexOf(a) ? b : a
);

const hourWords: Record<string, number> = {
  zero: 0,
  une: 1,
  un: 1,
  deux: 2,
  trois: 3,
  quatre: 4,
  cinq: 5,
  six: 6,
  sept: 7,
  huit: 8,
  neuf: 9,
  dix: 10,
  onze: 11,
  douze: 12,
  treize: 13,
  quatorze: 14,
  quinze: 15,
  seize: 16,
  'dix sept': 17,
  'dix huit': 18,
  'dix neuf': 19,
  vingt: 20,
  'vingt et un': 21,
  'vingt et une': 21,
  'vingt deux': 22,
  'vingt trois': 23,
};

const minuteWords: Record<string, number> = {
  ...hourWords,
  'dix sept': 17,
  'dix huit': 18,
  'dix neuf': 19,
  trente: 30,
  quarante: 40,
  cinquante: 50,
};

const minuteUnits = ['un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf'];
for (const [tens, value] of Object.entries({ vingt: 20, trente: 30, quarante: 40, cinquante: 50 })) {
  for (let unit = 1; unit <= minuteUnits.length; unit++) {
    if (unit === 1) {
      minuteWords[`${tens} et un`] = value + unit;
      minuteWords[`${tens} et une`] = value + unit;
    } else {
      minuteWords[`${tens} ${minuteUnits[unit - 1]}`] = value + unit;
    }
  }
}

const normalizedTime = (time: string) => time
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[-']/g, ' ')
  .replace(/\u2019/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const hourFromTimeText = (text: string): number | undefined => {
  if (/\bmidi\b/.test(text)) return 12;
  if (/\bminuit\b/.test(text)) return 0;

  const numeric = /\b(\d{1,2})\s*(?:h|heures?|:)\s*(\d{1,2})?\b/.exec(text);
  if (numeric) {
    const hour = Number(numeric[1]);
    return hour <= 23 ? hour : undefined;
  }

  const words = Object.keys(hourWords).sort((a, b) => b.length - a.length).map(word => word.replace(/ /g, '\\s+')).join('|');
  const spoken = new RegExp(`\\b(${words})\\s+(?:h|heures?)\\b`).exec(text);
  return spoken ? hourWords[spoken[1].replace(/\s+/g, ' ')] : undefined;
};

export const clockValueFromSpeech = (time: string): string => {
  const text = normalizedTime(time);
  let hour = hourFromTimeText(text);
  if (hour === undefined) return '';

  const numericTime = /\b\d{1,2}\s*(?:h|heures?|:)\s*(\d{1,2})?\b/.exec(text);
  const wordPattern = Object.keys(hourWords).sort((a, b) => b.length - a.length).map(word => word.replace(/ /g, '\\s+')).join('|');
  const spokenTime = new RegExp(`\\b(?:${wordPattern})\\s+(?:h|heures?)\\b`).exec(text);
  const timeMatch = numericTime ?? spokenTime;
  const suffix = timeMatch ? text.slice(timeMatch.index + timeMatch[0].length).trim() : '';
  let minutes = numericTime?.[1] === undefined ? undefined : Number(numericTime[1]);
  if (minutes === undefined) {
    if (/^(?:et\s+)?demi(e)?\b/.test(suffix)) minutes = 30;
    else if (/^et\s+quart\b/.test(suffix)) minutes = 15;
    else if (/^moins\s+(?:le\s+)?quart\b/.test(suffix)) {
      hour = (hour + 23) % 24;
      minutes = 45;
    } else {
      const phrase = suffix
        .replace(/^(?:et\s+)?/, '')
        .replace(/[.,!?;:]+$/g, '')
        .replace(/\s+(?:minutes?|mins?)\b.*$/g, '')
        .trim();
      const contextualSuffix = /^(?:du matin|du soir|de l apres midi|environ|a peu pres|pile|exactement)$/.test(phrase);
      if (!phrase || contextualSuffix) minutes = 0;
      else minutes = minuteWords[phrase];
    }
  }
  if (minutes === undefined) return '';
  if (minutes > 59) return '';
  return `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// Rough part of the day for a time said by the respondent; it only moves the highlight on the timeline.
export const daySegmentFor = (time: string | string[] | undefined): DaySegmentKey | undefined => {
  const text = normalizedTime(Array.isArray(time) ? time.join(' ') : (time ?? ''));
  if (!text.trim()) return undefined;
  const hour = hourFromTimeText(text);
  if (hour !== undefined) {
    if (hour < 8) return 'early';
    if (hour < 11) return 'morning';
    if (hour < 14) return 'noon';
    if (hour < 18) return 'afternoon';
    return 'evening';
  }
  if (/apres[\s-]?midi/.test(text)) return 'afternoon';
  if (/\bmidi\b/.test(text)) return 'noon';
  if (/soir|nuit/.test(text)) return 'evening';
  if (/petit matin|reveil/.test(text)) return 'early';
  if (/matin/.test(text)) return 'morning';
  return undefined;
};
