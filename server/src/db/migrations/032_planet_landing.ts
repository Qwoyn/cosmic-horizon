import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Use raw SQL to avoid Knex's table-recreate strategy which fails on SQLite
  // when other tables have FK references to `players`.
  await knex.raw(`ALTER TABLE players ADD COLUMN landed_at_planet_id TEXT DEFAULT NULL REFERENCES planets(id)`);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`ALTER TABLE players DROP COLUMN landed_at_planet_id`);
}
