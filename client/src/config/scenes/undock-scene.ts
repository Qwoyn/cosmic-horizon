import { SPRITES } from '../pixel-sprites';
import { makeExhaustFrames, SCENE_SPRITES } from '../scene-sprites';
import type { SceneDefinition } from '../scene-types';

const STAGE_W = 48;
const STAGE_H = 32;

export function buildUndockScene(shipTypeId: string): SceneDefinition {
  const base = SPRITES[`ship_${shipTypeId}`] ?? SPRITES.ship_scout;
  const exhaustFrames = makeExhaustFrames(base);
  return {
    id: 'undock',
    stageWidth: STAGE_W,
    stageHeight: STAGE_H,
    bgColor: '#0a0e14',
    initialActors: [
      { id: 'ship', frames: [base], frameDuration: 200, x: 55, y: 50, size: 10, opacity: 0.9 },
      { id: 'station', frames: [SCENE_SPRITES.outpost_frame1, SCENE_SPRITES.outpost_frame2], frameDuration: 800, x: 72, y: 50, size: 14 },
    ],
    phases: [
      {
        duration: 800,
        label: 'Disengage',
        transitions: [
          { actorId: 'ship', x: 45, duration: 800, easing: 'ease-in', replaceFrames: exhaustFrames },
        ],
        effects: [
          { type: 'starfield', config: { count: 15, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      {
        duration: 1000,
        label: 'Clear',
        transitions: [
          { actorId: 'ship', x: 30, duration: 1000, easing: 'ease-out' },
        ],
        effects: [
          { type: 'starfield', config: { count: 15, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
    ],
  };
}
