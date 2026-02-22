import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add faction reward fields to mission templates
  await knex.raw(`ALTER TABLE mission_templates ADD COLUMN reward_faction_id TEXT DEFAULT NULL`);
  await knex.raw(`ALTER TABLE mission_templates ADD COLUMN reward_fame INTEGER DEFAULT 0`);

  // Insert race factions — only if base factions exist (seeds may not have run yet)
  const hasFactions = await knex('factions').first();
  if (hasFactions) {
    const raceFactions = [
      { id: 'race_muscarian', name: 'Muscarian Collective', description: 'The fungal network of the Muscarian people.', alignment: 'neutral' },
      { id: 'race_vedic', name: 'Vedic Conclave', description: 'The crystalline wisdom-keepers of the Vedic race.', alignment: 'lawful' },
      { id: 'race_kalin', name: 'Kalin Dominion', description: 'The mineral-skinned warriors of the Kalin.', alignment: 'neutral' },
      { id: 'race_tarri', name: 'Tarri Freehold', description: 'The agile traders and explorers of the Tarri.', alignment: 'neutral' },
    ];

    for (const faction of raceFactions) {
      const exists = await knex('factions').where({ id: faction.id }).first();
      if (!exists) {
        await knex('factions').insert(faction);
      }
    }

    // Add race rivalries
    const rivalries = [
      { faction_id: 'race_muscarian', rival_faction_id: 'race_kalin', spillover_ratio: 0.3 },
      { faction_id: 'race_kalin', rival_faction_id: 'race_muscarian', spillover_ratio: 0.3 },
      { faction_id: 'race_vedic', rival_faction_id: 'race_tarri', spillover_ratio: 0.2 },
      { faction_id: 'race_tarri', rival_faction_id: 'race_vedic', spillover_ratio: 0.2 },
    ];

    for (const rivalry of rivalries) {
      const exists = await knex('faction_rivalries')
        .where({ faction_id: rivalry.faction_id, rival_faction_id: rivalry.rival_faction_id })
        .first();
      if (!exists) {
        await knex('faction_rivalries').insert(rivalry);
      }
    }
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex('faction_rivalries').where('faction_id', 'like', 'race_%').del();
  await knex('factions').where('id', 'like', 'race_%').del();
  await knex.raw(`ALTER TABLE mission_templates DROP COLUMN reward_faction_id`);
  await knex.raw(`ALTER TABLE mission_templates DROP COLUMN reward_fame`);
}
