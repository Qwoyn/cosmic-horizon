import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('tablet_definitions', (t) => {
    t.string('id', 64).primary();
    t.string('name', 64).notNullable();
    t.text('description').notNullable();
    t.string('rarity', 16).notNullable(); // common | uncommon | rare | epic | legendary | mythic
    t.json('effects').notNullable(); // e.g. { weaponBonus: 2, engineBonus: 1 }
    t.json('sprite_config').notNullable(); // e.g. { spriteId: 'item_tablet', paletteSwap: { '1': '#808080' } }
  });

  await knex.schema.createTable('player_tablets', (t) => {
    t.uuid('id').primary();
    t.uuid('player_id').notNullable().references('id').inTable('players').onDelete('CASCADE');
    t.string('tablet_definition_id').notNullable().references('id').inTable('tablet_definitions');
    t.integer('equipped_slot').nullable(); // 1, 2, or 3 (NULL = unequipped)
    t.timestamp('acquired_at').defaultTo(knex.fn.now());

    t.index('player_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('player_tablets');
  await knex.schema.dropTableIfExists('tablet_definitions');
}
