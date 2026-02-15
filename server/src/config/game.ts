export const GAME_CONFIG = {
  // Energy / Action Points
  MAX_ENERGY: 500,
  ENERGY_REGEN_RATE: 1, // per minute
  ENERGY_REGEN_BONUS_MULTIPLIER: 2, // for new players
  ENERGY_REGEN_BONUS_DURATION_HOURS: 72,

  // AP costs
  AP_COST_MOVE: 1,
  AP_COST_TRADE: 1,
  AP_COST_COMBAT_VOLLEY: 2,
  AP_COST_DEPLOY: 1,

  // Universe
  TOTAL_SECTORS: 5000,
  SECTORS_PER_REGION: 35, // average cluster size
  MAX_ADJACENT_SECTORS: 12,
  SECTOR_TYPE_DISTRIBUTION: {
    standard: 0.85,
    one_way: 0.05,
    protected: 0.05,
    harmony_enforced: 0.05,
  },
  NUM_STAR_MALLS: 8,
  NUM_SEED_PLANETS: 6,
  NUM_OUTPOSTS: 200,
  NUM_STARTING_PLANETS: 300,

  // Economy
  STARTING_CREDITS: 10000,
  OUTPOST_BASE_TREASURY: 50000,
  OUTPOST_TREASURY_INJECTION: 500, // per game tick
  BASE_CYRILLIUM_PRICE: 10,
  BASE_FOOD_PRICE: 25,
  BASE_TECH_PRICE: 50,
  PRICE_ELASTICITY: 0.02, // price change per unit of supply delta

  // Decay
  DECAY_INACTIVE_THRESHOLD_HOURS: 48,
  DECAY_COLONIST_RATE: 0.015, // 1.5% per day
  DECAY_DEFENSE_DRAIN_RATE: 0.01, // 1% energy per tick
  DEPLOYABLE_LIFETIME_DAYS: 7,

  // Combat
  MIN_FLEE_CHANCE: 0.15,
  MULTI_SHIP_FLEE_BONUS: 0.10, // per additional attacker
  RACHE_DAMAGE_MULTIPLIER: 0.5,

  // Game tick interval
  TICK_INTERVAL_MS: 60000, // 60 seconds

  // New player
  STARTER_SHIP_TYPE: 'scout',
} as const;
