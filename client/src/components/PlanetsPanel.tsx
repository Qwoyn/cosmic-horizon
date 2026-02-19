import { useState, useEffect } from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import { getOwnedPlanets, getDiscoveredPlanets } from '../services/api';

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

export default function PlanetsPanel({ refreshKey, bare }: Props) {
  const [planets, setPlanets] = useState<PlanetData[]>([]);
  const [discovered, setDiscovered] = useState<DiscoveredPlanetData[]>([]);
  const [tab, setTab] = useState<TabView>('owned');

  useEffect(() => {
    getOwnedPlanets()
      .then(({ data }) => setPlanets(data.planets || []))
      .catch(() => setPlanets([]));
  }, [refreshKey]);

  useEffect(() => {
    if (tab === 'discovered') {
      getDiscoveredPlanets()
        .then(({ data }) => setDiscovered(data.planets || []))
        .catch(() => setDiscovered([]));
    }
  }, [tab, refreshKey]);

  const tabBar = (
    <div className="planet-panel-tabs" style={{ marginBottom: '0.5rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>
      <span
        onClick={() => setTab('owned')}
        style={{ cursor: 'pointer', color: tab === 'owned' ? '#0f0' : '#666', textDecoration: tab === 'owned' ? 'none' : 'none' }}
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
      {planets.map(p => (
        <div key={p.id} className="planet-panel-item">
          <div className="planet-panel-item__header">
            <span className="planet-panel-item__name">{p.name}</span>
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
        </div>
      ))}
    </>
  );

  const discoveredContent = discovered.length === 0 ? (
    <div className="text-muted">No planets discovered yet. Explore sectors to find planets.</div>
  ) : (
    <>
      {discovered.map(p => {
        const tag = p.owned ? ' [YOURS]' : (p.ownerName ? ` (${p.ownerName})` : ' *unclaimed*');
        const tagColor = p.owned ? '#0f0' : (p.ownerName ? '#f80' : '#888');
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
