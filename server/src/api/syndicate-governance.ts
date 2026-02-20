import { Router } from 'express';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth';
import db from '../db/connection';

const router = Router();

// Helper to safely get route param as string
function paramStr(val: string | string[]): string {
  return Array.isArray(val) ? val[0] : val;
}

// Helper: get membership + check permission
async function getMembershipWithPermission(playerId: string, syndicateId: string, requiredPermission?: string) {
  const membership = await db('syndicate_members').where({ player_id: playerId }).first();
  if (!membership || membership.syndicate_id !== syndicateId) {
    return { error: 'Not a member of this syndicate', status: 403 };
  }

  if (membership.role === 'leader') {
    return { membership, hasPermission: true };
  }

  if (!requiredPermission) {
    return { membership, hasPermission: membership.role !== 'member' };
  }

  // Check role permissions
  if (membership.role_id) {
    const perm = await db('syndicate_role_permissions')
      .where({ role_id: membership.role_id, permission: requiredPermission })
      .first();
    if (perm) return { membership, hasPermission: true };
  }

  // Officers have implicit basic permissions
  if (membership.role === 'officer') {
    return { membership, hasPermission: true };
  }

  return { membership, hasPermission: false };
}

// ── Roles ───────────────────────────────────────────────────

// List roles + permissions
router.get('/:id/roles', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const membership = await db('syndicate_members').where({ player_id: player.id }).first();
    if (!membership || membership.syndicate_id !== req.params.id) {
      return res.status(403).json({ error: 'Not a member of this syndicate' });
    }

    const roles = await db('syndicate_roles')
      .where({ syndicate_id: req.params.id })
      .orderBy('priority', 'asc');

    const roleIds = roles.map(r => r.id);
    const permissions = roleIds.length
      ? await db('syndicate_role_permissions').whereIn('role_id', roleIds)
      : [];

    const rolesWithPerms = roles.map(role => ({
      ...role,
      permissions: permissions.filter(p => p.role_id === role.id).map(p => p.permission),
    }));

    res.json({ roles: rolesWithPerms });
  } catch (err) {
    console.error('Get roles error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create custom role (leader only)
router.post('/:id/roles', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const membership = await db('syndicate_members').where({ player_id: player.id }).first();
    if (!membership || membership.role !== 'leader' || membership.syndicate_id !== req.params.id) {
      return res.status(403).json({ error: 'Only the leader can create roles' });
    }

    const { name, permissions = [], priority = 0 } = req.body;
    if (!name) return res.status(400).json({ error: 'Role name required' });

    const roleId = crypto.randomUUID();
    await db('syndicate_roles').insert({
      id: roleId,
      syndicate_id: req.params.id,
      name,
      priority,
      is_preset: false,
    });

    for (const perm of permissions) {
      await db('syndicate_role_permissions').insert({ role_id: roleId, permission: perm });
    }

    res.status(201).json({ id: roleId, name, permissions, priority });
  } catch (err) {
    console.error('Create role error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update role permissions (leader only)
router.put('/:id/roles/:roleId', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const membership = await db('syndicate_members').where({ player_id: player.id }).first();
    if (!membership || membership.role !== 'leader' || membership.syndicate_id !== req.params.id) {
      return res.status(403).json({ error: 'Only the leader can update roles' });
    }

    const role = await db('syndicate_roles').where({ id: req.params.roleId, syndicate_id: req.params.id }).first();
    if (!role) return res.status(404).json({ error: 'Role not found' });

    const { name, permissions, priority } = req.body;
    if (name) await db('syndicate_roles').where({ id: role.id }).update({ name });
    if (priority !== undefined) await db('syndicate_roles').where({ id: role.id }).update({ priority });

    if (permissions) {
      await db('syndicate_role_permissions').where({ role_id: role.id }).del();
      for (const perm of permissions) {
        await db('syndicate_role_permissions').insert({ role_id: role.id, permission: perm });
      }
    }

    res.json({ updated: true });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete custom role (leader only)
router.delete('/:id/roles/:roleId', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const membership = await db('syndicate_members').where({ player_id: player.id }).first();
    if (!membership || membership.role !== 'leader' || membership.syndicate_id !== req.params.id) {
      return res.status(403).json({ error: 'Only the leader can delete roles' });
    }

    const role = await db('syndicate_roles').where({ id: req.params.roleId, syndicate_id: req.params.id }).first();
    if (!role) return res.status(404).json({ error: 'Role not found' });

    // Clear role_id from members using this role
    await db('syndicate_members').where({ role_id: role.id }).update({ role_id: null });
    await db('syndicate_roles').where({ id: role.id }).del();

    res.json({ deleted: true });
  } catch (err) {
    console.error('Delete role error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Assign role to member (leader/admin)
router.post('/:id/members/:playerId/role', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const result = await getMembershipWithPermission(player.id, paramStr(req.params.id), 'manage_roles');
    if (result.error) return res.status(result.status!).json({ error: result.error });
    if (!result.hasPermission) return res.status(403).json({ error: 'Insufficient permissions' });

    const { role_id } = req.body; // null to remove role
    const targetMember = await db('syndicate_members')
      .where({ syndicate_id: req.params.id, player_id: req.params.playerId })
      .first();
    if (!targetMember) return res.status(404).json({ error: 'Member not found' });

    if (role_id) {
      const role = await db('syndicate_roles').where({ id: role_id, syndicate_id: req.params.id }).first();
      if (!role) return res.status(404).json({ error: 'Role not found' });
    }

    await db('syndicate_members')
      .where({ syndicate_id: req.params.id, player_id: req.params.playerId })
      .update({ role_id: role_id || null });

    res.json({ updated: true, playerId: req.params.playerId, role_id: role_id || null });
  } catch (err) {
    console.error('Assign role error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Settings ────────────────────────────────────────────────

// Get syndicate settings
router.get('/:id/settings', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const membership = await db('syndicate_members').where({ player_id: player.id }).first();
    if (!membership || membership.syndicate_id !== req.params.id) {
      return res.status(403).json({ error: 'Not a member of this syndicate' });
    }

    const settings = await db('syndicate_settings').where({ syndicate_id: req.params.id }).first();
    res.json({ settings: settings || null });
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update settings (leader only)
router.put('/:id/settings', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const membership = await db('syndicate_members').where({ player_id: player.id }).first();
    if (!membership || membership.role !== 'leader' || membership.syndicate_id !== req.params.id) {
      return res.status(403).json({ error: 'Only the leader can update settings' });
    }

    const allowed = ['recruitment_mode', 'min_level', 'quorum_percent', 'vote_duration_hours', 'succession_rule', 'treasury_withdrawal_limit', 'motto', 'description'];
    const updates: any = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    await db('syndicate_settings').where({ syndicate_id: req.params.id }).update(updates);
    const settings = await db('syndicate_settings').where({ syndicate_id: req.params.id }).first();
    res.json({ settings });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Votes ───────────────────────────────────────────────────

// Propose a vote
router.post('/:id/votes', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const result = await getMembershipWithPermission(player.id, paramStr(req.params.id), 'start_vote');
    if (result.error) return res.status(result.status!).json({ error: result.error });
    if (!result.hasPermission) return res.status(403).json({ error: 'Insufficient permissions to start a vote' });

    const { type, description, target_data = {} } = req.body;
    if (!type || !description) return res.status(400).json({ error: 'Type and description required' });

    const validTypes = ['alliance', 'treasury_withdraw', 'disband', 'project', 'charter_amendment'];
    if (!validTypes.includes(type)) return res.status(400).json({ error: 'Invalid vote type' });

    const settings = await db('syndicate_settings').where({ syndicate_id: req.params.id }).first();
    const quorum = settings?.quorum_percent || 60;
    const durationHours = settings?.vote_duration_hours || 48;
    const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();

    const voteId = crypto.randomUUID();
    await db('syndicate_votes').insert({
      id: voteId,
      syndicate_id: req.params.id,
      type,
      description,
      proposed_by: player.id,
      target_data: JSON.stringify(target_data),
      quorum_percent: quorum,
      expires_at: expiresAt,
    });

    res.status(201).json({ id: voteId, type, description, quorum_percent: quorum, expires_at: expiresAt });
  } catch (err) {
    console.error('Propose vote error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List votes (active + recent)
router.get('/:id/votes', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const membership = await db('syndicate_members').where({ player_id: player.id }).first();
    if (!membership || membership.syndicate_id !== req.params.id) {
      return res.status(403).json({ error: 'Not a member of this syndicate' });
    }

    const votes = await db('syndicate_votes')
      .where({ syndicate_id: req.params.id })
      .join('players', 'syndicate_votes.proposed_by', 'players.id')
      .select(
        'syndicate_votes.id',
        'syndicate_votes.type',
        'syndicate_votes.description',
        'syndicate_votes.status',
        'syndicate_votes.quorum_percent',
        'syndicate_votes.expires_at',
        'syndicate_votes.created_at',
        'players.username as proposedBy'
      )
      .orderBy('syndicate_votes.created_at', 'desc')
      .limit(50);

    // Get ballot counts for each vote
    const voteIds = votes.map(v => v.id);
    const ballots = voteIds.length
      ? await db('syndicate_vote_ballots').whereIn('vote_id', voteIds)
      : [];

    const votesWithCounts = votes.map(vote => {
      const voteBallots = ballots.filter(b => b.vote_id === vote.id);
      return {
        ...vote,
        yes: voteBallots.filter(b => b.choice === 'yes').length,
        no: voteBallots.filter(b => b.choice === 'no').length,
        abstain: voteBallots.filter(b => b.choice === 'abstain').length,
        totalVotes: voteBallots.length,
      };
    });

    res.json({ votes: votesWithCounts });
  } catch (err) {
    console.error('List votes error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Vote detail with ballots
router.get('/:id/votes/:voteId', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const membership = await db('syndicate_members').where({ player_id: player.id }).first();
    if (!membership || membership.syndicate_id !== req.params.id) {
      return res.status(403).json({ error: 'Not a member of this syndicate' });
    }

    const vote = await db('syndicate_votes')
      .where({ id: req.params.voteId, syndicate_id: req.params.id })
      .join('players', 'syndicate_votes.proposed_by', 'players.id')
      .select(
        'syndicate_votes.*',
        'players.username as proposedBy'
      )
      .first();
    if (!vote) return res.status(404).json({ error: 'Vote not found' });

    const ballots = await db('syndicate_vote_ballots')
      .where({ vote_id: vote.id })
      .join('players', 'syndicate_vote_ballots.player_id', 'players.id')
      .select('players.username', 'syndicate_vote_ballots.choice', 'syndicate_vote_ballots.cast_at');

    const myBallot = await db('syndicate_vote_ballots')
      .where({ vote_id: vote.id, player_id: player.id })
      .first();

    res.json({
      vote: {
        ...vote,
        target_data: typeof vote.target_data === 'string' ? JSON.parse(vote.target_data) : vote.target_data,
      },
      ballots,
      myVote: myBallot?.choice || null,
      yes: ballots.filter(b => b.choice === 'yes').length,
      no: ballots.filter(b => b.choice === 'no').length,
      abstain: ballots.filter(b => b.choice === 'abstain').length,
    });
  } catch (err) {
    console.error('Vote detail error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cast ballot
router.post('/:id/votes/:voteId/cast', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const membership = await db('syndicate_members').where({ player_id: player.id }).first();
    if (!membership || membership.syndicate_id !== req.params.id) {
      return res.status(403).json({ error: 'Not a member of this syndicate' });
    }

    const { choice } = req.body;
    if (!['yes', 'no', 'abstain'].includes(choice)) {
      return res.status(400).json({ error: 'Choice must be yes, no, or abstain' });
    }

    const vote = await db('syndicate_votes')
      .where({ id: req.params.voteId, syndicate_id: req.params.id, status: 'active' })
      .first();
    if (!vote) return res.status(404).json({ error: 'Active vote not found' });

    // Check if expired
    if (new Date(vote.expires_at) < new Date()) {
      await db('syndicate_votes').where({ id: vote.id }).update({ status: 'expired' });
      return res.status(400).json({ error: 'Vote has expired' });
    }

    // Check if already voted
    const existing = await db('syndicate_vote_ballots')
      .where({ vote_id: vote.id, player_id: player.id }).first();
    if (existing) {
      // Update existing ballot
      await db('syndicate_vote_ballots')
        .where({ vote_id: vote.id, player_id: player.id })
        .update({ choice, cast_at: new Date().toISOString() });
    } else {
      await db('syndicate_vote_ballots').insert({
        vote_id: vote.id,
        player_id: player.id,
        choice,
      });
    }

    // Check if quorum reached → resolve
    const memberCount = await db('syndicate_members')
      .where({ syndicate_id: req.params.id })
      .count('* as count')
      .first();
    const totalMembers = Number(memberCount?.count || 0);
    const ballotCount = await db('syndicate_vote_ballots')
      .where({ vote_id: vote.id })
      .count('* as count')
      .first();
    const totalBallots = Number(ballotCount?.count || 0);

    const quorumNeeded = Math.ceil(totalMembers * (vote.quorum_percent / 100));
    if (totalBallots >= quorumNeeded) {
      const yesCount = await db('syndicate_vote_ballots')
        .where({ vote_id: vote.id, choice: 'yes' })
        .count('* as count')
        .first();
      const noCount = await db('syndicate_vote_ballots')
        .where({ vote_id: vote.id, choice: 'no' })
        .count('* as count')
        .first();

      const yes = Number(yesCount?.count || 0);
      const no = Number(noCount?.count || 0);
      const newStatus = yes > no ? 'passed' : 'failed';

      await db('syndicate_votes').where({ id: vote.id }).update({ status: newStatus });
      res.json({ cast: choice, resolved: true, result: newStatus });
    } else {
      res.json({ cast: choice, resolved: false });
    }
  } catch (err) {
    console.error('Cast vote error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── Kick (governance-aware) ─────────────────────────────────

router.post('/:id/kick', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const result = await getMembershipWithPermission(player.id, paramStr(req.params.id), 'kick');
    if (result.error) return res.status(result.status!).json({ error: result.error });
    if (!result.hasPermission) return res.status(403).json({ error: 'Insufficient permissions' });

    const { player_id: targetId } = req.body;
    if (!targetId) return res.status(400).json({ error: 'Target player_id required' });

    const targetMember = await db('syndicate_members')
      .where({ syndicate_id: req.params.id, player_id: targetId })
      .first();
    if (!targetMember) return res.status(404).json({ error: 'Player not in syndicate' });
    if (targetMember.role === 'leader') return res.status(400).json({ error: 'Cannot kick the leader' });

    // Officers can only kick members, not other officers
    if (result.membership!.role !== 'leader' && targetMember.role === 'officer') {
      return res.status(403).json({ error: 'Only the leader can kick officers' });
    }

    await db('syndicate_members')
      .where({ syndicate_id: req.params.id, player_id: targetId })
      .del();

    res.json({ kicked: targetId });
  } catch (err) {
    console.error('Governance kick error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
