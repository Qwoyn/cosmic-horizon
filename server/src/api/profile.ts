import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getProfile, getActivityFeed, getMilestoneStatus } from '../engine/profile-stats';

const router = Router();

// Get full player profile
router.get('/', requireAuth, async (req, res) => {
  try {
    const playerId = req.session.playerId!;
    const profile = await getProfile(playerId);
    if (!profile) return res.status(404).json({ error: 'Player not found' });
    res.json(profile);
  } catch (err) {
    console.error('Profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get paginated activity feed
router.get('/activity', requireAuth, async (req, res) => {
  try {
    const playerId = req.session.playerId!;
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const before = req.query.before as string | undefined;
    const activity = await getActivityFeed(playerId, limit, before);
    res.json({ activity });
  } catch (err) {
    console.error('Profile activity error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all milestones with earned status
router.get('/milestones', requireAuth, async (req, res) => {
  try {
    const playerId = req.session.playerId!;
    const milestones = await getMilestoneStatus(playerId);
    res.json({ milestones });
  } catch (err) {
    console.error('Profile milestones error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
