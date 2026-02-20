import { useState, useEffect } from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import { getTablets, equipTablet, unequipTablet, combineTablets, tradeTablet } from '../services/api';

interface Tablet {
  id: string;
  name: string;
  rarity: number;
  effect: string;
  equippedSlot: number | null;
}

interface Props {
  refreshKey?: number;
  bare?: boolean;
}

export default function TabletsPanel({ refreshKey, bare }: Props) {
  const [tablets, setTablets] = useState<Tablet[]>([]);
  const [combineSelected, setCombineSelected] = useState<Set<string>>(new Set());
  const [tradeName, setTradeName] = useState('');
  const [tradeTabletId, setTradeTabletId] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const fetchTablets = () => {
    getTablets()
      .then(({ data }) => setTablets(data.tablets || []))
      .catch(() => setTablets([]));
  };

  useEffect(fetchTablets, [refreshKey]);

  const equipped = [1, 2, 3].map(slot => tablets.find(t => t.equippedSlot === slot) || null);
  const unequipped = tablets.filter(t => t.equippedSlot == null);

  const rarityStars = (r: number) => '\u2605'.repeat(Math.min(r, 3));

  const handleEquip = async (tabletId: string, slot: number) => {
    setBusy(`equip-${tabletId}-${slot}`);
    try { await equipTablet(tabletId, slot); fetchTablets(); } catch { /* silent */ } finally { setBusy(null); }
  };

  const handleUnequip = async (slot: number) => {
    setBusy(`unequip-${slot}`);
    try { await unequipTablet(slot); fetchTablets(); } catch { /* silent */ } finally { setBusy(null); }
  };

  const handleCombine = async () => {
    const ids = [...combineSelected];
    if (ids.length < 2) return;
    setBusy('combine');
    try {
      await combineTablets(ids);
      setCombineSelected(new Set());
      fetchTablets();
    } catch { /* silent */ } finally { setBusy(null); }
  };

  const handleTrade = async () => {
    if (!tradeName.trim() || !tradeTabletId) return;
    setBusy('trade');
    try {
      await tradeTablet(tradeName.trim(), tradeTabletId);
      setTradeName('');
      setTradeTabletId('');
      fetchTablets();
    } catch { /* silent */ } finally { setBusy(null); }
  };

  const toggleCombineSelect = (id: string) => {
    setCombineSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const equippedSlots = (
    <div>
      <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>EQUIPPED SLOTS</div>
      <div className="tablet-equip-slots">
        {equipped.map((t, i) => (
          <div key={i} className={`tablet-slot ${t ? 'tablet-slot--equipped' : ''}`}>
            <div className="tablet-slot__label">Slot {i + 1}</div>
            {t ? (
              <>
                <div className="tablet-slot__name">{t.name}</div>
                <div className="tablet-slot__rarity">{rarityStars(t.rarity)}</div>
                <button className="btn-sm" onClick={() => handleUnequip(i + 1)} disabled={busy === `unequip-${i + 1}`} style={{ marginTop: 4 }}>
                  {busy === `unequip-${i + 1}` ? '...' : 'UNEQUIP'}
                </button>
              </>
            ) : (
              <div className="text-muted" style={{ marginTop: 4 }}>Empty</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const inventorySection = (
    <CollapsiblePanel title="INVENTORY" defaultOpen badge={unequipped.length || null}>
      {unequipped.length === 0 ? (
        <div className="text-muted">No tablets in inventory</div>
      ) : (
        <>
          {unequipped.map(t => (
            <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid var(--bg-tertiary)', fontSize: 12 }}>
              <div>
                <span style={{ color: 'var(--yellow)' }}>{rarityStars(t.rarity)}</span>{' '}
                <span style={{ color: 'var(--text-primary)' }}>{t.name}</span>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{t.effect}</div>
              </div>
              <div style={{ display: 'flex', gap: 2 }}>
                {[1, 2, 3].map(slot => (
                  <button key={slot} className="btn-sm" onClick={() => handleEquip(t.id, slot)} disabled={busy === `equip-${t.id}-${slot}`} title={`Equip to slot ${slot}`}>
                    {busy === `equip-${t.id}-${slot}` ? '..' : `\u2192${slot}`}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </CollapsiblePanel>
  );

  const combineSection = (
    <CollapsiblePanel title="COMBINE" defaultOpen={false}>
      <div className="tablet-checkbox-list">
        {unequipped.map(t => (
          <label key={t.id} className="tablet-checkbox-item">
            <input type="checkbox" checked={combineSelected.has(t.id)} onChange={() => toggleCombineSelect(t.id)} />
            <span>{rarityStars(t.rarity)} {t.name}</span>
          </label>
        ))}
      </div>
      <button
        className="btn-sm btn-buy"
        style={{ marginTop: 8 }}
        disabled={combineSelected.size < 2 || busy === 'combine'}
        onClick={handleCombine}
      >
        {busy === 'combine' ? '...' : 'COMBINE SELECTED'}
      </button>
    </CollapsiblePanel>
  );

  const tradeSection = (
    <CollapsiblePanel title="TRADE" defaultOpen={false}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <select className="planet-selector" value={tradeTabletId} onChange={e => setTradeTabletId(e.target.value)}>
          <option value="">Select tablet...</option>
          {unequipped.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <input
          type="text"
          placeholder="Player name..."
          value={tradeName}
          onChange={e => setTradeName(e.target.value)}
          style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', padding: '2px 6px', fontSize: 11, fontFamily: 'inherit', borderRadius: 3 }}
        />
        <button className="btn-sm btn-buy" disabled={!tradeName.trim() || !tradeTabletId || busy === 'trade'} onClick={handleTrade}>
          {busy === 'trade' ? '...' : 'SEND'}
        </button>
      </div>
    </CollapsiblePanel>
  );

  const content = (
    <>
      {equippedSlots}
      {inventorySection}
      {combineSection}
      {tradeSection}
    </>
  );

  if (bare) return <div className="panel-content">{content}</div>;
  return <CollapsiblePanel title="TABLETS">{content}</CollapsiblePanel>;
}
