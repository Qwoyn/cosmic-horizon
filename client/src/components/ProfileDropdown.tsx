import { useState, useEffect, useRef } from 'react';
import { getProfile, getAchievements } from '../services/api';

interface ProfileData {
  username: string;
  race: string;
  rank: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  gameMode: string;
  levelBonuses?: string[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  progress?: number;
  target?: number;
}

interface Props {
  onClose: () => void;
}

export default function ProfileDropdown({ onClose }: Props) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      getProfile().then(({ data }) => setProfile(data)).catch(() => {}),
      getAchievements().then(({ data }) => setAchievements(data.achievements || [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  if (loading) {
    return (
      <div className="profile-dropdown" ref={ref}>
        <div className="text-muted">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-dropdown" ref={ref}>
        <div className="text-muted">Failed to load profile.</div>
      </div>
    );
  }

  const xpPercent = profile.xpToNextLevel > 0 ? (profile.xp / profile.xpToNextLevel) * 100 : 100;
  const earned = achievements.filter(a => a.earned);
  const inProgress = achievements.filter(a => !a.earned && a.progress != null);

  return (
    <div className="profile-dropdown" ref={ref}>
      <div className="profile-dropdown__header">
        <div className="profile-dropdown__name">{profile.username}</div>
        <div className="profile-dropdown__rank">{profile.rank}</div>
      </div>
      <div className="profile-dropdown__stats">
        <div className="profile-stat">
          <span className="profile-stat__label">Race</span>
          <span className="profile-stat__value">{profile.race || 'Unknown'}</span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat__label">Level</span>
          <span className="profile-stat__value">{profile.level}</span>
        </div>
        <div className="profile-stat">
          <span className="profile-stat__label">Mode</span>
          <span className="profile-stat__value">{profile.gameMode === 'singleplayer' ? 'SP' : 'MP'}</span>
        </div>
      </div>
      <div className="profile-xp">
        <div className="profile-xp__label">XP: {profile.xp} / {profile.xpToNextLevel}</div>
        <div className="cargo-bar">
          <div className="cargo-bar__fill" style={{ width: `${xpPercent}%`, background: 'var(--magenta)' }} />
        </div>
      </div>
      {profile.levelBonuses && profile.levelBonuses.length > 0 && (
        <div className="profile-bonuses">
          <span className="profile-bonuses__label">Level Bonuses:</span>
          {profile.levelBonuses.map((b, i) => (
            <span key={i} className="profile-bonus">{b}</span>
          ))}
        </div>
      )}
      {earned.length > 0 && (
        <div className="profile-achievements">
          <div className="panel-subheader">Achievements ({earned.length})</div>
          {earned.map(a => (
            <div key={a.id} className="profile-achievement">
              <span className="profile-achievement__name text-success">{a.name}</span>
            </div>
          ))}
        </div>
      )}
      {inProgress.length > 0 && (
        <div className="profile-achievements">
          <div className="panel-subheader">In Progress</div>
          {inProgress.slice(0, 5).map(a => (
            <div key={a.id} className="profile-achievement">
              <span className="profile-achievement__name">{a.name}</span>
              <span className="text-muted" style={{ fontSize: '10px' }}> ({a.progress}/{a.target})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
