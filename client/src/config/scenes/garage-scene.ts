import { SPRITES } from '../pixel-sprites';
import { makeExhaustFrames, SCENE_SPRITES } from '../scene-sprites';
import type { SceneDefinition } from '../scene-types';

const STAGE_W = 48;
const STAGE_H = 32;

/**
 * Garage — ship gets tractored into a storage bay (store)
 * or emerges from the bay with systems powering on (retrieve).
 * Bay doors represented by station, tractor beam by laser effect.
 */
export function buildGarageScene(shipTypeId: string, isRetrieve: boolean): SceneDefinition {
  const base = SPRITES[`ship_${shipTypeId}`] ?? SPRITES.ship_scout;
  const exhaustFrames = makeExhaustFrames(base);

  if (isRetrieve) {
    // Ship emerges from bay: dark silhouette inside station → slides out → exhaust fires up
    return {
      id: 'garage-retrieve',
      stageWidth: STAGE_W,
      stageHeight: STAGE_H,
      bgColor: '#0a0e14',
      initialActors: [
        { id: 'station', frames: [SCENE_SPRITES.outpost_frame1, SCENE_SPRITES.outpost_frame2], frameDuration: 800, x: 78, y: 50, size: 18 },
        { id: 'ship', frames: [base], frameDuration: 200, x: 72, y: 50, size: 8, opacity: 0.2 },
      ],
      phases: [
        {
          duration: 500,
          label: 'Bay open',
          text: 'RETRIEVING',
          textClass: 'pixel-scene__text--system',
          effects: [
            { type: 'flash', duration: 300, config: { color: '#d29922' } },
            { type: 'starfield', config: { count: 8, stageWidth: STAGE_W, stageHeight: STAGE_H } },
          ],
        },
        {
          duration: 1000,
          label: 'Emerge',
          transitions: [
            { actorId: 'ship', x: 50, opacity: 0.7, size: 10, duration: 1000, easing: 'ease-out' },
          ],
          effects: [
            { type: 'laser', duration: 800, config: { color: '#56d4dd', fromX: 72, fromY: 50, toX: 50, toY: 50 } },
            { type: 'starfield', config: { count: 8, stageWidth: STAGE_W, stageHeight: STAGE_H } },
          ],
        },
        {
          duration: 800,
          label: 'Power on',
          transitions: [
            { actorId: 'ship', x: 30, opacity: 1, size: 12, duration: 800, easing: 'ease-out', replaceFrames: exhaustFrames },
          ],
          effects: [
            { type: 'flash', duration: 400, config: { color: '#3fb950' } },
            { type: 'starfield', config: { count: 8, stageWidth: STAGE_W, stageHeight: STAGE_H } },
          ],
          text: 'SYSTEMS ONLINE',
          textClass: 'pixel-scene__text--success',
        },
      ],
    };
  }

  // Store: ship powers down, gets tractored into bay
  return {
    id: 'garage-store',
    stageWidth: STAGE_W,
    stageHeight: STAGE_H,
    bgColor: '#0a0e14',
    initialActors: [
      { id: 'station', frames: [SCENE_SPRITES.outpost_frame1, SCENE_SPRITES.outpost_frame2], frameDuration: 800, x: 78, y: 50, size: 18 },
      { id: 'ship', frames: exhaustFrames, frameDuration: 250, x: 28, y: 50, size: 12 },
    ],
    phases: [
      {
        duration: 600,
        label: 'Approach',
        transitions: [
          { actorId: 'ship', x: 42, duration: 600, easing: 'ease-in' },
        ],
        effects: [
          { type: 'starfield', config: { count: 8, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      {
        duration: 800,
        label: 'Power down',
        text: 'POWERING DOWN',
        textClass: 'pixel-scene__text--warning',
        transitions: [
          { actorId: 'ship', size: 10, opacity: 0.7, duration: 800, replaceFrames: [base] },
        ],
        effects: [
          { type: 'flash', duration: 300, config: { color: '#d29922' } },
          { type: 'starfield', config: { count: 8, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      {
        duration: 1000,
        label: 'Tractor',
        transitions: [
          { actorId: 'ship', x: 72, size: 8, opacity: 0.3, duration: 1000, easing: 'ease-in' },
        ],
        effects: [
          { type: 'laser', duration: 900, config: { color: '#56d4dd', fromX: 72, fromY: 50, toX: 42, toY: 50 } },
          { type: 'starfield', config: { count: 8, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      {
        duration: 500,
        label: 'Stored',
        transitions: [
          { actorId: 'ship', opacity: 0, duration: 400 },
        ],
        effects: [
          { type: 'flash', duration: 300, config: { color: '#56d4dd' } },
          { type: 'starfield', config: { count: 8, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
        text: 'SHIP STORED',
        textClass: 'pixel-scene__text--system',
      },
    ],
  };
}
