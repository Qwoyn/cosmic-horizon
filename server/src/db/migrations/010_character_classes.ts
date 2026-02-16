import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('players', (t) => {
    t.string('race', 16).nullable();
    t.integer('tutorial_step').defaultTo(0);
    t.boolean('tutorial_completed').defaultTo(false);
    t.boolean('has_seen_intro').defaultTo(false);
    t.boolean('has_seen_post_tutorial').defaultTo(false);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('players', (t) => {
    t.dropColumn('race');
    t.dropColumn('tutorial_step');
    t.dropColumn('tutorial_completed');
    t.dropColumn('has_seen_intro');
    t.dropColumn('has_seen_post_tutorial');
  });
}
