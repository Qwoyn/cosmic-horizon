export interface AudioTrack {
  id: string;
  src: string;
  volume: number;
  loop: boolean;
}

export const AUDIO_TRACKS: AudioTrack[] = [
  { id: 'intro', src: '/audio/intro.mp3', volume: 0.6, loop: true },
  { id: 'post-tutorial', src: '/audio/post-tutorial.mp3', volume: 0.6, loop: true },
  { id: 'gameplay', src: '/audio/gameplay.mp3', volume: 0.5, loop: true },
  { id: 'combat', src: '/audio/combat.mp3', volume: 0.7, loop: true },
  { id: 'starmall', src: '/audio/starmall.mp3', volume: 0.5, loop: true },
];

export type AudioContext = typeof AUDIO_TRACKS[number]['id'];
