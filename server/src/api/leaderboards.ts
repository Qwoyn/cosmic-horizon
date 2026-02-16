import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { GAME_CONFIG } from '../config/game';
import db from '../db/connection';

const router = Router();

// Get overview - top 5 per category
router.get('/', requireAuth, async (req, res) => {
  try {
    const categories = GAME_CONFIG.LEADERBOARD_CATEGORIES;
    const overview: Record<string, any[]> = {};

    for (const category of categories) {
      const entries = await db('leaderboard_cache')
        .where({ category })
        .orderBy('rank', 'asc')
        .limit(5)
        .select('rank', 'player_name', 'score');

      overview[category] = entries;
    }

    res.json({ leaderboards: overview });
  } catch (err) {
    console.error('Leaderboard overview error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get top 20 for a specific category
router.get('/:category', requireAuth, async (req, res) => {
  try {
    const category = req.params.category;
    if (!GAME_CONFIG.LEADERBOARD_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const entries = await db('leaderboard_cache')
      .where({ category })
      .orderBy('rank', 'asc')
      .limit(GAME_CONFIG.LEADERBOARD_TOP_N)
      .select('rank', 'player_id', 'player_name', 'score', 'updated_at');

    res.json({ category, entries });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
