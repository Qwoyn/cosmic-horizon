import { SPRITES } from '../pixel-sprites';
import { makeExhaustFrames, SCENE_SPRITES } from '../scene-sprites';
import type { SceneDefinition } from '../scene-types';

const STAGE_W = 48;
const STAGE_H = 32;

export function buildCombatScene(attackerShipType: string, _damage: number): SceneDefinition {
  const attackerKey = `ship_${attackerShipType}`;
  const attackerBase = SPRITES[attackerKey] ?? SPRITES.ship_scout;
  const attackerFrames = makeExhaustFrames(attackerBase);
  const targetBase = SPRITES.ship_scout;
  const targetFrames = [targetBase];

  return {
    id: 'combat',
    stageWidth: STAGE_W,
    stageHeight: STAGE_H,
    bgColor: '#0a0e14',
    initialActors: [
      {
        id: 'attacker',
        frames: attackerFrames,
        frameDuration: 200,
        x: 20,
        y: 50,
        size: 12,
        opacity: 1,
        flipX: false,
        transform: 'rotate(-90)',
      },
      {
        id: 'target',
        frames: targetFrames,
        frameDuration: 200,
        x: 80,
        y: 50,
        size: 12,
        opacity: 1,
        flipX: true,
        transform: 'rotate(90)',
      },
    ],
    phases: [
      {
        duration: 800,
        label: 'Face-off',
      },
      {
        duration: 1200,
        label: 'Fire',
        effects: [
          { type: 'laser', config: { y: STAGE_H * 0.47, color: '#f85149' } },
        ],
      },
      {
        duration: 1500,
        label: 'Hit',
        transitions: [
          {
            actorId: 'target',
            replaceFrames: [
              SCENE_SPRITES.hit_flash,
              SCENE_SPRITES.explosion_frame1,
              SCENE_SPRITES.explosion_frame2,
              SCENE_SPRITES.explosion_frame3,
            ],
            duration: 200,
          },
        ],
        effects: [
          { type: 'flash', duration: 300, config: { color: '#ffffff' } },
        ],
      },
    ],
  };
}
