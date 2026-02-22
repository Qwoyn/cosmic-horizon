import { Knex } from 'knex';

interface MilestoneDef {
  id: string;
  category: string;
  name: string;
  description: string;
  stat_key: string | null;
  threshold: number | null;
  tier: number;
  icon_key: string | null;
}

const MILESTONES: MilestoneDef[] = [
  // ── Combat ──────────────────────────────────────────────
  { id: 'first_blood',    category: 'combat', name: 'First Blood',    description: 'Destroy your first enemy ship',         stat_key: 'combat_kills', threshold: 1,    tier: 1, icon_key: 'combat' },
  { id: 'warrior',        category: 'combat', name: 'Warrior',        description: 'Destroy 25 enemy ships',                stat_key: 'combat_kills', threshold: 25,   tier: 1, icon_key: 'combat' },
  { id: 'warlord',        category: 'combat', name: 'Warlord',        description: 'Destroy 100 enemy ships',               stat_key: 'combat_kills', threshold: 100,  tier: 2, icon_key: 'combat' },
  { id: 'devastator',     category: 'combat', name: 'Devastator',     description: 'Destroy 500 enemy ships',               stat_key: 'combat_kills', threshold: 500,  tier: 3, icon_key: 'combat' },
  { id: 'survivor_1',     category: 'combat', name: 'Survivor',       description: 'Die and return 10 times',               stat_key: 'combat_deaths', threshold: 10,  tier: 1, icon_key: 'combat' },
  { id: 'damage_dealer',  category: 'combat', name: 'Damage Dealer',  description: 'Deal 10,000 total damage',              stat_key: 'damage_dealt', threshold: 10000, tier: 2, icon_key: 'combat' },

  // ── Exploration ─────────────────────────────────────────
  { id: 'scout',            category: 'exploration', name: 'Scout',           description: 'Explore 10 sectors',           stat_key: 'sectors_explored', threshold: 10,   tier: 1, icon_key: 'explore' },
  { id: 'pathfinder',       category: 'exploration', name: 'Pathfinder',      description: 'Explore 100 sectors',          stat_key: 'sectors_explored', threshold: 100,  tier: 2, icon_key: 'explore' },
  { id: 'cartographer',     category: 'exploration', name: 'Cartographer',    description: 'Explore 500 sectors',          stat_key: 'sectors_explored', threshold: 500,  tier: 3, icon_key: 'explore' },
  { id: 'cosmic_wanderer',  category: 'exploration', name: 'Cosmic Wanderer', description: 'Explore 1000 sectors',         stat_key: 'sectors_explored', threshold: 1000, tier: 3, icon_key: 'explore' },

  // ── Trade ───────────────────────────────────────────────
  { id: 'first_deal',   category: 'trade', name: 'First Deal',   description: 'Complete your first trade',       stat_key: 'trades_completed', threshold: 1,    tier: 1, icon_key: 'trade' },
  { id: 'merchant',     category: 'trade', name: 'Merchant',     description: 'Complete 50 trades',              stat_key: 'trades_completed', threshold: 50,   tier: 1, icon_key: 'trade' },
  { id: 'trade_baron',  category: 'trade', name: 'Trade Baron',  description: 'Complete 250 trades',             stat_key: 'trades_completed', threshold: 250,  tier: 2, icon_key: 'trade' },
  { id: 'tycoon',       category: 'trade', name: 'Tycoon',       description: 'Complete 1000 trades',            stat_key: 'trades_completed', threshold: 1000, tier: 3, icon_key: 'trade' },
  { id: 'big_spender',  category: 'trade', name: 'Big Spender',  description: 'Spend 100,000 credits on trades', stat_key: 'trade_credits_spent', threshold: 100000, tier: 2, icon_key: 'trade' },

  // ── Crafting ────────────────────────────────────────────
  { id: 'tinkerer',       category: 'crafting', name: 'Tinkerer',       description: 'Craft 5 items',        stat_key: 'items_crafted', threshold: 5,   tier: 1, icon_key: 'crafting' },
  { id: 'artificer',      category: 'crafting', name: 'Artificer',      description: 'Craft 50 items',       stat_key: 'items_crafted', threshold: 50,  tier: 2, icon_key: 'crafting' },
  { id: 'master_crafter', category: 'crafting', name: 'Master Crafter', description: 'Craft 200 items',      stat_key: 'items_crafted', threshold: 200, tier: 3, icon_key: 'crafting' },

  // ── Colonization ────────────────────────────────────────
  { id: 'settler',        category: 'colonization', name: 'Settler',        description: 'Colonize your first planet',  stat_key: 'planets_colonized', threshold: 1,  tier: 1, icon_key: 'planets' },
  { id: 'governor',       category: 'colonization', name: 'Governor',       description: 'Colonize 3 planets',          stat_key: 'planets_colonized', threshold: 3,  tier: 2, icon_key: 'planets' },
  { id: 'empire_builder', category: 'colonization', name: 'Empire Builder', description: 'Colonize 10 planets',         stat_key: 'planets_colonized', threshold: 10, tier: 3, icon_key: 'planets' },
  { id: 'food_baron',     category: 'colonization', name: 'Food Baron',     description: 'Deposit 1000 food on planets', stat_key: 'food_deposited', threshold: 1000, tier: 2, icon_key: 'planets' },

  // ── Social / Bounties ──────────────────────────────────
  { id: 'bounty_hunter',  category: 'social', name: 'Bounty Hunter',  description: 'Claim your first bounty',    stat_key: 'bounties_claimed', threshold: 1,  tier: 1, icon_key: 'combat' },
  { id: 'vigilante',      category: 'social', name: 'Vigilante',      description: 'Claim 10 bounties',          stat_key: 'bounties_claimed', threshold: 10, tier: 2, icon_key: 'combat' },
  { id: 'pirate_scourge', category: 'social', name: 'Pirate Scourge', description: 'Ransack 25 caravans',        stat_key: 'caravans_ransacked', threshold: 25, tier: 2, icon_key: 'combat' },

  // ── Caravans ────────────────────────────────────────────
  { id: 'trade_pioneer',    category: 'caravan', name: 'Trade Pioneer',    description: 'Deliver your first caravan',    stat_key: 'caravans_delivered', threshold: 1,   tier: 1, icon_key: 'trade' },
  { id: 'supply_line',      category: 'caravan', name: 'Supply Line',      description: 'Deliver 25 caravans',           stat_key: 'caravans_delivered', threshold: 25,  tier: 2, icon_key: 'trade' },
  { id: 'logistics_master', category: 'caravan', name: 'Logistics Master', description: 'Deliver 100 caravans',          stat_key: 'caravans_delivered', threshold: 100, tier: 3, icon_key: 'trade' },
  { id: 'escort_duty',      category: 'social',  name: 'Escort Duty',      description: 'Escort 10 allied caravans',     stat_key: 'caravans_escorted', threshold: 10,  tier: 2, icon_key: 'trade' },

  // ── Missions ────────────────────────────────────────────
  { id: 'mission_rookie',  category: 'missions', name: 'Mission Rookie',  description: 'Complete 5 missions',   stat_key: 'missions_completed', threshold: 5,   tier: 1, icon_key: 'missions' },
  { id: 'mission_veteran', category: 'missions', name: 'Mission Veteran', description: 'Complete 50 missions',  stat_key: 'missions_completed', threshold: 50,  tier: 2, icon_key: 'missions' },
  { id: 'mission_legend',  category: 'missions', name: 'Mission Legend',  description: 'Complete 200 missions', stat_key: 'missions_completed', threshold: 200, tier: 3, icon_key: 'missions' },
];

export async function seed(knex: Knex): Promise<void> {
  for (const m of MILESTONES) {
    const existing = await knex('milestone_definitions').where({ id: m.id }).first();
    if (!existing) {
      await knex('milestone_definitions').insert(m);
    }
  }
}
