export interface PlanetTypeConfig {
  classId: string;
  name: string;
  idealPopulation: number;
  productionRates: {
    cyrillium: number;  // units per 1000 colonists per tick
    food: number;
    tech: number;
    drones: number; // drones per 1000 colonists per day
  };
  colonistGrowthRate: number; // % growth per tick when resources available
}

export const PLANET_TYPES: Record<string, PlanetTypeConfig> = {
  H: {
    classId: 'H',
    name: 'Goldilocks (Hospitable)',
    idealPopulation: 15000,
    productionRates: { cyrillium: 2, food: 8, tech: 3, drones: 0.5 },
    colonistGrowthRate: 0.003,
  },
  D: {
    classId: 'D',
    name: 'Desert',
    idealPopulation: 8000,
    productionRates: { cyrillium: 8, food: 1, tech: 2, drones: 0.3 },
    colonistGrowthRate: 0.001,
  },
  O: {
    classId: 'O',
    name: 'Ocean',
    idealPopulation: 12000,
    productionRates: { cyrillium: 1, food: 10, tech: 1, drones: 0.2 },
    colonistGrowthRate: 0.0025,
  },
  A: {
    classId: 'A',
    name: 'Alpine',
    idealPopulation: 10000,
    productionRates: { cyrillium: 3, food: 4, tech: 5, drones: 0.4 },
    colonistGrowthRate: 0.002,
  },
  F: {
    classId: 'F',
    name: 'Frozen',
    idealPopulation: 6000,
    productionRates: { cyrillium: 5, food: 1, tech: 6, drones: 0.6 },
    colonistGrowthRate: 0.001,
  },
  V: {
    classId: 'V',
    name: 'Volcanic',
    idealPopulation: 5000,
    productionRates: { cyrillium: 10, food: 0, tech: 4, drones: 0.8 },
    colonistGrowthRate: 0.0008,
  },
  G: {
    classId: 'G',
    name: 'Gaseous',
    idealPopulation: 3000,
    productionRates: { cyrillium: 12, food: 0, tech: 8, drones: 0.1 },
    colonistGrowthRate: 0.0005,
  },
  S: {
    classId: 'S',
    name: 'Seed Planet',
    idealPopulation: 50000,
    productionRates: { cyrillium: 0, food: 5, tech: 0, drones: 0 },
    colonistGrowthRate: 0.005, // fast growth - always producing colonists
  },
};

// Upgrade requirements per level
export const UPGRADE_REQUIREMENTS: Record<number, {
  colonists: number;
  cyrillium: number;
  food: number;
  tech: number;
  credits: number;
}> = {
  1: { colonists: 1000, cyrillium: 100, food: 200, tech: 100, credits: 5000 },
  2: { colonists: 3000, cyrillium: 300, food: 500, tech: 300, credits: 15000 },
  3: { colonists: 5000, cyrillium: 800, food: 800, tech: 800, credits: 40000 },
  4: { colonists: 8000, cyrillium: 1500, food: 1000, tech: 1500, credits: 80000 },
  5: { colonists: 10000, cyrillium: 3000, food: 1500, tech: 3000, credits: 150000 },
  6: { colonists: 12000, cyrillium: 5000, food: 2000, tech: 5000, credits: 250000 },
  7: { colonists: 15000, cyrillium: 10000, food: 3000, tech: 10000, credits: 500000 },
};
