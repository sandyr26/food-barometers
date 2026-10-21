import type { PresetGroup } from './surveyConfig';

// Options that stay at the end of a shuffled list.
const anchoredLast = /^(autres?|préfère ne pas répondre|je ne sais pas)$/i;

const hashSeed = (text: string) => {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index++) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) >>> 0;
  let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
};

// Same seed and key always give the same order, so an option list does not move while the respondent is on it.
export const shuffledOptions = (options: string[], seed: string, key: string) => {
  const anchored = options.filter(option => anchoredLast.test(option));
  const movable = options.filter(option => !anchoredLast.test(option));
  const random = mulberry32(hashSeed(`${seed}|${key}`));
  for (let index = movable.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [movable[index], movable[swap]] = [movable[swap], movable[index]];
  }
  return [...movable, ...anchored];
};

export const orderedOptions = (group: PresetGroup, seed: string, key = group.id) => (group.shuffle ? shuffledOptions(group.options, seed, key) : group.options);
