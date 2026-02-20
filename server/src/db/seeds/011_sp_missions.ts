import { Knex } from 'knex';

function spMissionId(n: number): string {
  return `d0000000-0000-0000-0000-${String(n).padStart(12, '0')}`;
}

// SP mission tier mapping: missions 1-5 = tier 1, 6-10 = tier 2, etc.
function tierForMission(n: number): number {
  if (n <= 5) return 1;
  if (n <= 10) return 2;
  if (n <= 15) return 3;
  return 4;
}

export async function seed(knex: Knex): Promise<void> {
  // Only delete existing SP missions — don't touch MP missions
  await knex('mission_templates').where({ source: 'singleplayer' }).del();

  const missions = [
    // Tier 1 (1-5): Tutorial-adjacent
    {
      id: spMissionId(1),
      title: "Scout's Path",
      description: 'Explore the frontier. Visit 10 different sectors to get your bearings.',
      type: 'visit_sector',
      objectives: JSON.stringify({ sectorsToVisit: 10 }),
      reward_credits: 2000,
      reward_xp: 100,
      tier: 1,
      sort_order: 1,
      hints: JSON.stringify(['Use the "move" command to travel between sectors.']),
    },
    {
      id: spMissionId(2),
      title: 'First Haul',
      description: 'Learn the basics of trade. Buy and sell at least 5 units of cargo at different outposts.',
      type: 'trade_units',
      objectives: JSON.stringify({ unitsToTrade: 5 }),
      reward_credits: 3000,
      reward_xp: 150,
      tier: 1,
      sort_order: 2,
      hints: JSON.stringify(['Dock at outposts to access the trading interface.']),
    },
    {
      id: spMissionId(3),
      title: 'Staking Claim',
      description: 'Claim your first planet. Find an unclaimed world and make it yours.',
      type: 'colonize_planet',
      objectives: JSON.stringify({ colonistsToDeposit: 1 }),
      reward_credits: 5000,
      reward_xp: 200,
      tier: 1,
      sort_order: 3,
      hints: JSON.stringify(['Find an unclaimed planet and use "claim" followed by "colonize".']),
    },
    {
      id: spMissionId(4),
      title: 'Colony Seed',
      description: 'Establish a foothold. Deposit at least 100 colonists on one of your planets.',
      type: 'colonize_planet',
      objectives: JSON.stringify({ colonistsToDeposit: 100 }),
      reward_credits: 5000,
      reward_xp: 250,
      tier: 1,
      sort_order: 4,
      hints: JSON.stringify(['Buy colonists from seed planets and transport them to your colony.']),
    },
    {
      id: spMissionId(5),
      title: 'Mall Rat',
      description: 'Visit the newly unlocked Star Mall! Completing this mission opens your first Star Mall.',
      type: 'visit_sector',
      objectives: JSON.stringify({ sectorsToVisit: 15 }),
      reward_credits: 8000,
      reward_xp: 400,
      tier: 1,
      sort_order: 5,
      hints: JSON.stringify(['Explore widely — completing this unlocks your first Star Mall!']),
    },
    // Tier 2 (6-10): Building up
    {
      id: spMissionId(6),
      title: 'Upgrade Path',
      description: 'Upgrade one of your planets to level 2. Build up your colony resources.',
      type: 'colonize_planet',
      objectives: JSON.stringify({ colonistsToDeposit: 500 }),
      reward_credits: 10000,
      reward_xp: 500,
      tier: 2,
      sort_order: 6,
      prerequisite_mission_id: spMissionId(5),
      hints: JSON.stringify(['Accumulate resources and colonists, then use "upgrade" on your planet.']),
    },
    {
      id: spMissionId(7),
      title: 'Armed & Ready',
      description: 'Install your first ship upgrade at a Star Mall garage.',
      type: 'visit_sector',
      objectives: JSON.stringify({ sectorsToVisit: 25 }),
      reward_credits: 8000,
      reward_xp: 400,
      tier: 2,
      sort_order: 7,
      prerequisite_mission_id: spMissionId(5),
      hints: JSON.stringify(['Visit a Star Mall and use the garage to install upgrades.']),
    },
    {
      id: spMissionId(8),
      title: 'NPC Contact',
      description: 'Establish contact with the frontier inhabitants. Visit 30 sectors to meet the locals.',
      type: 'visit_sector',
      objectives: JSON.stringify({ sectorsToVisit: 30 }),
      reward_credits: 6000,
      reward_xp: 350,
      tier: 2,
      sort_order: 8,
      prerequisite_mission_id: spMissionId(5),
      hints: JSON.stringify(['Talk to NPCs you encounter at outposts and planets.']),
    },
    {
      id: spMissionId(9),
      title: 'Trade Route',
      description: 'Earn your stripes as a trader. Trade at least 200 units of goods.',
      type: 'trade_units',
      objectives: JSON.stringify({ unitsToTrade: 200 }),
      reward_credits: 15000,
      reward_xp: 600,
      tier: 2,
      sort_order: 9,
      prerequisite_mission_id: spMissionId(5),
      hints: JSON.stringify(['Buy low at outposts that sell, sell high where they buy.']),
    },
    {
      id: spMissionId(10),
      title: 'Deep Space',
      description: 'Push into the unknown. Explore 50 unique sectors.',
      type: 'visit_sector',
      objectives: JSON.stringify({ sectorsToVisit: 50 }),
      reward_credits: 12000,
      reward_xp: 700,
      tier: 2,
      sort_order: 10,
      prerequisite_mission_id: spMissionId(5),
      hints: JSON.stringify(['Keep moving — the frontier rewards the bold.']),
    },
    // Tier 3 (11-15): Mid-game
    {
      id: spMissionId(11),
      title: 'Fleet Builder',
      description: 'Expand your fleet. Trade 500 units total to fund your next ship purchase.',
      type: 'trade_units',
      objectives: JSON.stringify({ unitsToTrade: 500 }),
      reward_credits: 25000,
      reward_xp: 900,
      tier: 3,
      sort_order: 11,
      prerequisite_mission_id: spMissionId(10),
      hints: JSON.stringify(['Earn enough credits to buy a second ship from the dealer.']),
    },
    {
      id: spMissionId(12),
      title: 'Mall Network',
      description: 'Your growing influence unlocks a second Star Mall. Explore 100 sectors total.',
      type: 'visit_sector',
      objectives: JSON.stringify({ sectorsToVisit: 100 }),
      reward_credits: 20000,
      reward_xp: 1000,
      tier: 3,
      sort_order: 12,
      prerequisite_mission_id: spMissionId(10),
      hints: JSON.stringify(['Keep exploring — completing this unlocks Star Mall 2!']),
    },
    {
      id: spMissionId(13),
      title: 'Combat Training',
      description: 'Test your weapons. Destroy 3 hostile targets.',
      type: 'destroy_ship',
      objectives: JSON.stringify({ shipsToDestroy: 3 }),
      reward_credits: 20000,
      reward_xp: 1200,
      tier: 3,
      sort_order: 13,
      prerequisite_mission_id: spMissionId(10),
      hints: JSON.stringify(['Engage hostile NPCs or other threats you encounter.']),
    },
    {
      id: spMissionId(14),
      title: 'Resource Empire',
      description: 'Build a colony network. Deposit 2000 colonists across your planets.',
      type: 'colonize_planet',
      objectives: JSON.stringify({ colonistsToDeposit: 2000 }),
      reward_credits: 30000,
      reward_xp: 1500,
      tier: 3,
      sort_order: 14,
      prerequisite_mission_id: spMissionId(10),
      hints: JSON.stringify(['Claim multiple planets and distribute colonists.']),
    },
    {
      id: spMissionId(15),
      title: 'Scanner Expert',
      description: 'Master your sensors. Perform 5 sector scans.',
      type: 'scan_sectors',
      objectives: JSON.stringify({ scansRequired: 5 }),
      reward_credits: 15000,
      reward_xp: 800,
      tier: 3,
      sort_order: 15,
      prerequisite_mission_id: spMissionId(10),
      hints: JSON.stringify(['Use "scan" when your ship has a planetary scanner.']),
    },
    // Tier 4 (16-20): End-game
    {
      id: spMissionId(16),
      title: 'Capital Ship',
      description: 'Accumulate wealth for a capital-class vessel. Trade 1000 units total.',
      type: 'trade_units',
      objectives: JSON.stringify({ unitsToTrade: 1000 }),
      reward_credits: 50000,
      reward_xp: 2000,
      tier: 4,
      sort_order: 16,
      prerequisite_mission_id: spMissionId(12),
      hints: JSON.stringify(['Keep trading to afford a battleship or better.']),
    },
    {
      id: spMissionId(17),
      title: 'Production Master',
      description: 'Build thriving colonies. Deposit 5000 colonists total across your empire.',
      type: 'colonize_planet',
      objectives: JSON.stringify({ colonistsToDeposit: 5000 }),
      reward_credits: 40000,
      reward_xp: 2500,
      tier: 4,
      sort_order: 17,
      prerequisite_mission_id: spMissionId(12),
      hints: JSON.stringify(['Maximize colonist production on seed planets.']),
    },
    {
      id: spMissionId(18),
      title: 'Full Network',
      description: 'Your influence spans the frontier. Explore 200 sectors to unlock the final Star Mall.',
      type: 'visit_sector',
      objectives: JSON.stringify({ sectorsToVisit: 200 }),
      reward_credits: 35000,
      reward_xp: 2000,
      tier: 4,
      sort_order: 18,
      prerequisite_mission_id: spMissionId(12),
      hints: JSON.stringify(['Completing this unlocks Star Mall 3 — the last one!']),
    },
    {
      id: spMissionId(19),
      title: 'Tablet Crafter',
      description: 'Master ancient technology. Perform 10 sector scans to prove your expertise.',
      type: 'scan_sectors',
      objectives: JSON.stringify({ scansRequired: 10 }),
      reward_credits: 30000,
      reward_xp: 1800,
      tier: 4,
      sort_order: 19,
      prerequisite_mission_id: spMissionId(12),
      hints: JSON.stringify(['Craft and equip tablets from resources you gather.']),
    },
    {
      id: spMissionId(20),
      title: 'Frontier Ready',
      description: 'You have conquered the single-player frontier. Explore 300 sectors to prove you are ready for multiplayer.',
      type: 'visit_sector',
      objectives: JSON.stringify({ sectorsToVisit: 300 }),
      reward_credits: 100000,
      reward_xp: 5000,
      tier: 4,
      sort_order: 20,
      prerequisite_mission_id: spMissionId(18),
      hints: JSON.stringify(['Complete this to unlock the option to transition to multiplayer!']),
    },
  ];

  for (const mission of missions) {
    await knex('mission_templates').insert({
      ...mission,
      source: 'singleplayer',
      difficulty: mission.tier,
      repeatable: false,
      time_limit_minutes: null,
      requires_claim_at_mall: false,
      reward_item_id: null,
      prerequisite_mission_id: (mission as any).prerequisite_mission_id || null,
    });
  }

  console.log(`Seeded ${missions.length} single-player mission templates`);
}

/** Assign the first tier of SP missions to a player */
export async function assignInitialSPMissions(playerId: string, knex: Knex): Promise<void> {
  const { buildObjectivesDetail } = require('../../engine/missions');

  const tier1Missions = await knex('mission_templates')
    .where({ source: 'singleplayer' })
    .where('tier', 1)
    .orderBy('sort_order', 'asc');

  for (const template of tier1Missions) {
    const objectives = typeof template.objectives === 'string'
      ? JSON.parse(template.objectives) : template.objectives;
    const hints = typeof template.hints === 'string'
      ? JSON.parse(template.hints) : (template.hints || []);

    const detail = buildObjectivesDetail(template.type, objectives, hints);

    await knex('player_missions').insert({
      id: require('crypto').randomUUID(),
      player_id: playerId,
      template_id: template.id,
      status: 'active',
      progress: JSON.stringify({}),
      objectives_detail: JSON.stringify(detail),
      accepted_at: new Date().toISOString(),
      reward_credits: template.reward_credits,
      claim_status: 'auto',
    });
  }
}
