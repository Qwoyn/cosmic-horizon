import { useState } from 'react';
import SyndicateOverviewPanel from './SyndicateOverviewPanel';
import SyndicateEconomyPanel from './SyndicateEconomyPanel';
import SyndicateProjectsPanel from './SyndicateProjectsPanel';
import SyndicateStructuresPanel from './SyndicateStructuresPanel';

interface Props {
  refreshKey?: number;
  onCommand: (cmd: string) => void;
  bare?: boolean;
}

type TabView = 'overview' | 'economy' | 'projects' | 'structures';

export default function SyndicateGroupPanel({ refreshKey, onCommand, bare }: Props) {
  const [tab, setTab] = useState<TabView>('overview');

  const tabs: { key: TabView; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'economy', label: 'Economy' },
    { key: 'projects', label: 'Projects' },
    { key: 'structures', label: 'Structures' },
  ];

  const tabBar = (
    <div className="group-panel-tabs">
      {tabs.map((t, i) => (
        <span key={t.key}>
          {i > 0 && <span style={{ color: '#444', margin: '0 0.5rem' }}>|</span>}
          <span onClick={() => setTab(t.key)} style={{ cursor: 'pointer', color: tab === t.key ? '#0f0' : '#666' }}>
            {tab === t.key ? `[${t.label}]` : t.label}
          </span>
        </span>
      ))}
    </div>
  );

  const content = (
    <>
      {tabBar}
      {tab === 'overview' && <SyndicateOverviewPanel refreshKey={refreshKey} onCommand={onCommand} bare />}
      {tab === 'economy' && <SyndicateEconomyPanel refreshKey={refreshKey} bare />}
      {tab === 'projects' && <SyndicateProjectsPanel refreshKey={refreshKey} onCommand={onCommand} bare />}
      {tab === 'structures' && <SyndicateStructuresPanel refreshKey={refreshKey} bare />}
    </>
  );

  if (bare) return <div className="panel-content">{content}</div>;
  return <div className="panel-content">{content}</div>;
}
