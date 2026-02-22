import { Knex } from 'knex';
import { GAME_CONFIG } from '../../config/game';

// ---------------------------------------------------------------------------
// Seeded RNG (same as 001_universe.ts)
// ---------------------------------------------------------------------------
function createRng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// ID scheme: e0000000-0000-0000-0000-{padded} (hand-authored use c0000000-)
// ---------------------------------------------------------------------------
function procNpcId(n: number): string {
  return `e0000000-0000-0000-0000-${String(n).padStart(12, '0')}`;
}

// ---------------------------------------------------------------------------
// Name pools — 40 first names + 15 epithets per race
// ---------------------------------------------------------------------------
const FIRST_NAMES: Record<string, string[]> = {
  muscarian: [
    'Sporos', 'Vex', 'Myca', 'Trufa', 'Gilla', 'Pholus', 'Rhiza', 'Capri',
    'Amanix', 'Bolara', 'Cordi', 'Dryad', 'Enoki', 'Fumara', 'Gloma',
    'Hypha', 'Inkara', 'Jelly', 'Kappa', 'Lycas', 'Morel', 'Nebura',
    'Oystra', 'Porcia', 'Quilla', 'Russet', 'Stipa', 'Trama', 'Umbon',
    'Volva', 'Wax', 'Xerox', 'Yeast', 'Zygos', 'Fungi', 'Blight',
    'Cladix', 'Dross', 'Ergot', 'Floc',
  ],
  vedic: [
    'Crysta', 'Prism', 'Lyra', 'Solene', 'Quartz', 'Thallia', 'Aurion',
    'Veda', 'Lumis', 'Celara', 'Diam', 'Esmer', 'Facet', 'Gleam',
    'Helio', 'Irid', 'Jaspar', 'Kyanis', 'Lapis', 'Micas', 'Novar',
    'Opalix', 'Pyrex', 'Quarix', 'Rhodo', 'Selene', 'Topaz', 'Ulexis',
    'Veran', 'Xylar', 'Zircon', 'Amber', 'Beryl', 'Citri', 'Dolomis',
    'Elara', 'Fluori', 'Garnis', 'Halite', 'Iolite',
  ],
  kalin: [
    'Kovax', 'Ferrik', 'Slade', 'Grond', 'Basalt', 'Thane', 'Flint',
    'Ironjaw', 'Magnar', 'Crag', 'Durin', 'Ebonax', 'Forge', 'Granite',
    'Husk', 'Ingot', 'Jotnar', 'Knoxx', 'Lode', 'Mohs', 'Nickel',
    'Obsid', 'Pewter', 'Quarry', 'Rivet', 'Steele', 'Tungst', 'Umber',
    'Vanad', 'Wolfram', 'Zinc', 'Alloy', 'Bronze', 'Chrome', 'Drillax',
    'Ember', 'Fulcrum', 'Galena', 'Hamat', 'Iridax',
  ],
  tarri: [
    'Hawk', 'Zara', 'Swift', 'Mira', 'Dash', 'Kira', 'Fin', 'Slink',
    'Agile', 'Breeze', 'Comet', 'Darter', 'Echo', 'Flash', 'Glide',
    'Hover', 'Iris', 'Jinx', 'Kestrel', 'Lark', 'Merlin', 'Nimbus',
    'Oriole', 'Piper', 'Quickstep', 'Raven', 'Sparrow', 'Tern', 'Updraft',
    'Viper', 'Whisper', 'Xeno', 'Yawl', 'Zephyr', 'Arrow', 'Bolt',
    'Cinder', 'Drake', 'Ember', 'Flicker',
  ],
  generic: [
    'Jax', 'Kael', 'Nova', 'Rex', 'Sage', 'Thorn', 'Vance', 'Wren',
    'Axel', 'Blake', 'Cruz', 'Dante', 'Edge', 'Flint', 'Ghost',
    'Hunter', 'Indra', 'Jet', 'Knox', 'Lux', 'Moss', 'Nix',
    'Onyx', 'Pike', 'Quinn', 'Rogue', 'Storm', 'Tusk', 'Uri',
    'Vale', 'Wyatt', 'Xander', 'York', 'Zeke', 'Ash', 'Bane',
    'Crow', 'Dusk', 'Ember', 'Frost',
  ],
};

const EPITHETS: Record<string, string[]> = {
  muscarian: [
    'Sporecap', 'Rootweave', 'Darkbloom', 'Lichenglow', 'Moldmist',
    'Capstalk', 'Gillthorn', 'Dewtread', 'Fernshade', 'Mycelweave',
    'Mossmark', 'Damphollow', 'Sporewing', 'Trufflecrest', 'Mushveil',
  ],
  vedic: [
    'Starfacet', 'Crystalvein', 'Lightweave', 'Prismbright', 'Gemglow',
    'Resonance', 'Shardmind', 'Lumenheart', 'Refrax', 'Gleamspire',
    'Spectral', 'Diamondtide', 'Lensward', 'Radiance', 'Quasarkin',
  ],
  kalin: [
    'Steelhand', 'Ironvein', 'Corehammer', 'Stonebrow', 'Forgeblood',
    'Anvilthorn', 'Crustbreaker', 'Slateborn', 'Orelord', 'Dirtdelver',
    'Rockjaw', 'Magmahold', 'Copperfist', 'Basaltbane', 'Scoriaskin',
  ],
  tarri: [
    'Swiftscale', 'Windrunner', 'Shadowtail', 'Suncatcher', 'Duststep',
    'Skyleap', 'Quickfang', 'Stormscale', 'Mistveil', 'Starglide',
    'Dawnstrider', 'Moonwhisper', 'Tidechaser', 'Ashflicker', 'Frostclaw',
  ],
  generic: [
    'Voidwalker', 'Starborn', 'Deepdrifter', 'Nullward', 'Rimrunner',
    'Dustdevil', 'Ironwill', 'Blackout', 'Nebulae', 'Skullcap',
    'Driftwood', 'Hardcase', 'Nightcrawler', 'Sundown', 'Crosshair',
  ],
};

function generateName(rng: () => number, race: string, usedNames: Set<string>): string {
  const firstPool = FIRST_NAMES[race] || FIRST_NAMES.generic;
  const epithetPool = EPITHETS[race] || EPITHETS.generic;

  for (let attempt = 0; attempt < 100; attempt++) {
    const first = firstPool[Math.floor(rng() * firstPool.length)];
    const epithet = epithetPool[Math.floor(rng() * epithetPool.length)];
    const name = `${first} ${epithet}`;
    if (!usedNames.has(name)) {
      usedNames.add(name);
      return name;
    }
  }
  // Fallback with numeric suffix
  const fallback = `Traveler-${Math.floor(rng() * 99999)}`;
  usedNames.add(fallback);
  return fallback;
}

