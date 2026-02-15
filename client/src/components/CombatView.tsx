import { useState } from 'react';
import type { SectorState } from '../hooks/useGameState';

interface CombatViewProps {
  sector: SectorState | null;
  onFire: (targetPlayerId: string, energy: number) => void;
  onFlee: () => void;
  weaponEnergy: number;
}

export default function CombatView({ sector, onFire, onFlee, weaponEnergy }: CombatViewProps) {
  const [energy, setEnergy] = useState(10);
  const [target, setTarget] = useState<string>('');

  const players = sector?.players || [];

  if (players.length === 0) {
    return null; // No combat panel when alone
  }

  return (
    <div className="panel panel-combat">
      <div className="panel-header text-combat">COMBAT</div>
      <div className="panel-body">
        <div className="panel-subheader text-warning">Targets in sector</div>
        {players.map(p => (
          <div
            key={p.id}
            className={`panel-row target-row ${target === p.id ? 'selected' : ''}`}
            onClick={() => setTarget(p.id)}
          >
            {p.username}
          </div>
        ))}

        {target && (
          <div className="combat-controls">
            <div className="panel-row">
              <label>Energy:</label>
              <input
                type="number"
                min={1}
                max={weaponEnergy}
                value={energy}
                onChange={e => setEnergy(Math.max(1, parseInt(e.target.value) || 1))}
                className="qty-input"
              />
              <span className="text-muted">/ {weaponEnergy}</span>
            </div>
            <div className="combat-buttons">
              <button className="btn btn-fire" onClick={() => onFire(target, energy)}>
                FIRE ({energy} energy)
              </button>
              <button className="btn btn-flee" onClick={onFlee}>
                FLEE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
