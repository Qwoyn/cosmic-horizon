import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  getMemberSyndicate,
  getPoolResources,
  depositToPool,
  withdrawFromPool,
  setPoolPermission,
  getPoolLog,
  getFactoryStatus,
  designateFactory,
  revokeFactory,
  getProjectDefinitions,
  getSyndicateProjects,
  startProject,
  contributeToProject,
  getProjectDetail,
  cancelProject,
  getSyndicateStructures,
} from '../engine/syndicate-economy';

const router = Router();

// === Pool ===

router.get('/pool', requireAuth, async (req, res) => {
  try {
    const playerId = req.session.playerId!;
    const { syndicateId } = await getMemberSyndicate(playerId);
    const data = await getPoolResources(syndicateId);
    res.json(data);
  } catch (err: any) {
    if (err.message && !err.message.includes('Internal')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Pool fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/pool/deposit', requireAuth, async (req, res) => {
  try {
    const { resourceId, quantity } = req.body;
    if (!resourceId || !quantity) return res.status(400).json({ error: 'Missing resourceId or quantity' });
    const result = await depositToPool(req.session.playerId!, resourceId, Number(quantity));
    res.json(result);
  } catch (err: any) {
    if (err.message && !err.message.includes('Internal')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Pool deposit error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/pool/withdraw', requireAuth, async (req, res) => {
  try {
    const { resourceId, quantity } = req.body;
    if (!resourceId || !quantity) return res.status(400).json({ error: 'Missing resourceId or quantity' });
    const result = await withdrawFromPool(req.session.playerId!, resourceId, Number(quantity));
    res.json(result);
  } catch (err: any) {
    if (err.message && !err.message.includes('Internal')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Pool withdraw error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/pool/permission', requireAuth, async (req, res) => {
  try {
    const { playerId, level } = req.body;
    if (!playerId || !level) return res.status(400).json({ error: 'Missing playerId or level' });
    const result = await setPoolPermission(req.session.playerId!, playerId, level);
    res.json(result);
  } catch (err: any) {
    if (err.message && !err.message.includes('Internal')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Pool permission error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/pool/log', requireAuth, async (req, res) => {
  try {
    const playerId = req.session.playerId!;
    const { syndicateId } = await getMemberSyndicate(playerId);
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const log = await getPoolLog(syndicateId, limit);
    res.json({ log });
  } catch (err: any) {
    if (err.message && !err.message.includes('Internal')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Pool log error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// === Factory ===

router.get('/factory', requireAuth, async (req, res) => {
  try {
    const playerId = req.session.playerId!;
    const { syndicateId } = await getMemberSyndicate(playerId);
    const data = await getFactoryStatus(syndicateId);
    res.json(data);
  } catch (err: any) {
    if (err.message && !err.message.includes('Internal')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Factory status error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/factory/designate', requireAuth, async (req, res) => {
  try {
    const { planetId } = req.body;
    if (!planetId) return res.status(400).json({ error: 'Missing planetId' });
    const result = await designateFactory(req.session.playerId!, planetId);
    res.json(result);
  } catch (err: any) {
    if (err.message && !err.message.includes('Internal')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Factory designate error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/factory/revoke', requireAuth, async (req, res) => {
  try {
    const result = await revokeFactory(req.session.playerId!);
    res.json(result);
  } catch (err: any) {
    if (err.message && !err.message.includes('Internal')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Factory revoke error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// === Projects ===

router.get('/projects/definitions', requireAuth, async (_req, res) => {
  try {
    const definitions = await getProjectDefinitions();
    res.json({ definitions });
  } catch (err: any) {
    console.error('Project definitions error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/projects', requireAuth, async (req, res) => {
  try {
    const playerId = req.session.playerId!;
    const { syndicateId } = await getMemberSyndicate(playerId);
    const projects = await getSyndicateProjects(syndicateId);
    res.json({ projects });
  } catch (err: any) {
    if (err.message && !err.message.includes('Internal')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Projects list error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/projects/start', requireAuth, async (req, res) => {
  try {
    const { projectTypeId, targetSectorId } = req.body;
    if (!projectTypeId) return res.status(400).json({ error: 'Missing projectTypeId' });
    const result = await startProject(
      req.session.playerId!,
      projectTypeId,
      targetSectorId ? Number(targetSectorId) : undefined,
    );
    res.json(result);
  } catch (err: any) {
    if (err.message && !err.message.includes('Internal')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Project start error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/projects/:id/contribute', requireAuth, async (req, res) => {
  try {
    const projectId = req.params.id as string;
    const { resourceId, quantity, fromPool } = req.body;
    if (quantity === undefined) return res.status(400).json({ error: 'Missing quantity' });
    const result = await contributeToProject(
      req.session.playerId!,
      projectId,
      resourceId ?? null,
      Number(quantity),
      fromPool === true,
    );
    res.json(result);
  } catch (err: any) {
    if (err.message && !err.message.includes('Internal')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Project contribute error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/projects/:id', requireAuth, async (req, res) => {
  try {
    const detail = await getProjectDetail(req.params.id as string);
    res.json(detail);
  } catch (err: any) {
    if (err.message && !err.message.includes('Internal')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Project detail error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/projects/:id/cancel', requireAuth, async (req, res) => {
  try {
    const result = await cancelProject(req.session.playerId!, req.params.id as string);
    res.json(result);
  } catch (err: any) {
    if (err.message && !err.message.includes('Internal')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Project cancel error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// === Structures ===

router.get('/structures', requireAuth, async (req, res) => {
  try {
    const playerId = req.session.playerId!;
    const { syndicateId } = await getMemberSyndicate(playerId);
    const structures = await getSyndicateStructures(syndicateId);
    res.json({ structures });
  } catch (err: any) {
    if (err.message && !err.message.includes('Internal')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Structures list error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
