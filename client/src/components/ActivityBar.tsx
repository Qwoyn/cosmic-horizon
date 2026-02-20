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
      {PANELS.map((p, i) => {
        const isActive = activePanel === p.id;
        return (
          <button
            key={p.id}
            className={`activity-bar__btn${isActive ? ' activity-bar__btn--active' : ' activity-bar__btn--shimmer'}`}
            onClick={() => onSelect(p.id)}
            title={p.label}
            style={!isActive ? {
              animationDelay: `${i * 0.4}s`,
              '--shimmer-dur': `${8 + (i * 3) % 7}s`,
              '--shimmer-delay': `${(i * 2.3) % 12}s`,
            } as React.CSSProperties : undefined}
          >
            <PixelSprite spriteKey={p.spriteKey} size={22} />
            {(badges[p.id] || 0) > 0 && (
              <span className="activity-bar__badge">{badges[p.id]}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
