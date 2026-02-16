import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('ship_upgrades').del();
  await knex('upgrade_types').del();

  const upgrades = [
    { id: 'weapon_mk1', name: 'Weapon Mk1', description: 'Basic weapon energy boost.', slot: 'weapon', stat_bonus: 5, diminishing_factor: 0.8, price: 3000, max_stack: 3 },
    { id: 'weapon_mk2', name: 'Weapon Mk2', description: 'Advanced weapon energy boost.', slot: 'weapon', stat_bonus: 12, diminishing_factor: 0.8, price: 8000, max_stack: 2 },
    { id: 'engine_mk1', name: 'Engine Mk1', description: 'Basic engine efficiency boost.', slot: 'engine', stat_bonus: 5, diminishing_factor: 0.8, price: 3000, max_stack: 3 },
    { id: 'engine_mk2', name: 'Engine Mk2', description: 'Advanced engine efficiency boost.', slot: 'engine', stat_bonus: 12, diminishing_factor: 0.8, price: 8000, max_stack: 2 },
    { id: 'cargo_mk1', name: 'Cargo Mk1', description: 'Basic cargo expansion module.', slot: 'cargo', stat_bonus: 10, diminishing_factor: 0.8, price: 2500, max_stack: 3 },
    { id: 'cargo_mk2', name: 'Cargo Mk2', description: 'Advanced cargo expansion module.', slot: 'cargo', stat_bonus: 25, diminishing_factor: 0.8, price: 7000, max_stack: 2 },
    { id: 'shield_mk1', name: 'Shield Mk1', description: 'Basic shield generator.', slot: 'shield', stat_bonus: 5, diminishing_factor: 0.8, price: 4000, max_stack: 3 },
    { id: 'shield_mk2', name: 'Shield Mk2', description: 'Advanced shield generator.', slot: 'shield', stat_bonus: 15, diminishing_factor: 0.8, price: 10000, max_stack: 2 },
  ];

  for (const u of upgrades) {
    await knex('upgrade_types').insert({
      ...u,
      compatible_ship_types: null,
    });
  }
}
