import db from '../db/connection';
import { GAME_CONFIG } from '../config/game';
import crypto from 'crypto';

export type MissionType = 'deliver_cargo' | 'visit_sector' | 'destroy_ship' | 'colonize_planet' | 'trade_units' | 'scan_sectors';

export interface MissionObjectives {
  // deliver_cargo: deliver X units of commodity to a sector with an outpost
  commodity?: string;
  quantity?: number;
  // visit_sector: visit N distinct sectors
  sectorsToVisit?: number;
  // destroy_ship: destroy N ships
  shipsToDestroy?: number;
  // colonize_planet: colonize N colonists
  colonistsToDeposit?: number;
  // trade_units: trade N units total (buy or sell)
  unitsToTrade?: number;
  // scan_sectors: scan N times
  scansRequired?: number;
}

export interface MissionProgress {
  sectorsVisited?: number[];
  shipsDestroyed?: number;
  colonistsDeposited?: number;
  unitsTraded?: number;
  scansCompleted?: number;
  cargoDelivered?: number;
}

export function checkMissionProgress(
  mission: { type: string; objectives: MissionObjectives; progress: MissionProgress },
  action: string,
  data: Record<string, any>
): { updated: boolean; completed: boolean; progress: MissionProgress } {
  const { type, objectives, progress } = mission;
  const p = { ...progress };
  let updated = false;

  switch (type) {
    case 'visit_sector':
      if (action === 'move') {
        const visited = p.sectorsVisited || [];
        if (!visited.includes(data.sectorId)) {
          visited.push(data.sectorId);
          p.sectorsVisited = visited;
          updated = true;
        }
      }
      break;

    case 'destroy_ship':
      if (action === 'combat_destroy') {
        p.shipsDestroyed = (p.shipsDestroyed || 0) + 1;
        updated = true;
      }
      break;

    case 'colonize_planet':
      if (action === 'colonize') {
        p.colonistsDeposited = (p.colonistsDeposited || 0) + (data.quantity || 0);
        updated = true;
      }
      break;

    case 'trade_units':
      if (action === 'trade') {
        p.unitsTraded = (p.unitsTraded || 0) + (data.quantity || 0);
        updated = true;
      }
      break;

    case 'scan_sectors':
      if (action === 'scan') {
        p.scansCompleted = (p.scansCompleted || 0) + 1;
        updated = true;
      }
      break;

    case 'deliver_cargo':
      if (action === 'trade' && data.tradeType === 'sell') {
        if (data.commodity === objectives.commodity) {
          p.cargoDelivered = (p.cargoDelivered || 0) + (data.quantity || 0);
          updated = true;
        }
      }
      break;
  }

  const completed = isMissionComplete(type, objectives, p);
  return { updated, completed, progress: p };
}

function isMissionComplete(type: string, objectives: MissionObjectives, progress: MissionProgress): boolean {
  switch (type) {
    case 'visit_sector':
      return (progress.sectorsVisited?.length || 0) >= (objectives.sectorsToVisit || 0);
    case 'destroy_ship':
      return (progress.shipsDestroyed || 0) >= (objectives.shipsToDestroy || 0);
    case 'colonize_planet':
      return (progress.colonistsDeposited || 0) >= (objectives.colonistsToDeposit || 0);
    case 'trade_units':
      return (progress.unitsTraded || 0) >= (objectives.unitsToTrade || 0);
    case 'scan_sectors':
      return (progress.scansCompleted || 0) >= (objectives.scansRequired || 0);
    case 'deliver_cargo':
      return (progress.cargoDelivered || 0) >= (objectives.quantity || 0);
    default:
      return false;
  }
}

export function isMissionExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

export async function generateMissionPool(playerSectorId: number): Promise<any[]> {
  // Get random mission templates suitable for the player
  const templates = await db('mission_templates')
    .orderByRaw('RANDOM()')
    .limit(GAME_CONFIG.MISSION_POOL_SIZE);

  return templates.map((t: any) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    type: t.type,
    difficulty: t.difficulty,
    objectives: typeof t.objectives === 'string' ? JSON.parse(t.objectives) : t.objectives,
    rewardCredits: t.reward_credits,
    rewardItemId: t.reward_item_id,
    timeLimitMinutes: t.time_limit_minutes,
    repeatable: !!t.repeatable,
  }));
}
