import { useCallback, useEffect, useRef, useState } from 'react';

export type VoiceStatus = 'heard' | 'listening' | 'quiet';

const LEVEL_BAR_COUNT = 32;
export const emptyLevels = () => new Array<number>(LEVEL_BAR_COUNT).fill(0);

const RECORDER_MIME_TYPES = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];

export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [levels, setLevels] = useState<number[]>(emptyLevels);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('listening');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const levelFrameRef = useRef(0);

  const release = useCallback(() => {
    cancelAnimationFrame(levelFrameRef.current);
    void audioContextRef.current?.close();
    audioContextRef.current = null;
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
  }, []);

  const startLevelMeter = useCallback((stream: MediaStream) => {
    const context = new AudioContext();
    void context.resume();
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    context.createMediaStreamSource(stream).connect(analyser);
    audioContextRef.current = context;

    const samples = new Uint8Array(analyser.fftSize);
    const startedAt = performance.now();
    let lastVoiceAt = startedAt;
    let lastTick = 0;
    setLevels(emptyLevels());
    setElapsedSeconds(0);
    setVoiceStatus('listening');

    const tick = (now: number) => {
      levelFrameRef.current = requestAnimationFrame(tick);
      if (now - lastTick < 70) return;
      lastTick = now;
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (const sample of samples) {
        const normalized = (sample - 128) / 128;
        sum += normalized * normalized;
      }
      const level = Math.min(1, Math.sqrt(sum / samples.length) * 5);
      if (level > 0.12) lastVoiceAt = now;
      const silentFor = now - lastVoiceAt;
      let status: VoiceStatus = 'listening';
      if (silentFor < 700) status = 'heard';
      else if (silentFor > 3000) status = 'quiet';
      setLevels(current => [...current.slice(1), level]);
      setElapsedSeconds(Math.floor((now - startedAt) / 1000));
      setVoiceStatus(status);
    };
    levelFrameRef.current = requestAnimationFrame(tick);
  }, []);

  // Rejects when the microphone is unavailable or the permission is denied.
  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    try {
      chunksRef.current = [];
      const mimeType = RECORDER_MIME_TYPES.find(type => MediaRecorder.isTypeSupported(type));
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = event => { if (event.data.size > 0) chunksRef.current.push(event.data); };
      recorder.start();
      startLevelMeter(stream);
      setIsRecording(true);
    } catch (error) {
      release();
      throw error;
    }
  }, [release, startLevelMeter]);

  const stop = useCallback(() => new Promise<Blob>(resolve => {
    const recorder = recorderRef.current;
    recorderRef.current = null;
    setIsRecording(false);
    if (!recorder) {
      release();
      resolve(new Blob());
      return;
    }
    recorder.onstop = () => {
      release();
      resolve(new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' }));
    };
    recorder.stop();
  }), [release]);

  useEffect(() => () => {
    const recorder = recorderRef.current;
    if (recorder?.state === 'recording') {
      recorder.onstop = null;
      recorder.stop();
    }
    release();
  }, [release]);

  return { isRecording, levels, elapsedSeconds, voiceStatus, start, stop };
};
