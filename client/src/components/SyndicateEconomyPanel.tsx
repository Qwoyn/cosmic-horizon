import { useState, useEffect } from 'react';
import { getSyndicatePool, getSyndicateFactory } from '../services/api';

interface PoolResource {
  resourceId: string;
  name: string;
  quantity: number;
}

interface PoolPermission {
  playerId: string;
  username: string;
  level: string;
}

interface Factory {
  planetId: string;
  planetName: string;
  planetClass: string;
  upgradeLevel: number;
  boostedProduction: number;
}

interface Props {
  refreshKey?: number;
  bare?: boolean;
}

export default function SyndicateEconomyPanel({ refreshKey, bare }: Props) {
  const [poolResources, setPoolResources] = useState<PoolResource[]>([]);
  const [permissions, setPermissions] = useState<PoolPermission[]>([]);
  const [factory, setFactory] = useState<Factory | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSyndicatePool()
      .then(({ data }) => {
        setPoolResources(data.resources || []);
        setPermissions(data.permissions || []);
        setError(null);
      })
      .catch(() => setError('Not in a syndicate or no pool data'));

    getSyndicateFactory()
      .then(({ data }) => {
        if (data.factory) setFactory(data.factory);
        else setFactory(null);
      })
      .catch(() => setFactory(null));
  }, [refreshKey]);

  if (error) {
    const content = <div className="text-muted">{error}</div>;
    if (bare) return <div className="panel-content">{content}</div>;
    return <div className="panel-content">{content}</div>;
  }

  const content = (
    <>
      <div className="panel-subheader">Resource Pool</div>
      {poolResources.length === 0 ? (
        <div className="text-muted">Pool is empty.</div>
      ) : (
        poolResources.map(r => (
          <div key={r.resourceId} className="panel-row" style={{ justifyContent: 'space-between' }}>
            <span>{r.name || r.resourceId}</span>
            <span style={{ color: 'var(--cyan)' }}>{r.quantity}</span>
          </div>
        ))
      )}

      {permissions.length > 0 && (
        <>
          <div className="panel-subheader">Pool Permissions</div>
          {permissions.map(p => (
            <div key={p.playerId} className="panel-row" style={{ justifyContent: 'space-between' }}>
              <span>{p.username}</span>
              <span style={{ color: 'var(--grey)', fontSize: 10, textTransform: 'uppercase' }}>{p.level}</span>
            </div>
          ))}
        </>
      )}

      <div className="panel-subheader">Factory Planet</div>
      {factory ? (
        <div className="panel-row" style={{ flexDirection: 'column', gap: 2 }}>
          <div>
            <span className="panel-label">Planet:</span>
            <span>{factory.planetName} [{factory.planetClass}]</span>
          </div>
          <div>
            <span className="panel-label">Level:</span>
            <span>{factory.upgradeLevel}</span>
          </div>
          <div>
            <span className="panel-label">Boosted:</span>
            <span style={{ color: 'var(--green)' }}>+{factory.boostedProduction}%</span>
          </div>
        </div>
      ) : (
        <div className="text-muted">No factory designated.</div>
      )}
    </>
  );

  if (bare) return <div className="panel-content">{content}</div>;
  return <div className="panel-content">{content}</div>;
}
