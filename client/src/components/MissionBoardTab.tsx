import { useState, useEffect } from 'react';
import { getAvailableMissions, acceptMission } from '../services/api';

interface AvailableMission {
  id: string;
  templateId: string;
  title: string;
  description: string;
  type: string;
  tier: number;
  rewardCredits: number;
  rewardXP?: number;
  prerequisites?: string[];
  locked?: boolean;
}

interface Props {
  atStarMall: boolean;
  onAction?: () => void;
}

export default function MissionBoardTab({ atStarMall, onAction }: Props) {
  const [missions, setMissions] = useState<AvailableMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const fetchMissions = () => {
    setLoading(true);
    getAvailableMissions()
      .then(({ data }) => setMissions(data.missions || []))
      .catch(() => setError('Failed to load missions'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (atStarMall) fetchMissions();
    else setLoading(false);
  }, [atStarMall]);

  const handleAccept = async (templateId: string) => {
    setBusy(templateId);
    setError('');
    try {
      await acceptMission(templateId);
      fetchMissions();
      onAction?.();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to accept mission');
    } finally {
      setBusy(null);
    }
  };

  if (!atStarMall) {
    return <div className="text-muted">Dock at a Star Mall to browse missions.</div>;
  }

  if (loading) return <div className="text-muted">Loading mission board...</div>;

  // Group by tier
  const tiers = new Map<number, AvailableMission[]>();
  missions.forEach(m => {
    const t = m.tier || 1;
    if (!tiers.has(t)) tiers.set(t, []);
    tiers.get(t)!.push(m);
  });

  return (
    <div>
      {error && <div className="mall-error">{error}</div>}
      {missions.length === 0 ? (
        <div className="text-muted">No missions available right now.</div>
      ) : (
        Array.from(tiers.entries()).sort((a, b) => a[0] - b[0]).map(([tier, list]) => (
          <div key={tier}>
            <div className="panel-subheader">Tier {tier}</div>
            {list.map(m => {
              const id = m.templateId || m.id;
              return (
                <div key={id} className={`mission-item${m.locked ? ' mission-item--locked' : ''}`}>
                  <div className="mission-item__title">{m.title}</div>
                  <div className="mission-item__progress">
                    <span className="text-muted">{m.description}</span>
                    <span className="mission-item__reward">+{m.rewardCredits} cr</span>
                  </div>
                  {m.locked ? (
                    <div className="text-muted" style={{ fontSize: '10px' }}>Prerequisites not met</div>
                  ) : (
                    <button
                      className="btn-sm btn-buy"
                      disabled={busy === id}
                      onClick={() => handleAccept(id)}
                      style={{ marginTop: '4px' }}
                    >
                      {busy === id ? '...' : 'ACCEPT'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}
