import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  const id = 'f0000000-0000-0000-0000-000000000001';

  // Skip if already exists
  const existing = await knex('mission_templates').where({ id }).first();
  if (existing) return;

  await knex('mission_templates').insert({
    id,
    title: 'The Spore Network',
    description: 'The Muscarian Collective needs rare spore samples from across the galaxy. Visit 3 different sectors to collect specimens from diverse mycelial networks. Return with the samples and the Collective will share their most guarded secret — a living transporter organism.',
    type: 'visit_sector',
    difficulty: 2,
    tier: 2,
    objectives: JSON.stringify({ sectorsToVisit: 3 }),
    reward_credits: 2000,
    reward_xp: 150,
    reward_item_id: null,
    time_limit_minutes: null,
    min_player_level: 0,
    repeatable: false,
    source: 'board',
    requires_claim_at_mall: false,
    prerequisite_mission_id: null,
    reward_faction_id: 'race_muscarian',
    reward_fame: 10,
    reward_items: JSON.stringify([{ itemId: 'mycelial_transporter', name: 'Mycelial Transporter' }]),
    hints: JSON.stringify(['Visit 3 different sectors to collect rare spore samples for the Muscarian Collective.']),
    sort_order: 16,
  });
}
