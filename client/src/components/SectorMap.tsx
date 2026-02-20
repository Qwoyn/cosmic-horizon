import { useMemo, useRef, useCallback, useState, useEffect } from 'react';

export interface MapData {
  currentSectorId: number;
  sectors: { id: number; type: string; regionId: number; hasStarMall: boolean; hasOutposts: boolean; hasPlanets: boolean }[];
  edges: { from: number; to: number; oneWay: boolean }[];
}

interface Props {
  mapData: MapData | null;
  currentSectorId: number | null;
  adjacentSectorIds: number[];
  onMoveToSector: (sectorId: number) => void;
  compact?: boolean;
}

const WIDTH = 400;
const HEIGHT = 380;
const NODE_RADIUS = 14;
const IDEAL_EDGE_LENGTH = 60;
const ITERATIONS = 120;

const ZOOM_LEVELS = [1, 1.5, 2];

// Generate deterministic star positions for background layers
function generateStars(count: number, seed: number): string {
  const stars: string[] = [];
  // Simple seeded random
  let s = seed;
  const rand = () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < count; i++) {
    const x = Math.round(rand() * 2000);
    const y = Math.round(rand() * 2000);
    stars.push(`${x}px ${y}px`);
  }
  return stars.join(', ');
}

// Pre-generate 3 star layers (far=tiny+many, mid, near=big+few)
const STAR_LAYER_FAR = generateStars(200, 42);
const STAR_LAYER_MID = generateStars(80, 137);
const STAR_LAYER_NEAR = generateStars(30, 293);

// Map sector type to fill color (CSS variable values)
const TYPE_FILLS: Record<string, string> = {
  standard: '#1a2332',
  protected: '#1a3a2a',
  harmony_enforced: '#1a2a3a',
  one_way: '#2a2a1a',
};

function computeLayout(
  sectors: MapData['sectors'],
  edges: MapData['edges'],
  currentSectorId: number,
  cached: Map<number, { x: number; y: number }>,
): Map<number, { x: number; y: number }> {
  const positions = new Map<number, { x: number; y: number }>();

  // Build adjacency for neighbor lookup
  const adjacency = new Map<number, Set<number>>();
  for (const s of sectors) adjacency.set(s.id, new Set());
  for (const e of edges) {
    adjacency.get(e.from)?.add(e.to);
    adjacency.get(e.to)?.add(e.from);
  }

  // Initialize positions: use cached, or place near a connected neighbor, or center
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2;
  for (const s of sectors) {
    const c = cached.get(s.id);
    if (c) {
      positions.set(s.id, { x: c.x, y: c.y });
    } else {
      // Try to place near a connected neighbor that already has a position
      let placed = false;
      const neighbors = adjacency.get(s.id);
      if (neighbors) {
        for (const nid of neighbors) {
          const np = positions.get(nid) || cached.get(nid);
          if (np) {
            const angle = Math.random() * Math.PI * 2;
            positions.set(s.id, {
              x: np.x + Math.cos(angle) * IDEAL_EDGE_LENGTH,
              y: np.y + Math.sin(angle) * IDEAL_EDGE_LENGTH,
            });
            placed = true;
            break;
          }
        }
      }
      if (!placed) {
        // Random position spread across canvas
        positions.set(s.id, {
          x: cx + (Math.random() - 0.5) * WIDTH * 0.6,
          y: cy + (Math.random() - 0.5) * HEIGHT * 0.6,
        });
      }
    }
  }

  if (sectors.length <= 1) {
    // Single node: just center it
    if (sectors.length === 1) positions.set(sectors[0].id, { x: cx, y: cy });
    return positions;
  }

  // Force-directed iterations
  const velocities = new Map<number, { vx: number; vy: number }>();
  for (const s of sectors) velocities.set(s.id, { vx: 0, vy: 0 });

  const damping = 0.82;
  const padding = NODE_RADIUS + 6;
  const repulsionStrength = 3000;

  for (let iter = 0; iter < ITERATIONS; iter++) {
    const temp = 1 - iter / ITERATIONS; // cooling factor

    // Repulsion between all pairs
    for (let i = 0; i < sectors.length; i++) {
      for (let j = i + 1; j < sectors.length; j++) {
        const a = positions.get(sectors[i].id)!;
        const b = positions.get(sectors[j].id)!;
        let dx = a.x - b.x;
        let dy = a.y - b.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) { dx = 1; dy = 0; dist = 1; }
        const force = repulsionStrength / (dist * dist);
        const fx = (dx / dist) * force * temp;
        const fy = (dy / dist) * force * temp;
        const va = velocities.get(sectors[i].id)!;
        const vb = velocities.get(sectors[j].id)!;
        va.vx += fx; va.vy += fy;
        vb.vx -= fx; vb.vy -= fy;
      }
    }

    // Attraction along edges — spring toward ideal length
    for (const e of edges) {
      const a = positions.get(e.from);
      const b = positions.get(e.to);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 1) continue;
      // Spring force: pulls together if dist > ideal, pushes apart if dist < ideal
      const displacement = dist - IDEAL_EDGE_LENGTH;
      const force = 0.08 * displacement * temp;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      const va = velocities.get(e.from)!;
      const vb = velocities.get(e.to)!;
      va.vx += fx; va.vy += fy;
      vb.vx -= fx; vb.vy -= fy;
    }

    // Gentle center pull on current sector
    const cp = positions.get(currentSectorId);
    if (cp) {
      const cv = velocities.get(currentSectorId)!;
      cv.vx += (cx - cp.x) * 0.015 * temp;
      cv.vy += (cy - cp.y) * 0.015 * temp;
    }

    // Light gravity toward center for all nodes (prevents drifting)
    for (const s of sectors) {
      const p = positions.get(s.id)!;
      const v = velocities.get(s.id)!;
      v.vx += (cx - p.x) * 0.003 * temp;
      v.vy += (cy - p.y) * 0.003 * temp;
    }

    // Apply velocities
    for (const s of sectors) {
      const v = velocities.get(s.id)!;
      const p = positions.get(s.id)!;
      v.vx *= damping;
      v.vy *= damping;
      p.x += v.vx;
      p.y += v.vy;
      // Boundary clamping
      p.x = Math.max(padding, Math.min(WIDTH - padding, p.x));
      p.y = Math.max(padding, Math.min(HEIGHT - padding, p.y));
    }
  }

  return positions;
}

