import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  await knex('mega_project_definitions').del();

  console.log('Seeding mega project definitions...');

  const definitions = [
    {
      id: 'space_station',
      name: 'Space Station',
      description: 'A massive orbital platform that serves as a hub for trade and diplomacy.',
      credits_cost: 500000,
      build_time_hours: 72,
      structure_type: 'space_station',
      resource_requirements: JSON.stringify([
        { resourceId: 'hardened_core', quantity: 50 },
        { resourceId: 'quantum_coolant', quantity: 30 },
        { resourceId: 'star_alloy', quantity: 20 },
        { resourceId: 'nano_weave', quantity: 40 },
      ]),
      min_syndicate_members: 3,
    },
    {
      id: 'warp_network_hub',
      name: 'Warp Network Hub',
      description: 'An advanced warp relay that links distant sectors together.',
      credits_cost: 750000,
      build_time_hours: 96,
      structure_type: 'warp_network_hub',
      resource_requirements: JSON.stringify([
        { resourceId: 'void_catalyst', quantity: 50 },
        { resourceId: 'quantum_coolant', quantity: 50 },
        { resourceId: 'dark_matter_shard', quantity: 5 },
        { resourceId: 'ion_crystal', quantity: 5 },
      ]),
      min_syndicate_members: 4,
    },
    {
      id: 'mega_weapon_platform',
      name: 'Mega Weapon Platform',
      description: 'A fearsome orbital weapons platform capable of defending an entire sector.',
      credits_cost: 1000000,
      build_time_hours: 120,
      structure_type: 'mega_weapon_platform',
      resource_requirements: JSON.stringify([
        { resourceId: 'hardened_core', quantity: 100 },
        { resourceId: 'star_alloy', quantity: 80 },
        { resourceId: 'void_catalyst', quantity: 30 },
        { resourceId: 'dark_matter_shard', quantity: 10 },
        { resourceId: 'harmonic_resonator', quantity: 5 },
      ]),
      min_syndicate_members: 5,
    },
    {
      id: 'colony_ship',
      name: 'Colony Ship',
      description: 'A colossal vessel designed to transport thousands of colonists to new worlds.',
      credits_cost: 600000,
      build_time_hours: 48,
      structure_type: 'colony_ship',
      resource_requirements: JSON.stringify([
        { resourceId: 'nano_weave', quantity: 60 },
        { resourceId: 'stim_compound', quantity: 40 },
        { resourceId: 'hardened_core', quantity: 30 },
        { resourceId: 'leviathan_pearl', quantity: 3 },
      ]),
      min_syndicate_members: 3,
    },
    {
      id: 'research_lab',
      name: 'Research Lab',
      description: 'An advanced orbital laboratory for cutting-edge research and development.',
      credits_cost: 400000,
      build_time_hours: 48,
      structure_type: 'research_lab',
      resource_requirements: JSON.stringify([
        { resourceId: 'quantum_coolant', quantity: 40 },
        { resourceId: 'nano_weave', quantity: 30 },
        { resourceId: 'cryo_fossil', quantity: 3 },
        { resourceId: 'artifact_fragment', quantity: 3 },
      ]),
      min_syndicate_members: 2,
    },
  ];

  for (const def of definitions) {
    await knex('mega_project_definitions').insert(def);
  }

  console.log(`  ${definitions.length} mega project definitions seeded`);
}
