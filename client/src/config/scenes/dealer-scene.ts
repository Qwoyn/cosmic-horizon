import { SPRITES } from '../pixel-sprites';
import { makeExhaustFrames, SCENE_SPRITES } from '../scene-sprites';
import type { SceneDefinition } from '../scene-types';

const STAGE_W = 48;
const STAGE_H = 32;

/**
 * Ship dealer — showroom reveal. The new ship sits in the bay as a
 * dark silhouette. Spotlight sweeps across, ship illuminates, bay doors
 * open, ship fires up exhaust and flies out to the player.
 */
export function buildDealerScene(newShipTypeId: string): SceneDefinition {
  const newBase = SPRITES[`ship_${newShipTypeId}`] ?? SPRITES.ship_scout;
  const newExhaust = makeExhaustFrames(newBase);

  return {
    id: 'dealer-buy',
    stageWidth: STAGE_W,
    stageHeight: STAGE_H,
    bgColor: '#08060e',
    initialActors: [
      { id: 'station', frames: [SCENE_SPRITES.outpost_frame1, SCENE_SPRITES.outpost_frame2], frameDuration: 800, x: 80, y: 50, size: 16 },
      { id: 'newship', frames: [newBase], frameDuration: 200, x: 72, y: 50, size: 10, opacity: 0.15 },
    ],
    phases: [
      // Showroom — ship is a dark silhouette inside the bay
      {
        duration: 600,
        label: 'Showroom',
        text: 'SHIP DEALER',
        textClass: 'pixel-scene__text--trade',
        effects: [
          { type: 'starfield', config: { count: 6, stageWidth: STAGE_W, stageHeight: STAGE_H } },
          { type: 'scanlines' },
        ],
      },
      // Spotlight — ship illuminates in stages
      {
        duration: 700,
        label: 'Reveal',
        transitions: [
          { actorId: 'newship', opacity: 0.5, duration: 400, easing: 'ease-in' },
        ],
        effects: [
          { type: 'flash', duration: 400, config: { color: '#a371f7' } },
          { type: 'starfield', config: { count: 6, stageWidth: STAGE_W, stageHeight: STAGE_H } },
          { type: 'scanlines' },
        ],
      },
      // Full reveal — ship fully lit, specs confirmed
      {
        duration: 600,
        label: 'Confirm',
        transitions: [
          { actorId: 'newship', opacity: 1, size: 12, duration: 500, easing: 'ease-out' },
        ],
        effects: [
          { type: 'flash', duration: 300, config: { color: '#d29922' } },
          { type: 'starfield', config: { count: 6, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
        text: 'PURCHASE CONFIRMED',
        textClass: 'pixel-scene__text--success',
      },
      // Launch — ship fires up exhaust, flies out of the bay to the left
      {
        duration: 1000,
        label: 'Launch',
        transitions: [
          { actorId: 'newship', x: 30, duration: 1000, easing: 'ease-out', replaceFrames: newExhaust },
        ],
        effects: [
          { type: 'flash', duration: 500, config: { color: '#3fb950' } },
          { type: 'starfield', config: { count: 10, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      // Fly free
      {
        duration: 500,
        label: 'Free',
        transitions: [
          { actorId: 'newship', x: 15, duration: 500, easing: 'ease-out' },
        ],
        effects: [
          { type: 'starfield', config: { count: 10, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
        text: 'SHIP ACQUIRED',
        textClass: 'pixel-scene__text--success',
      },
    ],
  };
}
