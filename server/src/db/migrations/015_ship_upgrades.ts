import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('upgrade_types', (t) => {
    t.string('id').primary();
    t.string('name').notNullable();
    t.text('description').notNullable();
    t.string('slot').notNullable(); // weapon | engine | cargo | shield
    t.integer('stat_bonus').notNullable();
    t.float('diminishing_factor').notNullable().defaultTo(0.8);
    t.integer('price').notNullable();
    t.integer('max_stack').notNullable().defaultTo(3);
    t.json('compatible_ship_types').nullable(); // null = all
  });

  await knex.schema.createTable('ship_upgrades', (t) => {
    t.uuid('id').primary();
    t.uuid('ship_id').notNullable().references('id').inTable('ships').onDelete('CASCADE');
    t.string('upgrade_type_id').notNullable().references('id').inTable('upgrade_types');
    t.integer('stack_position').notNullable();
    t.integer('effective_bonus').notNullable();
    t.timestamp('installed_at').notNullable().defaultTo(knex.fn.now());

    t.index('ship_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('ship_upgrades');
  await knex.schema.dropTableIfExists('upgrade_types');
}
