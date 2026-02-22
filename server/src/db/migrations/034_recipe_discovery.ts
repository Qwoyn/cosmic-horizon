import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('player_discovered_recipes', (t) => {
    t.string('player_id', 64).notNullable().references('id').inTable('players').onDelete('CASCADE');
    t.string('recipe_id', 64).notNullable().references('id').inTable('recipes').onDelete('CASCADE');
    t.string('discovered_at').notNullable().defaultTo(knex.raw("(datetime('now'))"));
    t.primary(['player_id', 'recipe_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('player_discovered_recipes');
}
