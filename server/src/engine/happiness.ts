import { GAME_CONFIG } from '../config/game';
import { RACES, type RaceId } from '../config/races';

export interface HappinessInput {
  foodStock: number;
  colonists: number;
  idealPopulation: number;
  upgradeLevel: number;
  droneCount: number;
  foodConsumptionRate: number;
  avgRaceAffinity: number;
}

export interface HappinessTier {
  name: string;
  productionMultiplier: number;
}

export interface RacePopulation {
  race: string;
  count: number;
}

/**
 * Calculate new happiness value based on current state.
 * Lerps 10% toward target per tick for smooth transitions.
 */
export function calculateHappiness(currentHappiness: number, input: HappinessInput): number {
  const { foodStock, colonists, idealPopulation, upgradeLevel, droneCount, foodConsumptionRate, avgRaceAffinity } = input;

  if (colonists <= 0) return 50; // no colonists = neutral

  // Calculate food supply score (weight 0.40)
  const consumptionPerTick = foodConsumptionRate * (colonists / 10);
  const ticksOfFood = consumptionPerTick > 0 ? foodStock / consumptionPerTick : 999;
  const foodScore = Math.min(ticksOfFood / GAME_CONFIG.FOOD_HAPPINESS_FULL_THRESHOLD, 1) * 100;

  // Overcrowding score (weight 0.25)
  let overcrowdingScore = 100;
  if (colonists > idealPopulation) {
    const ratio = colonists / idealPopulation;
    overcrowdingScore = Math.max(0, 100 * (1 - (ratio - 1))); // linearly drops to 0 at 2x ideal
  }

  // Infrastructure score (weight 0.20)
  const infrastructureScore = (upgradeLevel / 7) * 100;

  // Security score (weight 0.10)
  const securityScore = Math.min(droneCount / 50, 1) * 100;

  // Race affinity score (weight 0.05)
  const affinityScore = Math.min(Math.max((avgRaceAffinity - 0.5) * 200, 0), 100); // map 0.5-1.0 to 0-100

  // Weighted target
  const targetHappiness = Math.min(100, Math.max(0,
    foodScore * 0.40 +
    overcrowdingScore * 0.25 +
    infrastructureScore * 0.20 +
    securityScore * 0.10 +
    affinityScore * 0.05
  ));

  // Apply food starvation penalty directly
  let adjusted = currentHappiness;
  if (foodStock <= 0 && consumptionPerTick > 0) {
    adjusted = Math.max(0, adjusted - GAME_CONFIG.FOOD_HAPPINESS_PENALTY);
  }

  // Lerp 10% toward target per tick (smooth transitions)
  const newHappiness = adjusted + (targetHappiness - adjusted) * 0.10;

  return Math.min(100, Math.max(0, Math.round(newHappiness * 100) / 100));
}

/**
 * Get happiness tier name and production multiplier.
 */
export function getHappinessTier(happiness: number): HappinessTier {
  const tiers = GAME_CONFIG.HAPPINESS_TIERS;
  if (happiness <= tiers.miserable.max) return { name: 'miserable', productionMultiplier: tiers.miserable.productionMultiplier };
  if (happiness <= tiers.unhappy.max) return { name: 'unhappy', productionMultiplier: tiers.unhappy.productionMultiplier };
  if (happiness <= tiers.content.max) return { name: 'content', productionMultiplier: tiers.content.productionMultiplier };
  if (happiness <= tiers.happy.max) return { name: 'happy', productionMultiplier: tiers.happy.productionMultiplier };
  return { name: 'thriving', productionMultiplier: tiers.thriving.productionMultiplier };
}

/**
 * Calculate weighted average race affinity for a planet class.
 */
export function calculateAverageAffinity(racePopulations: RacePopulation[], planetClass: string): number {
  if (racePopulations.length === 0) return 1.0;

  let totalPop = 0;
  let weightedAffinity = 0;

  for (const rp of racePopulations) {
    if (rp.count <= 0) continue;
    totalPop += rp.count;
    const raceConfig = RACES[rp.race as RaceId];
    const affinity = raceConfig?.planetAffinities?.[planetClass] ?? 1.0;
    weightedAffinity += affinity * rp.count;
  }

  if (totalPop === 0) return 1.0;
  return weightedAffinity / totalPop;
}
