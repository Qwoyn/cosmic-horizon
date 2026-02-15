import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('ship_types', (t) => {
    t.string('id', 32).primary();
    t.string('name').notNullable();
    t.text('description');
    t.integer('base_weapon_energy').notNullable();
    t.integer('max_weapon_energy').notNullable();
    t.integer('base_cargo_holds').notNullable();
    t.integer('max_cargo_holds').notNullable();
    t.integer('base_engine_energy').notNullable();
    t.integer('max_engine_energy').notNullable();
    t.float('attack_ratio').notNullable().defaultTo(1.0);
    t.float('defense_ratio').notNullable().defaultTo(1.0);
    t.integer('recharge_delay_ms').notNullable().defaultTo(5000);
    t.integer('fuel_per_sector').notNullable().defaultTo(1);
    t.integer('price').notNullable();
    t.boolean('can_cloak').notNullable().defaultTo(false);
    t.boolean('can_carry_pgd').notNullable().defaultTo(false);
    t.boolean('can_carry_mines').notNullable().defaultTo(false);
    t.boolean('can_tow').notNullable().defaultTo(false);
    t.boolean('has_jump_drive_slot').notNullable().defaultTo(false);
    t.boolean('has_planetary_scanner').notNullable().defaultTo(false);
    t.integer('max_drones').notNullable().defaultTo(1);
    t.float('tow_fuel_multiplier').notNullable().defaultTo(2.0);
  });

  await knex.schema.createTable('ships', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(16))))'));
    t.string('ship_type_id', 32).notNullable().references('id').inTable('ship_types');
    t.uuid('owner_id').nullable().references('id').inTable('players').onDelete('SET NULL');
    t.string('name', 64).nullable();
    t.integer('sector_id').nullable().references('id').inTable('sectors');
    t.integer('weapon_energy').notNullable();
    t.integer('max_weapon_energy').notNullable();
    t.integer('engine_energy').notNullable();
    t.integer('max_engine_energy').notNullable();
    t.integer('cargo_holds').notNullable();
    t.integer('max_cargo_holds').notNullable();
    t.integer('cyrillium_cargo').notNullable().defaultTo(0);
    t.integer('food_cargo').notNullable().defaultTo(0);
    t.integer('tech_cargo').notNullable().defaultTo(0);
    t.integer('colonist_cargo').notNullable().defaultTo(0);
    t.boolean('is_cloaked').notNullable().defaultTo(false);
    t.integer('cloak_cells').notNullable().defaultTo(0);
    t.boolean('has_rache_device').notNullable().defaultTo(false);
    t.boolean('has_jump_drive').notNullable().defaultTo(false);
    t.uuid('towing_ship_id').nullable();
    t.boolean('is_destroyed').notNullable().defaultTo(false);
    t.boolean('is_registered').notNullable().defaultTo(true);
    t.integer('stored_at_star_mall_sector').nullable();
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('dodge_pods', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(16))))'));
    t.uuid('player_id').notNullable().references('id').inTable('players').onDelete('CASCADE');
    t.integer('sector_id').notNullable().references('id').inTable('sectors');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('dodge_pods');
  await knex.schema.dropTableIfExists('ships');
  await knex.schema.dropTableIfExists('ship_types');
}
