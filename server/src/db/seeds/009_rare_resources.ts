import { Knex } from 'knex';
import { GAME_CONFIG } from '../../config/game';

const ULTRA_RARE_RESOURCES = [
  { id: 'dark_matter_shard', name: 'Dark Matter Shard', tier: 5, category: 'ultra_rare', planet_class: 'V', base_value: 25000, description: 'A fragment of condensed dark matter from volcanic depths' },
  { id: 'cryo_fossil', name: 'Cryo-Fossil', tier: 5, category: 'ultra_rare', planet_class: 'F', base_value: 25000, description: 'An ancient organism preserved in perpetual ice' },
  { id: 'ion_crystal', name: 'Ion Crystal', tier: 5, category: 'ultra_rare', planet_class: 'G', base_value: 20000, description: 'A crystallized ionic structure formed within gas giant storms' },
  { id: 'leviathan_pearl', name: 'Leviathan Pearl', tier: 5, category: 'ultra_rare', planet_class: 'O', base_value: 25000, description: 'A luminescent pearl from the deepest ocean trenches' },
  { id: 'artifact_fragment', name: 'Artifact Fragment', tier: 5, category: 'ultra_rare', planet_class: 'D', base_value: 20000, description: 'A piece of technology from a long-lost desert civilization' },
  { id: 'harmonic_resonator', name: 'Harmonic Resonator', tier: 5, category: 'ultra_rare', planet_class: 'A', base_value: 25000, description: 'A naturally-formed resonance crystal from alpine peaks' },
];

const VARIANT_MAP: Record<string, { variantId: string; rareResourceId: string }> = {
  V: { variantId: 'prime', rareResourceId: 'dark_matter_shard' },
  F: { variantId: 'ancient', rareResourceId: 'cryo_fossil' },
  G: { variantId: 'storm', rareResourceId: 'ion_crystal' },
  O: { variantId: 'abyssal', rareResourceId: 'leviathan_pearl' },
  D: { variantId: 'ruin', rareResourceId: 'artifact_fragment' },
  A: { variantId: 'crystal', rareResourceId: 'harmonic_resonator' },
};

export async function seed(knex: Knex): Promise<void> {
  // 1. Insert ultra-rare resource definitions
  for (const res of ULTRA_RARE_RESOURCES) {
    const exists = await knex('resource_definitions').where({ id: res.id }).first();
    if (!exists) {
      await knex('resource_definitions').insert(res);
    }
  }
  console.log(`Seeded ${ULTRA_RARE_RESOURCES.length} ultra-rare resource definitions`);

  // 2. Tag existing planets as rare variants (1.5% chance)
  const eligibleClasses = Object.keys(VARIANT_MAP);
  const planets = await knex('planets').whereIn('planet_class', eligibleClasses);

  let variantCount = 0;
  for (const planet of planets) {
    if (Math.random() < GAME_CONFIG.RARE_PLANET_VARIANT_CHANCE) {
      const mapping = VARIANT_MAP[planet.planet_class];
      await knex('planets').where({ id: planet.id }).update({
        variant: mapping.variantId,
        rare_resource: mapping.rareResourceId,
      });
      variantCount++;
    }
  }
  console.log(`Tagged ${variantCount} / ${planets.length} eligible planets as rare variants (~${((variantCount / planets.length) * 100).toFixed(1)}%)`);
}