export default function SectorMap({ mapData, currentSectorId, adjacentSectorIds, onMoveToSector, compact }: Props) {
  const positionCache = useRef<Map<number, { x: number; y: number }>>(new Map());
  const [zoomIndex, setZoomIndex] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const [hoveredSector, setHoveredSector] = useState<{ id: number; type: string; x: number; y: number } | null>(null);
  const [showLegend, setShowLegend] = useState(false);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const mapBodyRef = useRef<HTMLDivElement>(null);

  const handleParallaxMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    // Normalize to -1..1 from center
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setParallax({ x: nx, y: ny });
  }, []);

  const zoom = ZOOM_LEVELS[zoomIndex];

  const positions = useMemo(() => {
    if (!mapData || currentSectorId == null) return new Map<number, { x: number; y: number }>();
    const result = computeLayout(mapData.sectors, mapData.edges, currentSectorId, positionCache.current);
    // Update cache
    positionCache.current = new Map(result);
    return result;
  }, [mapData, currentSectorId]);

  const handleNodeClick = useCallback((sectorId: number) => {
    if (adjacentSectorIds.includes(sectorId)) {
      onMoveToSector(sectorId);
    }
  }, [adjacentSectorIds, onMoveToSector]);

  const handleZoomIn = useCallback(() => {
    setZoomIndex(i => Math.min(i + 1, ZOOM_LEVELS.length - 1));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomIndex(i => {
      const next = Math.max(i - 1, 0);
      if (next === 0) setPan({ x: 0, y: 0 });
      return next;
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    dragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { x: pan.x, y: pan.y };
  }, [zoom, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    const vw = WIDTH / zoom;
    const vh = HEIGHT / zoom;
    // Convert pixel movement to viewBox units
    const svgEl = e.currentTarget;
    const rect = svgEl.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const scaleY = HEIGHT / rect.height;
    const dx = (e.clientX - dragStart.current.x) * scaleX / zoom;
    const dy = (e.clientY - dragStart.current.y) * scaleY / zoom;
    // Pan limits: always allow a minimum pan range even at base zoom
    const maxPanX = Math.max((WIDTH - vw) / 2, WIDTH * 0.3);
    const maxPanY = Math.max((HEIGHT - vh) / 2, HEIGHT * 0.3);
    setPan({
      x: Math.max(-maxPanX, Math.min(maxPanX, panStart.current.x - dx)),
      y: Math.max(-maxPanY, Math.min(maxPanY, panStart.current.y - dy)),
    });
  }, [zoom]);

  const handleMouseUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const effectiveWidth = compact ? 240 : WIDTH;
  const effectiveHeight = compact ? 200 : HEIGHT;

  if (!mapData || currentSectorId == null) return null;

  const adjacentSet = new Set(adjacentSectorIds);

  // Deduplicate bidirectional edges by canonical key
  const edgeMap = new Map<string, { from: number; to: number; oneWay: boolean }>();
  for (const e of mapData.edges) {
    const key = e.oneWay
      ? `${e.from}->${e.to}`
      : `${Math.min(e.from, e.to)}-${Math.max(e.from, e.to)}`;
    if (!edgeMap.has(key)) {
      edgeMap.set(key, e);
    }
  }
  const dedupedEdges = Array.from(edgeMap.values());

  // Compute viewBox based on zoom and pan
  const vw = effectiveWidth / zoom;
  const vh = effectiveHeight / zoom;
  const vx = (effectiveWidth - vw) / 2 + pan.x;
  const vy = (effectiveHeight - vh) / 2 + pan.y;

  const zoomControls = (
    <span className="sector-map-controls">
      <button className="sector-map-zoom-btn" onClick={handleZoomOut} disabled={zoomIndex === 0} title="Zoom out">−</button>
      <button className="sector-map-zoom-btn" onClick={handleZoomIn} disabled={zoomIndex === ZOOM_LEVELS.length - 1} title="Zoom in">+</button>
    </span>
  );

  const svgContent = (
    <svg
      className="sector-map-svg"
      viewBox={`${vx} ${vy} ${vw} ${vh}`}
      xmlns="http://www.w3.org/2000/svg"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: dragging.current ? 'grabbing' : 'grab' }}
    >
      <defs>
        <marker
          id="arrowhead"
          markerWidth="8"
          markerHeight="6"
          refX="7"
          refY="3"
          orient="auto"
          className="sector-map-arrowhead"
        >
          <polygon points="0 0, 8 3, 0 6" />
        </marker>
      </defs>

      {/* Layer 1: Edges */}
      {dedupedEdges.map((e) => {
        const from = positions.get(e.from);
        const to = positions.get(e.to);
        if (!from || !to) return null;

        // Shorten line by NODE_RADIUS at each end
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) return null;
        const nx = dx / dist;
        const ny = dy / dist;
        const x1 = from.x + nx * NODE_RADIUS;
        const y1 = from.y + ny * NODE_RADIUS;
        const x2 = to.x - nx * NODE_RADIUS;
        const y2 = to.y - ny * NODE_RADIUS;

        const key = `edge-${e.from}-${e.to}`;
        return (
          <line
            key={key}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            className={`sector-map-edge${e.oneWay ? ' sector-map-edge--oneway' : ''}`}
            markerEnd={e.oneWay ? 'url(#arrowhead)' : undefined}
          />
        );
      })}

      {/* Layer 2: Nodes */}
      {mapData.sectors.map((s) => {
        const pos = positions.get(s.id);
        if (!pos) return null;

        const isCurrent = s.id === currentSectorId;
        const isAdjacent = adjacentSet.has(s.id);
        const fill = TYPE_FILLS[s.type] || TYPE_FILLS.standard;

        let nodeClass = 'sector-map-node sector-map-node--twinkle';
        if (isCurrent) nodeClass += ' sector-map-node--current';
        else if (isAdjacent) nodeClass += ' sector-map-node--adjacent';

        const typeClass = `sector-map-node--${s.type}`;

        return (
          <g
            key={`node-${s.id}`}
            transform={`translate(${pos.x}, ${pos.y})`}
            className={`${nodeClass} ${typeClass}`}
            onClick={isAdjacent ? () => handleNodeClick(s.id) : undefined}
            style={{
              ...(isAdjacent ? { cursor: 'pointer' } : {}),
              '--twinkle-dur': `${6 + (s.id % 7) * 2}s`,
              '--twinkle-delay': `${(s.id * 1.7) % 10}s`,
            } as React.CSSProperties}
            onMouseEnter={(e) => {
              const svgEl = e.currentTarget.closest('svg');
              if (!svgEl) return;
              const rect = svgEl.getBoundingClientRect();
              const svgPt = svgEl.createSVGPoint();
              svgPt.x = pos.x;
              svgPt.y = pos.y;
              const ctm = svgEl.getScreenCTM();
              if (ctm) {
                const screenPt = svgPt.matrixTransform(ctm);
                setHoveredSector({ id: s.id, type: s.type, x: screenPt.x - rect.left, y: screenPt.y - rect.top });
              }
            }}
            onMouseLeave={() => setHoveredSector(null)}
          >
            {/* Pulse ring for current sector */}
            {isCurrent && (
              <circle
                r={NODE_RADIUS + 4}
                className="sector-node-pulse"
              />
            )}

            {/* Hover glow for adjacent */}
            {isAdjacent && (
              <circle
                r={NODE_RADIUS + 2}
                className="sector-map-node-glow"
              />
            )}

            {/* Main circle */}
            <circle r={NODE_RADIUS} fill={fill} />

            {/* Sector ID label */}
            <text
              className={`sector-node-label${isCurrent ? ' sector-node-label--current' : ''}`}
              textAnchor="middle"
              dy="0.35em"
            >
              {s.id}
            </text>

            {/* Star Mall icon */}
            {s.hasStarMall && (
              <polygon
                className="sector-star-mall-icon"
                points="0,-8 1.8,-3 7,-3 2.8,0.5 4.3,5.5 0,2.5 -4.3,5.5 -2.8,0.5 -7,-3 -1.8,-3"
                transform={`translate(0, ${-NODE_RADIUS - 8}) scale(0.55)`}
              />
            )}

            {/* Outpost icon — diamond below-left */}
            {s.hasOutposts && (
              <polygon
                className="sector-outpost-icon"
                points="0,-4 4,0 0,4 -4,0"
                transform={`translate(-6, ${NODE_RADIUS + 8})`}
              />
            )}

            {/* Planet icon — circle below-right */}
            {s.hasPlanets && (
              <circle
                className="sector-planet-icon"
                cx={6}
                cy={NODE_RADIUS + 8}
                r={3.5}
              />
            )}
          </g>
        );
      })}
    </svg>
  );

  if (compact) {
    return (
      <div className="sector-map-compact" style={{ border: '1px solid var(--border)', borderRadius: 4 }}>
        <div className="sector-map-body" style={{ padding: 4 }}>
          {svgContent}
        </div>
      </div>
    );
  }

  return (
    <div className="sector-map-full">
      <div className="sector-map-full__header">
        <span className="sector-map-full__title">SECTOR MAP {currentSectorId != null ? `| ${currentSectorId}` : ''}</span>
        <span className="sector-map-controls">
          <button className="sector-map-zoom-btn" onClick={() => setShowLegend(v => !v)} title="Toggle legend">{showLegend ? '×' : '?'}</button>
          <button className="sector-map-zoom-btn" onClick={handleZoomOut} disabled={zoomIndex === 0} title="Zoom out">−</button>
          <button className="sector-map-zoom-btn" onClick={handleZoomIn} disabled={zoomIndex === ZOOM_LEVELS.length - 1} title="Zoom in">+</button>
        </span>
      </div>
      <div className="sector-map-body" style={{ padding: 4, position: 'relative' }} onMouseMove={handleParallaxMove} ref={mapBodyRef}>
        {/* Space background with parallax starfield + nebula */}
        <div className="space-bg">
          <div className="space-bg__nebula" style={{ transform: `translate(${parallax.x * 8}px, ${parallax.y * 8}px)` }} />
          <div className="space-bg__stars space-bg__stars--far" style={{ boxShadow: STAR_LAYER_FAR, transform: `translate(${parallax.x * 6}px, ${parallax.y * 6}px)` }} />
          <div className="space-bg__stars space-bg__stars--mid" style={{ boxShadow: STAR_LAYER_MID, transform: `translate(${parallax.x * 15}px, ${parallax.y * 15}px)` }} />
          <div className="space-bg__stars space-bg__stars--near" style={{ boxShadow: STAR_LAYER_NEAR, transform: `translate(${parallax.x * 28}px, ${parallax.y * 28}px)` }} />
        </div>
        {svgContent}
        {hoveredSector && (
          <div
            className="sector-map-tooltip"
            style={{ left: hoveredSector.x, top: hoveredSector.y - 28 }}
          >
            Sector {hoveredSector.id} [{hoveredSector.type}]
          </div>
        )}
        {showLegend && (
          <div className="sector-map-legend-overlay">
            <div className="sector-map-legend-overlay__title">LEGEND</div>
            <div className="sector-map-legend-overlay__items">
              <span className="sector-map-legend-item"><span style={{ color: 'var(--magenta)' }}>●</span> Current</span>
              <span className="sector-map-legend-item"><span style={{ color: 'var(--blue)' }}>●</span> Adjacent (click to warp)</span>
              <span className="sector-map-legend-item"><span style={{ color: 'var(--yellow)' }}>★</span> Star Mall</span>
              <span className="sector-map-legend-item"><span style={{ color: 'var(--green)' }}>◆</span> Outpost</span>
              <span className="sector-map-legend-item"><span style={{ color: 'var(--blue)' }}>●</span> Planet</span>
              <span className="sector-map-legend-item"><span style={{ color: 'var(--yellow)' }}>⤏</span> One-way route</span>
              <div style={{ borderTop: '1px solid var(--border)', marginTop: 4, paddingTop: 4 }}>
                <span className="sector-map-legend-item"><span className="sector-type-protected">■</span> Protected</span>
                <span className="sector-map-legend-item"><span className="sector-type-harmony_enforced">■</span> Harmony</span>
                <span className="sector-map-legend-item"><span className="sector-type-one_way">■</span> One-way</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
