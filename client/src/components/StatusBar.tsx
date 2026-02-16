import type { PlayerState } from '../hooks/useGameState';

interface StatusBarProps {
  player: PlayerState | null;
  muted?: boolean;
  onToggleMute?: () => void;
}

export default function StatusBar({ player, muted, onToggleMute }: StatusBarProps) {
  if (!player) return null;

  const ship = player.currentShip;
  const totalCargo = ship
    ? ship.cyrilliumCargo + ship.foodCargo + ship.techCargo + ship.colonistsCargo
    : 0;

  return (
    <div className="status-bar">
      <div className="status-section">
        <div className="status-label">PILOT</div>
        <div className="status-value">{player.username}</div>
      </div>
      <div className="status-section">
        <div className="status-label">SECTOR</div>
        <div className="status-value">{player.currentSectorId}</div>
      </div>
      <div className="status-section">
        <div className="status-label">ENERGY</div>
        <div className="status-value">
          <span className={player.energy < 50 ? 'text-warning' : 'text-success'}>
            {player.energy}
          </span>
          /{player.maxEnergy}
        </div>
      </div>
      <div className="status-section">
        <div className="status-label">CREDITS</div>
        <div className="status-value text-trade">{player.credits.toLocaleString()}</div>
      </div>
      {ship && (
        <>
          <div className="status-section">
            <div className="status-label">SHIP</div>
            <div className="status-value">{ship.shipTypeId}</div>
          </div>
          <div className="status-section">
            <div className="status-label">WEAPONS</div>
            <div className="status-value text-combat">{ship.weaponEnergy}</div>
          </div>
          <div className="status-section">
            <div className="status-label">ENGINES</div>
            <div className="status-value">{ship.engineEnergy}</div>
          </div>
          <div className="status-section">
            <div className="status-label">CARGO</div>
            <div className="status-value">{totalCargo}/{ship.maxCargoHolds}</div>
          </div>
        </>
      )}
      {onToggleMute && (
        <button
          className={`audio-toggle${muted ? ' audio-toggle--muted' : ''}`}
          onClick={onToggleMute}
          title={muted ? 'Unmute audio' : 'Mute audio'}
        >
          {muted ? 'SOUND OFF' : 'SOUND ON'}
        </button>
      )}
    </div>
  );
}
