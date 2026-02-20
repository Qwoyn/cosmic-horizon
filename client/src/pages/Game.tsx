import { useEffect, useCallback, useState, useRef, useMemo } from 'react';
import StatusBar from '../components/StatusBar';
import MapPanel from '../components/MapPanel';
import TradeTable from '../components/TradeTable';
import MallPanel from '../components/MallPanel';
import CombatGroupPanel from '../components/CombatGroupPanel';
import ActiveMissionsPanel from '../components/ActiveMissionsPanel';
import ExplorePanel from '../components/ExplorePanel';
import PlanetsPanel from '../components/PlanetsPanel';
import CrewGroupPanel from '../components/CrewGroupPanel';
import GearGroupPanel from '../components/GearGroupPanel';
import CommsGroupPanel from '../components/CommsGroupPanel';
import SyndicateGroupPanel from '../components/SyndicateGroupPanel';
import WalletPanel from '../components/WalletPanel';
import ActionsPanel from '../components/ActionsPanel';
import TutorialOverlay from '../components/TutorialOverlay';
import IntroSequence, { INTRO_BEATS, POST_TUTORIAL_BEATS } from '../components/IntroSequence';
import PixelScene from '../components/PixelScene';
import SceneViewport from '../components/SceneViewport';
import ActivityBar from '../components/ActivityBar';
import ContextPanel from '../components/ContextPanel';
import SectorMap from '../components/SectorMap';
import NotificationLog from '../components/NotificationLog';
import { type ChatMessage, type ChatChannel } from '../components/SectorChatPanel';
import { POST_TUTORIAL_SCENE } from '../config/scenes/post-tutorial-scene';
import { buildIdleSpaceScene, buildIdleOutpostScene, buildIdleDockedScene } from '../config/scenes/ambient-scenes';
import { buildCombatScene } from '../config/scenes/combat-scene';
import { buildDestroyedScene } from '../config/scenes/destroyed-scene';
import { buildMallInteriorScene } from '../config/scenes/mall-interior-scene';
import { useGameState } from '../hooks/useGameState';
import { useSocket } from '../hooks/useSocket';
import { useAudio } from '../hooks/useAudio';
import { useActivePanel } from '../hooks/useActivePanel';
import { handleCommand } from '../services/commands';
import { PANELS } from '../types/panels';
import { getAlliances, getSyndicate } from '../services/api';

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
  const [showSPComplete, setShowSPComplete] = useState(false);
  const [alliedPlayerIds, setAlliedPlayerIds] = useState<string[]>([]);
  const [hasSyndicate, setHasSyndicate] = useState(false);
  const [hasAlliance, setHasAlliance] = useState(false);
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
      if (game.sector?.hasStarMall) {
        return buildMallInteriorScene();
      }
      return buildIdleDockedScene(ctx);
    }
    if ((game.sector?.outposts?.length ?? 0) > 0) {
      return buildIdleOutpostScene(ctx);
    }
    return buildIdleSpaceScene(ctx);
  }, [game.player?.dockedAtOutpostId, game.sector?.hasStarMall, game.sector?.outposts?.length, game.player?.currentShip?.shipTypeId, game.sector?.sectorId, game.sector?.type, game.sector?.planets?.length, game.sector?.players?.length]);

  // Clear chat when changing sectors
  useEffect(() => {
    if (game.player?.currentSectorId && game.player.currentSectorId !== lastSectorRef.current) {
      lastSectorRef.current = game.player.currentSectorId;
      setChatMessages([]);
    }
  }, [game.player?.currentSectorId]);

  const refreshAlliances = useCallback(() => {
    getAlliances()
      .then(({ data }) => {
        setAlliedPlayerIds((data.personalAllies || []).map((a: any) => a.allyId));
        setHasAlliance((data.syndicateAllies || []).length > 0);
      })
      .catch(() => {});
  }, []);

  const refreshSyndicateStatus = useCallback(() => {
    getSyndicate()
      .then(() => setHasSyndicate(true))
      .catch(() => setHasSyndicate(false));
  }, []);

  useEffect(() => {
    game.refreshStatus();
    game.refreshSector();
    game.refreshTutorial();
    game.refreshMap();
    refreshAlliances();
    refreshSyndicateStatus();
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
        if (activePanelRef.current !== 'crew') incrementBadge('crew');
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
        if (activePanelRef.current !== 'comms') incrementBadge('comms');
      }),
      on('notification', (data: { message: string }) => {
        game.addLine(data.message, 'system');
        if (activePanelRef.current !== 'missions') incrementBadge('missions');
      }),
      on('chat:syndicate', (data: { senderId: string; senderName: string; message: string }) => {
        const isOwn = data.senderId === game.player?.id;
        if (isOwn) return;
        setChatMessages(prev => [...prev.slice(-99), {
          id: chatIdCounter++,
          senderName: data.senderName,
          message: data.message,
          isOwn: false,
          channel: 'syndicate',
        }]);
        if (activePanelRef.current !== 'comms') incrementBadge('comms');
      }),
      on('chat:alliance', (data: { senderId: string; senderName: string; syndicateName: string; message: string }) => {
        const isOwn = data.senderId === game.player?.id;
        if (isOwn) return;
        setChatMessages(prev => [...prev.slice(-99), {
          id: chatIdCounter++,
          senderName: data.senderName,
          message: data.message,
          isOwn: false,
          channel: 'alliance',
          syndicateName: data.syndicateName,
        }]);
        if (activePanelRef.current !== 'comms') incrementBadge('comms');
      }),
      on('syndicate:member_joined', (data: { username: string }) => {
        game.addLine(`${data.username} joined the syndicate`, 'system');
      }),
      on('syndicate:member_left', (data: { username: string }) => {
        game.addLine(`${data.username} left the syndicate`, 'system');
      }),
      on('syndicate:vote_created', (data: { type: string; description: string; proposedBy: string }) => {
        game.addLine(`New vote proposed: [${data.type}] ${data.description}`, 'system');
        if (activePanelRef.current !== 'syndicate') incrementBadge('syndicate');
      }),
      on('syndicate:vote_resolved', (data: { result: string }) => {
        game.addLine(`Vote resolved: ${data.result}`, 'system');
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

  // Detect SP mission completion
  useEffect(() => {
    if (game.player?.gameMode === 'singleplayer' && game.player.spMissions) {
      const { completed, total } = game.player.spMissions;
      if (completed >= total && total > 0) {
        setShowSPComplete(true);
      }
    }
  }, [game.player?.spMissions?.completed]);

  // Show initial sector info on first load
  useEffect(() => {
    if (game.sector && game.lines.length === 0) {
      game.addLine('=== COSMIC HORIZON ===', 'system');
      game.addLine('A persistent multiplayer space strategy game', 'system');
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
      case 'nav': return <MapPanel sector={game.sector} onMoveToSector={game.doMove} onCommand={handleActionButton} bare />;
      case 'explore': return <ExplorePanel refreshKey={refreshKey} bare />;
      case 'trade': {
        const atStarMall = !!activeOutpost && !!game.sector?.hasStarMall;
        if (atStarMall) {
          return <MallPanel outpostId={activeOutpost} onBuy={game.doBuy} onSell={game.doSell} credits={game.player?.credits ?? 0} energy={game.player?.energy ?? 0} maxEnergy={game.player?.maxEnergy ?? 100} onAction={() => { game.refreshStatus(); setRefreshKey(k => k + 1); }} bare />;
        }
        return <TradeTable outpostId={activeOutpost} onBuy={game.doBuy} onSell={game.doSell} bare />;
      }
      case 'combat': return <CombatGroupPanel sector={game.sector} onFire={game.doFire} onFlee={game.doFlee} weaponEnergy={game.player?.currentShip?.weaponEnergy ?? 0} combatAnimation={game.combatAnimation} onCombatAnimationDone={game.clearCombatAnimation} playerName={game.player?.username} refreshKey={refreshKey} bare />;
      case 'crew': return <CrewGroupPanel sector={game.sector} onFire={game.doFire} refreshKey={refreshKey} onCommand={handleActionButton} alliedPlayerIds={alliedPlayerIds} onAllianceChange={refreshAlliances} bare />;
      case 'missions': return <ActiveMissionsPanel refreshKey={refreshKey} atStarMall={!!activeOutpost && !!game.sector?.hasStarMall} onAction={() => { game.refreshStatus(); setRefreshKey(k => k + 1); }} bare />;
      case 'planets': return <PlanetsPanel refreshKey={refreshKey} currentSectorId={game.player?.currentSectorId ?? null} onAction={() => { game.refreshStatus(); setRefreshKey(k => k + 1); }} onCommand={handleActionButton} bare />;
      case 'gear': return <GearGroupPanel refreshKey={refreshKey} onItemUsed={handleItemUsed} atStarMall={!!activeOutpost && !!game.sector?.hasStarMall} onCommand={handleActionButton} bare />;
      case 'comms': return <CommsGroupPanel messages={chatMessages} onSend={handleChatSend} refreshKey={refreshKey} onAction={() => setRefreshKey(k => k + 1)} hasSyndicate={hasSyndicate} hasAlliance={hasAlliance} alliedPlayerIds={alliedPlayerIds} onAllianceChange={refreshAlliances} bare />;
      case 'syndicate': return <SyndicateGroupPanel refreshKey={refreshKey} onCommand={handleActionButton} bare />;
      case 'wallet': return <WalletPanel bare />;
      case 'actions': return <ActionsPanel onCommand={handleActionButton} onClearLog={game.clearLines} bare />;
    }
  }

  const handleChatSend = useCallback((message: string, channel: ChatChannel = 'sector') => {
    const name = game.player?.username || 'You';
    if (channel === 'sector') {
      game.addLine(`[${name}] ${message}`, 'info');
    }
    setChatMessages(prev => [...prev.slice(-99), {
      id: chatIdCounter++,
      senderName: name,
      message,
      isOwn: true,
      channel,
    }]);
    if (channel === 'sector') {
      emit('chat:sector', { message });
    } else if (channel === 'syndicate') {
      emit('chat:syndicate', { message });
    } else if (channel === 'alliance') {
      emit('chat:alliance', { message });
    }
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
      {showSPComplete && (
        <div className="sp-complete-modal" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000,
        }}>
          <div style={{
            background: '#1a1a2e', border: '1px solid #00ff88', borderRadius: '8px',
            padding: '32px', maxWidth: '480px', textAlign: 'center',
          }}>
            <h2 style={{ color: '#00ff88', marginBottom: '16px' }}>FRONTIER CONQUERED</h2>
            <p style={{ color: '#ccc', marginBottom: '16px' }}>
              You have completed all 20 single player missions!
              The multiplayer frontier awaits — join other pilots in the shared universe.
            </p>
            <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '24px' }}>
              Your level, XP, credits, ships, and upgrades will carry over.
              Your single player planets and sectors will be removed.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                className="btn btn-secondary"
                onClick={() => setShowSPComplete(false)}
              >
                STAY IN SP
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowSPComplete(false);
                  onCommand('profile transition');
                }}
              >
                GO MULTIPLAYER
              </button>
            </div>
          </div>
        </div>
      )}
      <TutorialOverlay
        tutorialStep={game.player?.tutorialStep ?? 0}
        tutorialCompleted={game.player?.tutorialCompleted ?? true}
        onSkip={game.skipTutorial}
      />
      <StatusBar player={game.player} muted={audio.muted} onToggleMute={audio.toggleMute} onLogout={onLogout} />
      <div className="game-main">
        <ActivityBar activePanel={activePanel} onSelect={selectPanel} badges={badges} />
        <div className="game-center">
          <div className={`game-map-log${combatFlash ? ' terminal--combat-flash' : ''}`}>
            <div className="game-map-area">
              <SectorMap
                mapData={game.mapData}
                currentSectorId={game.player?.currentSectorId ?? null}
                adjacentSectorIds={game.sector?.adjacentSectors?.map(a => a.sectorId) || []}
                onMoveToSector={game.doMove}
              />
            </div>
            <div className="game-log-area">
              <NotificationLog lines={game.lines} onClear={game.clearLines} />
            </div>
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
          chatMessages={chatMessages}
          onChatSend={handleChatSend}
          onCommand={onCommand}
          hasSyndicate={hasSyndicate}
          hasAlliance={hasAlliance}
        />
      </div>
    </div>
  );
}
