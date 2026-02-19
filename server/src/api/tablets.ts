import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { GAME_CONFIG } from '../config/game';
import {
  getPlayerTablets, getTabletStorage, equipTablet, unequipTablet,
  combineTablets, tradeTablet
} from '../engine/tablets';
import db from '../db/connection';

const router = Router();

// Check if player is at a star mall (reused across endpoints)
async function requireStarMall(playerId: string) {
  const player = await db('players').where({ id: playerId }).first();
  if (!player) return { error: 'Player not found', status: 404, player: null, sector: null };

  const sector = await db('sectors').where({ id: player.current_sector_id }).first();
  if (!sector?.has_star_mall) {
    return { error: 'Must be at a star mall', status: 400, player: null, sector: null };
  }
  return { error: null, status: 0, player, sector };
}

// === LIST PLAYER TABLETS ===

router.get('/', requireAuth, async (req, res) => {
  try {
    const playerId = req.session.playerId!;
    const player = await db('players').where({ id: playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const prog = await db('player_progression').where({ player_id: playerId }).first();
    const level = prog?.level || 1;

    const tablets = await getPlayerTablets(playerId);
    const storageMax = getTabletStorage(level);

    const unlocked: number[] = [];
    for (const [slot, reqLevel] of Object.entries(GAME_CONFIG.TABLET_SLOT_UNLOCK_LEVELS)) {
      if (level >= reqLevel) {
        unlocked.push(Number(slot));
      }
    }

    const equipped = tablets.filter((t: any) => t.equippedSlot != null);
    const inventory = tablets.filter((t: any) => t.equippedSlot == null);

    res.json({
      tablets,
      equipped,
      storage: { used: tablets.length, max: storageMax },
      slots: { unlocked },
      level,
    });
  } catch (err) {
    console.error('List tablets error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// === EQUIP TABLET ===

router.post('/equip', requireAuth, async (req, res) => {
  try {
    const { player, error, status } = await requireStarMall(req.session.playerId!);
    if (error) return res.status(status).json({ error });

    const { tabletId, slot } = req.body;
    try {
      const result = await equipTablet(player!.id, tabletId, slot);
      res.json(result);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  } catch (err) {
    console.error('Equip tablet error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// === UNEQUIP TABLET ===

router.post('/unequip', requireAuth, async (req, res) => {
  try {
    const { player, error, status } = await requireStarMall(req.session.playerId!);
    if (error) return res.status(status).json({ error });

    const { slot } = req.body;
    try {
      const result = await unequipTablet(player!.id, slot);
      res.json(result);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  } catch (err) {
    console.error('Unequip tablet error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// === COMBINE TABLETS ===

router.post('/combine', requireAuth, async (req, res) => {
  try {
    const { player, error, status } = await requireStarMall(req.session.playerId!);
    if (error) return res.status(status).json({ error });

    const { tabletIds } = req.body;
    try {
      const result = await combineTablets(player!.id, tabletIds);
      res.json(result);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  } catch (err) {
    console.error('Combine tablets error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// === COMBINE RECIPES ===

router.get('/recipes', requireAuth, async (req, res) => {
  try {
    const costs = GAME_CONFIG.TABLET_COMBINE_COSTS;
    res.json({
      combineCount: GAME_CONFIG.TABLET_COMBINE_COUNT,
      recipes: [
        { from: 'common', to: 'uncommon', cost: costs.common },
        { from: 'uncommon', to: 'rare', cost: costs.uncommon },
        { from: 'rare', to: 'epic', cost: costs.rare },
        { from: 'epic', to: 'legendary', cost: costs.epic },
        { from: 'legendary', to: 'mythic', cost: costs.legendary },
      ],
    });
  } catch (err) {
    console.error('Tablet recipes error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// === TRADE TABLET ===

router.post('/trade', requireAuth, async (req, res) => {
  try {
    const playerId = req.session.playerId!;
    const player = await db('players').where({ id: playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const { targetPlayerName, tabletId } = req.body;
    const target = await db('players').where({ username: targetPlayerName }).first();
    if (!target) return res.status(404).json({ error: 'Target player not found' });
    if (target.id === playerId) return res.status(400).json({ error: 'Cannot trade with yourself' });

    try {
      const result = await tradeTablet(playerId, target.id, tabletId);
      res.json(result);
    } catch (e: any) {
      return res.status(400).json({ error: e.message });
    }
  } catch (err) {
    console.error('Trade tablet error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
