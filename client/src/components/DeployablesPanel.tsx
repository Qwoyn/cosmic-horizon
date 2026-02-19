import { useState, useEffect } from 'react';
import { getSectorDeployables, getMyDeployables, maintainDeployable, removeDeployable } from '../services/api';

interface Deployable {
  id: string;
  type: string;
  ownerName?: string;
  ownerId?: string;
  sectorId: number;
  createdAt: string;
  message?: string;
  toll?: number;
}

interface Props {
  refreshKey?: number;
  bare?: boolean;
}

export default function DeployablesPanel({ refreshKey, bare }: Props) {
  const [sectorDeployables, setSectorDeployables] = useState<Deployable[]>([]);
  const [myDeployables, setMyDeployables] = useState<Deployable[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    getSectorDeployables()
      .then(({ data }) => setSectorDeployables(data.deployables || []))
      .catch(() => setSectorDeployables([]));

    getMyDeployables()
      .then(({ data }) => setMyDeployables(data.deployables || []))
      .catch(() => setMyDeployables([]));
  }, [refreshKey]);

  const handleMaintain = async (id: string) => {
    setBusy(id);
    try {
      await maintainDeployable(id);
      const { data } = await getMyDeployables();
      setMyDeployables(data.deployables || []);
    } catch { /* silent */ } finally { setBusy(null); }
  };

  const handleRemove = async (id: string) => {
    setBusy(id);
    try {
      await removeDeployable(id);
      const { data } = await getMyDeployables();
      setMyDeployables(data.deployables || []);
      const res = await getSectorDeployables();
      setSectorDeployables(res.data.deployables || []);
    } catch { /* silent */ } finally { setBusy(null); }
  };

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const typeColor = (type: string) => {
    if (type === 'mine') return 'var(--red)';
    if (type === 'drone') return 'var(--blue)';
    if (type === 'buoy') return 'var(--yellow)';
    return 'var(--grey)';
  };

  const content = (
    <>
      <div className="panel-subheader">In Sector</div>
      {sectorDeployables.length === 0 ? (
        <div className="text-muted">No deployables in this sector.</div>
      ) : (
        sectorDeployables.map(d => (
          <div key={d.id} className="panel-row" style={{ justifyContent: 'space-between', fontSize: 11 }}>
            <span>
              <span style={{ color: typeColor(d.type), textTransform: 'uppercase' }}>{d.type}</span>
              {d.ownerName && <span className="text-muted"> ({d.ownerName})</span>}
            </span>
            {d.message && <span className="text-muted" style={{ fontSize: 10 }}>{d.message}</span>}
          </div>
        ))
      )}

      <div className="panel-subheader">My Deployables</div>
      {myDeployables.length === 0 ? (
        <div className="text-muted">You have no deployables.</div>
      ) : (
        myDeployables.map(d => (
          <div key={d.id} className="resource-event-item">
            <div className="resource-event-item__header">
              <span style={{ color: typeColor(d.type), textTransform: 'uppercase', fontSize: 11 }}>{d.type}</span>
              <span className="text-muted" style={{ fontSize: 10 }}>Sector {d.sectorId} · {formatDate(d.createdAt)}</span>
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
              <button className="btn-sm btn-buy" onClick={() => handleMaintain(d.id)} disabled={busy === d.id}>
                {busy === d.id ? '...' : 'MAINTAIN'}
              </button>
              <button className="btn-sm btn-sell" onClick={() => handleRemove(d.id)} disabled={busy === d.id}>
                REMOVE
              </button>
            </div>
          </div>
        ))
      )}
    </>
  );

  if (bare) return <div className="panel-content">{content}</div>;
  return <div className="panel-content">{content}</div>;
}
