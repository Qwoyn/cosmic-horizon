import { useState, useEffect } from 'react';
import CollapsiblePanel from './CollapsiblePanel';
import DeployablesPanel from './DeployablesPanel';
import { getSectorEvents, investigateEvent, getResourceEvents, harvestEvent, salvageEvent, attackGuardian } from '../services/api';

interface SectorEvent {
  id: string;
  eventType: string;
  description?: string;
  createdAt: string;
  expiresAt: string;
}

interface ResourceNode {
  resourceId: string;
  name: string;
  quantity: number;
  harvested: boolean;
}

interface ResourceEvent {
  id: string;
  eventType: string;
  resources: ResourceNode[];
  remainingNodes: number;
  totalValue: number;
  timeRemaining: number;
  expiresAt: string;
  guardianHp: number | null;
  claimedBy: string | null;
}

type LineType = 'info' | 'success' | 'error' | 'warning' | 'system' | 'combat' | 'trade';

interface Props {
  refreshKey?: number;
  bare?: boolean;
  onAddLine?: (text: string, type?: LineType) => void;
  onRefreshStatus?: () => void;
}

type TabView = 'events' | 'resources' | 'deployables';

function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return 'expired';
  const mins = Math.floor(ms / 60000);
  const hrs = Math.floor(mins / 60);
  return hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`;
}

function getTimeColor(ms: number): string {
  const mins = ms / 60000;
  if (mins < 15) return 'var(--red)';
  if (mins < 60) return 'var(--yellow)';
  return 'var(--green)';
}

export default function ExplorePanel({ refreshKey, bare, onAddLine, onRefreshStatus }: Props) {
  const [tab, setTab] = useState<TabView>('events');
  const [events, setEvents] = useState<SectorEvent[]>([]);
  const [resourceEvents, setResourceEvents] = useState<ResourceEvent[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    getSectorEvents()
      .then(({ data }) => setEvents(data.events || []))
      .catch(() => setEvents([]));
  }, [refreshKey]);

  useEffect(() => {
    if (tab === 'resources') {
      getResourceEvents()
        .then(({ data }) => setResourceEvents(data.resourceEvents || []))
        .catch(() => setResourceEvents([]));
    }
  }, [tab, refreshKey]);

  const handleInvestigate = async (eventId: string) => {
    setBusy(eventId);
    setResult(null);
    try {
      const { data } = await investigateEvent(eventId);
      setResult(data.message || 'Investigated.');
      const res = await getSectorEvents();
      setEvents(res.data.events || []);
    } catch {
      setResult('Failed to investigate.');
    } finally {
      setBusy(null);
    }
  };

  const handleHarvest = async (eventId: string, nodeIndex: number) => {
    setBusy(`${eventId}-${nodeIndex}`);
    try {
      const { data: hData } = await harvestEvent(eventId, nodeIndex);
      if (hData.resource) {
        const msg = `Harvested ${hData.resource.name} x${hData.resource.quantity}`;
        setResult(msg);
        onAddLine?.(msg, 'success');
        if (hData.remainingNodes > 0) {
          onAddLine?.(`${hData.remainingNodes} nodes remaining`, 'info');
        } else {
          onAddLine?.('Event depleted', 'info');
        }
      }
      onRefreshStatus?.();
      const { data } = await getResourceEvents();
      setResourceEvents(data.resourceEvents || []);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Harvest failed';
      setResult(msg);
      onAddLine?.(msg, 'error');
    } finally { setBusy(null); }
  };

  const handleSalvage = async (eventId: string) => {
    setBusy(eventId);
    try {
      const { data: sData } = await salvageEvent(eventId);
      onAddLine?.('=== DERELICT SALVAGED ===', 'system');
      if (sData.credits > 0) {
        onAddLine?.(`Credits: +${sData.credits.toLocaleString()}`, 'trade');
      }
      if (sData.resources?.length > 0) {
        for (const r of sData.resources) {
          onAddLine?.(`${r.name} x${r.quantity} added to resources`, 'trade');
        }
      }
      if (sData.tabletDrop) {
        onAddLine?.(`Tablet found: ${sData.tabletDrop.name} (${sData.tabletDrop.rarity})!`, 'success');
      }
      const parts: string[] = [];
      if (sData.credits > 0) parts.push(`+${sData.credits.toLocaleString()} cr`);
      if (sData.resources?.length > 0) parts.push(sData.resources.map((r: any) => `${r.name} x${r.quantity}`).join(', '));
      setResult(`Salvaged: ${parts.join(' | ') || 'nothing'}`);
      onRefreshStatus?.();
      const { data } = await getResourceEvents();
      setResourceEvents(data.resourceEvents || []);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Salvage failed';
      setResult(msg);
      onAddLine?.(msg, 'error');
    } finally { setBusy(null); }
  };

  const handleAttack = async (eventId: string) => {
    setBusy(eventId);
    try {
      const { data: aData } = await attackGuardian(eventId);
      onAddLine?.(`You attack the guardian! Damage dealt: ${aData.damageDealt}`, 'combat');
      if (aData.damageTaken > 0) onAddLine?.(`Damage taken: ${aData.damageTaken}`, 'warning');
      if (aData.defeated) {
        onAddLine?.('=== GUARDIAN DEFEATED ===', 'success');
        if (aData.loot?.resources?.length > 0) {
          for (const r of aData.loot.resources) {
            onAddLine?.(`Loot: ${r.name} x${r.quantity}`, 'trade');
          }
        }
        setResult('Guardian defeated!');
      } else {
        setResult(`Guardian HP: ${aData.remainingHp}/50`);
      }
      onRefreshStatus?.();
      const { data } = await getResourceEvents();
      setResourceEvents(data.resourceEvents || []);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Attack failed';
      setResult(msg);
      onAddLine?.(msg, 'error');
    } finally { setBusy(null); }
  };

  const tabBar = (
    <div className="group-panel-tabs">
      <span onClick={() => setTab('events')} style={{ cursor: 'pointer', color: tab === 'events' ? '#0f0' : '#666' }}>
        {tab === 'events' ? '[Events]' : 'Events'}
      </span>
      <span style={{ color: '#444', margin: '0 0.5rem' }}>|</span>
      <span onClick={() => setTab('resources')} style={{ cursor: 'pointer', color: tab === 'resources' ? '#0f0' : '#666' }}>
        {tab === 'resources' ? '[Resources]' : 'Resources'}
      </span>
      <span style={{ color: '#444', margin: '0 0.5rem' }}>|</span>
      <span onClick={() => setTab('deployables')} style={{ cursor: 'pointer', color: tab === 'deployables' ? '#0f0' : '#666' }}>
        {tab === 'deployables' ? '[Deployables]' : 'Deployables'}
      </span>
    </div>
  );

  const eventsContent = events.length === 0 ? (
    <div className="text-muted">No events in this sector.</div>
  ) : (
    <>
      {result && <div style={{ color: 'var(--cyan)', fontSize: '11px', marginBottom: 8 }}>{result}</div>}
      {events.map(ev => {
        const remaining = new Date(ev.expiresAt).getTime() - Date.now();
        return (
          <div key={ev.id} className="resource-event-item">
            <div className="resource-event-item__header">
              <span className="resource-event-item__type">{ev.eventType}</span>
              <span className="resource-event-item__time" style={{ color: getTimeColor(remaining) }}>
                {formatTimeRemaining(remaining)}
              </span>
            </div>
            {ev.description && <div className="resource-event-item__details">{ev.description}</div>}
            <button className="btn-sm btn-buy" onClick={() => handleInvestigate(ev.id)} disabled={busy === ev.id}>
              {busy === ev.id ? '...' : 'INVESTIGATE'}
            </button>
          </div>
        );
      })}
    </>
  );

  const resourcesContent = resourceEvents.length === 0 ? (
    <div className="text-muted">No resource events in this sector.</div>
  ) : (
    <>
      {result && <div style={{ color: 'var(--cyan)', fontSize: '11px', marginBottom: 8 }}>{result}</div>}
      {resourceEvents.map(ev => {
        const remaining = ev.timeRemaining > 0 ? ev.timeRemaining : Math.max(0, new Date(ev.expiresAt).getTime() - Date.now());
        const typeClass = `resource-event-item__type--${ev.eventType}`;
        return (
          <div key={ev.id} className="resource-event-item">
            <div className="resource-event-item__header">
              <span className={`resource-event-item__type ${typeClass}`}>
                {ev.eventType.replace('_', ' ').toUpperCase()}
              </span>
              <span className="resource-event-item__time" style={{ color: getTimeColor(remaining) }}>
                {formatTimeRemaining(remaining)}
              </span>
            </div>

            {ev.eventType === 'asteroid_field' && ev.resources && (
              <div className="resource-event-item__nodes">
                {ev.resources.map((node, idx) => (
                  <button
                    key={idx}
                    className="btn-sm btn-buy"
                    onClick={() => handleHarvest(ev.id, idx)}
                    disabled={node.harvested || busy === `${ev.id}-${idx}`}
                  >
                    {node.harvested ? 'Done' : `Harvest ${node.name}`}
                  </button>
                ))}
              </div>
            )}

            {ev.eventType === 'derelict' && (
              <div style={{ marginTop: 4 }}>
                {ev.claimedBy ? (
                  <span className="text-muted" style={{ fontSize: 11 }}>Already claimed</span>
                ) : (
                  <button className="btn-sm btn-buy" onClick={() => handleSalvage(ev.id)} disabled={busy === ev.id}>
                    {busy === ev.id ? '...' : 'SALVAGE'}
                  </button>
                )}
              </div>
            )}

            {ev.eventType === 'anomaly' && (
              <div style={{ marginTop: 4 }}>
                <button className="btn-sm btn-buy" onClick={() => handleHarvest(ev.id, 0)} disabled={busy === `${ev.id}-0`}>
                  {busy === `${ev.id}-0` ? '...' : 'HARVEST'}
                </button>
              </div>
            )}

            {ev.eventType === 'alien_cache' && (
              <div style={{ marginTop: 4 }}>
                {ev.guardianHp != null && ev.guardianHp > 0 ? (
                  <>
                    <div className="guardian-hp-bar">
                      <div className="guardian-hp-bar__fill" style={{ width: `${(ev.guardianHp / 50) * 100}%` }} />
                    </div>
                    <div className="resource-event-item__details">Guardian HP: {ev.guardianHp}/50</div>
                    <button className="btn-sm btn-fire" onClick={() => handleAttack(ev.id)} disabled={busy === ev.id}>
                      {busy === ev.id ? '...' : 'ATTACK'}
                    </button>
                  </>
                ) : ev.claimedBy ? (
                  <div className="text-muted" style={{ fontSize: 11 }}>Already claimed</div>
                ) : (
                  <div className="resource-event-item__details" style={{ color: 'var(--green)' }}>
                    Guardian defeated — claim available
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </>
  );

  const content = (
    <>
      {tabBar}
      {tab === 'events' && eventsContent}
      {tab === 'resources' && resourcesContent}
      {tab === 'deployables' && <DeployablesPanel refreshKey={refreshKey} bare />}
    </>
  );

  if (bare) return <div className="panel-content">{content}</div>;
  return <CollapsiblePanel title="EXPLORE">{content}</CollapsiblePanel>;
}
