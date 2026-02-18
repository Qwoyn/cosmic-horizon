import { SPRITES } from '../pixel-sprites';
import { makeExhaustFrames } from '../scene-sprites';
import type { SceneDefinition } from '../scene-types';

const STAGE_W = 48;
const STAGE_H = 32;

/** Ship spins and warps out under fire */
export function buildFleeScene(shipTypeId: string): SceneDefinition {
  const base = SPRITES[`ship_${shipTypeId}`] ?? SPRITES.ship_scout;
  const exhaustFrames = makeExhaustFrames(base);
  return {
    id: 'flee',
    stageWidth: STAGE_W,
    stageHeight: STAGE_H,
    bgColor: '#0a0e14',
    initialActors: [
      { id: 'ship', frames: exhaustFrames, frameDuration: 100, x: 50, y: 50, size: 12 },
    ],
    phases: [
      {
        duration: 600,
        label: 'Evasive',
        transitions: [
          { actorId: 'ship', x: 40, y: 40, duration: 600, easing: 'ease-in', transform: 'rotate(-15)' },
        ],
        effects: [
          { type: 'starfield', config: { count: 20, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      {
        duration: 500,
        label: 'Spin',
        transitions: [
          { actorId: 'ship', x: 35, y: 55, duration: 500, easing: 'ease-in-out', transform: 'rotate(-45)' },
        ],
        effects: [
          { type: 'starfield', config: { count: 20, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      {
        duration: 800,
        label: 'Warp out',
        transitions: [
          { actorId: 'ship', x: -20, duration: 800, easing: 'ease-in', size: 6, opacity: 0 },
        ],
        effects: [
          { type: 'flash', duration: 200, config: { color: '#ffffff' } },
          { type: 'warp-lines', config: { count: 14, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
    ],
  };
}
