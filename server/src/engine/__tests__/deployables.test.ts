import {
  detonateMine,
  resolveDroneInteraction,
  calculateRacheDamage,
  isDeployableExpired,
  calculateBarnacleEngineDrain,
  DeployableState,
} from '../deployables';

describe('Mine Detonation', () => {
  test('halberd mine deals damage and is destroyed', () => {
    const mine: DeployableState = { type: 'mine_halberd', powerLevel: 1, health: 100, ownerId: 'p1' };
    const result = detonateMine(mine);

    expect(result.triggered).toBe(true);
    expect(result.damageDealt).toBe(20);
    expect(result.mineDestroyed).toBe(true);
    expect(result.type).toBe('mine_halberd');
  });

  test('halberd mine scales with power level', () => {
    const mine: DeployableState = { type: 'mine_halberd', powerLevel: 3, health: 100, ownerId: 'p1' };
    const result = detonateMine(mine);

    expect(result.damageDealt).toBe(60);
  });

  test('barnacle mine attaches and persists', () => {
    const mine: DeployableState = { type: 'mine_barnacle', powerLevel: 1, health: 100, ownerId: 'p1' };
    const result = detonateMine(mine);

    expect(result.triggered).toBe(true);
    expect(result.damageDealt).toBe(5);
    expect(result.mineDestroyed).toBe(false); // barnacles persist
  });

  test('unknown mine type does not trigger', () => {
    const mine: DeployableState = { type: 'unknown', powerLevel: 1, health: 100, ownerId: 'p1' };
    const result = detonateMine(mine);

    expect(result.triggered).toBe(false);
    expect(result.damageDealt).toBe(0);
  });
});

describe('Drone Interaction', () => {
  test('offensive drone attacks', () => {
    const drone: DeployableState = { type: 'drone_offensive', powerLevel: 1, health: 100, ownerId: 'p1' };
    const result = resolveDroneInteraction(drone, null);

    expect(result.attacked).toBe(true);
    expect(result.damageDealt).toBe(10);
  });

  test('offensive drone scales with power level', () => {
    const drone: DeployableState = { type: 'drone_offensive', powerLevel: 2, health: 100, ownerId: 'p1' };
    const result = resolveDroneInteraction(drone, null);

    expect(result.damageDealt).toBe(20);
  });

  test('toll drone charges toll', () => {
    const drone: DeployableState = { type: 'drone_toll', powerLevel: 1, health: 100, ownerId: 'p1' };
    const result = resolveDroneInteraction(drone, 250);

    expect(result.attacked).toBe(false);
    expect(result.tollCharged).toBe(250);
  });

  test('toll drone uses default toll when none set', () => {
    const drone: DeployableState = { type: 'drone_toll', powerLevel: 1, health: 100, ownerId: 'p1' };
    const result = resolveDroneInteraction(drone, null);

    expect(result.tollCharged).toBe(100);
  });

  test('defensive drone does not attack', () => {
    const drone: DeployableState = { type: 'drone_defensive', powerLevel: 1, health: 100, ownerId: 'p1' };
    const result = resolveDroneInteraction(drone, null);

    expect(result.attacked).toBe(false);
    expect(result.damageDealt).toBe(0);
  });
});

describe('Rache Device', () => {
  test('rache deals 50% of weapon energy as damage', () => {
    expect(calculateRacheDamage(100)).toBe(50);
    expect(calculateRacheDamage(75)).toBe(37);
    expect(calculateRacheDamage(0)).toBe(0);
  });
});

describe('Deployable Expiry', () => {
  test('fresh deployable is not expired', () => {
    const deployed = new Date();
    expect(isDeployableExpired(deployed)).toBe(false);
  });

  test('old deployable is expired', () => {
    const deployed = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000); // 8 days ago
    expect(isDeployableExpired(deployed)).toBe(true);
  });

  test('custom lifetime works', () => {
    const deployed = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
    expect(isDeployableExpired(deployed, 1)).toBe(true); // 1 day lifetime
    expect(isDeployableExpired(deployed, 3)).toBe(false); // 3 day lifetime
  });
});

describe('Barnacle Engine Drain', () => {
  test('drain scales with power level', () => {
    expect(calculateBarnacleEngineDrain(1)).toBe(2);
    expect(calculateBarnacleEngineDrain(3)).toBe(6);
  });
});
