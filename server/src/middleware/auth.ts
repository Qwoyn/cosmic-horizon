import { Request, Response, NextFunction } from 'express';
import { verifyJwt } from './jwt';

declare module 'express-session' {
  interface SessionData {
    playerId: string;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  // Check Bearer token first (mobile clients)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const { playerId } = verifyJwt(token);
      req.session.playerId = playerId;
      next();
      return;
    } catch {
      // Token invalid, fall through to session check
    }
  }

  // Fall back to session auth (web clients)
  if (!req.session?.playerId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  next();
}
