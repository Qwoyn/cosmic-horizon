import db from '../db/connection';
import { GAME_CONFIG } from '../config/game';

interface LeaderboardEntry {
  player_id: string;
  player_name: string;
  score: number;
}

async function computeLeaderboard(category: string): Promise<LeaderboardEntry[]> {
  const limit = GAME_CONFIG.LEADERBOARD_TOP_N;

  switch (category) {
    case 'credits':
      return db('players')
        .orderBy('credits', 'desc')
        .limit(limit)
        .select('id as player_id', 'username as player_name', 'credits as score');

    case 'planets': {
      const rows = await db('planets')
        .join('players', 'planets.owner_id', 'players.id')
        .groupBy('planets.owner_id', 'players.username')
        .orderByRaw('count(*) desc')
        .limit(limit)
        .select('planets.owner_id as player_id', 'players.username as player_name')
        .count('* as score');
      return rows.map(r => ({ player_id: r.player_id as string, player_name: r.player_name as string, score: Number(r.score) }));
    }

    case 'combat': {
      const rows = await db('combat_logs')
        .join('players', 'combat_logs.attacker_id', 'players.id')
        .where({ outcome: 'ship_destroyed' })
        .groupBy('combat_logs.attacker_id', 'players.username')
        .orderByRaw('count(*) desc')
        .limit(limit)
        .select('combat_logs.attacker_id as player_id', 'players.username as player_name')
        .count('* as score');
      return rows.map(r => ({ player_id: r.player_id as string, player_name: r.player_name as string, score: Number(r.score) }));
    }

    case 'explored': {
      // Count explored sectors from JSON array length
      const players = await db('players')
        .whereNotNull('explored_sectors')
        .select('id as player_id', 'username as player_name', 'explored_sectors');
      const scored = players.map(p => {
        let count = 0;
        try { count = JSON.parse(p.explored_sectors || '[]').length; } catch { count = 0; }
        return { player_id: p.player_id, player_name: p.player_name, score: count };
      });
      scored.sort((a, b) => b.score - a.score);
      return scored.slice(0, limit);
    }

    case 'trade': {
      const rows = await db('trade_logs')
        .join('players', 'trade_logs.player_id', 'players.id')
        .groupBy('trade_logs.player_id', 'players.username')
        .orderByRaw('sum(trade_logs.quantity) desc')
        .limit(limit)
        .select('trade_logs.player_id as player_id', 'players.username as player_name')
        .sum('trade_logs.quantity as score');
      return rows.map(r => ({ player_id: r.player_id as string, player_name: r.player_name as string, score: Number(r.score) }));
    }

    case 'syndicate': {
      const rows = await db('syndicate_members')
        .join('syndicates', 'syndicate_members.syndicate_id', 'syndicates.id')
        .groupBy('syndicate_members.syndicate_id', 'syndicates.name')
        .orderByRaw('count(*) desc')
        .limit(limit)
        .select('syndicates.id as player_id', 'syndicates.name as player_name')
        .count('* as score');
      return rows.map(r => ({ player_id: r.player_id as string, player_name: r.player_name as string, score: Number(r.score) }));
    }

    default:
      return [];
  }
}

export async function refreshLeaderboardCache(): Promise<void> {
  const categories = GAME_CONFIG.LEADERBOARD_CATEGORIES;
  const now = new Date().toISOString();

  for (const category of categories) {
    try {
      const entries = await computeLeaderboard(category);

      // Clear old cache for this category
      await db('leaderboard_cache').where({ category }).del();

      // Insert new entries
      for (let i = 0; i < entries.length; i++) {
        await db('leaderboard_cache').insert({
          category,
          rank: i + 1,
          player_id: entries[i].player_id,
          player_name: entries[i].player_name,
          score: entries[i].score,
          updated_at: now,
        });
      }
    } catch (err) {
      // Some tables (trade_logs, syndicate_members) may not have data
      console.error(`Leaderboard cache error for ${category}:`, err);
    }
  }
}

export { computeLeaderboard };
