export type DaySegmentKey = 'early' | 'morning' | 'noon' | 'afternoon' | 'evening';

export const daySegmentOrder: DaySegmentKey[] = ['early', 'morning', 'noon', 'afternoon', 'evening'];

export const laterSegment = (a: DaySegmentKey, b: DaySegmentKey | undefined): DaySegmentKey => (
  b && daySegmentOrder.indexOf(b) > daySegmentOrder.indexOf(a) ? b : a
);

// Rough part of the day for a time said by the respondent; it only moves the highlight on the timeline.
export const daySegmentFor = (time: string | string[] | undefined): DaySegmentKey | undefined => {
  const text = (Array.isArray(time) ? time.join(' ') : (time ?? '')).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (!text.trim()) return undefined;
  const hour = /\b(\d{1,2})\s*(?:h|heures?|:)/.exec(text);
  if (hour) {
    const value = Number(hour[1]);
    if (value < 8) return 'early';
    if (value < 11) return 'morning';
    if (value < 14) return 'noon';
    if (value < 18) return 'afternoon';
    return 'evening';
  }
  if (/apres[\s-]?midi/.test(text)) return 'afternoon';
  if (/\bmidi\b/.test(text)) return 'noon';
  if (/soir|nuit/.test(text)) return 'evening';
  if (/petit matin|reveil/.test(text)) return 'early';
  if (/matin/.test(text)) return 'morning';
  return undefined;
};
