import { Knex } from 'knex';

const HULL_VALUES: Record<string, { base: number; max: number }> = {
  dodge_pod: { base: 10, max: 10 },
  scout: { base: 50, max: 75 },
  freighter: { base: 80, max: 120 },
  corvette: { base: 100, max: 175 },
  cruiser: { base: 150, max: 250 },
  battleship: { base: 200, max: 350 },
  stealth: { base: 40, max: 60 },
  colony_ship: { base: 60, max: 100 },
};

export async function up(knex: Knex): Promise<void> {
  // Add hull HP columns to ship_types
  await knex.schema.alterTable('ship_types', (t) => {
    t.integer('base_hull_hp').notNullable().defaultTo(50);
    t.integer('max_hull_hp').notNullable().defaultTo(75);
  });

  // Add hull HP columns to ships
  await knex.schema.alterTable('ships', (t) => {
    t.integer('hull_hp').notNullable().defaultTo(50);
    t.integer('max_hull_hp').notNullable().defaultTo(75);
  });

  // Add docked_at_outpost_id to players
  await knex.schema.alterTable('players', (t) => {
    t.uuid('docked_at_outpost_id').nullable();
  });

  // Backfill ship_types with correct hull values per type
  for (const [typeId, vals] of Object.entries(HULL_VALUES)) {
    await knex('ship_types').where({ id: typeId }).update({
      base_hull_hp: vals.base,
      max_hull_hp: vals.max,
    });
  }

  // Backfill ships with hull values based on their ship type
  for (const [typeId, vals] of Object.entries(HULL_VALUES)) {
    await knex('ships').where({ ship_type_id: typeId }).update({
      hull_hp: vals.base,
      max_hull_hp: vals.max,
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('ship_types', (t) => {
    t.dropColumn('base_hull_hp');
    t.dropColumn('max_hull_hp');
  });

  await knex.schema.alterTable('ships', (t) => {
    t.dropColumn('hull_hp');
    t.dropColumn('max_hull_hp');
  });

  await knex.schema.alterTable('players', (t) => {
    t.dropColumn('docked_at_outpost_id');
  });
}