// ---------------------------------------------------------------------------
// Race flavor pools for parameterized dialogue
// ---------------------------------------------------------------------------
interface RaceFlavor {
  raceName: string;
  collectiveName: string;
  physicalDesc: string[];
  greeting: string[];
  culturalRef: string[];
}

const RACE_FLAVORS: Record<string, RaceFlavor> = {
  muscarian: {
    raceName: 'Muscarian',
    collectiveName: 'the Collective',
    physicalDesc: [
      'bioluminescent mycelial patterns shifting across their cap',
      'a towering figure with fibrous tendrils swaying gently',
      'spore-dusted skin pulsing with soft amber light',
      'a broad-shouldered fungal form with deep-set glowing eyes',
    ],
    greeting: [
      'The spore-net whispers of your coming.',
      'Another traveler drawn to the mycelial web.',
      'The roots of the Collective extend to greet you.',
      'Welcome. The network remembers all who pass through.',
    ],
    culturalRef: [
      'the ancient mycelial councils',
      'the deep-root meditations',
      'the Spore Accord of the First Age',
      'the bioluminescent festivals of the homeworld',
    ],
  },
  vedic: {
    raceName: 'Vedic',
    collectiveName: 'the Conclave',
    physicalDesc: [
      'crystalline formations humming with harmonic resonance',
      'translucent skin refracting light into prismatic patterns',
      'a figure of living crystal, eyes blazing with starlight',
      'delicate lattice structures growing from their shoulders',
    ],
    greeting: [
      'The crystal resonance detected your approach.',
      'Light bends around you in interesting patterns.',
      'The Conclave acknowledges your presence.',
      'Welcome. Your frequency is... unusual.',
    ],
    culturalRef: [
      'the Harmonic Convergence',
      'the ancient Prism Libraries',
      'the Crystal Meditation of the Forefathers',
      'the Light-Weaving traditions',
    ],
  },
  kalin: {
    raceName: 'Kalin',
    collectiveName: 'the Dominion',
    physicalDesc: [
      'mineral-encrusted skin gleaming like polished obsidian',
      'a massive figure with rocky protrusions along their arms',
      'dense metallic skin that seems to absorb light',
      'reinforced plating of natural mineral armor across their chest',
    ],
    greeting: [
      'The stone endures. State your purpose.',
      'Another surface-dweller. Speak.',
      'The Dominion watches. What brings you here?',
      'You walk on stone shaped by Kalin hands.',
    ],
    culturalRef: [
      'the Deep Forge beneath the homeworld',
      'the Mineral Rites of Passage',
      'the Stonecutter traditions',
      'the ancient ore-songs of the miners',
    ],
  },
  tarri: {
    raceName: 'Tarri',
    collectiveName: 'the Freehold',
    physicalDesc: [
      'iridescent scales catching light as they shift position',
      'a lithe figure with a long tail curling behind them',
      'quick eyes darting to assess every exit in the room',
      'sun-bleached scales and nimble clawed fingers',
    ],
    greeting: [
      'Quick! Before someone else gets here first.',
      'A new face! The Freehold always welcomes trade.',
      'You move well for a non-Tarri. Impressive.',
      'Welcome, traveler. Speed is life out here.',
    ],
    culturalRef: [
      'the Wind-Racing festivals',
      'the Freehold trading conventions',
      'the ancient migration routes',
      'the Tarri code of swift justice',
    ],
  },
  generic: {
    raceName: 'human',
    collectiveName: 'the frontier folk',
    physicalDesc: [
      'a weathered spacer with cybernetic implants',
      'a scarred veteran with knowing eyes',
      'a figure in well-worn flight gear',
      'a traveler marked by years in deep space',
    ],
    greeting: [
      'Another day on the frontier.',
      'You look like you can handle yourself.',
      'Welcome to nowhere in particular.',
      'Pull up a seat if you can find one.',
    ],
    culturalRef: [
      'the old Earth stories',
      'spacer traditions',
      'frontier justice',
      'the unwritten code of the void',
    ],
  },
};

// ---------------------------------------------------------------------------
// NPC type definitions
// ---------------------------------------------------------------------------
type NpcType = 'ambassador' | 'trader' | 'bartender' | 'mechanic' | 'scout' | 'scholar' | 'bounty_hunter' | 'smuggler';

const NPC_TYPE_CONFIG: Record<NpcType, {
  title: string;
  factions: string[];
  services: string[];
  spritePrefix: string;
}> = {
  ambassador: { title: 'Ambassador', factions: ['race_muscarian', 'race_vedic', 'race_kalin', 'race_tarri'], services: ['missions', 'info', 'trade'], spritePrefix: 'npc' },
  trader: { title: 'Trader', factions: ['traders_guild'], services: ['trade', 'info'], spritePrefix: 'npc' },
  bartender: { title: 'Bartender', factions: ['shadow_syndicate'], services: ['info', 'missions'], spritePrefix: 'npc' },
  mechanic: { title: 'Mechanic', factions: ['traders_guild', 'independent'], services: ['trade', 'info'], spritePrefix: 'npc' },
  scout: { title: 'Scout', factions: ['frontier_rangers'], services: ['missions', 'info'], spritePrefix: 'npc' },
  scholar: { title: 'Scholar', factions: ['cosmic_scholars'], services: ['info', 'story'], spritePrefix: 'npc' },
  bounty_hunter: { title: 'Bounty Hunter', factions: ['frontier_rangers', 'shadow_syndicate'], services: ['missions', 'info'], spritePrefix: 'npc' },
  smuggler: { title: 'Smuggler', factions: ['shadow_syndicate'], services: ['trade', 'missions'], spritePrefix: 'npc' },
};

const RACES = ['muscarian', 'vedic', 'kalin', 'tarri'];
const RACE_SPRITES: Record<string, string> = {
  muscarian: 'npc_muscarian',
  vedic: 'npc_vedic',
  kalin: 'npc_kalin',
  tarri: 'npc_tarri',
  generic: 'npc_generic_a',
};

function pickRace(rng: () => number): string {
  return RACES[Math.floor(rng() * RACES.length)];
}

function pickFrom<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

