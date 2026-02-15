import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('outposts', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(16))))'));
    t.string('name').notNullable();
    t.integer('sector_id').notNullable().references('id').inTable('sectors');
    t.boolean('sells_fuel').notNullable().defaultTo(false);
    t.integer('cyrillium_stock').notNullable().defaultTo(0);
    t.integer('food_stock').notNullable().defaultTo(0);
    t.integer('tech_stock').notNullable().defaultTo(0);
    t.integer('cyrillium_capacity').notNullable().defaultTo(10000);
    t.integer('food_capacity').notNullable().defaultTo(10000);
    t.integer('tech_capacity').notNullable().defaultTo(10000);
    t.string('cyrillium_mode', 8).notNullable().defaultTo('none'); // buy, sell, none
    t.string('food_mode', 8).notNullable().defaultTo('none');
    t.string('tech_mode', 8).notNullable().defaultTo('none');
    t.bigInteger('treasury').notNullable().defaultTo(50000);
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('outposts');
}
