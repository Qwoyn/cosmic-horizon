import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('warp_gates', (t) => {
    t.uuid('id').primary();
    t.integer('sector_a_id').notNullable().references('id').inTable('sectors');
    t.integer('sector_b_id').notNullable().references('id').inTable('sectors');
    t.uuid('syndicate_id').notNullable().references('id').inTable('syndicates');
    t.uuid('built_by_id').notNullable().references('id').inTable('players');
    t.integer('toll_amount').notNullable().defaultTo(0);
    t.boolean('syndicate_free').notNullable().defaultTo(true);
    t.string('status').notNullable().defaultTo('active'); // active | destroyed
    t.integer('health').notNullable().defaultTo(100);
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());

    t.index('sector_a_id');
    t.index('sector_b_id');
    t.index('syndicate_id');
  });

  await knex.schema.createTable('warp_gate_usage', (t) => {
    t.uuid('id').primary();
    t.uuid('gate_id').notNullable().references('id').inTable('warp_gates');
    t.uuid('player_id').notNullable().references('id').inTable('players');
    t.integer('toll_paid').notNullable().defaultTo(0);
    t.timestamp('used_at').notNullable().defaultTo(knex.fn.now());

    t.index('gate_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('warp_gate_usage');
  await knex.schema.dropTableIfExists('warp_gates');
}
