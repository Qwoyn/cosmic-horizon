import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { calculateProduction, canUpgrade } from '../engine/planets';
import { checkAndUpdateMissions } from '../services/mission-tracker';
import { applyUpgradesToShip } from '../engine/upgrades';
import { awardXP } from '../engine/progression';
import { checkAchievements } from '../engine/achievements';
import { GAME_CONFIG } from '../config/game';
import { getRefineryQueue, getRefinerySlots } from '../engine/crafting';
import db from '../db/connection';

const router = Router();

// List planets owned by the player
router.get('/owned', requireAuth, async (req, res) => {
  try {
    const planets = await db('planets')
      .where({ owner_id: req.session.playerId })
      .orderBy('created_at');

    // Load unique resources for all owned planets
    let planetResourceMap: Record<string, { id: string; name: string; stock: number }[]> = {};
    try {
      const allPlanetIds = planets.map((p: any) => p.id);
      if (allPlanetIds.length > 0) {
        const planetRes = await db('planet_resources')
          .join('resource_definitions', 'planet_resources.resource_id', 'resource_definitions.id')
          .whereIn('planet_resources.planet_id', allPlanetIds)
          .where('planet_resources.stock', '>', 0)
          .select('planet_resources.planet_id', 'resource_definitions.id', 'resource_definitions.name', 'planet_resources.stock');
        for (const pr of planetRes) {
          if (!planetResourceMap[pr.planet_id]) planetResourceMap[pr.planet_id] = [];
          planetResourceMap[pr.planet_id].push({ id: pr.id, name: pr.name, stock: pr.stock });
        }
      }
    } catch { /* crafting tables may not exist yet */ }

    // Load refinery queue counts
    let queueCountMap: Record<string, number> = {};
    try {
      const allPlanetIds = planets.map((p: any) => p.id);
      if (allPlanetIds.length > 0) {
        const queueCounts = await db('planet_refinery_queue')
          .whereIn('planet_id', allPlanetIds)
          .where({ collected: false })
          .groupBy('planet_id')
          .select('planet_id')
          .count('id as count');
        for (const qc of queueCounts) {
          queueCountMap[qc.planet_id as string] = Number(qc.count);
        }
      }
    } catch { /* crafting tables may not exist yet */ }

    const result = planets.map((p: any) => {
      const production = calculateProduction(p.planet_class, p.colonists || 0);
      return {
        id: p.id,
        name: p.name,
        planetClass: p.planet_class,
        sectorId: p.sector_id,
        upgradeLevel: p.upgrade_level,
        colonists: p.colonists || 0,
        cyrilliumStock: p.cyrillium_stock || 0,
        foodStock: p.food_stock || 0,
        techStock: p.tech_stock || 0,
        droneCount: p.drone_count || 0,
        production,
        uniqueResources: planetResourceMap[p.id] || [],
        refineryQueueCount: queueCountMap[p.id] || 0,
      };
    });

    res.json({ planets: result });
  } catch (err) {
    console.error('Owned planets error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List all discovered planets (in explored sectors)
router.get('/discovered', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    let explored: number[] = [];
    try { explored = JSON.parse(player.explored_sectors || '[]'); } catch { explored = []; }

    if (explored.length === 0) return res.json({ planets: [] });

    const planets = await db('planets')
      .whereIn('planets.sector_id', explored)
      .leftJoin('players as owner', 'planets.owner_id', 'owner.id')
      .select(
        'planets.id', 'planets.name', 'planets.planet_class',
        'planets.sector_id', 'planets.owner_id',
        'planets.upgrade_level', 'planets.colonists',
        'planets.cyrillium_stock', 'planets.food_stock', 'planets.tech_stock',
        'owner.username as ownerName'
      );

    const result = planets.map((p: any) => ({
      id: p.id,
      name: p.name,
      planetClass: p.planet_class,
      sectorId: p.sector_id,
      owned: p.owner_id === player.id,
      ownerName: p.owner_id === player.id ? 'You' : (p.ownerName || null),
      upgradeLevel: p.upgrade_level,
      colonists: p.colonists || 0,
      ...(p.owner_id === player.id ? {
        cyrilliumStock: p.cyrillium_stock || 0,
        foodStock: p.food_stock || 0,
        techStock: p.tech_stock || 0,
      } : {}),
    }));

    res.json({ planets: result });
  } catch (err) {
    console.error('Discovered planets error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Planet details
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const planet = await db('planets').where({ id: req.params.id }).first();
    if (!planet) return res.status(404).json({ error: 'Planet not found' });

    const production = calculateProduction(planet.planet_class, planet.colonists || 0);

    // Load unique resources and refinery for owned planets
    let uniqueResources: any[] = [];
    let refineryQueue: any[] = [];
    let refinerySlots = 0;
    if (planet.owner_id === req.session.playerId) {
      try {
        const planetRes = await db('planet_resources')
          .join('resource_definitions', 'planet_resources.resource_id', 'resource_definitions.id')
          .where({ 'planet_resources.planet_id': planet.id })
          .where('planet_resources.stock', '>', 0)
          .select('resource_definitions.id', 'resource_definitions.name', 'planet_resources.stock');
        uniqueResources = planetRes;
        refineryQueue = await getRefineryQueue(planet.id);
        refinerySlots = getRefinerySlots(planet.upgrade_level);
      } catch { /* crafting tables may not exist yet */ }
    }

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
      uniqueResources,
      refineryQueue,
      refinerySlots,
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
    if (planet.planet_class === 'S') {
      return res.status(400).json({ error: 'Seed planets cannot be claimed — they belong to the galaxy' });
    }
    if (planet.owner_id) {
      return res.status(400).json({ error: 'Planet already claimed' });
    }

    await db('planets').where({ id: planet.id }).update({
      owner_id: player.id,
    });

    // Award XP for claiming a planet
    const xpResult = await awardXP(player.id, GAME_CONFIG.XP_CLAIM_PLANET, 'explore');
    await checkAchievements(player.id, 'claim_planet', {});

    res.json({ planetId: planet.id, ownerId: player.id, xp: { awarded: xpResult.xpAwarded, total: xpResult.totalXp, level: xpResult.level, rank: xpResult.rank, levelUp: xpResult.levelUp } });
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

    // Award XP for colonizing
    const xpResult = await awardXP(player.id, toDeposit * GAME_CONFIG.XP_COLONIZE, 'explore');

    res.json({
      deposited: toDeposit,
      planetColonists: (planet.colonists || 0) + toDeposit,
      shipColonists: available - toDeposit,
      xp: { awarded: xpResult.xpAwarded, total: xpResult.totalXp, level: xpResult.level, rank: xpResult.rank, levelUp: xpResult.levelUp },
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
