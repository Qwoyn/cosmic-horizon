import { SPRITES } from '../pixel-sprites';
import { makeExhaustFrames } from '../scene-sprites';
import type { SceneDefinition } from '../scene-types';

const STAGE_W = 48;
const STAGE_H = 32;

export function buildWarpScene(shipTypeId: string): SceneDefinition {
  const shipKey = `ship_${shipTypeId}`;
  const baseSprite = SPRITES[shipKey] ?? SPRITES.ship_scout;
  const exhaustFrames = makeExhaustFrames(baseSprite);

  return {
    id: 'warp',
    stageWidth: STAGE_W,
    stageHeight: STAGE_H,
    bgColor: '#0a0e14',
    initialActors: [
      {
        id: 'ship',
        frames: exhaustFrames,
        frameDuration: 150,
        x: 50,
        y: 50,
        size: 10,
        opacity: 1,
      },
    ],
    phases: [
      {
        duration: 1000,
        label: 'Jump',
        effects: [
          { type: 'flash', duration: 200, config: { color: '#ffffff' } },
          { type: 'warp-lines', config: { count: 8, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      {
        duration: 1000,
        label: 'Travel',
        effects: [
          { type: 'warp-lines', config: { count: 16, stageWidth: STAGE_W, stageHeight: STAGE_H } },
          { type: 'scanlines' },
        ],
      },
    ],
  };
}
