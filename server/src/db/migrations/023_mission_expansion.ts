import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Extend mission_templates with tier, prerequisite, source, claim, rewards, hints
  await knex.schema.alterTable('mission_templates', (t) => {
    t.integer('tier').notNullable().defaultTo(1);
    t.uuid('prerequisite_mission_id').nullable().references('id').inTable('mission_templates');
    t.string('source', 32).notNullable().defaultTo('board');
    t.boolean('requires_claim_at_mall').notNullable().defaultTo(false);
    t.integer('reward_xp').notNullable().defaultTo(0);
    t.json('reward_items').nullable();
    t.json('hints').nullable();
    t.integer('sort_order').notNullable().defaultTo(0);
  });

  // Extend player_missions with per-objective detail and claim status
  await knex.schema.alterTable('player_missions', (t) => {
    t.json('objectives_detail').nullable();
    t.string('claim_status', 16).defaultTo('auto');
  });

  // Backfill existing mission_templates: tier = difficulty, reward_xp = difficulty * 50
  await knex.raw(`
    UPDATE mission_templates
    SET tier = difficulty,
        reward_xp = difficulty * 50,
        source = 'board'
  `);

  // Mark starter missions
  await knex('mission_templates')
    .whereIn('id', [
      'a0000000-0000-0000-0000-000000000001',
      'a0000000-0000-0000-0000-000000000002',
      'a0000000-0000-0000-0000-000000000003',
    ])
    .update({ source: 'starter' });

  // Backfill existing player_missions
  await knex.raw(`UPDATE player_missions SET claim_status = 'auto' WHERE claim_status IS NULL`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('player_missions', (t) => {
    t.dropColumn('objectives_detail');
    t.dropColumn('claim_status');
  });

  await knex.schema.alterTable('mission_templates', (t) => {
    t.dropColumn('tier');
    t.dropColumn('prerequisite_mission_id');
    t.dropColumn('source');
    t.dropColumn('requires_claim_at_mall');
    t.dropColumn('reward_xp');
    t.dropColumn('reward_items');
    t.dropColumn('hints');
    t.dropColumn('sort_order');
  });
}
