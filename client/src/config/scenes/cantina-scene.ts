import { SPRITES } from '../pixel-sprites';
import { SCENE_SPRITES } from '../scene-sprites';
import type { SceneDefinition } from '../scene-types';

const STAGE_W = 48;
const STAGE_H = 32;

/**
 * Cantina — ship docked at station, player "enters" the cantina.
 * Holographic data projections flicker on, a drink slides across,
 * intel ghosts of planets/ships shimmer and fade like rumor fragments.
 */
export function buildCantinaScene(shipTypeId: string): SceneDefinition {
  const base = SPRITES[`ship_${shipTypeId}`] ?? SPRITES.ship_scout;

  return {
    id: 'cantina',
    stageWidth: STAGE_W,
    stageHeight: STAGE_H,
    bgColor: '#0c0610',
    initialActors: [
      { id: 'ship', frames: [base], frameDuration: 200, x: 15, y: 60, size: 7, opacity: 0.5 },
      { id: 'station', frames: [SCENE_SPRITES.outpost_frame1, SCENE_SPRITES.outpost_frame2], frameDuration: 500, x: 50, y: 45, size: 18 },
    ],
    phases: [
      // Approach the bar — dim scene, station looms large
      {
        duration: 600,
        label: 'Enter',
        transitions: [
          { actorId: 'ship', x: 22, opacity: 0.3, duration: 600, easing: 'ease-in' },
        ],
        effects: [
          { type: 'starfield', config: { count: 6, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      // Holographic projector spins up — purple flash, scanlines
      {
        duration: 700,
        label: 'Holo on',
        text: 'CANTINA',
        textClass: 'pixel-scene__text--trade',
        addActors: [
          { id: 'holo1', frames: [SPRITES.planet_D], frameDuration: 200, x: 55, y: 28, size: 5, opacity: 0 },
          { id: 'holo2', frames: [SPRITES.ship_scout], frameDuration: 200, x: 42, y: 32, size: 4, opacity: 0 },
        ],
        transitions: [
          { actorId: 'holo1', opacity: 0.5, duration: 500, delay: 200, easing: 'ease-out' },
          { actorId: 'holo2', opacity: 0.4, duration: 500, delay: 350, easing: 'ease-out' },
        ],
        effects: [
          { type: 'flash', duration: 400, config: { color: '#a371f7' } },
          { type: 'starfield', config: { count: 6, stageWidth: STAGE_W, stageHeight: STAGE_H } },
          { type: 'scanlines' },
        ],
      },
      // Rumor fragment 1 — a ghost planet drifts, another ship flickers
      {
        duration: 800,
        label: 'Rumor',
        addActors: [
          { id: 'holo3', frames: [SPRITES.planet_O], frameDuration: 200, x: 65, y: 38, size: 4, opacity: 0 },
        ],
        transitions: [
          { actorId: 'holo1', x: 58, y: 25, opacity: 0.3, size: 6, duration: 800, easing: 'ease-in-out' },
          { actorId: 'holo2', x: 38, y: 28, opacity: 0.2, duration: 800, easing: 'ease-in-out' },
          { actorId: 'holo3', opacity: 0.45, duration: 600, delay: 200, easing: 'ease-out' },
        ],
        effects: [
          { type: 'flash', duration: 250, delay: 400, config: { color: '#58a6ff' } },
          { type: 'starfield', config: { count: 6, stageWidth: STAGE_W, stageHeight: STAGE_H } },
          { type: 'scanlines' },
        ],
      },
      // Intel received — holograms dissolve, confirmation flash
      {
        duration: 600,
        label: 'Intel',
        transitions: [
          { actorId: 'holo1', opacity: 0, duration: 400, easing: 'ease-in' },
          { actorId: 'holo2', opacity: 0, duration: 400, easing: 'ease-in' },
          { actorId: 'holo3', opacity: 0, duration: 400, easing: 'ease-in' },
        ],
        effects: [
          { type: 'flash', duration: 300, delay: 200, config: { color: '#56d4dd' } },
          { type: 'starfield', config: { count: 6, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
        text: 'INTEL RECEIVED',
        textClass: 'pixel-scene__text--system',
      },
    ],
  };
}
