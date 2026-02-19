import { Knex } from 'knex';
import crypto from 'crypto';
import { generateUniverse } from '../../engine/universe';
import { SHIP_TYPES } from '../../config/ship-types';
import { PLANET_TYPES } from '../../config/planet-types';
import { GAME_CONFIG } from '../../config/game';

// Seeded RNG for reproducible seeding
function createRng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const OUTPOST_NAMES = [
  'Nebula Station', 'Void Bazaar', 'Frontier Post', 'Drift Market',
  'Comet\'s Rest', 'Starfall Depot', 'Eclipse Trading Post', 'Quasar Exchange',
  'Pulsar Hub', 'Nova Outpost', 'Meteor Market', 'Warp Gate Station',
  'Asteroid Emporium', 'Horizon Dock', 'Singularity Store', 'Cosmic Crossroads',
  'Dust Trail Depot', 'Rim Station', 'Deep Space Market', 'Orbital Exchange',
];

const PLANET_NAMES = [
  'Aurelia', 'Boreas', 'Calypso', 'Daedalus', 'Elysium', 'Fortuna', 'Gaia',
  'Helios', 'Icarus', 'Janus', 'Kronos', 'Luna', 'Minerva', 'Neptune',
  'Olympus', 'Prometheus', 'Quirinus', 'Rhea', 'Solaris', 'Titan',
  'Ursa', 'Vesta', 'Wyvern', 'Xanthe', 'Ymir', 'Zenith',
  'Aether', 'Bastion', 'Cygnus', 'Draco', 'Erebus', 'Fenrir',
  'Grendel', 'Hades', 'Io', 'Jotun', 'Kairos', 'Lethe',
  'Morpheus', 'Nyx', 'Oberon', 'Pandora', 'Quetzal', 'Ragnar',
  'Styx', 'Tartarus', 'Umbra', 'Valkyrie', 'Wyrm', 'Xibalba',
];

