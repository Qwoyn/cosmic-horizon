import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('combat_logs', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(16))))'));
    t.uuid('attacker_id').notNullable().references('id').inTable('players');
    t.uuid('defender_id').notNullable().references('id').inTable('players');
    t.integer('sector_id').notNullable().references('id').inTable('sectors');
    t.integer('energy_expended').notNullable();
    t.integer('damage_dealt').notNullable();
    t.string('outcome', 32).notNullable(); // hit, miss, ship_destroyed, ship_captured, fled
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('trade_logs', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(16))))'));
    t.uuid('player_id').notNullable().references('id').inTable('players');
    t.uuid('outpost_id').notNullable().references('id').inTable('outposts');
    t.string('commodity', 16).notNullable(); // cyrillium, food, tech
    t.integer('quantity').notNullable();
    t.integer('price_per_unit').notNullable();
    t.bigInteger('total_price').notNullable();
    t.string('direction', 8).notNullable(); // buy, sell
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('game_events', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(16))))'));
    t.uuid('player_id').notNullable().references('id').inTable('players');
    t.string('event_type', 64).notNullable();
    t.json('data').notNullable().defaultTo('{}');
    t.boolean('read').notNullable().defaultTo(false);
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('bounties', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(16))))'));
    t.uuid('placed_by_id').notNullable().references('id').inTable('players');
    t.uuid('target_player_id').nullable().references('id').inTable('players');
    t.uuid('target_ship_id').nullable().references('id').inTable('ships');
    t.bigInteger('reward').notNullable();
    t.boolean('active').notNullable().defaultTo(true);
    t.uuid('claimed_by_id').nullable().references('id').inTable('players');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('claimed_at').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('bounties');
  await knex.schema.dropTableIfExists('game_events');
  await knex.schema.dropTableIfExists('trade_logs');
  await knex.schema.dropTableIfExists('combat_logs');
}
