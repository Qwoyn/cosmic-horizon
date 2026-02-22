import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Use raw SQL to avoid Knex's table-recreate strategy which fails on SQLite
  // when other tables have FK references to these tables.

  // Players: game mode and SP tracking
  await knex.raw(`ALTER TABLE players ADD COLUMN game_mode TEXT NOT NULL DEFAULT 'multiplayer'`);
  await knex.raw(`ALTER TABLE players ADD COLUMN sp_sector_offset INTEGER DEFAULT NULL`);
  await knex.raw(`ALTER TABLE players ADD COLUMN sp_last_tick_at TEXT DEFAULT NULL`);

  // Sectors: universe isolation and SP mall locking
  await knex.raw(`ALTER TABLE sectors ADD COLUMN universe TEXT NOT NULL DEFAULT 'mp'`);
  await knex.raw(`ALTER TABLE sectors ADD COLUMN owner_id TEXT DEFAULT NULL REFERENCES players(id) ON DELETE CASCADE`);
  await knex.raw(`ALTER TABLE sectors ADD COLUMN sp_mall_locked INTEGER NOT NULL DEFAULT 0`);

  // Index for efficient SP sector lookups
  await knex.raw('CREATE INDEX IF NOT EXISTS idx_sectors_owner ON sectors(owner_id) WHERE owner_id IS NOT NULL');
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP INDEX IF EXISTS idx_sectors_owner');

  await knex.schema.alterTable('sectors', (table) => {
    table.dropColumn('sp_mall_locked');
    table.dropColumn('owner_id');
    table.dropColumn('universe');
  });

  await knex.schema.alterTable('players', (table) => {
    table.dropColumn('sp_last_tick_at');
    table.dropColumn('sp_sector_offset');
    table.dropColumn('game_mode');
  });
}
