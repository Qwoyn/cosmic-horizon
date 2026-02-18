import { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import Terminal from '../components/Terminal';
import StatusBar from '../components/StatusBar';
import MapPanel from '../components/MapPanel';
import TradeTable from '../components/TradeTable';
import CombatView from '../components/CombatView';
import ActiveMissionsPanel from '../components/ActiveMissionsPanel';
import SectorChatPanel, { type ChatMessage } from '../components/SectorChatPanel';
import PlayerListPanel from '../components/PlayerListPanel';
import InventoryPanel from '../components/InventoryPanel';
import NotesPanel from '../components/NotesPanel';
import WalletPanel from '../components/WalletPanel';
import TutorialOverlay from '../components/TutorialOverlay';
import IntroSequence, { INTRO_BEATS, POST_TUTORIAL_BEATS } from '../components/IntroSequence';
import PixelScene from '../components/PixelScene';
import SceneViewport from '../components/SceneViewport';
import ActivityBar from '../components/ActivityBar';
import ContextPanel from '../components/ContextPanel';
import DataStreamRain from '../components/DataStreamRain';
import { POST_TUTORIAL_SCENE } from '../config/scenes/post-tutorial-scene';
import { buildIdleSpaceScene, buildIdleOutpostScene, buildIdleDockedScene } from '../config/scenes/ambient-scenes';
import { buildCombatScene } from '../config/scenes/combat-scene';
import { buildDestroyedScene } from '../config/scenes/destroyed-scene';
import { useGameState } from '../hooks/useGameState';
import { useSocket } from '../hooks/useSocket';
import { useAudio } from '../hooks/useAudio';
import { useActivePanel } from '../hooks/useActivePanel';
import { handleCommand } from '../services/commands';
import { PANELS } from '../types/panels';

let chatIdCounter = 0;

interface GameProps {
  onLogout?: () => void;
}

export default function Game({ onLogout }: GameProps) {
  const game = useGameState();
  const { on, emit } = useSocket(game.player?.id ?? null);
  const audio = useAudio();
  const { activePanel, selectPanel, badges, incrementBadge } = useActivePanel('nav');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showPostTutorialScene, setShowPostTutorialScene] = useState(false);
  const [combatFlash, setCombatFlash] = useState(false);
  const lastSectorRef = useRef<number | null>(null);
  const lastListingRef = useRef<{ id: string; label: string }[] | null>(null);
  const activePanelRef = useRef(activePanel);
  activePanelRef.current = activePanel;

  const ambientScene = useMemo(() => {
    const ctx = {
      shipTypeId: game.player?.currentShip?.shipTypeId ?? 'scout',
      sectorType: game.sector?.type,
      planetClasses: game.sector?.planets?.map(p => p.planetClass) ?? [],
      playerCount: game.sector?.players?.length ?? 0,
      sectorId: game.sector?.sectorId,
    };
    if (game.player?.dockedAtOutpostId) {
      return buildIdleDockedScene(ctx);
    }
    if ((game.sector?.outposts?.length ?? 0) > 0) {
      return buildIdleOutpostScene(ctx);
    }
    return buildIdleSpaceScene(ctx);
  }, [game.player?.dockedAtOutpostId, game.sector?.outposts?.length, game.player?.currentShip?.shipTypeId, game.sector?.sectorId, game.sector?.type, game.sector?.planets?.length, game.sector?.players?.length]);

  // Clear chat when changing sectors
  useEffect(() => {
    if (game.player?.currentSectorId && game.player.currentSectorId !== lastSectorRef.current) {
      lastSectorRef.current = game.player.currentSectorId;
      setChatMessages([]);
    }
  }, [game.player?.currentSectorId]);

  useEffect(() => {
    game.refreshStatus();
    game.refreshSector();
    game.refreshTutorial();
    game.refreshMap();
  }, []);

  // Switch audio track based on game context
  useEffect(() => {
    if (!game.player) return;

    if (!game.player.hasSeenIntro) {
      audio.play('intro');
    } else if (game.player.tutorialCompleted && !game.player.hasSeenPostTutorial) {
      audio.play('post-tutorial');
    } else if (game.sector?.outposts?.length) {
      // At a sector with an outpost — could be star mall
      const hasStarMall = game.sector.outposts.length > 0;
      if (hasStarMall) {
        audio.play('starmall');
      } else {
        audio.play('gameplay');
      }
    } else {
      audio.play('gameplay');
    }
  }, [game.player?.hasSeenIntro, game.player?.hasSeenPostTutorial, game.player?.tutorialCompleted, game.sector?.sectorId]);

  // Listen for WebSocket events
  useEffect(() => {
    if (!game.player) return;

    const unsubs = [
      on('energy:update', (data: { energy: number; maxEnergy: number }) => {
        game.setPlayer(prev => prev ? { ...prev, energy: data.energy, maxEnergy: data.maxEnergy } : null);
      }),
      on('player:entered', (data: { username: string; sectorId: number }) => {
        game.addLine(`${data.username} has entered the sector`, 'warning');
        game.refreshSector();
        if (activePanelRef.current !== 'players') incrementBadge('players');
      }),
      on('player:left', (_data: { playerId: string }) => {
        game.refreshSector();
      }),
      on('combat:volley', (data: { attackerName: string; damage: number; yourEnergyRemaining: number }) => {
        game.addLine(`${data.attackerName} fired on you! ${data.damage} damage taken.`, 'combat');
        game.refreshStatus();
        if (activePanelRef.current !== 'combat') incrementBadge('combat');
        setCombatFlash(true);
        setTimeout(() => setCombatFlash(false), 300);
        game.enqueueScene(buildCombatScene('scout', data.damage));
      }),
      on('combat:destroyed', (data: { destroyerName: string }) => {
        game.addLine(`Your ship was destroyed by ${data.destroyerName}!`, 'error');
        game.addLine('You ejected in a Dodge Pod.', 'warning');
        game.enqueueScene(buildDestroyedScene(game.player?.currentShip?.shipTypeId ?? 'scout'));
        game.refreshStatus();
      }),
      on('chat:sector', (data: { senderId: string; senderName: string; message: string }) => {
        // Skip own messages — already echoed locally by handleChatSend / chat command
        const isOwn = data.senderId === game.player?.id;
        if (isOwn) return;
        game.addLine(`[${data.senderName}] ${data.message}`, 'info');
        setChatMessages(prev => [...prev.slice(-49), {
          id: chatIdCounter++,
          senderName: data.senderName,
          message: data.message,
          isOwn: false,
        }]);
        if (activePanelRef.current !== 'chat') incrementBadge('chat');
      }),
      on('notification', (data: { message: string }) => {
        game.addLine(data.message, 'system');
        if (activePanelRef.current !== 'missions') incrementBadge('missions');
      }),
    ];

    return () => { unsubs.forEach(unsub => unsub?.()); };
  }, [game.player?.id]);

  const onCommand = useCallback((input: string) => {
    handleCommand(input, {
      addLine: game.addLine,
      clearLines: game.clearLines,
      player: game.player,
      sector: game.sector,
      doMove: game.doMove,
      doBuy: game.doBuy,
      doSell: game.doSell,
      doFire: game.doFire,
      doFlee: game.doFlee,
      doDock: game.doDock,
      doUndock: game.doUndock,
      refreshStatus: game.refreshStatus,
      refreshSector: game.refreshSector,
      emit,
      advanceTutorial: game.advanceTutorial,
      enqueueScene: game.enqueueScene,
      setLastListing: (items: { id: string; label: string }[]) => { lastListingRef.current = items; },
      getLastListing: () => lastListingRef.current,
    });
  }, [game, emit]);

  // Show initial sector info on first load
  useEffect(() => {
    if (game.sector && game.lines.length === 0) {
      game.addLine('=== COSMIC HORIZON ===', 'system');
      game.addLine('A text-based space trading game', 'system');
      if (game.player && !game.player.tutorialCompleted) {
        game.addLine('Follow the tutorial bar above to learn the basics.', 'info');
        game.addLine('Start by typing "look" to survey your sector.', 'info');
      } else {
        game.addLine('Type "help" for commands or "look" to view your sector.', 'info');
      }
    }
  }, [game.sector]);

  const activeOutpost = game.player?.dockedAtOutpostId ?? null;

  const handleActionButton = useCallback((cmd: string) => {
    onCommand(cmd);
  }, [onCommand]);

  function renderActivePanel() {
    switch (activePanel) {
      case 'nav': return <MapPanel sector={game.sector} onMoveToSector={game.doMove} bare />;
      case 'trade': return <TradeTable outpostId={activeOutpost} onBuy={game.doBuy} onSell={game.doSell} bare />;
      case 'combat': return <CombatView sector={game.sector} onFire={game.doFire} onFlee={game.doFlee} weaponEnergy={game.player?.currentShip?.weaponEnergy ?? 0} combatAnimation={game.combatAnimation} onCombatAnimationDone={game.clearCombatAnimation} bare />;
      case 'players': return <PlayerListPanel sector={game.sector} onFire={game.doFire} bare />;
      case 'missions': return <ActiveMissionsPanel refreshKey={refreshKey} bare />;
      case 'inventory': return <InventoryPanel refreshKey={refreshKey} onItemUsed={handleItemUsed} bare />;
      case 'chat': return <SectorChatPanel messages={chatMessages} onSend={handleChatSend} bare />;
      case 'notes': return <NotesPanel refreshKey={refreshKey} bare />;
      case 'wallet': return <WalletPanel bare />;
    }
  }

  const handleChatSend = useCallback((message: string) => {
    const name = game.player?.username || 'You';
    game.addLine(`[${name}] ${message}`, 'info');
    // Add to chat panel immediately
    setChatMessages(prev => [...prev.slice(-49), {
      id: chatIdCounter++,
      senderName: name,
      message,
      isOwn: true,
    }]);
    emit('chat:sector', { message });
  }, [game.player?.username, game.addLine, emit]);

  const handleItemUsed = useCallback(() => {
    game.refreshStatus();
    setRefreshKey(k => k + 1);
  }, [game.refreshStatus]);

  const handleTrackRequest = useCallback((trackId: string) => {
    audio.play(trackId);
  }, [audio.play]);

  // Show intro lore sequence on first login (before tutorial)
  if (game.player && !game.player.hasSeenIntro) {
    return (
      <IntroSequence
        beats={INTRO_BEATS}
        onComplete={game.markIntroSeen}
        title="THE AGARICALIS SAGA"
        trackId="intro"
        onTrackRequest={handleTrackRequest}
        onAudioResume={audio.resume}
      />
    );
  }

  // Show post-tutorial lore sequence after tutorial completion
  if (game.player && game.player.tutorialCompleted && !game.player.hasSeenPostTutorial) {
    if (showPostTutorialScene) {
      return (
        <PixelScene
          scene={POST_TUTORIAL_SCENE}
          renderMode="fullscreen"
          onComplete={game.markPostTutorialSeen}
          onSkip={game.markPostTutorialSeen}
        />
      );
    }
    return (
      <IntroSequence
        beats={POST_TUTORIAL_BEATS}
        onComplete={() => setShowPostTutorialScene(true)}
        title="THE FRONTIER AWAITS"
        buttonLabel="BEGIN YOUR JOURNEY"
        trackId="post-tutorial"
        onTrackRequest={handleTrackRequest}
        onAudioResume={audio.resume}
      />
    );
  }

  return (
    <div className="game-layout">
      <TutorialOverlay
        tutorialStep={game.player?.tutorialStep ?? 0}
        tutorialCompleted={game.player?.tutorialCompleted ?? true}
        onSkip={game.skipTutorial}
      />
      <StatusBar player={game.player} muted={audio.muted} onToggleMute={audio.toggleMute} onLogout={onLogout} />
      <div className="game-main">
        <ActivityBar activePanel={activePanel} onSelect={selectPanel} badges={badges} />
        <div className="game-center">
          <div className={`game-terminal${combatFlash ? ' terminal--combat-flash' : ''}`}>
            <DataStreamRain />
            <Terminal
              lines={game.lines}
              onCommand={onCommand}
              sectorId={game.player?.currentSectorId}
            />
          </div>
          <div className="game-panel-area">
            <div className="game-panel-content">
              <div className="panel-area-header">
                {PANELS.find(p => p.id === activePanel)?.label}
              </div>
              {renderActivePanel()}
            </div>
            <SceneViewport
              actionScene={game.inlineScene}
              ambientScene={ambientScene}
              onActionComplete={game.dequeueScene}
              sectorId={game.player?.currentSectorId}
              shipType={game.player?.currentShip?.shipTypeId}
            />
          </div>
        </div>
        <ContextPanel
          player={game.player}
          sector={game.sector}
          mapData={game.mapData}
          onMoveToSector={game.doMove}
          onCommand={handleActionButton}
        />
      </div>
    </div>
  );
}
