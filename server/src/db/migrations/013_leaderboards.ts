import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('leaderboard_cache', (t) => {
    t.string('category').notNullable();
    t.integer('rank').notNullable();
    t.uuid('player_id').notNullable().references('id').inTable('players');
    t.string('player_name').notNullable();
    t.bigInteger('score').notNullable().defaultTo(0);
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    t.primary(['category', 'rank']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('leaderboard_cache');
}
