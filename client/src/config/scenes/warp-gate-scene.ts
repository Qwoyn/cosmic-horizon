import { SPRITES } from '../pixel-sprites';
import { makeExhaustFrames } from '../scene-sprites';
import type { SceneDefinition } from '../scene-types';

const STAGE_W = 48;
const STAGE_H = 32;

/** Ship flies through a warp gate aperture */
export function buildWarpGateScene(shipTypeId: string): SceneDefinition {
  const base = SPRITES[`ship_${shipTypeId}`] ?? SPRITES.ship_scout;
  const exhaustFrames = makeExhaustFrames(base);
  return {
    id: 'warp-gate',
    stageWidth: STAGE_W,
    stageHeight: STAGE_H,
    bgColor: '#0a0e14',
    initialActors: [
      { id: 'ship', frames: exhaustFrames, frameDuration: 120, x: 20, y: 50, size: 10 },
    ],
    phases: [
      {
        duration: 800,
        label: 'Approach gate',
        transitions: [
          { actorId: 'ship', x: 45, duration: 800, easing: 'ease-in' },
        ],
        effects: [
          { type: 'starfield', config: { count: 15, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      {
        duration: 600,
        label: 'Gate aperture',
        effects: [
          { type: 'flash', duration: 500, config: { color: '#a371f7' } },
          { type: 'starfield', config: { count: 15, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      {
        duration: 800,
        label: 'Transit',
        transitions: [
          { actorId: 'ship', x: 120, duration: 800, easing: 'ease-in', size: 6, opacity: 0 },
        ],
        effects: [
          { type: 'warp-lines', config: { count: 20, stageWidth: STAGE_W, stageHeight: STAGE_H } },
          { type: 'scanlines' },
        ],
      },
    ],
  };
}
