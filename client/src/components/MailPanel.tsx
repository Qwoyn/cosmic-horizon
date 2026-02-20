import { useState, useEffect } from 'react';
import { getInbox, getSentMessages, readMessage, sendMessage, deleteMessage } from '../services/api';

interface MailMessage {
  id: string;
  senderId?: string;
  senderName: string;
  recipientName?: string;
  subject: string;
  body?: string;
  read?: boolean;
  createdAt: string;
}

type MailView = 'inbox' | 'sent' | 'compose';

interface Props {
  refreshKey?: number;
  onAction?: () => void;
}

export default function MailPanel({ refreshKey, onAction }: Props) {
  const [view, setView] = useState<MailView>('inbox');
  const [inbox, setInbox] = useState<MailMessage[]>([]);
  const [sent, setSent] = useState<MailMessage[]>([]);
  const [selectedMsg, setSelectedMsg] = useState<MailMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Compose fields
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sendResult, setSendResult] = useState('');

  const fetchInbox = () => {
    setLoading(true);
    getInbox()
      .then(({ data }) => setInbox(data.messages || []))
      .catch(() => setError('Failed to load inbox'))
      .finally(() => setLoading(false));
  };

  const fetchSent = () => {
    setLoading(true);
    getSentMessages()
      .then(({ data }) => setSent(data.messages || []))
      .catch(() => setError('Failed to load sent messages'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (view === 'inbox') fetchInbox();
    else if (view === 'sent') fetchSent();
    else setLoading(false);
  }, [view, refreshKey]);

  const handleRead = async (msg: MailMessage) => {
    try {
      const { data } = await readMessage(msg.id);
      setSelectedMsg({ ...msg, body: data.body || data.message?.body || msg.body, read: true });
    } catch {
      setSelectedMsg(msg);
    }
  };

  const handleDelete = async (id: string) => {
    setBusy(true);
    setError('');
    try {
      await deleteMessage(id);
      setSelectedMsg(null);
      if (view === 'inbox') fetchInbox();
      else fetchSent();
      onAction?.();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Delete failed');
    } finally {
      setBusy(false);
    }
  };

  const handleSend = async () => {
    if (!recipient.trim() || !subject.trim()) {
      setError('Recipient and subject required');
      return;
    }
    setBusy(true);
    setError('');
    setSendResult('');
    try {
      await sendMessage(recipient.trim(), subject.trim(), body);
      setSendResult('Message sent!');
      setRecipient('');
      setSubject('');
      setBody('');
      onAction?.();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Send failed');
    } finally {
      setBusy(false);
    }
  };

  // Sub-tabs
  const subTabs = (
    <div className="mail-subtabs">
      {(['inbox', 'sent', 'compose'] as MailView[]).map((v, i) => (
        <span key={v}>
          {i > 0 && <span style={{ color: '#444', margin: '0 0.3rem' }}>|</span>}
          <span
            onClick={() => { setView(v); setSelectedMsg(null); setError(''); setSendResult(''); }}
            style={{ cursor: 'pointer', color: view === v ? '#0f0' : '#666', fontSize: '0.8rem' }}
          >
            {view === v ? `[${v.charAt(0).toUpperCase() + v.slice(1)}]` : v.charAt(0).toUpperCase() + v.slice(1)}
          </span>
        </span>
      ))}
    </div>
  );

  // Reading a message
  if (selectedMsg) {
    return (
      <div className="mail-content">
        {subTabs}
        <div className="mail-message-view">
          <div className="mail-message-header">
            <div className="mail-message-subject">{selectedMsg.subject}</div>
            <div className="text-muted" style={{ fontSize: '10px' }}>
              From: {selectedMsg.senderName} | {new Date(selectedMsg.createdAt).toLocaleString()}
            </div>
          </div>
          <div className="mail-message-body">{selectedMsg.body || '(no content)'}</div>
          <div className="mail-message-actions">
            <button className="btn-sm" onClick={() => setSelectedMsg(null)} style={{ color: 'var(--cyan)', borderColor: 'var(--cyan)' }}>BACK</button>
            <button className="btn-sm" onClick={() => handleDelete(selectedMsg.id)} disabled={busy} style={{ color: 'var(--red)', borderColor: 'var(--red)' }}>
              {busy ? '...' : 'DELETE'}
            </button>
            <button className="btn-sm" onClick={() => { setRecipient(selectedMsg.senderName); setSubject(`Re: ${selectedMsg.subject}`); setView('compose'); setSelectedMsg(null); }} style={{ color: 'var(--blue)', borderColor: 'var(--blue)' }}>
              REPLY
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mail-content">
      {subTabs}
      {error && <div className="mall-error">{error}</div>}
      {view === 'compose' ? (
        <div className="mail-compose">
          {sendResult && <div className="mall-success">{sendResult}</div>}
          <div className="mail-field">
            <label>To:</label>
            <input className="mail-input" value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="Player name" />
          </div>
          <div className="mail-field">
            <label>Subject:</label>
            <input className="mail-input" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" />
          </div>
          <div className="mail-field">
            <label>Message:</label>
            <textarea className="mail-textarea" value={body} onChange={e => setBody(e.target.value)} rows={4} placeholder="Type your message..." />
          </div>
          <button className="btn-sm btn-buy" disabled={busy} onClick={handleSend}>
            {busy ? 'SENDING...' : 'SEND'}
          </button>
        </div>
      ) : loading ? (
        <div className="text-muted">Loading...</div>
      ) : (
        <div className="mail-list">
          {(view === 'inbox' ? inbox : sent).length === 0 ? (
            <div className="text-muted">No messages.</div>
          ) : (
            (view === 'inbox' ? inbox : sent).map(msg => (
              <div
                key={msg.id}
                className={`mail-list-item${msg.read === false ? ' mail-list-item--unread' : ''}`}
                onClick={() => handleRead(msg)}
              >
                <div className="mail-list-item__header">
                  <span className="mail-list-item__from">{view === 'inbox' ? msg.senderName : (msg.recipientName || 'Unknown')}</span>
                  {msg.read === false && <span className="mail-unread-badge">NEW</span>}
                </div>
                <div className="mail-list-item__subject">{msg.subject}</div>
                <div className="mail-list-item__date">{new Date(msg.createdAt).toLocaleDateString()}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
