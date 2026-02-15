import { GAME_CONFIG } from '../config/game';

export interface DeployableState {
  type: string;
  powerLevel: number;
  health: number;
  ownerId: string;
}

export interface MineDetonationResult {
  triggered: boolean;
  damageDealt: number;
  mineDestroyed: boolean;
  type: string;
}

export interface DroneInteractionResult {
  attacked: boolean;
  damageDealt: number;
  droneDestroyed: boolean;
  tollCharged?: number;
}

/**
 * Calculate mine detonation damage when a ship enters a sector.
 * Halberd mines deal direct damage. Barnacle mines attach and drain.
 */
export function detonateMine(mine: DeployableState): MineDetonationResult {
  if (mine.type === 'mine_halberd') {
    const baseDamage = 20 * mine.powerLevel;
    return {
      triggered: true,
      damageDealt: baseDamage,
      mineDestroyed: true,
      type: 'mine_halberd',
    };
  }

  if (mine.type === 'mine_barnacle') {
    // Barnacle mines drain engine energy over time; initial attach damage is lower
    const baseDamage = 5 * mine.powerLevel;
    return {
      triggered: true,
      damageDealt: baseDamage,
      mineDestroyed: false, // barnacles persist attached to ship
      type: 'mine_barnacle',
    };
  }

  return { triggered: false, damageDealt: 0, mineDestroyed: false, type: mine.type };
}

/**
 * Resolve drone interaction when a non-allied ship enters a sector with drones.
 */
export function resolveDroneInteraction(
  drone: DeployableState,
  tollAmount: number | null,
): DroneInteractionResult {
  if (drone.type === 'drone_offensive') {
    const damage = 10 * drone.powerLevel;
    return {
      attacked: true,
      damageDealt: damage,
      droneDestroyed: false,
    };
  }

  if (drone.type === 'drone_toll') {
    return {
      attacked: false,
      damageDealt: 0,
      droneDestroyed: false,
      tollCharged: tollAmount ?? 100,
    };
  }

  // Defensive drones don't attack on entry, they boost defense for allies
  return { attacked: false, damageDealt: 0, droneDestroyed: false };
}

/**
 * Calculate Rache device detonation damage.
 * Deals percentage-based damage to all ships in sector.
 */
export function calculateRacheDamage(weaponEnergy: number): number {
  return Math.floor(weaponEnergy * GAME_CONFIG.RACHE_DAMAGE_MULTIPLIER);
}

/**
 * Check if a deployable has expired based on its deployment date.
 */
export function isDeployableExpired(deployedAt: Date, lifetimeDays: number = GAME_CONFIG.DEPLOYABLE_LIFETIME_DAYS): boolean {
  const expiresAt = new Date(deployedAt.getTime() + lifetimeDays * 24 * 60 * 60 * 1000);
  return new Date() > expiresAt;
}

/**
 * Apply barnacle mine drain effect per tick.
 * Returns engine energy to drain.
 */
export function calculateBarnacleEngineDrain(powerLevel: number): number {
  return 2 * powerLevel;
}
