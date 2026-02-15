export interface ShipTypeConfig {
  id: string;
  name: string;
  description: string;
  baseWeaponEnergy: number;
  maxWeaponEnergy: number;
  baseCargoHolds: number;
  maxCargoHolds: number;
  baseEngineEnergy: number;
  maxEngineEnergy: number;
  attackRatio: number;
  defenseRatio: number;
  rechargeDelayMs: number;
  fuelPerSector: number;
  price: number;
  canCloak: boolean;
  canCarryPgd: boolean;
  canCarryMines: boolean;
  canTow: boolean;
  hasJumpDriveSlot: boolean;
  hasPlanetaryScanner: boolean;
  maxDrones: number;
  towFuelMultiplier: number;
}

export const SHIP_TYPES: ShipTypeConfig[] = [
  {
    id: 'dodge_pod',
    name: 'DodgePod',
    description: 'Emergency escape pod. No weapons, no cargo.',
    baseWeaponEnergy: 0, maxWeaponEnergy: 0,
    baseCargoHolds: 0, maxCargoHolds: 0,
    baseEngineEnergy: 20, maxEngineEnergy: 20,
    attackRatio: 0, defenseRatio: 0,
    rechargeDelayMs: 0, fuelPerSector: 1, price: 0,
    canCloak: false, canCarryPgd: false, canCarryMines: false,
    canTow: false, hasJumpDriveSlot: false, hasPlanetaryScanner: false,
    maxDrones: 0, towFuelMultiplier: 1,
  },
  {
    id: 'scout',
    name: 'Calvatian Scout',
    description: 'A nimble starter ship. Light weapons, modest cargo. Good for exploration and early trading.',
    baseWeaponEnergy: 25, maxWeaponEnergy: 75,
    baseCargoHolds: 10, maxCargoHolds: 20,
    baseEngineEnergy: 50, maxEngineEnergy: 100,
    attackRatio: 0.8, defenseRatio: 1.0,
    rechargeDelayMs: 4000, fuelPerSector: 1, price: 5000,
    canCloak: false, canCarryPgd: false, canCarryMines: false,
    canTow: false, hasJumpDriveSlot: false, hasPlanetaryScanner: false,
    maxDrones: 1, towFuelMultiplier: 1,
  },
  {
    id: 'freighter',
    name: 'Tar\'ri Freighter',
    description: 'Built for hauling. Massive cargo capacity but weak in combat.',
    baseWeaponEnergy: 15, maxWeaponEnergy: 50,
    baseCargoHolds: 40, maxCargoHolds: 80,
    baseEngineEnergy: 60, maxEngineEnergy: 120,
    attackRatio: 0.5, defenseRatio: 0.8,
    rechargeDelayMs: 8000, fuelPerSector: 2, price: 15000,
    canCloak: false, canCarryPgd: false, canCarryMines: false,
    canTow: true, hasJumpDriveSlot: false, hasPlanetaryScanner: false,
    maxDrones: 1, towFuelMultiplier: 2.0,
  },
  {
    id: 'corvette',
    name: 'Muscarian Corvette',
    description: 'A balanced warship. Decent weapons and cargo. Can carry mines.',
    baseWeaponEnergy: 50, maxWeaponEnergy: 150,
    baseCargoHolds: 15, maxCargoHolds: 30,
    baseEngineEnergy: 75, maxEngineEnergy: 150,
    attackRatio: 1.2, defenseRatio: 1.0,
    rechargeDelayMs: 5000, fuelPerSector: 2, price: 30000,
    canCloak: false, canCarryPgd: false, canCarryMines: true,
    canTow: true, hasJumpDriveSlot: false, hasPlanetaryScanner: false,
    maxDrones: 2, towFuelMultiplier: 1.8,
  },
  {
    id: 'cruiser',
    name: 'Vedic Cruiser',
    description: 'Advanced multi-role vessel. Strong scanners, can carry PGDs. Jump drive capable.',
    baseWeaponEnergy: 75, maxWeaponEnergy: 200,
    baseCargoHolds: 20, maxCargoHolds: 40,
    baseEngineEnergy: 100, maxEngineEnergy: 200,
    attackRatio: 1.5, defenseRatio: 1.2,
    rechargeDelayMs: 5000, fuelPerSector: 3, price: 75000,
    canCloak: false, canCarryPgd: true, canCarryMines: true,
    canTow: true, hasJumpDriveSlot: true, hasPlanetaryScanner: true,
    maxDrones: 2, towFuelMultiplier: 1.5,
  },
  {
    id: 'battleship',
    name: 'Kalin Battleship',
    description: 'Devastating firepower and heavy defenses. Slow, expensive, and feared.',
    baseWeaponEnergy: 100, maxWeaponEnergy: 300,
    baseCargoHolds: 10, maxCargoHolds: 25,
    baseEngineEnergy: 80, maxEngineEnergy: 180,
    attackRatio: 2.0, defenseRatio: 1.0,
    rechargeDelayMs: 7000, fuelPerSector: 4, price: 150000,
    canCloak: false, canCarryPgd: true, canCarryMines: true,
    canTow: true, hasJumpDriveSlot: true, hasPlanetaryScanner: true,
    maxDrones: 3, towFuelMultiplier: 1.5,
  },
  {
    id: 'stealth',
    name: 'Shadow Runner',
    description: 'Cloaking-capable vessel. Light weapons but nearly invisible. Perfect for espionage.',
    baseWeaponEnergy: 30, maxWeaponEnergy: 80,
    baseCargoHolds: 8, maxCargoHolds: 15,
    baseEngineEnergy: 60, maxEngineEnergy: 120,
    attackRatio: 0.9, defenseRatio: 1.5,
    rechargeDelayMs: 3000, fuelPerSector: 2, price: 50000,
    canCloak: true, canCarryPgd: false, canCarryMines: true,
    canTow: false, hasJumpDriveSlot: false, hasPlanetaryScanner: false,
    maxDrones: 1, towFuelMultiplier: 1,
  },
  {
    id: 'colony_ship',
    name: 'Muscarian Colony Ship',
    description: 'Specialized for transporting colonists. High capacity, minimal combat ability.',
    baseWeaponEnergy: 10, maxWeaponEnergy: 30,
    baseCargoHolds: 60, maxCargoHolds: 100,
    baseEngineEnergy: 50, maxEngineEnergy: 100,
    attackRatio: 0.3, defenseRatio: 0.5,
    rechargeDelayMs: 10000, fuelPerSector: 3, price: 25000,
    canCloak: false, canCarryPgd: false, canCarryMines: false,
    canTow: false, hasJumpDriveSlot: false, hasPlanetaryScanner: false,
    maxDrones: 0, towFuelMultiplier: 1,
  },
];
