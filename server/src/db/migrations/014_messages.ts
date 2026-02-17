import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('messages', (t) => {
    t.uuid('id').primary();
    t.uuid('sender_id').notNullable().references('id').inTable('players');
    t.uuid('recipient_id').notNullable().references('id').inTable('players');
    t.string('subject').notNullable();
    t.text('body').notNullable();
    t.boolean('read').notNullable().defaultTo(false);
    t.boolean('sender_deleted').notNullable().defaultTo(false);
    t.boolean('recipient_deleted').notNullable().defaultTo(false);
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    t.index('recipient_id');
    t.index('sender_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('messages');
}
