import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { STORE_ITEMS, getStoreItem } from '../config/store-items';
import { SHIP_TYPES } from '../config/ship-types';
import { GAME_CONFIG } from '../config/game';
import db from '../db/connection';

const router = Router();

// List all store items
router.get('/catalog', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const sector = await db('sectors').where({ id: player.current_sector_id }).first();
    if (!sector?.has_star_mall) {
      return res.status(400).json({ error: 'Must be at a star mall to browse the store' });
    }

    // Show all items with availability flags based on player's current ship
    const ship = await db('ships').where({ id: player.current_ship_id }).first();
    const shipType = ship ? SHIP_TYPES.find(s => s.id === ship.ship_type_id) : null;

    const items = STORE_ITEMS.map(item => {
      let canUse = true;
      let reason = '';

      if (item.requiresCapability && shipType) {
        const capMap: Record<string, boolean> = {
          canCarryMines: shipType.canCarryMines,
          canCarryPgd: shipType.canCarryPgd,
          hasJumpDriveSlot: shipType.hasJumpDriveSlot,
        };
        if (!capMap[item.requiresCapability]) {
          canUse = false;
          reason = `Requires ship with ${item.requiresCapability}`;
        }
      }

      return {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        canUse,
        reason,
      };
    });

    res.json({ items, credits: Number(player.credits) });
  } catch (err) {
    console.error('Store catalog error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Purchase a store item (consumable or equipment)
router.post('/buy/:itemId', requireAuth, async (req, res) => {
  try {
    const item = getStoreItem(req.params.itemId as string);
    if (!item) return res.status(404).json({ error: 'Unknown item' });

    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const sector = await db('sectors').where({ id: player.current_sector_id }).first();
    if (!sector?.has_star_mall) {
      return res.status(400).json({ error: 'Must be at a star mall to buy items' });
    }

    if (Number(player.credits) < item.price) {
      return res.status(400).json({ error: 'Not enough credits' });
    }

    const ship = await db('ships').where({ id: player.current_ship_id }).first();
    if (!ship) return res.status(400).json({ error: 'No active ship' });

    // Check capability requirement
    if (item.requiresCapability) {
      const shipType = SHIP_TYPES.find(s => s.id === ship.ship_type_id);
      const capMap: Record<string, boolean> = {
        canCarryMines: shipType?.canCarryMines ?? false,
        canCarryPgd: shipType?.canCarryPgd ?? false,
        hasJumpDriveSlot: shipType?.hasJumpDriveSlot ?? false,
      };
      if (!capMap[item.requiresCapability]) {
        return res.status(400).json({ error: `Ship lacks capability: ${item.requiresCapability}` });
      }
    }

    // Handle equipment installation
    if (item.category === 'equipment') {
      if (item.id === 'jump_drive') {
        if (ship.has_jump_drive) {
          return res.status(400).json({ error: 'Ship already has a jump drive' });
        }
        await db('ships').where({ id: ship.id }).update({ has_jump_drive: true });
      }
      // PGD and scanner are inherent ship capabilities; purchasing "unlocks" for that session
    }

    // Handle consumable items - use immediately or add effect
    if (item.category === 'consumable') {
      if (item.id === 'fuel_cell') {
        const newEnergy = Math.min(player.energy + 50, player.max_energy);
        await db('players').where({ id: player.id }).update({
          credits: Number(player.credits) - item.price,
          energy: newEnergy,
        });
        return res.json({
          item: item.id,
          used: true,
          newCredits: Number(player.credits) - item.price,
          newEnergy,
        });
      }
      // Other consumables are stored as game_events for later use
      const crypto = require('crypto');
      await db('game_events').insert({
        id: crypto.randomUUID(),
        player_id: player.id,
        event_type: `item:${item.id}`,
        data: JSON.stringify({ itemId: item.id, purchasedAt: new Date() }),
        read: false,
      });
    }

    await db('players').where({ id: player.id }).update({
      credits: Number(player.credits) - item.price,
    });

    res.json({
      item: item.id,
      name: item.name,
      category: item.category,
      newCredits: Number(player.credits) - item.price,
    });
  } catch (err) {
    console.error('Store buy error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Use a consumable item from inventory
router.post('/use/:itemId', requireAuth, async (req, res) => {
  try {
    const item = getStoreItem(req.params.itemId as string);
    if (!item || item.category !== 'consumable') {
      return res.status(400).json({ error: 'Invalid consumable item' });
    }

    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    // Find unused item in player's inventory
    const inventoryItem = await db('game_events')
      .where({ player_id: player.id, event_type: `item:${item.id}`, read: false })
      .first();

    if (!inventoryItem) {
      return res.status(400).json({ error: 'You do not have this item' });
    }

    // Mark as used
    await db('game_events').where({ id: inventoryItem.id }).update({ read: true });

    let effect: Record<string, any> = { item: item.id, used: true };

    if (item.id === 'probe') {
      const { sectorId } = req.body;
      if (!sectorId) return res.status(400).json({ error: 'Sector ID required for probe' });

      const sectorContents = await db('sectors').where({ id: sectorId }).first();
      if (!sectorContents) return res.status(400).json({ error: 'Invalid sector' });

      const players = await db('players')
        .where({ current_sector_id: sectorId })
        .select('username');
      const outposts = await db('outposts').where({ sector_id: sectorId }).select('name');
      const planets = await db('planets').where({ sector_id: sectorId }).select('name', 'planet_class');

      effect = {
        ...effect,
        sectorId,
        sectorType: sectorContents.type,
        players: players.map(p => p.username),
        outposts: outposts.map(o => o.name),
        planets: planets.map(p => ({ name: p.name, class: p.planet_class })),
      };
    }

    if (item.id === 'fuel_cell') {
      const newEnergy = Math.min(player.energy + 50, player.max_energy);
      await db('players').where({ id: player.id }).update({ energy: newEnergy });
      effect.newEnergy = newEnergy;
    }

    res.json(effect);
  } catch (err) {
    console.error('Use item error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// View player's consumable inventory
router.get('/inventory', requireAuth, async (req, res) => {
  try {
    const items = await db('game_events')
      .where({ player_id: req.session.playerId, read: false })
      .andWhere('event_type', 'like', 'item:%')
      .select('id', 'event_type', 'created_at');

    const inventory = items.map(i => ({
      id: i.id,
      itemId: i.event_type.replace('item:', ''),
      name: getStoreItem(i.event_type.replace('item:', ''))?.name ?? 'Unknown',
      acquiredAt: i.created_at,
    }));

    res.json({ inventory });
  } catch (err) {
    console.error('Inventory error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Buy fuel (available at outposts that sell fuel)
router.post('/refuel', requireAuth, async (req, res) => {
  try {
    const { quantity } = req.body;
    const amount = Math.min(quantity || 50, 200);

    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    // Check if at an outpost or star mall that sells fuel
    const outpost = await db('outposts')
      .where({ sector_id: player.current_sector_id, sells_fuel: true })
      .first();
    const sector = await db('sectors').where({ id: player.current_sector_id }).first();

    if (!outpost && !sector?.has_star_mall) {
      return res.status(400).json({ error: 'No fuel available at this location' });
    }

    const costPerUnit = 10; // credits per energy point
    const totalCost = amount * costPerUnit;

    if (Number(player.credits) < totalCost) {
      return res.status(400).json({ error: 'Not enough credits' });
    }

    const newEnergy = Math.min(player.energy + amount, player.max_energy);
    const actualRefueled = newEnergy - player.energy;
    const actualCost = actualRefueled * costPerUnit;

    await db('players').where({ id: player.id }).update({
      credits: Number(player.credits) - actualCost,
      energy: newEnergy,
    });

    res.json({
      refueled: actualRefueled,
      newEnergy,
      cost: actualCost,
      newCredits: Number(player.credits) - actualCost,
    });
  } catch (err) {
    console.error('Refuel error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
