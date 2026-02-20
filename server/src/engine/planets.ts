import { PLANET_TYPES, UPGRADE_REQUIREMENTS } from '../config/planet-types';

export interface ProductionResult {
  cyrillium: number;
  food: number;
  tech: number;
  drones: number;
}

export function calculateProduction(
  planetClass: string,
  colonists: number
): ProductionResult {
  const config = PLANET_TYPES[planetClass];
  if (!config) return { cyrillium: 0, food: 0, tech: 0, drones: 0 };

  // Efficiency drops when over ideal population
  // Uses squared dropoff so total production actually decreases past ideal
  let efficiency = 1.0;
  if (colonists > config.idealPopulation) {
    const overRatio = colonists / config.idealPopulation;
    efficiency = 1.0 / (overRatio * overRatio);
  }

  const units = colonists / 1000;
  return {
    cyrillium: Math.floor(config.productionRates.cyrillium * units * efficiency),
    food: Math.floor(config.productionRates.food * units * efficiency),
    tech: Math.floor(config.productionRates.tech * units * efficiency),
    drones: Math.floor(config.productionRates.drones * units * efficiency * 100) / 100,
  };
}

export interface UpgradeCheck {
  upgradeLevel: number;
  colonists: number;
  cyrilliumStock: number;
  foodStock: number;
  techStock: number;
  ownerCredits: number;
}

export function canUpgrade(planet: UpgradeCheck): boolean {
  const nextLevel = planet.upgradeLevel + 1;
  const req = UPGRADE_REQUIREMENTS[nextLevel];
  if (!req) return false; // already max level

  return (
    planet.colonists >= req.colonists &&
    planet.cyrilliumStock >= req.cyrillium &&
    planet.foodStock >= req.food &&
    planet.techStock >= req.tech &&
    planet.ownerCredits >= req.credits
  );
}

export function calculateProductionWithFactoryBonus(
  planetClass: string,
  colonists: number,
  isFactory: boolean,
): ProductionResult {
  const base = calculateProduction(planetClass, colonists);
  if (!isFactory) return base;
  const bonus = 0.50; // SYNDICATE_FACTORY_PRODUCTION_BONUS — inline to avoid circular import
  return {
    cyrillium: Math.floor(base.cyrillium * (1 + bonus)),
    food: Math.floor(base.food * (1 + bonus)),
    tech: Math.floor(base.tech * (1 + bonus)),
    drones: Math.floor(base.drones * (1 + bonus) * 100) / 100,
  };
}

export function calculateColonistGrowth(
  planetClass: string,
  currentColonists: number,
  hasFoodSupply: boolean
): number {
  const config = PLANET_TYPES[planetClass];
  if (!config || !hasFoodSupply) return currentColonists;

  const growthRate = config.colonistGrowthRate;
  const growth = Math.floor(currentColonists * growthRate);
  return currentColonists + growth;
}
