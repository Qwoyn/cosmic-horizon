import CollapsiblePanel from './CollapsiblePanel';
import PixelSprite from './PixelSprite';
import type { PlayerState } from '../hooks/useGameState';

interface Props {
  player: PlayerState | null;
}

export default function ShipStatusPanel({ player }: Props) {
  const ship = player?.currentShip;
  if (!ship) {
    return (
      <CollapsiblePanel title="SHIP STATUS">
        <div className="panel-row text-muted">No active ship</div>
      </CollapsiblePanel>
    );
  }

  const totalCargo = ship.cyrilliumCargo + ship.foodCargo + ship.techCargo + ship.colonistsCargo;
  const cargoPercent = ship.maxCargoHolds > 0 ? Math.round((totalCargo / ship.maxCargoHolds) * 100) : 0;

  return (
    <CollapsiblePanel title="SHIP STATUS">
      <div className="ship-status-sprite-header">
        <PixelSprite spriteKey={`ship_${ship.shipTypeId}`} size={48} className="ship-status-sprite" />
        <div className="ship-status-sprite-header__info">
          <div className="panel-row">
            <span className="panel-label">Type:</span>
            <span>{ship.shipTypeId}</span>
          </div>
          <div className="panel-row">
            <span className="panel-label">Weapons:</span>
            <span className="text-combat">{ship.weaponEnergy}</span>
          </div>
          <div className="panel-row">
            <span className="panel-label">Engines:</span>
            <span className="text-info">{ship.engineEnergy}</span>
          </div>
        </div>
      </div>

      <div className="panel-subheader">Cargo [{totalCargo}/{ship.maxCargoHolds}]</div>
      <div className="cargo-bar">
        <div className="cargo-bar__fill" style={{ width: `${Math.min(100, cargoPercent)}%` }} />
      </div>
      <div className="cargo-breakdown">
        {ship.cyrilliumCargo > 0 && <span className="cargo-item cargo-item--cyr">Cyr: {ship.cyrilliumCargo}</span>}
        {ship.foodCargo > 0 && <span className="cargo-item cargo-item--food">Food: {ship.foodCargo}</span>}
        {ship.techCargo > 0 && <span className="cargo-item cargo-item--tech">Tech: {ship.techCargo}</span>}
        {ship.colonistsCargo > 0 && <span className="cargo-item cargo-item--col">Col: {ship.colonistsCargo}</span>}
        {totalCargo === 0 && <span className="text-muted">Empty</span>}
      </div>
    </CollapsiblePanel>
  );
}
