import type { SpriteDefinition } from './pixel-sprites';

export interface SceneActor {
  id: string;
  frames: SpriteDefinition[];
  frameDuration?: number; // ms per frame, default 200
  x: number; // percentage of stage width (0-100)
  y: number; // percentage of stage height (0-100)
  size?: number; // pixel size in stage units, default 16
  opacity?: number; // 0-1, default 1
  transform?: string; // additional SVG transform
  flipX?: boolean;
}

export interface ActorTransition {
  actorId: string;
  x?: number;
  y?: number;
  opacity?: number;
  transform?: string;
  size?: number;
  duration?: number; // ms, default 300
  easing?: string; // CSS easing, default 'ease'
  delay?: number; // ms
  replaceFrames?: SpriteDefinition[];
}

export interface SceneEffect {
  type: 'starfield' | 'scanlines' | 'laser' | 'flash' | 'warp-lines';
  className?: string;
  delay?: number; // ms
  duration?: number; // ms
  config?: Record<string, unknown>;
}

export interface ScenePhase {
  duration: number; // ms
  label?: string;
  addActors?: SceneActor[];
  removeActors?: string[]; // actor ids
  transitions?: ActorTransition[];
  effects?: SceneEffect[];
  text?: string;
  textClass?: string;
  bgColor?: string;
}

export interface SceneDefinition {
  id: string;
  stageWidth: number;
  stageHeight: number;
  bgColor?: string;
  phases: ScenePhase[];
  initialActors?: SceneActor[];
}

export type SceneRenderMode = 'fullscreen' | 'sidebar' | 'inline';
