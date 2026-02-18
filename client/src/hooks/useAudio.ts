import { useRef, useState, useCallback, useEffect } from 'react';
import { AUDIO_TRACKS, GAMEPLAY_TRACKS, type AudioTrack } from '../config/audio-tracks';

const FADE_DURATION = 1000; // ms
const FADE_STEPS = 20;
const STORAGE_KEY_MUTED = 'cosmic-horizon-muted';
const STORAGE_KEY_VOLUME = 'cosmic-horizon-volume';

// Track whether user has interacted with the page (for autoplay policy)
let userHasInteracted = false;
let interactionCallback: (() => void) | null = null;

function onFirstInteraction() {
  userHasInteracted = true;
  if (interactionCallback) {
    interactionCallback();
    interactionCallback = null;
  }
  document.removeEventListener('click', onFirstInteraction);
  document.removeEventListener('keydown', onFirstInteraction);
}
document.addEventListener('click', onFirstInteraction);
document.addEventListener('keydown', onFirstInteraction);

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

function pickRandom(tracks: AudioTrack[], lastId: string | null): AudioTrack {
  if (tracks.length === 1) return tracks[0];
  const candidates = tracks.filter(t => t.id !== lastId);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function resolveTrack(trackId: string): { track: AudioTrack; isPlaylist: false } | { track: AudioTrack; isPlaylist: true } | null {
  if (trackId === 'gameplay') {
    if (GAMEPLAY_TRACKS.length === 0) return null;
    const picked = pickRandom(GAMEPLAY_TRACKS, null);
    return { track: picked, isPlaylist: true };
  }
  const found = AUDIO_TRACKS.find(t => t.id === trackId);
  return found ? { track: found, isPlaylist: false } : null;
}

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentContextRef = useRef<string | null>(null);
  const currentTrackIdRef = useRef<string | null>(null);
  const pendingPlayRef = useRef<boolean>(false);
  const fadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onEndedRef = useRef<(() => void) | null>(null);
  const [muted, setMuted] = useState(getStoredMuted);
  const [volume, setVolumeState] = useState(getStoredVolume);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);
      if (audioRef.current) {
        if (onEndedRef.current) audioRef.current.removeEventListener('ended', onEndedRef.current);
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const fadeIn = useCallback((audio: HTMLAudioElement, targetVolume: number) => {
    if (fadeTimerRef.current) clearInterval(fadeTimerRef.current);

    const stepTime = FADE_DURATION / FADE_STEPS;
    const volumeStep = targetVolume / FADE_STEPS;
    let currentVol = 0;

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

  const startTrack = useCallback(async (track: AudioTrack, isPlaylist: boolean, mutedVal: boolean, volumeVal: number) => {
    // Clean up previous ended listener
    if (audioRef.current && onEndedRef.current) {
      audioRef.current.removeEventListener('ended', onEndedRef.current);
      onEndedRef.current = null;
    }

    const audio = new Audio(track.src);
    audio.loop = track.loop;
    audio.volume = 0;
    audio.muted = mutedVal;
    audioRef.current = audio;
    currentTrackIdRef.current = track.id;

    const targetVolume = track.volume * volumeVal;

    // For playlist tracks, listen for 'ended' to crossfade to next
    if (isPlaylist) {
      const onEnded = () => {
        const next = pickRandom(GAMEPLAY_TRACKS, track.id);
        startTrack(next, true, mutedVal, volumeVal);
      };
      onEndedRef.current = onEnded;
      audio.addEventListener('ended', onEnded);
    }

    try {
      await audio.play();
      pendingPlayRef.current = false;
    } catch {
      pendingPlayRef.current = true;
      return;
    }

    fadeIn(audio, targetVolume);
  }, [fadeIn]);

  const playInternal = useCallback(async (contextId: string) => {
    // Already playing this context and audio is active
    if (currentContextRef.current === contextId && audioRef.current && !audioRef.current.paused) return;

    const resolved = resolveTrack(contextId);
    if (!resolved) return;

    // Fade out current track
    await fadeOut();

    currentContextRef.current = contextId;
    pendingPlayRef.current = false;
    await startTrack(resolved.track, resolved.isPlaylist, muted, volume);
  }, [muted, volume, fadeOut, startTrack]);

  const play = useCallback(async (contextId: string) => {
    if (!userHasInteracted) {
      // Defer until first user interaction
      interactionCallback = () => playInternal(contextId);
      return;
    }
    await playInternal(contextId);
  }, [playInternal]);

  // Call resume() from a user interaction (click) to unblock autoplay
  const resume = useCallback(async () => {
    if (!pendingPlayRef.current) return;

    const audio = audioRef.current;
    const trackId = currentTrackIdRef.current;
    if (!audio || !trackId) return;

    // Find the track in either list
    const track = AUDIO_TRACKS.find(t => t.id === trackId) || GAMEPLAY_TRACKS.find(t => t.id === trackId);
    if (!track) return;

    try {
      await audio.play();
      pendingPlayRef.current = false;
      fadeIn(audio, track.volume * volume);
    } catch {
      // Still blocked
    }
  }, [volume, fadeIn]);

  const stop = useCallback(async () => {
    if (audioRef.current && onEndedRef.current) {
      audioRef.current.removeEventListener('ended', onEndedRef.current);
      onEndedRef.current = null;
    }
    await fadeOut();
    currentContextRef.current = null;
    currentTrackIdRef.current = null;
    audioRef.current = null;
    pendingPlayRef.current = false;
  }, [fadeOut]);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    try { localStorage.setItem(STORAGE_KEY_VOLUME, String(clamped)); } catch {}
    if (audioRef.current && currentTrackIdRef.current) {
      const track = AUDIO_TRACKS.find(t => t.id === currentTrackIdRef.current)
        || GAMEPLAY_TRACKS.find(t => t.id === currentTrackIdRef.current);
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

  return { play, stop, resume, setVolume, muted, toggleMute, volume };
}
