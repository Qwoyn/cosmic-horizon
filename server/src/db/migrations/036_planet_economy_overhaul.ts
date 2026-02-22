import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1. Create planet_colonists table (per-race colonist tracking)
  await knex.schema.createTable('planet_colonists', (table) => {
    table.text('id').primary();
    table.text('planet_id').notNullable().references('id').inTable('planets').onDelete('CASCADE');
    table.text('race').notNullable();
    table.integer('count').notNullable().defaultTo(0);
    table.unique(['planet_id', 'race']);
    table.index('planet_id');
  });

  // 2. Create ship_colonists table (per-race ship cargo)
  await knex.schema.createTable('ship_colonists', (table) => {
    table.text('id').primary();
    table.text('ship_id').notNullable().references('id').inTable('ships').onDelete('CASCADE');
    table.text('race').notNullable();
    table.integer('count').notNullable().defaultTo(0);
    table.unique(['ship_id', 'race']);
    table.index('ship_id');
  });

  // 3. Create planet_production_history table (analytics time-series)
  await knex.schema.createTable('planet_production_history', (table) => {
    table.text('id').primary();
    table.text('planet_id').notNullable().references('id').inTable('planets').onDelete('CASCADE');
    table.text('tick_at').notNullable().defaultTo(knex.fn.now());
    table.integer('cyrillium_produced').defaultTo(0);
    table.integer('tech_produced').defaultTo(0);
    table.float('drones_produced').defaultTo(0);
    table.integer('food_consumed').defaultTo(0);
    table.integer('colonist_count').defaultTo(0);
    table.float('happiness').defaultTo(50);
    table.index(['planet_id', 'tick_at']);
  });

  // 4. Add happiness column to planets
  await knex.raw(`ALTER TABLE planets ADD COLUMN happiness REAL NOT NULL DEFAULT 50.0`);

  // 5. Data migration: populate planet_colonists from existing planet data
  const planetsWithColonists = await knex('planets')
    .where('colonists', '>', 0)
    .whereNotNull('owner_id')
    .select('id', 'owner_id', 'colonists');

  for (const planet of planetsWithColonists) {
    const owner = await knex('players').where({ id: planet.owner_id }).select('race').first();
    if (owner?.race) {
      await knex('planet_colonists').insert({
        id: knex.raw(`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))`),
        planet_id: planet.id,
        race: owner.race,
        count: planet.colonists,
      });
    }
  }

  // 6. Data migration: populate ship_colonists from existing ship data
  const shipsWithColonists = await knex('ships')
    .where('colonist_cargo', '>', 0)
    .select('id', 'colonist_cargo');

  for (const ship of shipsWithColonists) {
    // Find the owner of this ship
    const owner = await knex('players').where({ current_ship_id: ship.id }).select('race').first();
    if (owner?.race) {
      await knex('ship_colonists').insert({
        id: knex.raw(`(lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' || substr(lower(hex(randomblob(2))),2) || '-' || substr('89ab',abs(random()) % 4 + 1, 1) || substr(lower(hex(randomblob(2))),2) || '-' || lower(hex(randomblob(6))))`),
        ship_id: ship.id,
        race: owner.race,
        count: ship.colonist_cargo,
      });
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('planet_production_history');
  await knex.schema.dropTableIfExists('ship_colonists');
  await knex.schema.dropTableIfExists('planet_colonists');

  // SQLite doesn't support DROP COLUMN easily, but Knex handles it
  try {
    await knex.schema.alterTable('planets', (table) => {
      table.dropColumn('happiness');
    });
  } catch { /* column may not exist */ }
}
