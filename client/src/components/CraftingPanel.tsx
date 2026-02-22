import { useState, useEffect } from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import { getPlayerResources, getRecipes, getOwnedPlanets, startCraft, collectRefinery, collectAllRefinery } from '../services/api';

interface Resource {
  id: string;
  name: string;
  quantity: number;
  tier: number;
}

interface Ingredient {
  resourceId: string;
  name: string;
  quantity: number;
}

interface Recipe {
  id: string;
  name: string;
  description?: string;
  tier: number;
  creditsCost: number;
  craftTimeMinutes: number;
  ingredients: Ingredient[];
  discovered?: boolean;
}

interface OwnedPlanet {
  id: string;
  name: string;
}

interface QueueItem {
  id: string;
  name: string;
  readyAt: string;
  planetId: string;
  planetName: string;
}

interface Props {
  refreshKey?: number;
  bare?: boolean;
}

const TIER_LABELS: Record<number, string> = { 1: 'Raw', 2: 'Processed', 3: 'Refined', 4: 'Assembled' };

export default function CraftingPanel({ refreshKey, bare }: Props) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [planets, setPlanets] = useState<OwnedPlanet[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selectedPlanets, setSelectedPlanets] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    getPlayerResources()
      .then(({ data }) => {
        setResources(data.resources || []);
        setQueue(data.refineryQueue || []);
      })
      .catch(() => { setResources([]); setQueue([]); });
    getRecipes(showAll ? '?all=true' : '')
      .then(({ data }) => setRecipes(data.recipes || []))
      .catch(() => setRecipes([]));
    getOwnedPlanets()
      .then(({ data }) => {
        const p = (data.planets || []).map((pl: any) => ({ id: pl.id, name: pl.name }));
        setPlanets(p);
        if (p.length > 0) {
          setSelectedPlanets(prev => {
            const next = { ...prev };
            recipes.forEach(r => { if (!next[r.id]) next[r.id] = p[0].id; });
            return next;
          });
        }
      })
      .catch(() => setPlanets([]));
  }, [refreshKey, showAll]);

  const tierClass = (tier: number) => `crafting-resource--t${Math.min(tier, 5)}`;

  // Build a resource lookup by both id and name for ingredient matching
  const resourceById = new Map(resources.map(r => [r.id, r]));
  const resourceByName = new Map(resources.map(r => [r.name, r]));

  const getHave = (ing: Ingredient): number => {
    return resourceById.get(ing.resourceId)?.quantity
      ?? resourceByName.get(ing.name)?.quantity
      ?? 0;
  };

  const canCraft = (recipe: Recipe): boolean => {
    if (!recipe.ingredients || recipe.ingredients.length === 0) return false;
    return recipe.ingredients.every(ing => getHave(ing) >= ing.quantity);
  };

  const handleCraft = async (recipeId: string) => {
    const planetId = selectedPlanets[recipeId] || planets[0]?.id;
    if (!planetId) return;
    setBusy(recipeId);
    try {
      await startCraft(planetId, recipeId);
      const { data } = await getPlayerResources();
      setResources(data.resources || []);
      setQueue(data.refineryQueue || []);
    } catch { /* silent */ } finally { setBusy(null); }
  };

  const handleCollect = async (queueId: string) => {
    setBusy(queueId);
    try {
      await collectRefinery(queueId);
      const { data } = await getPlayerResources();
      setResources(data.resources || []);
      setQueue(data.refineryQueue || []);
    } catch { /* silent */ } finally { setBusy(null); }
  };

  const handleCollectAll = async (planetId: string) => {
    setBusy(`all-${planetId}`);
    try {
      await collectAllRefinery(planetId);
      const { data } = await getPlayerResources();
      setResources(data.resources || []);
      setQueue(data.refineryQueue || []);
    } catch { /* silent */ } finally { setBusy(null); }
  };

  const discoveredRecipes = recipes.filter(r => r.discovered !== false);
  const displayRecipes = showAll ? recipes : discoveredRecipes;

  // Group displayed recipes by tier
  const groupedByTier = new Map<number, Recipe[]>();
  for (const r of displayRecipes) {
    const list = groupedByTier.get(r.tier) || [];
    list.push(r);
    groupedByTier.set(r.tier, list);
  }
  const sortedTiers = [...groupedByTier.keys()].sort((a, b) => a - b);

  const resourcesSection = (
    <CollapsiblePanel title="YOUR RESOURCES" defaultOpen>
      {resources.length === 0 ? (
        <div className="text-muted">No resources</div>
      ) : (
        <div className="crafting-resource-list">
          {resources.map(r => (
            <div key={r.id} className={`crafting-resource ${tierClass(r.tier)}`}>
              <span>{r.name}</span>
              <span>{r.quantity}</span>
            </div>
          ))}
        </div>
      )}
    </CollapsiblePanel>
  );

  const recipesSection = (
    <CollapsiblePanel title="RECIPES" defaultOpen>
      <div className="recipe-toggle-row">
        <button
          className={`btn-sm ${showAll ? '' : 'btn-buy'}`}
          onClick={() => setShowAll(false)}
        >
          Discovered ({discoveredRecipes.length})
        </button>
        <button
          className={`btn-sm ${showAll ? 'btn-buy' : ''}`}
          onClick={() => setShowAll(true)}
        >
          All ({recipes.length})
        </button>
      </div>
      {displayRecipes.length === 0 ? (
        <div className="text-muted" style={{ marginTop: 6 }}>
          {showAll ? 'No recipes available' : 'No discovered recipes — explore to discover new recipes or toggle "All" to browse'}
        </div>
      ) : (
        sortedTiers.map(tier => (
          <div key={tier}>
            <div className="recipe-tier-header">
              <span className={tierClass(tier)}>{TIER_LABELS[tier] || `Tier ${tier}`}</span>
            </div>
            {groupedByTier.get(tier)!.map(r => {
              const isUndiscovered = r.discovered === false;
              const craftable = !isUndiscovered && canCraft(r);
              const itemClass = isUndiscovered
                ? 'recipe-item recipe-item--undiscovered'
                : `recipe-item ${craftable ? 'recipe-item--craftable' : 'recipe-item--locked'}`;
              return (
                <div key={r.id} className={itemClass}>
                  <div className="recipe-item__header">
                    <span className="recipe-item__name">{r.name}</span>
                    {r.craftTimeMinutes > 0 && (
                      <span className="recipe-item__time">{r.craftTimeMinutes}m</span>
                    )}
                  </div>
                  {r.description && showAll && (
                    <div className="recipe-item__desc">{r.description}</div>
                  )}
                  <div className="recipe-item__ingredients">
                    {(r.ingredients || []).map((ing, i) => {
                      if (isUndiscovered) {
                        return (
                          <span key={i} className="recipe-ingredient recipe-ingredient--need">
                            {ing.name}
                            <span className="recipe-ingredient__qty">
                              ?/{ing.quantity}
                            </span>
                          </span>
                        );
                      }
                      const have = getHave(ing);
                      const enough = have >= ing.quantity;
                      return (
                        <span key={i} className={`recipe-ingredient ${enough ? 'recipe-ingredient--have' : 'recipe-ingredient--need'}`}>
                          {ing.name}
                          <span className="recipe-ingredient__qty">
                            {have}/{ing.quantity}
                          </span>
                        </span>
                      );
                    })}
                    {r.creditsCost > 0 && (
                      <span className="recipe-ingredient recipe-ingredient--credits">
                        {r.creditsCost.toLocaleString()} cr
                      </span>
                    )}
                  </div>
                  {isUndiscovered && (
                    <div className="recipe-item__desc">Discover resources to unlock</div>
                  )}
                  {craftable && (
                    <div className="recipe-item__actions">
                      {planets.length > 0 && (
                        <select
                          className="planet-selector"
                          value={selectedPlanets[r.id] || planets[0]?.id || ''}
                          onChange={e => setSelectedPlanets(prev => ({ ...prev, [r.id]: e.target.value }))}
                        >
                          {planets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      )}
                      <button
                        className="btn-sm btn-buy"
                        disabled={busy === r.id || planets.length === 0}
                        onClick={() => handleCraft(r.id)}
                      >
                        {busy === r.id ? '...' : 'CRAFT'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))
      )}
    </CollapsiblePanel>
  );

  const now = Date.now();
  const readyItems = queue.filter(q => new Date(q.readyAt).getTime() <= now);
  const pendingItems = queue.filter(q => new Date(q.readyAt).getTime() > now);
  const planetIds = [...new Set(readyItems.map(q => q.planetId))];

  const queueSection = (
    <CollapsiblePanel title="REFINERY QUEUE" defaultOpen badge={queue.length || null}>
      {queue.length === 0 ? (
        <div className="text-muted">No items in queue</div>
      ) : (
        <>
          {readyItems.map(q => (
            <div key={q.id} className="refinery-item refinery-item--ready">
              <span>{q.name} - Ready!</span>
              <button className="btn-sm btn-buy" onClick={() => handleCollect(q.id)} disabled={busy === q.id}>
                {busy === q.id ? '...' : 'COLLECT'}
              </button>
            </div>
          ))}
          {pendingItems.map(q => {
            const remaining = new Date(q.readyAt).getTime() - now;
            const mins = Math.ceil(remaining / 60000);
            return (
              <div key={q.id} className="refinery-item refinery-item--pending">
                <span>{q.name}</span>
                <span>{mins}m remaining</span>
              </div>
            );
          })}
          {planetIds.length > 0 && readyItems.length > 1 && (
            <div style={{ marginTop: 6 }}>
              {planetIds.map(pid => (
                <button
                  key={pid}
                  className="btn-sm btn-buy"
                  style={{ marginRight: 4 }}
                  onClick={() => handleCollectAll(pid)}
                  disabled={busy === `all-${pid}`}
                >
                  {busy === `all-${pid}` ? '...' : `COLLECT ALL (${readyItems.find(q => q.planetId === pid)?.planetName || 'planet'})`}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </CollapsiblePanel>
  );

  const content = (
    <>
      {resourcesSection}
      {recipesSection}
      {queueSection}
    </>
  );

  if (bare) return <div className="panel-content">{content}</div>;
  return <CollapsiblePanel title="CRAFTING">{content}</CollapsiblePanel>;
}
