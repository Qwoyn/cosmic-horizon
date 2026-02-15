import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('syndicates', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(16))))'));
    t.string('name', 64).notNullable().unique();
    t.text('charter').nullable();
    t.bigInteger('treasury').notNullable().defaultTo(0);
    t.uuid('leader_id').notNullable().references('id').inTable('players');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('syndicate_members', (t) => {
    t.uuid('syndicate_id').notNullable().references('id').inTable('syndicates').onDelete('CASCADE');
    t.uuid('player_id').notNullable().references('id').inTable('players').onDelete('CASCADE');
    t.string('role', 16).notNullable().defaultTo('member'); // leader, officer, member
    t.timestamp('joined_at').notNullable().defaultTo(knex.fn.now());
    t.primary(['syndicate_id', 'player_id']);
  });

  await knex.schema.createTable('alliances', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(16))))'));
    t.uuid('player_a_id').nullable().references('id').inTable('players').onDelete('CASCADE');
    t.uuid('player_b_id').nullable().references('id').inTable('players').onDelete('CASCADE');
    t.uuid('syndicate_a_id').nullable().references('id').inTable('syndicates').onDelete('CASCADE');
    t.uuid('syndicate_b_id').nullable().references('id').inTable('syndicates').onDelete('CASCADE');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('alliances');
  await knex.schema.dropTableIfExists('syndicate_members');
  await knex.schema.dropTableIfExists('syndicates');
}
