import { useState } from 'react';
import SectorChatPanel, { type ChatMessage } from './SectorChatPanel';
import NotesPanel from './NotesPanel';
import LeaderboardPanel from './LeaderboardPanel';

interface Props {
  messages: ChatMessage[];
  onSend: (message: string) => void;
  refreshKey?: number;
  bare?: boolean;
}

type TabView = 'chat' | 'notes' | 'rankings';

export default function CommsGroupPanel({ messages, onSend, refreshKey, bare }: Props) {
  const [tab, setTab] = useState<TabView>('chat');

  const tabBar = (
    <div className="group-panel-tabs">
      <span onClick={() => setTab('chat')} style={{ cursor: 'pointer', color: tab === 'chat' ? '#0f0' : '#666' }}>
        {tab === 'chat' ? '[Chat]' : 'Chat'}
      </span>
      <span style={{ color: '#444', margin: '0 0.5rem' }}>|</span>
      <span onClick={() => setTab('notes')} style={{ cursor: 'pointer', color: tab === 'notes' ? '#0f0' : '#666' }}>
        {tab === 'notes' ? '[Notes]' : 'Notes'}
      </span>
      <span style={{ color: '#444', margin: '0 0.5rem' }}>|</span>
      <span onClick={() => setTab('rankings')} style={{ cursor: 'pointer', color: tab === 'rankings' ? '#0f0' : '#666' }}>
        {tab === 'rankings' ? '[Rankings]' : 'Rankings'}
      </span>
    </div>
  );

  const content = (
    <>
      {tabBar}
      {tab === 'chat' && <SectorChatPanel messages={messages} onSend={onSend} bare />}
      {tab === 'notes' && <NotesPanel refreshKey={refreshKey} bare />}
      {tab === 'rankings' && <LeaderboardPanel refreshKey={refreshKey} bare />}
    </>
  );

  if (bare) return <div className="panel-content">{content}</div>;
  return <div className="panel-content">{content}</div>;
}
