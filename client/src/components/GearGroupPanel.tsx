import { useState } from 'react';
import InventoryPanel from './InventoryPanel';
import TabletsPanel from './TabletsPanel';
import CraftingPanel from './CraftingPanel';
import ShipUpgradesTab from './ShipUpgradesTab';

interface Props {
  refreshKey?: number;
  onItemUsed?: () => void;
  atStarMall?: boolean;
  onCommand?: (cmd: string) => void;
  bare?: boolean;
}

type TabView = 'items' | 'tablets' | 'crafting' | 'upgrades';

export default function GearGroupPanel({ refreshKey, onItemUsed, atStarMall = false, onCommand, bare }: Props) {
  const [tab, setTab] = useState<TabView>('items');
  const [confirmEject, setConfirmEject] = useState(false);

  const handleEject = () => {
    if (!confirmEject) {
      setConfirmEject(true);
      return;
    }
    onCommand?.('eject');
    setConfirmEject(false);
  };

  const tabBar = (
    <div className="group-panel-tabs">
      <span onClick={() => setTab('items')} style={{ cursor: 'pointer', color: tab === 'items' ? '#0f0' : '#666' }}>
        {tab === 'items' ? '[Items]' : 'Items'}
      </span>
      <span style={{ color: '#444', margin: '0 0.5rem' }}>|</span>
      <span onClick={() => setTab('tablets')} style={{ cursor: 'pointer', color: tab === 'tablets' ? '#0f0' : '#666' }}>
        {tab === 'tablets' ? '[Tablets]' : 'Tablets'}
      </span>
      <span style={{ color: '#444', margin: '0 0.5rem' }}>|</span>
      <span onClick={() => setTab('crafting')} style={{ cursor: 'pointer', color: tab === 'crafting' ? '#0f0' : '#666' }}>
        {tab === 'crafting' ? '[Crafting]' : 'Crafting'}
      </span>
      <span style={{ color: '#444', margin: '0 0.5rem' }}>|</span>
      <span onClick={() => setTab('upgrades')} style={{ cursor: 'pointer', color: tab === 'upgrades' ? '#0f0' : '#666' }}>
        {tab === 'upgrades' ? '[Upgrades]' : 'Upgrades'}
      </span>
    </div>
  );

  const content = (
    <>
      {/* Ship Actions */}
      {onCommand && (
        <div className="gear-ship-actions">
          <div className="action-buttons">
            <button className="btn-action" onClick={() => onCommand('cloak')}>CLOAK</button>
            <button className="btn-action" onClick={() => onCommand('refuel')}>REFUEL</button>
            <button
              className={`btn-action${confirmEject ? ' btn-action--combat' : ''}`}
              onClick={handleEject}
            >
              {confirmEject ? 'CONFIRM EJECT?' : 'EJECT'}
            </button>
          </div>
        </div>
      )}
      {tabBar}
      {tab === 'items' && <InventoryPanel refreshKey={refreshKey} onItemUsed={onItemUsed || (() => {})} bare />}
      {tab === 'tablets' && <TabletsPanel refreshKey={refreshKey} bare />}
      {tab === 'crafting' && <CraftingPanel refreshKey={refreshKey} bare />}
      {tab === 'upgrades' && <ShipUpgradesTab refreshKey={refreshKey} atStarMall={atStarMall} onAction={onItemUsed} />}
    </>
  );

  if (bare) return <div className="panel-content">{content}</div>;
  return <div className="panel-content">{content}</div>;
}
