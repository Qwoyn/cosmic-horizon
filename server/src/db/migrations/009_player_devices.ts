import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('player_devices', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(16))))'));
    t.uuid('player_id').notNullable().references('id').inTable('players').onDelete('CASCADE');
    t.string('fcm_token', 512).notNullable();
    t.string('platform', 16).notNullable().defaultTo('android');
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
    t.unique(['player_id', 'fcm_token']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('player_devices');
}
