import { useState, useEffect } from 'react';
import { getShipUpgrades, getAvailableUpgrades, installUpgrade, uninstallUpgrade } from '../services/api';

interface InstalledUpgrade {
  installId: string;
  name: string;
  slot: string;
  statBonus: string;
}

interface AvailableUpgrade {
  upgradeTypeId: string;
  name: string;
  slot: string;
  statBonus: string;
  price: number;
}

interface Props {
  refreshKey?: number;
  atStarMall?: boolean;
  onAction?: () => void;
}

export default function ShipUpgradesTab({ refreshKey, atStarMall = false, onAction }: Props) {
  const [installed, setInstalled] = useState<InstalledUpgrade[]>([]);
  const [available, setAvailable] = useState<AvailableUpgrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [localRefresh, setLocalRefresh] = useState(0);

  const refresh = () => setLocalRefresh(k => k + 1);

  useEffect(() => {
    setLoading(true);
    const promises: Promise<void>[] = [
      getShipUpgrades()
        .then(({ data }) => setInstalled(data.upgrades || []))
        .catch(() => setInstalled([])),
    ];
    if (atStarMall) {
      promises.push(
        getAvailableUpgrades()
          .then(({ data }) => setAvailable(data.upgrades || []))
          .catch(() => setAvailable([]))
      );
    }
    Promise.all(promises).finally(() => setLoading(false));
  }, [refreshKey, localRefresh, atStarMall]);

  const handleInstall = async (upgradeTypeId: string) => {
    setBusy(upgradeTypeId);
    setError('');
    try {
      await installUpgrade(upgradeTypeId);
      refresh();
      onAction?.();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Install failed');
    } finally {
      setBusy(null);
    }
  };

  const handleUninstall = async (installId: string) => {
    setBusy(installId);
    setError('');
    try {
      await uninstallUpgrade(installId);
      refresh();
      onAction?.();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Uninstall failed');
    } finally {
      setBusy(null);
    }
  };

  if (loading) return <div className="text-muted">Loading upgrades...</div>;

  return (
    <div>
      {error && <div className="mall-error">{error}</div>}
      <div className="panel-subheader">Installed</div>
      {installed.length === 0 ? (
        <div className="text-muted">No upgrades installed.</div>
      ) : (
        installed.map(u => (
          <div key={u.installId} className="upgrade-item">
            <div className="upgrade-item__info">
              <span className="upgrade-item__name">{u.name}</span>
              <span className="upgrade-item__slot">[{u.slot}]</span>
              <span className="upgrade-item__bonus text-success">{u.statBonus}</span>
            </div>
            <button
              className="btn-sm"
              disabled={busy === u.installId}
              onClick={() => handleUninstall(u.installId)}
              style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
            >
              {busy === u.installId ? '...' : 'UNINSTALL'}
            </button>
          </div>
        ))
      )}
      {atStarMall && (
        <>
          <div className="panel-subheader">Available</div>
          {available.length === 0 ? (
            <div className="text-muted">No upgrades available.</div>
          ) : (
            available.map(u => (
              <div key={u.upgradeTypeId} className="upgrade-item">
                <div className="upgrade-item__info">
                  <span className="upgrade-item__name">{u.name}</span>
                  <span className="upgrade-item__slot">[{u.slot}]</span>
                  <span className="upgrade-item__bonus text-success">{u.statBonus}</span>
                </div>
                <div className="upgrade-item__action">
                  <span className="mall-item__price">{u.price.toLocaleString()} cr</span>
                  <button
                    className="btn-sm btn-buy"
                    disabled={busy === u.upgradeTypeId}
                    onClick={() => handleInstall(u.upgradeTypeId)}
                  >
                    {busy === u.upgradeTypeId ? '...' : 'INSTALL'}
                  </button>
                </div>
              </div>
            ))
          )}
        </>
      )}
      {!atStarMall && (
        <div className="text-muted" style={{ marginTop: '8px', fontSize: '11px' }}>
          Dock at a Star Mall to browse available upgrades.
        </div>
      )}
    </div>
  );
}
