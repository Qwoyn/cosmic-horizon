import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1. Trade routes table
  await knex.schema.createTable('trade_routes', (table) => {
    table.text('id').primary();
    table.text('owner_id').notNullable().references('id').inTable('players').onDelete('CASCADE');
    table.text('source_type').notNullable(); // 'outpost' or 'star_mall'
    table.text('source_id').notNullable(); // outpost.id or sector id
    table.integer('source_sector_id').notNullable().references('id').inTable('sectors');
    table.text('dest_planet_id').notNullable().references('id').inTable('planets').onDelete('CASCADE');
    table.integer('dest_sector_id').notNullable().references('id').inTable('sectors');
    table.text('path_json').notNullable(); // JSON array of sector IDs
    table.integer('path_length').notNullable();
    table.integer('food_per_cycle').notNullable().defaultTo(20);
    table.integer('credit_cost').notNullable().defaultTo(500);
    table.integer('fuel_paid').notNullable().defaultTo(0); // 1=protected, 0=unprotected
    table.text('status').notNullable().defaultTo('active'); // active/paused/destroyed
    table.text('created_at').notNullable();
    table.text('last_dispatch_at');
    table.index('owner_id');
    table.index('dest_planet_id');
  });

  // 2. Caravans table
  await knex.schema.createTable('caravans', (table) => {
    table.text('id').primary();
    table.text('trade_route_id').notNullable().references('id').inTable('trade_routes').onDelete('CASCADE');
    table.text('owner_id').notNullable().references('id').inTable('players').onDelete('CASCADE');
    table.integer('current_sector_id').notNullable().references('id').inTable('sectors');
    table.text('path_json').notNullable();
    table.integer('path_index').notNullable().defaultTo(0);
    table.integer('food_cargo').notNullable().defaultTo(0);
    table.integer('is_protected').notNullable().defaultTo(0); // fuel-paid protection
    table.text('escort_player_id');
    table.integer('escort_sector_id');
    table.integer('defense_hp').notNullable().defaultTo(20);
    table.float('defense_ratio').notNullable().defaultTo(0.5);
    table.text('status').notNullable().defaultTo('in_transit'); // in_transit/arrived/destroyed
    table.text('dispatched_at').notNullable();
    table.text('arrived_at');
    table.index('current_sector_id');
    table.index('owner_id');
    table.index('trade_route_id');
  });

  // 3. Caravan logs table
  await knex.schema.createTable('caravan_logs', (table) => {
    table.text('id').primary();
    table.text('caravan_id').notNullable(); // no FK — caravan may be deleted
    table.text('trade_route_id').notNullable();
    table.text('event_type').notNullable(); // dispatched/arrived/ransacked/escorted
    table.text('actor_id');
    table.integer('sector_id');
    table.integer('food_amount');
    table.integer('credits_amount');
    table.text('details_json');
    table.text('created_at').notNullable();
    table.index('trade_route_id');
  });

  // 4. Add pirate_until to players
  await knex.raw(`ALTER TABLE players ADD COLUMN pirate_until TEXT`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('caravan_logs');
  await knex.schema.dropTableIfExists('caravans');
  await knex.schema.dropTableIfExists('trade_routes');

  try {
    await knex.schema.alterTable('players', (table) => {
      table.dropColumn('pirate_until');
    });
  } catch { /* column may not exist */ }
}
