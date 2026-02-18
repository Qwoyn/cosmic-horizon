import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('player_progression', (t) => {
    t.uuid('player_id').primary().references('id').inTable('players').onDelete('CASCADE');
    t.integer('level').notNullable().defaultTo(1);
    t.bigInteger('xp').notNullable().defaultTo(0);
    t.integer('total_combat_xp').notNullable().defaultTo(0);
    t.integer('total_mission_xp').notNullable().defaultTo(0);
    t.integer('total_trade_xp').notNullable().defaultTo(0);
    t.integer('total_explore_xp').notNullable().defaultTo(0);
    t.timestamp('last_level_up').nullable();
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('achievement_definitions', (t) => {
    t.string('id', 64).primary();
    t.string('name', 128).notNullable();
    t.text('description').notNullable();
    t.string('category', 32).notNullable();
    t.integer('xp_reward').notNullable().defaultTo(0);
    t.integer('credit_reward').notNullable().defaultTo(0);
    t.boolean('hidden').notNullable().defaultTo(false);
    t.string('icon', 8).notNullable().defaultTo('*');
    t.integer('sort_order').notNullable().defaultTo(0);
  });

  await knex.schema.createTable('player_achievements', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw("(lower(hex(randomblob(16))))"));
    t.uuid('player_id').notNullable().references('id').inTable('players').onDelete('CASCADE');
    t.string('achievement_id', 64).notNullable().references('id').inTable('achievement_definitions');
    t.timestamp('earned_at').notNullable().defaultTo(knex.fn.now());
    t.unique(['player_id', 'achievement_id']);
    t.index('player_id');
  });

  // Backfill progression rows for all existing players
  const existingPlayers = await knex('players').select('id');
  for (const player of existingPlayers) {
    await knex('player_progression').insert({
      player_id: player.id,
      level: 1,
      xp: 0,
      total_combat_xp: 0,
      total_mission_xp: 0,
      total_trade_xp: 0,
      total_explore_xp: 0,
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('player_achievements');
  await knex.schema.dropTableIfExists('achievement_definitions');
  await knex.schema.dropTableIfExists('player_progression');
}
