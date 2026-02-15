import { Router } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import db from '../db/connection';
import { GAME_CONFIG } from '../config/game';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (username.length < 3 || username.length > 32) {
      return res.status(400).json({ error: 'Username must be 3-32 characters' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Pick a random star mall sector for starting location
    const starMallSector = await db('sectors')
      .where({ has_star_mall: true })
      .orderByRaw('RANDOM()')
      .first();

    if (!starMallSector) {
      return res.status(500).json({ error: 'Universe not initialized' });
    }

    const bonusUntil = new Date(Date.now() + GAME_CONFIG.ENERGY_REGEN_BONUS_DURATION_HOURS * 60 * 60 * 1000);

    // SQLite doesn't support .returning(), so generate ID and insert
    const playerId = crypto.randomUUID();

    await db('players').insert({
      id: playerId,
      username,
      email,
      password_hash: passwordHash,
      current_sector_id: starMallSector.id,
      energy: GAME_CONFIG.MAX_ENERGY,
      max_energy: GAME_CONFIG.MAX_ENERGY,
      credits: GAME_CONFIG.STARTING_CREDITS,
      explored_sectors: JSON.stringify([starMallSector.id]),
      energy_regen_bonus_until: bonusUntil,
      last_login: new Date(),
    });

    // Create starter ship
    const shipId = crypto.randomUUID();
    await db('ships').insert({
      id: shipId,
      ship_type_id: GAME_CONFIG.STARTER_SHIP_TYPE,
      owner_id: playerId,
      sector_id: starMallSector.id,
      weapon_energy: 25,
      max_weapon_energy: 25,
      engine_energy: 50,
      max_engine_energy: 50,
      cargo_holds: 10,
      max_cargo_holds: 10,
    });

    await db('players').where({ id: playerId }).update({ current_ship_id: shipId });

    req.session.playerId = playerId;
    res.status(201).json({
      player: {
        id: playerId,
        username,
        email,
        currentSectorId: starMallSector.id,
        energy: GAME_CONFIG.MAX_ENERGY,
        credits: GAME_CONFIG.STARTING_CREDITS,
        currentShipId: shipId,
      },
    });
  } catch (err: any) {
    if (err.message?.includes('UNIQUE constraint failed: players.username') || err.constraint === 'players_username_unique') {
      return res.status(409).json({ error: 'Username already taken' });
    }
    if (err.message?.includes('UNIQUE constraint failed: players.email') || err.constraint === 'players_email_unique') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const player = await db('players').where({ username }).first();
    if (!player) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, player.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await db('players').where({ id: player.id }).update({ last_login: new Date() });

    req.session.playerId = player.id;
    res.json({
      player: {
        id: player.id,
        username: player.username,
        currentSectorId: player.current_sector_id,
        energy: player.energy,
        credits: player.credits,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ success: true });
  });
});

export default router;
