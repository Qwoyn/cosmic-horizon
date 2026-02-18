import { SPRITES } from '../pixel-sprites';
import { makeExhaustFrames, SCENE_SPRITES } from '../scene-sprites';
import type { SceneDefinition } from '../scene-types';

const STAGE_W = 48;
const STAGE_H = 32;

/** Ship descends toward a planet surface */
export function buildColonizeScene(shipTypeId: string, planetClass: string): SceneDefinition {
  const base = SPRITES[`ship_${shipTypeId}`] ?? SPRITES.ship_scout;
  const exhaustFrames = makeExhaustFrames(base);
  const planetSprite = SPRITES[`planet_${planetClass}`] ?? SCENE_SPRITES.planet_arrival;

  return {
    id: 'colonize',
    stageWidth: STAGE_W,
    stageHeight: STAGE_H,
    bgColor: '#0a0e14',
    initialActors: [
      { id: 'planet', frames: [planetSprite], frameDuration: 200, x: 50, y: 65, size: 18 },
      { id: 'ship', frames: exhaustFrames, frameDuration: 150, x: 50, y: 20, size: 10 },
    ],
    phases: [
      {
        duration: 1200,
        label: 'Approach',
        transitions: [
          { actorId: 'ship', y: 40, duration: 1200, easing: 'ease-in', size: 8 },
        ],
        effects: [
          { type: 'starfield', config: { count: 15, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      {
        duration: 1000,
        label: 'Deploy colonists',
        transitions: [
          { actorId: 'ship', y: 48, duration: 1000, easing: 'ease-out', size: 7 },
        ],
        effects: [
          { type: 'flash', duration: 500, delay: 400, config: { color: '#3fb950' } },
          { type: 'starfield', config: { count: 15, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      {
        duration: 800,
        label: 'Ascend',
        transitions: [
          { actorId: 'ship', y: 20, duration: 800, easing: 'ease-in', size: 10 },
        ],
        effects: [
          { type: 'starfield', config: { count: 15, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
    ],
  };
}
