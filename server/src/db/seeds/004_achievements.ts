import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('player_achievements').del();
  await knex('achievement_definitions').del();

  const achievements = [
    // Leveling
    { id: 'reach_level_10',  name: 'Rising Star',         description: 'Reach level 10.',                    category: 'leveling',    xp_reward: 100,  credit_reward: 1000,   hidden: false, icon: '+', sort_order: 10 },
    { id: 'reach_level_25',  name: 'Veteran Pilot',       description: 'Reach level 25.',                    category: 'leveling',    xp_reward: 250,  credit_reward: 5000,   hidden: false, icon: '+', sort_order: 11 },
    { id: 'reach_level_50',  name: 'Elite Commander',     description: 'Reach level 50.',                    category: 'leveling',    xp_reward: 500,  credit_reward: 15000,  hidden: false, icon: '+', sort_order: 12 },
    { id: 'reach_level_75',  name: 'Cosmic Veteran',      description: 'Reach level 75.',                    category: 'leveling',    xp_reward: 750,  credit_reward: 30000,  hidden: false, icon: '+', sort_order: 13 },
    { id: 'reach_level_100', name: 'Cosmic Legend',        description: 'Reach the maximum level.',           category: 'leveling',    xp_reward: 0,    credit_reward: 100000, hidden: false, icon: '!', sort_order: 14 },

    // Combat
    { id: 'first_kill',      name: 'Baptism of Fire',     description: 'Destroy your first enemy ship.',     category: 'combat',      xp_reward: 50,   credit_reward: 500,    hidden: false, icon: 'x', sort_order: 20 },
    { id: 'destroy_10',      name: 'Ace Pilot',           description: 'Destroy 10 enemy ships.',            category: 'combat',      xp_reward: 200,  credit_reward: 5000,   hidden: false, icon: 'x', sort_order: 21 },
    { id: 'destroy_50',      name: 'Warlord',             description: 'Destroy 50 enemy ships.',            category: 'combat',      xp_reward: 500,  credit_reward: 25000,  hidden: false, icon: 'x', sort_order: 22 },

    // Exploration
    { id: 'explore_100',     name: 'Star Cartographer',   description: 'Explore 100 sectors.',               category: 'exploration', xp_reward: 100,  credit_reward: 2000,   hidden: false, icon: '~', sort_order: 30 },
    { id: 'explore_500',     name: 'Galaxy Mapper',       description: 'Explore 500 sectors.',               category: 'exploration', xp_reward: 300,  credit_reward: 10000,  hidden: false, icon: '~', sort_order: 31 },
    { id: 'explore_1000',    name: 'Cosmic Explorer',     description: 'Explore 1000 sectors.',              category: 'exploration', xp_reward: 500,  credit_reward: 25000,  hidden: false, icon: '~', sort_order: 32 },

    // Trading
    { id: 'first_trade',     name: 'Merchant Initiate',   description: 'Complete your first trade.',         category: 'trade',       xp_reward: 25,   credit_reward: 250,    hidden: false, icon: '$', sort_order: 40 },
    { id: 'trade_1000_units', name: 'Trade Mogul',        description: 'Trade over 1000 units of goods.',    category: 'trade',       xp_reward: 300,  credit_reward: 10000,  hidden: false, icon: '$', sort_order: 41 },

    // Missions
    { id: 'first_mission',        name: 'Mission Accepted',  description: 'Complete your first mission.',    category: 'missions',    xp_reward: 25,   credit_reward: 250,    hidden: false, icon: '>', sort_order: 50 },
    { id: 'complete_10_missions',  name: 'Mission Veteran',  description: 'Complete 10 missions.',           category: 'missions',    xp_reward: 200,  credit_reward: 5000,   hidden: false, icon: '>', sort_order: 51 },
    { id: 'complete_50_missions',  name: 'Mission Master',   description: 'Complete 50 missions.',           category: 'missions',    xp_reward: 500,  credit_reward: 20000,  hidden: false, icon: '>', sort_order: 52 },

    // Planets
    { id: 'first_planet',    name: 'Land Owner',          description: 'Claim your first planet.',           category: 'exploration', xp_reward: 50,   credit_reward: 1000,   hidden: false, icon: 'O', sort_order: 60 },
    { id: 'own_5_planets',   name: 'Colonial Governor',   description: 'Own 5 planets.',                     category: 'exploration', xp_reward: 250,  credit_reward: 10000,  hidden: false, icon: 'O', sort_order: 61 },

    // Hidden surprises
    { id: 'hidden_sector_1',        name: 'Origin Story',  description: 'Visit sector 1 — where it all began.', category: 'special', xp_reward: 100, credit_reward: 5000,   hidden: true,  icon: '?', sort_order: 90 },
    { id: 'hidden_million_credits', name: 'Millionaire',   description: 'Accumulate 1,000,000 credits.',        category: 'special', xp_reward: 200, credit_reward: 0,      hidden: true,  icon: '?', sort_order: 91 },
  ];

  for (const a of achievements) {
    await knex('achievement_definitions').insert(a);
  }
}
