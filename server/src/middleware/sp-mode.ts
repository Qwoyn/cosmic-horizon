import { Request, Response, NextFunction } from 'express';
import db from '../db/connection';
import { processOnDemandTick } from '../engine/sp-tick';

// Extend Express Request with SP context
declare global {
  namespace Express {
    interface Request {
      isSinglePlayer?: boolean;
      spSectorOffset?: number;
    }
  }
}

/**
 * Loads single-player context for the authenticated player.
 * If the player is in SP mode, triggers an on-demand tick to catch up economy.
 */
export async function loadSPContext(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const playerId = req.session?.playerId;
    if (!playerId) {
      req.isSinglePlayer = false;
      next();
      return;
    }

    const player = await db('players')
      .where({ id: playerId })
      .select('game_mode', 'sp_sector_offset')
      .first();

    if (player && player.game_mode === 'singleplayer') {
      req.isSinglePlayer = true;
      req.spSectorOffset = player.sp_sector_offset;

      // Process on-demand tick to catch up economy
      await processOnDemandTick(playerId);
    } else {
      req.isSinglePlayer = false;
    }

    next();
  } catch (err) {
    console.error('SP context error:', err);
    req.isSinglePlayer = false;
    next();
  }
}

/**
 * Blocks social features in single-player mode.
 * Returns 400 for chat, syndicate, leaderboard, message, and social endpoints.
 */
export function blockInSinglePlayer(req: Request, res: Response, next: NextFunction): void {
  if (req.isSinglePlayer) {
    res.status(400).json({ error: 'Not available in single player mode' });
    return;
  }
  next();
}
