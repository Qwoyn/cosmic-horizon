import { SPRITES } from '../pixel-sprites';
import { SCENE_SPRITES } from '../scene-sprites';
import type { SceneDefinition } from '../scene-types';

const STAGE_W = 48;
const STAGE_H = 32;

/**
 * Salvage yard — the condemned ship is tractored to the scrap station,
 * lasers slice it apart, explosion frames burst, debris scatters in
 * multiple directions, credits text rises from the wreck.
 */
export function buildSalvageScene(shipTypeId: string): SceneDefinition {
  const base = SPRITES[`ship_${shipTypeId}`] ?? SPRITES.ship_scout;

  return {
    id: 'salvage',
    stageWidth: STAGE_W,
    stageHeight: STAGE_H,
    bgColor: '#0a0e14',
    initialActors: [
      { id: 'station', frames: [SCENE_SPRITES.outpost_frame1, SCENE_SPRITES.outpost_frame2], frameDuration: 600, x: 80, y: 50, size: 16 },
      { id: 'ship', frames: [base], frameDuration: 200, x: 25, y: 50, size: 10 },
    ],
    phases: [
      // Tractor the doomed ship to the station
      {
        duration: 800,
        label: 'Tractor',
        text: 'TOWING TO YARD',
        textClass: 'pixel-scene__text--warning',
        transitions: [
          { actorId: 'ship', x: 52, duration: 800, easing: 'ease-in' },
        ],
        effects: [
          { type: 'laser', duration: 700, config: { color: '#d29922', fromX: 80, fromY: 50, toX: 25, toY: 50 } },
          { type: 'starfield', config: { count: 8, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      // Cutting lasers hit the hull — orange flash, ship starts to break
      {
        duration: 700,
        label: 'Cut 1',
        transitions: [
          { actorId: 'ship', opacity: 0.7, duration: 300 },
        ],
        addActors: [
          { id: 'spark1', frames: [SCENE_SPRITES.hit_flash], frameDuration: 120, x: 48, y: 46, size: 4 },
        ],
        effects: [
          { type: 'laser', duration: 400, config: { color: '#f0883e', fromX: 70, fromY: 40, toX: 50, toY: 48 } },
          { type: 'flash', duration: 250, delay: 200, config: { color: '#f0883e' } },
          { type: 'starfield', config: { count: 8, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      // Second cut, more violent — ship flickering
      {
        duration: 700,
        label: 'Cut 2',
        transitions: [
          { actorId: 'ship', opacity: 0.4, duration: 400 },
          { actorId: 'spark1', x: 55, y: 54, duration: 300 },
        ],
        addActors: [
          { id: 'spark2', frames: [SCENE_SPRITES.hit_flash], frameDuration: 100, x: 53, y: 44, size: 3 },
        ],
        effects: [
          { type: 'laser', duration: 400, config: { color: '#f85149', fromX: 72, fromY: 60, toX: 52, toY: 52 } },
          { type: 'flash', duration: 250, delay: 300, config: { color: '#f85149' } },
          { type: 'starfield', config: { count: 8, stageWidth: STAGE_W, stageHeight: STAGE_H } },
          { type: 'scanlines' },
        ],
      },
      // Ship breaks apart — replaced with explosion frames + 4 debris chunks flying outward
      {
        duration: 1000,
        label: 'Break',
        removeActors: ['ship', 'spark1', 'spark2'],
        addActors: [
          { id: 'exp', frames: [SCENE_SPRITES.explosion_frame1, SCENE_SPRITES.explosion_frame2, SCENE_SPRITES.explosion_frame3, SCENE_SPRITES.explosion_frame4], frameDuration: 150, x: 52, y: 50, size: 10, opacity: 1 },
          { id: 'd1', frames: [SCENE_SPRITES.explosion_frame3], frameDuration: 200, x: 52, y: 50, size: 5, opacity: 0.9 },
          { id: 'd2', frames: [SCENE_SPRITES.explosion_frame4], frameDuration: 200, x: 52, y: 50, size: 4, opacity: 0.8 },
          { id: 'd3', frames: [SCENE_SPRITES.explosion_frame3], frameDuration: 250, x: 52, y: 50, size: 3, opacity: 0.7 },
          { id: 'd4', frames: [SCENE_SPRITES.explosion_frame4], frameDuration: 300, x: 52, y: 50, size: 4, opacity: 0.7 },
        ],
        transitions: [
          { actorId: 'exp', opacity: 0, size: 14, duration: 800, easing: 'ease-out' },
          { actorId: 'd1', x: 30, y: 25, opacity: 0, duration: 1000, easing: 'ease-out' },
          { actorId: 'd2', x: 70, y: 20, opacity: 0, duration: 900, easing: 'ease-out' },
          { actorId: 'd3', x: 25, y: 75, opacity: 0, duration: 950, easing: 'ease-out' },
          { actorId: 'd4', x: 75, y: 70, opacity: 0, duration: 1000, easing: 'ease-out' },
        ],
        effects: [
          { type: 'flash', duration: 500, config: { color: '#d29922' } },
          { type: 'starfield', config: { count: 8, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      // Credits earned — dust settles
      {
        duration: 600,
        label: 'Credits',
        removeActors: ['exp', 'd1', 'd2', 'd3', 'd4'],
        effects: [
          { type: 'flash', duration: 300, config: { color: '#3fb950' } },
          { type: 'starfield', config: { count: 8, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
        text: 'SALVAGE COMPLETE',
        textClass: 'pixel-scene__text--trade',
      },
    ],
  };
}
