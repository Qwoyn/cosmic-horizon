import { SPRITES } from '../pixel-sprites';
import { SCENE_SPRITES } from '../scene-sprites';
import type { SceneDefinition } from '../scene-types';

const STAGE_W = 48;
const STAGE_H = 32;

/** Ship takes a hit and explodes */
export function buildDestroyedScene(shipTypeId: string): SceneDefinition {
  const base = SPRITES[`ship_${shipTypeId}`] ?? SPRITES.ship_scout;
  return {
    id: 'destroyed',
    stageWidth: STAGE_W,
    stageHeight: STAGE_H,
    bgColor: '#0a0e14',
    initialActors: [
      { id: 'ship', frames: [base], frameDuration: 200, x: 50, y: 50, size: 12 },
    ],
    phases: [
      {
        duration: 600,
        label: 'Impact',
        effects: [
          { type: 'flash', duration: 300, config: { color: '#f85149' } },
          { type: 'starfield', config: { count: 10, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      {
        duration: 1800,
        label: 'Explosion',
        transitions: [
          {
            actorId: 'ship',
            replaceFrames: [
              SCENE_SPRITES.explosion_frame1,
              SCENE_SPRITES.explosion_frame2,
              SCENE_SPRITES.explosion_frame3,
              SCENE_SPRITES.explosion_frame4,
            ],
            duration: 200,
            size: 16,
          },
        ],
        effects: [
          { type: 'flash', duration: 400, config: { color: '#ffffff' } },
          { type: 'starfield', config: { count: 10, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      {
        duration: 1200,
        label: 'Debris',
        transitions: [
          { actorId: 'ship', opacity: 0, duration: 1200, easing: 'ease-out', size: 20 },
        ],
        effects: [
          { type: 'starfield', config: { count: 10, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
        text: 'SHIP DESTROYED',
        textClass: 'pixel-scene__text--danger',
      },
    ],
  };
}
