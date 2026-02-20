import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import PixelSprite from './PixelSprite';
import type { PlayerState } from '../hooks/useGameState';
import type { ChatMessage, ChatChannel } from './SectorChatPanel';

interface ContextPanelProps {
  player: PlayerState | null;
  chatMessages: ChatMessage[];
  onChatSend: (message: string, channel: ChatChannel) => void;
  onCommand: (cmd: string) => void;
  hasSyndicate: boolean;
  hasAlliance: boolean;
}

const RACE_COLORS: Record<string, string> = {
  muscarian: '#a371f7',
  vedic: '#58a6ff',
  kalin: '#8b949e',
  tarri: '#f0883e',
};

export default function ContextPanel({ player, chatMessages, onChatSend, onCommand, hasSyndicate, hasAlliance }: ContextPanelProps) {
  const [chatInput, setChatInput] = useState('');
  const [chatChannel, setChatChannel] = useState<ChatChannel>('sector');
  const [cmdInput, setCmdInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [cmdHistoryIdx, setCmdHistoryIdx] = useState(-1);
  const chatListRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight;
    }
  }, [chatMessages.length]);

  const handleChatSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const msg = chatInput.trim();
    if (!msg) return;
    onChatSend(msg, chatChannel);
    setChatInput('');
  }, [chatInput, onChatSend, chatChannel]);

  const handleCmdKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && cmdInput.trim()) {
      onCommand(cmdInput.trim());
      setCmdHistory(prev => [cmdInput.trim(), ...prev]);
      setCmdInput('');
      setCmdHistoryIdx(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistoryIdx < cmdHistory.length - 1) {
        const newIdx = cmdHistoryIdx + 1;
        setCmdHistoryIdx(newIdx);
        setCmdInput(cmdHistory[newIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (cmdHistoryIdx > 0) {
        const newIdx = cmdHistoryIdx - 1;
        setCmdHistoryIdx(newIdx);
        setCmdInput(cmdHistory[newIdx]);
      } else {
        setCmdHistoryIdx(-1);
        setCmdInput('');
      }
    }
  };

  const ship = player?.currentShip;
  const raceColor = RACE_COLORS[player?.race || ''] || '#8b949e';

  // Ship HP bar
  const hullPct = ship ? Math.round((ship.hullHp / ship.maxHullHp) * 100) : 0;
  const hullColor = hullPct < 25 ? 'var(--red)' : hullPct < 50 ? 'var(--orange)' : 'var(--green)';

  // Cargo
  const totalCargo = ship ? ship.cyrilliumCargo + ship.foodCargo + ship.techCargo + ship.colonistsCargo : 0;
  const cargoPct = ship && ship.maxCargoHolds > 0 ? Math.round((totalCargo / ship.maxCargoHolds) * 100) : 0;

  // Chat channels
  const channels: { key: ChatChannel; label: string; show: boolean }[] = [
    { key: 'sector', label: 'Sector', show: true },
    { key: 'syndicate', label: 'Synd', show: hasSyndicate },
    { key: 'alliance', label: 'Ally', show: hasAlliance },
  ];
  const visibleChannels = channels.filter(c => c.show);
  const channelMessages = chatMessages.filter(m => (m.channel || 'sector') === chatChannel);

  return (
    <div className="context-panel">
      {/* Player Profile */}
      <div className="profile-section">
        <div className="profile-portrait" style={{ borderColor: raceColor }}>
          <div className="profile-portrait__silhouette" style={{ color: raceColor }}>
            {player?.race ? player.race.charAt(0).toUpperCase() : '?'}
          </div>
        </div>
        <div className="profile-section__info">
          <div className="profile-section__name">{player?.username || '---'}</div>
          <div className="profile-section__race" style={{ color: raceColor }}>
            {player?.race || 'Unknown'}
          </div>
          <div className="profile-section__credits">
            <span className="text-trade">{player?.credits?.toLocaleString() ?? 0}</span> cr
          </div>
        </div>
      </div>

      {/* Energy bar */}
      <div className="ctx-bar-section">
        <div className="ctx-bar-label">
          <span>Energy</span>
          <span>{player?.energy ?? 0}/{player?.maxEnergy ?? 100}</span>
        </div>
        <div className="ctx-bar">
          <div className="ctx-bar__fill ctx-bar__fill--energy" style={{ width: `${player ? Math.round((player.energy / player.maxEnergy) * 100) : 0}%` }} />
        </div>
      </div>

      {/* Ship Card */}
      {ship && (
        <div className="ship-card">
          <div className="ship-card__header">
            <PixelSprite spriteKey={`ship_${ship.shipTypeId}`} size={36} className="ship-status-sprite ship-status-sprite--breathing" />
            <div className="ship-card__header-info">
              <div className="ship-card__type">{ship.shipTypeId}</div>
              <div className="ship-card__stats-row">
                <span className="text-combat" title="Weapon Energy">W:{ship.weaponEnergy}</span>
                <span className="text-system" title="Engine Energy">E:{ship.engineEnergy}</span>
              </div>
            </div>
          </div>

          {/* Hull bar */}
          <div className="ctx-bar-section">
            <div className="ctx-bar-label">
              <span>Hull</span>
              <span style={{ color: hullColor }}>{ship.hullHp}/{ship.maxHullHp}</span>
            </div>
            <div className="ctx-bar">
              <div className="ctx-bar__fill" style={{ width: `${hullPct}%`, background: hullColor }} />
            </div>
          </div>

          {/* Cargo bar */}
          <div className="ctx-bar-section">
            <div className="ctx-bar-label">
              <span>Cargo</span>
              <span>{totalCargo}/{ship.maxCargoHolds}</span>
            </div>
            <div className="ctx-bar">
              <div className="ctx-bar__fill ctx-bar__fill--cargo" style={{ width: `${Math.min(100, cargoPct)}%` }} />
            </div>
            {totalCargo > 0 && (
              <div className="ship-card__cargo-breakdown">
                {ship.cyrilliumCargo > 0 && <span className="cargo-item--cyr">Cyr:{ship.cyrilliumCargo}</span>}
                {ship.foodCargo > 0 && <span className="cargo-item--food">Fd:{ship.foodCargo}</span>}
                {ship.techCargo > 0 && <span className="cargo-item--tech">Tc:{ship.techCargo}</span>}
                {ship.colonistsCargo > 0 && <span className="cargo-item--col">Co:{ship.colonistsCargo}</span>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mini Chat */}
      <div className="mini-chat">
        <div className="mini-chat__header">
          {visibleChannels.length > 1 ? (
            visibleChannels.map((c, i) => (
              <span key={c.key}>
                {i > 0 && <span style={{ color: '#333' }}> | </span>}
                <span
                  onClick={() => setChatChannel(c.key)}
                  style={{
                    cursor: 'pointer',
                    color: chatChannel === c.key ? (c.key === 'sector' ? '#0f0' : c.key === 'syndicate' ? 'var(--magenta)' : 'var(--cyan)') : '#555',
                    fontSize: 10,
                    fontWeight: chatChannel === c.key ? 'bold' : 'normal',
                  }}
                >
                  {chatChannel === c.key ? `[${c.label}]` : c.label}
                </span>
              </span>
            ))
          ) : (
            <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>CHAT</span>
          )}
        </div>
        <div className="mini-chat__messages" ref={chatListRef}>
          {channelMessages.length === 0 ? (
            <div className="text-muted" style={{ fontSize: 10 }}>No messages</div>
          ) : (
            channelMessages.slice(-8).map(m => (
              <div key={m.id} className={`mini-chat__msg${m.isOwn ? ' mini-chat__msg--own' : ''}`}>
                <span className="mini-chat__sender">[{m.senderName}]</span> {m.message}
              </div>
            ))
          )}
        </div>
        <form className="mini-chat__input" onSubmit={handleChatSubmit}>
          <input
            type="text"
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            placeholder={`Type your message to ${chatChannel}...`}
            maxLength={500}
          />
        </form>
      </div>

      {/* Command Input */}
      <div className="cmd-input-section">
        <div className="cmd-input-row">
          <span className="cmd-prompt">&gt;</span>
          <input
            className="cmd-input"
            value={cmdInput}
            onChange={e => setCmdInput(e.target.value)}
            onKeyDown={handleCmdKeyDown}
            placeholder="Command..."
          />
        </div>
      </div>
    </div>
  );
}
