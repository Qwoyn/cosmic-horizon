import crypto from 'crypto';
import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  const resourceId = 'drift_fuel';
  const recipeId = 'recipe_drift_fuel';

  // Upsert resource definition
  const existingResource = await knex('resource_definitions').where({ id: resourceId }).first();
  if (!existingResource) {
    await knex('resource_definitions').insert({
      id: resourceId,
      name: 'Drift Fuel',
      description: 'Refined propellant synthesized from cyrillium and tech components. Powers caravan protection fields during trade route transit.',
      tier: 2,
      category: 'processed',
      base_value: 75,
    });
  }

  // Upsert recipe
  const existingRecipe = await knex('recipes').where({ id: recipeId }).first();
  if (!existingRecipe) {
    await knex('recipes').insert({
      id: recipeId,
      name: 'Drift Fuel',
      description: 'Synthesize Drift Fuel from cyrillium and tech components.',
      output_resource_id: resourceId,
      output_item_type: 'resource',
      output_quantity: 2,
      craft_time_minutes: 15,
      credits_cost: 100,
      tier: 2,
      planet_level_required: 1,
    });

    // Ingredients: 5 cyrillium + 2 tech
    await knex('recipe_ingredients').insert([
      { id: crypto.randomUUID(), recipe_id: recipeId, resource_id: 'cyrillium', quantity: 5 },
      { id: crypto.randomUUID(), recipe_id: recipeId, resource_id: 'tech', quantity: 2 },
    ]);
  }
}
