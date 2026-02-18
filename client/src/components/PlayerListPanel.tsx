import CollapsiblePanel from './CollapsiblePanel';
import type { SectorState } from '../hooks/useGameState';

interface Props {
  sector: SectorState | null;
  onFire: (targetPlayerId: string, energy: number) => void;
}

export default function PlayerListPanel({ sector, onFire }: Props) {
  const players = sector?.players || [];

  return (
    <CollapsiblePanel title="PLAYERS" badge={players.length || null}>
      {players.length === 0 ? (
        <div className="text-muted">No other players in sector</div>
      ) : (
        players.map(p => (
          <div key={p.id} className="player-list-item">
            <span className="player-list-item__name">{p.username}</span>
            <button
              className="btn-sm btn-fire"
              onClick={() => onFire(p.id, 5)}
              title="Quick attack (5 energy)"
            >
              Fire
            </button>
          </div>
        ))
      )}
    </CollapsiblePanel>
  );
}
