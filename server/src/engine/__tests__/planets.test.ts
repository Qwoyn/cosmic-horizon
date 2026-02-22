import { calculateProduction, calculateProductionLegacy, canUpgrade, calculateColonistGrowth } from '../planets';
import { processDecay, processDefenseDecay, isDeployableExpired } from '../decay';
import { PLANET_TYPES } from '../../config/planet-types';

describe('Planet Production', () => {
  test('production scales with colonist count', () => {
    const prod1 = calculateProduction('H', [{ race: 'muscarian', count: 100 }], 50);
    const prod2 = calculateProduction('H', [{ race: 'muscarian', count: 500 }], 50);
    expect(prod2.cyrillium).toBeGreaterThan(prod1.cyrillium);
  });

  test('production drops when over ideal population', () => {
    const ideal = PLANET_TYPES.H.idealPopulation;
    const atIdeal = calculateProduction('H', [{ race: 'muscarian', count: ideal }], 50);
    const overIdeal = calculateProduction('H', [{ race: 'muscarian', count: ideal * 2 }], 50);
    expect(overIdeal.cyrillium).toBeLessThan(atIdeal.cyrillium);
  });

  test('desert planet produces more cyrillium than tech', () => {
    const prod = calculateProduction('D', [{ race: 'muscarian', count: 500 }], 50);
    expect(prod.cyrillium).toBeGreaterThan(prod.tech);
  });

  test('unknown planet class returns zero production', () => {
    const prod = calculateProduction('Z', [{ race: 'muscarian', count: 500 }], 50);
    expect(prod.cyrillium).toBe(0);
    expect(prod.tech).toBe(0);
    expect(prod.drones).toBe(0);
  });

  test('happiness affects production multiplier', () => {
    const happy = calculateProduction('H', [{ race: 'muscarian', count: 500 }], 90);
    const miserable = calculateProduction('H', [{ race: 'muscarian', count: 500 }], 10);
    expect(happy.cyrillium).toBeGreaterThan(miserable.cyrillium);
  });

  test('legacy production wrapper works', () => {
    const prod = calculateProductionLegacy('H', 500, 50);
    expect(prod.cyrillium).toBeGreaterThan(0);
  });

  test('canUpgrade checks requirements correctly', () => {
    const planet = {
      upgradeLevel: 0,
      colonists: 200,
      cyrilliumStock: 200,
      foodStock: 300,
      techStock: 200,
      ownerCredits: 10000,
    };
    expect(canUpgrade(planet)).toBe(true);

    const weakPlanet = {
      upgradeLevel: 0,
      colonists: 10, // too few (need 50)
      cyrilliumStock: 200,
      foodStock: 300,
      techStock: 200,
      ownerCredits: 10000,
    };
    expect(canUpgrade(weakPlanet)).toBe(false);
  });

  test('canUpgrade returns false at max level', () => {
    const planet = {
      upgradeLevel: 7,
      colonists: 999999,
      cyrilliumStock: 999999,
      foodStock: 999999,
      techStock: 999999,
      ownerCredits: 999999,
    };
    expect(canUpgrade(planet)).toBe(false);
  });

  test('colonist growth consumes food on normal planets', () => {
    const result = calculateColonistGrowth('H', 500, 70, 100, 0);
    expect(result.foodConsumed).toBeGreaterThan(0);
    expect(result.foodProduced).toBeGreaterThan(0);
    expect(result.newColonists).toBeGreaterThan(500); // growing
  });

  test('colonist growth with food production but low happiness stagnates', () => {
    // With 0 external food but food production > 0, colonists survive but don't grow
    const result = calculateColonistGrowth('H', 500, 5, 0, 0);
    // Food production keeps them alive, but happiness is too low for growth (< 40)
    expect(result.newColonists).toBe(500); // stagnation, not decline
    expect(result.foodProduced).toBeGreaterThan(0);
  });

  test('seed planets grow without food', () => {
    const result = calculateColonistGrowth('S', 500, 50, 0, 0);
    expect(result.newColonists).toBeGreaterThan(500);
    expect(result.foodConsumed).toBe(0);
    expect(result.foodProduced).toBe(0);
  });

  test('food production is roughly 30% of consumption', () => {
    const result = calculateColonistGrowth('H', 500, 50, 1000, 0);
    // H planet: foodConsumptionRate=3, foodProductionRate=1 (~33%)
    expect(result.foodProduced).toBeGreaterThan(0);
    expect(result.foodProduced).toBeLessThan(result.foodConsumed);
  });
});

describe('Decay System', () => {
  test('inactive player planets lose colonists', () => {
    const result = processDecay({
      colonists: 10000,
      hoursInactive: 72,
      inactiveThresholdHours: 48,
    });
    expect(result.newColonists).toBeLessThan(10000);
    expect(result.decayed).toBe(true);
  });

  test('active player planets dont decay', () => {
    const result = processDecay({
      colonists: 10000,
      hoursInactive: 24,
      inactiveThresholdHours: 48,
    });
    expect(result.newColonists).toBe(10000);
    expect(result.decayed).toBe(false);
  });

  test('colonists never go below 0', () => {
    const result = processDecay({
      colonists: 1,
      hoursInactive: 9999,
      inactiveThresholdHours: 48,
    });
    expect(result.newColonists).toBeGreaterThanOrEqual(0);
  });

  test('defense energy drains over time', () => {
    const newEnergy = processDefenseDecay(100, 200);
    expect(newEnergy).toBeLessThan(100);
    expect(newEnergy).toBeGreaterThanOrEqual(0);
  });

  test('defense energy never goes below 0', () => {
    const newEnergy = processDefenseDecay(1, 200);
    expect(newEnergy).toBe(0);
  });

  test('deployable expires after lifetime', () => {
    const deployed = new Date('2026-01-01');
    const maintained = new Date('2026-01-01');
    const now = new Date('2026-01-15'); // 14 days later, lifetime is 7
    expect(isDeployableExpired(deployed, maintained, now)).toBe(true);
  });

  test('deployable not expired within lifetime', () => {
    const deployed = new Date('2026-01-01');
    const maintained = new Date('2026-01-10');
    const now = new Date('2026-01-12'); // 2 days since maintenance, lifetime is 7
    expect(isDeployableExpired(deployed, maintained, now)).toBe(false);
  });
});
