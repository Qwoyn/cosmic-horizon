import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { canAffordAction, deductEnergy, getActionCost } from '../engine/energy';
import { checkAndUpdateMissions } from '../services/mission-tracker';
import {
  handleTutorialStatus,
  handleTutorialSector,
  handleTutorialMove,
  handleTutorialMap,
  handleTutorialScan,
} from '../services/tutorial-sandbox';
import db from '../db/connection';

const router = Router();

// Player status
router.get('/status', requireAuth, async (req, res) => {
  if (req.inTutorial) return handleTutorialStatus(req, res);
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const ship = player.current_ship_id
      ? await db('ships').where({ id: player.current_ship_id }).first()
      : null;

    res.json({
      id: player.id,
      username: player.username,
      race: player.race,
      energy: player.energy,
      maxEnergy: player.max_energy,
      credits: Number(player.credits),
      currentSectorId: player.current_sector_id,
      tutorialStep: player.tutorial_step || 0,
      tutorialCompleted: !!player.tutorial_completed,
      hasSeenIntro: !!player.has_seen_intro,
      hasSeenPostTutorial: !!player.has_seen_post_tutorial,
      currentShip: ship ? {
        id: ship.id,
        shipTypeId: ship.ship_type_id,
        weaponEnergy: ship.weapon_energy,
        engineEnergy: ship.engine_energy,
        cargoHolds: ship.cargo_holds,
        maxCargoHolds: ship.max_cargo_holds,
        cyrilliumCargo: ship.cyrillium_cargo,
        foodCargo: ship.food_cargo,
        techCargo: ship.tech_cargo,
        colonistsCargo: ship.colonist_cargo,
      } : null,
    });
  } catch (err) {
    console.error('Status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Move to adjacent sector
router.post('/move/:sectorId', requireAuth, async (req, res) => {
  if (req.inTutorial) return handleTutorialMove(req, res);
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const targetSectorId = parseInt(req.params.sectorId as string, 10);
    if (isNaN(targetSectorId)) return res.status(400).json({ error: 'Invalid sector ID' });

    if (!canAffordAction(player.energy, 'move')) {
      return res.status(400).json({ error: 'Not enough energy', cost: getActionCost('move') });
    }

    // Check adjacency
    const edge = await db('sector_edges')
      .where({ from_sector_id: player.current_sector_id, to_sector_id: targetSectorId })
      .first();

    if (!edge) {
      return res.status(400).json({ error: 'Sector is not adjacent' });
    }

    const newEnergy = deductEnergy(player.energy, 'move');

    // Update explored sectors
    let explored: number[] = [];
    try { explored = JSON.parse(player.explored_sectors || '[]'); } catch { explored = []; }
    if (!explored.includes(targetSectorId)) {
      explored.push(targetSectorId);
    }

    await db('players').where({ id: player.id }).update({
      current_sector_id: targetSectorId,
      energy: newEnergy,
      explored_sectors: JSON.stringify(explored),
    });

    // Move active ship too
    if (player.current_ship_id) {
      await db('ships').where({ id: player.current_ship_id }).update({ sector_id: targetSectorId });
    }

    // Get sector contents
    const sector = await db('sectors').where({ id: targetSectorId }).first();
    const playersInSector = await db('players')
      .where({ current_sector_id: targetSectorId })
      .whereNot({ id: player.id })
      .select('id', 'username');
    const outpostsInSector = await db('outposts').where({ sector_id: targetSectorId });
    const planetsInSector = await db('planets').where({ sector_id: targetSectorId });

    // Mission progress: move
    checkAndUpdateMissions(player.id, 'move', { sectorId: targetSectorId });

    res.json({
      sectorId: targetSectorId,
      sectorType: sector?.type,
      energy: newEnergy,
      players: playersInSector,
      outposts: outpostsInSector.map(o => ({ id: o.id, name: o.name })),
      planets: planetsInSector.map(p => ({ id: p.id, name: p.name, ownerId: p.owner_id })),
    });
  } catch (err) {
    console.error('Move error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Current sector contents
router.get('/sector', requireAuth, async (req, res) => {
  if (req.inTutorial) return handleTutorialSector(req, res);
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const sectorId = player.current_sector_id;
    const sector = await db('sectors').where({ id: sectorId }).first();
    const edges = await db('sector_edges').where({ from_sector_id: sectorId });
    const playersInSector = await db('players')
      .where({ current_sector_id: sectorId })
      .whereNot({ id: player.id })
      .select('id', 'username');
    const outpostsInSector = await db('outposts').where({ sector_id: sectorId });
    const planetsInSector = await db('planets').where({ sector_id: sectorId });
    const deployablesInSector = await db('deployables').where({ sector_id: sectorId });

    // Sector events
    let events: any[] = [];
    try {
      events = await db('sector_events')
        .where({ sector_id: sectorId, status: 'active' })
        .select('id', 'event_type', 'created_at', 'expires_at');
    } catch { /* table may not exist yet */ }

    // Warp gates
    let warpGates: any[] = [];
    try {
      const gates = await db('warp_gates')
        .where(function() {
          this.where({ sector_a_id: sectorId }).orWhere({ sector_b_id: sectorId });
        })
        .where({ status: 'active' });
      warpGates = gates.map(g => ({
        id: g.id,
        destinationSectorId: g.sector_a_id === sectorId ? g.sector_b_id : g.sector_a_id,
        tollAmount: g.toll_amount,
        syndicateFree: !!g.syndicate_free,
        syndicateId: g.syndicate_id,
      }));
    } catch { /* table may not exist yet */ }

    res.json({
      sectorId,
      type: sector?.type,
      regionId: sector?.region_id,
      hasStarMall: sector?.has_star_mall,
      adjacentSectors: edges.map(e => ({ sectorId: e.to_sector_id, oneWay: e.one_way })),
      players: playersInSector,
      outposts: outpostsInSector.map(o => ({ id: o.id, name: o.name })),
      planets: planetsInSector.map(p => ({
        id: p.id, name: p.name, planetClass: p.planet_class,
        ownerId: p.owner_id, upgradeLevel: p.upgrade_level,
      })),
      deployables: deployablesInSector.map(d => ({ id: d.id, type: d.type, ownerId: d.owner_id })),
      events: events.map(e => ({ id: e.id, eventType: e.event_type })),
      warpGates,
    });
  } catch (err) {
    console.error('Sector error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Player's explored map
router.get('/map', requireAuth, async (req, res) => {
  if (req.inTutorial) return handleTutorialMap(req, res);
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    let explored: number[] = [];
    try { explored = JSON.parse(player.explored_sectors || '[]'); } catch { explored = []; }

    const sectors = explored.length > 0
      ? await db('sectors').whereIn('id', explored).select('id', 'type', 'region_id', 'has_star_mall')
      : [];

    const edges = explored.length > 0
      ? await db('sector_edges')
          .whereIn('from_sector_id', explored)
          .whereIn('to_sector_id', explored)
      : [];

    // Find which explored sectors have outposts/planets
    const outpostSectorRows = explored.length > 0
      ? await db('outposts').distinct('sector_id').whereIn('sector_id', explored)
      : [];
    const planetSectorRows = explored.length > 0
      ? await db('planets').distinct('sector_id').whereIn('sector_id', explored)
      : [];
    const outpostSectorIds = new Set(outpostSectorRows.map((r: any) => r.sector_id));
    const planetSectorIds = new Set(planetSectorRows.map((r: any) => r.sector_id));

    res.json({
      currentSectorId: player.current_sector_id,
      sectors: sectors.map(s => ({
        id: s.id, type: s.type, regionId: s.region_id, hasStarMall: s.has_star_mall,
        hasOutposts: outpostSectorIds.has(s.id),
        hasPlanets: planetSectorIds.has(s.id),
      })),
      edges: edges.map(e => ({
        from: e.from_sector_id, to: e.to_sector_id, oneWay: e.one_way,
      })),
    });
  } catch (err) {
    console.error('Map error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Scan adjacent sectors (requires planetary scanner)
router.post('/scan', requireAuth, async (req, res) => {
  if (req.inTutorial) return handleTutorialScan(req, res);
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const ship = player.current_ship_id
      ? await db('ships').where({ id: player.current_ship_id }).first()
      : null;

    if (!ship) return res.status(400).json({ error: 'No active ship' });

    // Check if ship type has scanner
    const { SHIP_TYPES } = require('../config/ship-types');
    const shipType = SHIP_TYPES.find((s: any) => s.id === ship.ship_type_id);
    if (!shipType?.hasPlanetaryScanner) {
      return res.status(400).json({ error: 'Ship does not have a planetary scanner' });
    }

    const edges = await db('sector_edges').where({ from_sector_id: player.current_sector_id });
    const adjacentIds = edges.map(e => e.to_sector_id);

    const adjacentSectors = await db('sectors').whereIn('id', adjacentIds);
    const adjacentPlanets = adjacentIds.length > 0
      ? await db('planets').whereIn('sector_id', adjacentIds)
      : [];
    const adjacentPlayers = adjacentIds.length > 0
      ? await db('players').whereIn('current_sector_id', adjacentIds).select('id', 'username', 'current_sector_id')
      : [];

    // Mission progress: scan
    checkAndUpdateMissions(player.id, 'scan', {});

    res.json({
      scannedSectors: adjacentSectors.map(s => ({
        id: s.id,
        type: s.type,
        planets: adjacentPlanets.filter(p => p.sector_id === s.id).map(p => ({
          id: p.id, name: p.name, planetClass: p.planet_class, ownerId: p.owner_id,
        })),
        players: adjacentPlayers.filter(p => p.current_sector_id === s.id).map(p => ({
          id: p.id, username: p.username,
        })),
      })),
    });
  } catch (err) {
    console.error('Scan error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark intro as seen
router.post('/seen-intro', requireAuth, async (req, res) => {
  try {
    await db('players').where({ id: req.session.playerId }).update({ has_seen_intro: true });
    res.json({ success: true });
  } catch (err) {
    console.error('Seen intro error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark post-tutorial lore as seen
router.post('/seen-post-tutorial', requireAuth, async (req, res) => {
  try {
    await db('players').where({ id: req.session.playerId }).update({ has_seen_post_tutorial: true });
    res.json({ success: true });
  } catch (err) {
    console.error('Seen post-tutorial error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
