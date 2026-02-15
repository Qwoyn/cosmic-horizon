import { useState, useCallback } from 'react';
import * as api from '../services/api';

export interface PlayerState {
  id: string;
  username: string;
  energy: number;
  maxEnergy: number;
  credits: number;
  currentSectorId: number;
  currentShip: {
    id: string;
    shipTypeId: string;
    weaponEnergy: number;
    engineEnergy: number;
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

  const addLine = useCallback((text: string, type: TerminalLine['type'] = 'info') => {
    setLines(prev => [...prev, { id: lineIdCounter++, text, type }]);
  }, []);

  const refreshStatus = useCallback(async () => {
    try {
      const { data } = await api.getStatus();
      setPlayer(data);
    } catch { /* not logged in */ }
  }, []);

  const refreshSector = useCallback(async () => {
    try {
      const { data } = await api.getSector();
      setSector(data);
    } catch { /* ignore */ }
  }, []);

  const doLogin = useCallback(async (username: string, password: string) => {
    const { data } = await api.login(username, password);
    setPlayer(data.player);
    setIsLoggedIn(true);
    addLine(`Welcome back, ${data.player.username}!`, 'system');
    await refreshSector();
    return data.player;
  }, [addLine, refreshSector]);

  const doRegister = useCallback(async (username: string, email: string, password: string) => {
    const { data } = await api.register(username, email, password);
    setPlayer(data.player);
    setIsLoggedIn(true);
    addLine(`Welcome to Cosmic Horizon, ${data.player.username}!`, 'system');
    addLine('You have been given a Calvatian Scout and placed at a Star Mall.', 'system');
    addLine('Type "help" for a list of commands.', 'info');
    await refreshSector();
    return data.player;
  }, [addLine, refreshSector]);

  const doLogout = useCallback(async () => {
    await api.logout();
    setPlayer(null);
    setSector(null);
    setIsLoggedIn(false);
    setLines([]);
  }, []);

  const doMove = useCallback(async (sectorId: number) => {
    try {
      const { data } = await api.moveTo(sectorId);
      setPlayer(prev => prev ? { ...prev, energy: data.energy, currentSectorId: data.sectorId } : null);
      addLine(`Warping to sector ${data.sectorId}...`, 'info');
      addLine(`Arrived in sector ${data.sectorId} [${data.sectorType}]`, 'success');
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
    } catch (err: any) {
      addLine(err.response?.data?.error || 'Move failed', 'error');
    }
  }, [addLine, refreshSector]);

  const doBuy = useCallback(async (outpostId: string, commodity: string, quantity: number) => {
    try {
      const { data } = await api.buyFromOutpost(outpostId, commodity, quantity);
      setPlayer(prev => prev ? { ...prev, credits: data.newCredits, energy: data.energy } : null);
      addLine(`Bought ${data.quantity} ${commodity} at ${data.pricePerUnit} cr/unit (total: ${data.totalCost} cr)`, 'trade');
      await refreshStatus();
    } catch (err: any) {
      addLine(err.response?.data?.error || 'Purchase failed', 'error');
    }
  }, [addLine, refreshStatus]);

  const doSell = useCallback(async (outpostId: string, commodity: string, quantity: number) => {
    try {
      const { data } = await api.sellToOutpost(outpostId, commodity, quantity);
      setPlayer(prev => prev ? { ...prev, credits: data.newCredits, energy: data.energy } : null);
      addLine(`Sold ${data.quantity} ${commodity} at ${data.pricePerUnit} cr/unit (total: ${data.totalCost} cr)`, 'trade');
      await refreshStatus();
    } catch (err: any) {
      addLine(err.response?.data?.error || 'Sale failed', 'error');
    }
  }, [addLine, refreshStatus]);

  const doFire = useCallback(async (targetPlayerId: string, energy: number) => {
    try {
      const { data } = await api.fire(targetPlayerId, energy);
      addLine(`Fired! Dealt ${data.damageDealt} damage (${data.attackerEnergySpent} energy spent)`, 'combat');
      if (data.defenderDestroyed) {
        addLine('Target destroyed!', 'success');
      }
      setPlayer(prev => prev ? { ...prev, energy: data.energy } : null);
      await refreshStatus();
    } catch (err: any) {
      addLine(err.response?.data?.error || 'Attack failed', 'error');
    }
  }, [addLine, refreshStatus]);

  const doFlee = useCallback(async () => {
    try {
      const { data } = await api.flee();
      if (data.success) {
        addLine('You escaped!', 'success');
        await refreshSector();
        await refreshStatus();
      } else {
        addLine(`Flee failed! (${Math.round(data.fleeChance * 100)}% chance)`, 'error');
      }
    } catch (err: any) {
      addLine(err.response?.data?.error || 'Flee failed', 'error');
    }
  }, [addLine, refreshSector, refreshStatus]);

  return {
    player, sector, lines, isLoggedIn,
    addLine, refreshStatus, refreshSector,
    doLogin, doRegister, doLogout,
    doMove, doBuy, doSell, doFire, doFlee,
    setPlayer, setSector,
  };
}
