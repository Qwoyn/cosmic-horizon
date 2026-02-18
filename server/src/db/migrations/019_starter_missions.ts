import { Knex } from 'knex';

const STARTER_MISSIONS = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    title: 'Pathfinder',
    description: 'Visit 5 new sectors to chart the galaxy.',
    type: 'visit_sector',
    difficulty: 1,
    objectives: JSON.stringify({ sectorsToVisit: 5 }),
    reward_credits: 1000,
    reward_item_id: null,
    time_limit_minutes: null,
    min_player_level: 0,
    repeatable: false,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    title: 'First Trades',
    description: 'Trade 10 units of any commodity at outposts.',
    type: 'trade_units',
    difficulty: 1,
    objectives: JSON.stringify({ unitsToTrade: 10 }),
    reward_credits: 1000,
    reward_item_id: null,
    time_limit_minutes: null,
    min_player_level: 0,
    repeatable: false,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    title: 'Scanner Training',
    description: 'Perform 2 sector scans to practice using your sensors.',
    type: 'scan_sectors',
    difficulty: 1,
    objectives: JSON.stringify({ scansRequired: 2 }),
    reward_credits: 500,
    reward_item_id: null,
    time_limit_minutes: null,
    min_player_level: 0,
    repeatable: false,
  },
];

export async function up(knex: Knex): Promise<void> {
  for (const mission of STARTER_MISSIONS) {
    const exists = await knex('mission_templates').where({ id: mission.id }).first();
    if (!exists) {
      await knex('mission_templates').insert(mission);
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex('mission_templates').whereIn('id', STARTER_MISSIONS.map(m => m.id)).del();
}
