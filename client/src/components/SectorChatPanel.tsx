import { useState, useCallback, useRef, useEffect } from 'react';
import CollapsiblePanel from './CollapsiblePanel';

export interface ChatMessage {
  id: number;
  senderName: string;
  message: string;
  isOwn: boolean;
}

interface Props {
  messages: ChatMessage[];
  onSend: (message: string) => void;
}

export default function SectorChatPanel({ messages, onSend }: Props) {
  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const msg = input.trim();
    if (!msg) return;
    onSend(msg);
    setInput('');
  }, [input, onSend]);

  return (
    <CollapsiblePanel title="SECTOR CHAT" badge={messages.length || null}>
      <div className="chat-messages" ref={listRef}>
        {messages.length === 0 ? (
          <div className="text-muted">No messages yet</div>
        ) : (
          messages.map(m => (
            <div key={m.id} className={`chat-msg ${m.isOwn ? 'chat-msg--own' : ''}`}>
              <span className="chat-msg__name">[{m.senderName}]</span> {m.message}
            </div>
          ))
        )}
      </div>
      <form className="chat-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          maxLength={500}
        />
      </form>
    </CollapsiblePanel>
  );
}
