import { useRef, useEffect, useState, type KeyboardEvent } from 'react';
import type { TerminalLine } from '../hooks/useGameState';
import './Terminal.css';

interface TerminalProps {
  lines: TerminalLine[];
  onCommand: (command: string) => void;
  sectorId?: number;
}

export default function Terminal({ lines, onCommand, sectorId }: TerminalProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && input.trim()) {
      onCommand(input.trim());
      setHistory(prev => [input.trim(), ...prev]);
      setInput('');
      setHistoryIdx(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIdx < history.length - 1) {
        const newIdx = historyIdx + 1;
        setHistoryIdx(newIdx);
        setInput(history[newIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const newIdx = historyIdx - 1;
        setHistoryIdx(newIdx);
        setInput(history[newIdx]);
      } else {
        setHistoryIdx(-1);
        setInput('');
      }
    }
  };

  return (
    <div className="terminal" onClick={() => inputRef.current?.focus()}>
      <div className="terminal-header">
        <span className="dot red" />
        <span className="dot yellow" />
        <span className="dot green" />
        <span>COSMIC HORIZON {sectorId !== undefined ? `| Sector ${sectorId}` : ''}</span>
      </div>
      <div className="terminal-output" ref={outputRef}>
        {lines.map(line => (
          <div key={line.id} className={`terminal-line ${line.type}`}>
            {line.text}
          </div>
        ))}
      </div>
      <div className="terminal-input-area">
        <span className="terminal-prompt">&gt;</span>
        <input
          ref={inputRef}
          className="terminal-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter command..."
          autoFocus
        />
      </div>
    </div>
  );
}
