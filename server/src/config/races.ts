/**
 * Race configuration for Cosmic Horizon.
 *
 * Each race has permanent traits (attack, defense, scan, trade bonuses)
 * and fading starting bonuses that expire after 72 hours.
 */

export type RaceId = 'muscarian' | 'vedic' | 'kalin' | 'tarri';

export interface RaceConfig {
  id: RaceId;
  name: string;
  description: string;
  starterShipType: string;

  // Permanent traits
  attackRatioBonus: number;
  defenseRatioBonus: number;
  scanRangeBonus: number;
  tradeBonus: number;

  // Starting bonuses (fade after 72 hours)
  startingCreditsBonus: number;
  startingMaxEnergyBonus: number;
  starterWeaponBonus: number;
  starterEngineBonus: number;
}

export const RACES: Record<RaceId, RaceConfig> = {
  muscarian: {
    id: 'muscarian',
    name: 'Muscarian',
    description:
      'Aggressive fungi-based lifeforms whose spore-laced neural networks grant them lightning reflexes in combat. Their mycelial trade networks span entire sectors, bankrolling new pilots with seed capital.',
    starterShipType: 'corvette',
    attackRatioBonus: 0.05,
    defenseRatioBonus: 0,
    scanRangeBonus: 0,
    tradeBonus: 0,
    startingCreditsBonus: 2000,
    startingMaxEnergyBonus: 0,
    starterWeaponBonus: 0,
    starterEngineBonus: 0,
  },
  vedic: {
    id: 'vedic',
    name: 'Vedic',
    description:
      'Ancient seekers who channel psionic resonance to perceive distant star systems. Their meditative focus extends sensor arrays far beyond normal range, and their inner reserves of energy are unmatched.',
    starterShipType: 'cruiser',
    attackRatioBonus: 0,
    defenseRatioBonus: 0,
    scanRangeBonus: 0.10,
    tradeBonus: 0,
    startingCreditsBonus: 0,
    startingMaxEnergyBonus: 100,
    starterWeaponBonus: 0,
    starterEngineBonus: 0,
  },
  kalin: {
    id: 'kalin',
    name: 'Kalin',
    description:
      'Silicon-armored warriors forged in the crushing gravity of super-dense worlds. Their innate understanding of structural engineering makes their ships nearly impervious, and they outfit every vessel with superior hardware.',
    starterShipType: 'battleship',
    attackRatioBonus: 0,
    defenseRatioBonus: 0.05,
    scanRangeBonus: 0,
    tradeBonus: 0,
    startingCreditsBonus: 0,
    startingMaxEnergyBonus: 0,
    starterWeaponBonus: 10,
    starterEngineBonus: 10,
  },
  tarri: {
    id: 'tarri',
    name: "Tar'ri",
    description:
      'Nomadic merchants who navigate the void in massive caravan fleets. Generations of barter and negotiation have given them an instinct for profit that no other species can rival.',
    starterShipType: 'freighter',
    attackRatioBonus: 0,
    defenseRatioBonus: 0,
    scanRangeBonus: 0,
    tradeBonus: 0.05,
    startingCreditsBonus: 5000,
    startingMaxEnergyBonus: 0,
    starterWeaponBonus: 0,
    starterEngineBonus: 0,
  },
};

export const VALID_RACE_IDS: RaceId[] = Object.keys(RACES) as RaceId[];

export function getRace(id: RaceId): RaceConfig {
  const race = RACES[id];
  if (!race) {
    throw new Error(`Unknown race id: ${id}`);
  }
  return race;
}
