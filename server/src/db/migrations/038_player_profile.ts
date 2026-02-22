import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1. Player stats — denormalized counters incremented in real-time
  await knex.schema.createTable('player_stats', (table) => {
    table.text('player_id').primary().references('id').inTable('players').onDelete('CASCADE');
    table.integer('combat_kills').notNullable().defaultTo(0);
    table.integer('combat_deaths').notNullable().defaultTo(0);
    table.integer('damage_dealt').notNullable().defaultTo(0);
    table.integer('damage_taken').notNullable().defaultTo(0);
    table.integer('sectors_explored').notNullable().defaultTo(0);
    table.integer('missions_completed').notNullable().defaultTo(0);
    table.integer('trades_completed').notNullable().defaultTo(0);
    table.integer('trade_credits_earned').notNullable().defaultTo(0);
    table.integer('trade_credits_spent').notNullable().defaultTo(0);
    table.integer('items_crafted').notNullable().defaultTo(0);
    table.integer('resources_gathered').notNullable().defaultTo(0);
    table.integer('planets_colonized').notNullable().defaultTo(0);
    table.integer('food_deposited').notNullable().defaultTo(0);
    table.integer('caravans_dispatched').notNullable().defaultTo(0);
    table.integer('caravans_delivered').notNullable().defaultTo(0);
    table.integer('caravans_ransacked').notNullable().defaultTo(0);
    table.integer('caravans_lost').notNullable().defaultTo(0);
    table.integer('caravans_escorted').notNullable().defaultTo(0);
    table.integer('bounties_placed').notNullable().defaultTo(0);
    table.integer('bounties_claimed').notNullable().defaultTo(0);
    table.integer('credits_from_bounties').notNullable().defaultTo(0);
    table.integer('dodge_pod_uses').notNullable().defaultTo(0);
    table.integer('warp_gate_uses').notNullable().defaultTo(0);
    table.integer('chat_messages_sent').notNullable().defaultTo(0);
    table.integer('energy_spent').notNullable().defaultTo(0);
    table.text('updated_at').notNullable();
  });

  // 2. Daily stat snapshots for period breakdowns
  await knex.schema.createTable('player_stats_daily', (table) => {
    table.text('id').primary();
    table.text('player_id').notNullable().references('id').inTable('players').onDelete('CASCADE');
    table.text('stat_date').notNullable(); // YYYY-MM-DD
    table.text('stat_key').notNullable();
    table.integer('value').notNullable().defaultTo(0);
    table.unique(['player_id', 'stat_date', 'stat_key']);
    table.index('player_id');
  });

  // 3. Activity log — recent event feed
  await knex.schema.createTable('player_activity_log', (table) => {
    table.text('id').primary();
    table.text('player_id').notNullable().references('id').inTable('players').onDelete('CASCADE');
    table.text('event_type').notNullable();
    table.text('description').notNullable();
    table.text('details_json');
    table.text('created_at').notNullable();
    table.index(['player_id', 'created_at']);
  });

  // 4. Personal bests
  await knex.schema.createTable('player_personal_bests', (table) => {
    table.text('id').primary();
    table.text('player_id').notNullable().references('id').inTable('players').onDelete('CASCADE');
    table.text('best_type').notNullable();
    table.integer('value').notNullable();
    table.text('description');
    table.text('achieved_at').notNullable();
    table.unique(['player_id', 'best_type']);
  });

  // 5. Milestone definitions (static, seeded)
  await knex.schema.createTable('milestone_definitions', (table) => {
    table.text('id').primary();
    table.text('category').notNullable();
    table.text('name').notNullable();
    table.text('description').notNullable();
    table.text('stat_key');
    table.integer('threshold');
    table.integer('tier').notNullable().defaultTo(1);
    table.text('icon_key');
  });

  // 6. Player milestones (earned)
  await knex.schema.createTable('player_milestones', (table) => {
    table.text('id').primary();
    table.text('player_id').notNullable().references('id').inTable('players').onDelete('CASCADE');
    table.text('milestone_id').notNullable().references('id').inTable('milestone_definitions');
    table.text('earned_at').notNullable();
    table.unique(['player_id', 'milestone_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('player_milestones');
  await knex.schema.dropTableIfExists('milestone_definitions');
  await knex.schema.dropTableIfExists('player_personal_bests');
  await knex.schema.dropTableIfExists('player_activity_log');
  await knex.schema.dropTableIfExists('player_stats_daily');
  await knex.schema.dropTableIfExists('player_stats');
}
