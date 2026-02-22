import { useState, useEffect, useRef } from 'react';
import PixelScene from './PixelScene';
import type { SceneDefinition } from '../config/scene-types';

interface SceneViewportProps {
  actionScene: SceneDefinition | null;
  ambientScene: SceneDefinition | null;
  onActionComplete: () => void;
  sectorId?: number;
  shipType?: string;
}

export default function SceneViewport({ actionScene, ambientScene, onActionComplete, sectorId, shipType }: SceneViewportProps) {
  const scene = actionScene ?? ambientScene;
  const [flash, setFlash] = useState(false);
  const prevSceneId = useRef<string | null>(null);

  // Transition flash when scene changes
  useEffect(() => {
    if (scene && prevSceneId.current && scene.id !== prevSceneId.current) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 250);
      return () => clearTimeout(t);
    }
    prevSceneId.current = scene?.id ?? null;
  }, [scene?.id]);

  const label = actionScene
    ? actionScene.id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).replace(/\d+$/, '').trim()
    : sectorId != null
      ? `Sector ${sectorId}`
      : 'Idle';

  // Derive glow context from scene ID
  const sceneId = scene?.id ?? '';
  let glowClass = '';
  if (actionScene && /combat|fire|volley|destroyed/.test(sceneId)) {
    glowClass = 'scene-viewport--combat';
  } else if (/docked/.test(sceneId)) {
    glowClass = 'scene-viewport--docked';
  } else if (actionScene && /flee|danger/.test(sceneId)) {
    glowClass = 'scene-viewport--danger';
  }

  if (!scene) return <div className="scene-viewport scene-viewport--empty" />;

  return (
    <div className={`scene-viewport ${glowClass}`}>
      <div className="viewport-space-bg" />
      <PixelScene
        key={scene.id}
        scene={scene}
        renderMode="inline"
        onComplete={actionScene ? onActionComplete : () => {}}
      />
      {/* HUD overlay */}
      <div className="viewport-hud">
        <span className="viewport-hud__tl">{label}</span>
        <span className="viewport-hud__tr">{shipType ?? ''}</span>
        <span className="viewport-hud__bl">{actionScene ? 'ACTION' : 'AMBIENT'}</span>
      </div>
      {/* Vignette */}
      <div className="viewport-vignette" />
      {/* Transition flash */}
      {flash && <div className="viewport-flash" />}
    </div>
  );
}
