import { SPRITES } from '../pixel-sprites';
import { makeExhaustFrames, SCENE_SPRITES } from '../scene-sprites';
import type { SceneDefinition } from '../scene-types';

const STAGE_W = 64;
const STAGE_H = 48;

const shipBase = SPRITES.ship_scout;
const exhaustFrames = makeExhaustFrames(shipBase);

export const POST_TUTORIAL_SCENE: SceneDefinition = {
  id: 'post-tutorial',
  stageWidth: STAGE_W,
  stageHeight: STAGE_H,
  bgColor: '#0a0e14',
  initialActors: [
    {
      id: 'station',
      frames: [SCENE_SPRITES.station_frame1, SCENE_SPRITES.station_frame2],
      frameDuration: 600,
      x: 50,
      y: 50,
      size: 20,
      opacity: 1,
    },
    {
      id: 'ship',
      frames: [shipBase],
      frameDuration: 200,
      x: 45,
      y: 60,
      size: 10,
      opacity: 1,
    },
  ],
  phases: [
    // Phase 0: Launch - engines ignite
    {
      duration: 3000,
      label: 'Launch',
      transitions: [
        {
          actorId: 'ship',
          replaceFrames: exhaustFrames,
          duration: 500,
        },
      ],
      effects: [
        { type: 'starfield', config: { count: 20, stageWidth: STAGE_W, stageHeight: STAGE_H } },
      ],
    },
    // Phase 1: Departure - ship rises away
    {
      duration: 3000,
      label: 'Departure',
      transitions: [
        { actorId: 'ship', y: 10, duration: 3000, easing: 'ease-in' },
        { actorId: 'station', y: 90, opacity: 0.3, duration: 3000, easing: 'ease-in' },
      ],
      effects: [
        { type: 'starfield', config: { count: 20, stageWidth: STAGE_W, stageHeight: STAGE_H } },
      ],
    },
    // Phase 2: Warp Entry - flash and streaks begin
    {
      duration: 3000,
      label: 'Warp Entry',
      removeActors: ['station'],
      transitions: [
        { actorId: 'ship', y: 50, x: 50, duration: 500, easing: 'ease-out' },
      ],
      effects: [
        { type: 'flash', duration: 400, config: { color: '#ffffff' } },
        { type: 'warp-lines', config: { count: 10, stageWidth: STAGE_W, stageHeight: STAGE_H } },
      ],
    },
    // Phase 3: Hyperspace - tunnel of light
    {
      duration: 5000,
      label: 'Hyperspace',
      effects: [
        { type: 'warp-lines', config: { count: 20, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        { type: 'scanlines' },
      ],
    },
    // Phase 4: Arrival - stars slow, planet appears
    {
      duration: 3000,
      label: 'Arrival',
      addActors: [
        {
          id: 'planet',
          frames: [SCENE_SPRITES.planet_arrival],
          x: 80,
          y: 40,
          size: 16,
          opacity: 0,
        },
      ],
      transitions: [
        { actorId: 'planet', opacity: 1, duration: 2000, easing: 'ease-in' },
      ],
      effects: [
        { type: 'starfield', config: { count: 30, stageWidth: STAGE_W, stageHeight: STAGE_H } },
      ],
      text: 'WELCOME TO THE FRONTIER',
      textClass: 'pixel-scene__text--arrival',
    },
  ],
};
