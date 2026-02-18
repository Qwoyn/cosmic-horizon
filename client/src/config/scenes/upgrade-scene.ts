import { SPRITES } from '../pixel-sprites';
import { makeExhaustFrames, SCENE_SPRITES } from '../scene-sprites';
import type { SceneDefinition } from '../scene-types';

const STAGE_W = 48;
const STAGE_H = 32;

/**
 * Upgrade installation — ship docks close to station, mechanical arms
 * (laser beams) reach out, sparks fly at multiple points on the hull,
 * ship briefly powers down then reboots with enhanced glow.
 */
export function buildUpgradeScene(shipTypeId: string): SceneDefinition {
  const base = SPRITES[`ship_${shipTypeId}`] ?? SPRITES.ship_scout;
  const exhaustFrames = makeExhaustFrames(base);

  return {
    id: 'upgrade-install',
    stageWidth: STAGE_W,
    stageHeight: STAGE_H,
    bgColor: '#0a0e14',
    initialActors: [
      { id: 'station', frames: [SCENE_SPRITES.outpost_frame1, SCENE_SPRITES.outpost_frame2], frameDuration: 600, x: 78, y: 50, size: 16 },
      { id: 'ship', frames: exhaustFrames, frameDuration: 250, x: 30, y: 50, size: 12 },
    ],
    phases: [
      // Ship approaches and powers down for maintenance
      {
        duration: 700,
        label: 'Dock',
        transitions: [
          { actorId: 'ship', x: 45, duration: 700, easing: 'ease-in', replaceFrames: [base] },
        ],
        effects: [
          { type: 'starfield', config: { count: 8, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
        text: 'DOCKING FOR UPGRADE',
        textClass: 'pixel-scene__text--system',
      },
      // Mechanical arm 1 reaches out — first weld point, sparks
      {
        duration: 600,
        label: 'Weld 1',
        transitions: [
          { actorId: 'ship', opacity: 0.8, duration: 200 },
        ],
        addActors: [
          { id: 'spark1', frames: [SCENE_SPRITES.hit_flash], frameDuration: 100, x: 48, y: 44, size: 4 },
        ],
        effects: [
          { type: 'laser', duration: 500, config: { color: '#d29922', fromX: 68, fromY: 42, toX: 48, toY: 44 } },
          { type: 'flash', duration: 200, delay: 200, config: { color: '#d29922' } },
          { type: 'starfield', config: { count: 8, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      // Arm 2 from different angle — more sparks, ship flickers
      {
        duration: 600,
        label: 'Weld 2',
        transitions: [
          { actorId: 'spark1', x: 42, y: 56, duration: 200 },
        ],
        addActors: [
          { id: 'spark2', frames: [SCENE_SPRITES.hit_flash], frameDuration: 80, x: 50, y: 52, size: 3 },
        ],
        effects: [
          { type: 'laser', duration: 500, config: { color: '#f0883e', fromX: 70, fromY: 58, toX: 50, toY: 52 } },
          { type: 'flash', duration: 200, delay: 250, config: { color: '#f0883e' } },
          { type: 'starfield', config: { count: 8, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      // Third weld — final attachment
      {
        duration: 500,
        label: 'Weld 3',
        removeActors: ['spark1'],
        transitions: [
          { actorId: 'spark2', x: 46, y: 48, duration: 200 },
        ],
        effects: [
          { type: 'laser', duration: 400, config: { color: '#d29922', fromX: 66, fromY: 38, toX: 46, toY: 48 } },
          { type: 'flash', duration: 200, delay: 200, config: { color: '#d29922' } },
          { type: 'starfield', config: { count: 8, stageWidth: STAGE_W, stageHeight: STAGE_H } },
          { type: 'scanlines' },
        ],
      },
      // Reboot — ship powers back on, enhanced glow
      {
        duration: 800,
        label: 'Reboot',
        removeActors: ['spark2'],
        transitions: [
          { actorId: 'ship', opacity: 1, size: 13, duration: 600, easing: 'ease-out', replaceFrames: exhaustFrames },
        ],
        effects: [
          { type: 'flash', duration: 500, config: { color: '#3fb950' } },
          { type: 'starfield', config: { count: 8, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
        text: 'UPGRADE INSTALLED',
        textClass: 'pixel-scene__text--success',
      },
      // Undock — ship pulls away, slightly bigger to feel more powerful
      {
        duration: 600,
        label: 'Undock',
        transitions: [
          { actorId: 'ship', x: 25, size: 12, duration: 600, easing: 'ease-out' },
        ],
        effects: [
          { type: 'starfield', config: { count: 10, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
    ],
  };
}
