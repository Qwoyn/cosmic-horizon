import { GAME_CONFIG } from '../config/game';

export interface DecayInput {
  colonists: number;
  hoursInactive: number;
  inactiveThresholdHours: number;
}

export interface DecayResult {
  newColonists: number;
  decayed: boolean;
}

export function processDecay(input: DecayInput): DecayResult {
  if (input.hoursInactive < input.inactiveThresholdHours) {
    return { newColonists: input.colonists, decayed: false };
  }

  const daysInactive = (input.hoursInactive - input.inactiveThresholdHours) / 24;
  const decayFactor = 1 - (GAME_CONFIG.DECAY_COLONIST_RATE * Math.min(daysInactive, 1));
  const newColonists = Math.max(0, Math.floor(input.colonists * decayFactor));

  return {
    newColonists,
    decayed: newColonists < input.colonists,
  };
}

export function processDefenseDecay(
  currentEnergy: number,
  maxEnergy: number
): number {
  const drain = Math.ceil(maxEnergy * GAME_CONFIG.DECAY_DEFENSE_DRAIN_RATE);
  return Math.max(0, currentEnergy - drain);
}

export function isDeployableExpired(
  deployedAt: Date,
  lastMaintainedAt: Date,
  now: Date = new Date()
): boolean {
  const lifetimeMs = GAME_CONFIG.DEPLOYABLE_LIFETIME_DAYS * 24 * 60 * 60 * 1000;
  return now.getTime() - lastMaintainedAt.getTime() > lifetimeMs;
}
