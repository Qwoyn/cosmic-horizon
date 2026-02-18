import ShipStatusPanel from './ShipStatusPanel';
import SectorMap from './SectorMap';
import type { PlayerState, SectorState } from '../hooks/useGameState';
import type { MapData } from './SectorMap';

interface ContextPanelProps {
  player: PlayerState | null;
  sector: SectorState | null;
  mapData: MapData | null;
  onMoveToSector: (sectorId: number) => void;
  onCommand: (cmd: string) => void;
}

export default function ContextPanel({ player, sector, mapData, onMoveToSector, onCommand }: ContextPanelProps) {
  const adjacentSectors = sector?.adjacentSectors || [];
  const hasOutpost = (sector?.outposts?.length ?? 0) > 0;
  const isDocked = !!player?.dockedAtOutpostId;
  const hasTargets = (sector?.players?.length ?? 0) > 0;

  return (
    <div className="context-panel">
      <ShipStatusPanel player={player} />

      <div className="context-panel__map">
        <SectorMap
          mapData={mapData}
          currentSectorId={player?.currentSectorId ?? null}
          adjacentSectorIds={adjacentSectors.map(a => a.sectorId)}
          onMoveToSector={onMoveToSector}
          compact
        />
      </div>

      <div className="context-panel__actions">
        <div className="context-panel__subheader">ACTIONS</div>
        <div className="action-buttons">
          <button className="btn-action" onClick={() => onCommand('look')}>LOOK</button>
          <button className="btn-action" onClick={() => onCommand('scan')}>SCAN</button>
          {hasOutpost && !isDocked && (
            <button className="btn-action btn-action--dock" onClick={() => onCommand('dock')}>DOCK</button>
          )}
          {isDocked && (
            <button className="btn-action btn-action--undock" onClick={() => onCommand('undock')}>UNDOCK</button>
          )}
          {hasTargets && (
            <button className="btn-action btn-action--combat" onClick={() => onCommand('flee')}>FLEE</button>
          )}
        </div>
      </div>

      <div className="context-panel__move">
        <div className="context-panel__subheader">MOVE TO SECTOR</div>
        <div className="move-buttons">
          {adjacentSectors.map(adj => (
            <button
              key={adj.sectorId}
              className="btn-move"
              onClick={() => onMoveToSector(adj.sectorId)}
            >
              {adj.sectorId}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
