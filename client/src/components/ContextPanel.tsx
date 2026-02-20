import { useState, useEffect } from 'react';
import ShipStatusPanel from './ShipStatusPanel';
import SectorMap from './SectorMap';
import type { PlayerState, SectorState } from '../hooks/useGameState';
import type { MapData } from './SectorMap';
import type { PanelId } from '../types/panels';
import { getResourceEvents } from '../services/api';

interface ResourceEvent {
  id: string;
  type: string;
  claimed?: boolean;
  guardian_hp?: number;
}

interface ContextPanelProps {
  player: PlayerState | null;
  sector: SectorState | null;
  mapData: MapData | null;
  onMoveToSector: (sectorId: number) => void;
  onCommand: (cmd: string) => void;
  onSelectPanel?: (panelId: PanelId) => void;
}

export default function ContextPanel({ player, sector, mapData, onMoveToSector, onCommand, onSelectPanel }: ContextPanelProps) {
  const adjacentSectors = sector?.adjacentSectors || [];
  const hasOutpost = (sector?.outposts?.length ?? 0) > 0;
  const isDocked = !!player?.dockedAtOutpostId;
  const hasTargets = (sector?.players?.length ?? 0) > 0;
  const npcs = sector?.npcs || [];
  const variantPlanets = (sector?.planets || []).filter(p => p.planetClass === 'S' || p.planetClass === 'G');

  const [resourceEvents, setResourceEvents] = useState<ResourceEvent[]>([]);

  useEffect(() => {
    getResourceEvents()
      .then(({ data }) => setResourceEvents(data.resourceEvents || []))
      .catch(() => setResourceEvents([]));
  }, [player?.currentSectorId]);

  const hasResourceEvents = resourceEvents.length > 0;
  const hasAlienCache = resourceEvents.some(e => e.type === 'alien_cache' && e.guardian_hp != null && e.guardian_hp > 0);
  const hasHarvestable = resourceEvents.some(e => e.type === 'asteroid_field' || e.type === 'anomaly');
  const hasSalvageable = resourceEvents.some(e => e.type === 'derelict' && !e.claimed);
  const showAlerts = hasResourceEvents || variantPlanets.length > 0 || npcs.length > 0;

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

      {showAlerts && (
        <div className="context-panel__alerts">
          <div className="context-panel__subheader">SECTOR ALERTS</div>
          <div className="alert-items">
            {hasResourceEvents && (
              <div className="alert-item alert-item--resource" onClick={() => onSelectPanel?.('explore')}>
                {resourceEvents.length} resource event{resourceEvents.length !== 1 ? 's' : ''} detected
              </div>
            )}
            {hasAlienCache && (
              <div className="alert-item alert-item--danger" onClick={() => onSelectPanel?.('explore')}>
                Alien cache guardian active
              </div>
            )}
            {variantPlanets.length > 0 && (
              <div className="alert-item alert-item--special" onClick={() => onSelectPanel?.('planets')}>
                {variantPlanets.length} variant planet{variantPlanets.length !== 1 ? 's' : ''}
              </div>
            )}
            {npcs.length > 0 && (
              <div className="alert-item alert-item--npc" onClick={() => onSelectPanel?.('crew')}>
                {npcs.length} NPC{npcs.length !== 1 ? 's' : ''} present
              </div>
            )}
          </div>
        </div>
      )}

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
          {hasHarvestable && (
            <button className="btn-action btn-action--harvest" onClick={() => onSelectPanel?.('explore')}>HARVEST</button>
          )}
          {hasSalvageable && (
            <button className="btn-action btn-action--salvage" onClick={() => onSelectPanel?.('explore')}>SALVAGE</button>
          )}
          {hasAlienCache && (
            <button className="btn-action btn-action--attack" onClick={() => onSelectPanel?.('explore')}>ATTACK</button>
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
