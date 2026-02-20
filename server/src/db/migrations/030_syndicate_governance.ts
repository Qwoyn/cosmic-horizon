import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // 1. Syndicate settings
  await knex.schema.createTable('syndicate_settings', (t) => {
    t.uuid('syndicate_id').primary()
      .references('id').inTable('syndicates').onDelete('CASCADE');
    t.string('recruitment_mode', 16).notNullable().defaultTo('closed'); // open, closed, invite_only
    t.integer('min_level').notNullable().defaultTo(1);
    t.integer('quorum_percent').notNullable().defaultTo(60);
    t.integer('vote_duration_hours').notNullable().defaultTo(48);
    t.string('succession_rule', 24).notNullable().defaultTo('officer_vote'); // officer_vote, highest_rank, founder_line
    t.integer('treasury_withdrawal_limit').notNullable().defaultTo(0);
    t.text('motto').nullable();
    t.text('description').nullable();
  });

  // 2. Syndicate roles
  await knex.schema.createTable('syndicate_roles', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(16))))'));
    t.uuid('syndicate_id').notNullable()
      .references('id').inTable('syndicates').onDelete('CASCADE');
    t.string('name', 64).notNullable();
    t.integer('priority').notNullable().defaultTo(0);
    t.boolean('is_preset').notNullable().defaultTo(false);
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.index(['syndicate_id']);
  });

  // 3. Syndicate role permissions
  await knex.schema.createTable('syndicate_role_permissions', (t) => {
    t.uuid('role_id').notNullable()
      .references('id').inTable('syndicate_roles').onDelete('CASCADE');
    t.string('permission', 32).notNullable();
    t.primary(['role_id', 'permission']);
  });

  // 4. Syndicate invite codes
  await knex.schema.createTable('syndicate_invite_codes', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(16))))'));
    t.uuid('syndicate_id').notNullable()
      .references('id').inTable('syndicates').onDelete('CASCADE');
    t.string('code', 16).notNullable().unique();
    t.uuid('created_by').notNullable()
      .references('id').inTable('players');
    t.integer('uses_remaining').notNullable().defaultTo(1);
    t.timestamp('expires_at').notNullable();
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.index(['syndicate_id']);
  });

  // 5. Syndicate join requests
  await knex.schema.createTable('syndicate_join_requests', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(16))))'));
    t.uuid('syndicate_id').notNullable()
      .references('id').inTable('syndicates').onDelete('CASCADE');
    t.uuid('player_id').notNullable()
      .references('id').inTable('players').onDelete('CASCADE');
    t.text('message').nullable();
    t.string('status', 16).notNullable().defaultTo('pending'); // pending, accepted, rejected
    t.uuid('reviewed_by').nullable()
      .references('id').inTable('players');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.index(['syndicate_id', 'status']);
  });

  // 6. Syndicate votes
  await knex.schema.createTable('syndicate_votes', (t) => {
    t.uuid('id').primary().defaultTo(knex.raw('(lower(hex(randomblob(16))))'));
    t.uuid('syndicate_id').notNullable()
      .references('id').inTable('syndicates').onDelete('CASCADE');
    t.string('type', 32).notNullable(); // alliance, treasury_withdraw, disband, project, charter_amendment
    t.text('description').notNullable();
    t.uuid('proposed_by').notNullable()
      .references('id').inTable('players');
    t.text('target_data').notNullable().defaultTo('{}'); // JSON
    t.string('status', 16).notNullable().defaultTo('active'); // active, passed, failed, expired
    t.integer('quorum_percent').notNullable();
    t.timestamp('expires_at').notNullable();
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.index(['syndicate_id', 'status']);
  });

  // 7. Syndicate vote ballots
  await knex.schema.createTable('syndicate_vote_ballots', (t) => {
    t.uuid('vote_id').notNullable()
      .references('id').inTable('syndicate_votes').onDelete('CASCADE');
    t.uuid('player_id').notNullable()
      .references('id').inTable('players').onDelete('CASCADE');
    t.string('choice', 8).notNullable(); // yes, no, abstain
    t.timestamp('cast_at').notNullable().defaultTo(knex.fn.now());
    t.primary(['vote_id', 'player_id']);
  });

  // 8. Add role_id to syndicate_members
  await knex.schema.alterTable('syndicate_members', (t) => {
    t.uuid('role_id').nullable()
      .references('id').inTable('syndicate_roles').onDelete('SET NULL');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('syndicate_members', (t) => {
    t.dropColumn('role_id');
  });
  await knex.schema.dropTableIfExists('syndicate_vote_ballots');
  await knex.schema.dropTableIfExists('syndicate_votes');
  await knex.schema.dropTableIfExists('syndicate_join_requests');
  await knex.schema.dropTableIfExists('syndicate_invite_codes');
  await knex.schema.dropTableIfExists('syndicate_role_permissions');
  await knex.schema.dropTableIfExists('syndicate_roles');
  await knex.schema.dropTableIfExists('syndicate_settings');
}
