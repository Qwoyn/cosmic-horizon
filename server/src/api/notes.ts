import { Router } from 'express';
import crypto from 'crypto';
import { requireAuth } from '../middleware/auth';
import db from '../db/connection';

const router = Router();

const MAX_NOTES_PER_PLAYER = 200;
const MAX_NOTE_LENGTH = 500;

// List notes (optional search)
router.get('/', requireAuth, async (req, res) => {
  try {
    const search = req.query.search as string | undefined;
    let query = db('notes')
      .where({ player_id: req.session.playerId })
      .orderBy('created_at', 'desc')
      .limit(MAX_NOTES_PER_PLAYER)
      .select('id', 'content', 'created_at as createdAt');

    if (search) {
      query = query.andWhere('content', 'like', `%${search}%`);
    }

    const notes = await query;
    res.json({ notes });
  } catch (err) {
    console.error('Notes list error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a note
router.post('/', requireAuth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Note content is required' });
    }
    if (content.length > MAX_NOTE_LENGTH) {
      return res.status(400).json({ error: `Note too long (max ${MAX_NOTE_LENGTH} characters)` });
    }

    const count = await db('notes')
      .where({ player_id: req.session.playerId })
      .count('* as count')
      .first();

    if (Number(count?.count || 0) >= MAX_NOTES_PER_PLAYER) {
      return res.status(400).json({ error: `Note limit reached (max ${MAX_NOTES_PER_PLAYER})` });
    }

    const id = crypto.randomUUID();
    await db('notes').insert({
      id,
      player_id: req.session.playerId,
      content: content.trim(),
    });

    res.json({ id, content: content.trim() });
  } catch (err) {
    console.error('Create note error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a note
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const note = await db('notes').where({ id: req.params.id }).first();
    if (!note) return res.status(404).json({ error: 'Note not found' });
    if (note.player_id !== req.session.playerId) {
      return res.status(403).json({ error: 'Not your note' });
    }

    await db('notes').where({ id: req.params.id }).delete();
    res.json({ deleted: true });
  } catch (err) {
    console.error('Delete note error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
