import { useRef, useEffect, useState } from 'react';
import type { PlayerState } from '../hooks/useGameState';
import PixelSprite from './PixelSprite';

interface StatusBarProps {
  player: PlayerState | null;
  muted?: boolean;
  onToggleMute?: () => void;
  onLogout?: () => void;
}

/** Wraps a numeric value with a brief flash on change */
function FlashValue({ value, className }: { value: number | string; className?: string }) {
  const prevRef = useRef(value);
  const [flash, setFlash] = useState('');

  useEffect(() => {
    if (prevRef.current !== value) {
      const increased = typeof value === 'number' && typeof prevRef.current === 'number' && value > prevRef.current;
      setFlash(increased ? 'status-flash--gain' : 'status-flash--loss');
      const t = setTimeout(() => setFlash(''), 600);
      prevRef.current = value;
      return () => clearTimeout(t);
    }
  }, [value]);

  return <span className={`${className ?? ''} ${flash}`}>{typeof value === 'number' ? value.toLocaleString() : value}</span>;
}

export default function StatusBar({ player, muted, onToggleMute, onLogout }: StatusBarProps) {
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
        <div className="status-label"><PixelSprite spriteKey="icon_nav" size={9} /> SECTOR</div>
        <div className="status-value">{player.currentSectorId}</div>
      </div>
      <div className="status-section">
        <div className="status-label">ENERGY</div>
        <div className="status-value">
          <FlashValue
            value={player.energy}
            className={player.energy < 50 ? 'text-warning' : 'text-success'}
          />
          /{player.maxEnergy}
        </div>
      </div>
      <div className="status-section">
        <div className="status-label"><PixelSprite spriteKey="icon_trade" size={9} /> CREDITS</div>
        <div className="status-value text-trade"><FlashValue value={player.credits} /></div>
      </div>
      {ship && (
        <>
          <div className="status-section">
            <div className="status-label">SHIP</div>
            <div className="status-value"><PixelSprite spriteKey={`ship_${ship.shipTypeId}`} size={12} /> {ship.shipTypeId}</div>
          </div>
          <div className="status-section">
            <div className="status-label"><PixelSprite spriteKey="icon_combat" size={9} /> WEAPONS</div>
            <div className="status-value text-combat">{ship.weaponEnergy}</div>
          </div>
          <div className="status-section">
            <div className="status-label">ENGINES</div>
            <div className="status-value">{ship.engineEnergy}</div>
          </div>
          <div className="status-section">
            <div className="status-label">HULL</div>
            <div className="status-value">
              <FlashValue
                value={ship.hullHp}
                className={`${ship.hullHp < ship.maxHullHp * 0.25 ? 'text-error hull-critical' : ship.hullHp < ship.maxHullHp * 0.5 ? 'text-warning' : 'text-success'}`}
              />
              /{ship.maxHullHp}
            </div>
          </div>
          <div className="status-section">
            <div className="status-label">CARGO</div>
            <div className="status-value">{totalCargo}/{ship.maxCargoHolds}</div>
          </div>
        </>
      )}
      {player.dockedAtOutpostId && (
        <div className="status-section">
          <div className="status-label">STATUS</div>
          <div className="status-value text-success">DOCKED</div>
        </div>
      )}
      {player.walletAddress && (
        <div className="status-section">
          <div className="status-label">WALLET</div>
          <div className="status-value text-success">
            {player.walletAddress.slice(0, 6)}...{player.walletAddress.slice(-4)}
          </div>
        </div>
      )}
      <div className="status-bar__actions">
        {onToggleMute && (
          <button
            className={`audio-toggle${muted ? ' audio-toggle--muted' : ''}`}
            onClick={onToggleMute}
            title={muted ? 'Unmute audio' : 'Mute audio'}
          >
            {muted ? 'SOUND OFF' : 'SOUND ON'}
          </button>
        )}
        {onLogout && (
          <button
            className="audio-toggle audio-toggle--logout"
            onClick={onLogout}
            title="Logout"
          >
            LOGOUT
          </button>
        )}
      </div>
    </div>
  );
}
