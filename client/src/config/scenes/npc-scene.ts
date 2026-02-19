import { SPRITES } from '../pixel-sprites';
import type { SceneDefinition } from '../scene-types';

const STAGE_W = 48;
const STAGE_H = 32;

const BG_COLORS: Record<string, string> = {
  outpost_interior: '#0c0610',
  planet_surface: '#081020',
  open_sector: '#0a0a14',
};

/**
 * NPC first-encounter cutscene.
 * 4 phases: approach → reveal → greeting → fade.
 */
export function buildNPCEncounterScene(npcData: {
  name: string;
  title?: string;
  race?: string;
  spriteConfig?: { spriteId: string; paletteSwap?: Record<string, string> };
  sceneHint?: string;
}): SceneDefinition {
  const spriteId = npcData.spriteConfig?.spriteId ?? 'npc_generic_a';
  const sprite = SPRITES[spriteId] ?? SPRITES.npc_generic_a;
  const bgColor = BG_COLORS[npcData.sceneHint ?? 'outpost_interior'] ?? BG_COLORS.outpost_interior;

  return {
    id: 'npc-encounter',
    stageWidth: STAGE_W,
    stageHeight: STAGE_H,
    bgColor,
    initialActors: [],
    phases: [
      // Phase 1: Approach — starfield fades in
      {
        duration: 600,
        label: 'Approach',
        addActors: [
          { id: 'npc', frames: [sprite], frameDuration: 200, x: 60, y: 45, size: 10, opacity: 0 },
        ],
        effects: [
          { type: 'starfield', config: { count: 18, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      // Phase 2: Reveal — NPC sprite fades in with flash
      {
        duration: 800,
        label: 'Reveal',
        transitions: [
          { actorId: 'npc', opacity: 1, duration: 600, easing: 'ease-in' },
        ],
        effects: [
          { type: 'flash', duration: 300, delay: 400, config: { color: '#a371f7' } },
          { type: 'starfield', config: { count: 18, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
      // Phase 3: Greeting — name text, scanlines
      {
        duration: 700,
        label: 'Greeting',
        effects: [
          { type: 'scanlines' },
          { type: 'starfield', config: { count: 18, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
        text: `${npcData.name}${npcData.title ? ` — ${npcData.title}` : ''}`,
        textClass: 'pixel-scene__text--system',
      },
      // Phase 4: Fade — encounter logged
      {
        duration: 500,
        label: 'Logged',
        transitions: [
          { actorId: 'npc', opacity: 0.7, duration: 400, easing: 'ease-out' },
        ],
        effects: [
          { type: 'flash', duration: 200, config: { color: '#56d4dd' } },
          { type: 'starfield', config: { count: 18, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
        text: 'ENCOUNTER LOGGED',
        textClass: 'pixel-scene__text--system',
      },
    ],
  };
}
