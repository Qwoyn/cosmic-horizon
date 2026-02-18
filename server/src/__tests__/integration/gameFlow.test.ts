import path from 'path';
import fs from 'fs';
import knex from 'knex';

// Create test DB before anything imports the connection module
const testDbPath = path.join(__dirname, '..', '..', '..', 'data', 'test_cosmic_horizon.sqlite');

// Remove stale test DB so each run starts fresh
if (fs.existsSync(testDbPath)) {
  fs.unlinkSync(testDbPath);
}

const testDb = knex({
  client: 'better-sqlite3',
  connection: { filename: testDbPath },
  useNullAsDefault: true,
});

// Mock the connection module before any route imports
jest.mock('../../db/connection', () => {
  return { __esModule: true, default: testDb };
});

import request from 'supertest';
import { createTestApp } from './testApp';

const app = createTestApp();

function agent() {
  return request.agent(app);
}

const migrationsDir = path.join(__dirname, '..', '..', 'db', 'migrations');

beforeAll(async () => {
  // Run migrations on test DB
  await testDb.migrate.latest({ directory: migrationsDir });

  // Seed minimal test universe
  await testDb('ship_types').insert({
    id: 'scout', name: 'Test Scout', description: 'Test ship',
    base_weapon_energy: 25, max_weapon_energy: 75,
    base_cargo_holds: 10, max_cargo_holds: 20,
    base_engine_energy: 50, max_engine_energy: 100,
    attack_ratio: 1.0, defense_ratio: 1.0,
    recharge_delay_ms: 4000, fuel_per_sector: 1, price: 5000,
    can_cloak: false, can_carry_pgd: false, can_carry_mines: false,
    can_tow: false, has_jump_drive_slot: false, has_planetary_scanner: false,
    max_drones: 1, tow_fuel_multiplier: 1,
  });

  await testDb('ship_types').insert({
    id: 'dodge_pod', name: 'Dodge Pod', description: 'Emergency pod',
    base_weapon_energy: 0, max_weapon_energy: 0,
    base_cargo_holds: 0, max_cargo_holds: 0,
    base_engine_energy: 20, max_engine_energy: 20,
    attack_ratio: 0, defense_ratio: 0,
    recharge_delay_ms: 0, fuel_per_sector: 1, price: 0,
    can_cloak: false, can_carry_pgd: false, can_carry_mines: false,
    can_tow: false, has_jump_drive_slot: false, has_planetary_scanner: false,
    max_drones: 0, tow_fuel_multiplier: 1,
  });

  // Race starter ships
  await testDb('ship_types').insert({
    id: 'corvette', name: 'Muscarian Corvette', description: 'Balanced warship',
    base_weapon_energy: 50, max_weapon_energy: 150,
    base_cargo_holds: 15, max_cargo_holds: 30,
    base_engine_energy: 75, max_engine_energy: 150,
    attack_ratio: 1.2, defense_ratio: 1.0,
    recharge_delay_ms: 5000, fuel_per_sector: 2, price: 30000,
    can_cloak: false, can_carry_pgd: false, can_carry_mines: true,
    can_tow: true, has_jump_drive_slot: false, has_planetary_scanner: false,
    max_drones: 2, tow_fuel_multiplier: 1.8,
  });

  await testDb('ship_types').insert({
    id: 'cruiser', name: 'Vedic Cruiser', description: 'Multi-role vessel',
    base_weapon_energy: 75, max_weapon_energy: 200,
    base_cargo_holds: 20, max_cargo_holds: 40,
    base_engine_energy: 100, max_engine_energy: 200,
    attack_ratio: 1.5, defense_ratio: 1.2,
    recharge_delay_ms: 5000, fuel_per_sector: 3, price: 75000,
    can_cloak: false, can_carry_pgd: true, can_carry_mines: true,
    can_tow: true, has_jump_drive_slot: true, has_planetary_scanner: true,
    max_drones: 2, tow_fuel_multiplier: 1.5,
  });

  await testDb('ship_types').insert({
    id: 'battleship', name: 'Kalin Battleship', description: 'Heavy warship',
    base_weapon_energy: 100, max_weapon_energy: 300,
    base_cargo_holds: 10, max_cargo_holds: 25,
    base_engine_energy: 80, max_engine_energy: 180,
    attack_ratio: 2.0, defense_ratio: 1.0,
    recharge_delay_ms: 7000, fuel_per_sector: 4, price: 150000,
    can_cloak: false, can_carry_pgd: true, can_carry_mines: true,
    can_tow: true, has_jump_drive_slot: true, has_planetary_scanner: true,
    max_drones: 3, tow_fuel_multiplier: 1.5,
  });

  await testDb('ship_types').insert({
    id: 'freighter', name: "Tar'ri Freighter", description: 'Cargo hauler',
    base_weapon_energy: 15, max_weapon_energy: 50,
    base_cargo_holds: 40, max_cargo_holds: 80,
    base_engine_energy: 60, max_engine_energy: 120,
    attack_ratio: 0.5, defense_ratio: 0.8,
    recharge_delay_ms: 8000, fuel_per_sector: 2, price: 15000,
    can_cloak: false, can_carry_pgd: false, can_carry_mines: false,
    can_tow: true, has_jump_drive_slot: false, has_planetary_scanner: false,
    max_drones: 1, tow_fuel_multiplier: 2.0,
  });

  await testDb('sectors').insert([
    { id: 1, type: 'protected', has_star_mall: true, has_seed_planet: false, region_id: 1 },
    { id: 2, type: 'standard', has_star_mall: false, has_seed_planet: false, region_id: 1 },
    { id: 3, type: 'standard', has_star_mall: false, has_seed_planet: true, region_id: 1 },
  ]);

  await testDb('sector_edges').insert([
    { from_sector_id: 1, to_sector_id: 2, one_way: false },
    { from_sector_id: 2, to_sector_id: 1, one_way: false },
    { from_sector_id: 2, to_sector_id: 3, one_way: false },
    { from_sector_id: 3, to_sector_id: 2, one_way: false },
  ]);

  await testDb('outposts').insert({
    id: 'outpost-1',
    name: 'Test Outpost',
    sector_id: 1,
    sells_fuel: true,
    cyrillium_stock: 5000, food_stock: 5000, tech_stock: 5000,
    cyrillium_capacity: 10000, food_capacity: 10000, tech_capacity: 10000,
    cyrillium_mode: 'sell', food_mode: 'buy', tech_mode: 'sell',
    treasury: 50000,
  });

  await testDb('planets').insert({
    id: 'planet-1',
    name: 'Test World',
    sector_id: 2,
    planet_class: 'H',
    colonists: 0,
    ideal_population: 15000,
    upgrade_level: 0,
  });

  await testDb('planets').insert({
    id: 'seed-planet-1',
    name: 'Seed World I',
    sector_id: 3,
    planet_class: 'S',
    colonists: 25000,
    ideal_population: 50000,
    upgrade_level: 0,
  });
});

