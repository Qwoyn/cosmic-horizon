import { useRef, useState, useCallback, useEffect } from 'react';
import { AUDIO_TRACKS, type AudioTrack } from '../config/audio-tracks';

const FADE_DURATION = 1000; // ms
const FADE_STEPS = 20;
const STORAGE_KEY_MUTED = 'cosmic-horizon-muted';
const STORAGE_KEY_VOLUME = 'cosmic-horizon-volume';

function getStoredMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_MUTED) === 'true';
  } catch {
    return false;
  }
}

function getStoredVolume(): number {
  try {
    const v = localStorage.getItem(STORAGE_KEY_VOLUME);
    return v ? parseFloat(v) : 1;
  } catch {
    return 1;
  }
}

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackRef = useRef<string | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [muted, setMuted] = useState(getStoredMuted);
  const [volume, setVolumeState] = useState(getStoredVolume);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const fadeOut = useCallback((): Promise<void> => {
    return new Promise((resolve) => {
      const audio = audioRef.current;
      if (!audio || audio.paused) {
        resolve();
        return;
      }

      const stepTime = FADE_DURATION / FADE_STEPS;
      const volumeStep = audio.volume / FADE_STEPS;

      if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);

      fadeTimerRef.current = setInterval(() => {
        if (audio.volume > volumeStep) {
          audio.volume = Math.max(0, audio.volume - volumeStep);
        } else {
          audio.volume = 0;
          audio.pause();
          if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
          fadeTimerRef.current = null;
          resolve();
        }
      }, stepTime);
    });
  }, []);

  const play = useCallback(async (trackId: string) => {
    if (currentTrackRef.current === trackId) return;

    const track: AudioTrack | undefined = AUDIO_TRACKS.find(t => t.id === trackId);
    if (!track) return;

    // Fade out current track
    await fadeOut();

    currentTrackRef.current = trackId;

    // Create new audio element
    const audio = new Audio(track.src);
    audio.loop = track.loop;
    audio.volume = 0;
    audio.muted = muted;
    audioRef.current = audio;

    const targetVolume = track.volume * volume;

    try {
      await audio.play();
    } catch {
      // Autoplay blocked — silently ignore
      return;
    }

    // Fade in
    const stepTime = FADE_DURATION / FADE_STEPS;
    const volumeStep = targetVolume / FADE_STEPS;
    let currentVol = 0;

    if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);

    fadeTimerRef.current = setInterval(() => {
      currentVol += volumeStep;
      if (currentVol >= targetVolume) {
        audio.volume = targetVolume;
        if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
        fadeTimerRef.current = null;
      } else {
        audio.volume = currentVol;
      }
    }, stepTime);
  }, [muted, volume, fadeOut]);

  const stop = useCallback(async () => {
    await fadeOut();
    currentTrackRef.current = null;
    audioRef.current = null;
  }, [fadeOut]);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    try { localStorage.setItem(STORAGE_KEY_VOLUME, String(clamped)); } catch {}
    if (audioRef.current && currentTrackRef.current) {
      const track = AUDIO_TRACKS.find(t => t.id === currentTrackRef.current);
      if (track) {
        audioRef.current.volume = track.volume * clamped;
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    setMuted(prev => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY_MUTED, String(next)); } catch {}
      if (audioRef.current) {
        audioRef.current.muted = next;
      }
      return next;
    });
  }, []);

  return { play, stop, setVolume, muted, toggleMute, volume };
}
