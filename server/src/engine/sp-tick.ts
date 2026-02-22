import crypto from 'crypto';
import db from '../db/connection';
import { GAME_CONFIG } from '../config/game';
import { PLANET_TYPES } from '../config/planet-types';
import { calculateProduction, calculateColonistGrowth, calculateFoodConsumption } from './planets';
import { calculateHappiness, calculateAverageAffinity, type RacePopulation } from './happiness';

const MAX_TICKS_CATCHUP = 1440; // 24 hours max catchup
const CHUNK_SIZE = 10; // Process in chunks of 10 ticks

/**
 * Process on-demand ticks for a single-player session.
 * Uses chunked simulation for happiness/food interactions.
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

  // 2. Planet production with chunked simulation
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
      const planetConfig = PLANET_TYPES[planet.planet_class];
      if (!planetConfig) continue;

      // Load race populations
      let racePopulations: RacePopulation[] = [];
      try {
        racePopulations = await db('planet_colonists')
          .where({ planet_id: planet.id })
          .select('race', 'count');
      } catch { /* table may not exist yet */ }

      if (racePopulations.length === 0) {
        racePopulations = [{ race: 'unknown', count: planet.colonists }];
      }

      // Running state for chunked simulation
      let currentColonists = planet.colonists;
      let currentFoodStock = planet.food_stock || 0;
      let currentHappiness = planet.happiness || 50;
      let totalCyrillium = 0;
      let totalTech = 0;
      let totalDrones = 0;
      let totalFoodConsumed = 0;

      // Process in chunks
      let ticksRemaining = ticksToProcess;
      while (ticksRemaining > 0) {
        const chunkTicks = Math.min(ticksRemaining, CHUNK_SIZE);
        ticksRemaining -= chunkTicks;

        // Scale race populations proportionally to current colonists
        const totalRacePop = racePopulations.reduce((sum, rp) => sum + rp.count, 0);
        const scaledPops = totalRacePop > 0
          ? racePopulations.map(rp => ({ race: rp.race, count: Math.floor(rp.count * currentColonists / totalRacePop) }))
          : [{ race: 'unknown', count: currentColonists }];

        const avgAffinity = calculateAverageAffinity(scaledPops, planet.planet_class);

        // Recalculate happiness for this chunk
        currentHappiness = calculateHappiness(currentHappiness, {
          foodStock: currentFoodStock,
          colonists: currentColonists,
          idealPopulation: planetConfig.idealPopulation,
          upgradeLevel: planet.upgrade_level,
          droneCount: planet.drone_count || 0,
          foodConsumptionRate: planetConfig.foodConsumptionRate,
          avgRaceAffinity: avgAffinity,
        });

        // Production for this chunk
        const production = calculateProduction(planet.planet_class, scaledPops, currentHappiness);
        totalCyrillium += production.cyrillium * chunkTicks;
        totalTech += production.tech * chunkTicks;
        totalDrones += production.drones * chunkTicks;

        // Growth & food consumption for this chunk
        for (let t = 0; t < chunkTicks; t++) {
          const growth = calculateColonistGrowth(
            planet.planet_class, currentColonists, currentHappiness,
            currentFoodStock, planet.upgrade_level
          );
          currentColonists = growth.newColonists;
          currentFoodStock = Math.max(0, currentFoodStock + growth.foodProduced - growth.foodConsumed);
          totalFoodConsumed += growth.foodConsumed;
        }
      }

      // Update final state
      const finalRacePop = racePopulations.reduce((sum, rp) => sum + rp.count, 0);
      await db('planets').where({ id: planet.id }).update({
        cyrillium_stock: (planet.cyrillium_stock || 0) + totalCyrillium,
        food_stock: currentFoodStock,
        tech_stock: (planet.tech_stock || 0) + totalTech,
        drone_count: (planet.drone_count || 0) + Math.floor(totalDrones * 100) / 100,
        colonists: currentColonists,
        happiness: currentHappiness,
      });

      // Update planet_colonists proportionally
      if (currentColonists !== finalRacePop && finalRacePop > 0) {
        const ratio = currentColonists / finalRacePop;
        let assigned = 0;
        for (let i = 0; i < racePopulations.length; i++) {
          const rp = racePopulations[i];
          const newCount = i === racePopulations.length - 1
            ? currentColonists - assigned
            : Math.floor(rp.count * ratio);
          assigned += newCount;
          try {
            await db('planet_colonists')
              .where({ planet_id: planet.id, race: rp.race })
              .update({ count: Math.max(0, newCount) });
          } catch { /* table may not exist yet */ }
        }
      }

      // Record 1 production history entry for the whole SP batch
      try {
        await db('planet_production_history').insert({
          id: crypto.randomUUID(),
          planet_id: planet.id,
          tick_at: now.toISOString(),
          cyrillium_produced: totalCyrillium,
          tech_produced: totalTech,
          drones_produced: Math.floor(totalDrones * 100) / 100,
          food_consumed: totalFoodConsumed,
          colonist_count: currentColonists,
          happiness: currentHappiness,
        });
      } catch { /* table may not exist yet */ }
    }

    // 3. Outpost treasury regen (only SP outposts)
    const treasuryGain = GAME_CONFIG.OUTPOST_TREASURY_INJECTION * ticksToProcess;
    await db('outposts')
      .whereIn('sector_id', spSectorIds)
      .increment('treasury', treasuryGain);
  }

  // 3b. SP Caravan processing — advance caravans by ticksToProcess sectors in batch
  try {
    const spCaravans = await db('caravans')
      .where({ owner_id: playerId, status: 'in_transit' });

    for (const caravan of spCaravans) {
      const path: number[] = JSON.parse(caravan.path_json);
      const newIndex = Math.min(caravan.path_index + ticksToProcess, path.length - 1);

      if (newIndex >= path.length - 1) {
        // Arrived at destination
        const route = await db('trade_routes').where({ id: caravan.trade_route_id }).first();
        if (route) {
          await db('planets').where({ id: route.dest_planet_id }).increment('food_stock', caravan.food_cargo);
        }
        await db('caravans').where({ id: caravan.id }).update({
          status: 'arrived',
          current_sector_id: path[path.length - 1],
          path_index: path.length - 1,
          arrived_at: now.toISOString(),
        });
        await db('caravan_logs').insert({
          id: crypto.randomUUID(),
          caravan_id: caravan.id,
          trade_route_id: caravan.trade_route_id,
          event_type: 'arrived',
          sector_id: path[path.length - 1],
          food_amount: caravan.food_cargo,
          created_at: now.toISOString(),
        });
      } else {
        // Still in transit — update position
        await db('caravans').where({ id: caravan.id }).update({
          path_index: newIndex,
          current_sector_id: path[newIndex],
          escort_player_id: null,
          escort_sector_id: null,
        });
      }
    }

    // SP caravan dispatch — check if dispatch interval has elapsed
    const intervalTicks = GAME_CONFIG.TRADE_ROUTE_DISPATCH_INTERVAL_TICKS;
    const spRoutes = await db('trade_routes')
      .where({ owner_id: playerId, status: 'active' });

    for (const route of spRoutes) {
      // Check if enough ticks have elapsed since last dispatch
      const ticksSinceDispatch = route.last_dispatch_at
        ? Math.floor((now.getTime() - new Date(route.last_dispatch_at).getTime()) / GAME_CONFIG.TICK_INTERVAL_MS)
        : intervalTicks; // First dispatch

      if (ticksSinceDispatch < intervalTicks) continue;

      // Check no in-transit caravan exists
      const existing = await db('caravans')
        .where({ trade_route_id: route.id, status: 'in_transit' })
        .first();
      if (existing) continue;

      // Check credits
      const currentPlayer = await db('players').where({ id: playerId }).first();
      if (!currentPlayer || currentPlayer.credits < route.credit_cost) {
        await db('trade_routes').where({ id: route.id }).update({ status: 'paused' });
        continue;
      }

      await db('players').where({ id: playerId }).update({
        credits: db.raw('credits - ?', [route.credit_cost]),
      });

      const path: number[] = JSON.parse(route.path_json);
      const caravanId = crypto.randomUUID();

      await db('caravans').insert({
        id: caravanId,
        trade_route_id: route.id,
        owner_id: playerId,
        current_sector_id: path[0],
        path_json: route.path_json,
        path_index: 0,
        food_cargo: route.food_per_cycle,
        is_protected: route.fuel_paid ? 1 : 0,
        defense_hp: GAME_CONFIG.CARAVAN_BASE_DEFENSE_HP,
        defense_ratio: GAME_CONFIG.CARAVAN_BASE_DEFENSE_RATIO,
        status: 'in_transit',
        dispatched_at: now.toISOString(),
      });

      await db('trade_routes').where({ id: route.id }).update({
        last_dispatch_at: now.toISOString(),
      });

      await db('caravan_logs').insert({
        id: crypto.randomUUID(),
        caravan_id: caravanId,
        trade_route_id: route.id,
        event_type: 'dispatched',
        sector_id: path[0],
        food_amount: route.food_per_cycle,
        credits_amount: route.credit_cost,
        created_at: now.toISOString(),
      });
    }
  } catch { /* trade route tables may not exist yet */ }

  // 4. Update last tick timestamp
  await db('players').where({ id: playerId }).update({
    sp_last_tick_at: now.toISOString(),
  });

  return { ticksProcessed: ticksToProcess };
}