// ---------------------------------------------------------------------------
// Dialogue template factories
// ---------------------------------------------------------------------------
interface DialogueTreeResult {
  tree: Record<string, any>;
  firstEncounter: { greeting: string; description: string; sceneHint: string };
}

function makeAmbassadorDialogue(npcName: string, race: string, factionId: string, variationIndex: number): DialogueTreeResult {
  const f = RACE_FLAVORS[race] || RACE_FLAVORS.generic;
  const vi = variationIndex % f.greeting.length;
  const pd = variationIndex % f.physicalDesc.length;
  const cr = variationIndex % f.culturalRef.length;

  const isNeutral = factionId === 'independent';
  const greetingText = isNeutral
    ? `I serve no single faction. I bridge the divide between all peoples of the galaxy.`
    : f.greeting[vi];

  const tree: Record<string, any> = {
    root: {
      text: greetingText,
      options: [
        { label: 'Tell me about your people.', next: 'lore' },
        { label: 'Do you have missions?', next: 'missions' },
        { label: 'I seek the olive branch.', next: 'olive_branch' },
        { label: 'Farewell.', next: null },
      ],
    },
    lore: {
      text: `We are ${f.collectiveName}. Our traditions stretch back to ${f.culturalRef[cr]}. There is much we could share with those who prove themselves.`,
      options: [
        { label: 'I want to learn more.', next: 'deep_lore', requires: { reputation: 20 } },
        { label: 'Fascinating.', next: 'root' },
      ],
      effects: { reputation: 1 },
    },
    deep_lore: {
      text: `Few outsiders earn this knowledge. ${f.culturalRef[(cr + 1) % f.culturalRef.length]} holds secrets that could change how you see the galaxy.`,
      options: [
        { label: 'Share the deepest secrets.', next: 'ancient_knowledge', requires: { reputation: 50 } },
        { label: 'This is already more than I expected.', next: 'root' },
      ],
      effects: { reputation: 2 },
    },
    ancient_knowledge: {
      text: `You have earned the trust of ${f.collectiveName}. The Precursors once walked among us. Their legacy is woven into our very being.`,
      options: [
        { label: 'Thank you for this honor.', next: null },
      ],
      effects: { reputation: 3 },
    },
    missions: {
      text: isNeutral
        ? `I offer tasks that benefit all races equally. No rivalry, no political games. Just the work of building bridges.`
        : `${f.collectiveName} has tasks for those who would serve our cause. Prove your worth, and greater responsibilities await.`,
      options: [
        { label: 'What do you need?', next: 'mission_detail', requires: { reputation: 20 } },
        { label: "I'll consider it.", next: 'root' },
      ],
      effects: { reputation: 1 },
    },
    mission_detail: {
      text: `We need couriers, scouts, and diplomats. The galaxy is vast, and ${f.collectiveName} cannot be everywhere at once.`,
      options: [
        { label: 'Count me in.', next: null },
      ],
      effects: { reputation: 2 },
    },
    olive_branch: {
      text: isNeutral
        ? `The path of neutrality is always open. I offer you goodwill freely — may it open doors that rivalry has closed.`
        : `Even those who have strayed from our path may return. ${f.collectiveName} values redemption. Accept this token of peace.`,
      options: [
        { label: 'I accept your olive branch.', next: null },
      ],
      effects: { reputation: GAME_CONFIG.OLIVE_BRANCH_REP_BONUS },
    },
  };

  return {
    tree,
    firstEncounter: {
      greeting: `A ${f.raceName} with ${f.physicalDesc[pd]} stands before you, radiating authority.`,
      description: `${npcName} serves as ${isNeutral ? 'a neutral' : `a ${f.raceName}`} ambassador, bridging cultures across the galaxy.`,
      sceneHint: 'outpost_interior',
    },
  };
}

function makeTraderDialogue(npcName: string, race: string, variationIndex: number): DialogueTreeResult {
  const f = RACE_FLAVORS[race] || RACE_FLAVORS.generic;
  const vi = variationIndex % 4;
  const pd = variationIndex % f.physicalDesc.length;

  const variants = [
    { root: 'Credits talk, everything else walks. What are you buying?', wares: 'I deal in ship components, rare minerals, and the occasional curiosity. Browse my stock.' },
    { root: 'Another customer! Business has been good lately. What catches your eye?', wares: 'Got a fresh shipment of tech components. Prices are fair — Guild-certified.' },
    { root: 'Trade makes the galaxy spin. I keep it spinning faster. Looking for something specific?', wares: 'Weapons, shields, engines — all top quality. The Guild wouldn\'t have it any other way.' },
    { root: 'Supply and demand, friend. I\'ve got the supply if you\'ve got the demand.', wares: 'Everything from basic hull patches to experimental drives. Name your need.' },
  ];

  const v = variants[vi];

  return {
    tree: {
      root: {
        text: v.root,
        options: [
          { label: 'Show me your wares.', next: 'wares' },
          { label: 'Any tips for a trader?', next: 'tip' },
          { label: 'Tell me about the Guild.', next: 'guild_info' },
          { label: 'Just passing through.', next: null },
        ],
      },
      wares: {
        text: v.wares,
        options: [
          { label: 'Anything special?', next: 'special', requires: { reputation: 20 } },
          { label: 'I\'ll browse.', next: null },
        ],
        effects: { reputation: 1 },
      },
      special: {
        text: 'For trusted clients, I keep the good stuff in the back. Premium components, salvaged Precursor tech, that sort of thing.',
        options: [
          { label: 'Impressive.', next: null },
        ],
        effects: { reputation: 2 },
      },
      tip: {
        text: 'Buy low at core outposts, sell high on the frontier. Watch for price spikes after pirate raids — that\'s when tech components triple in value.',
        options: [
          { label: 'Good advice.', next: null },
        ],
        effects: { reputation: 1 },
      },
      guild_info: {
        text: 'The Traders Guild keeps commerce flowing. We set fair prices, protect trade routes, and make sure everyone profits. Well, everyone who plays by the rules.',
        options: [
          { label: 'How do I join?', next: null },
        ],
        effects: { reputation: 1 },
      },
    },
    firstEncounter: {
      greeting: `A ${f.raceName} merchant with ${f.physicalDesc[pd]} arranges goods on a display.`,
      description: `${npcName} is a Traders Guild merchant dealing in ship supplies and rare commodities.`,
      sceneHint: 'outpost_interior',
    },
  };
}

