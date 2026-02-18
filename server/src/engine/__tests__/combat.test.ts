import { calculateDamage, resolveCombatVolley, CombatState, attemptFlee } from '../combat';

describe('Combat Engine', () => {
  describe('calculateDamage', () => {
    test('damage scales with energy and attack ratio', () => {
      const damage1 = calculateDamage(50, 1.0, 1.0);
      const damage2 = calculateDamage(50, 2.0, 1.0);
      expect(damage2).toBeGreaterThan(damage1);
    });

    test('defense ratio reduces damage', () => {
      const damage1 = calculateDamage(50, 1.0, 1.0);
      const damage2 = calculateDamage(50, 1.0, 2.0);
      expect(damage2).toBeLessThan(damage1);
    });

    test('damage is always at least 1', () => {
      expect(calculateDamage(1, 0.3, 2.0)).toBeGreaterThanOrEqual(1);
    });

    test('equal ratios means damage equals energy', () => {
      expect(calculateDamage(50, 1.0, 1.0)).toBe(50);
    });
  });

  describe('resolveCombatVolley', () => {
    test('attacker only expends energy equal to defender hull when overkill', () => {
      const attacker: CombatState = { weaponEnergy: 100, engineEnergy: 50, hullHp: 100, attackRatio: 2.0, defenseRatio: 1.0 };
      const defender: CombatState = { weaponEnergy: 10, engineEnergy: 50, hullHp: 5, attackRatio: 1.0, defenseRatio: 1.0 };
      const result = resolveCombatVolley(attacker, defender, 100);
      expect(result.attackerEnergySpent).toBeLessThan(100);
      expect(result.defenderDestroyed).toBe(true);
      expect(result.defenderHullHpRemaining).toBe(0);
    });

    test('damage hits hull directly, weapon/engine energy unchanged', () => {
      const attacker: CombatState = { weaponEnergy: 50, engineEnergy: 50, hullHp: 100, attackRatio: 1.0, defenseRatio: 1.0 };
      const defender: CombatState = { weaponEnergy: 30, engineEnergy: 50, hullHp: 100, attackRatio: 1.0, defenseRatio: 1.0 };
      const result = resolveCombatVolley(attacker, defender, 40);
      // Weapon and engine energy should remain unchanged
      expect(result.defenderWeaponEnergyRemaining).toBe(30);
      expect(result.defenderEngineEnergyRemaining).toBe(50);
      // Hull should take the damage
      expect(result.defenderHullHpRemaining).toBe(60);
      expect(result.damageDealt).toBe(40);
      expect(result.defenderDestroyed).toBe(false);
    });

    test('defender destroyed when hull reaches 0', () => {
      const attacker: CombatState = { weaponEnergy: 200, engineEnergy: 50, hullHp: 100, attackRatio: 2.0, defenseRatio: 1.0 };
      const defender: CombatState = { weaponEnergy: 20, engineEnergy: 10, hullHp: 30, attackRatio: 1.0, defenseRatio: 1.0 };
      const result = resolveCombatVolley(attacker, defender, 50);
      expect(result.defenderDestroyed).toBe(true);
      expect(result.defenderHullHpRemaining).toBe(0);
      // Weapon/engine should remain unchanged even on destruction
      expect(result.defenderWeaponEnergyRemaining).toBe(20);
      expect(result.defenderEngineEnergyRemaining).toBe(10);
    });

    test('energy spent capped by attacker weapon energy', () => {
      const attacker: CombatState = { weaponEnergy: 20, engineEnergy: 50, hullHp: 100, attackRatio: 1.0, defenseRatio: 1.0 };
      const defender: CombatState = { weaponEnergy: 100, engineEnergy: 100, hullHp: 200, attackRatio: 1.0, defenseRatio: 1.0 };
      const result = resolveCombatVolley(attacker, defender, 50);
      expect(result.attackerEnergySpent).toBe(20);
      expect(result.damageDealt).toBe(20);
    });

    test('no damage when attacker has 0 weapon energy', () => {
      const attacker: CombatState = { weaponEnergy: 0, engineEnergy: 50, hullHp: 100, attackRatio: 1.0, defenseRatio: 1.0 };
      const defender: CombatState = { weaponEnergy: 50, engineEnergy: 50, hullHp: 100, attackRatio: 1.0, defenseRatio: 1.0 };
      const result = resolveCombatVolley(attacker, defender, 50);
      expect(result.damageDealt).toBe(0);
      expect(result.attackerEnergySpent).toBe(0);
      expect(result.defenderHullHpRemaining).toBe(100);
    });

    test('weapon and engine energy are never changed by incoming damage', () => {
      const attacker: CombatState = { weaponEnergy: 100, engineEnergy: 50, hullHp: 200, attackRatio: 1.5, defenseRatio: 1.0 };
      const defender: CombatState = { weaponEnergy: 75, engineEnergy: 80, hullHp: 50, attackRatio: 1.0, defenseRatio: 0.8 };
      const result = resolveCombatVolley(attacker, defender, 80);
      // Regardless of damage, weapon and engine stay the same
      expect(result.defenderWeaponEnergyRemaining).toBe(75);
      expect(result.defenderEngineEnergyRemaining).toBe(80);
    });
  });

  describe('attemptFlee', () => {
    test('flee chance increases with more attackers', () => {
      const base = attemptFlee(1, 0.5);
      const multi = attemptFlee(3, 0.5);
      expect(multi.fleeChance).toBeGreaterThan(base.fleeChance);
    });

    test('flee succeeds when rng is below flee chance', () => {
      const result = attemptFlee(1, 0.01);
      expect(result.success).toBe(true);
    });

    test('flee fails when rng is above flee chance', () => {
      const result = attemptFlee(1, 0.99);
      expect(result.success).toBe(false);
    });

    test('flee chance is capped at 0.9', () => {
      const result = attemptFlee(100, 0.5);
      expect(result.fleeChance).toBeLessThanOrEqual(0.9);
    });
  });
});
