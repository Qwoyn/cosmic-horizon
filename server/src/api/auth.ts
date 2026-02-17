import { Router } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import db from '../db/connection';
import { GAME_CONFIG } from '../config/game';
import { SHIP_TYPES } from '../config/ship-types';
import { getRace, VALID_RACE_IDS, RaceId } from '../config/races';
import { signJwt } from '../middleware/jwt';
import { requireAuth } from '../middleware/auth';
import { getDefaultTutorialState } from '../config/tutorial-sandbox';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password, race } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (!race || !VALID_RACE_IDS.includes(race)) {
      return res.status(400).json({ error: 'Invalid race. Choose: ' + VALID_RACE_IDS.join(', ') });
    }
    if (username.length < 3 || username.length > 32) {
      return res.status(400).json({ error: 'Username must be 3-32 characters' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const raceConfig = getRace(race as RaceId);
    const shipTypeConfig = SHIP_TYPES.find(s => s.id === raceConfig.starterShipType);
    if (!shipTypeConfig) {
      return res.status(500).json({ error: 'Invalid starter ship configuration' });
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
    const startingCredits = GAME_CONFIG.STARTING_CREDITS + raceConfig.startingCreditsBonus;
    const startingMaxEnergy = GAME_CONFIG.MAX_ENERGY + raceConfig.startingMaxEnergyBonus;

    // SQLite doesn't support .returning(), so generate ID and insert
    const playerId = crypto.randomUUID();

    await db('players').insert({
      id: playerId,
      username,
      email,
      password_hash: passwordHash,
      race,
      current_sector_id: starMallSector.id,
      energy: startingMaxEnergy,
      max_energy: startingMaxEnergy,
      credits: startingCredits,
      explored_sectors: JSON.stringify([starMallSector.id]),
      energy_regen_bonus_until: bonusUntil,
      last_login: new Date(),
      tutorial_state: JSON.stringify(getDefaultTutorialState(startingCredits, startingMaxEnergy)),
    });

    // Create starter ship with racial bonuses
    const shipId = crypto.randomUUID();
    const starterWeapon = shipTypeConfig.baseWeaponEnergy + raceConfig.starterWeaponBonus;
    const starterEngine = shipTypeConfig.baseEngineEnergy + raceConfig.starterEngineBonus;

    await db('ships').insert({
      id: shipId,
      ship_type_id: raceConfig.starterShipType,
      owner_id: playerId,
      sector_id: starMallSector.id,
      weapon_energy: starterWeapon,
      max_weapon_energy: shipTypeConfig.maxWeaponEnergy,
      engine_energy: starterEngine,
      max_engine_energy: shipTypeConfig.maxEngineEnergy,
      cargo_holds: shipTypeConfig.baseCargoHolds,
      max_cargo_holds: shipTypeConfig.maxCargoHolds,
    });

    await db('players').where({ id: playerId }).update({ current_ship_id: shipId });

    req.session.playerId = playerId;
    res.status(201).json({
      token: signJwt(playerId),
      player: {
        id: playerId,
        username,
        email,
        race,
        currentSectorId: starMallSector.id,
        energy: startingMaxEnergy,
        maxEnergy: startingMaxEnergy,
        credits: startingCredits,
        currentShipId: shipId,
        tutorialStep: 0,
        tutorialCompleted: false,
        hasSeenIntro: false,
        hasSeenPostTutorial: false,
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

    const player = await db('players')
      .where({ username })
      .orWhere({ email: username })
      .first();
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
      token: signJwt(player.id),
      player: {
        id: player.id,
        username: player.username,
        race: player.race,
        currentSectorId: player.current_sector_id,
        energy: player.energy,
        maxEnergy: player.max_energy,
        credits: player.credits,
        currentShipId: player.current_ship_id,
        tutorialStep: player.tutorial_step || 0,
        tutorialCompleted: !!player.tutorial_completed,
        hasSeenIntro: !!player.has_seen_intro,
        hasSeenPostTutorial: !!player.has_seen_post_tutorial,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/fcm-token', requireAuth, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Missing FCM token' });
    }

    const playerId = req.session.playerId!;

    // Upsert: update timestamp if token exists, otherwise insert
    const existing = await db('player_devices')
      .where({ player_id: playerId, fcm_token: token })
      .first();

    if (existing) {
      await db('player_devices')
        .where({ id: existing.id })
        .update({ updated_at: new Date() });
    } else {
      await db('player_devices').insert({
        id: crypto.randomUUID(),
        player_id: playerId,
        fcm_token: token,
        platform: 'android',
        updated_at: new Date(),
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('FCM token registration error:', err);
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
