import PixelSprite from './PixelSprite';
import { PANELS } from '../types/panels';
import type { PanelId } from '../types/panels';

interface ActivityBarProps {
  activePanel: PanelId;
  onSelect: (id: PanelId) => void;
  badges: Record<string, number>;
}

export default function ActivityBar({ activePanel, onSelect, badges }: ActivityBarProps) {
  return (
    <div className="activity-bar">
      {PANELS.map((p, i) => (
        <button
          key={p.id}
          className={`activity-bar__btn ${activePanel === p.id ? 'activity-bar__btn--active' : ''}`}
          onClick={() => onSelect(p.id)}
          title={p.label}
          style={activePanel !== p.id ? { animationDelay: `${i * 0.4}s` } : undefined}
        >
          <PixelSprite spriteKey={p.spriteKey} size={22} />
          {(badges[p.id] || 0) > 0 && (
            <span className="activity-bar__badge">{badges[p.id]}</span>
          )}
        </button>
      ))}
    </div>
  );
}
