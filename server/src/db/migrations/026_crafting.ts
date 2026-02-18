import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1. Resource definitions
  await knex.schema.createTable('resource_definitions', (t) => {
    t.string('id', 64).primary();
    t.string('name', 128).notNullable();
    t.text('description');
    t.integer('tier').notNullable(); // 1=raw, 2=processed, 3=refined
    t.string('category', 32).notNullable(); // 'base','planet_unique','processed','refined'
    t.string('planet_class', 4).nullable();
    t.integer('base_value').notNullable().defaultTo(0);
  });

  // 2. Recipes
  await knex.schema.createTable('recipes', (t) => {
    t.string('id', 64).primary();
    t.string('name', 128).notNullable();
    t.text('description');
    t.string('output_resource_id', 64).nullable()
      .references('id').inTable('resource_definitions');
    t.string('output_item_type', 32).nullable(); // 'resource','tablet','upgrade','consumable'
    t.string('output_item_id', 64).nullable();
    t.integer('output_quantity').notNullable().defaultTo(1);
    t.integer('tier').notNullable(); // 2, 3, or 4
    t.integer('craft_time_minutes').notNullable().defaultTo(0);
    t.integer('planet_level_required').notNullable().defaultTo(1);
    t.integer('credits_cost').notNullable().defaultTo(0);
  });

  // 3. Recipe ingredients
  await knex.schema.createTable('recipe_ingredients', (t) => {
    t.uuid('id').primary();
    t.string('recipe_id', 64).notNullable()
      .references('id').inTable('recipes').onDelete('CASCADE');
    t.string('resource_id', 64).notNullable()
      .references('id').inTable('resource_definitions');
    t.integer('quantity').notNullable();
  });

  // 4. Planet resources (unique resources stored on planets)
  await knex.schema.createTable('planet_resources', (t) => {
    t.uuid('planet_id').notNullable()
      .references('id').inTable('planets').onDelete('CASCADE');
    t.string('resource_id', 64).notNullable()
      .references('id').inTable('resource_definitions');
    t.integer('stock').notNullable().defaultTo(0);
    t.primary(['planet_id', 'resource_id']);
  });

  // 5. Planet refinery queue
  await knex.schema.createTable('planet_refinery_queue', (t) => {
    t.uuid('id').primary();
    t.uuid('planet_id').notNullable()
      .references('id').inTable('planets').onDelete('CASCADE');
    t.string('recipe_id', 64).notNullable()
      .references('id').inTable('recipes');
    t.uuid('player_id').notNullable()
      .references('id').inTable('players').onDelete('CASCADE');
    t.timestamp('started_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('completes_at').notNullable();
    t.integer('batch_size').notNullable().defaultTo(1);
    t.boolean('collected').notNullable().defaultTo(false);
    t.index(['planet_id']);
  });

  // 6. Player resources (personal resource inventory)
  await knex.schema.createTable('player_resources', (t) => {
    t.uuid('player_id').notNullable()
      .references('id').inTable('players').onDelete('CASCADE');
    t.string('resource_id', 64).notNullable()
      .references('id').inTable('resource_definitions');
    t.integer('quantity').notNullable().defaultTo(0);
    t.primary(['player_id', 'resource_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('player_resources');
  await knex.schema.dropTableIfExists('planet_refinery_queue');
  await knex.schema.dropTableIfExists('planet_resources');
  await knex.schema.dropTableIfExists('recipe_ingredients');
  await knex.schema.dropTableIfExists('recipes');
  await knex.schema.dropTableIfExists('resource_definitions');
}
