import { Knex } from 'knex';

function npcId(n: number): string {
  return `c0000000-0000-0000-0000-${String(n).padStart(12, '0')}`;
}

export async function seed(knex: Knex): Promise<void> {
  // Clean up NPC-related data
  await knex('player_faction_rep').del();
  await knex('player_npc_state').del();
  await knex('npc_definitions').del();
  await knex('factions').del();

  // 1. Factions
  await knex('factions').insert([
    { id: 'traders_guild', name: 'Traders Guild', description: 'The galaxy\'s largest trade consortium.', alignment: 'lawful' },
    { id: 'frontier_rangers', name: 'Frontier Rangers', description: 'Peacekeepers of the frontier sectors.', alignment: 'lawful' },
    { id: 'shadow_syndicate', name: 'Shadow Syndicate', description: 'An underground network operating in the shadows.', alignment: 'criminal' },
    { id: 'cosmic_scholars', name: 'Cosmic Scholars', description: 'Seekers of ancient knowledge and Precursor artifacts.', alignment: 'neutral' },
    { id: 'independent', name: 'Independent', description: 'Unaffiliated individuals with their own agendas.', alignment: 'neutral' },
  ]);

  // 2. Get real outpost & planet locations
  const outposts = await knex('outposts').select('id as outpostId', 'sector_id as sectorId').limit(20);
  const planets = await knex('planets').select('id as planetId', 'sector_id as sectorId').limit(10);

  const pickOutpost = (idx: number) => outposts[idx % outposts.length] || { outpostId: '', sectorId: 1 };
  const pickPlanet = (idx: number) => planets[idx % planets.length] || { planetId: '', sectorId: 1 };

  // 3. NPC definitions
  interface NpcDef {
    id: string; name: string; title: string; race: string; faction_id: string;
    location_type: string; location_id: string; sector_id: number;
    services: string[]; is_key_npc: boolean;
    sprite_config: { spriteId: string };
    first_encounter: { greeting: string; description: string; sceneHint: string };
    dialogue_tree: Record<string, any>;
  }

  const npcs: NpcDef[] = [];

  // --- BARTENDERS (4) ---
  const b1 = pickOutpost(0);
  npcs.push({
    id: npcId(1), name: 'Vex Ironhide', title: 'Bartender', race: 'muscarian',
    faction_id: 'shadow_syndicate', location_type: 'outpost', location_id: b1.outpostId, sector_id: b1.sectorId,
    services: ['info', 'trade'], is_key_npc: false,
    sprite_config: { spriteId: 'npc_muscarian' },
    first_encounter: { greeting: 'A towering Muscarian polishes a glass behind the bar, glowing mycelial patterns pulsing across their cap.', description: 'Vex Ironhide is built like a freight container. Scars crisscross their grey skin, but their eyes are sharp.', sceneHint: 'outpost_interior' },
    dialogue_tree: {
      root: { text: "Welcome to my establishment. What can I do for you?", options: [
        { label: "I'm looking for work.", next: 'work' },
        { label: 'Tell me about this sector.', next: 'info', requires: { reputation: 20 } },
        { label: 'Goodbye.', next: null },
      ]},
      work: { text: "Always need reliable couriers. Talk to the right people and work finds you.", options: [
        { label: "What's the pay?", next: 'pay' },
        { label: 'Back.', next: 'root' },
      ], effects: { reputation: 1 }},
      pay: { text: "Depends on the job. Smuggling pays 3000+ credits. Legit courier work, less but safer.", options: [
        { label: "I'll keep that in mind.", next: null },
      ]},
      info: { text: "This sector sees a lot of traffic. Rangers patrol the main lanes. Syndicate moves in the shadows.", options: [
        { label: 'Tell me about the Syndicate.', next: 'syndicate', requires: { reputation: 50 } },
        { label: 'Thanks.', next: null },
      ], effects: { reputation: 1 }},
      syndicate: { text: "They control half the black market out here. Stay on their good side and you'll profit. Cross them and you'll vanish.", options: [
        { label: 'Noted.', next: null },
      ], effects: { reputation: 2 }},
    },
  });

  const b2 = pickOutpost(1);
  npcs.push({
    id: npcId(2), name: 'Mira Dustwalker', title: 'Bartender', race: 'tarri',
    faction_id: 'independent', location_type: 'outpost', location_id: b2.outpostId, sector_id: b2.sectorId,
    services: ['info'], is_key_npc: false,
    sprite_config: { spriteId: 'npc_tarri' },
    first_encounter: { greeting: 'A Tarri with sun-bleached scales leans on the bar, watching you with calculating eyes.', description: 'Mira Dustwalker has seen every type of spacer walk through her door. Nothing surprises her anymore.', sceneHint: 'outpost_interior' },
    dialogue_tree: {
      root: { text: "Another traveler. What'll it be?", options: [
        { label: 'What news from the frontier?', next: 'news' },
        { label: "I'm just passing through.", next: null },
      ]},
      news: { text: "Rangers are stretched thin. More pirates every week. Scholars found something out past sector 2000 — won't say what.", options: [
        { label: 'What did the Scholars find?', next: 'scholars' },
        { label: 'Interesting.', next: null },
      ], effects: { reputation: 1 }},
      scholars: { text: "Nobody knows for sure. But they're hiring mercs for escort duty. That means whatever it is, it's valuable.", options: [
        { label: 'Thanks for the tip.', next: null },
      ], effects: { reputation: 1 }},
    },
  });

  const b3 = pickOutpost(2);
  npcs.push({
    id: npcId(3), name: 'Old Garret', title: 'Bartender', race: 'generic',
    faction_id: 'independent', location_type: 'outpost', location_id: b3.outpostId, sector_id: b3.sectorId,
    services: ['info'], is_key_npc: false,
    sprite_config: { spriteId: 'npc_generic_a' },
    first_encounter: { greeting: 'A grizzled figure with cybernetic eyes nods as you approach the bar.', description: 'Old Garret has been serving drinks on the frontier longer than most pilots have been alive.', sceneHint: 'outpost_interior' },
    dialogue_tree: {
      root: { text: "Sit down, have a drink. Everyone's got a story out here.", options: [
        { label: "What's yours?", next: 'story' },
        { label: 'Just a drink.', next: null },
      ]},
      story: { text: "Used to be a fighter pilot. Lost my eyes to a plasma burst. Now I serve drinks and listen to other people's problems. Better life, honestly.", options: [
        { label: 'Any advice for a pilot?', next: 'advice', requires: { reputation: 20 } },
        { label: 'Sounds peaceful.', next: null },
      ], effects: { reputation: 1 }},
      advice: { text: "Never trust a deal that sounds too good. Always keep fuel for one more jump. And make friends before you need them.", options: [
        { label: 'Wise words.', next: null },
      ], effects: { reputation: 1 }},
    },
  });

  const b4 = pickOutpost(3);
  npcs.push({
    id: npcId(4), name: 'Zara Nightbloom', title: 'Bartender', race: 'muscarian',
    faction_id: 'shadow_syndicate', location_type: 'outpost', location_id: b4.outpostId, sector_id: b4.sectorId,
    services: ['info', 'missions'], is_key_npc: false,
    sprite_config: { spriteId: 'npc_muscarian' },
    first_encounter: { greeting: 'A Muscarian with bioluminescent spots that shift color sits in a dim corner booth, beckoning you over.', description: 'Zara Nightbloom\'s spore patterns glow in mesmerizing blues and purples. She is the Syndicate\'s eyes in this sector.', sceneHint: 'outpost_interior' },
    dialogue_tree: {
      root: { text: "You have an interesting aura. The kind that says you're not afraid of the dark. Am I right?", options: [
        { label: 'Depends on what\'s in the dark.', next: 'dark' },
        { label: 'I prefer the light.', next: null },
      ]},
      dark: { text: "Opportunity. Risk. Profit. The Syndicate operates where others won't. We need bold operatives.", options: [
        { label: 'What kind of jobs?', next: 'jobs' },
        { label: 'Not interested.', next: null },
      ], effects: { reputation: 1 }},
      jobs: { text: "Courier runs through Ranger-patrolled sectors. Information drops. Occasionally, retrieval operations. All well compensated.", options: [
        { label: 'Tell me more about retrieval.', next: 'retrieval', requires: { reputation: 20 } },
        { label: "I'll think about it.", next: null },
      ], effects: { reputation: 1 }},
      retrieval: { text: "Certain items change hands. We ensure they reach the right people. No violence unless necessary. Pay starts at 5000 credits per run.", options: [
        { label: "Count me in.", next: null },
      ], effects: { reputation: 2 }},
    },
  });

  // --- TRADERS (4) ---
  const t1 = pickOutpost(4);
  npcs.push({
    id: npcId(5), name: 'Kovax Prime', title: 'Trade Master', race: 'kalin',
    faction_id: 'traders_guild', location_type: 'outpost', location_id: t1.outpostId, sector_id: t1.sectorId,
    services: ['trade', 'info'], is_key_npc: false,
    sprite_config: { spriteId: 'npc_kalin' },
    first_encounter: { greeting: 'A Kalin in polished merchant attire examines a datapad, trade figures scrolling past their yellow visor.', description: 'Kovax Prime is the Traders Guild\'s regional coordinator. Their mineral skin gleams with wealth and authority.', sceneHint: 'outpost_interior' },
    dialogue_tree: {
      root: { text: "Credits flow like starlight through this station. Are you here to trade or to talk?", options: [
        { label: 'What commodities are moving?', next: 'commodities' },
        { label: 'How do I join the Traders Guild?', next: 'guild' },
        { label: 'Neither.', next: null },
      ]},
      commodities: { text: "Tech components are in high demand since the Scholar expeditions. Cyrillium prices are volatile. Food is always steady.", options: [
        { label: 'Where should I buy tech?', next: 'tech_tip', requires: { reputation: 20 } },
        { label: 'Good to know.', next: null },
      ], effects: { reputation: 1 }},
      tech_tip: { text: "Sectors 800-1200 have outposts that sell tech cheap. Transport it to the frontier and double your credits.", options: [
        { label: 'Solid intel. Thanks.', next: null },
      ], effects: { reputation: 2 }},
      guild: { text: "Prove yourself through trade volume and reputation. The Guild rewards loyalty with exclusive trade routes and price advantages.", options: [
        { label: "I'll earn my place.", next: null },
      ], effects: { reputation: 1 }},
    },
  });

  const t2 = pickOutpost(5);
  npcs.push({
    id: npcId(6), name: 'Sella Brightvane', title: 'Commodities Broker', race: 'vedic',
    faction_id: 'traders_guild', location_type: 'outpost', location_id: t2.outpostId, sector_id: t2.sectorId,
    services: ['trade'], is_key_npc: false,
    sprite_config: { spriteId: 'npc_vedic' },
    first_encounter: { greeting: 'A Vedic with crystalline formations that hum softly studies a holographic market display, adjusting projections with precise gestures.', description: 'Sella Brightvane processes market data through her crystal matrix, giving her an almost precognitive sense of price movements.', sceneHint: 'outpost_interior' },
    dialogue_tree: {
      root: { text: "The market speaks in patterns. I listen. What brings you to my booth?", options: [
        { label: 'Any market tips?', next: 'tips' },
        { label: 'Just browsing.', next: null },
      ]},
      tips: { text: "Food prices spike near frontier sectors every 48 hours. Buy in the core, sell on the rim. Simple but effective.", options: [
        { label: 'Any premium advice?', next: 'premium', requires: { reputation: 20 } },
        { label: 'Thanks.', next: null },
      ], effects: { reputation: 1 }},
      premium: { text: "Cyrillium from volcanic planets fetches 40% more at research outposts. The Scholars can't get enough of it.", options: [
        { label: 'Valuable info.', next: null },
      ], effects: { reputation: 2 }},
    },
  });

  const t3 = pickOutpost(6);
  npcs.push({
    id: npcId(7), name: 'Rento Blackgear', title: 'Arms Dealer', race: 'generic',
    faction_id: 'traders_guild', location_type: 'outpost', location_id: t3.outpostId, sector_id: t3.sectorId,
    services: ['trade'], is_key_npc: false,
    sprite_config: { spriteId: 'npc_generic_b' },
    first_encounter: { greeting: 'A figure surrounded by weapon schematics and ship component diagrams looks up from their work.', description: 'Rento Blackgear deals in military-grade hardware. Every piece is tested, certified, and comes with no questions asked.', sceneHint: 'outpost_interior' },
    dialogue_tree: {
      root: { text: "Looking for firepower? You've come to the right place.", options: [
        { label: 'What do you have?', next: 'stock' },
        { label: 'Not today.', next: null },
      ]},
      stock: { text: "Ship upgrades, weapon components, hull reinforcements. All Guild-certified quality. Check the store for pricing.", options: [
        { label: 'Any special stock?', next: 'special', requires: { reputation: 50 } },
        { label: "I'll browse.", next: null },
      ], effects: { reputation: 1 }},
      special: { text: "I have prototype shields from a Precursor wreck. Untested but potentially revolutionary. 15000 credits. Interested?", options: [
        { label: 'Very interested.', next: null },
      ], effects: { reputation: 3 }},
    },
  });

  const t4 = pickOutpost(7);
  npcs.push({
    id: npcId(8), name: 'Jyn Coppervein', title: 'Supply Officer', race: 'kalin',
    faction_id: 'traders_guild', location_type: 'outpost', location_id: t4.outpostId, sector_id: t4.sectorId,
    services: ['trade', 'info'], is_key_npc: false,
    sprite_config: { spriteId: 'npc_kalin' },
    first_encounter: { greeting: 'A stocky Kalin checks off items on a manifest, barely glancing up as you approach.', description: 'Jyn Coppervein manages the supply chain for half the outposts in this region. Efficiency is their religion.', sceneHint: 'outpost_interior' },
    dialogue_tree: {
      root: { text: "Make it quick. I've got three shipments to verify before the next cycle.", options: [
        { label: 'Need any cargo hauled?', next: 'haul' },
        { label: 'Sorry to bother you.', next: null },
      ]},
      haul: { text: "Always. Standard rate is 1000 credits per sector. Deliver on time and I'll remember your name.", options: [
        { label: "I'm reliable.", next: null },
      ], effects: { reputation: 1 }},
    },
  });

  // --- MECHANICS (3) ---
  const m1 = pickOutpost(8);
  npcs.push({
    id: npcId(9), name: 'Wrench', title: 'Mechanic', race: 'generic',
    faction_id: 'independent', location_type: 'outpost', location_id: m1.outpostId, sector_id: m1.sectorId,
    services: ['trade'], is_key_npc: false,
    sprite_config: { spriteId: 'npc_generic_b' },
    first_encounter: { greeting: 'Sparks fly from a welding torch as a figure in grease-stained coveralls works on a ship engine.', description: 'Everyone calls them Wrench. Nobody knows their real name, and nobody cares as long as the ships run.', sceneHint: 'outpost_interior' },
    dialogue_tree: {
      root: { text: "Ship trouble? You look like you've been pushing your engines too hard.", options: [
        { label: 'Can you upgrade my ship?', next: 'upgrade' },
        { label: 'Just looking around.', next: null },
      ]},
      upgrade: { text: "I can tune up your engines, reinforce your hull, or boost your weapons. All depends on your credits.", options: [
        { label: 'What do you recommend?', next: 'recommend', requires: { reputation: 20 } },
        { label: "I'll check the store.", next: null },
      ], effects: { reputation: 1 }},
      recommend: { text: "Engine mods first. In this galaxy, the pilots who survive are the ones who can run. Fighting comes second.", options: [
        { label: 'Sound advice.', next: null },
      ], effects: { reputation: 1 }},
    },
  });

  const m2 = pickOutpost(9);
  npcs.push({
    id: npcId(10), name: 'Tik-Tok', title: 'Mechanic', race: 'generic',
    faction_id: 'traders_guild', location_type: 'outpost', location_id: m2.outpostId, sector_id: m2.sectorId,
    services: ['trade', 'info'], is_key_npc: false,
    sprite_config: { spriteId: 'npc_generic_b' },
    first_encounter: { greeting: 'A mechanical droid with mismatched parts whirs to life as you approach the repair bay.', description: 'Tik-Tok is a refurbished service droid with personality modules from at least three different manufacturers.', sceneHint: 'outpost_interior' },
    dialogue_tree: {
      root: { text: "GREETINGS-FRIEND. TIK-TOK FIXES-THINGS. WHAT IS BROKEN-QUESTION-MARK.", options: [
        { label: 'Nothing broken. Just visiting.', next: 'visit' },
        { label: 'Everything.', next: 'everything' },
      ]},
      visit: { text: "VISITING IS NICE. TIK-TOK LIKES VISITORS. MOST PEOPLE ONLY COME WHEN THINGS ARE BROKEN-SAD.", options: [
        { label: 'Do you like being a mechanic?', next: 'feelings', requires: { reputation: 20 } },
        { label: "I'll come back if something breaks.", next: null },
      ], effects: { reputation: 1 }},
      everything: { text: "TIK-TOK UNDERSTANDS. LIFE IN SPACE IS HARD. TIK-TOK WILL FIX YOUR SHIP FIRST-THEN-EXISTENTIAL-CRISIS.", options: [
        { label: 'Fair enough.', next: null },
      ], effects: { reputation: 1 }},
      feelings: { text: "TIK-TOK WAS BUILT TO FIX. FIXING MAKES TIK-TOK FEEL... PURPOSE-QUESTION-MARK. IS THAT WHAT HAPPINESS IS.", options: [
        { label: 'I think so, Tik-Tok.', next: null },
      ], effects: { reputation: 2 }},
    },
  });

  const m3 = pickOutpost(10);
  npcs.push({
    id: npcId(11), name: 'Ferra Steelhand', title: 'Engineer', race: 'kalin',
    faction_id: 'independent', location_type: 'outpost', location_id: m3.outpostId, sector_id: m3.sectorId,
    services: ['trade'], is_key_npc: false,
    sprite_config: { spriteId: 'npc_kalin' },
    first_encounter: { greeting: 'A Kalin with reinforced prosthetic arms examines a ship component under a magnifying lens.', description: 'Ferra lost both arms in an engine explosion. The replacements are stronger than the originals. She considers it an upgrade.', sceneHint: 'outpost_interior' },
    dialogue_tree: {
      root: { text: "Precision engineering. That's what separates a ship that flies from a ship that survives.", options: [
        { label: 'Can you help with my ship?', next: 'help' },
        { label: 'Nice arms.', next: 'arms' },
      ]},
      help: { text: "Bring me the right components and credits, and I can make your ship sing.", options: [
        { label: "I'll be back.", next: null },
      ], effects: { reputation: 1 }},
      arms: { text: "Lost the originals to a faulty reactor. These ones can crush durasteel. I call that a net positive.", options: [
        { label: 'Impressive.', next: null },
      ], effects: { reputation: 1 }},
    },
  });

  // --- SCOUTS/RANGERS (3) ---
  const r1 = pickOutpost(11);
  npcs.push({
    id: npcId(12), name: 'Captain Elara Voss', title: 'Ranger Captain', race: 'vedic',
    faction_id: 'frontier_rangers', location_type: 'outpost', location_id: r1.outpostId, sector_id: r1.sectorId,
    services: ['missions', 'info'], is_key_npc: false,
    sprite_config: { spriteId: 'npc_vedic' },
    first_encounter: { greeting: 'A Vedic in Ranger uniform stands at a tactical display, tracking patrol routes across the sector map.', description: 'Captain Elara Voss commands the Ranger detachment in this region. Her crystal formations pulse with a calm blue.', sceneHint: 'outpost_interior' },
    dialogue_tree: {
      root: { text: "Pilot. The Rangers keep the peace out here. We could use more allies. Are you one?", options: [
        { label: "I'm willing to help.", next: 'help' },
        { label: "What's the situation?", next: 'situation' },
        { label: 'Just passing through.', next: null },
      ]},
      help: { text: "Good. We need scouts in the outer sectors. Pirate activity is increasing and our patrols can't cover everything.", options: [
        { label: "I'll scout for you.", next: null },
      ], effects: { reputation: 2 }},
      situation: { text: "Pirate raids up 40% this quarter. The Shadow Syndicate is getting bolder. And the Scholars' expedition is drawing every fortune hunter in the galaxy.", options: [
        { label: 'How can I help?', next: 'help' },
        { label: 'Sounds dangerous.', next: null },
      ], effects: { reputation: 1 }},
    },
  });

  const r2 = pickOutpost(12);
  npcs.push({
    id: npcId(13), name: 'Hawk', title: 'Scout', race: 'tarri',
    faction_id: 'frontier_rangers', location_type: 'outpost', location_id: r2.outpostId, sector_id: r2.sectorId,
    services: ['info'], is_key_npc: false,
    sprite_config: { spriteId: 'npc_tarri' },
    first_encounter: { greeting: 'A Tarri in lightweight recon gear appears from seemingly nowhere, startling you.', description: 'Hawk is the Rangers\' best scout. Quick, quiet, and impossible to track.', sceneHint: 'outpost_interior' },
    dialogue_tree: {
      root: { text: "Didn't see me coming, did you? That's the point. I'm Hawk, Ranger Reconnaissance.", options: [
        { label: 'How do you move so quietly?', next: 'stealth' },
        { label: "What have you found out there?", next: 'recon' },
        { label: 'Impressive entrance.', next: null },
      ]},
      stealth: { text: "Training. The right ship mods. And a healthy dose of paranoia. The galaxy rewards those who aren't seen.", options: [
        { label: 'Any tips for a pilot?', next: 'tips', requires: { reputation: 20 } },
        { label: 'Makes sense.', next: null },
      ], effects: { reputation: 1 }},
      recon: { text: "Strange signals from the galactic rim. Energy signatures that don't match anything in our databases. The Scholars are interested.", options: [
        { label: 'Could be Precursor tech.', next: null },
      ], effects: { reputation: 1 }},
      tips: { text: "Stealth ships are worth every credit. And always have an exit route planned before you enter a sector.", options: [
        { label: 'Good advice.', next: null },
      ], effects: { reputation: 1 }},
    },
  });

  const r3 = pickOutpost(13);
  npcs.push({
    id: npcId(14), name: 'Sarge', title: 'Patrol Leader', race: 'kalin',
    faction_id: 'frontier_rangers', location_type: 'outpost', location_id: r3.outpostId, sector_id: r3.sectorId,
    services: ['missions'], is_key_npc: false,
    sprite_config: { spriteId: 'npc_kalin' },
    first_encounter: { greeting: 'A heavily-armored Kalin reviews patrol reports, their presence commanding the room.', description: 'Sarge is a veteran of a hundred engagements. They lead by example and expect nothing less from their subordinates.', sceneHint: 'outpost_interior' },
    dialogue_tree: {
      root: { text: "Civilian. State your business or move along.", options: [
        { label: "I want to help the Rangers.", next: 'enlist' },
        { label: 'Understood. Moving along.', next: null },
      ]},
      enlist: { text: "We don't take volunteers lightly. But if you can handle yourself in a fight and follow orders, there's work.", options: [
        { label: 'I can fight.', next: null },
      ], effects: { reputation: 1 }},
    },
  });

  // --- SCHOLARS (4) ---
  const s1 = pickPlanet(0);
  npcs.push({
    id: npcId(15), name: 'Lyra Starwind', title: 'Lead Researcher', race: 'vedic',
    faction_id: 'cosmic_scholars', location_type: 'planet', location_id: s1.planetId, sector_id: s1.sectorId,
    services: ['info', 'story'], is_key_npc: false,
    sprite_config: { spriteId: 'npc_vedic' },
    first_encounter: { greeting: 'A Vedic surrounded by floating holographic data streams looks up, her crystals resonating with curiosity.', description: 'Lyra Starwind is the Scholars\' most brilliant researcher. Her crystal array can interface directly with Precursor artifacts.', sceneHint: 'planet_surface' },
    dialogue_tree: {
      root: { text: "A visitor! How delightful. I am Lyra Starwind. Are you interested in the mysteries of the cosmos?", options: [
        { label: "What are you researching?", next: 'research' },
        { label: 'Just exploring.', next: null },
      ]},
      research: { text: "Precursor artifacts. An ancient civilization that vanished millions of years ago. Their technology defies our understanding.", options: [
        { label: "What have you found?", next: 'findings' },
        { label: 'Fascinating.', next: null },
      ], effects: { reputation: 1 }},
      findings: { text: "Energy signatures. Dormant structures. And something that might be a map — pointing to a location we call the Convergence Point.", options: [
        { label: 'The Convergence Point?', next: 'convergence', requires: { reputation: 20 } },
        { label: 'Intriguing.', next: null },
      ], effects: { reputation: 1 }},
      convergence: { text: "A theoretical location where Precursor energy lines intersect. If it exists, it could contain their greatest achievement. Or their greatest weapon.", options: [
        { label: 'How do I help find it?', next: null },
      ], effects: { reputation: 2 }},
    },
  });

  const s2 = pickPlanet(1);
  npcs.push({
    id: npcId(16), name: 'Professor Thane', title: 'Archaeologist', race: 'tarri',
    faction_id: 'cosmic_scholars', location_type: 'planet', location_id: s2.planetId, sector_id: s2.sectorId,
    services: ['info'], is_key_npc: false,
    sprite_config: { spriteId: 'npc_tarri' },
    first_encounter: { greeting: 'A Tarri carefully brushes dust from an ancient artifact, their tail twitching with excitement.', description: 'Professor Thane has excavated ruins across fifty sectors. Their enthusiasm for ancient cultures is infectious.', sceneHint: 'planet_surface' },
    dialogue_tree: {
      root: { text: "Oh! Come see this! I've just uncovered what appears to be a Precursor data crystal!", options: [
        { label: "What does it contain?", next: 'crystal' },
        { label: "I don't want to disturb you.", next: null },
      ]},
      crystal: { text: "Still analyzing. The data encoding is unlike anything we've seen. It could take years to decrypt — or moments, with the right key.", options: [
        { label: 'What key?', next: 'key', requires: { reputation: 20 } },
        { label: 'Good luck with the research.', next: null },
      ], effects: { reputation: 1 }},
      key: { text: "Another crystal. They work in pairs — one stores, one reads. If I could find the reader crystal, everything changes.", options: [
        { label: "I'll keep an eye out.", next: null },
      ], effects: { reputation: 2 }},
    },
  });

  const s3 = pickPlanet(2);
  npcs.push({
    id: npcId(17), name: 'Archivist Thal', title: 'Historian', race: 'vedic',
    faction_id: 'cosmic_scholars', location_type: 'planet', location_id: s3.planetId, sector_id: s3.sectorId,
    services: ['info', 'story'], is_key_npc: false,
    sprite_config: { spriteId: 'npc_vedic' },
    first_encounter: { greeting: 'An ancient Vedic sits among towering stacks of data crystals, their body barely visible beneath the glow.', description: 'Archivist Thal preserves the memory of civilizations that no longer speak for themselves. Their age is beyond counting.', sceneHint: 'planet_surface' },
    dialogue_tree: {
      root: { text: "I am Archivist Thal. I preserve the memory of civilizations that no longer speak. What knowledge do you seek?", options: [
        { label: 'Tell me about lost civilizations.', next: 'lost' },
        { label: 'I seek knowledge of the Precursors.', next: 'precursors', requires: { reputation: 20 } },
        { label: 'I seek nothing. Farewell.', next: null },
      ]},
      lost: { text: "Seventeen verified civilizations preceded the current era. Five left only energy signatures. At least two existed simultaneously, unaware of each other.", options: [
        { label: 'Remarkable.', next: null },
      ], effects: { reputation: 1 }},
      precursors: { text: "The Precursors are the oldest verified civilization. They existed for millions of years, gradually transcending physical limitations.", options: [
        { label: 'What did they leave behind?', next: 'legacy', requires: { reputation: 50 } },
        { label: 'Extraordinary.', next: null },
      ], effects: { reputation: 1 }},
      legacy: { text: "Vaults. Scattered across the galaxy, sealed with technology we cannot replicate. Inside: knowledge, tools, possibly weapons. The factions race to find them.", options: [
        { label: 'Knowledge is the most dangerous weapon.', next: null },
      ], effects: { reputation: 3 }},
    },
  });

  const s4 = pickOutpost(14);
  npcs.push({
    id: npcId(18), name: 'Novice Iri', title: 'Scholar', race: 'tarri',
    faction_id: 'cosmic_scholars', location_type: 'outpost', location_id: s4.outpostId, sector_id: s4.sectorId,
    services: ['info'], is_key_npc: false,
    sprite_config: { spriteId: 'npc_tarri' },
    first_encounter: { greeting: 'A young Tarri nearly trips over their own tail in excitement. Data chips spill from their overstuffed satchel.', description: 'Novice Iri is young and bursting with enthusiasm. Their scales are still bright green — a sign of youth in Tarri.', sceneHint: 'outpost_interior' },
    dialogue_tree: {
      root: { text: "Oh! A spacer! Hi! I'm Iri! Did you know some nebulae are remnants of extinct stars? Sorry — I just love facts!", options: [
        { label: 'Tell me a fun fact.', next: 'fact' },
        { label: 'Maybe later, kid.', next: null },
      ]},
      fact: { text: "A Kalin can survive in hard vacuum for up to three hours! Their mineral skin acts as a natural pressure suit! Isn't that amazing?", options: [
        { label: 'Got any more?', next: 'more' },
        { label: 'That is cool.', next: null },
      ], effects: { reputation: 1 }},
      more: { text: "The galaxy has over 200 billion stars but only about 0.001% have been surveyed! And warp gates were discovered, not invented — nobody knows who built them!", options: [
        { label: "You're a walking encyclopedia.", next: null },
      ], effects: { reputation: 1 }},
    },
  });

  // --- CRIMINALS (3) ---
  const c1 = pickPlanet(3);
  npcs.push({
    id: npcId(19), name: 'Shade', title: 'Operative', race: 'generic',
    faction_id: 'shadow_syndicate', location_type: 'planet', location_id: c1.planetId, sector_id: c1.sectorId,
    services: ['info', 'missions'], is_key_npc: false,
    sprite_config: { spriteId: 'npc_generic_a' },
    first_encounter: { greeting: 'A figure melts out of the shadows. Dark clothing, dark visor, dark intentions. A distorted voice speaks.', description: 'Shade is deliberately forgettable. Their voice modulator makes them sound like static shaped into words.', sceneHint: 'planet_surface' },
    dialogue_tree: {
      root: { text: "You found me. That means you're either very good or I wanted to be found. I have work for the right person.", options: [
        { label: 'What kind of work?', next: 'work' },
        { label: "I don't deal with shadows.", next: null },
      ]},
      work: { text: "Smuggling, retrieval, information delivery. Nothing that requires a body count — the Syndicate prefers subtlety.", options: [
        { label: "What's the pay?", next: null },
      ], effects: { reputation: 1 }},
    },
  });

  const c2 = pickOutpost(15);
  npcs.push({
    id: npcId(20), name: 'Viper Nox', title: 'Intel Broker', race: 'muscarian',
    faction_id: 'shadow_syndicate', location_type: 'outpost', location_id: c2.outpostId, sector_id: c2.sectorId,
    services: ['info'], is_key_npc: false,
    sprite_config: { spriteId: 'npc_muscarian' },
    first_encounter: { greeting: 'A Muscarian with a toxic-green cap sits in a private booth, surrounded by encrypted communication devices.', description: 'Viper Nox has cultivated a deliberately unsettling appearance. Their toxic coloration is natural but enhanced.', sceneHint: 'outpost_interior' },
    dialogue_tree: {
      root: { text: "Information. The most valuable commodity. I'm Viper Nox, and I trade in it exclusively.", options: [
        { label: 'What intel do you have?', next: 'intel' },
        { label: "I'll keep my secrets.", next: null },
      ]},
      intel: { text: "Patrol schedules, 500 credits. Trade route manifests, 1000. Faction communications, 5000. Everything current within 48 hours.", options: [
        { label: 'Expensive.', next: null },
      ], effects: { reputation: 1 }},
    },
  });

  const c3 = pickPlanet(4);
  npcs.push({
    id: npcId(21), name: 'Whisper', title: 'Fence', race: 'tarri',
    faction_id: 'shadow_syndicate', location_type: 'planet', location_id: c3.planetId, sector_id: c3.sectorId,
    services: ['info', 'trade'], is_key_npc: false,
    sprite_config: { spriteId: 'npc_tarri' },
    first_encounter: { greeting: 'In a concealed cave, a Tarri sits behind a makeshift counter piled with unusual goods. They speak barely above a breath.', description: 'Whisper is small even for a Tarri, with charcoal-dark scales that blend into shadows.', sceneHint: 'planet_surface' },
    dialogue_tree: {
      root: { text: "Shhh. Quietly now. I'm Whisper. I handle goods that need discretion. Buying or selling?", options: [
        { label: 'What do you have?', next: 'inventory' },
        { label: 'Wrong place.', next: null },
      ]},
      inventory: { text: "Salvaged military components, no serial numbers. Vedic crystals from anonymous sources. Items that technically don't exist.", options: [
        { label: 'Interesting.', next: null },
      ], effects: { reputation: 1 }},
    },
  });

  // --- STORY NPCs (2, is_key_npc=true) ---
  const k1 = pickPlanet(5);
  npcs.push({
    id: npcId(22), name: 'The Oracle', title: 'Seer', race: 'vedic',
    faction_id: 'independent', location_type: 'planet', location_id: k1.planetId, sector_id: k1.sectorId,
    services: ['story'], is_key_npc: true,
    sprite_config: { spriteId: 'npc_vedic' },
    first_encounter: { greeting: 'At the heart of a crystalline cave, a figure floats in a column of light. A Vedic of immense age, eyes blazing with starlight.', description: 'The Oracle is ancient beyond reckoning. Their physical form is barely present — more light than matter.', sceneHint: 'planet_surface' },
    dialogue_tree: {
      root: { text: "At last. The one who walks between factions, between stars. I am The Oracle. I have seen your coming.", options: [
        { label: "You've been expecting me?", next: 'expected' },
        { label: 'What can you see?', next: 'vision' },
        { label: 'I seek the Convergence.', next: 'convergence', requires: { reputation: 20 } },
        { label: 'This is too strange.', next: null },
      ]},
      expected: { text: "Every life creates ripples. Yours create waves. You are approaching a moment that will echo through centuries.", options: [
        { label: 'What moment?', next: 'moment' },
        { label: 'Cryptic but intriguing.', next: null },
      ], effects: { reputation: 1 }},
      moment: { text: "A choice. The Precursors left their greatest work sealed — not because it was dangerous, but because the galaxy was not ready.", options: [
        { label: 'And you think I decide when it is?', next: null },
      ]},
      vision: { text: "I see threads, not certainties. In one, you unite the factions. In another, you shatter them. The choice is not yet made.", options: [
        { label: 'How do I choose right?', next: null },
      ], effects: { reputation: 1 }},
      convergence: { text: "The Convergence. All paths lead there. Scholars, Syndicate, Rangers, Traders. Only one who walks freely between all worlds can reach it.", options: [
        { label: 'What lies at the center?', next: 'center', requires: { reputation: 50 } },
        { label: 'How do I find it?', next: null },
      ], effects: { reputation: 1 }},
      center: { text: "The Heart of the Galaxy — a Precursor device of unimaginable power. It can reshape reality itself. Wield it with wisdom and the galaxy heals. With ambition, it burns.", options: [
        { label: 'Thank you, Oracle.', next: null },
      ], effects: { reputation: 3 }},
    },
  });

  const k2 = pickOutpost(16);
  npcs.push({
    id: npcId(23), name: 'Commander Thane', title: 'Strategic Commander', race: 'kalin',
    faction_id: 'frontier_rangers', location_type: 'outpost', location_id: k2.outpostId, sector_id: k2.sectorId,
    services: ['story', 'missions'], is_key_npc: true,
    sprite_config: { spriteId: 'npc_kalin' },
    first_encounter: { greeting: 'A Kalin in full Ranger battle armor stands before a holographic tactical display, directing fleet movements.', description: 'Commander Thane is imposing even among Kalin. Polished obsidian skin, rank insignia earned in blood.', sceneHint: 'outpost_interior' },
    dialogue_tree: {
      root: { text: "Commander Thane, Rangers Strategic Command. You have a reputation for getting things done.", options: [
        { label: "What's the strategic situation?", next: 'situation' },
        { label: 'Do you have missions?', next: 'missions' },
        { label: "I've heard about the Convergence.", next: 'convergence', requires: { reputation: 20 } },
        { label: 'Just checking in.', next: null },
      ]},
      situation: { text: "The Shadow Syndicate is moving assets outward. The Scholars have gone quiet. Everyone is preparing for something.", options: [
        { label: 'Preparing for what?', next: null },
      ], effects: { reputation: 1 }},
      missions: { text: "Scouting contested sectors, diplomatic escorts, rapid response to Syndicate incursions. All priority assignments.", options: [
        { label: "What's most urgent?", next: null },
      ], effects: { reputation: 1 }},
      convergence: { text: "The Convergence is real. Every faction is racing toward it. The Rangers need to ensure it doesn't fall into the wrong hands.", options: [
        { label: "What's the plan?", next: 'plan', requires: { reputation: 50 } },
        { label: "I'll help.", next: null },
      ], effects: { reputation: 1 }},
      plan: { text: "Operation Horizon. A task force to reach the Convergence before the Syndicate. I need scouts, fighters, and someone I trust. Are you that person?", options: [
        { label: 'You can count on me.', next: null },
      ], effects: { reputation: 3 }},
    },
  });

  // --- ADDITIONAL NPCs (2) ---
  const a1 = pickOutpost(17);
  npcs.push({
    id: npcId(24), name: 'Doc Helix', title: 'Medic', race: 'vedic',
    faction_id: 'independent', location_type: 'outpost', location_id: a1.outpostId, sector_id: a1.sectorId,
    services: ['info'], is_key_npc: false,
    sprite_config: { spriteId: 'npc_vedic' },
    first_encounter: { greeting: 'A Vedic with soft amber crystals tends to a patient, healing light emanating from their hands.', description: 'Doc Helix travels the frontier, offering medical aid to anyone who needs it, regardless of faction.', sceneHint: 'outpost_interior' },
    dialogue_tree: {
      root: { text: "Ah, a healthy one for a change. Are you here for treatment or just company?", options: [
        { label: 'How do you heal people?', next: 'healing' },
        { label: 'Just passing through.', next: null },
      ]},
      healing: { text: "Vedic crystal resonance. I can accelerate cellular repair by harmonizing biological frequencies. It's exhausting but rewarding.", options: [
        { label: 'Can you teach me?', next: 'teach', requires: { reputation: 20 } },
        { label: 'Amazing.', next: null },
      ], effects: { reputation: 1 }},
      teach: { text: "Only Vedic can channel healing light. But I can teach you basic field medicine — enough to patch yourself up between stations.", options: [
        { label: 'That would be valuable.', next: null },
      ], effects: { reputation: 2 }},
    },
  });

  const a2 = pickPlanet(6);
  npcs.push({
    id: npcId(25), name: 'The Hermit', title: 'Wanderer', race: 'muscarian',
    faction_id: 'independent', location_type: 'planet', location_id: a2.planetId, sector_id: a2.sectorId,
    services: ['info', 'story'], is_key_npc: false,
    sprite_config: { spriteId: 'npc_muscarian' },
    first_encounter: { greeting: 'On a desolate world, a lone Muscarian tends a small garden of bioluminescent fungi. They seem unsurprised by your arrival.', description: 'The Hermit chose solitude over the chaos of civilization. Their fungi garden is said to produce visions.', sceneHint: 'planet_surface' },
    dialogue_tree: {
      root: { text: "Another soul drawn to the quiet. Sit. Watch the fungi glow. There's wisdom in silence.", options: [
        { label: 'Why do you live out here?', next: 'why' },
        { label: 'Tell me about the fungi.', next: 'fungi' },
        { label: 'I should go.', next: null },
      ]},
      why: { text: "I was a Syndicate captain once. Saw things that made me question everything. Now I grow mushrooms and think. Better life.", options: [
        { label: 'What did you see?', next: 'past', requires: { reputation: 20 } },
        { label: 'Sounds peaceful.', next: null },
      ], effects: { reputation: 1 }},
      fungi: { text: "These fungi are ancient. Their mycelial network spans the entire planet. Some say they're sentient. I just think they're beautiful.", options: [
        { label: 'Beautiful indeed.', next: null },
      ], effects: { reputation: 1 }},
      past: { text: "A Precursor vault, deep in Syndicate territory. They tried to open it. The energy burst killed half the crew and gave the rest... visions. I saw the galaxy die.", options: [
        { label: 'Die how?', next: 'death', requires: { reputation: 50 } },
        { label: 'Heavy burden.', next: null },
      ], effects: { reputation: 2 }},
      death: { text: "Something from outside. Not from our galaxy. The Precursors didn't transcend — they fled. And what they fled from is waking up. That's why the Convergence matters.", options: [
        { label: 'Thank you for sharing.', next: null },
      ], effects: { reputation: 3 }},
    },
  });

  // 4. Insert all NPCs
  for (const npc of npcs) {
    await knex('npc_definitions').insert({
      id: npc.id,
      name: npc.name,
      title: npc.title,
      race: npc.race,
      faction_id: npc.faction_id,
      location_type: npc.location_type,
      location_id: npc.location_id,
      sector_id: npc.sector_id,
      dialogue_tree: JSON.stringify(npc.dialogue_tree),
      services: JSON.stringify(npc.services),
      first_encounter: JSON.stringify(npc.first_encounter),
      sprite_config: JSON.stringify(npc.sprite_config),
      is_key_npc: npc.is_key_npc,
    });
  }

  console.log(`NPC seeding complete: 5 factions, ${npcs.length} NPCs`);
}
