import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { getNPCsInSector, getUnencounteredNPCsInSector, processDialogue, markEncountered, getContacts, getNPCDetail } from '../engine/npcs';
import db from '../db/connection';

const router = Router();

// List NPCs in player's current sector
router.get('/sector', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const npcs = await getNPCsInSector(player.current_sector_id, player.id);

    res.json({ npcs });
  } catch (err) {
    console.error('NPC sector list error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Dialogue interaction with an NPC
router.post('/:npcId/talk', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const npc = await db('npc_definitions').where({ id: req.params.npcId }).first();
    if (!npc) return res.status(404).json({ error: 'NPC not found' });
    if (npc.sector_id !== player.current_sector_id) return res.status(400).json({ error: 'NPC is not in your sector' });

    const { choiceIndex } = req.body;
    const result = await processDialogue(player.id, npc.id, choiceIndex);

    res.json(result);
  } catch (err) {
    console.error('NPC talk error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark NPC as encountered (after cutscene)
router.post('/:npcId/encountered', requireAuth, async (req, res) => {
  try {
    const player = await db('players').where({ id: req.session.playerId }).first();
    if (!player) return res.status(404).json({ error: 'Player not found' });

    const npc = await db('npc_definitions').where({ id: req.params.npcId }).first();
    if (!npc) return res.status(404).json({ error: 'NPC not found' });
    if (npc.sector_id !== player.current_sector_id) return res.status(400).json({ error: 'NPC is not in your sector' });

    const result = await markEncountered(player.id, req.params.npcId as string);

    res.json({
      encountered: true,
      xp: {
        awarded: result.xp.xpAwarded,
        total: result.xp.totalXp,
        level: result.xp.level,
        rank: result.xp.rank,
        levelUp: result.xp.levelUp,
      },
    });
  } catch (err) {
    console.error('NPC encountered error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Player's contact journal
router.get('/contacts', requireAuth, async (req, res) => {
  try {
    const contacts = await getContacts(req.session.playerId as string);

    res.json({ contacts });
  } catch (err) {
    console.error('NPC contacts error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Detailed NPC info (must have encountered)
router.get('/:npcId', requireAuth, async (req, res) => {
  try {
    const detail = await getNPCDetail(req.session.playerId as string, req.params.npcId as string);
    if (!detail) return res.status(404).json({ error: 'NPC not found or not yet encountered' });

    res.json(detail);
  } catch (err) {
    console.error('NPC detail error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
