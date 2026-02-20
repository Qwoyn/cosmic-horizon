import { useState } from 'react';

interface ActionsPanelProps {
  onCommand: (cmd: string) => void;
  onClearLog: () => void;
  bare?: boolean;
}

export default function ActionsPanel({ onCommand, onClearLog, bare }: ActionsPanelProps) {
  const [intelTarget, setIntelTarget] = useState('');

  const content = (
    <div className="actions-panel">
      <div className="actions-section">
        <div className="actions-section__title">Information</div>
        <div className="actions-section__buttons">
          <button className="btn-action-lg" onClick={() => onCommand('status')}>STATUS</button>
          <button className="btn-action-lg" onClick={() => onCommand('achievements')}>ACHIEVEMENTS</button>
          <button className="btn-action-lg" onClick={() => onCommand('ranks')}>RANKS</button>
          <button className="btn-action-lg" onClick={() => onCommand('leaderboard')}>LEADERBOARD</button>
          <button className="btn-action-lg" onClick={() => onCommand('combat-log')}>COMBAT LOG</button>
        </div>
        <div className="actions-section__inline">
          <input
            className="actions-input"
            type="text"
            value={intelTarget}
            onChange={e => setIntelTarget(e.target.value)}
            placeholder="Player name..."
            onKeyDown={e => {
              if (e.key === 'Enter' && intelTarget.trim()) {
                onCommand(`intel ${intelTarget.trim()}`);
                setIntelTarget('');
              }
            }}
          />
          <button
            className="btn-action-lg"
            onClick={() => {
              if (intelTarget.trim()) {
                onCommand(`intel ${intelTarget.trim()}`);
                setIntelTarget('');
              }
            }}
          >INTEL</button>
        </div>
      </div>

      <div className="actions-section">
        <div className="actions-section__title">Utility</div>
        <div className="actions-section__buttons">
          <button className="btn-action-lg" onClick={() => onCommand('help')}>HELP</button>
          <button className="btn-action-lg" onClick={() => onCommand('tips')}>TIPS</button>
          <button className="btn-action-lg" onClick={() => onCommand('notes')}>NOTES</button>
          <button className="btn-action-lg" onClick={onClearLog}>CLEAR LOG</button>
          <button className="btn-action-lg" onClick={() => onCommand('events')}>EVENTS</button>
        </div>
      </div>

      <div className="actions-section">
        <div className="actions-section__title">Crafting & Resources</div>
        <div className="actions-section__buttons">
          <button className="btn-action-lg" onClick={() => onCommand('resources')}>RESOURCES</button>
          <button className="btn-action-lg" onClick={() => onCommand('recipes')}>RECIPES</button>
          <button className="btn-action-lg" onClick={() => onCommand('tablets')}>TABLETS</button>
        </div>
      </div>
    </div>
  );

  if (bare) return <div className="panel-content">{content}</div>;
  return <div className="panel-content">{content}</div>;
}
