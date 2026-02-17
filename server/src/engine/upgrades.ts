import db from '../db/connection';
import { GAME_CONFIG } from '../config/game';

export function calculateEffectiveBonus(baseStat: number, stackPosition: number): number {
  // Each subsequent upgrade in the same slot has diminishing returns
  const factor = Math.pow(GAME_CONFIG.UPGRADE_DIMINISHING_BASE, stackPosition);
  return Math.floor(baseStat * factor);
}

export async function applyUpgradesToShip(shipId: string): Promise<{
  weaponBonus: number;
  engineBonus: number;
  cargoBonus: number;
  shieldBonus: number;
}> {
  const upgrades = await db('ship_upgrades')
    .join('upgrade_types', 'ship_upgrades.upgrade_type_id', 'upgrade_types.id')
    .where({ 'ship_upgrades.ship_id': shipId })
    .select('upgrade_types.slot', 'ship_upgrades.effective_bonus');

  const bonuses = { weaponBonus: 0, engineBonus: 0, cargoBonus: 0, shieldBonus: 0 };

  for (const u of upgrades) {
    switch (u.slot) {
      case 'weapon': bonuses.weaponBonus += u.effective_bonus; break;
      case 'engine': bonuses.engineBonus += u.effective_bonus; break;
      case 'cargo': bonuses.cargoBonus += u.effective_bonus; break;
      case 'shield': bonuses.shieldBonus += u.effective_bonus; break;
    }
  }

  return bonuses;
}

export async function canInstallUpgrade(
  shipId: string,
  upgradeTypeId: string
): Promise<{ allowed: boolean; reason?: string }> {
  const upgradeType = await db('upgrade_types').where({ id: upgradeTypeId }).first();
  if (!upgradeType) return { allowed: false, reason: 'Upgrade type not found' };

  // Check total upgrades on ship
  const totalCount = await db('ship_upgrades')
    .where({ ship_id: shipId })
    .count('* as count')
    .first();

  if (Number(totalCount?.count || 0) >= GAME_CONFIG.MAX_UPGRADES_PER_SHIP) {
    return { allowed: false, reason: `Maximum ${GAME_CONFIG.MAX_UPGRADES_PER_SHIP} upgrades per ship` };
  }

  // Check same-type stack limit
  const sameTypeCount = await db('ship_upgrades')
    .where({ ship_id: shipId, upgrade_type_id: upgradeTypeId })
    .count('* as count')
    .first();

  if (Number(sameTypeCount?.count || 0) >= upgradeType.max_stack) {
    return { allowed: false, reason: `Maximum ${upgradeType.max_stack} of this upgrade type` };
  }

  // Check ship type compatibility
  if (upgradeType.compatible_ship_types) {
    const ship = await db('ships').where({ id: shipId }).first();
    const compatible = typeof upgradeType.compatible_ship_types === 'string'
      ? JSON.parse(upgradeType.compatible_ship_types)
      : upgradeType.compatible_ship_types;
    if (compatible && !compatible.includes(ship?.ship_type_id)) {
      return { allowed: false, reason: 'Not compatible with this ship type' };
    }
  }

  return { allowed: true };
}
