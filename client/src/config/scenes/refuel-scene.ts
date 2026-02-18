import { SPRITES } from '../pixel-sprites';
import { makeExhaustFrames, SCENE_SPRITES } from '../scene-sprites';
import type { SceneDefinition } from '../scene-types';

const STAGE_W = 48;
const STAGE_H = 32;

/**
 * Refueling — ship docks close, a fuel beam (laser) connects from
 * station to ship. Ship brightens in pulses as energy flows in,
 * going from dim to full brightness. Final flash on disconnect.
 */
export function buildRefuelScene(shipTypeId: string): SceneDefinition {
  const base = SPRITES[`ship_${shipTypeId}`] ?? SPRITES.ship_scout;
  const exhaustFrames = makeExhaustFrames(base);

  return {
    id: 'refuel',
    stageWidth: STAGE_W,
    stageHeight: STAGE_H,
    bgColor: '#0a0e14',
    initialActors: [
      { id: 'station', frames: [SCENE_SPRITES.outpost_frame1, SCENE_SPRITES.outpost_frame2], frameDuration: 600, x: 75, y: 50, size: 16 },
      { id: 'ship', frames: [base], frameDuration: 200, x: 35, y: 50, size: 10, opacity: 0.5 },
    ],
    phases: [
      // Approach and connect
      {
        duration: 600,
        label: 'Connect',
        transitions: [
          { actorId: 'ship', x: 42, duration: 600, easing: 'ease-in' },
        ],
        effects: [
          { type: 'starfield', config: { count: 8, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
        text: 'CONNECTING',
        textClass: 'pixel-scene__text--system',
      },
      // Fuel beam connects — first energy pulse
      {
        duration: 600,
        label: 'Flow 1',
        transitions: [
          { actorId: 'ship', opacity: 0.65, duration: 600 },
        ],
        effects: [
          { type: 'laser', duration: 550, config: { color: '#3fb950', fromX: 65, fromY: 50, toX: 48, toY: 50 } },
          { type: 'flash', duration: 250, delay: 300, config: { color: '#3fb950' } },
          { type: 'starfield', config: { count: 8, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      // Second pulse — ship getting brighter
      {
        duration: 600,
        label: 'Flow 2',
        transitions: [
          { actorId: 'ship', opacity: 0.8, duration: 600 },
        ],
        effects: [
          { type: 'laser', duration: 550, config: { color: '#56d4dd', fromX: 65, fromY: 50, toX: 48, toY: 50 } },
          { type: 'flash', duration: 250, delay: 300, config: { color: '#56d4dd' } },
          { type: 'starfield', config: { count: 8, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      // Third pulse — nearly full
      {
        duration: 600,
        label: 'Flow 3',
        transitions: [
          { actorId: 'ship', opacity: 0.95, duration: 600 },
        ],
        effects: [
          { type: 'laser', duration: 550, config: { color: '#3fb950', fromX: 65, fromY: 50, toX: 48, toY: 50 } },
          { type: 'flash', duration: 250, delay: 300, config: { color: '#3fb950' } },
          { type: 'starfield', config: { count: 8, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      // Disconnect — ship at full brightness, exhaust fires, pulls away
      {
        duration: 700,
        label: 'Full',
        transitions: [
          { actorId: 'ship', opacity: 1, x: 30, size: 12, duration: 700, easing: 'ease-out', replaceFrames: exhaustFrames },
        ],
        effects: [
          { type: 'flash', duration: 400, config: { color: '#56d4dd' } },
          { type: 'starfield', config: { count: 10, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
        text: 'TANKS FULL',
        textClass: 'pixel-scene__text--success',
      },
    ],
  };
}
