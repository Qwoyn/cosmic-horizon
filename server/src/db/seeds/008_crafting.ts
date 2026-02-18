import { Knex } from 'knex';
import crypto from 'crypto';

export async function seed(knex: Knex): Promise<void> {
  // Clear existing crafting data
  await knex('planet_refinery_queue').del();
  await knex('player_resources').del();
  await knex('planet_resources').del();
  await knex('recipe_ingredients').del();
  await knex('recipes').del();
  await knex('resource_definitions').del();

  console.log('Seeding resource definitions...');

  // === TIER 1 — RAW RESOURCES ===

  // Base commodities (references for recipes)
  const baseResources = [
    { id: 'cyrillium', name: 'Cyrillium', description: 'Common metallic ore used in construction', tier: 1, category: 'base', planet_class: null, base_value: 10 },
    { id: 'food', name: 'Food', description: 'Organic sustenance for colonists', tier: 1, category: 'base', planet_class: null, base_value: 25 },
    { id: 'tech', name: 'Tech Components', description: 'Electronic and mechanical parts', tier: 1, category: 'base', planet_class: null, base_value: 50 },
  ];

  // Planet-unique resources (16 total, 2 per class)
  const uniqueResources = [
    { id: 'bio_fiber', name: 'Bio-Fiber', description: 'Organic fibers from hospitable worlds', tier: 1, category: 'planet_unique', planet_class: 'H', base_value: 15 },
    { id: 'fertile_soil', name: 'Fertile Soil', description: 'Nutrient-rich soil from hospitable worlds', tier: 1, category: 'planet_unique', planet_class: 'H', base_value: 12 },
    { id: 'silica_glass', name: 'Silica Glass', description: 'Heat-forged glass from desert worlds', tier: 1, category: 'planet_unique', planet_class: 'D', base_value: 20 },
    { id: 'solar_crystal', name: 'Solar Crystal', description: 'Light-storing crystals from desert worlds', tier: 1, category: 'planet_unique', planet_class: 'D', base_value: 18 },
    { id: 'bio_extract', name: 'Bio-Extract', description: 'Concentrated biological compounds from ocean worlds', tier: 1, category: 'planet_unique', planet_class: 'O', base_value: 15 },
    { id: 'coral_alloy', name: 'Coral Alloy', description: 'Hardened coral composite from ocean worlds', tier: 1, category: 'planet_unique', planet_class: 'O', base_value: 14 },
    { id: 'resonite_ore', name: 'Resonite Ore', description: 'Vibration-conducting ore from alpine worlds', tier: 1, category: 'planet_unique', planet_class: 'A', base_value: 16 },
    { id: 'wind_essence', name: 'Wind Essence', description: 'Compressed atmospheric gases from alpine worlds', tier: 1, category: 'planet_unique', planet_class: 'A', base_value: 13 },
    { id: 'cryo_compound', name: 'Cryogenic Compound', description: 'Sub-zero stable compounds from frozen worlds', tier: 1, category: 'planet_unique', planet_class: 'F', base_value: 22 },
    { id: 'frost_lattice', name: 'Frost Lattice', description: 'Crystalline ice structures from frozen worlds', tier: 1, category: 'planet_unique', planet_class: 'F', base_value: 18 },
    { id: 'magma_crystal', name: 'Magma Crystal', description: 'Pressure-formed crystals from volcanic worlds', tier: 1, category: 'planet_unique', planet_class: 'V', base_value: 28 },
    { id: 'obsidian_plate', name: 'Obsidian Plate', description: 'Volcanic glass plates from volcanic worlds', tier: 1, category: 'planet_unique', planet_class: 'V', base_value: 22 },
    { id: 'plasma_vapor', name: 'Plasma Vapor', description: 'Ionized gas harvested from gas giants', tier: 1, category: 'planet_unique', planet_class: 'G', base_value: 35 },
    { id: 'nebula_dust', name: 'Nebula Dust', description: 'Exotic particles from gas giant atmospheres', tier: 1, category: 'planet_unique', planet_class: 'G', base_value: 30 },
    { id: 'genome_fragment', name: 'Genome Fragment', description: 'Genetic material from seed worlds', tier: 1, category: 'planet_unique', planet_class: 'S', base_value: 40 },
    { id: 'spore_culture', name: 'Spore Culture', description: 'Self-replicating spore colonies from seed worlds', tier: 1, category: 'planet_unique', planet_class: 'S', base_value: 35 },
  ];

  // === TIER 2 — PROCESSED ===
  const processedResources = [
    { id: 'refined_cyrillium', name: 'Refined Cyrillium', description: 'Purified cyrillium alloy', tier: 2, category: 'processed', planet_class: null, base_value: 120 },
    { id: 'nutrient_paste', name: 'Nutrient Paste', description: 'Concentrated nutrition supplement', tier: 2, category: 'processed', planet_class: null, base_value: 100 },
    { id: 'molten_alloy', name: 'Molten Alloy', description: 'Heat-resistant metal composite', tier: 2, category: 'processed', planet_class: null, base_value: 180 },
    { id: 'crystal_matrix', name: 'Crystal Matrix', description: 'Aligned crystal lattice structure', tier: 2, category: 'processed', planet_class: null, base_value: 160 },
    { id: 'bio_gel', name: 'Bio-Gel', description: 'Bioactive healing compound', tier: 2, category: 'processed', planet_class: null, base_value: 110 },
    { id: 'resonite_plate', name: 'Resonite Plate', description: 'Vibration-dampening armor plate', tier: 2, category: 'processed', planet_class: null, base_value: 150 },
    { id: 'plasma_cell', name: 'Plasma Cell', description: 'Contained plasma energy cell', tier: 2, category: 'processed', planet_class: null, base_value: 170 },
    { id: 'synth_fiber', name: 'Synth-Fiber', description: 'Synthetic reinforced fiber weave', tier: 2, category: 'processed', planet_class: null, base_value: 130 },
  ];

  // === TIER 3 — REFINED ===
  const refinedResources = [
    { id: 'hardened_core', name: 'Hardened Core', description: 'Ultra-dense structural core', tier: 3, category: 'refined', planet_class: null, base_value: 800 },
    { id: 'quantum_coolant', name: 'Quantum Coolant', description: 'Quantum-state cooling fluid', tier: 3, category: 'refined', planet_class: null, base_value: 900 },
    { id: 'stim_compound', name: 'Stim Compound', description: 'Advanced stimulant compound', tier: 3, category: 'refined', planet_class: null, base_value: 600 },
    { id: 'nano_weave', name: 'Nano-Weave', description: 'Nanotechnology-infused fabric', tier: 3, category: 'refined', planet_class: null, base_value: 750 },
    { id: 'void_catalyst', name: 'Void Catalyst', description: 'Exotic matter catalyst', tier: 3, category: 'refined', planet_class: null, base_value: 1200 },
    { id: 'star_alloy', name: 'Star Alloy', description: 'Stellar-forged super-alloy', tier: 3, category: 'refined', planet_class: null, base_value: 1500 },
  ];

  // Trade good outputs
  const tradeGoodResources = [
    { id: 'refined_cyrillium_core', name: 'Refined Cyrillium Core', description: 'High-value refined cyrillium trade good', tier: 3, category: 'refined', planet_class: null, base_value: 5000 },
    { id: 'synthetic_food_crate', name: 'Synthetic Food Crate', description: 'Premium synthesized food trade good', tier: 3, category: 'refined', planet_class: null, base_value: 3000 },
    { id: 'advanced_tech_module', name: 'Advanced Tech Module', description: 'Advanced technology trade good', tier: 3, category: 'refined', planet_class: null, base_value: 8000 },
  ];

  const allResources = [...baseResources, ...uniqueResources, ...processedResources, ...refinedResources, ...tradeGoodResources];
  for (const res of allResources) {
    await knex('resource_definitions').insert(res);
  }
  console.log(`  ${allResources.length} resource definitions seeded`);

  // === RECIPES ===
  console.log('Seeding recipes...');

  // --- Tier 2: Processed (timed, planet_level_required=1) ---
  const tier2Recipes = [
    { id: 'recipe_refined_cyrillium', name: 'Refined Cyrillium', output_resource_id: 'refined_cyrillium', output_item_type: 'resource', tier: 2, craft_time_minutes: 30, planet_level_required: 1, credits_cost: 0,
      ingredients: [{ resource_id: 'cyrillium', quantity: 10 }] },
    { id: 'recipe_nutrient_paste', name: 'Nutrient Paste', output_resource_id: 'nutrient_paste', output_item_type: 'resource', tier: 2, craft_time_minutes: 20, planet_level_required: 1, credits_cost: 0,
      ingredients: [{ resource_id: 'bio_fiber', quantity: 5 }, { resource_id: 'food', quantity: 5 }] },
    { id: 'recipe_molten_alloy', name: 'Molten Alloy', output_resource_id: 'molten_alloy', output_item_type: 'resource', tier: 2, craft_time_minutes: 45, planet_level_required: 1, credits_cost: 0,
      ingredients: [{ resource_id: 'magma_crystal', quantity: 5 }, { resource_id: 'cyrillium', quantity: 5 }] },
    { id: 'recipe_crystal_matrix', name: 'Crystal Matrix', output_resource_id: 'crystal_matrix', output_item_type: 'resource', tier: 2, craft_time_minutes: 40, planet_level_required: 1, credits_cost: 0,
      ingredients: [{ resource_id: 'solar_crystal', quantity: 5 }, { resource_id: 'frost_lattice', quantity: 5 }] },
    { id: 'recipe_bio_gel', name: 'Bio-Gel', output_resource_id: 'bio_gel', output_item_type: 'resource', tier: 2, craft_time_minutes: 25, planet_level_required: 1, credits_cost: 0,
      ingredients: [{ resource_id: 'bio_extract', quantity: 5 }, { resource_id: 'spore_culture', quantity: 5 }] },
    { id: 'recipe_resonite_plate', name: 'Resonite Plate', output_resource_id: 'resonite_plate', output_item_type: 'resource', tier: 2, craft_time_minutes: 35, planet_level_required: 1, credits_cost: 0,
      ingredients: [{ resource_id: 'resonite_ore', quantity: 8 }, { resource_id: 'obsidian_plate', quantity: 3 }] },
    { id: 'recipe_plasma_cell', name: 'Plasma Cell', output_resource_id: 'plasma_cell', output_item_type: 'resource', tier: 2, craft_time_minutes: 30, planet_level_required: 1, credits_cost: 0,
      ingredients: [{ resource_id: 'plasma_vapor', quantity: 8 }, { resource_id: 'tech', quantity: 3 }] },
    { id: 'recipe_synth_fiber', name: 'Synth-Fiber', output_resource_id: 'synth_fiber', output_item_type: 'resource', tier: 2, craft_time_minutes: 30, planet_level_required: 1, credits_cost: 0,
      ingredients: [{ resource_id: 'bio_fiber', quantity: 5 }, { resource_id: 'coral_alloy', quantity: 5 }] },
  ];

  // --- Tier 3: Refined (timed, planet_level_required=3) ---
  const tier3Recipes = [
    { id: 'recipe_hardened_core', name: 'Hardened Core', output_resource_id: 'hardened_core', output_item_type: 'resource', tier: 3, craft_time_minutes: 120, planet_level_required: 3, credits_cost: 0,
      ingredients: [{ resource_id: 'refined_cyrillium', quantity: 3 }, { resource_id: 'molten_alloy', quantity: 3 }] },
    { id: 'recipe_quantum_coolant', name: 'Quantum Coolant', output_resource_id: 'quantum_coolant', output_item_type: 'resource', tier: 3, craft_time_minutes: 150, planet_level_required: 3, credits_cost: 0,
      ingredients: [{ resource_id: 'crystal_matrix', quantity: 3 }, { resource_id: 'plasma_cell', quantity: 3 }] },
    { id: 'recipe_stim_compound', name: 'Stim Compound', output_resource_id: 'stim_compound', output_item_type: 'resource', tier: 3, craft_time_minutes: 90, planet_level_required: 3, credits_cost: 0,
      ingredients: [{ resource_id: 'nutrient_paste', quantity: 3 }, { resource_id: 'bio_gel', quantity: 3 }] },
    { id: 'recipe_nano_weave', name: 'Nano-Weave', output_resource_id: 'nano_weave', output_item_type: 'resource', tier: 3, craft_time_minutes: 120, planet_level_required: 3, credits_cost: 0,
      ingredients: [{ resource_id: 'synth_fiber', quantity: 3 }, { resource_id: 'resonite_plate', quantity: 3 }] },
    { id: 'recipe_void_catalyst', name: 'Void Catalyst', output_resource_id: 'void_catalyst', output_item_type: 'resource', tier: 3, craft_time_minutes: 180, planet_level_required: 3, credits_cost: 0,
      ingredients: [{ resource_id: 'plasma_cell', quantity: 2 }, { resource_id: 'crystal_matrix', quantity: 2 }, { resource_id: 'bio_gel', quantity: 2 }] },
    { id: 'recipe_star_alloy', name: 'Star Alloy', output_resource_id: 'star_alloy', output_item_type: 'resource', tier: 3, craft_time_minutes: 180, planet_level_required: 3, credits_cost: 0,
      ingredients: [{ resource_id: 'hardened_core', quantity: 2 }, { resource_id: 'molten_alloy', quantity: 2 }, { resource_id: 'refined_cyrillium', quantity: 3 }] },
  ];

  // --- Tier 4: Assembled (instant, planet_level_required=5) ---

  // Ship Upgrades
  const upgradeRecipes = [
    { id: 'recipe_weapon_mk3', name: 'Weapon MK3', output_item_type: 'upgrade', output_item_id: 'weapon_mk3', tier: 4, craft_time_minutes: 0, planet_level_required: 5, credits_cost: 5000,
      ingredients: [{ resource_id: 'hardened_core', quantity: 2 }, { resource_id: 'quantum_coolant', quantity: 1 }] },
    { id: 'recipe_engine_mk3', name: 'Engine MK3', output_item_type: 'upgrade', output_item_id: 'engine_mk3', tier: 4, craft_time_minutes: 0, planet_level_required: 5, credits_cost: 5000,
      ingredients: [{ resource_id: 'quantum_coolant', quantity: 2 }, { resource_id: 'nano_weave', quantity: 1 }] },
    { id: 'recipe_cargo_mk3', name: 'Cargo MK3', output_item_type: 'upgrade', output_item_id: 'cargo_mk3', tier: 4, craft_time_minutes: 0, planet_level_required: 5, credits_cost: 5000,
      ingredients: [{ resource_id: 'nano_weave', quantity: 2 }, { resource_id: 'hardened_core', quantity: 1 }] },
    { id: 'recipe_shield_mk3', name: 'Shield MK3', output_item_type: 'upgrade', output_item_id: 'shield_mk3', tier: 4, craft_time_minutes: 0, planet_level_required: 5, credits_cost: 5000,
      ingredients: [{ resource_id: 'star_alloy', quantity: 2 }, { resource_id: 'quantum_coolant', quantity: 1 }] },
    { id: 'recipe_weapon_mk4', name: 'Weapon MK4', output_item_type: 'upgrade', output_item_id: 'weapon_mk4', tier: 4, craft_time_minutes: 0, planet_level_required: 5, credits_cost: 10000,
      ingredients: [{ resource_id: 'hardened_core', quantity: 3 }, { resource_id: 'void_catalyst', quantity: 2 }] },
    { id: 'recipe_shield_mk4', name: 'Shield MK4', output_item_type: 'upgrade', output_item_id: 'shield_mk4', tier: 4, craft_time_minutes: 0, planet_level_required: 5, credits_cost: 10000,
      ingredients: [{ resource_id: 'star_alloy', quantity: 3 }, { resource_id: 'void_catalyst', quantity: 2 }] },
  ];

  // Consumables
  const consumableRecipes = [
    { id: 'recipe_healing_stim', name: 'Healing Stim', output_item_type: 'consumable', output_item_id: 'healing_stim', tier: 4, craft_time_minutes: 0, planet_level_required: 5, credits_cost: 1000,
      ingredients: [{ resource_id: 'stim_compound', quantity: 2 }] },
    { id: 'recipe_repair_kit', name: 'Repair Kit', output_item_type: 'consumable', output_item_id: 'repair_kit', tier: 4, craft_time_minutes: 0, planet_level_required: 5, credits_cost: 2000,
      ingredients: [{ resource_id: 'hardened_core', quantity: 1 }, { resource_id: 'nano_weave', quantity: 1 }] },
    { id: 'recipe_scanner_booster', name: 'Scanner Booster', output_item_type: 'consumable', output_item_id: 'scanner_booster', tier: 4, craft_time_minutes: 0, planet_level_required: 5, credits_cost: 1500,
      ingredients: [{ resource_id: 'quantum_coolant', quantity: 1 }, { resource_id: 'plasma_cell', quantity: 1 }] },
    { id: 'recipe_fuel_cell', name: 'Fuel Cell', output_item_type: 'consumable', output_item_id: 'fuel_cell', tier: 4, craft_time_minutes: 0, planet_level_required: 5, credits_cost: 500,
      ingredients: [{ resource_id: 'plasma_cell', quantity: 2 }] },
    { id: 'recipe_warp_coil', name: 'Warp Coil', output_item_type: 'consumable', output_item_id: 'warp_coil', tier: 4, craft_time_minutes: 0, planet_level_required: 5, credits_cost: 5000,
      ingredients: [{ resource_id: 'void_catalyst', quantity: 2 }, { resource_id: 'quantum_coolant', quantity: 1 }] },
  ];

  // Tablet recipes
  const tabletRecipes = [
    { id: 'recipe_tablet_common_1', name: 'Forge Common Tablet (Bio)', output_item_type: 'tablet', output_item_id: 'random_common', tier: 4, craft_time_minutes: 0, planet_level_required: 5, credits_cost: 500,
      ingredients: [{ resource_id: 'nutrient_paste', quantity: 1 }] },
    { id: 'recipe_tablet_common_2', name: 'Forge Common Tablet (Crystal)', output_item_type: 'tablet', output_item_id: 'random_common', tier: 4, craft_time_minutes: 0, planet_level_required: 5, credits_cost: 500,
      ingredients: [{ resource_id: 'crystal_matrix', quantity: 1 }] },
    { id: 'recipe_tablet_uncommon_1', name: 'Forge Uncommon Tablet (Alloy)', output_item_type: 'tablet', output_item_id: 'random_uncommon', tier: 4, craft_time_minutes: 0, planet_level_required: 5, credits_cost: 1500,
      ingredients: [{ resource_id: 'molten_alloy', quantity: 2 }] },
    { id: 'recipe_tablet_uncommon_2', name: 'Forge Uncommon Tablet (Plasma)', output_item_type: 'tablet', output_item_id: 'random_uncommon', tier: 4, craft_time_minutes: 0, planet_level_required: 5, credits_cost: 1500,
      ingredients: [{ resource_id: 'plasma_cell', quantity: 2 }] },
    { id: 'recipe_tablet_rare', name: 'Forge Rare Tablet', output_item_type: 'tablet', output_item_id: 'random_rare', tier: 4, craft_time_minutes: 0, planet_level_required: 5, credits_cost: 5000,
      ingredients: [{ resource_id: 'nano_weave', quantity: 2 }] },
    { id: 'recipe_tablet_epic', name: 'Forge Epic Tablet', output_item_type: 'tablet', output_item_id: 'random_epic', tier: 4, craft_time_minutes: 0, planet_level_required: 5, credits_cost: 15000,
      ingredients: [{ resource_id: 'hardened_core', quantity: 1 }, { resource_id: 'quantum_coolant', quantity: 1 }, { resource_id: 'void_catalyst', quantity: 1 }] },
  ];

  // Trade goods
  const tradeGoodRecipes = [
    { id: 'recipe_refined_cyrillium_core', name: 'Refined Cyrillium Core', output_resource_id: 'refined_cyrillium_core', output_item_type: 'resource', tier: 4, craft_time_minutes: 0, planet_level_required: 5, credits_cost: 0,
      ingredients: [{ resource_id: 'refined_cyrillium', quantity: 5 }] },
    { id: 'recipe_synthetic_food_crate', name: 'Synthetic Food Crate', output_resource_id: 'synthetic_food_crate', output_item_type: 'resource', tier: 4, craft_time_minutes: 0, planet_level_required: 5, credits_cost: 0,
      ingredients: [{ resource_id: 'nutrient_paste', quantity: 3 }, { resource_id: 'bio_gel', quantity: 2 }] },
    { id: 'recipe_advanced_tech_module', name: 'Advanced Tech Module', output_resource_id: 'advanced_tech_module', output_item_type: 'resource', tier: 4, craft_time_minutes: 0, planet_level_required: 5, credits_cost: 0,
      ingredients: [{ resource_id: 'quantum_coolant', quantity: 2 }, { resource_id: 'plasma_cell', quantity: 2 }] },
  ];

  const allRecipes = [...tier2Recipes, ...tier3Recipes, ...upgradeRecipes, ...consumableRecipes, ...tabletRecipes, ...tradeGoodRecipes];

  for (const recipe of allRecipes) {
    const { ingredients, ...recipeData } = recipe;
    await knex('recipes').insert({
      ...recipeData,
      output_resource_id: (recipeData as any).output_resource_id || null,
      output_item_id: (recipeData as any).output_item_id || null,
      output_quantity: 1,
    });

    for (const ing of ingredients) {
      await knex('recipe_ingredients').insert({
        id: crypto.randomUUID(),
        recipe_id: recipe.id,
        resource_id: ing.resource_id,
        quantity: ing.quantity,
      });
    }
  }

  console.log(`  ${allRecipes.length} recipes seeded`);

  // === NEW UPGRADE TYPES (MK3/MK4) ===
  console.log('Seeding MK3/MK4 upgrade types...');
  const newUpgradeTypes = [
    { id: 'weapon_mk3', name: 'Weapon Array MK3', description: 'Advanced crafted weapon system', stat: 'weapon', bonus: 8, price: 0, level_required: 0 },
    { id: 'engine_mk3', name: 'Engine Core MK3', description: 'Advanced crafted engine system', stat: 'engine', bonus: 8, price: 0, level_required: 0 },
    { id: 'cargo_mk3', name: 'Cargo Bay MK3', description: 'Advanced crafted cargo expansion', stat: 'cargo', bonus: 15, price: 0, level_required: 0 },
    { id: 'shield_mk3', name: 'Shield Generator MK3', description: 'Advanced crafted shield system', stat: 'shield', bonus: 12, price: 0, level_required: 0 },
    { id: 'weapon_mk4', name: 'Weapon Array MK4', description: 'Elite crafted weapon system', stat: 'weapon', bonus: 12, price: 0, level_required: 0 },
    { id: 'shield_mk4', name: 'Shield Generator MK4', description: 'Elite crafted shield system', stat: 'shield', bonus: 18, price: 0, level_required: 0 },
  ];

  for (const ut of newUpgradeTypes) {
    // Check if upgrade_types table exists and insert
    try {
      const exists = await knex('upgrade_types').where({ id: ut.id }).first();
      if (!exists) {
        await knex('upgrade_types').insert(ut);
      }
    } catch { /* upgrade_types table may not exist */ }
  }

  console.log('Crafting seed complete!');
}
