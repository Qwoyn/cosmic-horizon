import { useState, useCallback } from 'react';
import type { PanelId } from '../types/panels';

interface BadgeState {
  [key: string]: number;
}

export function useActivePanel(defaultPanel: PanelId = 'nav') {
  const [activePanel, setActivePanel] = useState<PanelId>(defaultPanel);
  const [badges, setBadges] = useState<BadgeState>({});

  const selectPanel = useCallback((id: PanelId) => {
    setActivePanel(id);
    setBadges(prev => ({ ...prev, [id]: 0 }));
  }, []);

  const incrementBadge = useCallback((id: PanelId) => {
    setBadges(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }, []);

  return { activePanel, selectPanel, badges, incrementBadge };
}
