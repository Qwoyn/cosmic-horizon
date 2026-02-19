import { useState, useEffect } from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import PixelSprite from './PixelSprite';
import { getSectorWarpGates, useWarpGate } from '../services/api';
import type { SectorState } from '../hooks/useGameState';

interface WarpGate {
  id: string;
  destinationSectorId: number;
  toll: number;
  ownerName?: string;
}

interface MapPanelProps {
  sector: SectorState | null;
  onMoveToSector: (sectorId: number) => void;
  onCommand?: (cmd: string) => void;
  bare?: boolean;
}

export default function MapPanel({ sector, onMoveToSector, onCommand, bare }: MapPanelProps) {
  const [warpGates, setWarpGates] = useState<WarpGate[]>([]);

  useEffect(() => {
    if (sector) {
      getSectorWarpGates()
        .then(({ data }) => setWarpGates(data.gates || data.warpGates || []))
        .catch(() => setWarpGates([]));
    }
  }, [sector?.sectorId]);

  const handleUseGate = async (gateId: string) => {
    try {
      await useWarpGate(gateId);
      if (onCommand) onCommand('look');
    } catch { /* silent */ }
  };

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

      {warpGates.length > 0 && (
        <>
          <div className="panel-subheader" style={{ color: 'var(--purple)' }}>Warp Gates</div>
          <div className="adjacent-sectors">
            {warpGates.map(g => (
              <button
                key={g.id}
                className="sector-btn"
                onClick={() => handleUseGate(g.id)}
                title={g.toll > 0 ? `Toll: ${g.toll} cr` : 'Free passage'}
                style={{ borderColor: 'var(--purple)' }}
              >
                →{g.destinationSectorId}
                {g.toll > 0 && <span style={{ fontSize: 9, color: 'var(--yellow)', marginLeft: 2 }}>{g.toll}cr</span>}
              </button>
            ))}
          </div>
        </>
      )}

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