function makeBartenderDialogue(npcName: string, race: string, variationIndex: number): DialogueTreeResult {
  const f = RACE_FLAVORS[race] || RACE_FLAVORS.generic;
  const vi = variationIndex % 4;
  const pd = variationIndex % f.physicalDesc.length;

  const variants = [
    { root: 'What\'ll it be? I serve drinks and rumors — both on tap.', gossip: 'Word is the Rangers are stretched thin. Pirates getting bolder in the outer sectors.' },
    { root: 'Sit down, stranger. You look like you need something strong.', gossip: 'The Scholars found something big. Nobody\'s saying what, but mercs are being hired at triple rates.' },
    { root: 'Another soul seeking answers at the bottom of a glass. Fair enough.', gossip: 'Syndicate\'s been quiet lately. Too quiet. That usually means something big is coming.' },
    { root: 'I hear everything, see nothing, and forget whatever you need forgotten.', gossip: 'Trade routes are shifting. The Guild is rerouting around sectors 2000-2500. Something out there spooked them.' },
  ];

  const v = variants[vi];

  return {
    tree: {
      root: {
        text: v.root,
        options: [
          { label: 'What\'s the word on the frontier?', next: 'gossip' },
          { label: 'Heard any good rumors?', next: 'rumor' },
          { label: 'Know anyone looking for hired help?', next: 'shady_work' },
          { label: 'Tell me about this sector.', next: 'sector_info' },
          { label: 'Just a drink.', next: null },
        ],
      },
      gossip: {
        text: v.gossip,
        options: [
          { label: 'Tell me more.', next: 'rumor' },
          { label: 'Good to know.', next: null },
        ],
        effects: { reputation: 1 },
      },
      rumor: {
        text: 'There\'s talk of Precursor ruins waking up. Energy spikes in dead sectors. Could be valuable — or deadly. Maybe both.',
        options: [
          { label: 'Anything more specific?', next: 'deep_rumor', requires: { reputation: 20 } },
          { label: 'Interesting.', next: null },
        ],
        effects: { reputation: 1 },
      },
      deep_rumor: {
        text: 'A smuggler came through last week, white as a ghost. Said he saw a ship — not from any known race — just sitting in a dead sector. Then it vanished.',
        options: [
          { label: 'Which sector?', next: null },
        ],
        effects: { reputation: 2 },
      },
      shady_work: {
        text: 'There\'s always work if you know where to look. The Syndicate pays well for discrete deliveries. No questions, no problems.',
        options: [
          { label: 'I might be interested.', next: null },
        ],
        effects: { reputation: 1 },
      },
      sector_info: {
        text: 'This sector is a crossroads. Trade ships pass through daily. Pirates lurk near the edges. Rangers patrol when they can, which isn\'t often enough.',
        options: [
          { label: 'Thanks for the info.', next: null },
        ],
        effects: { reputation: 1 },
      },
    },
    firstEncounter: {
      greeting: `A ${f.raceName} with ${f.physicalDesc[pd]} stands behind a well-worn bar, polishing a glass.`,
      description: `${npcName} runs this establishment, serving drinks and information in equal measure.`,
      sceneHint: 'outpost_interior',
    },
  };
}

function makeMechanicDialogue(npcName: string, race: string, variationIndex: number): DialogueTreeResult {
  const f = RACE_FLAVORS[race] || RACE_FLAVORS.generic;
  const vi = variationIndex % 4;
  const pd = variationIndex % f.physicalDesc.length;

  const variants = [
    { root: 'Ship trouble? I can hear your engines whining from across the bay.', diagnose: 'Your power coupling\'s shot. I can fix it, but it\'ll cost you. Worth every credit though.' },
    { root: 'Bring it in, let me take a look. I\'ve seen worse... probably.', diagnose: 'Hull integrity\'s down. Microfractures along the port side. I can reinforce it with composite plating.' },
    { root: 'Another day, another busted engine. At least business is good.', diagnose: 'Your shield emitters are misaligned. No wonder you\'re taking extra damage. Easy fix if you have the parts.' },
    { root: 'I fix ships. I don\'t fix pilots. That\'s a much harder problem.', diagnose: 'Your nav computer needs a firmware update. It\'s routing you through dangerous sectors when safer paths exist.' },
  ];

  const v = variants[vi];

  return {
    tree: {
      root: {
        text: v.root,
        options: [
          { label: 'Can you diagnose my ship?', next: 'diagnose' },
          { label: 'Any upgrade tips?', next: 'upgrade_tip' },
          { label: 'Got any special parts?', next: 'special_parts' },
          { label: 'Not right now.', next: null },
        ],
      },
      diagnose: {
        text: v.diagnose,
        options: [
          { label: 'How much?', next: null },
        ],
        effects: { reputation: 1 },
      },
      upgrade_tip: {
        text: 'Engines first, always. Speed saves more lives than armor. After that, shields. Weapons are last — the best fight is the one you avoid.',
        options: [
          { label: 'What about experimental mods?', next: 'experimental', requires: { reputation: 20 } },
          { label: 'Solid advice.', next: null },
        ],
        effects: { reputation: 1 },
      },
      experimental: {
        text: 'I\'ve been working on a prototype — overclocked shield capacitors. Risky, but the upside is enormous. Come back when we know each other better.',
        options: [
          { label: 'I\'ll be back.', next: null },
        ],
        effects: { reputation: 2 },
      },
      special_parts: {
        text: 'I keep a stock of salvaged components. Not pretty, but functional. Check the vendor for what\'s available.',
        options: [
          { label: 'I\'ll take a look.', next: null },
        ],
        effects: { reputation: 1 },
      },
    },
    firstEncounter: {
      greeting: `A ${f.raceName} with ${f.physicalDesc[pd]} emerges from beneath a ship, tools in hand.`,
      description: `${npcName} keeps ships flying on the frontier. Grease-stained but brilliant with an engine.`,
      sceneHint: 'outpost_interior',
    },
  };
}

