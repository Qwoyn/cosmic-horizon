import { Request, Response, NextFunction } from 'express';
import { TutorialVirtualState } from '../config/tutorial-sandbox';
import { verifyJwt } from './jwt';
import db from '../db/connection';

declare global {
  namespace Express {
    interface Request {
      tutorialState?: TutorialVirtualState;
      inTutorial?: boolean;
    }
  }
}

/**
 * Resolves the player ID from either the session or a Bearer token.
 * This runs before requireAuth, so we need to handle both auth methods.
 */
function resolvePlayerId(req: Request): string | undefined {
  // Check session first
  if (req.session?.playerId) return req.session.playerId;

  // Fall back to Bearer token (mobile clients)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const { playerId } = verifyJwt(authHeader.slice(7));
      // Also set on session so requireAuth doesn't re-verify
      req.session.playerId = playerId;
      return playerId;
    } catch {
      // Invalid token — let requireAuth handle the 401 later
    }
  }

  return undefined;
}

/**
 * Loads tutorial virtual state for the authenticated player.
 * Sets req.inTutorial and req.tutorialState when the player is actively
 * in the sandboxed tutorial.
 */
export async function loadTutorialState(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const playerId = resolvePlayerId(req);
    if (!playerId) {
      req.inTutorial = false;
      next();
      return;
    }

    const player = await db('players')
      .where({ id: playerId })
      .select('tutorial_completed', 'tutorial_state')
      .first();

    if (player && !player.tutorial_completed && player.tutorial_state) {
      req.inTutorial = true;
      req.tutorialState = typeof player.tutorial_state === 'string'
        ? JSON.parse(player.tutorial_state)
        : player.tutorial_state;
    } else {
      req.inTutorial = false;
    }
  } catch (err) {
    console.error('[loadTutorialState] error:', err);
    req.inTutorial = false;
  }
  next();
}

/**
 * Blocks non-tutorial gameplay actions while the player is in the tutorial.
 * Returns a 400 error telling them to complete the tutorial first.
 */
export function blockDuringTutorial(req: Request, res: Response, next: NextFunction): void {
  if (req.inTutorial) {
    res.status(400).json({ error: 'Complete the tutorial first to access this feature.' });
    return;
  }
  next();
}
