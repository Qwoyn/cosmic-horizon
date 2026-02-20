import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Players: game mode and SP tracking
  await knex.schema.alterTable('players', (table) => {
    table.string('game_mode', 16).notNullable().defaultTo('multiplayer');
    table.integer('sp_sector_offset').nullable();
    table.timestamp('sp_last_tick_at').nullable();
  });

  // Sectors: universe isolation and SP mall locking
  await knex.schema.alterTable('sectors', (table) => {
    table.string('universe', 16).notNullable().defaultTo('mp');
    table.uuid('owner_id').nullable().references('id').inTable('players').onDelete('CASCADE');
    table.boolean('sp_mall_locked').notNullable().defaultTo(false);
  });

  // Index for efficient SP sector lookups
  await knex.raw('CREATE INDEX idx_sectors_owner ON sectors(owner_id) WHERE owner_id IS NOT NULL');
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
