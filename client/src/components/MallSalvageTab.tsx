import { useState, useEffect } from 'react';
import { getSalvageOptions, salvageShip } from '../services/api';

interface SalvageOption {
  id: string;
  shipTypeId: string;
  name?: string;
  salvageValue: number;
  hasCargo: boolean;
}

interface Props {
  onAction: () => void;
}

export default function MallSalvageTab({ onAction }: Props) {
  const [options, setOptions] = useState<SalvageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const fetchOptions = () => {
    setLoading(true);
    getSalvageOptions()
      .then(({ data }) => setOptions(data.ships || []))
      .catch(() => setError('Failed to load salvage options'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOptions(); }, []);

  const handleSalvage = async (shipId: string) => {
    setBusy(shipId);
    setError('');
    try {
      await salvageShip(shipId);
      fetchOptions();
      onAction();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Salvage failed');
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <div className="text-muted">Loading salvage yard...</div>;

  return (
    <div className="mall-tab-content">
      {error && <div className="mall-error">{error}</div>}
      {options.length === 0 ? (
        <div className="text-muted">No ships available for salvage.</div>
      ) : (
        <div className="mall-item-list">
          {options.map(ship => (
            <div key={ship.id} className="mall-item">
              <div className="mall-item__info">
                <span className="mall-item__name">
                  {ship.name || ship.shipTypeId}
                  {ship.hasCargo && <span className="mall-item__badge-warn"> HAS CARGO</span>}
                </span>
              </div>
              <div className="mall-item__action">
                <span className="mall-item__price text-success">+{ship.salvageValue.toLocaleString()} cr</span>
                <button
                  className="btn-sm btn-sell"
                  disabled={busy === ship.id}
                  onClick={() => handleSalvage(ship.id)}
                >
                  {busy === ship.id ? '...' : 'SALVAGE'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
