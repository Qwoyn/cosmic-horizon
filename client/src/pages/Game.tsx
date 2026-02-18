import { useEffect, useCallback, useState, useRef } from 'react';
import Terminal from '../components/Terminal';
import StatusBar from '../components/StatusBar';
import MapPanel from '../components/MapPanel';
import SectorMap from '../components/SectorMap';
import TradeTable from '../components/TradeTable';
import CombatView from '../components/CombatView';
import ShipStatusPanel from '../components/ShipStatusPanel';
import ActiveMissionsPanel from '../components/ActiveMissionsPanel';
import SectorChatPanel, { type ChatMessage } from '../components/SectorChatPanel';
import PlayerListPanel from '../components/PlayerListPanel';
import InventoryPanel from '../components/InventoryPanel';
import NotesPanel from '../components/NotesPanel';
import WalletPanel from '../components/WalletPanel';
import TutorialOverlay from '../components/TutorialOverlay';
import IntroSequence, { INTRO_BEATS, POST_TUTORIAL_BEATS } from '../components/IntroSequence';
import PixelScene from '../components/PixelScene';
import { POST_TUTORIAL_SCENE } from '../config/scenes/post-tutorial-scene';
import { useGameState } from '../hooks/useGameState';
import { useSocket } from '../hooks/useSocket';
import { useAudio } from '../hooks/useAudio';
import { handleCommand } from '../services/commands';

let chatIdCounter = 0;

interface GameProps {
  onLogout?: () => void;
}

export default function Game({ onLogout }: GameProps) {
  const game = useGameState();
  const { on, emit } = useSocket(game.player?.id ?? null);
  const audio = useAudio();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showPostTutorialScene, setShowPostTutorialScene] = useState(false);
  const lastSectorRef = useRef<number | null>(null);

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
      }),
      on('player:left', (_data: { playerId: string }) => {
        game.refreshSector();
      }),
      on('combat:volley', (data: { attackerName: string; damage: number; yourEnergyRemaining: number }) => {
        game.addLine(`${data.attackerName} fired on you! ${data.damage} damage taken.`, 'combat');
        game.refreshStatus();
      }),
      on('combat:destroyed', (data: { destroyerName: string }) => {
        game.addLine(`Your ship was destroyed by ${data.destroyerName}!`, 'error');
        game.addLine('You ejected in a Dodge Pod.', 'warning');
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
      }),
      on('notification', (data: { message: string }) => {
        game.addLine(data.message, 'system');
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
      refreshStatus: game.refreshStatus,
      refreshSector: game.refreshSector,
      emit,
      advanceTutorial: game.advanceTutorial,
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

  const activeOutpost = game.sector?.outposts[0]?.id ?? null;

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
        <div className="game-terminal">
          {game.inlineScene && (
            <PixelScene
              scene={game.inlineScene}
              renderMode="inline"
              onComplete={game.dequeueScene}
              width={400}
              height={120}
            />
          )}
          <Terminal
            lines={game.lines}
            onCommand={onCommand}
            sectorId={game.player?.currentSectorId}
          />
        </div>
        <div className="game-sidebar">
          <WalletPanel />
          <MapPanel sector={game.sector} onMoveToSector={game.doMove} />
          <SectorMap
            mapData={game.mapData}
            currentSectorId={game.player?.currentSectorId ?? null}
            adjacentSectorIds={game.sector?.adjacentSectors.map(a => a.sectorId) ?? []}
            onMoveToSector={game.doMove}
          />
          <ShipStatusPanel player={game.player} />
          <TradeTable
            outpostId={activeOutpost}
            onBuy={game.doBuy}
            onSell={game.doSell}
          />
          <PlayerListPanel
            sector={game.sector}
            onFire={game.doFire}
          />
          <CombatView
            sector={game.sector}
            onFire={game.doFire}
            onFlee={game.doFlee}
            weaponEnergy={game.player?.currentShip?.weaponEnergy ?? 0}
            combatAnimation={game.combatAnimation}
            onCombatAnimationDone={game.clearCombatAnimation}
          />
          <ActiveMissionsPanel refreshKey={refreshKey} />
          <SectorChatPanel
            messages={chatMessages}
            onSend={handleChatSend}
          />
          <InventoryPanel
            refreshKey={refreshKey}
            onItemUsed={handleItemUsed}
          />
          <NotesPanel refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
}
