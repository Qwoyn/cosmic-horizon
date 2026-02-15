// Server -> Client events
export interface ServerEvents {
  'sector:update': { sectorId: number; players: { id: string; username: string }[] };
  'player:entered': { playerId: string; username: string; sectorId: number };
  'player:left': { playerId: string; sectorId: number };
  'combat:volley': { attackerId: string; attackerName: string; damage: number; yourEnergyRemaining: number };
  'combat:destroyed': { destroyedPlayerId: string; destroyerName: string };
  'combat:fled': { playerId: string; username: string };
  'notification': { type: string; message: string; data?: any };
  'energy:update': { energy: number; maxEnergy: number };
  'trade:complete': { outpostId: string; commodity: string; quantity: number; total: number };
  'chat:sector': { senderId: string; senderName: string; message: string; timestamp: number };
}

// Client -> Server events
export interface ClientEvents {
  'join': { playerId: string };
  'chat:sector': { message: string };
}

// Room naming helpers
export function sectorRoom(sectorId: number): string {
  return `sector:${sectorId}`;
}

export function playerRoom(playerId: string): string {
  return `player:${playerId}`;
}
