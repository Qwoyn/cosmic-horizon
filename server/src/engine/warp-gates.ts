import db from '../db/connection';
import { GAME_CONFIG } from '../config/game';

export async function canBuildGate(
  playerId: string,
  syndicateId: string,
  sectorAId: number,
  sectorBId: number
): Promise<{ allowed: boolean; reason?: string }> {
  // Check syndicate gate limit
  const gateCount = await db('warp_gates')
    .where({ syndicate_id: syndicateId, status: 'active' })
    .count('* as count')
    .first();

  if (Number(gateCount?.count || 0) >= GAME_CONFIG.WARP_GATE_MAX_PER_SYNDICATE) {
    return { allowed: false, reason: `Syndicate limit of ${GAME_CONFIG.WARP_GATE_MAX_PER_SYNDICATE} gates reached` };
  }

  // Check no existing gate between same sectors
  const existing = await db('warp_gates')
    .where({ status: 'active' })
    .where(function() {
      this.where({ sector_a_id: sectorAId, sector_b_id: sectorBId })
        .orWhere({ sector_a_id: sectorBId, sector_b_id: sectorAId });
    })
    .first();

  if (existing) {
    return { allowed: false, reason: 'A warp gate already exists between these sectors' };
  }

  // Both sectors must exist
  const sectorA = await db('sectors').where({ id: sectorAId }).first();
  const sectorB = await db('sectors').where({ id: sectorBId }).first();
  if (!sectorA || !sectorB) {
    return { allowed: false, reason: 'One or both sectors do not exist' };
  }

  return { allowed: true };
}

export function calculateToll(
  baseToll: number,
  isSyndicateMember: boolean,
  syndicateFree: boolean
): number {
  if (isSyndicateMember && syndicateFree) return 0;
  return baseToll;
}
