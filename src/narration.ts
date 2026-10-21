import axios from 'axios';
import { api } from './api';

type VoiceRole = 'boy' | 'girl' | 'narrator';
type Manifest = Record<string, string>;

let manifestPromise: Promise<Manifest> | undefined;
let recordedPromise: Promise<Manifest> | undefined;
const audioCache = new Map<string, Blob>();
const generatedCache = new Map<string, Promise<Blob>>();

const clipKey = (mascot: VoiceRole, language: string, text: string) => JSON.stringify([mascot, language, text]);

const getManifest = () => {
  if (!manifestPromise) {
    manifestPromise = axios.get<Manifest>('/audio/narration/manifest.json').then(response => response.data);
    manifestPromise.catch(() => { manifestPromise = undefined; });
  }
  return manifestPromise;
};

// Human recordings (public/audio/recorded) take priority over the generated voices; the manifest may be missing or empty.
const getRecordedManifest = () => {
  recordedPromise ??= axios.get<Manifest>('/audio/recorded/manifest.json')
    .then(response => (response.data && typeof response.data === 'object' ? response.data : {}))
    .catch(() => ({}));
  return recordedPromise;
};

const findStaticClip = async (key: string) => {
  const [recorded, generated] = await Promise.all([getRecordedManifest(), getManifest()]);
  return recorded[key] ?? generated[key];
};

const fetchClip = async (url: string, signal?: AbortSignal) => {
  const cached = audioCache.get(url);
  if (cached) return cached;
  const response = await axios.get<Blob>(url, { responseType: 'blob', signal });
  audioCache.set(url, response.data);
  return response.data;
};

// Clips that are not recorded or pre-generated are synthesised once per session and kept, so listening again is instant.
const generateClip = (text: string, language: string, mascot: VoiceRole, authToken: string | null) => {
  const key = clipKey(mascot, language, text);
  let pending = generatedCache.get(key);
  if (!pending) {
    if (!authToken) return Promise.reject(new Error('Authentication required to generate new narration.'));
    pending = api.post<Blob>('/api/ai/speech', { text, language, mascot }, {
      headers: { Authorization: `Bearer ${authToken}` }, responseType: 'blob', timeout: 90_000,
    }).then(response => response.data);
    generatedCache.set(key, pending);
    pending.catch(() => generatedCache.delete(key));
  }
  return pending;
};

export const loadNarration = async (
  text: string,
  language: string,
  mascot: VoiceRole,
  authToken: string | null,
  signal?: AbortSignal,
): Promise<Blob> => {
  const url = await findStaticClip(clipKey(mascot, language, text));
  signal?.throwIfAborted();
  if (url) return fetchClip(url, signal);
  const clip = await generateClip(text, language, mascot, authToken);
  signal?.throwIfAborted();
  return clip;
};

// Warms the cache for the next clip; it only synthesises when a token is given and no recorded or pre-generated clip exists.
export const preloadNarration = (text: string, language: string, mascot: VoiceRole, authToken?: string | null) => {
  void findStaticClip(clipKey(mascot, language, text)).then(async url => {
    if (url) {
      await fetchClip(url);
      return;
    }
    if (authToken) await generateClip(text, language, mascot, authToken);
  }).catch(() => {});
};