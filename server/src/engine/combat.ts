import { GAME_CONFIG } from '../config/game';

export interface CombatState {
  weaponEnergy: number;
  engineEnergy: number;
  hullHp: number;
  attackRatio: number;
  defenseRatio: number;
}

export interface CombatVolleyResult {
  damageDealt: number;
  attackerEnergySpent: number;
  defenderWeaponEnergyRemaining: number;
  defenderEngineEnergyRemaining: number;
  defenderHullHpRemaining: number;
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
      defenderHullHpRemaining: defender.hullHp,
      defenderDestroyed: false,
    };
  }

  const rawDamage = calculateDamage(actualExpend, attacker.attackRatio, defender.defenseRatio);

  // Damage applies to hull HP directly
  const actualDamage = Math.min(rawDamage, defender.hullHp);

  // If overkill, attacker only spends proportional energy
  let attackerEnergySpent: number;
  if (rawDamage > defender.hullHp && actualExpend > 0) {
    attackerEnergySpent = Math.max(1, Math.ceil((defender.hullHp / rawDamage) * actualExpend));
  } else {
    attackerEnergySpent = actualExpend;
  }

  const hullRemaining = Math.max(0, defender.hullHp - actualDamage);
  const destroyed = hullRemaining === 0;

  return {
    damageDealt: actualDamage,
    attackerEnergySpent,
    defenderWeaponEnergyRemaining: defender.weaponEnergy,
    defenderEngineEnergyRemaining: defender.engineEnergy,
    defenderHullHpRemaining: hullRemaining,
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
