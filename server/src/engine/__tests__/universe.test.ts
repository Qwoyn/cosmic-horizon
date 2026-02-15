import { generateUniverse, UniverseGraph } from '../universe';

describe('Universe Generation', () => {
  let universe: UniverseGraph;

  beforeAll(() => {
    universe = generateUniverse(100, 42); // small test universe with seed
  });

  test('generates correct number of sectors', () => {
    expect(universe.sectors.size).toBe(100);
  });

  test('all sectors are connected (no isolated nodes)', () => {
    // Build undirected adjacency for weak connectivity check
    // (one-way edges still connect sectors, just in one direction)
    const undirected = new Map<number, Set<number>>();
    for (let i = 1; i <= 100; i++) undirected.set(i, new Set());
    for (const [sectorId, edges] of universe.edges) {
      for (const edge of edges) {
        undirected.get(sectorId)!.add(edge.to);
        undirected.get(edge.to)!.add(sectorId);
      }
    }

    const visited = new Set<number>();
    const queue = [universe.sectors.keys().next().value!];
    while (queue.length > 0) {
      const current = queue.pop()!;
      if (visited.has(current)) continue;
      visited.add(current);
      for (const neighbor of undirected.get(current) || []) {
        if (!visited.has(neighbor)) queue.push(neighbor);
      }
    }
    expect(visited.size).toBe(100);
  });

  test('sectors have max 12 adjacent sectors', () => {
    for (const [, edges] of universe.edges) {
      expect(edges.length).toBeLessThanOrEqual(12);
    }
  });

  test('includes star malls in protected sectors', () => {
    const starMalls = [...universe.sectors.values()].filter(s => s.hasStarMall);
    expect(starMalls.length).toBeGreaterThanOrEqual(1);
    for (const mall of starMalls) {
      expect(mall.type).toBe('protected');
    }
  });

  test('includes seed planets', () => {
    const seedPlanets = [...universe.sectors.values()].filter(s => s.hasSeedPlanet);
    expect(seedPlanets.length).toBeGreaterThanOrEqual(1);
  });

  test('deterministic with same seed', () => {
    const universe2 = generateUniverse(100, 42);
    expect(universe2.sectors.size).toBe(universe.sectors.size);
    const sector1 = universe.sectors.get(1);
    const sector2 = universe2.sectors.get(1);
    expect(sector1?.type).toBe(sector2?.type);
    expect(sector1?.regionId).toBe(sector2?.regionId);
  });

  test('different seed produces different universe', () => {
    const universe2 = generateUniverse(100, 99);
    // At least some sectors should differ in region assignment
    let differences = 0;
    for (let i = 1; i <= 100; i++) {
      if (universe.sectors.get(i)?.regionId !== universe2.sectors.get(i)?.regionId) {
        differences++;
      }
    }
    expect(differences).toBeGreaterThan(0);
  });

  test('has multiple sector types', () => {
    const types = new Set([...universe.sectors.values()].map(s => s.type));
    expect(types.size).toBeGreaterThan(1);
  });

  test('one-way edges are not bidirectional', () => {
    for (const [sectorId, edges] of universe.edges) {
      for (const edge of edges) {
        if (edge.oneWay) {
          const reverseEdges = universe.edges.get(edge.to) || [];
          const hasReverse = reverseEdges.some(e => e.to === sectorId);
          expect(hasReverse).toBe(false);
        }
      }
    }
  });
});
