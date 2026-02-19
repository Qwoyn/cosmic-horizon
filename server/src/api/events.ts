import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { canAffordAction, deductEnergy } from '../engine/energy';
import { resolveEvent, EventType } from '../engine/events';
import { applyUpgradesToShip } from '../engine/upgrades';
import { grantRandomTablet } from '../engine/tablets';
import { awardXP } from '../engine/progression';
import { checkAchievements } from '../engine/achievements';
import { GAME_CONFIG } from '../config/game';
import db from '../db/connection';

const router = Router();

// Get active events in player's current sector
router.get('/sector', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const events = await db('sector_events')
      .where({ sector_id: player.current_sector_id, status: 'active' })
      .select('id', 'event_type', 'created_at', 'expires_at');

    res.json({
      events: events.map(e => ({
        id: e.id,
        eventType: e.event_type,
        createdAt: e.created_at,
        expiresAt: e.expires_at,
      })),
    });
  } catch (err) {
    console.error('Sector events error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Investigate an event
router.post('/investigate/:eventId', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    if (!canAffordAction(player.energy, 'investigate')) {
      return res.status(400).json({ error: 'Not enough energy' });
    }

    const event = await db('sector_events')
      .where({ id: req.params.eventId, status: 'active' })
      .first();

    if (!event) return res.status(404).json({ error: 'Event not found or already resolved' });
    if (event.sector_id !== player.current_sector_id) {
      return res.status(400).json({ error: 'Event is not in your sector' });
    }

    const eventData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
    const outcome = resolveEvent(event.event_type as EventType, eventData);

    const newEnergy = deductEnergy(player.energy, 'investigate');
    let finalEnergy = newEnergy;

    // Apply outcome
    if (outcome.creditsGained) {
      await db('players').where({ id: player.id }).increment('credits', outcome.creditsGained);
    }
    if (outcome.creditsLost) {
      await db('players').where({ id: player.id }).decrement('credits', outcome.creditsLost);
    }
    if (outcome.energyGained) {
      finalEnergy = Math.min(player.max_energy, finalEnergy + outcome.energyGained);
    }
    if (outcome.energyLost) {
      finalEnergy = Math.max(0, finalEnergy - outcome.energyLost);
    }

    await db('players').where({ id: player.id }).update({ energy: finalEnergy });

    // Add cargo to ship if applicable
    if (outcome.cargoGained && player.current_ship_id) {
      const ship = await db('ships').where({ id: player.current_ship_id }).first();
      if (ship) {
        const upgrades = await applyUpgradesToShip(ship.id);
        const currentCargo = (ship.cyrillium_cargo || 0) + (ship.food_cargo || 0) +
          (ship.tech_cargo || 0) + (ship.colonist_cargo || 0);
        const freeSpace = (ship.max_cargo_holds + upgrades.cargoBonus) - currentCargo;
        const toAdd = Math.min(outcome.cargoGained.quantity, freeSpace);
        if (toAdd > 0) {
          const cargoField = `${outcome.cargoGained.commodity}_cargo`;
          await db('ships').where({ id: ship.id }).update({
            [cargoField]: (ship[cargoField] || 0) + toAdd,
          });
        }
      }
    }

    // Mark event as resolved
    await db('sector_events').where({ id: event.id }).update({
      status: 'resolved',
      resolved_by_id: player.id,
    });

    // Award XP for investigating
    const xpResult = await awardXP(player.id, GAME_CONFIG.XP_INVESTIGATE_EVENT, 'explore');

    // Tablet drop chance
    let tabletDrop: { name: string; rarity: string } | null = null;
    if (Math.random() < GAME_CONFIG.TABLET_EVENT_DROP_CHANCE) {
      try {
        const dropResult = await grantRandomTablet(player.id);
        if (!dropResult.overflow) {
          tabletDrop = { name: dropResult.name!, rarity: dropResult.rarity! };
        }
      } catch { /* tablet system may not be ready */ }
    }

    res.json({
      message: outcome.message,
      creditsGained: outcome.creditsGained || 0,
      creditsLost: outcome.creditsLost || 0,
      energyGained: outcome.energyGained || 0,
      energyLost: outcome.energyLost || 0,
      cargoGained: outcome.cargoGained || null,
      energy: finalEnergy,
      xp: { awarded: xpResult.xpAwarded, total: xpResult.totalXp, level: xpResult.level, rank: xpResult.rank, levelUp: xpResult.levelUp },
      tabletDrop,
    });
  } catch (err) {
    console.error('Investigate event error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
