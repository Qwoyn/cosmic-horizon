import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('sector_events', (t) => {
    t.uuid('id').primary();
    t.integer('sector_id').notNullable().references('id').inTable('sectors');
    t.string('event_type').notNullable(); // asteroid_field | nebula | distress_signal | derelict_ship | resource_cache | ion_storm
    t.json('data').notNullable();
    t.string('status').notNullable().defaultTo('active'); // active | resolved | expired
    t.uuid('resolved_by_id').nullable().references('id').inTable('players');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('expires_at').notNullable();

    t.index('sector_id');
    t.index('status');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('sector_events');
}
