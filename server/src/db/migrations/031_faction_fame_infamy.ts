import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1. Add fame and infamy columns (raw SQL to avoid table-recreate on SQLite)
  await knex.raw(`ALTER TABLE player_faction_rep ADD COLUMN fame INTEGER NOT NULL DEFAULT 0`);
  await knex.raw(`ALTER TABLE player_faction_rep ADD COLUMN infamy INTEGER NOT NULL DEFAULT 0`);

  // 2. Migrate existing reputation data: positive → fame, negative → infamy
  await knex.raw(`
    UPDATE player_faction_rep
    SET fame = CASE WHEN reputation > 0 THEN reputation ELSE 0 END,
        infamy = CASE WHEN reputation < 0 THEN ABS(reputation) ELSE 0 END
  `);

  // 3. Drop old reputation column
  await knex.raw(`ALTER TABLE player_faction_rep DROP COLUMN reputation`);

  // 4. Create faction_rivalries table
  await knex.schema.createTable('faction_rivalries', (t) => {
    t.string('faction_id', 64).notNullable().references('id').inTable('factions');
    t.string('rival_faction_id', 64).notNullable().references('id').inTable('factions');
    t.float('spillover_ratio').notNullable().defaultTo(0.5);
    t.primary(['faction_id', 'rival_faction_id']);
  });

  // 5. Seed rivalry rows (bidirectional) — only if factions exist (seeds may not have run yet)
  const hasFactions = await knex('factions').first();
  if (hasFactions) {
    await knex('faction_rivalries').insert([
      { faction_id: 'traders_guild', rival_faction_id: 'shadow_syndicate', spillover_ratio: 0.5 },
      { faction_id: 'shadow_syndicate', rival_faction_id: 'traders_guild', spillover_ratio: 0.5 },
      { faction_id: 'frontier_rangers', rival_faction_id: 'shadow_syndicate', spillover_ratio: 0.5 },
      { faction_id: 'shadow_syndicate', rival_faction_id: 'frontier_rangers', spillover_ratio: 0.5 },
    ]);
  }
}

export async function down(knex: Knex): Promise<void> {
  // Drop rivalries table
  await knex.schema.dropTableIfExists('faction_rivalries');

  // Re-add reputation column
  await knex.schema.alterTable('player_faction_rep', (t) => {
    t.integer('reputation').notNullable().defaultTo(0);
  });

  // Migrate fame/infamy back to single reputation
  await knex.raw(`
    UPDATE player_faction_rep
    SET reputation = fame - infamy
  `);

  // Drop fame/infamy columns
  await knex.schema.alterTable('player_faction_rep', (t) => {
    t.dropColumn('fame');
    t.dropColumn('infamy');
  });
}