function makeScoutDialogue(npcName: string, race: string, variationIndex: number): DialogueTreeResult {
  const f = RACE_FLAVORS[race] || RACE_FLAVORS.generic;
  const vi = variationIndex % 4;
  const pd = variationIndex % f.physicalDesc.length;

  const variants = [
    { root: 'I map the unknown. Out beyond the trade lanes, where the charts go blank. That\'s where I work.', report: 'Sector activity is increasing. More ships, more signals, more unknowns. Something\'s drawing them out here.' },
    { root: 'The frontier doesn\'t end — it just gets more dangerous. I make sure people know what\'s ahead.', report: 'Pirate activity is concentrated near the nebulae. They use the sensor interference for cover.' },
    { root: 'Another day, another unmapped sector. The Rangers need every pair of eyes they can get.', report: 'I found traces of Precursor technology in three sectors. The energy signatures are faint but unmistakable.' },
    { root: 'Stay sharp out here. The galaxy is bigger than anyone realizes, and not all of it is friendly.', report: 'There are dead zones — sectors where all signals just... stop. I don\'t go there anymore.' },
  ];

  const v = variants[vi];

  return {
    tree: {
      root: {
        text: v.root,
        options: [
          { label: 'What\'s your latest report?', next: 'report' },
          { label: 'Any dangers I should know about?', next: 'danger' },
          { label: 'Know of any hidden sectors?', next: 'hidden_sector' },
          { label: 'Stay safe out there.', next: null },
        ],
      },
      report: {
        text: v.report,
        options: [
          { label: 'Can you mark my chart?', next: null },
        ],
        effects: { reputation: 1 },
      },
      danger: {
        text: 'Pirates, obviously. But also energy storms in some sectors — they\'ll fry your electronics if you\'re not shielded. And then there are the anomalies...',
        options: [
          { label: 'What anomalies?', next: 'anomalies', requires: { reputation: 20 } },
          { label: 'I\'ll be careful.', next: null },
        ],
        effects: { reputation: 1 },
      },
      anomalies: {
        text: 'Spatial distortions. Ships go in, some don\'t come out. Those that do report lost time — hours, sometimes days. The Scholars are very interested.',
        options: [
          { label: 'Disturbing.', next: null },
        ],
        effects: { reputation: 2 },
      },
      hidden_sector: {
        text: 'There are sectors not on any official chart. You have to find the right warp signatures. The Rangers know some — become trusted and they might share.',
        options: [
          { label: 'I\'ll earn that trust.', next: null },
        ],
        effects: { reputation: 1 },
      },
    },
    firstEncounter: {
      greeting: `A ${f.raceName} in lightweight recon gear with ${f.physicalDesc[pd]} studies a holographic star chart.`,
      description: `${npcName} is a Frontier Rangers scout, mapping the unknown reaches of the galaxy.`,
      sceneHint: 'planet_surface',
    },
  };
}

function makeScholarDialogue(npcName: string, race: string, variationIndex: number): DialogueTreeResult {
  const f = RACE_FLAVORS[race] || RACE_FLAVORS.generic;
  const vi = variationIndex % 4;
  const pd = variationIndex % f.physicalDesc.length;
  const cr = variationIndex % f.culturalRef.length;

  const variants = [
    { root: 'Knowledge is the only currency that never devalues. I am a Cosmic Scholar. What do you seek?', research: 'I study Precursor energy patterns. They left behind a web of power nodes spanning the galaxy.' },
    { root: 'Every star has a story. Every sector holds a mystery. I collect them all.', research: 'I\'m cataloging ancient artifacts. The Precursors left more than ruins — they left messages.' },
    { root: 'The universe whispers to those who listen. I am a listener.', research: 'The deep-space signal patterns aren\'t random. They\'re structured. Someone — or something — is broadcasting.' },
    { root: 'Curiosity brought you here. Good. It\'s the most valuable trait a spacer can have.', research: 'I study the relationship between ${f.culturalRef[cr]} and Precursor technology. The connections are surprising.' },
  ];

  const v = variants[vi];

  return {
    tree: {
      root: {
        text: v.root,
        options: [
          { label: 'What are you researching?', next: 'research' },
          { label: 'Made any discoveries?', next: 'discovery' },
          { label: 'Tell me something profound.', next: 'deep_knowledge' },
          { label: 'I should go.', next: null },
        ],
      },
      research: {
        text: v.research,
        options: [
          { label: 'Can I help?', next: null },
        ],
        effects: { reputation: 1 },
      },
      discovery: {
        text: 'I found trace elements in the nebulae that match Precursor alloys. They didn\'t just travel through here — they built here.',
        options: [
          { label: 'What did they build?', next: 'deep_discovery', requires: { reputation: 20 } },
          { label: 'Remarkable.', next: null },
        ],
        effects: { reputation: 1 },
      },
      deep_discovery: {
        text: 'Gateways. Not like our warp gates — these connect to somewhere else entirely. Somewhere the Precursors went when they left this galaxy.',
        options: [
          { label: 'That\'s incredible.', next: null },
        ],
        effects: { reputation: 2 },
      },
      deep_knowledge: {
        text: 'The Precursors believed that consciousness is the fundamental force of the universe. Not gravity, not electromagnetism — awareness itself.',
        options: [
          { label: 'A humbling thought.', next: null },
        ],
        effects: { reputation: 1 },
      },
    },
    firstEncounter: {
      greeting: `A ${f.raceName} with ${f.physicalDesc[pd]} is surrounded by floating data crystals and holographic star charts.`,
      description: `${npcName} is a Cosmic Scholar dedicated to unraveling the mysteries of the Precursors.`,
      sceneHint: 'planet_surface',
    },
  };
}

function makeBountyHunterDialogue(npcName: string, race: string, variationIndex: number): DialogueTreeResult {
  const f = RACE_FLAVORS[race] || RACE_FLAVORS.generic;
  const vi = variationIndex % 4;
  const pd = variationIndex % f.physicalDesc.length;

  const variants = [
    { root: 'I hunt people for a living. Don\'t worry — unless you\'re on my list, we\'re fine.', target: 'Current bounty board has six open contracts. Pirates mostly. A few deserters. All dangerous.' },
    { root: 'Names, locations, prices. That\'s all that matters in my line of work.', target: 'There\'s a pirate captain causing havoc in the outer sectors. High bounty. Very dangerous.' },
    { root: 'Everyone runs eventually. I make sure they don\'t run far.', target: 'Three targets in this region. Two small-time smugglers and one very nasty warlord.' },
    { root: 'Track. Find. Collect. Simple work with simple rules.', target: 'The Rangers have posted a priority bounty. Someone\'s been raiding supply convoys.' },
  ];

  const v = variants[vi];

  return {
    tree: {
      root: {
        text: v.root,
        options: [
          { label: 'Who are you hunting?', next: 'target' },
          { label: 'How does the bounty system work?', next: 'bounty_details' },
          { label: 'Test my reputation.', next: 'reputation_test', requires: { reputation: 20 } },
          { label: 'I\'m not interested.', next: null },
        ],
      },
      target: {
        text: v.target,
        options: [
          { label: 'I could help track them.', next: null },
        ],
        effects: { reputation: 1 },
      },
      bounty_details: {
        text: 'Rangers post official bounties. Syndicate has their own list — pays more but less legal. Either way, you get paid for results.',
        options: [
          { label: 'Which pays better?', next: null },
        ],
        effects: { reputation: 1 },
      },
      reputation_test: {
        text: 'You want to prove yourself? Take on a target. Bring back proof. That\'s the only test that matters in this business.',
        options: [
          { label: 'Give me a name.', next: null },
        ],
        effects: { reputation: 2 },
      },
    },
    firstEncounter: {
      greeting: `A ${f.raceName} with ${f.physicalDesc[pd]} checks weapon charges, eyes scanning the room with predatory focus.`,
      description: `${npcName} is a bounty hunter operating on the frontier. Professional, efficient, and always hunting.`,
      sceneHint: 'outpost_interior',
    },
  };
}