export async function seed(knex: Knex): Promise<void> {
  const rng = createRng(42);

  console.log('Generating universe...');
  const universe = generateUniverse(GAME_CONFIG.TOTAL_SECTORS, 42);

  // Clear existing data (order matters for foreign keys)
  await knex('bounties').del();
  await knex('game_events').del();
  await knex('trade_logs').del();
  await knex('combat_logs').del();
  await knex('deployables').del();
  await knex('alliances').del();
  await knex('syndicate_members').del();
  await knex('syndicates').del();
  await knex('planets').del();
  await knex('outposts').del();
  await knex('ships').del();
  await knex('dodge_pods').del();
  try { await knex('sector_resource_events').del(); } catch { /* table may not exist yet */ }
  await knex('planet_refinery_queue').del();
  await knex('player_resources').del();
  await knex('planet_resources').del();
  await knex('recipe_ingredients').del();
  await knex('recipes').del();
  await knex('resource_definitions').del();
  await knex('player_tablets').del();
  await knex('player_faction_rep').del();
  await knex('player_npc_state').del();
  await knex('npc_definitions').del();
  await knex('factions').del();
  await knex('players').del();
  await knex('sector_edges').del();
  await knex('sectors').del();
  await knex('ship_types').del();

  // 1. Seed ship types
  console.log('Seeding ship types...');
  for (const st of SHIP_TYPES) {
    await knex('ship_types').insert({
      id: st.id,
      name: st.name,
      description: st.description,
      base_weapon_energy: st.baseWeaponEnergy,
      max_weapon_energy: st.maxWeaponEnergy,
      base_cargo_holds: st.baseCargoHolds,
      max_cargo_holds: st.maxCargoHolds,
      base_engine_energy: st.baseEngineEnergy,
      max_engine_energy: st.maxEngineEnergy,
      attack_ratio: st.attackRatio,
      defense_ratio: st.defenseRatio,
      recharge_delay_ms: st.rechargeDelayMs,
      fuel_per_sector: st.fuelPerSector,
      price: st.price,
      can_cloak: st.canCloak,
      can_carry_pgd: st.canCarryPgd,
      can_carry_mines: st.canCarryMines,
      can_tow: st.canTow,
      has_jump_drive_slot: st.hasJumpDriveSlot,
      has_planetary_scanner: st.hasPlanetaryScanner,
      max_drones: st.maxDrones,
      tow_fuel_multiplier: st.towFuelMultiplier,
      base_hull_hp: st.baseHullHp,
      max_hull_hp: st.maxHullHp,
    });
  }

  // 2. Insert sectors in batches
  console.log(`Seeding ${universe.sectors.size} sectors...`);
  const sectorRows = [...universe.sectors.values()].map(s => ({
    id: s.id,
    type: s.type,
    has_star_mall: s.hasStarMall,
    has_seed_planet: s.hasSeedPlanet,
    region_id: s.regionId,
  }));

  // Insert in batches of 500 for SQLite
  for (let i = 0; i < sectorRows.length; i += 500) {
    await knex('sectors').insert(sectorRows.slice(i, i + 500));
  }

  // 3. Insert edges in batches
  console.log('Seeding sector edges...');
  const edgeRows: { from_sector_id: number; to_sector_id: number; one_way: boolean }[] = [];
  for (const [, edges] of universe.edges) {
    for (const edge of edges) {
      edgeRows.push({
        from_sector_id: edge.from,
        to_sector_id: edge.to,
        one_way: edge.oneWay,
      });
    }
  }

  for (let i = 0; i < edgeRows.length; i += 500) {
    await knex('sector_edges').insert(edgeRows.slice(i, i + 500));
  }
  console.log(`  Inserted ${edgeRows.length} edges`);

  // 4. Create outposts with randomized commodity profiles
  console.log(`Seeding ${GAME_CONFIG.NUM_OUTPOSTS} outposts...`);
  const allSectorIds = [...universe.sectors.keys()];
  const outpostSectors = new Set<number>();

  // Place outposts at star malls first
  const starMallSectors = [...universe.sectors.values()].filter(s => s.hasStarMall);
  for (const sm of starMallSectors) {
    outpostSectors.add(sm.id);
  }

  // Fill remaining outpost slots randomly
  while (outpostSectors.size < GAME_CONFIG.NUM_OUTPOSTS) {
    const idx = Math.floor(rng() * allSectorIds.length);
    outpostSectors.add(allSectorIds[idx]);
  }

  const commodityModes = ['buy', 'sell', 'none'] as const;
  let outpostNameIdx = 0;

  for (const sectorId of outpostSectors) {
    const name = `${OUTPOST_NAMES[outpostNameIdx % OUTPOST_NAMES.length]} ${Math.floor(outpostNameIdx / OUTPOST_NAMES.length) + 1}`.replace(/ 1$/, '');
    outpostNameIdx++;

    // Randomize commodity profiles - each commodity gets a mode
    const cyrMode = commodityModes[Math.floor(rng() * 3)];
    const foodMode = commodityModes[Math.floor(rng() * 3)];
    const techMode = commodityModes[Math.floor(rng() * 3)];

    // Stock levels depend on mode
    const stockForMode = (mode: string) => {
      if (mode === 'sell') return 3000 + Math.floor(rng() * 7000); // selling = has stock
      if (mode === 'buy') return Math.floor(rng() * 2000); // buying = lower stock
      return 0;
    };

    await knex('outposts').insert({
      id: crypto.randomUUID(),
      name,
      sector_id: sectorId,
      sells_fuel: rng() > 0.3, // 70% sell fuel
      cyrillium_stock: stockForMode(cyrMode),
      food_stock: stockForMode(foodMode),
      tech_stock: stockForMode(techMode),
      cyrillium_capacity: 10000,
      food_capacity: 10000,
      tech_capacity: 10000,
      cyrillium_mode: cyrMode,
      food_mode: foodMode,
      tech_mode: techMode,
      treasury: GAME_CONFIG.OUTPOST_BASE_TREASURY + Math.floor(rng() * 50000),
    });
  }

  // 4b. Guarantee tutorial outpost path — every star mall must have an adjacent sector with an outpost
  console.log('Ensuring tutorial outpost paths...');
  // Build adjacency lookup from edges
  const adjacency = new Map<number, number[]>();
  for (const [, edges] of universe.edges) {
    for (const edge of edges) {
      if (!adjacency.has(edge.from)) adjacency.set(edge.from, []);
      adjacency.get(edge.from)!.push(edge.to);
      if (!edge.oneWay) {
        if (!adjacency.has(edge.to)) adjacency.set(edge.to, []);
        adjacency.get(edge.to)!.push(edge.from);
      }
    }
  }

  let forcedOutposts = 0;
  for (const sm of starMallSectors) {
    const neighbors = adjacency.get(sm.id) || [];
    const hasAdjacentOutpost = neighbors.some(n => outpostSectors.has(n));

    if (!hasAdjacentOutpost && neighbors.length > 0) {
      // Pick the first neighbor and force-place an outpost there
      const targetSector = neighbors[0];
      outpostSectors.add(targetSector);
      forcedOutposts++;

      const name = `${OUTPOST_NAMES[outpostNameIdx % OUTPOST_NAMES.length]} ${Math.floor(outpostNameIdx / OUTPOST_NAMES.length) + 1}`.replace(/ 1$/, '');
      outpostNameIdx++;

      // Complementary commodities: this outpost BUYS what the star mall outpost SELLS
      // Star mall outpost sells food, this adjacent one buys food and sells tech
      await knex('outposts').insert({
        id: crypto.randomUUID(),
        name,
        sector_id: targetSector,
        sells_fuel: true,
        cyrillium_stock: 0,
        food_stock: Math.floor(rng() * 1500),
        tech_stock: 3000 + Math.floor(rng() * 5000),
        cyrillium_capacity: 10000,
        food_capacity: 10000,
        tech_capacity: 10000,
        cyrillium_mode: 'none',
        food_mode: 'buy',
        tech_mode: 'sell',
        treasury: GAME_CONFIG.OUTPOST_BASE_TREASURY + Math.floor(rng() * 50000),
      });
    }
  }

  // Also ensure star mall outposts themselves sell at least one commodity
  // Update existing star mall outposts to guarantee they sell food if they don't sell anything
  for (const sm of starMallSectors) {
    const existing = await knex('outposts').where({ sector_id: sm.id }).first();
    if (existing) {
      const sellsSomething = existing.cyrillium_mode === 'sell' ||
                             existing.food_mode === 'sell' ||
                             existing.tech_mode === 'sell';
      if (!sellsSomething) {
        await knex('outposts').where({ id: existing.id }).update({
          food_mode: 'sell',
          food_stock: 3000 + Math.floor(rng() * 5000),
        });
      }
    }
  }

  if (forcedOutposts > 0) {
    console.log(`  Force-placed ${forcedOutposts} outposts for tutorial paths`);
  }

  // Verification: confirm every star mall has at least one adjacent outpost
  for (const sm of starMallSectors) {
    const neighbors = adjacency.get(sm.id) || [];
    const hasAdjacentOutpost = neighbors.some(n => outpostSectors.has(n));
    if (!hasAdjacentOutpost) {
      console.warn(`  WARNING: Star mall sector ${sm.id} has no adjacent outpost!`);
    }
  }

  // 5. Create starting planets (scattered, mostly unclaimed)
  console.log(`Seeding ${GAME_CONFIG.NUM_STARTING_PLANETS} starting planets...`);
  const planetClasses = Object.keys(PLANET_TYPES).filter(c => c !== 'S'); // exclude seed planets
  const usedPlanetSectors = new Set<number>();
  let planetNameIdx = 0;

  for (let i = 0; i < GAME_CONFIG.NUM_STARTING_PLANETS; i++) {
    // Pick a random sector (allow multiple planets per sector)
    const sectorId = allSectorIds[Math.floor(rng() * allSectorIds.length)];
    const planetClass = planetClasses[Math.floor(rng() * planetClasses.length)];
    const config = PLANET_TYPES[planetClass];

    const baseName = PLANET_NAMES[planetNameIdx % PLANET_NAMES.length];
    const suffix = Math.floor(planetNameIdx / PLANET_NAMES.length);
    const name = suffix === 0 ? baseName : `${baseName} ${toRoman(suffix + 1)}`;
    planetNameIdx++;

    await knex('planets').insert({
      id: crypto.randomUUID(),
      name,
      sector_id: sectorId,
      owner_id: null, // unclaimed
      planet_class: planetClass,
      colonists: 0,
      ideal_population: config.idealPopulation,
      upgrade_level: 0,
    });
  }

  // 6. Create seed planets at designated sectors
  console.log('Seeding seed planets...');
  const seedPlanetSectors = [...universe.sectors.values()].filter(s => s.hasSeedPlanet);
  for (let i = 0; i < seedPlanetSectors.length; i++) {
    const sector = seedPlanetSectors[i];
    await knex('planets').insert({
      id: crypto.randomUUID(),
      name: `Seed World ${toRoman(i + 1)}`,
      sector_id: sector.id,
      owner_id: null,
      planet_class: 'S',
      colonists: 25000, // seed planets start with colonists
      ideal_population: PLANET_TYPES.S.idealPopulation,
      upgrade_level: 0,
    });
  }

  console.log('Universe seeding complete!');
  console.log(`  ${universe.sectors.size} sectors`);
  console.log(`  ${edgeRows.length} edges`);
  console.log(`  ${SHIP_TYPES.length} ship types`);
  console.log(`  ${outpostSectors.size} outposts`);
  console.log(`  ${GAME_CONFIG.NUM_STARTING_PLANETS} starting planets`);
  console.log(`  ${seedPlanetSectors.length} seed planets`);
}

function toRoman(num: number): string {
  const vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
  const syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
  let result = '';
  for (let i = 0; i < vals.length; i++) {
    while (num >= vals[i]) {
      result += syms[i];
      num -= vals[i];
    }
  }
  return result;
}
