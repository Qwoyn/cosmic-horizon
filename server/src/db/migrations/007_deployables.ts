import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('deployables', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(16))))'));
    t.uuid('owner_id').notNullable().references('id').inTable('players').onDelete('CASCADE');
    t.integer('sector_id').notNullable().references('id').inTable('sectors');
    t.string('type', 32).notNullable(); // drone_offensive, drone_defensive, drone_toll, mine_halberd, mine_barnacle, buoy
    t.integer('power_level').notNullable().defaultTo(1);
    t.integer('toll_amount').nullable();
    t.string('buoy_message', 256).nullable();
    t.json('buoy_log').nullable();
    t.uuid('attached_to_ship_id').nullable();
    t.integer('health').notNullable().defaultTo(100);
    t.timestamp('deployed_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('expires_at').notNullable();
    t.timestamp('last_maintained_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('deployables');
}
