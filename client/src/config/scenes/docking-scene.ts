import { SPRITES } from '../pixel-sprites';
import { makeExhaustFrames, SCENE_SPRITES } from '../scene-sprites';
import type { SceneDefinition } from '../scene-types';

const STAGE_W = 48;
const STAGE_H = 24;

export function buildDockingScene(shipTypeId: string, _outpostName: string): SceneDefinition {
  const shipKey = `ship_${shipTypeId}`;
  const baseSprite = SPRITES[shipKey] ?? SPRITES.ship_scout;
  const exhaustFrames = makeExhaustFrames(baseSprite);

  return {
    id: 'docking',
    stageWidth: STAGE_W,
    stageHeight: STAGE_H,
    bgColor: '#0a0e14',
    initialActors: [
      {
        id: 'ship',
        frames: exhaustFrames,
        frameDuration: 150,
        x: 10,
        y: 50,
        size: 10,
        opacity: 1,
      },
      {
        id: 'station',
        frames: [SCENE_SPRITES.outpost_frame1, SCENE_SPRITES.outpost_frame2],
        frameDuration: 500,
        x: 75,
        y: 50,
        size: 14,
        opacity: 1,
      },
    ],
    phases: [
      {
        duration: 1500,
        label: 'Approach',
        transitions: [
          { actorId: 'ship', x: 40, duration: 1500, easing: 'ease-in-out' },
        ],
        effects: [
          { type: 'starfield', config: { count: 15, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      {
        duration: 1000,
        label: 'Dock',
        transitions: [
          { actorId: 'ship', x: 55, duration: 1000, easing: 'ease-out' },
        ],
        effects: [
          { type: 'flash', duration: 600, config: { color: '#3fb950' } },
        ],
      },
    ],
  };
}
