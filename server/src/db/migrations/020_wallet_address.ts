import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('players', (t) => {
    t.string('wallet_address', 42).nullable().unique();
    t.timestamp('wallet_connected_at').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('players', (t) => {
    t.dropColumn('wallet_address');
    t.dropColumn('wallet_connected_at');
  });
}
