import { useState, useEffect } from 'react';
import { getCombatLog } from '../services/api';

interface CombatEntry {
  id: string;
  attackerName: string;
  defenderName: string;
  sectorId: number;
  energyExpended: number;
  damageDealt: number;
  outcome: string;
  timestamp: string;
}

interface Props {
  playerName?: string;
  refreshKey?: number;
  bare?: boolean;
}

export default function CombatLogPanel({ playerName, refreshKey, bare }: Props) {
  const [logs, setLogs] = useState<CombatEntry[]>([]);

  useEffect(() => {
    getCombatLog()
      .then(({ data }) => setLogs(data.logs || []))
      .catch(() => setLogs([]));
  }, [refreshKey]);

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const content = (
    <>
      <div className="panel-subheader">Recent Combat</div>
      {logs.length === 0 ? (
        <div className="text-muted">No combat history.</div>
      ) : (
        logs.map(entry => {
          const isAttacker = playerName && entry.attackerName === playerName;
          const isDefender = playerName && entry.defenderName === playerName;
          const color = isAttacker ? 'var(--green)' : isDefender ? 'var(--red)' : 'var(--grey)';
          return (
            <div key={entry.id} className="resource-event-item" style={{ borderLeftColor: color }}>
              <div className="resource-event-item__header">
                <span style={{ color, fontSize: 11 }}>
                  {entry.attackerName} → {entry.defenderName}
                </span>
                <span className="text-muted" style={{ fontSize: 10 }}>{formatTime(entry.timestamp)}</span>
              </div>
              <div style={{ fontSize: 11, display: 'flex', gap: 8 }}>
                <span>DMG: <span style={{ color: 'var(--orange)' }}>{entry.damageDealt}</span></span>
                <span>Sector: {entry.sectorId}</span>
                {entry.outcome && entry.outcome !== 'hit' && (
                  <span style={{ color: entry.outcome === 'destroyed' ? 'var(--red)' : 'var(--yellow)', textTransform: 'uppercase', fontSize: 10 }}>
                    {entry.outcome}
                  </span>
                )}
              </div>
            </div>
          );
        })
      )}
    </>
  );

  if (bare) return <div className="panel-content">{content}</div>;
  return <div className="panel-content">{content}</div>;
}
