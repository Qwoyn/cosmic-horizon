import { useState, useEffect } from 'react';
import {
  getSyndicateRoles, createSyndicateRole, updateSyndicateRole, deleteSyndicateRole,
  assignMemberRole, getSyndicateSettings, updateSyndicateSettings,
  getJoinRequests, reviewJoinRequest,
  createInviteCode, getInviteCodes, revokeInviteCode,
  governanceKick,
} from '../services/api';

interface Role {
  id: string;
  name: string;
  priority: number;
  is_preset: boolean;
  permissions: string[];
}

interface Member {
  id: string;
  username: string;
  role: string;
  role_id?: string | null;
}

interface JoinRequest {
  id: string;
  playerId: string;
  username: string;
  level: number;
  message: string | null;
  created_at: string;
}

interface InviteCode {
  id: string;
  code: string;
  uses_remaining: number;
  expires_at: string;
  createdBy: string;
}

const ALL_PERMISSIONS = ['invite', 'kick', 'promote', 'withdraw_treasury', 'start_vote', 'manage_projects', 'edit_charter', 'manage_roles'];

interface Props {
  syndicateId: string;
  members: Member[];
  isLeader: boolean;
  refreshKey?: number;
  onRefresh?: () => void;
}

export default function SyndicateAdminTab({ syndicateId, members, isLeader, refreshKey, onRefresh }: Props) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [actionMsg, setActionMsg] = useState('');

  // New role form
  const [newRoleName, setNewRoleName] = useState('');
  const [newRolePerms, setNewRolePerms] = useState<string[]>([]);

  // Invite code form
  const [codeUses, setCodeUses] = useState(1);
  const [codeExpiry, setCodeExpiry] = useState(24);

  // Settings form
  const [settingsForm, setSettingsForm] = useState<any>({});
  const [editingSettings, setEditingSettings] = useState(false);

  const fetchAll = () => {
    getSyndicateRoles(syndicateId).then(({ data }) => setRoles(data.roles || [])).catch(() => {});
    getSyndicateSettings(syndicateId).then(({ data }) => {
      setSettings(data.settings);
      setSettingsForm(data.settings || {});
    }).catch(() => {});
    getJoinRequests(syndicateId).then(({ data }) => setRequests(data.requests || [])).catch(() => {});
    getInviteCodes(syndicateId).then(({ data }) => setInviteCodes(data.codes || [])).catch(() => {});
  };

  useEffect(() => { fetchAll(); }, [syndicateId, refreshKey]);

  const showMsg = (msg: string) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 3000); };

  // ── Member Management ──────────────────────────────
  const handleAssignRole = async (playerId: string, roleId: string | null) => {
    try {
      await assignMemberRole(syndicateId, playerId, roleId);
      showMsg('Role updated');
      onRefresh?.();
    } catch (err: any) { showMsg(err.response?.data?.error || 'Failed'); }
  };

  const handleKick = async (playerId: string) => {
    if (!confirm('Kick this member?')) return;
    try {
      await governanceKick(syndicateId, playerId);
      showMsg('Member kicked');
      onRefresh?.();
    } catch (err: any) { showMsg(err.response?.data?.error || 'Kick failed'); }
  };

  const handleReview = async (reqId: string, accept: boolean) => {
    try {
      await reviewJoinRequest(syndicateId, reqId, accept);
      showMsg(accept ? 'Accepted' : 'Rejected');
      fetchAll();
      onRefresh?.();
    } catch (err: any) { showMsg(err.response?.data?.error || 'Review failed'); }
  };

  // ── Role Management ────────────────────────────────
  const handleCreateRole = async () => {
    if (!newRoleName.trim()) return;
    try {
      await createSyndicateRole(syndicateId, newRoleName.trim(), newRolePerms);
      showMsg('Role created');
      setNewRoleName('');
      setNewRolePerms([]);
      fetchAll();
    } catch (err: any) { showMsg(err.response?.data?.error || 'Failed'); }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Delete this role?')) return;
    try {
      await deleteSyndicateRole(syndicateId, roleId);
      showMsg('Role deleted');
      fetchAll();
    } catch (err: any) { showMsg(err.response?.data?.error || 'Failed'); }
  };

  const handleTogglePerm = async (roleId: string, role: Role, perm: string) => {
    const newPerms = role.permissions.includes(perm)
      ? role.permissions.filter(p => p !== perm)
      : [...role.permissions, perm];
    try {
      await updateSyndicateRole(syndicateId, roleId, { permissions: newPerms });
      fetchAll();
    } catch (err: any) { showMsg(err.response?.data?.error || 'Failed'); }
  };

  // ── Invite Codes ───────────────────────────────────
  const handleGenCode = async () => {
    try {
      await createInviteCode(syndicateId, codeUses, codeExpiry);
      showMsg('Code generated');
      fetchAll();
    } catch (err: any) { showMsg(err.response?.data?.error || 'Failed'); }
  };

  const handleRevokeCode = async (codeId: string) => {
    try {
      await revokeInviteCode(syndicateId, codeId);
      showMsg('Code revoked');
      fetchAll();
    } catch (err: any) { showMsg(err.response?.data?.error || 'Failed'); }
  };

  // ── Settings ───────────────────────────────────────
  const handleSaveSettings = async () => {
    try {
      await updateSyndicateSettings(syndicateId, settingsForm);
      showMsg('Settings saved');
      setEditingSettings(false);
      fetchAll();
    } catch (err: any) { showMsg(err.response?.data?.error || 'Failed'); }
  };

  const content = (
    <>
      {actionMsg && <div style={{ color: 'var(--cyan)', marginBottom: 4 }}>{actionMsg}</div>}

      {/* Member Management */}
      <div className="panel-subheader">Member Management</div>
      {members.filter(m => m.role !== 'leader').map(m => (
        <div key={m.id} className="panel-row" style={{ justifyContent: 'space-between', alignItems: 'center', padding: '2px 0' }}>
          <span style={{ fontSize: 11 }}>{m.username} <span style={{ color: '#666', fontSize: 9 }}>({m.role})</span></span>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <select
              value={m.role_id || ''}
              onChange={e => handleAssignRole(m.id, e.target.value || null)}
              className="qty-input"
              style={{ width: 'auto', fontSize: 9 }}
            >
              <option value="">No role</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
            <button className="btn-sm" style={{ background: '#400', color: 'var(--red)', fontSize: 9 }} onClick={() => handleKick(m.id)}>KICK</button>
          </div>
        </div>
      ))}

      {/* Pending Join Requests */}
      {requests.length > 0 && (
        <>
          <div className="panel-subheader" style={{ marginTop: 8 }}>Pending Requests ({requests.length})</div>
          {requests.map(r => (
            <div key={r.id} className="join-request-item">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{r.username} <span style={{ color: '#666', fontSize: 9 }}>Lvl {r.level}</span></span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn-sm btn-buy" style={{ fontSize: 9 }} onClick={() => handleReview(r.id, true)}>ACCEPT</button>
                  <button className="btn-sm btn-sell" style={{ fontSize: 9 }} onClick={() => handleReview(r.id, false)}>REJECT</button>
                </div>
              </div>
              {r.message && <div style={{ fontSize: 10, color: '#888', fontStyle: 'italic' }}>{r.message}</div>}
            </div>
          ))}
        </>
      )}

      {/* Role Management (leader only) */}
      {isLeader && (
        <>
          <div className="panel-subheader" style={{ marginTop: 8 }}>Role Management</div>
          {roles.map(r => (
            <div key={r.id} style={{ marginBottom: 6, padding: 4, border: '1px solid #222', background: '#0a0a0a' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span style={{ color: 'var(--cyan)', fontSize: 11 }}>{r.name} {r.is_preset && <span style={{ fontSize: 8, color: '#666' }}>(preset)</span>}</span>
                {!r.is_preset && (
                  <button className="btn-sm" style={{ background: '#400', color: 'var(--red)', fontSize: 8 }} onClick={() => handleDeleteRole(r.id)}>DEL</button>
                )}
              </div>
              <div className="permission-grid">
                {ALL_PERMISSIONS.map(p => (
                  <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 9, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={r.permissions.includes(p)}
                      onChange={() => handleTogglePerm(r.id, r, p)}
                      style={{ width: 12, height: 12 }}
                    />
                    {p.replace(/_/g, ' ')}
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div style={{ marginTop: 4, padding: 4, border: '1px dashed #333' }}>
            <div style={{ fontSize: 10, color: '#888', marginBottom: 2 }}>Create Custom Role</div>
            <div className="panel-row" style={{ gap: 4 }}>
              <input placeholder="Role name" value={newRoleName} onChange={e => setNewRoleName(e.target.value)} className="chat-input" style={{ flex: 1 }} />
              <button className="btn-sm btn-buy" onClick={handleCreateRole} style={{ fontSize: 9 }}>CREATE</button>
            </div>
            <div className="permission-grid" style={{ marginTop: 2 }}>
              {ALL_PERMISSIONS.map(p => (
                <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 9, cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={newRolePerms.includes(p)}
                    onChange={() => setNewRolePerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])}
                    style={{ width: 12, height: 12 }}
                  />
                  {p.replace(/_/g, ' ')}
                </label>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Invite Codes */}
      <div className="panel-subheader" style={{ marginTop: 8 }}>Invite Codes</div>
      <div className="panel-row" style={{ gap: 4, marginBottom: 4 }}>
        <label style={{ fontSize: 9, color: '#888' }}>Uses:</label>
        <input type="number" min={1} value={codeUses} onChange={e => setCodeUses(Number(e.target.value) || 1)} className="qty-input" style={{ width: 40 }} />
        <label style={{ fontSize: 9, color: '#888' }}>Expires (hrs):</label>
        <input type="number" min={1} value={codeExpiry} onChange={e => setCodeExpiry(Number(e.target.value) || 24)} className="qty-input" style={{ width: 50 }} />
        <button className="btn-sm btn-buy" onClick={handleGenCode} style={{ fontSize: 9 }}>GENERATE</button>
      </div>
      {inviteCodes.map(c => (
        <div key={c.id} className="invite-code-item">
          <span
            className="code-copy"
            onClick={() => { navigator.clipboard.writeText(c.code); showMsg('Copied!'); }}
            title="Click to copy"
          >
            {c.code}
          </span>
          <span style={{ fontSize: 9, color: '#888' }}>{c.uses_remaining} uses · by {c.createdBy}</span>
          <button className="btn-sm" style={{ background: '#400', color: 'var(--red)', fontSize: 8 }} onClick={() => handleRevokeCode(c.id)}>REVOKE</button>
        </div>
      ))}
      {inviteCodes.length === 0 && <div className="text-muted">No active codes</div>}

      {/* Settings (leader only) */}
      {isLeader && settings && (
        <>
          <div className="panel-subheader" style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
            <span>Settings</span>
            <button className="btn-sm" onClick={() => setEditingSettings(!editingSettings)} style={{ fontSize: 9 }}>
              {editingSettings ? 'CANCEL' : 'EDIT'}
            </button>
          </div>
          {editingSettings ? (
            <div className="admin-section">
              <div className="panel-row" style={{ gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
                <label style={{ fontSize: 9, color: '#888' }}>Recruitment:</label>
                <select value={settingsForm.recruitment_mode || 'closed'} onChange={e => setSettingsForm((s: any) => ({ ...s, recruitment_mode: e.target.value }))} className="qty-input" style={{ width: 'auto' }}>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="invite_only">Invite Only</option>
                </select>
              </div>
              <div className="panel-row" style={{ gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
                <label style={{ fontSize: 9, color: '#888' }}>Min Level:</label>
                <input type="number" min={1} value={settingsForm.min_level || 1} onChange={e => setSettingsForm((s: any) => ({ ...s, min_level: Number(e.target.value) }))} className="qty-input" style={{ width: 40 }} />
                <label style={{ fontSize: 9, color: '#888' }}>Quorum %:</label>
                <input type="number" min={1} max={100} value={settingsForm.quorum_percent || 60} onChange={e => setSettingsForm((s: any) => ({ ...s, quorum_percent: Number(e.target.value) }))} className="qty-input" style={{ width: 40 }} />
                <label style={{ fontSize: 9, color: '#888' }}>Vote hrs:</label>
                <input type="number" min={1} value={settingsForm.vote_duration_hours || 48} onChange={e => setSettingsForm((s: any) => ({ ...s, vote_duration_hours: Number(e.target.value) }))} className="qty-input" style={{ width: 50 }} />
              </div>
              <div className="panel-row" style={{ gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
                <label style={{ fontSize: 9, color: '#888' }}>Succession:</label>
                <select value={settingsForm.succession_rule || 'officer_vote'} onChange={e => setSettingsForm((s: any) => ({ ...s, succession_rule: e.target.value }))} className="qty-input" style={{ width: 'auto' }}>
                  <option value="officer_vote">Officer Vote</option>
                  <option value="highest_rank">Highest Rank</option>
                  <option value="founder_line">Founder Line</option>
                </select>
                <label style={{ fontSize: 9, color: '#888' }}>Treasury Limit:</label>
                <input type="number" min={0} value={settingsForm.treasury_withdrawal_limit || 0} onChange={e => setSettingsForm((s: any) => ({ ...s, treasury_withdrawal_limit: Number(e.target.value) }))} className="qty-input" style={{ width: 70 }} />
              </div>
              <div style={{ marginBottom: 4 }}>
                <label style={{ fontSize: 9, color: '#888' }}>Motto:</label>
                <input value={settingsForm.motto || ''} onChange={e => setSettingsForm((s: any) => ({ ...s, motto: e.target.value }))} className="chat-input" />
              </div>
              <div style={{ marginBottom: 4 }}>
                <label style={{ fontSize: 9, color: '#888' }}>Description:</label>
                <textarea value={settingsForm.description || ''} onChange={e => setSettingsForm((s: any) => ({ ...s, description: e.target.value }))} className="chat-input" style={{ width: '100%', minHeight: 40, resize: 'vertical' }} />
              </div>
              <button className="btn-sm btn-buy" onClick={handleSaveSettings}>SAVE SETTINGS</button>
            </div>
          ) : (
            <div style={{ fontSize: 10, color: '#888' }}>
              <div>Recruitment: {settings.recruitment_mode} · Min Level: {settings.min_level}</div>
              <div>Quorum: {settings.quorum_percent}% · Vote Duration: {settings.vote_duration_hours}h</div>
              <div>Succession: {settings.succession_rule?.replace(/_/g, ' ')} · Treasury Limit: {settings.treasury_withdrawal_limit}</div>
            </div>
          )}
        </>
      )}
    </>
  );

  return <div className="panel-content">{content}</div>;
}
