import { useState } from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import { toggleAlliance } from '../services/api';
import type { SectorState } from '../hooks/useGameState';

interface Props {
  sector: SectorState | null;
  onFire: (targetPlayerId: string, energy: number) => void;
  alliedPlayerIds?: string[];
  onAllianceChange?: () => void;
  bare?: boolean;
}

export default function PlayerListPanel({ sector, onFire, alliedPlayerIds = [], onAllianceChange, bare }: Props) {
  const players = sector?.players || [];
  const [togglingAlly, setTogglingAlly] = useState<string | null>(null);

  const handleAllyToggle = async (playerId: string) => {
    setTogglingAlly(playerId);
    try {
      await toggleAlliance(playerId);
      onAllianceChange?.();
    } catch { /* silently fail */ }
    setTogglingAlly(null);
  };

  const content = players.length === 0 ? (
    <div className="text-muted">No other players in sector</div>
  ) : (
    <>
      {players.map(p => {
        const isAllied = alliedPlayerIds.includes(p.id);
        return (
          <div key={p.id} className="player-list-item">
            <span className="player-list-item__name">{p.username}</span>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <button
                className={`btn-sm btn-ally ${isAllied ? 'btn-ally--active' : ''}`}
                onClick={() => handleAllyToggle(p.id)}
                disabled={togglingAlly === p.id}
                title={isAllied ? 'Cancel alliance' : 'Form alliance'}
              >
                {isAllied ? 'ALLIED' : 'ALLY'}
              </button>
              <button
                className="btn-sm btn-fire"
                onClick={() => onFire(p.id, 5)}
                title="Quick attack (5 energy)"
              >
                Fire
              </button>
            </div>
          </div>
        );
      })}
    </>
  );

  if (bare) return <div className="panel-content">{content}</div>;
  return <CollapsiblePanel title="PLAYERS" badge={players.length || null}>{content}</CollapsiblePanel>;
}
