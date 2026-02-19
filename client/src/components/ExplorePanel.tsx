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

interface ResourceEvent {
  id: string;
  type: string;
  nodes?: { index: number; harvested: boolean; resource: string }[];
  claimed?: boolean;
  guardian_hp?: number;
  guardian_max_hp?: number;
  loot?: string[];
  expiresAt: string;
}

interface Props {
  refreshKey?: number;
  bare?: boolean;
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

export default function ExplorePanel({ refreshKey, bare }: Props) {
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
      await harvestEvent(eventId, nodeIndex);
      const { data } = await getResourceEvents();
      setResourceEvents(data.resourceEvents || []);
    } catch { /* silent */ } finally { setBusy(null); }
  };

  const handleSalvage = async (eventId: string) => {
    setBusy(eventId);
    try {
      await salvageEvent(eventId);
      const { data } = await getResourceEvents();
      setResourceEvents(data.resourceEvents || []);
    } catch { /* silent */ } finally { setBusy(null); }
  };

  const handleAttack = async (eventId: string) => {
    setBusy(eventId);
    try {
      await attackGuardian(eventId);
      const { data } = await getResourceEvents();
      setResourceEvents(data.resourceEvents || []);
    } catch { /* silent */ } finally { setBusy(null); }
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
      {resourceEvents.map(ev => {
        const remaining = new Date(ev.expiresAt).getTime() - Date.now();
        const typeClass = `resource-event-item__type--${ev.type}`;
        return (
          <div key={ev.id} className="resource-event-item">
            <div className="resource-event-item__header">
              <span className={`resource-event-item__type ${typeClass}`}>
                {ev.type.replace('_', ' ').toUpperCase()}
              </span>
              <span className="resource-event-item__time" style={{ color: getTimeColor(remaining) }}>
                {formatTimeRemaining(remaining)}
              </span>
            </div>

            {ev.type === 'asteroid_field' && ev.nodes && (
              <div className="resource-event-item__nodes">
                {ev.nodes.map(node => (
                  <button
                    key={node.index}
                    className="btn-sm btn-buy"
                    onClick={() => handleHarvest(ev.id, node.index)}
                    disabled={node.harvested || busy === `${ev.id}-${node.index}`}
                  >
                    {node.harvested ? 'Done' : `Harvest ${node.resource}`}
                  </button>
                ))}
              </div>
            )}

            {ev.type === 'derelict' && (
              <div style={{ marginTop: 4 }}>
                {ev.claimed ? (
                  <span className="text-muted" style={{ fontSize: 11 }}>Already claimed</span>
                ) : (
                  <button className="btn-sm btn-buy" onClick={() => handleSalvage(ev.id)} disabled={busy === ev.id}>
                    {busy === ev.id ? '...' : 'SALVAGE'}
                  </button>
                )}
              </div>
            )}

            {ev.type === 'anomaly' && (
              <div style={{ marginTop: 4 }}>
                <button className="btn-sm btn-buy" onClick={() => handleHarvest(ev.id, 0)} disabled={busy === `${ev.id}-0`}>
                  {busy === `${ev.id}-0` ? '...' : 'HARVEST'}
                </button>
              </div>
            )}

            {ev.type === 'alien_cache' && (
              <div style={{ marginTop: 4 }}>
                {ev.guardian_hp != null && ev.guardian_max_hp != null && ev.guardian_hp > 0 ? (
                  <>
                    <div className="guardian-hp-bar">
                      <div className="guardian-hp-bar__fill" style={{ width: `${(ev.guardian_hp / ev.guardian_max_hp) * 100}%` }} />
                    </div>
                    <div className="resource-event-item__details">Guardian HP: {ev.guardian_hp}/{ev.guardian_max_hp}</div>
                    <button className="btn-sm btn-fire" onClick={() => handleAttack(ev.id)} disabled={busy === ev.id}>
                      {busy === ev.id ? '...' : 'ATTACK'}
                    </button>
                  </>
                ) : ev.loot && ev.loot.length > 0 ? (
                  <div className="resource-event-item__details" style={{ color: 'var(--green)' }}>
                    Loot: {ev.loot.join(', ')}
                  </div>
                ) : (
                  <div className="text-muted" style={{ fontSize: 11 }}>Guardian defeated</div>
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
