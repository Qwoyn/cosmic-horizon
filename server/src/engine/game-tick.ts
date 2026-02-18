import { Server as SocketIOServer } from 'socket.io';
import db from '../db/connection';
import { GAME_CONFIG } from '../config/game';
import { calculateProduction, calculateColonistGrowth } from './planets';
import { processDecay, processDefenseDecay, isDeployableExpired } from './decay';
import { notifyPlayer, getConnectedPlayers } from '../ws/handlers';
import { spawnSectorEvents, expireSectorEvents } from './events';
import { refreshLeaderboardCache } from './leaderboards';
import { producePlanetUniqueResources } from './crafting';

let tickInterval: ReturnType<typeof setInterval> | null = null;
let tickCount = 0;

export async function gameTick(io: SocketIOServer): Promise<void> {
  const now = new Date();

  try {
    // 1. Regenerate energy for all players
    await db('players')
      .where('energy', '<', db.ref('max_energy'))
      .increment('energy', GAME_CONFIG.ENERGY_REGEN_RATE);

    // Cap energy at max
    await db('players')
      .whereRaw('energy > max_energy')
      .update({ energy: db.ref('max_energy') });

    // Bonus regen for new players
    await db('players')
      .where('energy', '<', db.ref('max_energy'))
      .where('energy_regen_bonus_until', '>', now.toISOString())
      .increment('energy', GAME_CONFIG.ENERGY_REGEN_RATE);

    // Cap again
    await db('players')
      .whereRaw('energy > max_energy')
      .update({ energy: db.ref('max_energy') });

    // Expire Vedic max_energy bonus after the regen bonus period ends
    await db('players')
      .where({ race: 'vedic' })
      .where('max_energy', '>', GAME_CONFIG.MAX_ENERGY)
      .where('energy_regen_bonus_until', '<=', now.toISOString())
      .update({ max_energy: GAME_CONFIG.MAX_ENERGY });

    // Cap energy at new max_energy after bonus expiry
    await db('players')
      .whereRaw('energy > max_energy')
      .update({ energy: db.ref('max_energy') });

    // 2. Planet production (fetch all owned planets, calculate, batch update)
    const planets = await db('planets').whereNotNull('owner_id').where('colonists', '>', 0);
    for (const planet of planets) {
      const production = calculateProduction(planet.planet_class, planet.colonists);
      const hasFoodSupply = (planet.food_stock || 0) > 0 || production.food > 0;
      const newColonists = calculateColonistGrowth(planet.planet_class, planet.colonists, hasFoodSupply);

      await db('planets').where({ id: planet.id }).update({
        cyrillium_stock: (planet.cyrillium_stock || 0) + production.cyrillium,
        food_stock: (planet.food_stock || 0) + production.food,
        tech_stock: (planet.tech_stock || 0) + production.tech,
        drone_count: (planet.drone_count || 0) + production.drones,
        colonists: newColonists,
      });
    }

    // 2b. Planet unique resource production
    try {
      for (const planet of planets) {
        await producePlanetUniqueResources(planet);
      }
    } catch { /* crafting tables may not exist yet */ }

    // 3. Decay - inactive player planets
    const inactivePlayers = await db('players')
      .whereNotNull('last_login')
      .whereRaw(`julianday('now') - julianday(last_login) > ?`, [GAME_CONFIG.DECAY_INACTIVE_THRESHOLD_HOURS / 24]);

    for (const inactivePlayer of inactivePlayers) {
      const lastLogin = new Date(inactivePlayer.last_login);
      const hoursInactive = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);

      const playerPlanets = await db('planets').where({ owner_id: inactivePlayer.id });
      for (const planet of playerPlanets) {
        const result = processDecay({
          colonists: planet.colonists || 0,
          hoursInactive,
          inactiveThresholdHours: GAME_CONFIG.DECAY_INACTIVE_THRESHOLD_HOURS,
        });
        if (result.decayed) {
          await db('planets').where({ id: planet.id }).update({ colonists: result.newColonists });
        }
      }
    }

    // Defense energy drain on all deployed defenses
    const planetsWithDrones = await db('planets').where('drone_count', '>', 0);
    for (const planet of planetsWithDrones) {
      const newDrones = processDefenseDecay(planet.drone_count, planet.drone_count * 2);
      await db('planets').where({ id: planet.id }).update({ drone_count: newDrones });
    }

    // Delete expired deployables
    const deployables = await db('deployables').select('*');
    for (const dep of deployables) {
      if (isDeployableExpired(new Date(dep.created_at), new Date(dep.last_maintained_at || dep.created_at), now)) {
        await db('deployables').where({ id: dep.id }).del();
      }
    }

    // Expire timed missions
    try {
      await db('player_missions')
        .where({ status: 'active' })
        .whereNotNull('expires_at')
        .where('expires_at', '<', now.toISOString())
        .update({ status: 'failed' });
    } catch { /* table may not exist yet */ }

    // Sector events: spawn new events and expire old ones
    try {
      await spawnSectorEvents();
      await expireSectorEvents();
    } catch { /* table may not exist yet */ }

    // Leaderboards: refresh cache every 5 ticks
    tickCount++;
    if (tickCount % 5 === 0) {
      try {
        await refreshLeaderboardCache();
      } catch { /* table may not exist yet */ }
    }

    // 4. Outpost economy - inject treasury
    await db('outposts').increment('treasury', GAME_CONFIG.OUTPOST_TREASURY_INJECTION);

    // 5. Emit energy updates to connected players
    const connectedPlayers = getConnectedPlayers();
    for (const [, playerId] of connectedPlayers) {
      const player = await db('players').where({ id: playerId }).select('energy', 'max_energy').first();
      if (player) {
        notifyPlayer(io, playerId, 'energy:update', {
          energy: player.energy,
          maxEnergy: player.max_energy,
        });
      }
    }
  } catch (err) {
    console.error('Game tick error:', err);
  }
}

export function startGameTick(io: SocketIOServer): void {
  if (tickInterval) return;
  tickInterval = setInterval(() => gameTick(io), GAME_CONFIG.TICK_INTERVAL_MS);
  console.log(`Game tick started (${GAME_CONFIG.TICK_INTERVAL_MS}ms interval)`);
}

export function stopGameTick(): void {
  if (tickInterval) {
    clearInterval(tickInterval);
    tickInterval = null;
    console.log('Game tick stopped');
  }
}
