import { useState, useEffect } from 'react';
import { getSyndicateProjects, getProjectDetail, getMegaProjectDefinitions } from '../services/api';

interface ProjectSummary {
  id: string;
  typeId: string;
  name: string;
  status: string;
  creditsProgress: number;
  creditsRequired: number;
  resourcesProgress: number;
  resourcesRequired: number;
}

interface ProjectDetail {
  id: string;
  name: string;
  status: string;
  resources: { resourceId: string; name: string; contributed: number; required: number }[];
  creditsContributed: number;
  creditsRequired: number;
}

interface ProjectDef {
  id: string;
  name: string;
  description: string;
  creditsCost: number;
}

interface Props {
  refreshKey?: number;
  onCommand: (cmd: string) => void;
  bare?: boolean;
}

export default function SyndicateProjectsPanel({ refreshKey, onCommand, bare }: Props) {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [definitions, setDefinitions] = useState<ProjectDef[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ProjectDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSyndicateProjects()
      .then(({ data }) => {
        setProjects(data.projects || []);
        setError(null);
      })
      .catch(() => setError('Not in a syndicate'));

    getMegaProjectDefinitions()
      .then(({ data }) => setDefinitions(data.definitions || []))
      .catch(() => {});
  }, [refreshKey]);

  useEffect(() => {
    if (expandedId) {
      getProjectDetail(expandedId)
        .then(({ data }) => setDetail(data.project || data))
        .catch(() => setDetail(null));
    } else {
      setDetail(null);
    }
  }, [expandedId]);

  if (error) {
    const content = <div className="text-muted">{error}</div>;
    if (bare) return <div className="panel-content">{content}</div>;
    return <div className="panel-content">{content}</div>;
  }

  const progressPct = (current: number, total: number) =>
    total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0;

  const content = (
    <>
      <div className="panel-subheader">Active Projects</div>
      {projects.length === 0 ? (
        <div className="text-muted">No active projects.</div>
      ) : (
        projects.map(p => (
          <div key={p.id} className="resource-event-item" onClick={() => setExpandedId(expandedId === p.id ? null : p.id)} style={{ cursor: 'pointer' }}>
            <div className="resource-event-item__header">
              <span className="resource-event-item__type">{p.name}</span>
              <span style={{ color: p.status === 'active' ? 'var(--green)' : 'var(--grey)', fontSize: 10, textTransform: 'uppercase' }}>{p.status}</span>
            </div>
            <div style={{ marginTop: 4 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
                <span>Credits</span>
                <span>{progressPct(p.creditsProgress, p.creditsRequired)}%</span>
              </div>
              <div className="guardian-hp-bar">
                <div className="guardian-hp-bar__fill" style={{ width: `${progressPct(p.creditsProgress, p.creditsRequired)}%`, background: 'var(--yellow)' }} />
              </div>
            </div>
            <div style={{ marginTop: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 2 }}>
                <span>Resources</span>
                <span>{progressPct(p.resourcesProgress, p.resourcesRequired)}%</span>
              </div>
              <div className="guardian-hp-bar">
                <div className="guardian-hp-bar__fill" style={{ width: `${progressPct(p.resourcesProgress, p.resourcesRequired)}%`, background: 'var(--cyan)' }} />
              </div>
            </div>

            {expandedId === p.id && detail && (
              <div style={{ marginTop: 8, borderTop: '1px solid #333', paddingTop: 6 }}>
                {detail.resources.map(r => (
                  <div key={r.resourceId} className="panel-row" style={{ justifyContent: 'space-between', fontSize: 11 }}>
                    <span>{r.name || r.resourceId}</span>
                    <span style={{ color: r.contributed >= r.required ? 'var(--green)' : 'var(--orange)' }}>
                      {r.contributed}/{r.required}
                    </span>
                  </div>
                ))}
                <button className="btn-sm btn-buy" style={{ marginTop: 4 }} onClick={e => { e.stopPropagation(); onCommand(`project contribute ${p.id}`); }}>
                  CONTRIBUTE
                </button>
              </div>
            )}
          </div>
        ))
      )}

      {definitions.length > 0 && (
        <>
          <div className="panel-subheader">Available Projects</div>
          {definitions.map(d => (
            <div key={d.id} className="panel-row" style={{ justifyContent: 'space-between' }}>
              <span>{d.name}</span>
              <span className="text-muted" style={{ fontSize: 10 }}>{Number(d.creditsCost).toLocaleString()} cr</span>
            </div>
          ))}
        </>
      )}
    </>
  );

  if (bare) return <div className="panel-content">{content}</div>;
  return <div className="panel-content">{content}</div>;
}
