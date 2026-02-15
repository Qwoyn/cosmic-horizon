import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'cosmic-horizon-jwt-dev-secret';
const JWT_EXPIRY = '30d';

export function signJwt(playerId: string): string {
  return jwt.sign({ playerId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

export function verifyJwt(token: string): { playerId: string } {
  return jwt.verify(token, JWT_SECRET) as { playerId: string };
}
