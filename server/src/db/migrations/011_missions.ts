import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('mission_templates', (t) => {
    t.uuid('id').primary();
    t.string('title').notNullable();
    t.text('description').notNullable();
    t.string('type').notNullable(); // deliver_cargo | visit_sector | destroy_ship | colonize_planet | trade_units | scan_sectors
    t.integer('difficulty').notNullable().defaultTo(1); // 1-5
    t.json('objectives').notNullable();
    t.integer('reward_credits').notNullable().defaultTo(0);
    t.uuid('reward_item_id').nullable();
    t.integer('time_limit_minutes').nullable();
    t.integer('min_player_level').notNullable().defaultTo(0);
    t.boolean('repeatable').notNullable().defaultTo(false);
  });

  await knex.schema.createTable('player_missions', (t) => {
    t.uuid('id').primary();
    t.uuid('player_id').notNullable().references('id').inTable('players').onDelete('CASCADE');
    t.uuid('template_id').notNullable().references('id').inTable('mission_templates');
    t.string('status').notNullable().defaultTo('active'); // active | completed | failed | abandoned
    t.json('progress').notNullable();
    t.integer('reward_credits').notNullable().defaultTo(0);
    t.uuid('reward_item_id').nullable();
    t.timestamp('accepted_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('expires_at').nullable();
    t.timestamp('completed_at').nullable();

    t.index('player_id');
    t.index(['player_id', 'status']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('player_missions');
  await knex.schema.dropTableIfExists('mission_templates');
}
