import { useState, useEffect } from 'react';
import { getBounties, getBountiesOnMe } from '../services/api';

interface Bounty {
  id: string;
  amount: number;
  targetUsername: string;
  targetId: string;
  placedByUsername: string;
  created_at: string;
}

interface BountyOnMe {
  id: string;
  amount: number;
  placedByUsername: string;
  placedAt: string;
}

interface Props {
  refreshKey?: number;
  bare?: boolean;
}

export default function BountiesPanel({ refreshKey, bare }: Props) {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [bountiesOnMe, setBountiesOnMe] = useState<BountyOnMe[]>([]);
  const [totalBounty, setTotalBounty] = useState(0);

  useEffect(() => {
    getBounties()
      .then(({ data }) => setBounties(data.bounties || []))
      .catch(() => setBounties([]));

    getBountiesOnMe()
      .then(({ data }) => {
        setBountiesOnMe(data.bounties || []);
        setTotalBounty(data.totalBounty || 0);
      })
      .catch(() => {});
  }, [refreshKey]);

  const content = (
    <>
      {totalBounty > 0 && (
        <div style={{ color: 'var(--red)', fontSize: 11, marginBottom: 8, padding: '4px 6px', border: '1px solid var(--red)', borderRadius: 2 }}>
          Bounties on you: {totalBounty.toLocaleString()} cr
        </div>
      )}

      {bountiesOnMe.length > 0 && (
        <>
          <div className="panel-subheader text-warning">Bounties on Me</div>
          {bountiesOnMe.map(b => (
            <div key={b.id} className="panel-row" style={{ justifyContent: 'space-between', fontSize: 11 }}>
              <span>{b.placedByUsername}</span>
              <span style={{ color: 'var(--red)' }}>{Number(b.amount).toLocaleString()} cr</span>
            </div>
          ))}
        </>
      )}

      <div className="panel-subheader">Active Bounties</div>
      {bounties.length === 0 ? (
        <div className="text-muted">No active bounties.</div>
      ) : (
        bounties.map(b => (
          <div key={b.id} className="panel-row" style={{ justifyContent: 'space-between', fontSize: 11 }}>
            <span>
              <span style={{ color: 'var(--orange)' }}>{b.targetUsername}</span>
              <span className="text-muted"> by {b.placedByUsername}</span>
            </span>
            <span style={{ color: 'var(--yellow)' }}>{Number(b.amount).toLocaleString()} cr</span>
          </div>
        ))
      )}
    </>
  );

  if (bare) return <div className="panel-content">{content}</div>;
  return <div className="panel-content">{content}</div>;
}
