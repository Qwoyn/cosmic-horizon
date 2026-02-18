import { GAME_CONFIG } from '../config/game';

export interface SectorData {
  id: number;
  type: 'standard' | 'one_way' | 'protected' | 'harmony_enforced';
  hasStarMall: boolean;
  hasSeedPlanet: boolean;
  regionId: number;
}

export interface SectorEdge {
  from: number;
  to: number;
  oneWay: boolean;
}

export interface UniverseGraph {
  sectors: Map<number, SectorData>;
  edges: Map<number, SectorEdge[]>;
}

// Seeded random number generator (mulberry32)
function createRng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleArray<T>(arr: T[], rng: () => number): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function addEdge(
  edges: Map<number, SectorEdge[]>,
  from: number,
  to: number,
  oneWay: boolean
): void {
  const fromEdges = edges.get(from) || [];
  const toEdges = edges.get(to) || [];

  if (fromEdges.some(e => e.to === to)) return;

  fromEdges.push({ from, to, oneWay });
  edges.set(from, fromEdges);

  if (!oneWay) {
    if (!toEdges.some(e => e.to === from)) {
      toEdges.push({ from: to, to: from, oneWay: false });
      edges.set(to, toEdges);
    }
  }
}

// BFS shortest path
export function findShortestPath(
  edges: Map<number, SectorEdge[]>,
  start: number,
  end: number,
  maxDepth: number = 20
): number[] | null {
  if (start === end) return [start];

  const visited = new Set<number>();
  const queue: Array<{ node: number; path: number[] }> = [{ node: start, path: [start] }];
  visited.add(start);

  while (queue.length > 0) {
    const { node, path } = queue.shift()!;
    if (path.length > maxDepth) continue;

    for (const edge of edges.get(node) || []) {
      if (visited.has(edge.to)) continue;
      const newPath = [...path, edge.to];
      if (edge.to === end) return newPath;
      visited.add(edge.to);
      queue.push({ node: edge.to, path: newPath });
    }
  }
  return null;
}

