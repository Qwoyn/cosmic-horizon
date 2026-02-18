import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clean up existing tablet data
  await knex('player_tablets').del();
  await knex('tablet_definitions').del();

  // Rarity palette colors
  const COLORS = {
    common: '#808080',
    uncommon: '#2ecc71',
    rare: '#3498db',
    epic: '#9b59b6',
    legendary: '#e67e22',
    mythic: '#e74c3c',
  };

  const spriteConfig = (rarity: keyof typeof COLORS) =>
    JSON.stringify({ spriteId: 'item_tablet', paletteSwap: { '1': COLORS[rarity] } });

  // Insert tablet definitions
  await knex('tablet_definitions').insert([
    // ── COMMON (8) ──────────────────────────────────────────────────────
    {
      id: 'tablet_iron_focus',
      name: 'Iron Focus',
      description: 'A simple focusing crystal that sharpens weapon targeting.',
      rarity: 'common',
      effects: JSON.stringify({ weaponBonus: 2 }),
      sprite_config: spriteConfig('common'),
    },
    {
      id: 'tablet_swift_step',
      name: 'Swift Step',
      description: 'A lightweight energy conduit that enhances engine output.',
      rarity: 'common',
      effects: JSON.stringify({ engineBonus: 2 }),
      sprite_config: spriteConfig('common'),
    },
    {
      id: 'tablet_deep_hold',
      name: 'Deep Hold',
      description: 'A compressed storage matrix that expands cargo capacity.',
      rarity: 'common',
      effects: JSON.stringify({ cargoBonus: 3 }),
      sprite_config: spriteConfig('common'),
    },
    {
      id: 'tablet_hull_plate',
      name: 'Hull Plate',
      description: 'A reinforced plating fragment that absorbs impact.',
      rarity: 'common',
      effects: JSON.stringify({ shieldBonus: 3 }),
      sprite_config: spriteConfig('common'),
    },
    {
      id: 'tablet_quick_study',
      name: 'Quick Study',
      description: 'A mnemonic enhancer that accelerates learning.',
      rarity: 'common',
      effects: JSON.stringify({ xpMultiplier: 0.05 }),
      sprite_config: spriteConfig('common'),
    },
    {
      id: 'tablet_dust_ward',
      name: 'Dust Ward',
      description: 'A particle deflector that slightly improves evasion.',
      rarity: 'common',
      effects: JSON.stringify({ fleeBonus: 0.02 }),
      sprite_config: spriteConfig('common'),
    },
    {
      id: 'tablet_spark_cell',
      name: 'Spark Cell',
      description: 'A basic energy cell with minor weapon enhancement.',
      rarity: 'common',
      effects: JSON.stringify({ weaponBonus: 1, engineBonus: 1 }),
      sprite_config: spriteConfig('common'),
    },
    {
      id: 'tablet_traders_charm',
      name: "Trader's Charm",
      description: 'A lucky coin said to bring fortune in trade.',
      rarity: 'common',
      effects: JSON.stringify({ cargoBonus: 2, xpMultiplier: 0.03 }),
      sprite_config: spriteConfig('common'),
    },

    // ── UNCOMMON (7) ────────────────────────────────────────────────────
    {
      id: 'tablet_void_runner',
      name: 'Void Runner',
      description: 'An engine-tuned crystal from the frontier.',
      rarity: 'uncommon',
      effects: JSON.stringify({ engineBonus: 4, fleeBonus: 0.03 }),
      sprite_config: spriteConfig('uncommon'),
    },
    {
      id: 'tablet_iron_bark',
      name: 'Iron Bark',
      description: 'Muscarian hull fungus that grows into armor.',
      rarity: 'uncommon',
      effects: JSON.stringify({ shieldBonus: 5, cargoBonus: 2 }),
      sprite_config: spriteConfig('uncommon'),
    },
    {
      id: 'tablet_phase_lens',
      name: 'Phase Lens',
      description: 'A targeting lens that improves weapon accuracy.',
      rarity: 'uncommon',
      effects: JSON.stringify({ weaponBonus: 4, xpMultiplier: 0.05 }),
      sprite_config: spriteConfig('uncommon'),
    },
    {
      id: 'tablet_cargo_weave',
      name: 'Cargo Weave',
      description: 'A lattice that compresses cargo into tighter spaces.',
      rarity: 'uncommon',
      effects: JSON.stringify({ cargoBonus: 6 }),
      sprite_config: spriteConfig('uncommon'),
    },
    {
      id: 'tablet_nebula_shard',
      name: 'Nebula Shard',
      description: 'A crystallized fragment of nebula gas.',
      rarity: 'uncommon',
      effects: JSON.stringify({ engineBonus: 3, shieldBonus: 3 }),
      sprite_config: spriteConfig('uncommon'),
    },
    {
      id: 'tablet_scouts_eye',
      name: "Scout's Eye",
      description: 'An observation enhancer from the Frontier Rangers.',
      rarity: 'uncommon',
      effects: JSON.stringify({ xpMultiplier: 0.08, fleeBonus: 0.03 }),
      sprite_config: spriteConfig('uncommon'),
    },
    {
      id: 'tablet_battle_rune',
      name: 'Battle Rune',
      description: 'An ancient combat glyph pulsing with energy.',
      rarity: 'uncommon',
      effects: JSON.stringify({ weaponBonus: 5 }),
      sprite_config: spriteConfig('uncommon'),
    },

    // ── RARE (6) ────────────────────────────────────────────────────────
    {
      id: 'tablet_war_shard',
      name: 'War Shard',
      description: "A fragment of a destroyed warship's power core.",
      rarity: 'rare',
      effects: JSON.stringify({ weaponBonus: 8 }),
      sprite_config: spriteConfig('rare'),
    },
    {
      id: 'tablet_ghost_drive',
      name: 'Ghost Drive',
      description: 'A cloaking-enhanced engine module.',
      rarity: 'rare',
      effects: JSON.stringify({ engineBonus: 6, fleeBonus: 0.06 }),
      sprite_config: spriteConfig('rare'),
    },
    {
      id: 'tablet_fortress_seal',
      name: 'Fortress Seal',
      description: 'A defensive ward from a legendary station.',
      rarity: 'rare',
      effects: JSON.stringify({ shieldBonus: 8, cargoBonus: 3 }),
      sprite_config: spriteConfig('rare'),
    },
    {
      id: 'tablet_scholars_tome',
      name: "Scholar's Tome",
      description: 'A knowledge repository of the Cosmic Scholars.',
      rarity: 'rare',
      effects: JSON.stringify({ xpMultiplier: 0.12, weaponBonus: 3 }),
      sprite_config: spriteConfig('rare'),
    },
    {
      id: 'tablet_merchants_ledger',
      name: "Merchant's Ledger",
      description: 'Trade secrets of the Traders Guild.',
      rarity: 'rare',
      effects: JSON.stringify({ cargoBonus: 8, xpMultiplier: 0.05 }),
      sprite_config: spriteConfig('rare'),
    },
    {
      id: 'tablet_storm_core',
      name: 'Storm Core',
      description: 'Harnessed ion storm energy.',
      rarity: 'rare',
      effects: JSON.stringify({ weaponBonus: 5, engineBonus: 5 }),
      sprite_config: spriteConfig('rare'),
    },

    // ── EPIC (5) ────────────────────────────────────────────────────────
    {
      id: 'tablet_nova_core',
      name: 'Nova Core',
      description: 'A crystallized fragment of a dying star.',
      rarity: 'epic',
      effects: JSON.stringify({ weaponBonus: 6, engineBonus: 4, shieldBonus: 5 }),
      sprite_config: spriteConfig('epic'),
    },
    {
      id: 'tablet_phantom_cloak',
      name: 'Phantom Cloak',
      description: 'Shadow Syndicate evasion technology.',
      rarity: 'epic',
      effects: JSON.stringify({ fleeBonus: 0.10, engineBonus: 6 }),
      sprite_config: spriteConfig('epic'),
    },
    {
      id: 'tablet_titan_shell',
      name: 'Titan Shell',
      description: 'An impenetrable defense matrix.',
      rarity: 'epic',
      effects: JSON.stringify({ shieldBonus: 12, cargoBonus: 5 }),
      sprite_config: spriteConfig('epic'),
    },
    {
      id: 'tablet_warp_prism',
      name: 'Warp Prism',
      description: 'A dimensional folding device.',
      rarity: 'epic',
      effects: JSON.stringify({ engineBonus: 8, cargoBonus: 8 }),
      sprite_config: spriteConfig('epic'),
    },
    {
      id: 'tablet_combat_nexus',
      name: 'Combat Nexus',
      description: 'A tactical combat computer core.',
      rarity: 'epic',
      effects: JSON.stringify({ weaponBonus: 10, shieldBonus: 4, xpMultiplier: 0.08 }),
      sprite_config: spriteConfig('epic'),
    },

    // ── LEGENDARY (3) ───────────────────────────────────────────────────
    {
      id: 'tablet_star_heart',
      name: 'Star Heart',
      description: 'The crystallized core of a neutron star.',
      rarity: 'legendary',
      effects: JSON.stringify({ weaponBonus: 8, shieldBonus: 8, xpMultiplier: 0.15 }),
      sprite_config: spriteConfig('legendary'),
    },
    {
      id: 'tablet_void_crown',
      name: 'Void Crown',
      description: 'A relic of an ancient space civilization.',
      rarity: 'legendary',
      effects: JSON.stringify({ engineBonus: 10, fleeBonus: 0.12, cargoBonus: 8 }),
      sprite_config: spriteConfig('legendary'),
    },
    {
      id: 'tablet_infinity_shard',
      name: 'Infinity Shard',
      description: 'A fragment of the cosmic horizon itself.',
      rarity: 'legendary',
      effects: JSON.stringify({ weaponBonus: 6, engineBonus: 6, shieldBonus: 6, cargoBonus: 6 }),
      sprite_config: spriteConfig('legendary'),
    },

    // ── MYTHIC (1) ──────────────────────────────────────────────────────
    {
      id: 'tablet_cosmic_sigil',
      name: 'Cosmic Sigil',
      description: 'An artifact of unfathomable power, forged in the heart of a supernova.',
      rarity: 'mythic',
      effects: JSON.stringify({ weaponBonus: 10, engineBonus: 8, cargoBonus: 10, shieldBonus: 10, xpMultiplier: 0.25 }),
      sprite_config: spriteConfig('mythic'),
    },
  ]);

  console.log('Tablet seeding complete: 30 tablets');
}