function makeSmugglerDialogue(npcName: string, race: string, variationIndex: number): DialogueTreeResult {
  const f = RACE_FLAVORS[race] || RACE_FLAVORS.generic;
  const vi = variationIndex % 4;
  const pd = variationIndex % f.physicalDesc.length;

  const variants = [
    { root: 'You didn\'t see me. I wasn\'t here. Now that we\'ve established that — need anything?', merch: 'Modified cargo pods, scanner-proof compartments, and some items that fell off a transport. Allegedly.' },
    { root: 'Cargo doesn\'t ask where it\'s going. I extend the same courtesy.', merch: 'I\'ve got tech that the Guild doesn\'t want you to have. Better quality, no tariff, no questions.' },
    { root: 'The law is a suggestion out here. I suggest ignoring it. Professionally.', merch: 'Prototype ship mods, contraband scanners, and a lovely selection of forged transit papers.' },
    { root: 'Call me a free-market entrepreneur. The Syndicate handles the details.', merch: 'Rare minerals, restricted tech, and the occasional artifact. All reasonably priced.' },
  ];

  const v = variants[vi];

  return {
    tree: {
      root: {
        text: v.root,
        options: [
          { label: 'What do you have?', next: 'merchandise' },
          { label: 'Know about the black market?', next: 'black_market' },
          { label: 'Isn\'t this risky?', next: 'risk_warning' },
          { label: 'Wrong person.', next: null },
        ],
      },
      merchandise: {
        text: v.merch,
        options: [
          { label: 'Show me the good stuff.', next: 'premium', requires: { reputation: 20 } },
          { label: 'I\'ll think about it.', next: null },
        ],
        effects: { reputation: 1 },
      },
      premium: {
        text: 'For serious clients only: military-grade cloaking devices, AI-assisted targeting systems, and one Precursor data crystal. Don\'t ask where I got it.',
        options: [
          { label: 'How much for the crystal?', next: null },
        ],
        effects: { reputation: 2 },
      },
      black_market: {
        text: 'Every station has one if you know where to look. The Syndicate keeps things organized. Prices are high, but you get what you can\'t find anywhere else.',
        options: [
          { label: 'Where do I find it?', next: null },
        ],
        effects: { reputation: 1 },
      },
      risk_warning: {
        text: 'Everything in space is risky. At least with me, you know the risk up front. Rangers catch you, you do time. Don\'t get caught.',
        options: [
          { label: 'Fair enough.', next: null },
        ],
        effects: { reputation: 1 },
      },
    },
    firstEncounter: {
      greeting: `A ${f.raceName} with ${f.physicalDesc[pd]} lurks in the shadows, gesturing you closer with a conspiratorial look.`,
      description: `${npcName} deals in goods that don't appear on any official manifest. Discreet and resourceful.`,
      sceneHint: 'outpost_interior',
    },
  };
}

function buildDialogue(npcType: NpcType, npcName: string, race: string, factionId: string, variationIndex: number): DialogueTreeResult {
  switch (npcType) {
    case 'ambassador': return makeAmbassadorDialogue(npcName, race, factionId, variationIndex);
    case 'trader': return makeTraderDialogue(npcName, race, variationIndex);
    case 'bartender': return makeBartenderDialogue(npcName, race, variationIndex);
    case 'mechanic': return makeMechanicDialogue(npcName, race, variationIndex);
    case 'scout': return makeScoutDialogue(npcName, race, variationIndex);
    case 'scholar': return makeScholarDialogue(npcName, race, variationIndex);
    case 'bounty_hunter': return makeBountyHunterDialogue(npcName, race, variationIndex);
    case 'smuggler': return makeSmugglerDialogue(npcName, race, variationIndex);
  }
}

// ---------------------------------------------------------------------------
// Weighted random selection
// ---------------------------------------------------------------------------
function weightedPick<T>(items: Array<{ value: T; weight: number }>, rng: () => number): T {
  const total = items.reduce((sum, i) => sum + i.weight, 0);
  let r = rng() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item.value;
  }
  return items[items.length - 1].value;
}

