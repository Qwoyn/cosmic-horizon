import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  getPlayerResources,
  getPlanetResources,
  getAvailableRecipes,
  getRefineryQueue,
  getRefinerySlots,
  startCraft,
  collectRefineryBatch,
  collectPlanetResources,
  collectAllCompleted,
} from '../engine/crafting';
import db from '../db/connection';

const router = Router();

// Player's resource inventory
router.get('/resources', requireAuth, async (req, res) => {
  try {
    const resources = await getPlayerResources(req.session.playerId!);
    res.json({ resources });
  } catch (err) {
    console.error('Player resources error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resources on a specific planet
router.get('/resources/planet/:planetId', requireAuth, async (req, res) => {
  try {
    const planetId = req.params.planetId as string;
    const planet = await db('planets').where({ id: planetId }).first();
    if (!planet) return res.status(404).json({ error: 'Planet not found' });
    if (planet.owner_id !== req.session.playerId) {
      return res.status(403).json({ error: 'You do not own this planet' });
    }

    const resources = await getPlanetResources(planetId);
    const refineryQueue = await getRefineryQueue(planetId);
    const refinerySlots = getRefinerySlots(planet.upgrade_level);

    res.json({
      planetName: planet.name,
      planetClass: planet.planet_class,
      upgradeLevel: planet.upgrade_level,
      resources,
      refineryQueue,
      refinerySlots,
    });
  } catch (err) {
    console.error('Planet resources error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Available recipes (with discovery filtering)
router.get('/recipes', requireAuth, async (req, res) => {
  try {
    const planetLevel = parseInt(req.query.planetLevel as string) || 7;
    const showAll = req.query.all === 'true';
    const playerId = req.session.playerId!;

    const recipes = await getAvailableRecipes(planetLevel);

    // Get player's discovered recipes
    let discoveredIds: Set<string>;
    try {
      const discovered = await db('player_discovered_recipes')
        .where({ player_id: playerId })
        .select('recipe_id');
      discoveredIds = new Set(discovered.map(d => d.recipe_id));
    } catch {
      // Table may not exist yet, treat all as discovered
      discoveredIds = new Set(recipes.map(r => r.id));
    }

    const result = recipes.map(r => {
      const isDiscovered = discoveredIds.has(r.id);
      if (!showAll && !isDiscovered) return null;

      if (!isDiscovered) {
        // Mask undiscovered recipe
        return {
          ...r,
          discovered: false,
          name: '??? Unknown Recipe ???',
          description: 'Discover new resources to unlock this recipe.',
          ingredients: r.ingredients.length > 0
            ? [{ ...r.ingredients[0] }, ...r.ingredients.slice(1).map((ing: any) => ({ ...ing, name: '???', resourceId: '???' }))]
            : [],
        };
      }

      return { ...r, discovered: true };
    }).filter(Boolean);

    // Group by tier
    const grouped: Record<number, any[]> = {};
    for (const r of result) {
      if (!r) continue;
      if (!grouped[r.tier]) grouped[r.tier] = [];
      grouped[r.tier].push(r);
    }

    res.json({ recipes: result, grouped });
  } catch (err) {
    console.error('Recipes error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start crafting
router.post('/craft', requireAuth, async (req, res) => {
  try {
    const { planetId, recipeId, batchSize } = req.body;
    if (!planetId || !recipeId) {
      return res.status(400).json({ error: 'Missing planetId or recipeId' });
    }

    const result = await startCraft(
      req.session.playerId!,
      planetId,
      recipeId,
      batchSize || 1,
    );

    res.json(result);
  } catch (err: any) {
    if (err.message && !err.message.includes('Internal')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Craft error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Collect completed refinery batch
router.post('/collect', requireAuth, async (req, res) => {
  try {
    const { queueId } = req.body;
    if (!queueId) return res.status(400).json({ error: 'Missing queueId' });

    const result = await collectRefineryBatch(req.session.playerId!, queueId);
    res.json(result);
  } catch (err: any) {
    if (err.message && !err.message.includes('Internal')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Collect refinery error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Collect all resources from planet
router.post('/collect-planet', requireAuth, async (req, res) => {
  try {
    const { planetId } = req.body;
    if (!planetId) return res.status(400).json({ error: 'Missing planetId' });

    const result = await collectPlanetResources(req.session.playerId!, planetId);
    res.json(result);
  } catch (err: any) {
    if (err.message && !err.message.includes('Internal')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Collect planet error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Collect all completed refinery batches from a planet
router.post('/collect-all', requireAuth, async (req, res) => {
  try {
    const { planetId } = req.body;
    if (!planetId) return res.status(400).json({ error: 'Missing planetId' });

    const result = await collectAllCompleted(req.session.playerId!, planetId);
    res.json(result);
  } catch (err: any) {
    if (err.message && !err.message.includes('Internal')) {
      return res.status(400).json({ error: err.message });
    }
    console.error('Collect all error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
