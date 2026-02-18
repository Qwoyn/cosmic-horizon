import { SPRITES } from '../pixel-sprites';
import { makeExhaustFrames } from '../scene-sprites';
import type { SceneDefinition } from '../scene-types';

const STAGE_W = 48;
const STAGE_H = 32;

/** Pulse wave radiates outward from ship (scanner/probe usage) */
export function buildScannerScene(shipTypeId: string): SceneDefinition {
  const base = SPRITES[`ship_${shipTypeId}`] ?? SPRITES.ship_scout;
  const exhaustFrames = makeExhaustFrames(base);

  return {
    id: 'scanner',
    stageWidth: STAGE_W,
    stageHeight: STAGE_H,
    bgColor: '#0a0e14',
    initialActors: [
      { id: 'ship', frames: exhaustFrames, frameDuration: 200, x: 50, y: 50, size: 12 },
    ],
    phases: [
      {
        duration: 800,
        label: 'Charge',
        effects: [
          { type: 'starfield', config: { count: 20, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      {
        duration: 1000,
        label: 'Pulse 1',
        effects: [
          { type: 'flash', duration: 600, config: { color: '#56d4dd' } },
          { type: 'starfield', config: { count: 20, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      {
        duration: 800,
        label: 'Pulse 2',
        effects: [
          { type: 'flash', duration: 500, delay: 200, config: { color: '#58a6ff' } },
          { type: 'starfield', config: { count: 20, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
    ],
  };
}