// ---------------------------------------------------------------------------
// Main seed
// ---------------------------------------------------------------------------
export async function seed(knex: Knex): Promise<void> {
  const rng = createRng(GAME_CONFIG.PROC_NPC_SEED);

  // Ensure race factions exist (migration 035 creates them, but seed 006 may delete them)
  const raceFactions = [
    { id: 'race_muscarian', name: 'Muscarian Collective', description: 'The fungal network of the Muscarian people.', alignment: 'neutral' },
    { id: 'race_vedic', name: 'Vedic Conclave', description: 'The crystalline wisdom-keepers of the Vedic race.', alignment: 'lawful' },
    { id: 'race_kalin', name: 'Kalin Dominion', description: 'The mineral-skinned warriors of the Kalin.', alignment: 'neutral' },
    { id: 'race_tarri', name: 'Tarri Freehold', description: 'The agile traders and explorers of the Tarri.', alignment: 'neutral' },
  ];
  for (const faction of raceFactions) {
    const exists = await knex('factions').where({ id: faction.id }).first();
    if (!exists) {
      await knex('factions').insert(faction);
    }
  }

  // Ensure race rivalries exist
  const rivalries = [
    { faction_id: 'race_muscarian', rival_faction_id: 'race_kalin', spillover_ratio: 0.3 },
    { faction_id: 'race_kalin', rival_faction_id: 'race_muscarian', spillover_ratio: 0.3 },
    { faction_id: 'race_vedic', rival_faction_id: 'race_tarri', spillover_ratio: 0.2 },
    { faction_id: 'race_tarri', rival_faction_id: 'race_vedic', spillover_ratio: 0.2 },
  ];
  for (const rivalry of rivalries) {
    const exists = await knex('faction_rivalries')
      .where({ faction_id: rivalry.faction_id, rival_faction_id: rivalry.rival_faction_id })
      .first();
    if (!exists) {
      await knex('faction_rivalries').insert(rivalry);
    }
  }

  // Delete only procedural NPCs (e0000000 prefix)
  const procNpcIds = await knex('npc_definitions')
    .where('id', 'like', 'e0000000%')
    .pluck('id');

  if (procNpcIds.length > 0) {
    // Delete in batches to avoid SQLite limits
    for (let i = 0; i < procNpcIds.length; i += 100) {
      const batch = procNpcIds.slice(i, i + 100);
      await knex('player_npc_state').whereIn('npc_id', batch).del();
      await knex('npc_definitions').whereIn('id', batch).del();
    }
    console.log(`Deleted ${procNpcIds.length} existing procedural NPCs`);
  }

  // Pre-populate used names from existing NPCs
  const existingNames = await knex('npc_definitions').pluck('name');
  const usedNames = new Set<string>(existingNames);

  // Query locations from DB
  const allOutposts = await knex('outposts')
    .join('sectors', 'outposts.sector_id', 'sectors.id')
    .select('outposts.id as outpostId', 'outposts.sector_id as sectorId', 'sectors.has_star_mall as hasStarMall');
  const allPlanets = await knex('planets')
    .select('id as planetId', 'sector_id as sectorId');
  const allSectors = await knex('sectors').select('id');

  // Identify existing NPC sectors to avoid duplication
  const existingNpcSectors = new Set(
    (await knex('npc_definitions').where('id', 'not like', 'e0000000%').pluck('sector_id')).map(Number)
  );

  // Separate star mall outposts from regular outposts
  const starMallOutposts = allOutposts.filter((o: any) => o.hasStarMall);
  const regularOutposts = allOutposts.filter((o: any) => !o.hasStarMall);

  // Skip first 20 regular outposts and 10 planets (have hand-authored NPCs)
  const availableOutposts = regularOutposts.slice(20);
  const availablePlanets = allPlanets.slice(10);

  // Track which sectors have NPCs
  const sectorNpcCount = new Map<number, number>();
  const ambassadorCountByRace = new Map<string, number>();
  const neutralAmbassadorCountByRace = new Map<string, number>();
  for (const race of RACES) {
    ambassadorCountByRace.set(race, 0);
    neutralAmbassadorCountByRace.set(race, 0);
  }

  let nextId = 1;
  const allNpcs: any[] = [];

  function createNPC(
    npcType: NpcType,
    race: string,
    factionId: string,
    locationType: string,
    locationId: string | null,
    sectorId: number,
  ): void {
    const name = generateName(rng, race, usedNames);
    const config = NPC_TYPE_CONFIG[npcType];
    const variationIndex = Math.floor(rng() * 1000);
    const { tree, firstEncounter } = buildDialogue(npcType, name, race, factionId, variationIndex);

    allNpcs.push({
      id: procNpcId(nextId++),
      name,
      title: config.title,
      race,
      faction_id: factionId,
      location_type: locationType,
      location_id: locationId,
      sector_id: sectorId,
      dialogue_tree: JSON.stringify(tree),
      services: JSON.stringify(config.services),
      first_encounter: JSON.stringify(firstEncounter),
      sprite_config: JSON.stringify({ spriteId: RACE_SPRITES[race] || RACE_SPRITES.generic }),
      is_key_npc: false,
    });

    sectorNpcCount.set(sectorId, (sectorNpcCount.get(sectorId) || 0) + 1);
  }

  // =========================================================================
  // Phase 1: Star Malls — 1-2 race ambassadors + 1 trader + 1 mechanic + 0-1 bartender
  // =========================================================================
  console.log(`Phase 1: Seeding ${starMallOutposts.length} star malls...`);
  for (const outpost of starMallOutposts) {
    const sid = outpost.sectorId;
    const oid = outpost.outpostId;

    // 1-2 race ambassadors (random races, no dupes per mall)
    const numAmbassadors = 1 + (rng() < 0.5 ? 1 : 0);
    const shuffledRaces = [...RACES].sort(() => rng() - 0.5);
    for (let i = 0; i < numAmbassadors; i++) {
      const race = shuffledRaces[i];
      const factionId = `race_${race}`;
      createNPC('ambassador', race, factionId, 'outpost', oid, sid);
      ambassadorCountByRace.set(race, (ambassadorCountByRace.get(race) || 0) + 1);
    }

    // 1 trader
    createNPC('trader', pickRace(rng), 'traders_guild', 'outpost', oid, sid);

    // 1 mechanic
    const mechFaction = rng() < 0.5 ? 'traders_guild' : 'independent';
    createNPC('mechanic', pickRace(rng), mechFaction, 'outpost', oid, sid);

    // 0-1 bartender
    if (rng() < 0.6) {
      createNPC('bartender', pickRace(rng), 'shadow_syndicate', 'outpost', oid, sid);
    }
  }
  console.log(`  Phase 1 complete: ${allNpcs.length} NPCs in star malls`);

  // =========================================================================
  // Phase 2: Outposts — 1-3 NPCs each (85% chance)
  // =========================================================================
  const outpostWeights: Array<{ value: NpcType; weight: number }> = [
    { value: 'trader', weight: 25 },
    { value: 'bartender', weight: 20 },
    { value: 'mechanic', weight: 20 },
    { value: 'scout', weight: 10 },
    { value: 'bounty_hunter', weight: 10 },
    { value: 'smuggler', weight: 10 },
    { value: 'scholar', weight: 5 },
  ];

  const phase2Start = allNpcs.length;
  console.log(`Phase 2: Seeding ${availableOutposts.length} outposts...`);
  for (const outpost of availableOutposts) {
    if (rng() >= GAME_CONFIG.PROC_NPC_OUTPOST_CHANCE) continue;

    const sid = outpost.sectorId;
    const oid = outpost.outpostId;
    const numNpcs = 1 + Math.floor(rng() * 3); // 1-3

    const usedTypes = new Set<NpcType>();
    for (let i = 0; i < numNpcs; i++) {
      let npcType: NpcType;
      let attempts = 0;
      do {
        npcType = weightedPick(outpostWeights, rng);
        attempts++;
      } while (usedTypes.has(npcType) && attempts < 10);
      usedTypes.add(npcType);

      const config = NPC_TYPE_CONFIG[npcType];
      const race = pickRace(rng);
      const factionId = pickFrom(config.factions, rng);
      createNPC(npcType, race, factionId, 'outpost', oid, sid);
    }
  }
  console.log(`  Phase 2 complete: ${allNpcs.length - phase2Start} NPCs in outposts`);

  // =========================================================================
  // Phase 3: Planets — 30% chance of 1 NPC
  // =========================================================================
  const planetWeights: Array<{ value: NpcType; weight: number }> = [
    { value: 'scholar', weight: 30 },
    { value: 'scout', weight: 25 },
    { value: 'ambassador', weight: 20 },
    { value: 'bounty_hunter', weight: 15 },
    { value: 'smuggler', weight: 10 },
  ];

  const phase3Start = allNpcs.length;
  console.log(`Phase 3: Seeding ${availablePlanets.length} planets...`);
  for (const planet of availablePlanets) {
    if (rng() >= GAME_CONFIG.PROC_NPC_PLANET_CHANCE) continue;

    const sid = planet.sectorId;
    const pid = planet.planetId;
    const npcType = weightedPick(planetWeights, rng);
    const config = NPC_TYPE_CONFIG[npcType];
    const race = pickRace(rng);
    let factionId = pickFrom(config.factions, rng);

    if (npcType === 'ambassador') {
      factionId = `race_${race}`;
      ambassadorCountByRace.set(race, (ambassadorCountByRace.get(race) || 0) + 1);
    }

    createNPC(npcType, race, factionId, 'planet', pid, sid);
  }
  console.log(`  Phase 3 complete: ${allNpcs.length - phase3Start} NPCs on planets`);

  // =========================================================================
  // Phase 4: Wild sectors — 1 NPC each in empty sectors
  // =========================================================================
  const wildWeights: Array<{ value: NpcType; weight: number }> = [
    { value: 'scout', weight: 30 },
    { value: 'bounty_hunter', weight: 25 },
    { value: 'smuggler', weight: 20 },
    { value: 'bartender', weight: 15 },
    { value: 'scholar', weight: 10 },
  ];

  // Find sectors that have no NPCs yet and no outpost/planet
  const outpostSectors = new Set(allOutposts.map((o: any) => o.sectorId));
  const planetSectors = new Set(allPlanets.map((p: any) => p.sectorId));
  const npcSectors = new Set([...sectorNpcCount.keys(), ...existingNpcSectors]);

  const emptySectors = allSectors
    .map((s: any) => s.id)
    .filter((id: number) => !outpostSectors.has(id) && !planetSectors.has(id) && !npcSectors.has(id));

  // Shuffle and pick up to WILD_TARGET
  const shuffledEmpty = emptySectors.sort(() => rng() - 0.5);
  const wildTarget = Math.min(GAME_CONFIG.PROC_NPC_WILD_TARGET, shuffledEmpty.length);

  const phase4Start = allNpcs.length;
  console.log(`Phase 4: Seeding ${wildTarget} wild sectors (from ${shuffledEmpty.length} empty)...`);
  for (let i = 0; i < wildTarget; i++) {
    const sectorId = shuffledEmpty[i];
    const npcType = weightedPick(wildWeights, rng);
    const config = NPC_TYPE_CONFIG[npcType];
    const race = pickRace(rng);
    const factionId = pickFrom(config.factions, rng);
    createNPC(npcType, race, factionId, 'sector', null, sectorId);
  }
  console.log(`  Phase 4 complete: ${allNpcs.length - phase4Start} NPCs in wild sectors`);

  // =========================================================================
  // Phase 5: Extra ambassadors — ensure 12-15 per race + 3 neutral per race
  // =========================================================================
  const phase5Start = allNpcs.length;
  console.log('Phase 5: Ensuring ambassador coverage...');

  // Find sectors that could take an ambassador (outposts or planets not yet overcrowded)
  const candidateSectors = [
    ...availableOutposts.map((o: any) => ({ sectorId: o.sectorId, locationType: 'outpost', locationId: o.outpostId })),
    ...availablePlanets.map((p: any) => ({ sectorId: p.sectorId, locationType: 'planet', locationId: p.planetId })),
  ].filter(c => (sectorNpcCount.get(c.sectorId) || 0) < 4);

  let candidateIdx = 0;
  const shuffledCandidates = candidateSectors.sort(() => rng() - 0.5);

  for (const race of RACES) {
    // Race ambassadors
    const current = ambassadorCountByRace.get(race) || 0;
    const target = GAME_CONFIG.PROC_NPC_AMBASSADORS_PER_RACE;
    const needed = Math.max(0, target - current);

    for (let i = 0; i < needed && candidateIdx < shuffledCandidates.length; i++) {
      const c = shuffledCandidates[candidateIdx++];
      createNPC('ambassador', race, `race_${race}`, c.locationType, c.locationId, c.sectorId);
      ambassadorCountByRace.set(race, (ambassadorCountByRace.get(race) || 0) + 1);
    }

    // Neutral ambassadors (independent faction, no spillover)
    const currentNeutral = neutralAmbassadorCountByRace.get(race) || 0;
    const neutralTarget = GAME_CONFIG.PROC_NPC_NEUTRAL_AMBASSADORS_PER_RACE;
    const neutralNeeded = Math.max(0, neutralTarget - currentNeutral);

    for (let i = 0; i < neutralNeeded && candidateIdx < shuffledCandidates.length; i++) {
      const c = shuffledCandidates[candidateIdx++];
      createNPC('ambassador', race, 'independent', c.locationType, c.locationId, c.sectorId);
      neutralAmbassadorCountByRace.set(race, (neutralAmbassadorCountByRace.get(race) || 0) + 1);
    }
  }
  console.log(`  Phase 5 complete: ${allNpcs.length - phase5Start} extra ambassadors`);

  // =========================================================================
  // Batch insert
  // =========================================================================
  console.log(`Inserting ${allNpcs.length} procedural NPCs...`);
  for (const npc of allNpcs) {
    await knex('npc_definitions').insert(npc);
  }

  // Print stats
  const totalSectorsWithNpcs = new Set([...sectorNpcCount.keys()]).size;
  console.log(`\nProcedural NPC seeding complete:`);
  console.log(`  Total NPCs: ${allNpcs.length}`);
  console.log(`  Sectors with NPCs: ${totalSectorsWithNpcs}`);
  for (const race of RACES) {
    console.log(`  ${race} ambassadors: ${ambassadorCountByRace.get(race)} race + ${neutralAmbassadorCountByRace.get(race)} neutral`);
  }
}
