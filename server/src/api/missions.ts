import { Router } from 'express';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth';
import { GAME_CONFIG } from '../config/game';
import { generateMissionPool, isMissionExpired } from '../engine/missions';
import db from '../db/connection';

const router = Router();

// Get available missions (mission pool at current Star Mall)
router.get('/available', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const sector = await db('sectors').where({ id: player.current_sector_id }).first();
    if (!sector?.has_star_mall) {
      return res.status(400).json({ error: 'Must be at a star mall to view mission board' });
    }

    const pool = await generateMissionPool(player.current_sector_id);
    res.json({ missions: pool });
  } catch (err) {
    console.error('Mission pool error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Accept a mission
router.post('/accept/:templateId', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    // Check active mission count
    const activeCount = await db('player_missions')
      .where({ player_id: player.id, status: 'active' })
      .count('* as count')
      .first();

    if (Number(activeCount?.count || 0) >= GAME_CONFIG.MAX_ACTIVE_MISSIONS) {
      return res.status(400).json({ error: `Maximum ${GAME_CONFIG.MAX_ACTIVE_MISSIONS} active missions` });
    }

    const template = await db('mission_templates').where({ id: req.params.templateId }).first();
    if (!template) return res.status(404).json({ error: 'Mission template not found' });

    // Check if non-repeatable mission already completed
    if (!template.repeatable) {
      const existing = await db('player_missions')
        .where({ player_id: player.id, template_id: template.id })
        .whereIn('status', ['active', 'completed'])
        .first();
      if (existing) {
        return res.status(400).json({ error: 'Mission already accepted or completed' });
      }
    }

    const now = new Date();
    const expiresAt = template.time_limit_minutes
      ? new Date(now.getTime() + template.time_limit_minutes * 60000).toISOString()
      : null;

    const missionId = crypto.randomUUID();
    await db('player_missions').insert({
      id: missionId,
      player_id: player.id,
      template_id: template.id,
      status: 'active',
      progress: JSON.stringify({}),
      reward_credits: template.reward_credits,
      reward_item_id: template.reward_item_id,
      accepted_at: now.toISOString(),
      expires_at: expiresAt,
    });

    res.json({
      missionId,
      title: template.title,
      description: template.description,
      type: template.type,
      objectives: typeof template.objectives === 'string' ? JSON.parse(template.objectives) : template.objectives,
      rewardCredits: template.reward_credits,
      expiresAt,
    });
  } catch (err) {
    console.error('Accept mission error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List active missions
router.get('/active', requireAuth, async (req, res) => {
  try {
    const missions = await db('player_missions')
      .join('mission_templates', 'player_missions.template_id', 'mission_templates.id')
      .where({ 'player_missions.player_id': req.session.playerId, 'player_missions.status': 'active' })
      .select(
        'player_missions.id as missionId',
        'mission_templates.title',
        'mission_templates.description',
        'mission_templates.type',
        'mission_templates.objectives as templateObjectives',
        'player_missions.progress',
        'player_missions.reward_credits as rewardCredits',
        'player_missions.accepted_at as acceptedAt',
        'player_missions.expires_at as expiresAt'
      );

    res.json({
      missions: missions.map(m => ({
        ...m,
        templateObjectives: typeof m.templateObjectives === 'string' ? JSON.parse(m.templateObjectives) : m.templateObjectives,
        progress: typeof m.progress === 'string' ? JSON.parse(m.progress) : m.progress,
      })),
    });
  } catch (err) {
    console.error('Active missions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// List completed missions
router.get('/completed', requireAuth, async (req, res) => {
  try {
    const missions = await db('player_missions')
      .join('mission_templates', 'player_missions.template_id', 'mission_templates.id')
      .where({ 'player_missions.player_id': req.session.playerId, 'player_missions.status': 'completed' })
      .orderBy('player_missions.completed_at', 'desc')
      .limit(20)
      .select(
        'player_missions.id as missionId',
        'mission_templates.title',
        'player_missions.reward_credits as rewardCredits',
        'player_missions.completed_at as completedAt'
      );

    res.json({ missions });
  } catch (err) {
    console.error('Completed missions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Abandon a mission
router.post('/abandon/:missionId', requireAuth, async (req, res) => {
  try {
    const mission = await db('player_missions')
      .where({ id: req.params.missionId, player_id: req.session.playerId, status: 'active' })
      .first();

    if (!mission) return res.status(404).json({ error: 'Active mission not found' });

    await db('player_missions').where({ id: mission.id }).update({ status: 'abandoned' });
    res.json({ abandoned: mission.id });
  } catch (err) {
    console.error('Abandon mission error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
