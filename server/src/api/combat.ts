import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { canAffordAction, deductEnergy, getActionCost } from '../engine/energy';
import { resolveCombatVolley, attemptFlee, CombatState } from '../engine/combat';
import { SHIP_TYPES } from '../config/ship-types';
import { getRace, RaceId } from '../config/races';
import { checkAndUpdateMissions } from '../services/mission-tracker';
import { applyUpgradesToShip } from '../engine/upgrades';
import db from '../db/connection';
import { sendPushToPlayer } from '../services/push';

const router = Router();

// Fire volley at target (2 AP)
router.post('/fire', requireAuth, async (req, res) => {
  try {
    const { targetPlayerId, energyToExpend } = req.body;
    if (!targetPlayerId || !energyToExpend || energyToExpend < 1) {
      return res.status(400).json({ error: 'Missing or invalid fields' });
    }

    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    if (!canAffordAction(player.energy, 'combat_volley')) {
      return res.status(400).json({ error: 'Not enough energy', cost: getActionCost('combat_volley') });
    }

    // Check sector type allows combat
    const sector = await db('sectors').where({ id: player.current_sector_id }).first();
    if (sector?.type === 'protected' || sector?.type === 'harmony_enforced') {
      return res.status(400).json({ error: 'Combat not allowed in this sector' });
    }

    const target = await db('players').where({ id: targetPlayerId }).first();
    if (!target || target.current_sector_id !== player.current_sector_id) {
      return res.status(400).json({ error: 'Target not in your sector' });
    }

    const attackerShip = await db('ships').where({ id: player.current_ship_id }).first();
    const defenderShip = await db('ships').where({ id: target.current_ship_id }).first();
    if (!attackerShip || !defenderShip) {
      return res.status(400).json({ error: 'Both players must have ships' });
    }

    const attackerType = SHIP_TYPES.find(s => s.id === attackerShip.ship_type_id);
    const defenderType = SHIP_TYPES.find(s => s.id === defenderShip.ship_type_id);
    if (!attackerType || !defenderType) {
      return res.status(500).json({ error: 'Invalid ship type' });
    }

    const attackerRace = player.race ? getRace(player.race as RaceId) : null;
    const defenderRace = target.race ? getRace(target.race as RaceId) : null;

    // Load ship upgrades
    let attackerUpgrades = { weaponBonus: 0, engineBonus: 0, cargoBonus: 0, shieldBonus: 0 };
    let defenderUpgrades = { weaponBonus: 0, engineBonus: 0, cargoBonus: 0, shieldBonus: 0 };
    try {
      attackerUpgrades = await applyUpgradesToShip(attackerShip.id);
      defenderUpgrades = await applyUpgradesToShip(defenderShip.id);
    } catch { /* upgrades table may not exist yet */ }

    const attackerState: CombatState = {
      weaponEnergy: attackerShip.weapon_energy + attackerUpgrades.weaponBonus,
      engineEnergy: attackerShip.engine_energy + attackerUpgrades.engineBonus,
      hullHp: attackerShip.hull_hp,
      attackRatio: attackerType.attackRatio * (1 + (attackerRace?.attackRatioBonus ?? 0)),
      defenseRatio: attackerType.defenseRatio * (1 + (attackerRace?.defenseRatioBonus ?? 0)),
    };
    const defenderState: CombatState = {
      weaponEnergy: defenderShip.weapon_energy + defenderUpgrades.weaponBonus,
      engineEnergy: defenderShip.engine_energy + defenderUpgrades.engineBonus,
      hullHp: defenderShip.hull_hp,
      attackRatio: defenderType.attackRatio * (1 + (defenderRace?.attackRatioBonus ?? 0)),
      defenseRatio: defenderType.defenseRatio * (1 + (defenderRace?.defenseRatioBonus ?? 0)),
    };

    const result = resolveCombatVolley(attackerState, defenderState, energyToExpend);
    const newEnergy = deductEnergy(player.energy, 'combat_volley');

    // Update attacker ship weapon energy
    await db('ships').where({ id: attackerShip.id }).update({
      weapon_energy: attackerShip.weapon_energy - result.attackerEnergySpent,
    });

    // Update defender ship hull HP (weapon/engine energy unchanged by incoming damage)
    await db('ships').where({ id: defenderShip.id }).update({
      hull_hp: result.defenderHullHpRemaining,
    });

    // Update player energy
    await db('players').where({ id: player.id }).update({ energy: newEnergy });

    let bountiesClaimed: { bountyId: string; reward: number }[] = [];

    if (result.defenderDestroyed) {
      // Spawn dodge pod for defender
      const crypto = require('crypto');
      const podId = crypto.randomUUID();
      await db('ships').insert({
        id: podId,
        ship_type_id: 'dodge_pod',
        owner_id: target.id,
        sector_id: target.current_sector_id,
        weapon_energy: 0,
        max_weapon_energy: 0,
        engine_energy: 20,
        max_engine_energy: 20,
        cargo_holds: 0,
        max_cargo_holds: 0,
        hull_hp: 10,
        max_hull_hp: 10,
      });
      await db('players').where({ id: target.id }).update({ current_ship_id: podId });

      // Log combat
      await db('combat_logs').insert({
        id: crypto.randomUUID(),
        attacker_id: player.id,
        defender_id: target.id,
        sector_id: player.current_sector_id,
        energy_expended: result.attackerEnergySpent,
        damage_dealt: result.damageDealt,
        outcome: 'ship_destroyed',
      });

      // Check and claim bounties on the destroyed player
      const activeBounties = await db('bounties')
        .where({ target_player_id: target.id, active: true });

      if (activeBounties.length > 0) {
        let totalBountyReward = 0;
        for (const bounty of activeBounties) {
          totalBountyReward += Number(bounty.reward);
          bountiesClaimed.push({ bountyId: bounty.id, reward: Number(bounty.reward) });
          await db('bounties').where({ id: bounty.id }).update({
            active: false,
            claimed_by_id: player.id,
            claimed_at: new Date(),
          });
        }
        // Award bounty rewards to attacker
        await db('players').where({ id: player.id }).increment('credits', totalBountyReward);
      }
    }

    // Mission progress: combat
    if (result.defenderDestroyed) {
      checkAndUpdateMissions(player.id, 'combat_destroy', {});
    }

    // Push notification to defender
    if (result.defenderDestroyed) {
      sendPushToPlayer(target.id, {
        title: 'Ship Destroyed!',
        body: `${player.username} destroyed your ship in sector ${player.current_sector_id}`,
        type: 'combat',
      });
    } else {
      sendPushToPlayer(target.id, {
        title: 'Under Attack!',
        body: `${player.username} hit you for ${result.damageDealt} damage in sector ${player.current_sector_id}`,
        type: 'combat',
      });
    }

    res.json({
      damageDealt: result.damageDealt,
      attackerEnergySpent: result.attackerEnergySpent,
      defenderDestroyed: result.defenderDestroyed,
      defenderHullHpRemaining: result.defenderHullHpRemaining,
      energy: newEnergy,
      bountiesClaimed,
    });
  } catch (err) {
    console.error('Combat fire error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Attempt to flee
router.post('/flee', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    // Count attackers in sector (players with weapon energy > 0, excluding self)
    const attackersInSector = await db('players')
      .where({ current_sector_id: player.current_sector_id })
      .whereNot({ id: player.id })
      .count('id as count')
      .first();

    const numAttackers = Math.max(1, Number(attackersInSector?.count || 1));
    const rng = Math.random();
    const fleeResult = attemptFlee(numAttackers, rng);

    if (fleeResult.success) {
      // Move to random adjacent sector
      const edges = await db('sector_edges').where({ from_sector_id: player.current_sector_id });
      if (edges.length > 0) {
        const randomEdge = edges[Math.floor(Math.random() * edges.length)];
        await db('players').where({ id: player.id }).update({
          current_sector_id: randomEdge.to_sector_id,
          docked_at_outpost_id: null,
        });
        if (player.current_ship_id) {
          await db('ships').where({ id: player.current_ship_id }).update({
            sector_id: randomEdge.to_sector_id,
          });
        }
      }
    }

    res.json({
      success: fleeResult.success,
      fleeChance: fleeResult.fleeChance,
    });
  } catch (err) {
    console.error('Flee error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
