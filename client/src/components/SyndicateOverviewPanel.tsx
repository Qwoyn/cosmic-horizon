import { useState, useEffect } from 'react';
import { getSyndicate, getAlliances } from '../services/api';

interface Member {
  id: string;
  username: string;
  role: string;
}

interface PersonalAlly {
  id: string;
  allyId: string;
  allyName: string;
  formedAt: string;
}

interface SyndicateAlly {
  id: string;
  allySyndicateId: string;
  allySyndicateName: string;
  formedAt: string;
}

interface Props {
  refreshKey?: number;
  onCommand: (cmd: string) => void;
  bare?: boolean;
}

export default function SyndicateOverviewPanel({ refreshKey, onCommand, bare }: Props) {
  const [syndicate, setSyndicate] = useState<any>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [personalAllies, setPersonalAllies] = useState<PersonalAlly[]>([]);
  const [syndicateAllies, setSyndicateAllies] = useState<SyndicateAlly[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [depositAmt, setDepositAmt] = useState(100);
  const [withdrawAmt, setWithdrawAmt] = useState(100);

  useEffect(() => {
    getSyndicate()
      .then(({ data }) => {
        setSyndicate(data);
        setMembers(data.members || []);
        setError(null);
      })
      .catch(() => {
        setSyndicate(null);
        setError('Not in a syndicate');
      });

    getAlliances()
      .then(({ data }) => {
        setPersonalAllies(data.personalAllies || []);
        setSyndicateAllies(data.syndicateAllies || []);
      })
      .catch(() => {});
  }, [refreshKey]);

  const handleDeposit = () => onCommand(`syndicate deposit ${depositAmt}`);
  const handleWithdraw = () => onCommand(`syndicate withdraw ${withdrawAmt}`);

  if (error) {
    const content = <div className="text-muted">{error}</div>;
    if (bare) return <div className="panel-content">{content}</div>;
    return <div className="panel-content">{content}</div>;
  }

  if (!syndicate) {
    const content = <div className="text-muted">Loading...</div>;
    if (bare) return <div className="panel-content">{content}</div>;
    return <div className="panel-content">{content}</div>;
  }

  const roleColor = (role: string) => {
    if (role === 'leader') return 'var(--yellow)';
    if (role === 'officer') return 'var(--cyan)';
    return 'var(--green)';
  };

  const content = (
    <>
      <div className="panel-row">
        <span className="panel-label">Name:</span>
        <span style={{ color: 'var(--magenta)' }}>{syndicate.name}</span>
      </div>
      <div className="panel-row">
        <span className="panel-label">Treasury:</span>
        <span style={{ color: 'var(--yellow)' }}>{Number(syndicate.treasury).toLocaleString()} cr</span>
      </div>

      <div className="panel-subheader">Treasury</div>
      <div className="panel-row" style={{ gap: 4 }}>
        <input
          type="number"
          min={1}
          value={depositAmt}
          onChange={e => setDepositAmt(Math.max(1, parseInt(e.target.value) || 1))}
          className="qty-input"
          style={{ width: 70 }}
        />
        <button className="btn-sm btn-buy" onClick={handleDeposit}>DEPOSIT</button>
        <input
          type="number"
          min={1}
          value={withdrawAmt}
          onChange={e => setWithdrawAmt(Math.max(1, parseInt(e.target.value) || 1))}
          className="qty-input"
          style={{ width: 70 }}
        />
        <button className="btn-sm btn-sell" onClick={handleWithdraw}>WITHDRAW</button>
      </div>

      <div className="panel-subheader">Members ({members.length})</div>
      {members.map(m => (
        <div key={m.id} className="panel-row" style={{ justifyContent: 'space-between' }}>
          <span>{m.username}</span>
          <span style={{ color: roleColor(m.role), fontSize: 10, textTransform: 'uppercase' }}>{m.role}</span>
        </div>
      ))}

      {syndicateAllies.length > 0 && (
        <>
          <div className="panel-subheader">Syndicate Alliances</div>
          {syndicateAllies.map(a => (
            <div key={a.id} className="panel-row">
              <span style={{ color: 'var(--purple)' }}>{a.allySyndicateName}</span>
            </div>
          ))}
        </>
      )}

      {personalAllies.length > 0 && (
        <>
          <div className="panel-subheader">Personal Alliances</div>
          {personalAllies.map(a => (
            <div key={a.id} className="panel-row">
              <span style={{ color: 'var(--cyan)' }}>{a.allyName}</span>
            </div>
          ))}
        </>
      )}
    </>
  );

  if (bare) return <div className="panel-content">{content}</div>;
  return <div className="panel-content">{content}</div>;
}
