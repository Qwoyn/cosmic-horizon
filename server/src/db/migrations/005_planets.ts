import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('planets', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(16))))'));
    t.string('name').notNullable();
    t.integer('sector_id').notNullable().references('id').inTable('sectors');
    t.uuid('owner_id').nullable().references('id').inTable('players').onDelete('SET NULL');
    t.uuid('syndicate_id').nullable();
    t.string('planet_class', 2).notNullable(); // H, D, O, A, F, V, G, S
    t.integer('colonists').notNullable().defaultTo(0);
    t.integer('ideal_population').notNullable().defaultTo(10000);
    t.integer('upgrade_level').notNullable().defaultTo(0);
    t.integer('cyrillium_stock').notNullable().defaultTo(0);
    t.integer('food_stock').notNullable().defaultTo(0);
    t.integer('tech_stock').notNullable().defaultTo(0);
    t.integer('refined_cyrillium').notNullable().defaultTo(0);
    t.integer('drone_count').notNullable().defaultTo(0);
    t.string('drone_mode', 16).nullable(); // offensive, defensive, toll
    t.integer('cannon_energy').notNullable().defaultTo(0);
    t.integer('cannon_max_energy').notNullable().defaultTo(0);
    t.integer('cannon_shot_power').notNullable().defaultTo(10);
    t.boolean('psd_active').notNullable().defaultTo(false);
    t.integer('psd_intensity').notNullable().defaultTo(5);
    t.integer('shield_energy').notNullable().defaultTo(0);
    t.integer('shield_max_energy').notNullable().defaultTo(0);
    t.boolean('aatb_active').notNullable().defaultTo(false);
    t.boolean('has_warp_drive').notNullable().defaultTo(false);
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('planets');
}
