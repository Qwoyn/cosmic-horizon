import { useState, useEffect } from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import { getOwnedPlanets, getDiscoveredPlanets, getPlanet, collectPlanetResources, collectAllRefinery, collectRefinery, upgradePlanet, colonizePlanet, claimPlanet } from '../services/api';

interface PlanetData {
  id: string;
  name: string;
  planetClass: string;
  sectorId: number;
  upgradeLevel: number;
  colonists: number;
  cyrilliumStock: number;
  foodStock: number;
  techStock: number;
  production: { cyrillium: number; food: number; tech: number };
  canUpgrade?: boolean;
}

interface DiscoveredPlanetData {
  id: string;
  name: string;
  planetClass: string;
  sectorId: number;
  owned: boolean;
  ownerName: string | null;
  upgradeLevel: number;
  colonists: number;
  cyrilliumStock?: number;
  foodStock?: number;
  techStock?: number;
}

interface Props {
  refreshKey?: number;
  currentSectorId?: number | null;
  onAction?: () => void;
  onCommand?: (cmd: string) => void;
  bare?: boolean;
}

const CLASS_LABELS: Record<string, string> = {
  H: 'Habitable',
  D: 'Desert',
  O: 'Ocean',
  A: 'Arctic',
  F: 'Forest',
  V: 'Volcanic',
  G: 'Gas Giant',
  S: 'Seed World',
};

type TabView = 'owned' | 'discovered';

