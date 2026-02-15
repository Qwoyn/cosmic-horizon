import { useEffect, useCallback } from 'react';
import Terminal from '../components/Terminal';
import StatusBar from '../components/StatusBar';
import MapPanel from '../components/MapPanel';
import TradeTable from '../components/TradeTable';
import CombatView from '../components/CombatView';
import { useGameState } from '../hooks/useGameState';
import { useSocket } from '../hooks/useSocket';
import { handleCommand } from '../services/commands';

export default function Game() {
  const game = useGameState();
  const { on, emit } = useSocket(game.player?.id ?? null);

  useEffect(() => {
    game.refreshStatus();
    game.refreshSector();
  }, []);

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
      on('chat:sector', (data: { senderName: string; message: string }) => {
        game.addLine(`[${data.senderName}] ${data.message}`, 'info');
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
    });
  }, [game, emit]);

  // Show initial sector info on first load
  useEffect(() => {
    if (game.sector && game.lines.length === 0) {
      game.addLine('=== COSMIC HORIZON ===', 'system');
      game.addLine('A text-based space trading game', 'system');
      game.addLine('Type "help" for commands or "look" to view your sector.', 'info');
    }
  }, [game.sector]);

  const activeOutpost = game.sector?.outposts[0]?.id ?? null;

  return (
    <div className="game-layout">
      <StatusBar player={game.player} />
      <div className="game-main">
        <div className="game-terminal">
          <Terminal
            lines={game.lines}
            onCommand={onCommand}
            sectorId={game.player?.currentSectorId}
          />
        </div>
        <div className="game-sidebar">
          <MapPanel sector={game.sector} onMoveToSector={game.doMove} />
          <TradeTable
            outpostId={activeOutpost}
            onBuy={game.doBuy}
            onSell={game.doSell}
          />
          <CombatView
            sector={game.sector}
            onFire={game.doFire}
            onFlee={game.doFlee}
            weaponEnergy={game.player?.currentShip?.weaponEnergy ?? 0}
          />
        </div>
      </div>
    </div>
  );
}
