import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  const id = 'b0000000-0000-0000-0000-000000000021';

  // Skip if already exists
  const existing = await knex('mission_templates').where({ id }).first();
  if (existing) return;

  await knex('mission_templates').insert({
    id,
    title: 'Stellar Census',
    description: 'The Vedic Cartographers Guild requires a comprehensive stellar survey before granting naming authority. Scan 8 sectors to catalog the local star systems.',
    type: 'scan_sectors',
    difficulty: 2,
    tier: 2,
    objectives: JSON.stringify({ scansRequired: 8 }),
    reward_credits: 3000,
    reward_xp: 200,
    reward_item_id: null,
    time_limit_minutes: null,
    min_player_level: 0,
    repeatable: false,
    source: 'board',
    requires_claim_at_mall: false,
    prerequisite_mission_id: null,
    reward_items: null,
    hints: JSON.stringify(['Use your scanner in different sectors to build the catalog.']),
    sort_order: 15,
  });
}
