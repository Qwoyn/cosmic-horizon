import { Request, Response, NextFunction } from 'express';

declare module 'express-session' {
  interface SessionData {
    playerId: string;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.playerId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  next();
}
