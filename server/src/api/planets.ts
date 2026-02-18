import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { calculateProduction, canUpgrade } from '../engine/planets';
import { checkAndUpdateMissions } from '../services/mission-tracker';
import { applyUpgradesToShip } from '../engine/upgrades';
import db from '../db/connection';

const router = Router();

// Planet details
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const planet = await db('planets').where({ id: req.params.id }).first();
    if (!planet) return res.status(404).json({ error: 'Planet not found' });

    const production = calculateProduction(planet.planet_class, planet.colonists || 0);

    res.json({
      id: planet.id,
      name: planet.name,
      planetClass: planet.planet_class,
      sectorId: planet.sector_id,
      ownerId: planet.owner_id,
      upgradeLevel: planet.upgrade_level,
      colonists: planet.colonists,
      cyrilliumStock: planet.cyrillium_stock,
      foodStock: planet.food_stock,
      techStock: planet.tech_stock,
      droneCount: planet.drone_count,
      production,
      canUpgrade: planet.owner_id === req.session.playerId
        ? canUpgrade({
            upgradeLevel: planet.upgrade_level,
            colonists: planet.colonists || 0,
            cyrilliumStock: planet.cyrillium_stock || 0,
            foodStock: planet.food_stock || 0,
            techStock: planet.tech_stock || 0,
            ownerCredits: 0, // checked separately
          })
        : false,
    });
  } catch (err) {
    console.error('Planet detail error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Claim unclaimed planet
router.post('/:id/claim', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const planet = await db('planets').where({ id: req.params.id }).first();
    if (!planet) return res.status(404).json({ error: 'Planet not found' });
    if (planet.sector_id !== player.current_sector_id) {
      return res.status(400).json({ error: 'Planet is not in your sector' });
    }
    if (planet.owner_id) {
      return res.status(400).json({ error: 'Planet already claimed' });
    }

    await db('planets').where({ id: planet.id }).update({
      owner_id: player.id,
    });

    res.json({ planetId: planet.id, ownerId: player.id });
  } catch (err) {
    console.error('Claim error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Deposit colonists from ship to planet
router.post('/:id/colonize', requireAuth, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return res.status(400).json({ error: 'Invalid quantity' });

    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const planet = await db('planets').where({ id: req.params.id }).first();
    if (!planet) return res.status(404).json({ error: 'Planet not found' });
    if (planet.sector_id !== player.current_sector_id) {
      return res.status(400).json({ error: 'Planet is not in your sector' });
    }
    if (planet.owner_id !== player.id) {
      return res.status(400).json({ error: 'You do not own this planet' });
    }

    const ship = await db('ships').where({ id: player.current_ship_id }).first();
    if (!ship) return res.status(400).json({ error: 'No active ship' });

    const available = ship.colonist_cargo || 0;
    const toDeposit = Math.min(quantity, available);
    if (toDeposit <= 0) return res.status(400).json({ error: 'No colonists on ship' });

    await db('ships').where({ id: ship.id }).update({
      colonist_cargo: available - toDeposit,
    });
    await db('planets').where({ id: planet.id }).update({
      colonists: (planet.colonists || 0) + toDeposit,
    });

    // Mission progress: colonize
    checkAndUpdateMissions(player.id, 'colonize', { quantity: toDeposit });

    res.json({
      deposited: toDeposit,
      planetColonists: (planet.colonists || 0) + toDeposit,
      shipColonists: available - toDeposit,
    });
  } catch (err) {
    console.error('Colonize error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Collect colonists from seed planet
router.post('/:id/collect-colonists', requireAuth, async (req, res) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return res.status(400).json({ error: 'Invalid quantity' });

    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const planet = await db('planets').where({ id: req.params.id }).first();
    if (!planet) return res.status(404).json({ error: 'Planet not found' });
    if (planet.planet_class !== 'S') {
      return res.status(400).json({ error: 'Can only collect colonists from seed planets' });
    }
    if (planet.sector_id !== player.current_sector_id) {
      return res.status(400).json({ error: 'Planet is not in your sector' });
    }

    const ship = await db('ships').where({ id: player.current_ship_id }).first();
    if (!ship) return res.status(400).json({ error: 'No active ship' });

    const upgrades = await applyUpgradesToShip(ship.id);
    const currentCargo = (ship.cyrillium_cargo || 0) + (ship.food_cargo || 0) +
      (ship.tech_cargo || 0) + (ship.colonist_cargo || 0);
    const freeSpace = (ship.max_cargo_holds + upgrades.cargoBonus) - currentCargo;
    const available = planet.colonists || 0;
    const toCollect = Math.min(quantity, available, freeSpace);
    if (toCollect <= 0) return res.status(400).json({ error: 'No colonists available or no cargo space' });

    await db('planets').where({ id: planet.id }).update({
      colonists: available - toCollect,
    });
    await db('ships').where({ id: ship.id }).update({
      colonist_cargo: (ship.colonist_cargo || 0) + toCollect,
    });

    res.json({
      collected: toCollect,
      planetColonists: available - toCollect,
      shipColonists: (ship.colonist_cargo || 0) + toCollect,
    });
  } catch (err) {
    console.error('Collect colonists error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upgrade planet
router.post('/:id/upgrade', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const planet = await db('planets').where({ id: req.params.id }).first();
    if (!planet) return res.status(404).json({ error: 'Planet not found' });
    if (planet.owner_id !== player.id) {
      return res.status(400).json({ error: 'You do not own this planet' });
    }

    const { UPGRADE_REQUIREMENTS } = require('../config/planet-types');
    const nextLevel = planet.upgrade_level + 1;
    const req_ = UPGRADE_REQUIREMENTS[nextLevel];
    if (!req_) return res.status(400).json({ error: 'Planet is already at max level' });

    if (!canUpgrade({
      upgradeLevel: planet.upgrade_level,
      colonists: planet.colonists || 0,
      cyrilliumStock: planet.cyrillium_stock || 0,
      foodStock: planet.food_stock || 0,
      techStock: planet.tech_stock || 0,
      ownerCredits: Number(player.credits),
    })) {
      return res.status(400).json({ error: 'Upgrade requirements not met', requirements: req_ });
    }

    // Deduct resources
    await db('planets').where({ id: planet.id }).update({
      upgrade_level: nextLevel,
      cyrillium_stock: (planet.cyrillium_stock || 0) - req_.cyrillium,
      food_stock: (planet.food_stock || 0) - req_.food,
      tech_stock: (planet.tech_stock || 0) - req_.tech,
    });
    await db('players').where({ id: player.id }).update({
      credits: Number(player.credits) - req_.credits,
    });

    res.json({
      planetId: planet.id,
      newLevel: nextLevel,
      newCredits: Number(player.credits) - req_.credits,
    });
  } catch (err) {
    console.error('Upgrade error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
