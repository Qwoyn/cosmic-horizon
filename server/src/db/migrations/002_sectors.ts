import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('sectors', (t) => {
    t.integer('id').primary();
    t.string('type', 32).notNullable().defaultTo('standard'); // standard, one_way, protected, harmony_enforced
    t.boolean('has_star_mall').notNullable().defaultTo(false);
    t.boolean('has_seed_planet').notNullable().defaultTo(false);
    t.integer('region_id').nullable();
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('sector_edges', (t) => {
    t.integer('from_sector_id').notNullable().references('id').inTable('sectors').onDelete('CASCADE');
    t.integer('to_sector_id').notNullable().references('id').inTable('sectors').onDelete('CASCADE');
    t.boolean('one_way').notNullable().defaultTo(false);
    t.primary(['from_sector_id', 'to_sector_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('sector_edges');
  await knex.schema.dropTableIfExists('sectors');
}
