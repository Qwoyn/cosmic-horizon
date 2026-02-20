import { useState } from 'react';
import InventoryPanel from './InventoryPanel';
import TabletsPanel from './TabletsPanel';
import CraftingPanel from './CraftingPanel';

interface Props {
  refreshKey?: number;
  onItemUsed?: () => void;
  bare?: boolean;
}

type TabView = 'items' | 'tablets' | 'crafting';

export default function GearGroupPanel({ refreshKey, onItemUsed, bare }: Props) {
  const [tab, setTab] = useState<TabView>('items');

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
    </div>
  );

  const content = (
    <>
      {tabBar}
      {tab === 'items' && <InventoryPanel refreshKey={refreshKey} onItemUsed={onItemUsed || (() => {})} bare />}
      {tab === 'tablets' && <TabletsPanel refreshKey={refreshKey} bare />}
      {tab === 'crafting' && <CraftingPanel refreshKey={refreshKey} bare />}
    </>
  );

  if (bare) return <div className="panel-content">{content}</div>;
  return <div className="panel-content">{content}</div>;
}