afterAll(async () => {
  await testDb.destroy();
  // Clean up test DB file
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
});

describe('Integration: Registration & Login', () => {
  test('register creates a new player at star mall', async () => {
    const res = await agent()
      .post('/api/auth/register')
      .send({ username: 'testpilot', email: 'test@test.com', password: 'password123', race: 'muscarian' });

    expect(res.status).toBe(201);
    expect(res.body.player).toBeDefined();
    expect(res.body.player.username).toBe('testpilot');
    expect(res.body.player.currentSectorId).toBe(1); // star mall sector
    expect(res.body.player.currentShipId).toBeDefined();
  });

  test('rejects duplicate username', async () => {
    const res = await agent()
      .post('/api/auth/register')
      .send({ username: 'testpilot', email: 'other@test.com', password: 'password123', race: 'muscarian' });

    expect(res.status).toBe(409);
    expect(res.body.error).toContain('Username already taken');
  });

  test('rejects short password', async () => {
    const res = await agent()
      .post('/api/auth/register')
      .send({ username: 'newpilot', email: 'new@test.com', password: 'short', race: 'muscarian' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('8 characters');
  });

  test('login with correct credentials', async () => {
    const a = agent();
    const res = await a
      .post('/api/auth/login')
      .send({ username: 'testpilot', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.player.username).toBe('testpilot');
  });

  test('login with wrong password fails', async () => {
    const res = await agent()
      .post('/api/auth/login')
      .send({ username: 'testpilot', password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });
});

describe('Integration: Navigation', () => {
  let a: ReturnType<typeof agent>;

  beforeAll(async () => {
    a = agent();
    await a.post('/api/auth/login').send({ username: 'testpilot', password: 'password123' });
  });

  test('get player status', async () => {
    const res = await a.get('/api/game/status');
    expect(res.status).toBe(200);
    expect(res.body.username).toBe('testpilot');
    expect(res.body.energy).toBeGreaterThan(0);
  });

  test('get current sector contents', async () => {
    const res = await a.get('/api/game/sector');
    expect(res.status).toBe(200);
    expect(res.body.sectorId).toBe(1);
    expect(res.body.adjacentSectors.length).toBeGreaterThan(0);
    expect(res.body.outposts.length).toBeGreaterThan(0);
  });

  test('move to adjacent sector', async () => {
    const res = await a.post('/api/game/move/2');
    expect(res.status).toBe(200);
    expect(res.body.sectorId).toBe(2);

    // Verify status updated
    const status = await a.get('/api/game/status');
    expect(status.body.currentSectorId).toBe(2);
  });

  test('cannot move to non-adjacent sector', async () => {
    const res = await a.post('/api/game/move/99');
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('not adjacent');
  });

  test('move back to sector 1', async () => {
    const res = await a.post('/api/game/move/1');
    expect(res.status).toBe(200);
    expect(res.body.sectorId).toBe(1);
  });

  test('explored map grows as player moves', async () => {
    const res = await a.get('/api/game/map');
    expect(res.status).toBe(200);
    expect(res.body.sectors.length).toBeGreaterThanOrEqual(2);
  });
});

describe('Integration: Trading', () => {
  let a: ReturnType<typeof agent>;

  beforeAll(async () => {
    a = agent();
    await a.post('/api/auth/login').send({ username: 'testpilot', password: 'password123' });
    // Make sure we're at sector 1 (has outpost)
    await a.post('/api/game/move/1').catch(() => {});
    // Dock at outpost before trading
    await a.post('/api/game/dock').catch(() => {});
  });

  test('view outpost prices', async () => {
    const res = await a.get('/api/trade/outpost/outpost-1');
    expect(res.status).toBe(200);
    expect(res.body.prices.cyrillium).toBeDefined();
    expect(res.body.prices.cyrillium.mode).toBe('sell');
    expect(res.body.prices.food.mode).toBe('buy');
  });

  test('buy commodity from outpost', async () => {
    const statusBefore = await a.get('/api/game/status');
    const creditsBefore = statusBefore.body.credits;

    const res = await a.post('/api/trade/buy').send({
      outpostId: 'outpost-1',
      commodity: 'cyrillium',
      quantity: 5,
    });

    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(5);
    expect(res.body.totalCost).toBeGreaterThan(0);
    expect(res.body.newCredits).toBeLessThan(creditsBefore);
  });

  test('cannot buy commodity outpost does not sell', async () => {
    const res = await a.post('/api/trade/buy').send({
      outpostId: 'outpost-1',
      commodity: 'food', // food mode is 'buy', not 'sell'
      quantity: 5,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('does not sell');
  });
});

describe('Integration: Planet Claiming', () => {
  let a: ReturnType<typeof agent>;

  beforeAll(async () => {
    a = agent();
    await a.post('/api/auth/login').send({ username: 'testpilot', password: 'password123' });
    // Move to sector 2 (has unclaimed planet)
    const status = await a.get('/api/game/status');
    if (status.body.currentSectorId !== 2) {
      await a.post('/api/game/move/2');
    }
  });

  test('view planet details', async () => {
    const res = await a.get('/api/planets/planet-1');
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Test World');
    expect(res.body.ownerId).toBeNull();
  });

  test('claim unclaimed planet', async () => {
    const res = await a.post('/api/planets/planet-1/claim');
    expect(res.status).toBe(200);
    expect(res.body.ownerId).toBeDefined();

    // Verify planet is now claimed
    const planet = await a.get('/api/planets/planet-1');
    expect(planet.body.ownerId).toBe(res.body.ownerId);
  });

  test('cannot claim already claimed planet', async () => {
    // Register second player
    const b = agent();
    await b.post('/api/auth/register').send({ username: 'pilot2', email: 'p2@test.com', password: 'password123', race: 'muscarian' });
    await b.post('/api/game/move/2');

    const res = await b.post('/api/planets/planet-1/claim');
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('already claimed');
  });
});

describe('Integration: Combat', () => {
  let attacker: ReturnType<typeof agent>;
  let defender: ReturnType<typeof agent>;
  let defenderId: string;

  beforeAll(async () => {
    attacker = agent();
    await attacker.post('/api/auth/login').send({ username: 'testpilot', password: 'password123' });

    defender = agent();
    await defender.post('/api/auth/login').send({ username: 'pilot2', password: 'password123' });

    // Both move to sector 2 (standard, allows combat)
    await attacker.post('/api/game/move/2').catch(() => {});
    await defender.post('/api/game/move/2').catch(() => {});

    const defStatus = await defender.get('/api/game/status');
    defenderId = defStatus.body.id;
  });

  test('cannot fire in protected sector', async () => {
    // Move both to sector 1 (protected)
    await attacker.post('/api/game/move/1');
    const defStatus = await defender.get('/api/game/status');

    const res = await attacker.post('/api/combat/fire').send({
      targetPlayerId: defStatus.body.id,
      energyToExpend: 10,
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('Combat not allowed');

    // Move back
    await attacker.post('/api/game/move/2');
  });

  test('fire at player in same sector', async () => {
    // Both in sector 2
    await defender.post('/api/game/move/2').catch(() => {});

    const res = await attacker.post('/api/combat/fire').send({
      targetPlayerId: defenderId,
      energyToExpend: 5,
    });

    expect(res.status).toBe(200);
    expect(res.body.damageDealt).toBeGreaterThan(0);
    expect(res.body.attackerEnergySpent).toBeLessThanOrEqual(5);
  });

  test('flee from combat', async () => {
    const res = await defender.post('/api/combat/flee');
    expect(res.status).toBe(200);
    expect(typeof res.body.success).toBe('boolean');
    expect(res.body.fleeChance).toBeGreaterThan(0);
  });
});

describe('Integration: Unauthenticated access', () => {
  test('status requires auth', async () => {
    const res = await request(app).get('/api/game/status');
    expect(res.status).toBe(401);
  });

  test('move requires auth', async () => {
    const res = await request(app).post('/api/game/move/1');
    expect(res.status).toBe(401);
  });

  test('trade requires auth', async () => {
    const res = await request(app).post('/api/trade/buy').send({});
    expect(res.status).toBe(401);
  });
});
