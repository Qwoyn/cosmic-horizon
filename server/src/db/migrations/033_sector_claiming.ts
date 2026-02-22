import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Add sector ownership columns
  await knex.raw(`ALTER TABLE sectors ADD COLUMN sector_name TEXT DEFAULT NULL`);
  await knex.raw(`ALTER TABLE sectors ADD COLUMN is_npc_starmall INTEGER NOT NULL DEFAULT 0`);
  await knex.raw(`ALTER TABLE sectors ADD COLUMN claimed_by_player_id TEXT DEFAULT NULL REFERENCES players(id) ON DELETE SET NULL`);
  await knex.raw(`ALTER TABLE sectors ADD COLUMN claimed_by_syndicate_id TEXT DEFAULT NULL REFERENCES syndicates(id) ON DELETE SET NULL`);
  await knex.raw(`ALTER TABLE sectors ADD COLUMN claimed_at TEXT DEFAULT NULL`);

  // Mark existing star mall sectors as NPC starmalls with generated names
  const starMallSectors = await knex('sectors').where({ has_star_mall: true });
  const names = ['Nexus Station', 'Vortex Hub', 'Iron Market', 'Stellarport', 'Nova Exchange',
                 'Drift Haven', 'Quantum Bazaar', 'Void Emporium', 'Pulsar Plaza', 'Nebula Mart',
                 'Astral Depot', 'Gravity Well', 'Solar Arcade', 'Cosmic Forum', 'Rift Market',
                 'Photon Point', 'Flux Terminal', 'Warp Mart', 'Eclipse Dock', 'Zenith Hub'];
  for (let i = 0; i < starMallSectors.length; i++) {
    const name = names[i % names.length];
    await knex('sectors').where({ id: starMallSectors[i].id }).update({
      is_npc_starmall: 1,
      sector_name: name,
    });
  }
}

export async function down(knex: Knex): Promise<void> {
  // SQLite doesn't support DROP COLUMN in older versions, but knex handles it
  await knex.raw(`ALTER TABLE sectors DROP COLUMN sector_name`);
  await knex.raw(`ALTER TABLE sectors DROP COLUMN is_npc_starmall`);
  await knex.raw(`ALTER TABLE sectors DROP COLUMN claimed_by_player_id`);
  await knex.raw(`ALTER TABLE sectors DROP COLUMN claimed_by_syndicate_id`);
  await knex.raw(`ALTER TABLE sectors DROP COLUMN claimed_at`);
}
