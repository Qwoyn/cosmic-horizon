import { useState, useEffect } from 'react';
import { getCantina, buyCantineIntel, talkBartender } from '../services/api';

interface CantinaData {
  rumor?: string;
  intelCost?: number;
  bartenderAvailable?: boolean;
}

interface Props {
  credits: number;
  onAction: () => void;
}

export default function MallCantinaTab({ credits, onAction }: Props) {
  const [data, setData] = useState<CantinaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [intelResult, setIntelResult] = useState<string | null>(null);
  const [dialogueResult, setDialogueResult] = useState<any>(null);

  useEffect(() => {
    getCantina()
      .then(({ data: d }) => setData(d))
      .catch(() => setError('Failed to load cantina'))
      .finally(() => setLoading(false));
  }, []);

  const handleBuyIntel = async () => {
    setBusy(true);
    setError('');
    setIntelResult(null);
    try {
      const { data: result } = await buyCantineIntel();
      setIntelResult(result.intel || result.message || 'Intel acquired.');
      onAction();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to buy intel');
    } finally {
      setBusy(false);
    }
  };

  const handleTalkBartender = async () => {
    setBusy(true);
    setError('');
    setDialogueResult(null);
    try {
      const { data: result } = await talkBartender();
      setDialogueResult(result);
      onAction();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Bartender is busy');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="text-muted">Loading cantina...</div>;

  return (
    <div className="mall-tab-content">
      {error && <div className="mall-error">{error}</div>}
      {data?.rumor && (
        <div className="cantina-rumor">
          <span className="cantina-rumor__label">RUMOR:</span> {data.rumor}
        </div>
      )}
      <div className="cantina-actions">
        <div className="cantina-action">
          <button
            className="btn-sm btn-buy"
            disabled={busy || (data?.intelCost != null && credits < data.intelCost)}
            onClick={handleBuyIntel}
          >
            BUY INTEL
          </button>
          {data?.intelCost != null && <span className="text-muted"> ({data.intelCost} cr)</span>}
        </div>
        {data?.bartenderAvailable !== false && (
          <div className="cantina-action">
            <button
              className="btn-sm btn-primary"
              disabled={busy}
              onClick={handleTalkBartender}
            >
              TALK TO BARTENDER
            </button>
          </div>
        )}
      </div>
      {intelResult && (
        <div className="cantina-result">
          <span className="cantina-result__label">INTEL:</span> {intelResult}
        </div>
      )}
      {dialogueResult && (
        <div className="cantina-result">
          <span className="cantina-result__label">BARTENDER:</span> {dialogueResult.dialogue || dialogueResult.message || 'The bartender nods.'}
          {dialogueResult.mission && (
            <div className="cantina-mission">
              <span className="text-warning">Mission offered: {dialogueResult.mission.title}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
