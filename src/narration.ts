import axios from 'axios';
import { api } from './api';

type VoiceRole = 'boy' | 'girl' | 'narrator';

let manifestPromise: Promise<Record<string, string>> | undefined;
const audioCache = new Map<string, Blob>();

const getManifest = () => {
  if (!manifestPromise) {
    manifestPromise = axios.get<Record<string, string>>('/audio/narration/manifest.json').then(response => response.data);
    manifestPromise.catch(() => { manifestPromise = undefined; });
  }
  return manifestPromise;
};

export const loadNarration = async (
  text: string,
  language: string,
  mascot: VoiceRole,
  authToken: string | null,
  signal?: AbortSignal,
): Promise<Blob> => {
  const manifest = await getManifest();
  signal?.throwIfAborted();
  const url = manifest[JSON.stringify([mascot, language, text])];
  if (url) {
    const cached = audioCache.get(url);
    if (cached) return cached;
    const response = await axios.get<Blob>(url, { responseType: 'blob', signal });
    audioCache.set(url, response.data);
    return response.data;
  }
  if (!authToken) throw new Error('Authentication required to generate new narration.');
  const response = await api.post<Blob>('/api/ai/speech', { text, language, mascot }, {
    headers: { Authorization: `Bearer ${authToken}` }, responseType: 'blob', signal,
  });
  return response.data;
};

export const preloadNarration = (text: string, language: string, mascot: VoiceRole) => {
  void getManifest().then(async manifest => {
    const url = manifest[JSON.stringify([mascot, language, text])];
    if (!url || audioCache.has(url)) return;
    const response = await axios.get<Blob>(url, { responseType: 'blob' });
    audioCache.set(url, response.data);
  }).catch(() => {});
};