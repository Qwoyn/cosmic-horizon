export interface AudioTrack {
  id: string;
  src: string;
  volume: number;
  loop: boolean;
}

// Single-track contexts
export const AUDIO_TRACKS: AudioTrack[] = [
  { id: 'intro', src: '/audio/intro.mp3', volume: 0.6, loop: true },
  { id: 'post-tutorial', src: '/audio/post-tutorial.mp3', volume: 0.6, loop: true },
  { id: 'combat', src: '/audio/combat.mp3', volume: 0.7, loop: true },
  { id: 'starmall', src: '/audio/starmall.mp3', volume: 0.5, loop: true },
];

// Gameplay playlist — shuffled with crossfade between tracks
// Add files as gameplay-1.mp3, gameplay-2.mp3, etc.
export const GAMEPLAY_TRACKS: AudioTrack[] = [
  { id: 'gameplay-1', src: '/audio/gameplay-1.mp3', volume: 0.5, loop: false },
  { id: 'gameplay-2', src: '/audio/gameplay-2.mp3', volume: 0.5, loop: false },
  { id: 'gameplay-3', src: '/audio/gameplay-3.mp3', volume: 0.5, loop: false },
  { id: 'gameplay-4', src: '/audio/gameplay-4.mp3', volume: 0.5, loop: false },
  { id: 'gameplay-5', src: '/audio/gameplay-5.mp3', volume: 0.5, loop: false },
];

export type AudioContextId = 'intro' | 'post-tutorial' | 'combat' | 'starmall' | 'gameplay';
