import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1. Sector resource events table
  await knex.schema.createTable('sector_resource_events', (t) => {
    t.uuid('id').primary();
    t.integer('sector_id').notNullable()
      .references('id').inTable('sectors');
    t.string('event_type', 32).notNullable(); // 'asteroid_field', 'derelict', 'anomaly', 'alien_cache'
    t.text('resources').notNullable(); // JSON array
    t.timestamp('spawned_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('expires_at').notNullable();
    t.integer('guardian_hp').nullable(); // for alien caches
    t.uuid('claimed_by').nullable()
      .references('id').inTable('players');
    t.text('metadata').nullable(); // JSON for extra data
    t.index(['sector_id']);
    t.index(['expires_at']);
  });

  // 2. Alter planets: add variant + rare_resource columns
  await knex.schema.alterTable('planets', (t) => {
    t.string('variant', 32).nullable(); // 'prime', 'ancient', 'storm', 'abyssal', 'ruin', 'crystal'
    t.string('rare_resource', 64).nullable(); // resource_definitions.id for ultra-rare
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('sector_resource_events');
  await knex.schema.alterTable('planets', (t) => {
    t.dropColumn('variant');
    t.dropColumn('rare_resource');
  });
}
