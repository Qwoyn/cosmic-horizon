import { SPRITES } from '../pixel-sprites';
import { makeExhaustFrames, SCENE_SPRITES } from '../scene-sprites';
import type { SceneDefinition, SceneActor, SceneEffect } from '../scene-types';

const STAGE_W = 48;
const STAGE_H = 32;

/** Sector-type tinted backgrounds */
const SECTOR_BG: Record<string, string> = {
  standard: '#0a0e14',
  protected: '#0a100e',       // subtle green tint
  harmony_enforced: '#0a0e18', // subtle blue tint
  one_way: '#100e0a',          // subtle amber tint
};

/** Star counts vary by sector type */
const SECTOR_STARS: Record<string, number> = {
  standard: 25,
  protected: 20,
  harmony_enforced: 18,
  one_way: 30,
};

export interface AmbientContext {
  shipTypeId: string;
  sectorType?: string;
  planetClasses?: string[];
  playerCount?: number;
  sectorId?: number;
}

function getBg(ctx: AmbientContext): string {
  return SECTOR_BG[ctx.sectorType ?? 'standard'] ?? SECTOR_BG.standard;
}

function getStarCount(ctx: AmbientContext, base?: number): number {
  const typeStars = SECTOR_STARS[ctx.sectorType ?? 'standard'] ?? SECTOR_STARS.standard;
  return base ?? typeStars;
}

function buildPlanetActors(planetClasses: string[]): SceneActor[] {
  // Show up to 2 planets in the background
  const actors: SceneActor[] = [];
  const slots = [
    { x: 80, y: 25, size: 8 },
    { x: 15, y: 75, size: 7 },
  ];
  for (let i = 0; i < Math.min(planetClasses.length, 2); i++) {
    const cls = planetClasses[i];
    const sprite = SPRITES[`planet_${cls}`] ?? SCENE_SPRITES.planet_arrival;
    actors.push({
      id: `planet-${i}`,
      frames: [sprite],
      frameDuration: 200,
      ...slots[i],
      opacity: 0.5,
    });
  }
  return actors;
}

function buildDangerEffects(playerCount: number): SceneEffect[] {
  if (playerCount <= 0) return [];
  // Scanlines overlay when other players are present — feels like radar/alert
  return [{ type: 'scanlines' }];
}

/** Empty sector: ship floating with stars, exhaust cycling */
export function buildIdleSpaceScene(ctx: AmbientContext): SceneDefinition {
  const base = SPRITES[`ship_${ctx.shipTypeId}`] ?? SPRITES.ship_scout;
  const exhaustFrames = makeExhaustFrames(base);
  const bg = getBg(ctx);
  const starCount = getStarCount(ctx);
  const planetActors = buildPlanetActors(ctx.planetClasses ?? []);
  const dangerEffects = buildDangerEffects(ctx.playerCount ?? 0);

  // Include sectorId in the scene id so ambient remounts on sector change
  const id = `idle-space-${ctx.sectorId ?? 0}`;

  return {
    id,
    stageWidth: STAGE_W,
    stageHeight: STAGE_H,
    bgColor: bg,
    initialActors: [
      { id: 'ship', frames: exhaustFrames, frameDuration: 300, x: 35, y: 50, size: 12 },
      ...planetActors,
    ],
    phases: [
      {
        duration: 600000,
        effects: [
          { type: 'starfield', config: { count: starCount, stageWidth: STAGE_W, stageHeight: STAGE_H } },
          ...dangerEffects,
        ],
      },
    ],
  };
}

/** At outpost: ship near outpost/station with stars */
export function buildIdleOutpostScene(ctx: AmbientContext): SceneDefinition {
  const base = SPRITES[`ship_${ctx.shipTypeId}`] ?? SPRITES.ship_scout;
  const exhaustFrames = makeExhaustFrames(base);
  const bg = getBg(ctx);
  const starCount = getStarCount(ctx, 15);
  const planetActors = buildPlanetActors(ctx.planetClasses ?? []);
  const dangerEffects = buildDangerEffects(ctx.playerCount ?? 0);

  const id = `idle-outpost-${ctx.sectorId ?? 0}`;

  return {
    id,
    stageWidth: STAGE_W,
    stageHeight: STAGE_H,
    bgColor: bg,
    initialActors: [
      { id: 'ship', frames: exhaustFrames, frameDuration: 300, x: 30, y: 50, size: 10 },
      { id: 'station', frames: [SCENE_SPRITES.outpost_frame1, SCENE_SPRITES.outpost_frame2], frameDuration: 800, x: 72, y: 50, size: 14 },
      ...planetActors,
    ],
    phases: [
      {
        duration: 600000,
        effects: [
          { type: 'starfield', config: { count: starCount, stageWidth: STAGE_W, stageHeight: STAGE_H } },
          ...dangerEffects,
        ],
      },
    ],
  };
}

/** Docked: ship touching station, no exhaust */
export function buildIdleDockedScene(ctx: AmbientContext): SceneDefinition {
  const base = SPRITES[`ship_${ctx.shipTypeId}`] ?? SPRITES.ship_scout;
  const bg = getBg(ctx);
  const starCount = getStarCount(ctx, 10);

  const id = `idle-docked-${ctx.sectorId ?? 0}`;

  return {
    id,
    stageWidth: STAGE_W,
    stageHeight: STAGE_H,
    bgColor: bg,
    initialActors: [
      { id: 'ship', frames: [base], frameDuration: 200, x: 55, y: 50, size: 10, opacity: 0.9 },
      { id: 'station', frames: [SCENE_SPRITES.outpost_frame1, SCENE_SPRITES.outpost_frame2], frameDuration: 800, x: 72, y: 50, size: 14 },
    ],
    phases: [
      {
        duration: 600000,
        effects: [
          { type: 'starfield', config: { count: starCount, stageWidth: STAGE_W, stageHeight: STAGE_H } },
        ],
      },
    ],
  };
}
