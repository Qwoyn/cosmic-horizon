import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1. Syndicate resource pool (composite PK)
  await knex.schema.createTable('syndicate_resource_pool', (t) => {
    t.uuid('syndicate_id').notNullable()
      .references('id').inTable('syndicates').onDelete('CASCADE');
    t.string('resource_id', 64).notNullable()
      .references('id').inTable('resource_definitions');
    t.integer('quantity').notNullable().defaultTo(0);
    t.primary(['syndicate_id', 'resource_id']);
  });

  // 2. Pool permissions (composite PK)
  await knex.schema.createTable('syndicate_pool_permissions', (t) => {
    t.uuid('syndicate_id').notNullable()
      .references('id').inTable('syndicates').onDelete('CASCADE');
    t.uuid('player_id').notNullable()
      .references('id').inTable('players').onDelete('CASCADE');
    t.string('level', 16).notNullable().defaultTo('none'); // none, deposit, full, manager
    t.primary(['syndicate_id', 'player_id']);
  });

  // 3. Pool transaction log
  await knex.schema.createTable('syndicate_pool_log', (t) => {
    t.uuid('id').primary();
    t.uuid('syndicate_id').notNullable()
      .references('id').inTable('syndicates').onDelete('CASCADE');
    t.uuid('player_id').notNullable()
      .references('id').inTable('players');
    t.string('action', 32).notNullable();
    t.string('resource_id', 64).nullable();
    t.integer('quantity').notNullable().defaultTo(0);
    t.text('details').nullable();
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.index(['syndicate_id', 'created_at']);
  });

  // 4. Factory whitelist (composite PK)
  await knex.schema.createTable('syndicate_factory_whitelist', (t) => {
    t.uuid('planet_id').notNullable()
      .references('id').inTable('planets').onDelete('CASCADE');
    t.uuid('player_id').notNullable()
      .references('id').inTable('players').onDelete('CASCADE');
    t.primary(['planet_id', 'player_id']);
  });

  // 5. Mega-project definitions (seeded reference data)
  await knex.schema.createTable('mega_project_definitions', (t) => {
    t.string('id', 64).primary();
    t.string('name', 128).notNullable();
    t.text('description').nullable();
    t.integer('credits_cost').notNullable();
    t.integer('build_time_hours').notNullable();
    t.string('structure_type', 64).notNullable();
    t.text('resource_requirements').notNullable(); // JSON array
    t.integer('min_syndicate_members').notNullable().defaultTo(1);
  });

  // 6. Syndicate projects
  await knex.schema.createTable('syndicate_projects', (t) => {
    t.uuid('id').primary();
    t.uuid('syndicate_id').notNullable()
      .references('id').inTable('syndicates').onDelete('CASCADE');
    t.string('project_type', 64).notNullable()
      .references('id').inTable('mega_project_definitions');
    t.integer('target_sector_id').nullable();
    t.integer('credits_contributed').notNullable().defaultTo(0);
    t.text('resources_contributed').notNullable().defaultTo('{}'); // JSON
    t.string('status', 16).notNullable().defaultTo('in_progress'); // in_progress, building, completed, cancelled
    t.timestamp('started_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('build_started_at').nullable();
    t.timestamp('completed_at').nullable();
    t.index(['syndicate_id', 'status']);
  });

  // 7. Project contributions
  await knex.schema.createTable('syndicate_project_contributions', (t) => {
    t.uuid('id').primary();
    t.uuid('project_id').notNullable()
      .references('id').inTable('syndicate_projects').onDelete('CASCADE');
    t.uuid('player_id').notNullable()
      .references('id').inTable('players');
    t.string('resource_id', 64).nullable(); // null = credits
    t.integer('quantity').notNullable();
    t.string('source', 16).notNullable().defaultTo('personal'); // personal, pool
    t.timestamp('contributed_at').notNullable().defaultTo(knex.fn.now());
    t.index(['project_id']);
  });

  // 8. Syndicate structures
  await knex.schema.createTable('syndicate_structures', (t) => {
    t.uuid('id').primary();
    t.uuid('syndicate_id').notNullable()
      .references('id').inTable('syndicates').onDelete('CASCADE');
    t.string('structure_type', 64).notNullable();
    t.string('name', 128).nullable();
    t.integer('sector_id').nullable();
    t.text('data').notNullable().defaultTo('{}'); // JSON
    t.integer('health').notNullable().defaultTo(100);
    t.boolean('active').notNullable().defaultTo(true);
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.index(['syndicate_id', 'structure_type']);
    t.index(['sector_id']);
  });

  // 9. Alter planets: add factory columns
  await knex.schema.alterTable('planets', (t) => {
    t.boolean('is_syndicate_factory').notNullable().defaultTo(false);
    t.uuid('factory_syndicate_id').nullable()
      .references('id').inTable('syndicates').onDelete('SET NULL');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('planets', (t) => {
    t.dropColumn('is_syndicate_factory');
    t.dropColumn('factory_syndicate_id');
  });
  await knex.schema.dropTableIfExists('syndicate_structures');
  await knex.schema.dropTableIfExists('syndicate_project_contributions');
  await knex.schema.dropTableIfExists('syndicate_projects');
  await knex.schema.dropTableIfExists('mega_project_definitions');
  await knex.schema.dropTableIfExists('syndicate_factory_whitelist');
  await knex.schema.dropTableIfExists('syndicate_pool_log');
  await knex.schema.dropTableIfExists('syndicate_pool_permissions');
  await knex.schema.dropTableIfExists('syndicate_resource_pool');
}
