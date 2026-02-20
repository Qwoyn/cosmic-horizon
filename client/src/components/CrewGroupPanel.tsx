import { useState } from 'react';
import PlayerListPanel from './PlayerListPanel';
import { NPCList, ContactsList } from './NPCsPanel';
import type { SectorState } from '../hooks/useGameState';

interface Props {
  sector: SectorState | null;
  onFire: (targetPlayerId: string, energy: number) => void;
  refreshKey?: number;
  bare?: boolean;
  onCommand?: (cmd: string) => void;
  alliedPlayerIds?: string[];
  onAllianceChange?: () => void;
}

type TabView = 'players' | 'npcs' | 'contacts';

export default function CrewGroupPanel({ sector, onFire, refreshKey, bare, onCommand, alliedPlayerIds, onAllianceChange }: Props) {
  const [tab, setTab] = useState<TabView>('players');

  const tabBar = (
    <div className="group-panel-tabs">
      <span onClick={() => setTab('players')} style={{ cursor: 'pointer', color: tab === 'players' ? '#0f0' : '#666' }}>
        {tab === 'players' ? '[Players]' : 'Players'}
      </span>
      <span style={{ color: '#444', margin: '0 0.5rem' }}>|</span>
      <span onClick={() => setTab('npcs')} style={{ cursor: 'pointer', color: tab === 'npcs' ? '#0f0' : '#666' }}>
        {tab === 'npcs' ? '[NPCs]' : 'NPCs'}
      </span>
      <span style={{ color: '#444', margin: '0 0.5rem' }}>|</span>
      <span onClick={() => setTab('contacts')} style={{ cursor: 'pointer', color: tab === 'contacts' ? '#0f0' : '#666' }}>
        {tab === 'contacts' ? '[Contacts]' : 'Contacts'}
      </span>
    </div>
  );

  const content = (
    <>
      {tabBar}
      {tab === 'players' && <PlayerListPanel sector={sector} onFire={onFire} alliedPlayerIds={alliedPlayerIds} onAllianceChange={onAllianceChange} bare />}
      {tab === 'npcs' && <NPCList sector={sector} onCommand={onCommand} />}
      {tab === 'contacts' && <ContactsList refreshKey={refreshKey} />}
    </>
  );

  if (bare) return <div className="panel-content">{content}</div>;
  return <div className="panel-content">{content}</div>;
}
