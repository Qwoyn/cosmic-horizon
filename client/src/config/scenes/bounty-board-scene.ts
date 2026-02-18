import { SPRITES } from '../pixel-sprites';
import { SCENE_SPRITES } from '../scene-sprites';
import type { SceneDefinition } from '../scene-types';

const STAGE_W = 48;
const STAGE_H = 32;

/**
 * Bounty board — red alert atmosphere. Station terminal powers on,
 * wanted target silhouettes (enemy ships) appear with crosshairs
 * locking on. Red flashes pulse like alarm lights. Dramatic
 * "WANTED" text burns in.
 */
export function buildBountyBoardScene(): SceneDefinition {
  return {
    id: 'bounty-board',
    stageWidth: STAGE_W,
    stageHeight: STAGE_H,
    bgColor: '#100808',
    initialActors: [
      { id: 'station', frames: [SCENE_SPRITES.outpost_frame1, SCENE_SPRITES.outpost_frame2], frameDuration: 400, x: 75, y: 50, size: 16 },
    ],
    phases: [
      // Alert — red flash, alarm feel
      {
        duration: 500,
        label: 'Alert',
        effects: [
          { type: 'flash', duration: 400, config: { color: '#f85149' } },
          { type: 'starfield', config: { count: 4, stageWidth: STAGE_W, stageHeight: STAGE_H } },
          { type: 'scanlines' },
        ],
      },
      // Wanted target 1 appears — enemy ship silhouette with crosshair
      {
        duration: 700,
        label: 'Target 1',
        text: 'WANTED',
        textClass: 'pixel-scene__text--danger',
        addActors: [
          { id: 'target1', frames: [SPRITES.ship_corvette], frameDuration: 200, x: 25, y: 35, size: 8, opacity: 0 },
          { id: 'xhair1', frames: [SPRITES.combat_crosshair], frameDuration: 200, x: 25, y: 35, size: 10, opacity: 0 },
        ],
        transitions: [
          { actorId: 'target1', opacity: 0.6, duration: 400, delay: 100, easing: 'ease-out' },
          { actorId: 'xhair1', opacity: 0.8, duration: 400, delay: 200, easing: 'ease-out' },
        ],
        effects: [
          { type: 'flash', duration: 200, delay: 400, config: { color: '#f0883e' } },
          { type: 'starfield', config: { count: 4, stageWidth: STAGE_W, stageHeight: STAGE_H } },
          { type: 'scanlines' },
        ],
      },
      // Target 2 — another ship, crosshair locks
      {
        duration: 700,
        label: 'Target 2',
        addActors: [
          { id: 'target2', frames: [SPRITES.ship_stealth], frameDuration: 200, x: 40, y: 65, size: 7, opacity: 0 },
          { id: 'xhair2', frames: [SPRITES.combat_crosshair], frameDuration: 200, x: 40, y: 65, size: 9, opacity: 0 },
        ],
        transitions: [
          { actorId: 'target2', opacity: 0.5, duration: 400, delay: 100, easing: 'ease-out' },
          { actorId: 'xhair2', opacity: 0.7, duration: 400, delay: 200, easing: 'ease-out' },
          // First crosshair starts pulsing smaller
          { actorId: 'xhair1', size: 8, duration: 500, easing: 'ease-in-out' },
        ],
        effects: [
          { type: 'flash', duration: 200, delay: 350, config: { color: '#f85149' } },
          { type: 'laser', duration: 500, delay: 100, config: { color: '#f85149', fromX: 65, fromY: 45, toX: 40, toY: 65 } },
          { type: 'starfield', config: { count: 4, stageWidth: STAGE_W, stageHeight: STAGE_H } },
          { type: 'scanlines' },
        ],
      },
      // Third target — brief, rapid
      {
        duration: 600,
        label: 'Target 3',
        addActors: [
          { id: 'target3', frames: [SPRITES.ship_cruiser], frameDuration: 200, x: 18, y: 60, size: 6, opacity: 0 },
        ],
        transitions: [
          { actorId: 'target3', opacity: 0.4, duration: 300, easing: 'ease-out' },
          { actorId: 'xhair2', size: 7, duration: 400, easing: 'ease-in-out' },
        ],
        effects: [
          { type: 'flash', duration: 200, delay: 200, config: { color: '#f0883e' } },
          { type: 'laser', duration: 400, config: { color: '#f0883e', fromX: 65, fromY: 55, toX: 18, toY: 60 } },
          { type: 'starfield', config: { count: 4, stageWidth: STAGE_W, stageHeight: STAGE_H } },
          { type: 'scanlines' },
        ],
      },
      // Board displayed — all targets fade to ghosts, final red pulse
      {
        duration: 600,
        label: 'Display',
        transitions: [
          { actorId: 'target1', opacity: 0.2, duration: 400 },
          { actorId: 'target2', opacity: 0.2, duration: 400 },
          { actorId: 'target3', opacity: 0.2, duration: 400 },
          { actorId: 'xhair1', opacity: 0.3, duration: 400 },
          { actorId: 'xhair2', opacity: 0.3, duration: 400 },
        ],
        effects: [
          { type: 'flash', duration: 400, config: { color: '#f85149' } },
          { type: 'starfield', config: { count: 4, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
        text: 'BOUNTIES ACTIVE',
        textClass: 'pixel-scene__text--danger',
      },
    ],
  };
}
