import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('players', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(16))))'));
    t.string('username', 32).notNullable().unique();
    t.string('email').notNullable().unique();
    t.string('password_hash').notNullable();
    t.integer('current_sector_id').nullable();
    t.uuid('current_ship_id').nullable();
    t.integer('energy').notNullable().defaultTo(500);
    t.integer('max_energy').notNullable().defaultTo(500);
    t.bigInteger('credits').notNullable().defaultTo(0);
    t.json('explored_sectors').notNullable().defaultTo('[]');
    t.timestamp('last_login').nullable();
    t.timestamp('energy_regen_bonus_until').nullable();
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('players');
}
