import CollapsiblePanel from './CollapsiblePanel';
import PixelSprite from './PixelSprite';
import type { SectorState } from '../hooks/useGameState';

interface MapPanelProps {
  sector: SectorState | null;
  onMoveToSector: (sectorId: number) => void;
  bare?: boolean;
}

export default function MapPanel({ sector, onMoveToSector, bare }: MapPanelProps) {
  if (!sector) {
    const empty = <div>No data</div>;
    if (bare) return <div className="panel-content">{empty}</div>;
    return <CollapsiblePanel title="NAV MAP">{empty}</CollapsiblePanel>;
  }

  const content = (
    <>
      <div className="panel-row">
        <span className="panel-label">Type:</span>
        <span className={`sector-type-${sector.type}`}>{sector.type}</span>
      </div>
      <div className="panel-row">
        <span className="panel-label">Region:</span>
        <span>{sector.regionId}</span>
      </div>
      {sector.hasStarMall && (
        <div className="panel-row text-success">★ Star Mall Present</div>
      )}

      <div className="panel-subheader">Adjacent Sectors</div>
      <div className="adjacent-sectors">
        {sector.adjacentSectors.map(adj => (
          <button
            key={adj.sectorId}
            className="sector-btn"
            onClick={() => onMoveToSector(adj.sectorId)}
            title={adj.oneWay ? 'One-way route' : 'Two-way route'}
          >
            {adj.sectorId}
            {adj.oneWay && ' →'}
          </button>
        ))}
      </div>

      {sector.players.length > 0 && (
        <>
          <div className="panel-subheader text-warning">Players ({sector.players.length})</div>
          {sector.players.map(p => (
            <div key={p.id} className="panel-row text-warning">{p.username}</div>
          ))}
        </>
      )}

      {sector.outposts.length > 0 && (
        <>
          <div className="panel-subheader">Outposts ({sector.outposts.length})</div>
          {sector.outposts.map(o => (
            <div key={o.id} className="panel-row">{o.name}</div>
          ))}
        </>
      )}

      {sector.planets.length > 0 && (
        <>
          <div className="panel-subheader">Planets ({sector.planets.length})</div>
          {sector.planets.map(p => (
            <div key={p.id} className="panel-row map-planet-row">
              <PixelSprite spriteKey={`planet_${p.planetClass}`} size={16} />
              <span>
                {p.name} [{p.planetClass}]
                {p.ownerId ? ' (claimed)' : ' (unclaimed)'}
              </span>
            </div>
          ))}
        </>
      )}
    </>
  );

  if (bare) return <div className="panel-content">{content}</div>;
  return <CollapsiblePanel title={`NAV MAP - Sector ${sector.sectorId}`}>{content}</CollapsiblePanel>;
}
