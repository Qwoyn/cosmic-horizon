import { SPRITES } from '../pixel-sprites';
import { makeExhaustFrames } from '../scene-sprites';
import type { SceneDefinition } from '../scene-types';

const STAGE_W = 48;
const STAGE_H = 32;

/** Item (mine/drone/buoy) ejected from ship into space */
export function buildDeployScene(shipTypeId: string, deployType: string): SceneDefinition {
  const base = SPRITES[`ship_${shipTypeId}`] ?? SPRITES.ship_scout;
  const exhaustFrames = makeExhaustFrames(base);
  const itemSprite = SPRITES[`item_${deployType}`] ?? SPRITES.item_mine;

  return {
    id: 'deploy',
    stageWidth: STAGE_W,
    stageHeight: STAGE_H,
    bgColor: '#0a0e14',
    initialActors: [
      { id: 'ship', frames: exhaustFrames, frameDuration: 200, x: 35, y: 50, size: 12 },
    ],
    phases: [
      {
        duration: 500,
        label: 'Launch',
        addActors: [
          { id: 'item', frames: [itemSprite], frameDuration: 200, x: 35, y: 50, size: 5, opacity: 0 },
        ],
        transitions: [
          { actorId: 'item', opacity: 1, x: 50, y: 45, duration: 500, easing: 'ease-out' },
        ],
        effects: [
          { type: 'starfield', config: { count: 18, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      {
        duration: 800,
        label: 'Drift',
        transitions: [
          { actorId: 'item', x: 65, y: 40, duration: 800, easing: 'ease-out', size: 7 },
        ],
        effects: [
          { type: 'starfield', config: { count: 18, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      {
        duration: 500,
        label: 'Armed',
        effects: [
          { type: 'flash', duration: 300, config: { color: '#f0883e' } },
          { type: 'starfield', config: { count: 18, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
    ],
  };
}
