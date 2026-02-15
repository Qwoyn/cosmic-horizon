import { GAME_CONFIG } from '../config/game';

export interface CombatState {
  weaponEnergy: number;
  engineEnergy: number;
  attackRatio: number;
  defenseRatio: number;
}

export interface CombatVolleyResult {
  damageDealt: number;
  attackerEnergySpent: number;
  defenderWeaponEnergyRemaining: number;
  defenderEngineEnergyRemaining: number;
  defenderDestroyed: boolean;
}

export interface FleeResult {
  success: boolean;
  fleeChance: number;
}

export function calculateDamage(
  energyExpended: number,
  attackRatio: number,
  defenseRatio: number
): number {
  const effectiveRatio = attackRatio / defenseRatio;
  return Math.max(1, Math.round(energyExpended * effectiveRatio));
}

export function resolveCombatVolley(
  attacker: CombatState,
  defender: CombatState,
  energyToExpend: number
): CombatVolleyResult {
  const actualExpend = Math.min(energyToExpend, attacker.weaponEnergy);

  if (actualExpend === 0) {
    return {
      damageDealt: 0,
      attackerEnergySpent: 0,
      defenderWeaponEnergyRemaining: defender.weaponEnergy,
      defenderEngineEnergyRemaining: defender.engineEnergy,
      defenderDestroyed: false,
    };
  }

  const rawDamage = calculateDamage(actualExpend, attacker.attackRatio, defender.defenseRatio);

  // Damage first depletes weapon energy, then engine energy
  const totalDefenderHP = defender.weaponEnergy + defender.engineEnergy;
  const actualDamage = Math.min(rawDamage, totalDefenderHP);

  // Calculate how much attacker actually needed to spend
  // If overkill, attacker only spends proportional energy
  let attackerEnergySpent: number;
  if (rawDamage > totalDefenderHP && actualExpend > 0) {
    attackerEnergySpent = Math.max(1, Math.ceil((totalDefenderHP / rawDamage) * actualExpend));
  } else {
    attackerEnergySpent = actualExpend;
  }

  let remainingDamage = actualDamage;
  let defWeapon = defender.weaponEnergy;
  let defEngine = defender.engineEnergy;

  // Shields absorb from weapons first
  if (remainingDamage <= defWeapon) {
    defWeapon -= remainingDamage;
    remainingDamage = 0;
  } else {
    remainingDamage -= defWeapon;
    defWeapon = 0;
    defEngine = Math.max(0, defEngine - remainingDamage);
  }

  const destroyed = defWeapon === 0 && defEngine === 0;

  return {
    damageDealt: actualDamage,
    attackerEnergySpent,
    defenderWeaponEnergyRemaining: defWeapon,
    defenderEngineEnergyRemaining: defEngine,
    defenderDestroyed: destroyed,
  };
}

export function attemptFlee(
  numAttackers: number,
  rngValue: number // 0-1, pass in for testability
): FleeResult {
  const fleeChance = Math.min(
    0.9,
    GAME_CONFIG.MIN_FLEE_CHANCE + (numAttackers - 1) * GAME_CONFIG.MULTI_SHIP_FLEE_BONUS
  );
  return {
    success: rngValue < fleeChance,
    fleeChance,
  };
}
