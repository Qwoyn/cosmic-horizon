import { useState } from 'react';
import { refuel } from '../services/api';

interface Props {
  energy: number;
  maxEnergy: number;
  credits: number;
  onAction: () => void;
}

export default function MallRefuelTab({ energy, maxEnergy, credits, onAction }: Props) {
  const [qty, setQty] = useState(50);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState('');

  const costPerUnit = 2; // Standard refuel cost
  const maxRefuel = maxEnergy - energy;
  const estimatedCost = qty * costPerUnit;

  const handleRefuel = async () => {
    setBusy(true);
    setError('');
    setResult('');
    try {
      const { data } = await refuel(qty);
      setResult(`Refueled ${data.quantity || qty} energy. Cost: ${data.cost || estimatedCost} cr`);
      onAction();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Refuel failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mall-tab-content">
      <div className="refuel-status">
        <div className="refuel-bar-label">
          Energy: <span className={energy < maxEnergy * 0.25 ? 'text-error' : energy < maxEnergy * 0.5 ? 'text-warning' : 'text-success'}>
            {energy}
          </span> / {maxEnergy}
        </div>
        <div className="cargo-bar" style={{ marginBottom: '8px' }}>
          <div className="cargo-bar__fill" style={{ width: `${(energy / maxEnergy) * 100}%`, background: 'var(--green)' }} />
        </div>
      </div>
      <div className="refuel-controls">
        <label>Quantity:</label>
        <input
          type="number"
          className="qty-input"
          min={1}
          max={maxRefuel}
          value={qty}
          onChange={e => setQty(Math.max(1, Math.min(maxRefuel, parseInt(e.target.value) || 1)))}
        />
        <button className="btn-sm" onClick={() => setQty(maxRefuel)} style={{ color: 'var(--cyan)', borderColor: 'var(--cyan)' }}>
          MAX
        </button>
      </div>
      <div className="refuel-cost">
        Estimated cost: <span className="text-trade">{estimatedCost.toLocaleString()} cr</span>
      </div>
      <div className="mall-tab-credits">Available: <span className="text-trade">{credits.toLocaleString()} cr</span></div>
      {error && <div className="mall-error">{error}</div>}
      {result && <div className="mall-success">{result}</div>}
      <button
        className="btn btn-buy"
        disabled={busy || qty <= 0 || energy >= maxEnergy}
        onClick={handleRefuel}
        style={{ marginTop: '8px' }}
      >
        {busy ? 'REFUELING...' : 'REFUEL'}
      </button>
    </div>
  );
}
