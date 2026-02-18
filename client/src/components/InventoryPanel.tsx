import { useState, useEffect } from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import PixelSprite from './PixelSprite';
import { getInventory, useStoreItem } from '../services/api';

interface InventoryItem {
  id: string;
  itemId: string;
  name: string;
}

interface Props {
  refreshKey?: number;
  onItemUsed: () => void;
  bare?: boolean;
}

export default function InventoryPanel({ refreshKey, onItemUsed, bare }: Props) {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [using, setUsing] = useState<string | null>(null);

  useEffect(() => {
    getInventory()
      .then(({ data }) => setItems(data.inventory || []))
      .catch(() => setItems([]));
  }, [refreshKey]);

  const handleUse = async (itemId: string) => {
    setUsing(itemId);
    try {
      await useStoreItem(itemId);
      onItemUsed();
      // Re-fetch inventory
      const { data } = await getInventory();
      setItems(data.inventory || []);
    } catch {
      // Handled silently
    } finally {
      setUsing(null);
    }
  };

  const content = items.length === 0 ? (
    <div className="text-muted">No items</div>
  ) : (
    <>
      {items.map(item => (
        <div key={item.id} className="inventory-item">
          <span className="inventory-item__name"><PixelSprite spriteKey={`item_${item.itemId}`} size={16} />{item.name}</span>
          <button
            className="btn-sm btn-use"
            onClick={() => handleUse(item.itemId)}
            disabled={using === item.itemId}
          >
            {using === item.itemId ? '...' : 'Use'}
          </button>
        </div>
      ))}
    </>
  );

  if (bare) return <div className="panel-content">{content}</div>;
  return <CollapsiblePanel title="INVENTORY" badge={items.length || null}>{content}</CollapsiblePanel>;
}
