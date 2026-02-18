import { SPRITES } from '../pixel-sprites';
import { SCENE_SPRITES } from '../scene-sprites';
import type { SceneDefinition } from '../scene-types';

const STAGE_W = 48;
const STAGE_H = 32;

/**
 * Cantina — seedy space bar interior. Dark ambiance, neon glow,
 * holographic projections of planets and ships flicker like
 * rumor fragments. Scanlines and purple/blue flashes.
 */
export function buildCantinaScene(_shipTypeId: string): SceneDefinition {
  return {
    id: 'cantina',
    stageWidth: STAGE_W,
    stageHeight: STAGE_H,
    bgColor: '#0c0610',
    initialActors: [
      // Bar backdrop — station interior walls
      { id: 'wall-l', frames: [SCENE_SPRITES.station_frame1], frameDuration: 200, x: 10, y: 40, size: 12, opacity: 0.3 },
      { id: 'wall-r', frames: [SCENE_SPRITES.station_frame2], frameDuration: 200, x: 90, y: 40, size: 12, opacity: 0.3 },
      // Drinks / items on the bar
      { id: 'drink1', frames: [SPRITES.commodity_cyrillium], frameDuration: 200, x: 40, y: 70, size: 3, opacity: 0.5 },
      { id: 'drink2', frames: [SPRITES.commodity_food], frameDuration: 200, x: 55, y: 68, size: 3, opacity: 0.4 },
    ],
    phases: [
      // Enter the cantina — dim, ambient hum
      {
        duration: 600,
        label: 'Enter',
        effects: [
          { type: 'scanlines' },
        ],
      },
      // Holographic projector spins up — purple flash
      {
        duration: 700,
        label: 'Holo on',
        text: 'CANTINA',
        textClass: 'pixel-scene__text--trade',
        addActors: [
          { id: 'holo1', frames: [SPRITES.planet_D, SPRITES.planet_O], frameDuration: 1500, x: 55, y: 28, size: 5, opacity: 0 },
          { id: 'holo2', frames: [SPRITES.ship_scout, SPRITES.ship_stealth], frameDuration: 1200, x: 42, y: 32, size: 4, opacity: 0 },
        ],
        transitions: [
          { actorId: 'holo1', opacity: 0.5, duration: 500, delay: 200, easing: 'ease-out' },
          { actorId: 'holo2', opacity: 0.4, duration: 500, delay: 350, easing: 'ease-out' },
        ],
        effects: [
          { type: 'flash', duration: 400, config: { color: '#a371f7' } },
          { type: 'scanlines' },
        ],
      },
      // Rumor fragment — ghost planet drifts, ship flickers
      {
        duration: 800,
        label: 'Rumor',
        addActors: [
          { id: 'holo3', frames: [SPRITES.planet_O, SPRITES.planet_A], frameDuration: 1500, x: 65, y: 38, size: 4, opacity: 0 },
        ],
        transitions: [
          { actorId: 'holo1', x: 58, y: 25, opacity: 0.3, size: 6, duration: 800, easing: 'ease-in-out' },
          { actorId: 'holo2', x: 38, y: 28, opacity: 0.2, duration: 800, easing: 'ease-in-out' },
          { actorId: 'holo3', opacity: 0.45, duration: 600, delay: 200, easing: 'ease-out' },
        ],
        effects: [
          { type: 'flash', duration: 250, delay: 400, config: { color: '#58a6ff' } },
          { type: 'scanlines' },
        ],
      },
      // Intel received — holograms dissolve
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
          { type: 'scanlines' },
        ],
        text: 'INTEL RECEIVED',
        textClass: 'pixel-scene__text--system',
      },
    ],
  };
}
