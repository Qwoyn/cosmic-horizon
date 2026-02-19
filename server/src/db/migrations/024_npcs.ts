import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('factions', (t) => {
    t.string('id', 64).primary();
    t.string('name', 64).notNullable();
    t.text('description').nullable();
    t.string('alignment', 16).nullable(); // 'lawful', 'neutral', 'criminal'
  });

  await knex.schema.createTable('npc_definitions', (t) => {
    t.string('id', 64).primary();
    t.string('name', 64).notNullable();
    t.string('title', 64).nullable();
    t.string('race', 32).nullable();
    t.string('faction_id', 64).nullable().references('id').inTable('factions');
    t.string('location_type', 16).notNullable(); // 'outpost', 'planet', 'sector'
    t.string('location_id', 64).nullable();
    t.integer('sector_id').notNullable();
    t.json('dialogue_tree').notNullable();
    t.json('services').nullable();
    t.json('first_encounter').notNullable();
    t.json('sprite_config').notNullable();
    t.boolean('is_key_npc').notNullable().defaultTo(false);
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('player_npc_state', (t) => {
    t.uuid('id').primary();
    t.uuid('player_id').notNullable().references('id').inTable('players');
    t.string('npc_id', 64).notNullable().references('id').inTable('npc_definitions');
    t.boolean('encountered').notNullable().defaultTo(false);
    t.integer('reputation').notNullable().defaultTo(0);
    t.json('dialogue_state').nullable();
    t.timestamp('last_visited').nullable();
    t.text('notes').nullable();
    t.unique(['player_id', 'npc_id']);
  });

  await knex.schema.createTable('player_faction_rep', (t) => {
    t.uuid('player_id').notNullable().references('id').inTable('players');
    t.string('faction_id', 64).notNullable().references('id').inTable('factions');
    t.integer('reputation').notNullable().defaultTo(0);
    t.primary(['player_id', 'faction_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('player_faction_rep');
  await knex.schema.dropTableIfExists('player_npc_state');
  await knex.schema.dropTableIfExists('npc_definitions');
  await knex.schema.dropTableIfExists('factions');
}
