import { useState, useCallback, useRef } from 'react';
import * as api from '../services/api';
import type { MapData } from '../components/SectorMap';
import type { SceneDefinition } from '../config/scene-types';
import { buildWarpScene } from '../config/scenes/warp-scene';
import { buildDockingScene } from '../config/scenes/docking-scene';
import { buildUndockScene } from '../config/scenes/undock-scene';
import { buildCombatScene } from '../config/scenes/combat-scene';
import { buildFleeScene } from '../config/scenes/flee-scene';
import { buildTradeScene } from '../config/scenes/trade-scene';

export interface PlayerState {
  id: string;
  username: string;
  race: string | null;
  energy: number;
  maxEnergy: number;
  credits: number;
  currentSectorId: number;
  tutorialStep: number;
  tutorialCompleted: boolean;
  hasSeenIntro: boolean;
  hasSeenPostTutorial: boolean;
  walletAddress: string | null;
  dockedAtOutpostId: string | null;
  currentShip: {
    id: string;
    shipTypeId: string;
    weaponEnergy: number;
    engineEnergy: number;
    hullHp: number;
    maxHullHp: number;
    cargoHolds: number;
    maxCargoHolds: number;
    cyrilliumCargo: number;
    foodCargo: number;
    techCargo: number;
    colonistsCargo: number;
  } | null;
}

export interface SectorState {
  sectorId: number;
  type: string;
  regionId: number;
  hasStarMall: boolean;
  adjacentSectors: { sectorId: number; oneWay: boolean }[];
  players: { id: string; username: string }[];
  outposts: { id: string; name: string }[];
  planets: { id: string; name: string; planetClass: string; ownerId: string | null; upgradeLevel: number }[];
  deployables: { id: string; type: string; ownerId: string }[];
  events: { id: string; eventType: string }[];
  warpGates: { id: string; destinationSectorId: number; tollAmount: number; syndicateFree: boolean; syndicateId: string }[];
}

export interface TerminalLine {
  id: number;
  text: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'system' | 'combat' | 'trade';
}

let lineIdCounter = 0;

