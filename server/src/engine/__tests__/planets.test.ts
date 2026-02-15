import { calculateProduction, canUpgrade, calculateColonistGrowth } from '../planets';
import { processDecay, processDefenseDecay, isDeployableExpired } from '../decay';
import { PLANET_TYPES } from '../../config/planet-types';

describe('Planet Production', () => {
  test('production scales with colonist count', () => {
    const prod1 = calculateProduction('H', 1000);
    const prod2 = calculateProduction('H', 5000);
    expect(prod2.food).toBeGreaterThan(prod1.food);
  });

  test('production drops when over ideal population', () => {
    const ideal = PLANET_TYPES.H.idealPopulation;
    const atIdeal = calculateProduction('H', ideal);
    const overIdeal = calculateProduction('H', ideal * 2);
    expect(overIdeal.food).toBeLessThan(atIdeal.food);
  });

  test('desert planet produces more cyrillium than food', () => {
    const prod = calculateProduction('D', 5000);
    expect(prod.cyrillium).toBeGreaterThan(prod.food);
  });

  test('volcanic planet produces no food', () => {
    const prod = calculateProduction('V', 5000);
    expect(prod.food).toBe(0);
  });

  test('unknown planet class returns zero production', () => {
    const prod = calculateProduction('Z', 5000);
    expect(prod.cyrillium).toBe(0);
    expect(prod.food).toBe(0);
    expect(prod.tech).toBe(0);
    expect(prod.drones).toBe(0);
  });

  test('canUpgrade checks requirements correctly', () => {
    const planet = {
      upgradeLevel: 0,
      colonists: 2000,
      cyrilliumStock: 200,
      foodStock: 300,
      techStock: 200,
      ownerCredits: 10000,
    };
    expect(canUpgrade(planet)).toBe(true);

    const weakPlanet = {
      upgradeLevel: 0,
      colonists: 100, // too few
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

  test('colonist growth depends on food supply', () => {
    const withFood = calculateColonistGrowth('H', 10000, true);
    const withoutFood = calculateColonistGrowth('H', 10000, false);
    expect(withFood).toBeGreaterThan(withoutFood);
    expect(withoutFood).toBe(10000); // no growth without food
  });

  test('colonist growth uses planet type growth rate', () => {
    const hospitable = calculateColonistGrowth('H', 10000, true);
    const gaseous = calculateColonistGrowth('G', 10000, true);
    // H has higher growth rate than G
    expect(hospitable).toBeGreaterThan(gaseous);
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
