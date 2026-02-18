import { SPRITES } from '../pixel-sprites';
import { makeExhaustFrames } from '../scene-sprites';
import type { SceneDefinition } from '../scene-types';

const STAGE_W = 48;
const STAGE_H = 32;

/**
 * Long-range scan — ship powers up, dish charges,
 * expanding warp-line ripples reach outward, ghost contacts
 * materialize at the edges, data readout overlay.
 */
export function buildScanScene(shipTypeId: string, adjacentCount: number): SceneDefinition {
  const base = SPRITES[`ship_${shipTypeId}`] ?? SPRITES.ship_scout;
  const exhaustFrames = makeExhaustFrames(base);

  // Scatter ghost contacts around the edges based on adjacent sector count
  const ghostPositions = [
    { x: 85, y: 25 }, { x: 10, y: 70 }, { x: 90, y: 70 },
    { x: 15, y: 25 }, { x: 85, y: 50 }, { x: 10, y: 45 },
  ];
  const planetKeys = ['planet_H', 'planet_D', 'planet_O', 'planet_A', 'planet_F', 'planet_V'] as const;
  const numGhosts = Math.min(adjacentCount, ghostPositions.length);

  return {
    id: 'scan-pulse',
    stageWidth: STAGE_W,
    stageHeight: STAGE_H,
    bgColor: '#0a0e14',
    initialActors: [
      { id: 'ship', frames: exhaustFrames, frameDuration: 200, x: 50, y: 50, size: 12 },
    ],
    phases: [
      // Phase 1 — Power up: ship brightens, warp-lines crackle
      {
        duration: 800,
        label: 'Charging',
        text: 'CHARGING SCANNER',
        textClass: 'pixel-scene__text--system',
        transitions: [
          { actorId: 'ship', size: 13, duration: 800, easing: 'ease-in' },
        ],
        effects: [
          { type: 'starfield', config: { count: 25, stageWidth: STAGE_W, stageHeight: STAGE_H } },
          { type: 'warp-lines', duration: 800, config: { count: 8, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      // Phase 2 — First pulse: cyan flash ripples outward, ghost contacts start appearing
      {
        duration: 900,
        label: 'Pulse 1',
        addActors: Array.from({ length: Math.min(numGhosts, 3) }, (_, i) => ({
          id: `ghost${i}`,
          frames: [SPRITES[planetKeys[i % planetKeys.length]]],
          frameDuration: 200,
          x: ghostPositions[i].x,
          y: ghostPositions[i].y,
          size: 5,
          opacity: 0,
        })),
        transitions: [
          { actorId: 'ship', size: 12, duration: 300, easing: 'ease-out' },
          ...Array.from({ length: Math.min(numGhosts, 3) }, (_, i) => ({
            actorId: `ghost${i}`,
            opacity: 0.4,
            duration: 600,
            delay: 200 + i * 150,
            easing: 'ease-out',
          })),
        ],
        effects: [
          { type: 'flash', duration: 500, config: { color: '#56d4dd' } },
          { type: 'starfield', config: { count: 25, stageWidth: STAGE_W, stageHeight: STAGE_H } },
          { type: 'scanlines' },
        ],
      },
      // Phase 3 — Second pulse: deeper blue, more contacts resolve
      {
        duration: 900,
        label: 'Pulse 2',
        addActors: numGhosts > 3
          ? Array.from({ length: numGhosts - 3 }, (_, i) => ({
              id: `ghost${i + 3}`,
              frames: [SPRITES[planetKeys[(i + 3) % planetKeys.length]]],
              frameDuration: 200,
              x: ghostPositions[i + 3].x,
              y: ghostPositions[i + 3].y,
              size: 5,
              opacity: 0,
            }))
          : [],
        transitions: [
          // Existing ghosts solidify
          ...Array.from({ length: Math.min(numGhosts, 3) }, (_, i) => ({
            actorId: `ghost${i}`,
            opacity: 0.6,
            size: 6,
            duration: 500,
            easing: 'ease-out',
          })),
          // New ghosts fade in
          ...(numGhosts > 3
            ? Array.from({ length: numGhosts - 3 }, (_, i) => ({
                actorId: `ghost${i + 3}`,
                opacity: 0.4,
                duration: 600,
                delay: 100 + i * 150,
                easing: 'ease-out',
              }))
            : []),
        ],
        effects: [
          { type: 'flash', duration: 500, delay: 100, config: { color: '#58a6ff' } },
          { type: 'starfield', config: { count: 25, stageWidth: STAGE_W, stageHeight: STAGE_H } },
          { type: 'scanlines' },
        ],
      },
      // Phase 4 — Data resolve: contacts flash bright then fade, readout text
      {
        duration: 800,
        label: 'Resolve',
        transitions: [
          ...Array.from({ length: numGhosts }, (_, i) => ({
            actorId: `ghost${i}`,
            opacity: 0,
            duration: 600,
            delay: 200,
            easing: 'ease-in',
          })),
        ],
        effects: [
          { type: 'flash', duration: 400, config: { color: '#a371f7' } },
          { type: 'starfield', config: { count: 25, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
        text: `${adjacentCount} SECTORS DETECTED`,
        textClass: 'pixel-scene__text--success',
      },
    ],
  };
}
