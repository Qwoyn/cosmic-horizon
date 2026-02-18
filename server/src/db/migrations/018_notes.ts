import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('notes', (t) => {
    t.uuid('id').primary();
    t.uuid('player_id').notNullable().references('id').inTable('players');
    t.text('content').notNullable();
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    t.index('player_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('notes');
}
