import { useState, useEffect } from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import { getPlayerResources, getRecipes, getOwnedPlanets, startCraft, collectRefinery, collectAllRefinery } from '../services/api';

interface Resource {
  id: string;
  name: string;
  quantity: number;
  tier: number;
}

interface RecipeInput {
  resourceName: string;
  quantity: number;
}

interface Recipe {
  id: string;
  name: string;
  inputs: RecipeInput[];
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

export default function CraftingPanel({ refreshKey, bare }: Props) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [planets, setPlanets] = useState<OwnedPlanet[]>([]);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [selectedPlanets, setSelectedPlanets] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    getPlayerResources()
      .then(({ data }) => {
        setResources(data.resources || []);
        setQueue(data.refineryQueue || []);
      })
      .catch(() => { setResources([]); setQueue([]); });
    getRecipes()
      .then(({ data }) => setRecipes(data.recipes || []))
      .catch(() => setRecipes([]));
    getOwnedPlanets()
      .then(({ data }) => {
        const p = (data.planets || []).map((pl: any) => ({ id: pl.id, name: pl.name }));
        setPlanets(p);
        // Default planet selection
        if (p.length > 0) {
          setSelectedPlanets(prev => {
            const next = { ...prev };
            recipes.forEach(r => { if (!next[r.id]) next[r.id] = p[0].id; });
            return next;
          });
        }
      })
      .catch(() => setPlanets([]));
  }, [refreshKey]);

  const tierClass = (tier: number) => `crafting-resource--t${Math.min(tier, 5)}`;

  const canCraft = (recipe: Recipe): boolean => {
    if (!recipe.inputs || recipe.inputs.length === 0) return false;
    return recipe.inputs.every(input => {
      const res = resources.find(r => r.name === input.resourceName);
      return res && res.quantity >= input.quantity;
    });
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
      {recipes.length === 0 ? (
        <div className="text-muted">No recipes available</div>
      ) : (
        <>
          {recipes.map(r => {
            const craftable = canCraft(r);
            return (
              <div key={r.id} className={`recipe-item ${craftable ? 'recipe-item--craftable' : ''}`}>
                <div className="recipe-item__name">{r.name}</div>
                <div className="recipe-item__inputs">
                  {(r.inputs || []).map((inp, i) => (
                    <span key={i}>{inp.resourceName} x{inp.quantity}{i < (r.inputs || []).length - 1 ? ', ' : ''}</span>
                  ))}
                </div>
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
                    disabled={!craftable || busy === r.id || planets.length === 0}
                    onClick={() => handleCraft(r.id)}
                  >
                    {busy === r.id ? '...' : 'CRAFT'}
                  </button>
                </div>
              </div>
            );
          })}
        </>
      )}
    </CollapsiblePanel>
  );

  const now = Date.now();
  const readyItems = queue.filter(q => new Date(q.readyAt).getTime() <= now);
  const pendingItems = queue.filter(q => new Date(q.readyAt).getTime() > now);
  // Group by planet for collect-all
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
