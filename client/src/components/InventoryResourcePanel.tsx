import { useState, useEffect } from 'react';
import PixelSprite from './PixelSprite';
import { getInventory, getPlayerResources, useStoreItem } from '../services/api';

interface InventoryItem {
  id: string;
  itemId: string;
  name: string;
}

interface PlayerResource {
  id: string;
  name: string;
  quantity: number;
}

type LineType = 'info' | 'success' | 'error' | 'warning' | 'system' | 'combat' | 'trade';

interface Props {
  refreshKey?: number;
  onAddLine?: (text: string, type?: LineType) => void;
  onRefreshStatus?: () => void;
}

type TabView = 'items' | 'resources';

export default function InventoryResourcePanel({ refreshKey, onAddLine, onRefreshStatus }: Props) {
  const [tab, setTab] = useState<TabView>('items');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [resources, setResources] = useState<PlayerResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingItem, setUsingItem] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getInventory().then(({ data }) => setItems(data.inventory || [])).catch(() => setItems([])),
      getPlayerResources().then(({ data }) => setResources(data.resources || [])).catch(() => setResources([])),
    ]).finally(() => setLoading(false));
  }, [refreshKey]);

  const handleUse = async (item: InventoryItem) => {
    setUsingItem(item.itemId);
    try {
      await useStoreItem(item.itemId);
      onAddLine?.(`Used ${item.name}`, 'success');
      onRefreshStatus?.();
      const { data } = await getInventory();
      setItems(data.inventory || []);
    } catch (err: any) {
      onAddLine?.(err.response?.data?.error || `Failed to use ${item.name}`, 'error');
    } finally {
      setUsingItem(null);
    }
  };

  // Group items by name for stacking display
  const groupedItems = items.reduce<Record<string, { item: InventoryItem; count: number }>>((acc, item) => {
    const key = item.itemId;
    if (!acc[key]) {
      acc[key] = { item, count: 0 };
    }
    acc[key].count++;
    return acc;
  }, {});

  if (loading) {
    return <div className="panel-content"><div className="text-muted">Loading...</div></div>;
  }

  return (
    <div className="panel-content">
      <div className="group-panel-tabs">
        <span onClick={() => setTab('items')} style={{ cursor: 'pointer', color: tab === 'items' ? '#0f0' : '#666' }}>
          {tab === 'items' ? `[Items (${items.length})]` : `Items (${items.length})`}
        </span>
        <span style={{ color: '#444', margin: '0 0.5rem' }}>|</span>
        <span onClick={() => setTab('resources')} style={{ cursor: 'pointer', color: tab === 'resources' ? '#0f0' : '#666' }}>
          {tab === 'resources' ? `[Resources (${resources.length})]` : `Resources (${resources.length})`}
        </span>
      </div>

      {tab === 'items' && (
        Object.keys(groupedItems).length === 0 ? (
          <div className="text-muted" style={{ marginTop: 8 }}>
            No items. Buy items at Star Mall stores.
          </div>
        ) : (
          <div className="inventory-list">
            {Object.values(groupedItems).map(({ item, count }) => (
              <div key={item.itemId} className="inventory-item">
                <span className="inventory-item__name">
                  <PixelSprite spriteKey={`item_${item.itemId}`} size={16} />
                  {item.name}
                  {count > 1 && <span className="inventory-item__count"> x{count}</span>}
                </span>
                <button
                  className="btn-sm btn-use"
                  onClick={() => handleUse(item)}
                  disabled={usingItem === item.itemId}
                >
                  {usingItem === item.itemId ? '...' : 'USE'}
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'resources' && (
        resources.length === 0 ? (
          <div className="text-muted" style={{ marginTop: 8 }}>
            No resources collected. Harvest asteroid fields, salvage derelicts, or collect from planets.
          </div>
        ) : (
          <div className="inventory-list">
            {resources.map(r => (
              <div key={r.id} className="inventory-item">
                <span className="inventory-item__name">{r.name}</span>
                <span className="inventory-item__qty">x{r.quantity}</span>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
