import { SPRITES } from '../pixel-sprites';
import { makeExhaustFrames, SCENE_SPRITES } from '../scene-sprites';
import type { SceneDefinition } from '../scene-types';

const STAGE_W = 48;
const STAGE_H = 32;

/** Cargo crate transfers between ship and station */
export function buildTradeScene(shipTypeId: string, commodity: string, isBuy: boolean): SceneDefinition {
  const base = SPRITES[`ship_${shipTypeId}`] ?? SPRITES.ship_scout;
  const exhaustFrames = makeExhaustFrames(base);
  const crateSprite = SPRITES[`commodity_${commodity}`] ?? SPRITES.commodity_food;

  // Crate moves from station to ship (buy) or ship to station (sell)
  const crateStartX = isBuy ? 65 : 38;
  const crateEndX = isBuy ? 38 : 65;

  return {
    id: `trade-${isBuy ? 'buy' : 'sell'}`,
    stageWidth: STAGE_W,
    stageHeight: STAGE_H,
    bgColor: '#0a0e14',
    initialActors: [
      { id: 'ship', frames: exhaustFrames, frameDuration: 300, x: 30, y: 50, size: 10 },
      { id: 'station', frames: [SCENE_SPRITES.outpost_frame1, SCENE_SPRITES.outpost_frame2], frameDuration: 800, x: 72, y: 50, size: 14 },
    ],
    phases: [
      {
        duration: 400,
        label: 'Prepare',
        addActors: [
          { id: 'crate', frames: [crateSprite], frameDuration: 200, x: crateStartX, y: 50, size: 6, opacity: 0 },
        ],
        transitions: [
          { actorId: 'crate', opacity: 1, duration: 400, easing: 'ease-in' },
        ],
        effects: [
          { type: 'starfield', config: { count: 12, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      {
        duration: 1000,
        label: 'Transfer',
        transitions: [
          { actorId: 'crate', x: crateEndX, duration: 1000, easing: 'ease-in-out' },
        ],
        effects: [
          { type: 'starfield', config: { count: 12, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      {
        duration: 500,
        label: 'Complete',
        transitions: [
          { actorId: 'crate', opacity: 0, duration: 400, easing: 'ease-out' },
        ],
        effects: [
          { type: 'flash', duration: 300, config: { color: '#3fb950' } },
          { type: 'starfield', config: { count: 12, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
    ],
  };
}
