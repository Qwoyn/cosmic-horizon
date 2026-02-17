import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('players', (t) => {
    t.json('tutorial_state').nullable().defaultTo(null);
  });

  // Force-complete any existing in-progress tutorials so they aren't
  // retroactively placed into the sandbox.
  await knex('players')
    .where({ tutorial_completed: false })
    .update({ tutorial_completed: true });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('players', (t) => {
    t.dropColumn('tutorial_state');
  });
}
