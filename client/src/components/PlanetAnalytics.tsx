import { useState, useEffect } from 'react';
import { getProductionHistory } from '../services/api';

interface PlanetSummary {
  id: string;
  name: string;
  planetClass: string;
  colonists: number;
  production: { cyrillium: number; tech: number; drones: number };
}

interface HistoryEntry {
  tickAt: string;
  cyrilliumProduced: number;
  techProduced: number;
  dronesProduced: number;
  foodConsumed: number;
  colonistCount: number;
  happiness: number;
}

interface Props {
  planets: PlanetSummary[];
}

const IDEAL_POP: Record<string, number> = {
  H: 1000, D: 500, O: 800, A: 700, F: 400, V: 300, G: 200, S: 5000,
};

const TIME_RANGES = [
  { label: '24h', hours: 24 },
  { label: '3d', hours: 72 },
  { label: '7d', hours: 168 },
];

export default function PlanetAnalytics({ planets }: Props) {
  const [selectedPlanetId, setSelectedPlanetId] = useState<string>('');
  const [timeRange, setTimeRange] = useState(24);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedPlanet = planets.find(p => p.id === selectedPlanetId);

  useEffect(() => {
    if (planets.length > 0 && !selectedPlanetId) {
      setSelectedPlanetId(planets[0].id);
    }
  }, [planets, selectedPlanetId]);

  useEffect(() => {
    if (!selectedPlanetId) return;
    setLoading(true);
    getProductionHistory(selectedPlanetId, timeRange)
      .then(({ data }) => setHistory(data.history || []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [selectedPlanetId, timeRange]);

  if (planets.length === 0) {
    return <div className="text-muted">No planets to analyze.</div>;
  }

  const renderTheoreticalCurve = () => {
    if (!selectedPlanet) return null;
    const ideal = IDEAL_POP[selectedPlanet.planetClass] || 10000;
    const maxPop = ideal * 2;
    const w = 460;
    const h = 200;
    const pad = { top: 14, right: 14, bottom: 24, left: 40 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;

    // Compute production at various population levels
    const points: { pop: number; cyr: number; tech: number }[] = [];
    const currentCyr = selectedPlanet.production.cyrillium;
    const currentTech = selectedPlanet.production.tech;

    for (let i = 0; i <= 40; i++) {
      const pop = (maxPop / 40) * i;
      let eff = 1.0;
      if (pop > ideal) {
        const ratio = pop / ideal;
        eff = 1.0 / (ratio * ratio);
      }
      const units = pop / 10;
      // Use simple approximation (no race bonus shown)
      const cyr = Math.floor(currentCyr > 0 ? (currentCyr / Math.max(selectedPlanet.colonists / 10, 0.001)) * units * eff : 0);
      const tech = Math.floor(currentTech > 0 ? (currentTech / Math.max(selectedPlanet.colonists / 10, 0.001)) * units * eff : 0);
      points.push({ pop, cyr, tech });
    }

    const maxVal = Math.max(...points.map(p => Math.max(p.cyr, p.tech)), 1);

    const toX = (pop: number) => pad.left + (pop / maxPop) * chartW;
    const toY = (val: number) => pad.top + chartH - (val / maxVal) * chartH;

    const cyrLine = points.map(p => `${toX(p.pop)},${toY(p.cyr)}`).join(' ');
    const techLine = points.map(p => `${toX(p.pop)},${toY(p.tech)}`).join(' ');

    const currentX = toX(selectedPlanet.colonists);

    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Theoretical Production Curve</div>
        <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" style={{ background: '#0a0a0a', border: '1px solid #333', borderRadius: 4 }}>
          {/* Axes */}
          <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + chartH} stroke="#333" />
          <line x1={pad.left} y1={pad.top + chartH} x2={pad.left + chartW} y2={pad.top + chartH} stroke="#333" />
          {/* Ideal population line */}
          <line x1={toX(ideal)} y1={pad.top} x2={toX(ideal)} y2={pad.top + chartH} stroke="#444" strokeDasharray="4,4" />
          <text x={toX(ideal)} y={pad.top + chartH + 14} fill="#666" fontSize={8} textAnchor="middle">Ideal</text>
          {/* Curves */}
          <polyline points={cyrLine} fill="none" stroke="#4af" strokeWidth={2} />
          <polyline points={techLine} fill="none" stroke="#a4f" strokeWidth={2} />
          {/* Current position */}
          <line x1={currentX} y1={pad.top} x2={currentX} y2={pad.top + chartH} stroke="#0f0" strokeWidth={1} strokeDasharray="3,3" />
          <circle cx={currentX} cy={toY(currentCyr)} r={4} fill="#4af" />
          <circle cx={currentX} cy={toY(currentTech)} r={4} fill="#a4f" />
          {/* Labels */}
          <text x={pad.left + 4} y={pad.top + 10} fill="#4af" fontSize={9}>Cyr</text>
          <text x={pad.left + 28} y={pad.top + 10} fill="#a4f" fontSize={9}>Tech</text>
          <text x={w - pad.right} y={pad.top + chartH + 16} fill="#666" fontSize={9} textAnchor="end">2x ideal</text>
          <text x={pad.left} y={pad.top + chartH + 16} fill="#666" fontSize={9}>0</text>
        </svg>
      </div>
    );
  };

  const renderHistoricalChart = () => {
    if (history.length < 2) {
      return <div className="text-muted" style={{ fontSize: 11 }}>Not enough data yet. Check back after a few ticks.</div>;
    }

    const w = 460;
    const h = 240;
    const pad = { top: 14, right: 14, bottom: 24, left: 40 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;

    const maxCyr = Math.max(...history.map(h => h.cyrilliumProduced), 1);
    const maxTech = Math.max(...history.map(h => h.techProduced), 1);
    const maxFood = Math.max(...history.map(h => h.foodConsumed), 1);
    const maxProdVal = Math.max(maxCyr, maxTech, maxFood);

    const toX = (i: number) => pad.left + (i / (history.length - 1)) * chartW;
    const toY = (val: number, max: number) => pad.top + chartH - (val / max) * chartH;

    const cyrLine = history.map((h, i) => `${toX(i)},${toY(h.cyrilliumProduced, maxProdVal)}`).join(' ');
    const techLine = history.map((h, i) => `${toX(i)},${toY(h.techProduced, maxProdVal)}`).join(' ');
    const foodLine = history.map((h, i) => `${toX(i)},${toY(h.foodConsumed, maxProdVal)}`).join(' ');
    const happyLine = history.map((h, i) => `${toX(i)},${toY(h.happiness, 100)}`).join(' ');

    return (
      <div>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Historical Production</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
          {TIME_RANGES.map(tr => (
            <span
              key={tr.hours}
              onClick={() => setTimeRange(tr.hours)}
              style={{
                cursor: 'pointer',
                fontSize: 10,
                color: timeRange === tr.hours ? '#0f0' : '#666',
                borderBottom: timeRange === tr.hours ? '1px solid #0f0' : 'none',
              }}
            >
              {tr.label}
            </span>
          ))}
        </div>
        <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" style={{ background: '#0a0a0a', border: '1px solid #333', borderRadius: 4 }}>
          {/* Axes */}
          <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + chartH} stroke="#333" />
          <line x1={pad.left} y1={pad.top + chartH} x2={pad.left + chartW} y2={pad.top + chartH} stroke="#333" />
          {/* Lines */}
          <polyline points={cyrLine} fill="none" stroke="#4af" strokeWidth={2} />
          <polyline points={techLine} fill="none" stroke="#a4f" strokeWidth={2} />
          <polyline points={foodLine} fill="none" stroke="#f44" strokeWidth={1.5} />
          <polyline points={happyLine} fill="none" stroke="#4f4" strokeWidth={1.5} strokeDasharray="4,3" />
          {/* Legend */}
          <text x={pad.left + 4} y={pad.top + 10} fill="#4af" fontSize={9}>Cyr</text>
          <text x={pad.left + 28} y={pad.top + 10} fill="#a4f" fontSize={9}>Tech</text>
          <text x={pad.left + 56} y={pad.top + 10} fill="#f44" fontSize={9}>Food</text>
          <text x={pad.left + 84} y={pad.top + 10} fill="#4f4" fontSize={9}>Happy</text>
        </svg>
      </div>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <select
          value={selectedPlanetId}
          onChange={e => setSelectedPlanetId(e.target.value)}
          style={{
            background: '#111', border: '1px solid #333', color: '#ccc',
            padding: '4px 8px', fontSize: 12, width: '100%',
          }}
        >
          {planets.map(p => (
            <option key={p.id} value={p.id}>{p.name} [{p.planetClass}]</option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="text-muted">Loading analytics...</div>
      ) : (
        <>
          {renderTheoreticalCurve()}
          {renderHistoricalChart()}
        </>
      )}
    </div>
  );
}
