import { SPRITES } from '../pixel-sprites';
import { makeExhaustFrames, SCENE_SPRITES } from '../scene-sprites';
import type { SceneDefinition } from '../scene-types';

const STAGE_W = 48;
const STAGE_H = 32;

/**
 * Sector survey — ship slows, crosshair sweeps the viewport,
 * contacts (planet, outpost) briefly ping into view at the edges.
 */
export function buildLookScene(shipTypeId: string, hasPlanets: boolean, hasOutpost: boolean, hasPlayers: boolean): SceneDefinition {
  const base = SPRITES[`ship_${shipTypeId}`] ?? SPRITES.ship_scout;
  const exhaustFrames = makeExhaustFrames(base);

  // Phase 1 — ship drifts to a halt, crosshair appears
  // Phase 2 — crosshair sweeps right; contacts ping in as it passes
  // Phase 3 — crosshair sweeps further; more contacts
  // Phase 4 — "SECTOR CLEAR" / data readout flash

  const phases: SceneDefinition['phases'] = [
    {
      duration: 600,
      label: 'Halt',
      transitions: [
        { actorId: 'ship', x: 25, duration: 600, easing: 'ease-out' },
      ],
      addActors: [
        { id: 'xhair', frames: [SPRITES.combat_crosshair], frameDuration: 200, x: 15, y: 50, size: 6, opacity: 0 },
      ],
      effects: [
        { type: 'starfield', config: { count: 22, stageWidth: STAGE_W, stageHeight: STAGE_H } },
      ],
    },
    {
      duration: 800,
      label: 'Sweep',
      transitions: [
        { actorId: 'xhair', x: 50, y: 35, opacity: 0.8, duration: 800, easing: 'ease-in-out' },
      ],
      addActors: hasPlanets
        ? [{ id: 'ping1', frames: [SPRITES.planet_H], frameDuration: 200, x: 70, y: 30, size: 8, opacity: 0 }]
        : [],
      effects: [
        { type: 'flash', duration: 300, delay: 500, config: { color: '#58a6ff' } },
        { type: 'starfield', config: { count: 22, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        { type: 'scanlines' },
      ],
    },
    {
      duration: 800,
      label: 'Contacts',
      transitions: [
        { actorId: 'xhair', x: 80, y: 60, duration: 800, easing: 'ease-in-out' },
        ...(hasPlanets ? [{ actorId: 'ping1', opacity: 0.7, duration: 400, easing: 'ease-out' } as const] : []),
      ],
      addActors: [
        ...(hasOutpost ? [{ id: 'ping2', frames: [SCENE_SPRITES.outpost_frame1, SCENE_SPRITES.outpost_frame2], frameDuration: 500, x: 80, y: 65, size: 7, opacity: 0 } as const] : []),
        ...(hasPlayers ? [{ id: 'ping3', frames: [SPRITES.ship_scout], frameDuration: 200, x: 60, y: 75, size: 5, opacity: 0 } as const] : []),
      ],
      effects: [
        ...(hasOutpost ? [{ type: 'flash' as const, duration: 200, delay: 300, config: { color: '#3fb950' } }] : []),
        { type: 'starfield', config: { count: 22, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        { type: 'scanlines' },
      ],
    },
    {
      duration: 600,
      label: 'Readout',
      transitions: [
        { actorId: 'xhair', opacity: 0, duration: 400, easing: 'ease-out' },
        ...(hasOutpost ? [{ actorId: 'ping2', opacity: 0.6, duration: 300 } as const] : []),
        ...(hasPlayers ? [{ actorId: 'ping3', opacity: 0.5, duration: 300 } as const] : []),
      ],
      effects: [
        { type: 'flash', duration: 300, config: { color: '#56d4dd' } },
        { type: 'starfield', config: { count: 22, stageWidth: STAGE_W, stageHeight: STAGE_H } },
      ],
      text: 'SURVEY COMPLETE',
      textClass: 'pixel-scene__text--system',
    },
  ];

  return {
    id: 'look-survey',
    stageWidth: STAGE_W,
    stageHeight: STAGE_H,
    bgColor: '#0a0e14',
    initialActors: [
      { id: 'ship', frames: exhaustFrames, frameDuration: 300, x: 35, y: 50, size: 12 },
    ],
    phases,
  };
}