export default function PlanetsPanel({ refreshKey, currentSectorId, onAction, onCommand, bare }: Props) {
  const [planets, setPlanets] = useState<PlanetData[]>([]);
  const [discovered, setDiscovered] = useState<DiscoveredPlanetData[]>([]);
  const [tab, setTab] = useState<TabView>('owned');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [planetDetail, setPlanetDetail] = useState<any>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [colonizeQty, setColonizeQty] = useState<Record<string, number>>({});
  const [localRefreshKey, setLocalRefreshKey] = useState(0);

  const refresh = () => setLocalRefreshKey(k => k + 1);

  useEffect(() => {
    getOwnedPlanets()
      .then(({ data }) => setPlanets(data.planets || []))
      .catch(() => setPlanets([]));
  }, [refreshKey, localRefreshKey]);

  useEffect(() => {
    if (tab === 'discovered') {
      getDiscoveredPlanets()
        .then(({ data }) => setDiscovered(data.planets || []))
        .catch(() => setDiscovered([]));
    }
  }, [tab, refreshKey, localRefreshKey]);

  useEffect(() => {
    if (expandedId) {
      getPlanet(expandedId)
        .then(({ data }) => setPlanetDetail(data))
        .catch(() => setPlanetDetail(null));
    } else {
      setPlanetDetail(null);
    }
  }, [expandedId, localRefreshKey]);

  const handleCollect = async (planetId: string) => {
    setBusy(planetId + '-collect');
    setError('');
    try {
      await collectPlanetResources(planetId);
      await collectAllRefinery(planetId).catch(() => {});
      refresh();
      onAction?.();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Collection failed');
    } finally {
      setBusy(null);
    }
  };

  const handleUpgrade = async (planetId: string) => {
    setBusy(planetId + '-upgrade');
    setError('');
    try {
      await upgradePlanet(planetId);
      refresh();
      onAction?.();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Upgrade failed');
    } finally {
      setBusy(null);
    }
  };

  const handleColonize = async (planetId: string) => {
    const qty = colonizeQty[planetId] || 10;
    setBusy(planetId + '-colonize');
    setError('');
    try {
      await colonizePlanet(planetId, qty);
      refresh();
      onAction?.();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Colonization failed');
    } finally {
      setBusy(null);
    }
  };

  const handleClaim = async (planetId: string) => {
    setBusy(planetId + '-claim');
    setError('');
    try {
      await claimPlanet(planetId);
      refresh();
      onAction?.();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Claim failed');
    } finally {
      setBusy(null);
    }
  };

  const tabBar = (
    <div className="group-panel-tabs">
      <span
        onClick={() => setTab('owned')}
        style={{ cursor: 'pointer', color: tab === 'owned' ? '#0f0' : '#666' }}
      >{tab === 'owned' ? '[Owned]' : 'Owned'}</span>
      <span style={{ color: '#444', margin: '0 0.5rem' }}>|</span>
      <span
        onClick={() => setTab('discovered')}
        style={{ cursor: 'pointer', color: tab === 'discovered' ? '#0f0' : '#666' }}
      >{tab === 'discovered' ? '[Discovered]' : 'Discovered'}</span>
    </div>
  );

  const ownedContent = planets.length === 0 ? (
    <div className="text-muted">No planets owned. Use "claim" at a sector with unclaimed planets.</div>
  ) : (
    <>
      {error && <div className="mall-error">{error}</div>}
      {planets.map(p => {
        const inSector = currentSectorId != null && p.sectorId === currentSectorId;
        const expanded = expandedId === p.id;
        return (
          <div key={p.id} className="planet-panel-item">
            <div className="planet-panel-item__header" style={{ cursor: 'pointer' }} onClick={() => setExpandedId(expanded ? null : p.id)}>
              <span className="planet-panel-item__name">{expanded ? '[-]' : '[+]'} {p.name}</span>
              <span className="planet-panel-item__class">[{p.planetClass}] {CLASS_LABELS[p.planetClass] || ''}</span>
            </div>
            <div className="planet-panel-item__details">
              <span>Sector {p.sectorId}</span>
              <span>Level {p.upgradeLevel}</span>
              <span>{p.colonists.toLocaleString()} colonists</span>
            </div>
            <div className="planet-panel-item__stocks">
              <span title="Cyrillium">Cyr: {p.cyrilliumStock}</span>
              <span title="Food">Food: {p.foodStock}</span>
              <span title="Tech">Tech: {p.techStock}</span>
            </div>
            <div className="planet-panel-item__production">
              Production: Cyr={p.production.cyrillium} Food={p.production.food} Tech={p.production.tech}
            </div>
            <div className="planet-actions">
              <button
                className="btn-sm btn-buy"
                disabled={busy === p.id + '-collect'}
                onClick={() => handleCollect(p.id)}
              >
                {busy === p.id + '-collect' ? '...' : 'COLLECT'}
              </button>
              <button
                className="btn-sm btn-primary"
                disabled={busy === p.id + '-upgrade'}
                onClick={() => handleUpgrade(p.id)}
              >
                {busy === p.id + '-upgrade' ? '...' : 'UPGRADE'}
              </button>
              {inSector && onCommand && (
                <button
                  className="btn-sm"
                  onClick={() => onCommand(`land ${p.name}`)}
                  style={{ color: 'var(--green)', borderColor: 'var(--green)' }}
                >
                  LAND
                </button>
              )}
              {inSector && (
                <span className="planet-colonize-group">
                  <input
                    type="number"
                    className="qty-input"
                    min={1}
                    value={colonizeQty[p.id] || 10}
                    onChange={e => setColonizeQty(prev => ({ ...prev, [p.id]: Math.max(1, parseInt(e.target.value) || 1) }))}
                    style={{ width: '48px' }}
                  />
                  <button
                    className="btn-sm"
                    disabled={busy === p.id + '-colonize'}
                    onClick={() => handleColonize(p.id)}
                    style={{ color: 'var(--cyan)', borderColor: 'var(--cyan)' }}
                  >
                    {busy === p.id + '-colonize' ? '...' : 'COLONIZE'}
                  </button>
                </span>
              )}
            </div>
            {expanded && planetDetail && (
              <div className="planet-detail-expanded">
                {planetDetail.refineryQueue?.length > 0 && (
                  <div className="planet-refinery">
                    <span className="panel-subheader">Refinery Queue</span>
                    {planetDetail.refineryQueue.map((q: any) => (
                      <div key={q.id} className="refinery-item">
                        <span>{q.recipeName || q.recipeId} — {q.status}</span>
                        {q.status === 'ready' && (
                          <button className="btn-sm btn-buy" onClick={() => { collectRefinery(q.id).then(() => { refresh(); onAction?.(); }); }}>
                            COLLECT
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {planetDetail.uniqueResources?.length > 0 && (
                  <div className="planet-unique">
                    <span className="panel-subheader">Unique Resources</span>
                    {planetDetail.uniqueResources.map((r: any) => (
                      <div key={r.id || r.name} className="text-muted" style={{ fontSize: '11px' }}>
                        {r.name}: {r.quantity}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );

  const discoveredContent = discovered.length === 0 ? (
    <div className="text-muted">No planets discovered yet. Explore sectors to find planets.</div>
  ) : (
    <>
      {error && <div className="mall-error">{error}</div>}
      {discovered.map(p => {
        const tag = p.owned ? ' [YOURS]' : (p.ownerName ? ` (${p.ownerName})` : ' *unclaimed*');
        const tagColor = p.owned ? '#0f0' : (p.ownerName ? '#f80' : '#888');
        const inSector = currentSectorId != null && p.sectorId === currentSectorId;
        const canClaim = !p.owned && !p.ownerName && inSector;
        return (
          <div key={p.id} className="planet-panel-item">
            <div className="planet-panel-item__header">
              <span className="planet-panel-item__name">{p.name}</span>
              <span className="planet-panel-item__class">[{p.planetClass}] {CLASS_LABELS[p.planetClass] || ''}</span>
              <span style={{ color: tagColor, marginLeft: '0.5rem', fontSize: '0.85em' }}>{tag}</span>
            </div>
            <div className="planet-panel-item__details">
              <span>Sector {p.sectorId}</span>
              <span>Level {p.upgradeLevel}</span>
              <span>{p.colonists.toLocaleString()} colonists</span>
            </div>
            {p.owned && p.cyrilliumStock != null && (
              <div className="planet-panel-item__stocks">
                <span title="Cyrillium">Cyr: {p.cyrilliumStock}</span>
                <span title="Food">Food: {p.foodStock}</span>
                <span title="Tech">Tech: {p.techStock}</span>
              </div>
            )}
            <div className="planet-actions">
              {inSector && onCommand && (
                <button
                  className="btn-sm"
                  onClick={() => onCommand(`land ${p.name}`)}
                  style={{ color: 'var(--green)', borderColor: 'var(--green)' }}
                >
                  LAND
                </button>
              )}
              {canClaim && (
                <button
                  className="btn-sm btn-buy"
                  disabled={busy === p.id + '-claim'}
                  onClick={() => handleClaim(p.id)}
                >
                  {busy === p.id + '-claim' ? '...' : 'CLAIM'}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </>
  );

  const content = (
    <>
      {tabBar}
      {tab === 'owned' && ownedContent}
      {tab === 'discovered' && discoveredContent}
    </>
  );

  if (bare) return <div className="panel-content">{content}</div>;
  return (
    <CollapsiblePanel title="PLANETS" badge={tab === 'owned' ? (planets.length || null) : (discovered.length || null)}>
      {content}
    </CollapsiblePanel>
  );
}
