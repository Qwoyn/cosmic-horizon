import { Router } from 'express';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth';
import db from '../db/connection';

const router = Router();

// Form or cancel alliance
router.post('/alliance/:playerId', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const targetId = req.params.playerId;
    if (targetId === player.id) return res.status(400).json({ error: 'Cannot ally with yourself' });

    const target = await db('players').where({ id: targetId }).first();
    if (!target) return res.status(404).json({ error: 'Target player not found' });

    // Check existing alliance (schema uses player_a_id / player_b_id)
    const existing = await db('alliances')
      .where(function() {
        this.where({ player_a_id: player.id, player_b_id: targetId })
          .orWhere({ player_a_id: targetId, player_b_id: player.id });
      })
      .first();

    if (existing) {
      await db('alliances').where({ id: existing.id }).del();
      return res.json({ action: 'cancelled', allyId: targetId });
    }

    await db('alliances').insert({
      id: crypto.randomUUID(),
      player_a_id: player.id,
      player_b_id: targetId,
    });

    res.json({ action: 'formed', allyId: targetId });
  } catch (err) {
    console.error('Alliance error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create syndicate
router.post('/syndicate/create', requireAuth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });

    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const existingMembership = await db('syndicate_members').where({ player_id: player.id }).first();
    if (existingMembership) return res.status(400).json({ error: 'Already in a syndicate' });

    const syndicateId = crypto.randomUUID();
    await db('syndicates').insert({
      id: syndicateId,
      name,
      leader_id: player.id,
    });

    // syndicate_members uses composite PK (syndicate_id, player_id), no id column
    await db('syndicate_members').insert({
      syndicate_id: syndicateId,
      player_id: player.id,
      role: 'leader',
    });

    res.status(201).json({ syndicateId, name });
  } catch (err: any) {
    if (err.message?.includes('UNIQUE constraint failed') || err.constraint) {
      return res.status(409).json({ error: 'Syndicate name already taken' });
    }
    console.error('Syndicate create error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Invite to syndicate
router.post('/syndicate/invite/:playerId', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const membership = await db('syndicate_members').where({ player_id: player.id }).first();
    if (!membership || membership.role === 'member') {
      return res.status(403).json({ error: 'Only leaders and officers can invite' });
    }

    const targetId = req.params.playerId;
    const target = await db('players').where({ id: targetId }).first();
    if (!target) return res.status(404).json({ error: 'Target player not found' });

    const existingMembership = await db('syndicate_members').where({ player_id: targetId }).first();
    if (existingMembership) return res.status(400).json({ error: 'Player is already in a syndicate' });

    await db('syndicate_members').insert({
      syndicate_id: membership.syndicate_id,
      player_id: targetId,
      role: 'member',
    });

    res.json({ invited: targetId, syndicateId: membership.syndicate_id });
  } catch (err) {
    console.error('Syndicate invite error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Syndicate info
router.get('/syndicate', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const membership = await db('syndicate_members').where({ player_id: player.id }).first();
    if (!membership) return res.status(404).json({ error: 'Not in a syndicate' });

    const syndicate = await db('syndicates').where({ id: membership.syndicate_id }).first();
    const members = await db('syndicate_members')
      .join('players', 'syndicate_members.player_id', 'players.id')
      .where({ syndicate_id: membership.syndicate_id })
      .select('players.id', 'players.username', 'syndicate_members.role');

    res.json({
      id: syndicate.id,
      name: syndicate.name,
      leaderId: syndicate.leader_id,
      treasury: syndicate.treasury,
      members,
    });
  } catch (err) {
    console.error('Syndicate info error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Promote member to officer (leader only)
router.post('/syndicate/promote/:playerId', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const membership = await db('syndicate_members').where({ player_id: player.id }).first();
    if (!membership || membership.role !== 'leader') {
      return res.status(403).json({ error: 'Only the leader can promote members' });
    }

    const targetId = req.params.playerId as string;
    const targetMembership = await db('syndicate_members')
      .where({ syndicate_id: membership.syndicate_id, player_id: targetId })
      .first();
    if (!targetMembership) return res.status(404).json({ error: 'Player not in your syndicate' });
    if (targetMembership.role === 'leader') return res.status(400).json({ error: 'Cannot promote the leader' });

    const newRole = targetMembership.role === 'member' ? 'officer' : 'member';
    await db('syndicate_members')
      .where({ syndicate_id: membership.syndicate_id, player_id: targetId })
      .update({ role: newRole });

    res.json({ playerId: targetId, newRole });
  } catch (err) {
    console.error('Syndicate promote error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Kick member (leader or officer can kick members, leader can kick officers)
router.post('/syndicate/kick/:playerId', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const membership = await db('syndicate_members').where({ player_id: player.id }).first();
    if (!membership || membership.role === 'member') {
      return res.status(403).json({ error: 'Only leaders and officers can kick members' });
    }

    const targetId = req.params.playerId as string;
    const targetMembership = await db('syndicate_members')
      .where({ syndicate_id: membership.syndicate_id, player_id: targetId })
      .first();
    if (!targetMembership) return res.status(404).json({ error: 'Player not in your syndicate' });
    if (targetMembership.role === 'leader') return res.status(400).json({ error: 'Cannot kick the leader' });
    if (targetMembership.role === 'officer' && membership.role !== 'leader') {
      return res.status(403).json({ error: 'Only the leader can kick officers' });
    }

    await db('syndicate_members')
      .where({ syndicate_id: membership.syndicate_id, player_id: targetId })
      .del();

    res.json({ kicked: targetId });
  } catch (err) {
    console.error('Syndicate kick error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leave syndicate
router.post('/syndicate/leave', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const membership = await db('syndicate_members').where({ player_id: player.id }).first();
    if (!membership) return res.status(404).json({ error: 'Not in a syndicate' });
    if (membership.role === 'leader') {
      return res.status(400).json({ error: 'Leader must disband or transfer leadership first' });
    }

    await db('syndicate_members')
      .where({ syndicate_id: membership.syndicate_id, player_id: player.id })
      .del();

    res.json({ left: membership.syndicate_id });
  } catch (err) {
    console.error('Syndicate leave error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Disband syndicate (leader only)
router.post('/syndicate/disband', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const membership = await db('syndicate_members').where({ player_id: player.id }).first();
    if (!membership || membership.role !== 'leader') {
      return res.status(403).json({ error: 'Only the leader can disband' });
    }

    const syndicate = await db('syndicates').where({ id: membership.syndicate_id }).first();

    // Return treasury to leader
    if (syndicate && Number(syndicate.treasury) > 0) {
      await db('players').where({ id: player.id }).update({
        credits: Number(player.credits) + Number(syndicate.treasury),
      });
    }

    // Remove all members and syndicate alliances
    await db('syndicate_members').where({ syndicate_id: membership.syndicate_id }).del();
    await db('alliances')
      .where({ syndicate_a_id: membership.syndicate_id })
      .orWhere({ syndicate_b_id: membership.syndicate_id })
      .del();
    await db('syndicates').where({ id: membership.syndicate_id }).del();

    res.json({ disbanded: membership.syndicate_id, treasuryReturned: Number(syndicate?.treasury ?? 0) });
  } catch (err) {
    console.error('Syndicate disband error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Transfer leadership
router.post('/syndicate/transfer/:playerId', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const membership = await db('syndicate_members').where({ player_id: player.id }).first();
    if (!membership || membership.role !== 'leader') {
      return res.status(403).json({ error: 'Only the leader can transfer leadership' });
    }

    const targetId = req.params.playerId as string;
    const targetMembership = await db('syndicate_members')
      .where({ syndicate_id: membership.syndicate_id, player_id: targetId })
      .first();
    if (!targetMembership) return res.status(404).json({ error: 'Player not in your syndicate' });

    await db('syndicate_members')
      .where({ syndicate_id: membership.syndicate_id, player_id: targetId })
      .update({ role: 'leader' });
    await db('syndicate_members')
      .where({ syndicate_id: membership.syndicate_id, player_id: player.id })
      .update({ role: 'officer' });
    await db('syndicates')
      .where({ id: membership.syndicate_id })
      .update({ leader_id: targetId });

    res.json({ newLeader: targetId });
  } catch (err) {
    console.error('Syndicate transfer error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Deposit credits to syndicate treasury
router.post('/syndicate/deposit', requireAuth, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount < 1) return res.status(400).json({ error: 'Invalid amount' });

    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const membership = await db('syndicate_members').where({ player_id: player.id }).first();
    if (!membership) return res.status(404).json({ error: 'Not in a syndicate' });

    if (Number(player.credits) < amount) {
      return res.status(400).json({ error: 'Not enough credits' });
    }

    await db('players').where({ id: player.id }).update({
      credits: Number(player.credits) - amount,
    });
    await db('syndicates').where({ id: membership.syndicate_id }).increment('treasury', amount);

    const syndicate = await db('syndicates').where({ id: membership.syndicate_id }).first();

    res.json({
      deposited: amount,
      newCredits: Number(player.credits) - amount,
      syndicateTreasury: Number(syndicate.treasury),
    });
  } catch (err) {
    console.error('Syndicate deposit error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Withdraw from syndicate treasury (leader only)
router.post('/syndicate/withdraw', requireAuth, async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount < 1) return res.status(400).json({ error: 'Invalid amount' });

    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const membership = await db('syndicate_members').where({ player_id: player.id }).first();
    if (!membership || membership.role !== 'leader') {
      return res.status(403).json({ error: 'Only the leader can withdraw from treasury' });
    }

    const syndicate = await db('syndicates').where({ id: membership.syndicate_id }).first();
    if (Number(syndicate.treasury) < amount) {
      return res.status(400).json({ error: 'Insufficient treasury funds' });
    }

    await db('syndicates').where({ id: membership.syndicate_id }).decrement('treasury', amount);
    await db('players').where({ id: player.id }).update({
      credits: Number(player.credits) + amount,
    });

    res.json({
      withdrawn: amount,
      newCredits: Number(player.credits) + amount,
      syndicateTreasury: Number(syndicate.treasury) - amount,
    });
  } catch (err) {
    console.error('Syndicate withdraw error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update syndicate charter
router.post('/syndicate/charter', requireAuth, async (req, res) => {
  try {
    const { charter } = req.body;
    if (!charter) return res.status(400).json({ error: 'Charter text required' });

    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const membership = await db('syndicate_members').where({ player_id: player.id }).first();
    if (!membership || membership.role === 'member') {
      return res.status(403).json({ error: 'Only leaders and officers can update the charter' });
    }

    await db('syndicates').where({ id: membership.syndicate_id }).update({ charter });

    res.json({ updated: true });
  } catch (err) {
    console.error('Syndicate charter error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Form syndicate-to-syndicate alliance
router.post('/syndicate/alliance/:syndicateId', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const membership = await db('syndicate_members').where({ player_id: player.id }).first();
    if (!membership || membership.role === 'member') {
      return res.status(403).json({ error: 'Only leaders and officers can form syndicate alliances' });
    }

    const targetSyndicateId = req.params.syndicateId as string;
    if (targetSyndicateId === membership.syndicate_id) {
      return res.status(400).json({ error: 'Cannot ally with your own syndicate' });
    }

    const targetSyndicate = await db('syndicates').where({ id: targetSyndicateId }).first();
    if (!targetSyndicate) return res.status(404).json({ error: 'Syndicate not found' });

    // Check existing syndicate alliance
    const existing = await db('alliances')
      .where(function() {
        this.where({ syndicate_a_id: membership.syndicate_id, syndicate_b_id: targetSyndicateId })
          .orWhere({ syndicate_a_id: targetSyndicateId, syndicate_b_id: membership.syndicate_id });
      })
      .first();

    if (existing) {
      await db('alliances').where({ id: existing.id }).del();
      return res.json({ action: 'cancelled', targetSyndicate: targetSyndicate.name });
    }

    await db('alliances').insert({
      id: crypto.randomUUID(),
      syndicate_a_id: membership.syndicate_id,
      syndicate_b_id: targetSyndicateId,
    });

    res.json({ action: 'formed', targetSyndicate: targetSyndicate.name });
  } catch (err) {
    console.error('Syndicate alliance error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Share planet with syndicate
router.post('/syndicate/share-planet/:planetId', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const membership = await db('syndicate_members').where({ player_id: player.id }).first();
    if (!membership) return res.status(404).json({ error: 'Not in a syndicate' });

    const planetId = req.params.planetId as string;
    const planet = await db('planets').where({ id: planetId }).first();
    if (!planet) return res.status(404).json({ error: 'Planet not found' });
    if (planet.owner_id !== player.id) {
      return res.status(403).json({ error: 'You do not own this planet' });
    }

    // Toggle shared status by setting syndicate_id on the planet
    // If already shared, unshare; if not shared, share
    if (planet.syndicate_id === membership.syndicate_id) {
      await db('planets').where({ id: planetId }).update({ syndicate_id: null });
      return res.json({ shared: false, planetId });
    }

    await db('planets').where({ id: planetId }).update({ syndicate_id: membership.syndicate_id });
    res.json({ shared: true, planetId, syndicateId: membership.syndicate_id });
  } catch (err) {
    console.error('Share planet error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// View syndicate's shared planets
router.get('/syndicate/planets', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const membership = await db('syndicate_members').where({ player_id: player.id }).first();
    if (!membership) return res.status(404).json({ error: 'Not in a syndicate' });

    const planets = await db('planets')
      .where({ syndicate_id: membership.syndicate_id })
      .join('players', 'planets.owner_id', 'players.id')
      .select(
        'planets.id',
        'planets.name',
        'planets.planet_class as planetClass',
        'planets.sector_id as sectorId',
        'planets.colonists',
        'planets.upgrade_level as upgradeLevel',
        'players.username as ownerName',
      );

    res.json({ planets });
  } catch (err) {
    console.error('Syndicate planets error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Place bounty
router.post('/bounty', requireAuth, async (req, res) => {
  try {
    const { targetPlayerId, amount } = req.body;
    if (!targetPlayerId || !amount || amount < 100) {
      return res.status(400).json({ error: 'Target and amount (min 100) required' });
    }

    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    if (Number(player.credits) < amount) {
      return res.status(400).json({ error: 'Not enough credits' });
    }

    const target = await db('players').where({ id: targetPlayerId }).first();
    if (!target) return res.status(404).json({ error: 'Target player not found' });

    await db('players').where({ id: player.id }).update({
      credits: Number(player.credits) - amount,
    });

    // Schema uses placed_by_id, target_player_id, reward
    await db('bounties').insert({
      id: crypto.randomUUID(),
      placed_by_id: player.id,
      target_player_id: targetPlayerId,
      reward: amount,
    });

    res.json({ targetId: targetPlayerId, amount, newCredits: Number(player.credits) - amount });
  } catch (err) {
    console.error('Bounty error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// View active bounties
router.get('/bounties', requireAuth, async (req, res) => {
  try {
    const bounties = await db('bounties')
      .where({ active: true })
      .join('players as target', 'bounties.target_player_id', 'target.id')
      .join('players as placer', 'bounties.placed_by_id', 'placer.id')
      .select(
        'bounties.id',
        'bounties.reward as amount',
        'target.username as targetUsername',
        'target.id as targetId',
        'placer.username as placedByUsername',
        'bounties.created_at'
      )
      .orderBy('bounties.reward', 'desc');

    res.json({ bounties });
  } catch (err) {
    console.error('Bounties error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// View bounty history (claimed bounties)
router.get('/bounties/history', requireAuth, async (req, res) => {
  try {
    const bounties = await db('bounties')
      .where({ active: false })
      .join('players as target', 'bounties.target_player_id', 'target.id')
      .join('players as placer', 'bounties.placed_by_id', 'placer.id')
      .leftJoin('players as claimer', 'bounties.claimed_by_id', 'claimer.id')
      .select(
        'bounties.id',
        'bounties.reward as amount',
        'target.username as targetUsername',
        'placer.username as placedByUsername',
        'claimer.username as claimedByUsername',
        'bounties.created_at as placedAt',
        'bounties.claimed_at as claimedAt',
      )
      .orderBy('bounties.claimed_at', 'desc')
      .limit(50);

    res.json({ bounties });
  } catch (err) {
    console.error('Bounty history error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// View bounties I've claimed
router.get('/bounties/claimed', requireAuth, async (req, res) => {
  try {
    const bounties = await db('bounties')
      .where({ claimed_by_id: req.session.playerId })
      .join('players as target', 'bounties.target_player_id', 'target.id')
      .select(
        'bounties.id',
        'bounties.reward as amount',
        'target.username as targetUsername',
        'bounties.claimed_at as claimedAt',
      )
      .orderBy('bounties.claimed_at', 'desc');

    res.json({ bounties });
  } catch (err) {
    console.error('Claimed bounties error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// View bounties on me
router.get('/bounties/on-me', requireAuth, async (req, res) => {
  try {
    const bounties = await db('bounties')
      .where({ target_player_id: req.session.playerId, active: true })
      .join('players as placer', 'bounties.placed_by_id', 'placer.id')
      .select(
        'bounties.id',
        'bounties.reward as amount',
        'placer.username as placedByUsername',
        'bounties.created_at as placedAt',
      )
      .orderBy('bounties.reward', 'desc');

    const totalBounty = bounties.reduce((sum, b) => sum + Number(b.amount), 0);
    res.json({ bounties, totalBounty });
  } catch (err) {
    console.error('Bounties on me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// View combat log
router.get('/combat-log', requireAuth, async (req, res) => {
  try {
    const logs = await db('combat_logs')
      .where(function() {
        this.where({ attacker_id: req.session.playerId })
          .orWhere({ defender_id: req.session.playerId });
      })
      .join('players as attacker', 'combat_logs.attacker_id', 'attacker.id')
      .join('players as defender', 'combat_logs.defender_id', 'defender.id')
      .select(
        'combat_logs.id',
        'attacker.username as attackerName',
        'defender.username as defenderName',
        'combat_logs.sector_id as sectorId',
        'combat_logs.energy_expended as energyExpended',
        'combat_logs.damage_dealt as damageDealt',
        'combat_logs.outcome',
        'combat_logs.created_at as timestamp',
      )
      .orderBy('combat_logs.created_at', 'desc')
      .limit(50);

    res.json({ logs });
  } catch (err) {
    console.error('Combat log error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
