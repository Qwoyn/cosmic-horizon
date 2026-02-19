import { useState, useEffect } from 'react';
import { getSyndicateStructures } from '../services/api';

interface Structure {
  id: string;
  type: string;
  name: string;
  sectorId: number;
  hp: number;
  maxHp: number;
  active: boolean;
}

interface Props {
  refreshKey?: number;
  bare?: boolean;
}

export default function SyndicateStructuresPanel({ refreshKey, bare }: Props) {
  const [structures, setStructures] = useState<Structure[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSyndicateStructures()
      .then(({ data }) => {
        setStructures(data.structures || []);
        setError(null);
      })
      .catch(() => setError('Not in a syndicate'));
  }, [refreshKey]);

  if (error) {
    const content = <div className="text-muted">{error}</div>;
    if (bare) return <div className="panel-content">{content}</div>;
    return <div className="panel-content">{content}</div>;
  }

  const hpPct = (hp: number, max: number) => max > 0 ? Math.round((hp / max) * 100) : 0;

  const content = (
    <>
      <div className="panel-subheader">Syndicate Structures</div>
      {structures.length === 0 ? (
        <div className="text-muted">No structures built.</div>
      ) : (
        structures.map(s => (
          <div key={s.id} className="resource-event-item">
            <div className="resource-event-item__header">
              <span className="resource-event-item__type">{s.name || s.type}</span>
              <span style={{ color: s.active ? 'var(--green)' : 'var(--red)', fontSize: 10, textTransform: 'uppercase' }}>
                {s.active ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            <div className="panel-row" style={{ fontSize: 11 }}>
              <span className="panel-label">Sector:</span>
              <span>{s.sectorId}</span>
            </div>
            <div style={{ marginTop: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
                <span>HP</span>
                <span>{s.hp}/{s.maxHp}</span>
              </div>
              <div className="guardian-hp-bar">
                <div className="guardian-hp-bar__fill" style={{ width: `${hpPct(s.hp, s.maxHp)}%` }} />
              </div>
            </div>
          </div>
        ))
      )}
    </>
  );

  if (bare) return <div className="panel-content">{content}</div>;
  return <div className="panel-content">{content}</div>;
}
