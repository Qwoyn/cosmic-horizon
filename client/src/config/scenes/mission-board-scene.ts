import { SPRITES } from '../pixel-sprites';
import { SCENE_SPRITES } from '../scene-sprites';
import type { SceneDefinition } from '../scene-types';

const STAGE_W = 48;
const STAGE_H = 32;

/**
 * Mission board — player approaches the station terminal.
 * Holographic mission markers (planet sprites representing destinations)
 * materialize one by one, connected by laser "route lines" to the station.
 * A crosshair sweeps across them as targets are evaluated.
 */
export function buildMissionBoardScene(): SceneDefinition {
  const missionTargets = [
    { sprite: SPRITES.planet_H, x: 20, y: 25 },
    { sprite: SPRITES.planet_F, x: 15, y: 65 },
    { sprite: SPRITES.planet_D, x: 35, y: 35 },
    { sprite: SPRITES.ship_corvette, x: 30, y: 70 },
  ];

  return {
    id: 'mission-board',
    stageWidth: STAGE_W,
    stageHeight: STAGE_H,
    bgColor: '#080c14',
    initialActors: [
      { id: 'station', frames: [SCENE_SPRITES.outpost_frame1, SCENE_SPRITES.outpost_frame2], frameDuration: 500, x: 75, y: 50, size: 16 },
    ],
    phases: [
      // Terminal boots up
      {
        duration: 500,
        label: 'Boot',
        text: 'MISSION BOARD',
        textClass: 'pixel-scene__text--system',
        effects: [
          { type: 'flash', duration: 300, config: { color: '#58a6ff' } },
          { type: 'starfield', config: { count: 6, stageWidth: STAGE_W, stageHeight: STAGE_H } },
          { type: 'scanlines' },
        ],
      },
      // Mission targets materialize — first two with route lines
      {
        duration: 800,
        label: 'Load 1',
        addActors: [
          { id: 't0', frames: [missionTargets[0].sprite], frameDuration: 200, x: missionTargets[0].x, y: missionTargets[0].y, size: 6, opacity: 0 },
          { id: 't1', frames: [missionTargets[1].sprite], frameDuration: 200, x: missionTargets[1].x, y: missionTargets[1].y, size: 6, opacity: 0 },
        ],
        transitions: [
          { actorId: 't0', opacity: 0.6, duration: 500, delay: 100, easing: 'ease-out' },
          { actorId: 't1', opacity: 0.6, duration: 500, delay: 300, easing: 'ease-out' },
        ],
        effects: [
          { type: 'laser', duration: 600, delay: 100, config: { color: '#58a6ff', fromX: 65, fromY: 45, toX: missionTargets[0].x, toY: missionTargets[0].y } },
          { type: 'laser', duration: 600, delay: 300, config: { color: '#58a6ff', fromX: 65, fromY: 55, toX: missionTargets[1].x, toY: missionTargets[1].y } },
          { type: 'starfield', config: { count: 6, stageWidth: STAGE_W, stageHeight: STAGE_H } },
          { type: 'scanlines' },
        ],
      },
      // More targets + crosshair evaluating them
      {
        duration: 800,
        label: 'Load 2',
        addActors: [
          { id: 't2', frames: [missionTargets[2].sprite], frameDuration: 200, x: missionTargets[2].x, y: missionTargets[2].y, size: 5, opacity: 0 },
          { id: 't3', frames: [missionTargets[3].sprite], frameDuration: 200, x: missionTargets[3].x, y: missionTargets[3].y, size: 5, opacity: 0 },
          { id: 'xhair', frames: [SPRITES.combat_crosshair], frameDuration: 200, x: missionTargets[0].x, y: missionTargets[0].y, size: 8, opacity: 0 },
        ],
        transitions: [
          { actorId: 't2', opacity: 0.6, duration: 400, delay: 100, easing: 'ease-out' },
          { actorId: 't3', opacity: 0.5, duration: 400, delay: 250, easing: 'ease-out' },
          { actorId: 'xhair', opacity: 0.7, x: missionTargets[2].x, y: missionTargets[2].y, duration: 800, easing: 'ease-in-out' },
        ],
        effects: [
          { type: 'laser', duration: 500, delay: 100, config: { color: '#a371f7', fromX: 65, fromY: 48, toX: missionTargets[2].x, toY: missionTargets[2].y } },
          { type: 'flash', duration: 250, delay: 500, config: { color: '#a371f7' } },
          { type: 'starfield', config: { count: 6, stageWidth: STAGE_W, stageHeight: STAGE_H } },
          { type: 'scanlines' },
        ],
      },
      // All targets displayed — crosshair settles, ready for selection
      {
        duration: 700,
        label: 'Ready',
        transitions: [
          { actorId: 'xhair', opacity: 0, duration: 400, easing: 'ease-in' },
          { actorId: 't0', opacity: 0.3, duration: 500 },
          { actorId: 't1', opacity: 0.3, duration: 500 },
          { actorId: 't2', opacity: 0.3, duration: 500 },
          { actorId: 't3', opacity: 0.3, duration: 500 },
        ],
        effects: [
          { type: 'flash', duration: 300, config: { color: '#56d4dd' } },
          { type: 'starfield', config: { count: 6, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
        text: 'CONTRACTS AVAILABLE',
        textClass: 'pixel-scene__text--success',
      },
    ],
  };
}
