import { useRef, useEffect, useMemo } from 'react';
import type { TerminalLine } from '../hooks/useGameState';

interface NotificationLogProps {
  lines: TerminalLine[];
  onClear: () => void;
}

const PREFIX_MAP: Record<string, { icon: string; cls: string }> = {
  error:   { icon: '[!]', cls: 'log-prefix--error' },
  warning: { icon: '[\u26A0]', cls: 'log-prefix--warning' },
  info:    { icon: '[i]', cls: 'log-prefix--info' },
  success: { icon: '[\u2713]', cls: 'log-prefix--success' },
  system:  { icon: '[\u2605]', cls: 'log-prefix--system' },
  combat:  { icon: '[\u2694]', cls: 'log-prefix--combat' },
  trade:   { icon: '[$]', cls: 'log-prefix--trade' },
};

export default function NotificationLog({ lines, onClear }: NotificationLogProps) {
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [lines]);

  // Randomized scanline timings
  const scanlines = useMemo(() => [
    { dur: 8, delay: 0 },
    { dur: 13, delay: 4 },
  ], []);

  return (
    <div className="notification-log">
      <div className="log-header">
        <span>NOTIFICATION LOG</span>
        <button className="log-clear-btn" onClick={onClear}>CLEAR</button>
      </div>
      <div className="log-output" ref={outputRef}>
        {lines.map(line => {
          const prefix = PREFIX_MAP[line.type] || PREFIX_MAP.info;
          // Stagger prefix animation per line
          const prefixDur = 5 + (line.id % 5) * 2;
          const prefixDelay = (line.id * 1.3) % 8;
          return (
            <div key={line.id} className={`log-line log-line--${line.type}`}>
              <span
                className={`log-prefix ${prefix.cls} log-prefix--animated`}
                style={{
                  '--prefix-dur': `${prefixDur}s`,
                  '--prefix-delay': `${prefixDelay}s`,
                } as React.CSSProperties}
              >
                {prefix.icon}
              </span>
              {line.text}
            </div>
          );
        })}
        {/* Scanline sweeps */}
        {scanlines.map((s, i) => (
          <div
            key={i}
            className="log-scanline"
            style={{
              '--scanline-dur': `${s.dur}s`,
              '--scanline-delay': `${s.delay}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}
