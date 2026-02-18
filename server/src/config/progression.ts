export interface RankDefinition {
  minLevel: number;
  maxLevel: number;
  title: string;
}

export const RANK_TABLE: RankDefinition[] = [
  { minLevel: 1,   maxLevel: 4,   title: 'Recruit' },
  { minLevel: 5,   maxLevel: 9,   title: 'Cadet' },
  { minLevel: 10,  maxLevel: 14,  title: 'Ensign' },
  { minLevel: 15,  maxLevel: 19,  title: 'Lieutenant' },
  { minLevel: 20,  maxLevel: 24,  title: 'Commander' },
  { minLevel: 25,  maxLevel: 29,  title: 'Captain' },
  { minLevel: 30,  maxLevel: 34,  title: 'Commodore' },
  { minLevel: 35,  maxLevel: 39,  title: 'Rear Admiral' },
  { minLevel: 40,  maxLevel: 44,  title: 'Vice Admiral' },
  { minLevel: 45,  maxLevel: 49,  title: 'Admiral' },
  { minLevel: 50,  maxLevel: 54,  title: 'Fleet Admiral' },
  { minLevel: 55,  maxLevel: 59,  title: 'Warden' },
  { minLevel: 60,  maxLevel: 64,  title: 'Sentinel' },
  { minLevel: 65,  maxLevel: 69,  title: 'Vanguard' },
  { minLevel: 70,  maxLevel: 74,  title: 'Champion' },
  { minLevel: 75,  maxLevel: 79,  title: 'Overlord' },
  { minLevel: 80,  maxLevel: 84,  title: 'Star Marshal' },
  { minLevel: 85,  maxLevel: 89,  title: 'Galactic Commander' },
  { minLevel: 90,  maxLevel: 94,  title: 'Cosmic Admiral' },
  { minLevel: 95,  maxLevel: 99,  title: 'Cosmic Sovereign' },
  { minLevel: 100, maxLevel: 100, title: 'Cosmic Legend' },
];

export function getRankTitle(level: number): string {
  const rank = RANK_TABLE.find(r => level >= r.minLevel && level <= r.maxLevel);
  return rank?.title ?? 'Recruit';
}

// XP required to reach level N (cumulative from level 1).
// Level 1 = 0 XP. Level 2 = floor(100 * 2^1.8) = 348.
// Level 10 = 6,310. Level 50 = 118,850. Level 100 = 398,107.
export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level, 1.8));
}

// Determine what level a given total XP corresponds to (capped at 100).
export function levelForXp(totalXp: number): number {
  let level = 1;
  while (level < 100 && totalXp >= xpForLevel(level + 1)) {
    level++;
  }
  return level;
}

// Rotating stat bonus per level: cargo at mod 0, weapon at mod 1, engine at mod 2.
export type BonusStat = 'cargo' | 'weapon' | 'engine';

export function getLevelUpBonusStat(level: number): BonusStat {
  const mod = level % 3;
  if (mod === 0) return 'cargo';
  if (mod === 1) return 'weapon';
  return 'engine';
}