export function generateUniverse(
  totalSectors: number = GAME_CONFIG.TOTAL_SECTORS,
  seed: number = Date.now()
): UniverseGraph {
  const rng = createRng(seed);
  const sectors = new Map<number, SectorData>();
  const edges = new Map<number, SectorEdge[]>();

  // Initialize all sectors
  for (let i = 1; i <= totalSectors; i++) {
    sectors.set(i, {
      id: i,
      type: 'standard',
      hasStarMall: false,
      hasSeedPlanet: false,
      regionId: 0,
    });
    edges.set(i, []);
  }

  // Generate regions (clusters)
  const avgRegionSize = Math.max(5, Math.floor(totalSectors / Math.ceil(totalSectors / GAME_CONFIG.SECTORS_PER_REGION)));
  const sectorIds = shuffleArray([...Array(totalSectors)].map((_, i) => i + 1), rng);
  let regionId = 0;
  let idx = 0;

  const regions: number[][] = [];
  while (idx < sectorIds.length) {
    const regionSize = Math.max(3, Math.floor(avgRegionSize * (0.6 + rng() * 0.8)));
    const region = sectorIds.slice(idx, idx + regionSize);
    regions.push(region);
    for (const sid of region) {
      sectors.get(sid)!.regionId = regionId;
    }
    regionId++;
    idx += regionSize;
  }

  // Connect sectors within each region (create a connected subgraph)
  for (const region of regions) {
    // Spanning tree first (ensures connectivity)
    for (let i = 1; i < region.length; i++) {
      const connectTo = region[Math.floor(rng() * i)];
      addEdge(edges, region[i], connectTo, false);
    }
    // Extra edges within region for richer connectivity
    const extraEdges = Math.floor(region.length * 0.5);
    for (let i = 0; i < extraEdges; i++) {
      const a = region[Math.floor(rng() * region.length)];
      const b = region[Math.floor(rng() * region.length)];
      if (a !== b && (edges.get(a)?.length || 0) < GAME_CONFIG.MAX_ADJACENT_SECTORS) {
        addEdge(edges, a, b, false);
      }
    }
  }

  // Connect regions together (inter-region edges via spanning tree)
  for (let i = 1; i < regions.length; i++) {
    const targetRegion = regions[Math.floor(rng() * i)];
    const sourceNode = regions[i][Math.floor(rng() * regions[i].length)];
    const targetNode = targetRegion[Math.floor(rng() * targetRegion.length)];
    addEdge(edges, sourceNode, targetNode, false);
  }

  // Extra inter-region connections
  const extraInterRegion = Math.floor(regions.length * 0.3);
  for (let i = 0; i < extraInterRegion; i++) {
    const rA = Math.floor(rng() * regions.length);
    const rB = Math.floor(rng() * regions.length);
    if (rA !== rB) {
      const a = regions[rA][Math.floor(rng() * regions[rA].length)];
      const b = regions[rB][Math.floor(rng() * regions[rB].length)];
      addEdge(edges, a, b, false);
    }
  }

  // Assign sector types
  const allSectorIds = [...sectors.keys()];
  const shuffledIds = shuffleArray(allSectorIds, rng);

  const numStarMalls = Math.max(1, Math.min(GAME_CONFIG.NUM_STAR_MALLS, Math.floor(totalSectors / 500)));
  const numSeedPlanets = Math.max(1, Math.min(GAME_CONFIG.NUM_SEED_PLANETS, Math.floor(totalSectors / 300)));
  const numOneWay = Math.floor(totalSectors * GAME_CONFIG.SECTOR_TYPE_DISTRIBUTION.one_way);

  let assignIdx = 0;

  // Assign star malls (protected sectors)
  for (let i = 0; i < numStarMalls && assignIdx < shuffledIds.length; i++, assignIdx++) {
    const sid = shuffledIds[assignIdx];
    const sector = sectors.get(sid)!;
    sector.type = 'protected';
    sector.hasStarMall = true;
    // Mark adjacent sectors as protected too
    for (const edge of edges.get(sid) || []) {
      const adj = sectors.get(edge.to)!;
      if (adj.type === 'standard') {
        adj.type = 'protected';
      }
    }
  }

  // Assign seed planets (in protected sectors near star malls)
  let seedsPlaced = 0;
  for (const [, sector] of sectors) {
    if (seedsPlaced >= numSeedPlanets) break;
    if (sector.type === 'protected' && !sector.hasStarMall && !sector.hasSeedPlanet) {
      sector.hasSeedPlanet = true;
      seedsPlaced++;
    }
  }
  // If not enough protected sectors, place remaining in fresh protected sectors
  while (seedsPlaced < numSeedPlanets && assignIdx < shuffledIds.length) {
    const sid = shuffledIds[assignIdx++];
    const sector = sectors.get(sid)!;
    if (sector.type === 'standard') {
      sector.type = 'protected';
      sector.hasSeedPlanet = true;
      seedsPlaced++;
    }
  }

  // Assign one-way sectors
  // Only convert an edge to one-way if the source sector has at least 2 incoming edges
  // (so removing the reverse doesn't isolate it) and the target has other incoming edges
  let oneWayCount = 0;
  for (; assignIdx < shuffledIds.length && oneWayCount < numOneWay; assignIdx++) {
    const sid = shuffledIds[assignIdx];
    const sector = sectors.get(sid)!;
    if (sector.type === 'standard') {
      const sectorEdges = edges.get(sid) || [];
      if (sectorEdges.length < 2) continue; // need at least 2 edges to safely make one one-way

      // Find an edge where the target will still have outgoing edges after removing the reverse
      let converted = false;
      const shuffledEdges = shuffleArray([...sectorEdges], rng);
      for (const edge of shuffledEdges) {
        // Count outgoing edges from the target sector
        const targetOutgoing = (edges.get(edge.to) || []).length;
        // Target needs at least 2 outgoing edges so it keeps >=1 after we remove the reverse
        if (targetOutgoing >= 2) {
          edge.oneWay = true;
          // Remove the reverse edge
          const reverseEdges = edges.get(edge.to) || [];
          const revIdx = reverseEdges.findIndex(e => e.to === sid);
          if (revIdx >= 0) reverseEdges.splice(revIdx, 1);
          converted = true;
          break;
        }
      }
      if (converted) {
        sector.type = 'one_way';
        oneWayCount++;
      }
    }
  }

  // Mark harmony-enforced routes between star malls and seed planets
  const starMallSectors = [...sectors.values()].filter(s => s.hasStarMall);
  const seedPlanetSectors = [...sectors.values()].filter(s => s.hasSeedPlanet);

  for (const mall of starMallSectors) {
    for (const seed of seedPlanetSectors) {
      const path = findShortestPath(edges, mall.id, seed.id);
      if (path) {
        for (const sid of path) {
          const sector = sectors.get(sid)!;
          if (sector.type === 'standard') {
            sector.type = 'harmony_enforced';
          }
        }
      }
    }
  }

  return { sectors, edges };
}
