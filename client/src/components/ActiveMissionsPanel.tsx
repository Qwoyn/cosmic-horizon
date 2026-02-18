import { useState, useEffect } from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import PixelSprite from './PixelSprite';
import { getActiveMissions } from '../services/api';

interface MissionData {
  missionId: string;
  title: string;
  type: string;
  progress: Record<string, number>;
  rewardCredits: number;
}

interface Props {
  refreshKey?: number; // increment to re-fetch
}

function progressSummary(type: string, progress: Record<string, number>): string {
  switch (type) {
    case 'visit_sector': return `${progress.sectorsVisited || 0} sectors visited`;
    case 'trade_units': return `${progress.unitsTraded || 0} units traded`;
    case 'scan_sectors': return `${progress.scansCompleted || 0} scans`;
    case 'destroy_ship': return `${progress.shipsDestroyed || 0} ships`;
    case 'colonize_planet': return `${progress.colonistsDeposited || 0} colonists`;
    case 'deliver_cargo': return `${progress.delivered || 0} delivered`;
    default: return JSON.stringify(progress);
  }
}

export default function ActiveMissionsPanel({ refreshKey }: Props) {
  const [missions, setMissions] = useState<MissionData[]>([]);

  useEffect(() => {
    getActiveMissions()
      .then(({ data }) => setMissions(data.missions || []))
      .catch(() => setMissions([]));
  }, [refreshKey]);

  return (
    <CollapsiblePanel title="MISSIONS" badge={missions.length || null}>
      {missions.length === 0 ? (
        <div className="text-muted">No active missions</div>
      ) : (
        missions.map(m => (
          <div key={m.missionId} className="mission-item">
            <div className="mission-item__title"><PixelSprite spriteKey={`mission_${m.type}`} size={12} />{m.title}</div>
            <div className="mission-item__progress">
              {progressSummary(m.type, m.progress)}
              <span className="mission-item__reward">+{m.rewardCredits} cr</span>
            </div>
          </div>
        ))
      )}
    </CollapsiblePanel>
  );
}