export function useGameState() {
  const [player, setPlayer] = useState<PlayerState | null>(null);
  const [sector, setSector] = useState<SectorState | null>(null);
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [sceneQueue, setSceneQueue] = useState<SceneDefinition[]>([]);
  const [combatAnimation, setCombatAnimation] = useState<{ attackerShipType: string; damage: number } | null>(null);

  // Track action counts for multi-count tutorial steps (e.g., step 4 requires 2 moves)
  const tutorialActionCount = useRef<Record<string, number>>({});

  const MAX_LINES = 200;

  const addLine = useCallback((text: string, type: TerminalLine['type'] = 'info') => {
    setLines(prev => {
      const next = [...prev, { id: lineIdCounter++, text, type }];
      return next.length > MAX_LINES ? next.slice(next.length - MAX_LINES) : next;
    });
  }, []);

  const clearLines = useCallback(() => {
    setLines([]);
  }, []);

  const refreshStatus = useCallback(async () => {
    try {
      const { data } = await api.getStatus();
      setPlayer(data);
    } catch (err: any) {
      console.error('[refreshStatus] failed:', err.response?.status, err.response?.data || err.message);
    }
  }, []);

  const refreshSector = useCallback(async () => {
    try {
      const { data } = await api.getSector();
      setSector(data);
    } catch (err: any) {
      console.error('[refreshSector] failed:', err.response?.status, err.response?.data || err.message);
    }
  }, []);

  const refreshMap = useCallback(async () => {
    try {
      const { data } = await api.getMap();
      setMapData(data);
    } catch (err: any) {
      console.error('[refreshMap] failed:', err.response?.status, err.response?.data || err.message);
    }
  }, []);

  const advanceTutorial = useCallback(async (action: string) => {
    // Only attempt if player has an active tutorial
    setPlayer(prev => {
      if (!prev || prev.tutorialCompleted) return prev;

      // Increment action count
      const counts = tutorialActionCount.current;
      counts[action] = (counts[action] || 0) + 1;

      // Fire and forget the API call
      api.advanceTutorial(action, counts[action]).then(({ data }) => {
        if (data.advanced) {
          // Reset action counts for the next step
          tutorialActionCount.current = {};

          setPlayer(p => p ? {
            ...p,
            tutorialStep: data.currentStep,
            tutorialCompleted: !!data.completed,
            credits: data.newCredits ?? (data.reward ? p.credits + data.reward : p.credits),
            currentSectorId: data.newSectorId ?? p.currentSectorId,
          } : null);

          if (data.completed) {
            setLines(l => [...l,
              { id: lineIdCounter++, text: 'TUTORIAL COMPLETE! You earned 5,000 credits.', type: 'success' },
              { id: lineIdCounter++, text: 'Your ship has been placed at a Star Mall. The galaxy is yours to explore, pilot.', type: 'system' },
            ]);
            // Refresh sector and status to load the real game state
            api.getSector().then(({ data: sectorData }) => setSector(sectorData)).catch(() => {});
            api.getStatus().then(({ data: statusData }) => setPlayer(statusData)).catch(() => {});
          } else if (data.nextStep) {
            setLines(l => [...l,
              { id: lineIdCounter++, text: `[Tutorial ${data.currentStep}/${8}] ${data.nextStep.title}`, type: 'system' },
              { id: lineIdCounter++, text: data.nextStep.description, type: 'info' },
            ]);
          }
        }
      }).catch(() => { /* tutorial advance failed silently */ });

      return prev;
    });
  }, []);

  const refreshTutorial = useCallback(async () => {
    try {
      const { data } = await api.getTutorialStatus();
      setPlayer(prev => prev ? {
        ...prev,
        tutorialStep: data.currentStep,
        tutorialCompleted: data.completed,
      } : null);
      return data;
    } catch (err: any) {
      console.error('[refreshTutorial] failed:', err.response?.status, err.response?.data || err.message);
      return null;
    }
  }, []);

  const markIntroSeen = useCallback(async () => {
    try {
      await api.markIntroSeen();
      setPlayer(prev => prev ? { ...prev, hasSeenIntro: true } : null);
    } catch { /* ignore */ }
  }, []);

  const markPostTutorialSeen = useCallback(async () => {
    try {
      await api.markPostTutorialSeen();
      setPlayer(prev => prev ? { ...prev, hasSeenPostTutorial: true } : null);
      // Show welcome message with getting-started guidance
      addLine('Welcome to the galaxy, pilot! Here are some suggested next steps:', 'system');
      addLine("  1. Type 'map' to see your explored sectors", 'info');
      addLine("  2. Explore nearby sectors to find a Star Mall", 'info');
      addLine("  3. Type 'tips' anytime for contextual guidance", 'info');
      addLine("  4. Type 'help' for a list of command categories", 'info');
      addLine("  5. Check 'missions' to see your starter missions", 'success');
    } catch { /* ignore */ }
  }, [addLine]);

  const skipTutorial = useCallback(async () => {
    try {
      const { data } = await api.skipTutorial();
      setPlayer(prev => prev ? {
        ...prev,
        tutorialCompleted: true,
        tutorialStep: 8,
        currentSectorId: data.newSectorId ?? prev.currentSectorId,
        credits: data.newCredits ?? prev.credits,
      } : null);
      addLine('Tutorial skipped.', 'system');
      addLine('Your ship has been placed at a Star Mall. The galaxy is yours to explore, pilot.', 'system');
      await refreshSector();
      await refreshStatus();
    } catch {
      addLine('Failed to skip tutorial', 'error');
    }
  }, [addLine, refreshSector, refreshStatus]);

  const enqueueScene = useCallback((scene: SceneDefinition) => {
    setSceneQueue(prev => [...prev, scene]);
  }, []);

  const dequeueScene = useCallback(() => {
    setSceneQueue(prev => prev.slice(1));
  }, []);

  const clearCombatAnimation = useCallback(() => {
    setCombatAnimation(null);
  }, []);

  const doLogin = useCallback(async (username: string, password: string) => {
    const { data } = await api.login(username, password);
    setPlayer(data.player);
    setIsLoggedIn(true);
    addLine(`Welcome back, ${data.player.username}!`, 'system');
    await refreshSector();
    return data.player;
  }, [addLine, refreshSector]);

  const doRegister = useCallback(async (username: string, email: string, password: string, race: string) => {
    const { data } = await api.register(username, email, password, race);
    setPlayer(data.player);
    setIsLoggedIn(true);
    addLine(`Welcome to Cosmic Horizon, ${data.player.username}!`, 'system');
    addLine(`You are a ${data.player.race ? data.player.race.charAt(0).toUpperCase() + data.player.race.slice(1) : 'pilot'} stationed at a Star Mall.`, 'system');
    addLine('Type "help" for a list of commands.', 'info');
    await refreshSector();
    return data.player;
  }, [addLine, refreshSector]);

  const doLogout = useCallback(async () => {
    await api.logout();
    setPlayer(null);
    setSector(null);
    setMapData(null);
    setIsLoggedIn(false);
    setLines([]);
    tutorialActionCount.current = {};
  }, []);

  const doMove = useCallback(async (sectorId: number) => {
    try {
      const { data } = await api.moveTo(sectorId);
      setPlayer(prev => prev ? { ...prev, energy: data.energy, currentSectorId: data.sectorId, dockedAtOutpostId: null } : null);

      // Enqueue warp animation
      setSceneQueue(_prev => {
        const shipTypeId = player?.currentShip?.shipTypeId ?? 'scout';
        const scenes = [buildWarpScene(shipTypeId)];
        if (data.outposts.length > 0) {
          scenes.push(buildDockingScene(shipTypeId, data.outposts[0].name));
        }
        return scenes;
      });

      addLine(`Warping to sector ${data.sectorId}...`, 'info');
      addLine(`Arrived in sector ${data.sectorId} [${data.sectorType}]`, 'success');
      if (data.meteorDamage > 0) {
        addLine(`Meteor strike! Hull took ${data.meteorDamage} damage on approach.`, 'warning');
      }
      if (data.players.length > 0) {
        addLine(`Players here: ${data.players.map((p: any) => p.username).join(', ')}`, 'warning');
      }
      if (data.outposts.length > 0) {
        addLine(`Outposts: ${data.outposts.map((o: any) => o.name).join(', ')}`, 'info');
      }
      if (data.planets.length > 0) {
        addLine(`Planets: ${data.planets.map((p: any) => p.name).join(', ')}`, 'info');
      }
      await refreshSector();
      await refreshStatus();
      await refreshMap();
      advanceTutorial('move');
    } catch (err: any) {
      addLine(err.response?.data?.error || 'Move failed', 'error');
    }
  }, [addLine, refreshSector, refreshStatus, refreshMap, advanceTutorial, player?.currentShip?.shipTypeId]);

  const doBuy = useCallback(async (outpostId: string, commodity: string, quantity: number) => {
    try {
      const { data } = await api.buyFromOutpost(outpostId, commodity, quantity);
      setPlayer(prev => prev ? { ...prev, credits: data.newCredits, energy: data.energy } : null);
      enqueueScene(buildTradeScene(player?.currentShip?.shipTypeId ?? 'scout', commodity, true));
      addLine(`Bought ${data.quantity} ${commodity} at ${data.pricePerUnit} cr/unit (total: ${data.totalCost} cr)`, 'trade');
      await refreshStatus();
      advanceTutorial('buy');
    } catch (err: any) {
      addLine(err.response?.data?.error || 'Purchase failed', 'error');
    }
  }, [addLine, refreshStatus, advanceTutorial, enqueueScene, player?.currentShip?.shipTypeId]);

  const doSell = useCallback(async (outpostId: string, commodity: string, quantity: number) => {
    try {
      const { data } = await api.sellToOutpost(outpostId, commodity, quantity);
      setPlayer(prev => prev ? { ...prev, credits: data.newCredits, energy: data.energy } : null);
      enqueueScene(buildTradeScene(player?.currentShip?.shipTypeId ?? 'scout', commodity, false));
      addLine(`Sold ${data.quantity} ${commodity} at ${data.pricePerUnit} cr/unit (total: ${data.totalCost} cr)`, 'trade');
      await refreshStatus();
      advanceTutorial('sell');
    } catch (err: any) {
      addLine(err.response?.data?.error || 'Sale failed', 'error');
    }
  }, [addLine, refreshStatus, advanceTutorial, enqueueScene, player?.currentShip?.shipTypeId]);

  const doFire = useCallback(async (targetPlayerId: string, energy: number) => {
    try {
      const { data } = await api.fire(targetPlayerId, energy);
      setCombatAnimation({
        attackerShipType: player?.currentShip?.shipTypeId ?? 'scout',
        damage: data.damageDealt,
      });
      enqueueScene(buildCombatScene(player?.currentShip?.shipTypeId ?? 'scout', data.damageDealt));
      addLine(`Fired! Dealt ${data.damageDealt} damage (${data.attackerEnergySpent} energy spent)`, 'combat');
      if (data.defenderDestroyed) {
        addLine('Target destroyed!', 'success');
      }
      setPlayer(prev => prev ? { ...prev, energy: data.energy } : null);
      await refreshStatus();
    } catch (err: any) {
      addLine(err.response?.data?.error || 'Attack failed', 'error');
    }
  }, [addLine, refreshStatus, enqueueScene, player?.currentShip?.shipTypeId]);

  const doDock = useCallback(async () => {
    try {
      const { data } = await api.dock();
      setPlayer(prev => prev ? { ...prev, dockedAtOutpostId: data.outpostId } : null);
      const shipTypeId = player?.currentShip?.shipTypeId ?? 'scout';
      enqueueScene(buildDockingScene(shipTypeId, data.name));
      addLine(`Docked at ${data.name}`, 'success');
      addLine(`Treasury: ${data.treasury.toLocaleString()} cr`, 'info');
      for (const [commodity, info] of Object.entries(data.prices) as [string, any][]) {
        const modeColor = info.mode === 'sell' ? 'success' : info.mode === 'buy' ? 'trade' : 'info';
        addLine(`  ${commodity.padEnd(12)} ${String(info.price).padStart(5)} cr  [${info.stock}/${info.capacity}]  ${info.mode}`, modeColor as any);
      }
      addLine('Use "buy <commodity> <qty>" or "sell <commodity> <qty>"', 'info');

      // Show Star Mall services if docked at a Star Mall
      if (sector?.hasStarMall) {
        const MALL_SERVICES: Record<string, { label: string; cmd: string }> = {
          shipDealer:   { label: 'Ship Dealer',   cmd: 'dealer' },
          generalStore: { label: 'General Store',  cmd: 'store' },
          garage:       { label: 'Garage',         cmd: 'garage' },
          salvageYard:  { label: 'Salvage Yard',   cmd: 'salvage' },
          cantina:      { label: 'Cantina',        cmd: 'cantina' },
          refueling:    { label: 'Refueling',      cmd: 'refuel' },
          bountyBoard:  { label: 'Bounty Board',   cmd: 'bounties' },
        };
        try {
          const { data: mallData } = await api.getStarMallOverview();
          addLine('', 'info');
          addLine('=== STAR MALL ===', 'system');
          addLine('Welcome to the Star Mall! Services available:', 'success');
          for (const [key, svc] of Object.entries(mallData.services) as [string, any][]) {
            const info = MALL_SERVICES[key] ?? { label: key, cmd: '' };
            const extra = svc.storedShips != null ? ` (${svc.storedShips} ships stored)` :
              svc.activeBounties != null ? ` (${svc.activeBounties} active)` : '';
            const hint = info.cmd ? `  → type "${info.cmd}"` : '';
            addLine(`  ${info.label.padEnd(16)} ${(svc.available ? 'OPEN' : 'CLOSED').padEnd(8)}${extra}${hint}`, svc.available ? 'success' : 'warning');
          }
        } catch {
          addLine('', 'info');
          addLine('=== STAR MALL ===', 'system');
          addLine('Welcome to the Star Mall! Type "mall" to see services.', 'success');
        }
      }

      advanceTutorial('dock');
    } catch (err: any) {
      addLine(err.response?.data?.error || 'Dock failed', 'error');
    }
  }, [addLine, advanceTutorial, enqueueScene, player?.currentShip?.shipTypeId, sector?.hasStarMall]);

  const doUndock = useCallback(async () => {
    try {
      await api.undock();
      setPlayer(prev => prev ? { ...prev, dockedAtOutpostId: null } : null);
      const shipTypeId = player?.currentShip?.shipTypeId ?? 'scout';
      enqueueScene(buildUndockScene(shipTypeId));
      addLine('Undocked from outpost', 'info');
    } catch (err: any) {
      addLine(err.response?.data?.error || 'Undock failed', 'error');
    }
  }, [addLine, enqueueScene, player?.currentShip?.shipTypeId]);

  const doFlee = useCallback(async () => {
    try {
      const { data } = await api.flee();
      if (data.success) {
        const shipTypeId = player?.currentShip?.shipTypeId ?? 'scout';
        enqueueScene(buildFleeScene(shipTypeId));
        addLine('You escaped!', 'success');
        await refreshSector();
        await refreshStatus();
      } else {
        addLine(`Flee failed! (${Math.round(data.fleeChance * 100)}% chance)`, 'error');
      }
    } catch (err: any) {
      addLine(err.response?.data?.error || 'Flee failed', 'error');
    }
  }, [addLine, refreshSector, refreshStatus, enqueueScene, player?.currentShip?.shipTypeId]);

  return {
    player, sector, lines, isLoggedIn, mapData,
    addLine, clearLines, refreshStatus, refreshSector, refreshMap,
    doLogin, doRegister, doLogout,
    doMove, doBuy, doSell, doFire, doFlee, doDock, doUndock,
    setPlayer, setSector,
    advanceTutorial, refreshTutorial, skipTutorial,
    markIntroSeen, markPostTutorialSeen,
    // Scene animations
    inlineScene: sceneQueue[0] ?? null,
    enqueueScene, dequeueScene,
    combatAnimation, clearCombatAnimation,
  };
}
