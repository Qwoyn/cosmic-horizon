import db from '../db/connection';
import { GAME_CONFIG } from '../config/game';
import { calculateProduction, calculateColonistGrowth } from './planets';

const MAX_TICKS_CATCHUP = 1440; // 24 hours max catchup

/**
 * Process on-demand ticks for a single-player session.
 * Instead of a global game tick, SP players get economy updates
 * based on elapsed time since their last tick.
 *
 * Uses batch multiplication instead of per-tick iteration for efficiency.
 */
export async function processOnDemandTick(playerId: string): Promise<{ ticksProcessed: number }> {
  const player = await db('players').where({ id: playerId }).first();
  if (!player || player.game_mode !== 'singleplayer') {
    return { ticksProcessed: 0 };
  }

  const lastTick = player.sp_last_tick_at ? new Date(player.sp_last_tick_at) : new Date();
  const now = new Date();
  const elapsedMs = now.getTime() - lastTick.getTime();
  const elapsedMinutes = elapsedMs / 60000;
  const ticksToProcess = Math.min(Math.floor(elapsedMinutes), MAX_TICKS_CATCHUP);

  if (ticksToProcess < 1) {
    return { ticksProcessed: 0 };
  }

  // 1. Energy regen (batch: add rate × ticks, cap at max)
  const energyGain = GAME_CONFIG.ENERGY_REGEN_RATE * ticksToProcess;
  await db('players').where({ id: playerId }).update({
    energy: db.raw(`MIN(max_energy, energy + ?)`, [energyGain]),
  });

  // 2. Planet production (only planets in SP sectors owned by this player)
  const spSectors = await db('sectors')
    .where({ owner_id: playerId, universe: 'sp' })
    .select('id');
  const spSectorIds = spSectors.map((s: any) => s.id);

  if (spSectorIds.length > 0) {
    const planets = await db('planets')
      .whereIn('sector_id', spSectorIds)
      .whereNotNull('owner_id')
      .where('colonists', '>', 0);

    for (const planet of planets) {
      const production = calculateProduction(planet.planet_class, planet.colonists);
      const hasFoodSupply = (planet.food_stock || 0) > 0 || production.food > 0;

      // Batch production: per_tick_rate × ticksToProcess
      const totalCyrillium = production.cyrillium * ticksToProcess;
      const totalFood = production.food * ticksToProcess;
      const totalTech = production.tech * ticksToProcess;
      const totalDrones = Math.floor(production.drones * ticksToProcess * 100) / 100;

      // Colonist growth: compound per tick but approximate with batch
      // For simplicity, calculate growth as if it happened once with the total effect
      let newColonists = planet.colonists;
      if (hasFoodSupply) {
        const config = require('../config/planet-types').PLANET_TYPES[planet.planet_class];
        if (config) {
          const growthRate = config.colonistGrowthRate;
          // Compound growth approximation: colonists × (1 + rate)^ticks
          newColonists = Math.floor(planet.colonists * Math.pow(1 + growthRate, ticksToProcess));
        }
      }

      await db('planets').where({ id: planet.id }).update({
        cyrillium_stock: (planet.cyrillium_stock || 0) + totalCyrillium,
        food_stock: (planet.food_stock || 0) + totalFood,
        tech_stock: (planet.tech_stock || 0) + totalTech,
        drone_count: (planet.drone_count || 0) + totalDrones,
        colonists: newColonists,
      });
    }

    // 3. Outpost treasury regen (only SP outposts)
    const treasuryGain = GAME_CONFIG.OUTPOST_TREASURY_INJECTION * ticksToProcess;
    await db('outposts')
      .whereIn('sector_id', spSectorIds)
      .increment('treasury', treasuryGain);
  }

  // 4. Update last tick timestamp
  await db('players').where({ id: playerId }).update({
    sp_last_tick_at: now.toISOString(),
  });

  return { ticksProcessed: ticksToProcess };
}
