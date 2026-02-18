import * as api from './api';

interface CommandContext {
  addLine: (text: string, type: 'info' | 'success' | 'error' | 'warning' | 'system' | 'combat' | 'trade') => void;
  clearLines: () => void;
  player: any;
  sector: any;
  doMove: (sectorId: number) => void;
  doBuy: (outpostId: string, commodity: string, quantity: number) => void;
  doSell: (outpostId: string, commodity: string, quantity: number) => void;
  doFire: (targetPlayerId: string, energy: number) => void;
  doFlee: () => void;
  refreshStatus: () => void;
  refreshSector: () => void;
  emit: (event: string, data: any) => void;
  advanceTutorial: (action: string) => void;
}

interface ParsedCommand {
  command: string;
  args: string[];
}

const ALIASES: Record<string, string> = {
  m: 'move', l: 'look', s: 'scan', st: 'status', d: 'dock',
  f: 'fire', attack: 'fire', '?': 'help', commands: 'help',
  ships: 'dealer', say: 'chat', jettison: 'eject',
  top: 'leaderboard', lb: 'leaderboard',
  missionboard: 'missions',
  n: 'note',
  fuel: 'refuel',
};

function parse(input: string): ParsedCommand {
  const parts = input.trim().split(/\s+/);
  const raw = parts[0].toLowerCase();
  return {
    command: ALIASES[raw] || raw,
    args: parts.slice(1),
  };
}

export function handleCommand(input: string, ctx: CommandContext): void {
  const { command, args } = parse(input);

  switch (command) {
    case 'move': {
      const sectorId = parseInt(args[0]);
      if (isNaN(sectorId)) {
        ctx.addLine('Usage: move <sector_id>', 'error');
      } else {
        ctx.doMove(sectorId);
      }
      break;
    }

    case 'status': {
      const p = ctx.player;
      if (!p) { ctx.addLine('Not logged in', 'error'); break; }
      const raceLabel = p.race ? ` [${p.race.charAt(0).toUpperCase() + p.race.slice(1)}]` : '';
      ctx.addLine(`=== ${p.username}${raceLabel} ===`, 'system');
      ctx.addLine(`Sector: ${p.currentSectorId} | Energy: ${p.energy}/${p.maxEnergy} | Credits: ${p.credits.toLocaleString()}`, 'info');
      if (p.currentShip) {
        const c = p.currentShip;
        ctx.addLine(`Ship: ${c.shipTypeId} | Weapons: ${c.weaponEnergy} | Engines: ${c.engineEnergy}`, 'info');
        const total = c.cyrilliumCargo + c.foodCargo + c.techCargo + c.colonistsCargo;
        ctx.addLine(`Cargo: Cyr=${c.cyrilliumCargo} Food=${c.foodCargo} Tech=${c.techCargo} Col=${c.colonistsCargo} [${total}/${c.maxCargoHolds}]`, 'info');
      }
      ctx.advanceTutorial('status');
      break;
    }

    case 'look': {
      const s = ctx.sector;
      if (!s) { ctx.addLine('No sector data', 'error'); break; }
      ctx.addLine(`=== Sector ${s.sectorId} [${s.type}] ===`, 'system');
      ctx.addLine(`Adjacent: ${s.adjacentSectors.map((a: any) => a.sectorId + (a.oneWay ? '→' : '')).join(', ')}`, 'info');
      if (s.players.length > 0) ctx.addLine(`Players: ${s.players.map((p: any) => p.username).join(', ')}`, 'warning');
      if (s.outposts.length > 0) ctx.addLine(`Outposts: ${s.outposts.map((o: any) => o.name).join(', ')}`, 'info');
      if (s.planets.length > 0) {
        ctx.addLine(`Planets: ${s.planets.map((p: any) => `${p.name} [${p.planetClass}]${p.ownerId ? '' : ' *unclaimed*'}`).join(', ')}`, 'info');
      }
      if (s.events?.length > 0) {
        ctx.addLine(`Anomalies: ${s.events.map((e: any) => e.eventType.replace(/_/g, ' ')).join(', ')}`, 'warning');
      }
      if (s.warpGates?.length > 0) {
        ctx.addLine(`Warp Gates: ${s.warpGates.map((g: any) => `→ Sector ${g.destinationSectorId}${g.tollAmount > 0 ? ` (${g.tollAmount} cr toll)` : ''}`).join(', ')}`, 'success');
      }
      if (s.hasStarMall) ctx.addLine('★ Star Mall available - type "dealer" to see ships', 'success');
      ctx.advanceTutorial('look');
      break;
    }

    case 'scan':
      ctx.addLine('Scanning adjacent sectors...', 'info');
      api.scan().then(({ data }) => {
        if (data.scannedSectors.length === 0) {
          ctx.addLine('No scanner data returned', 'warning');
          return;
        }
        for (const sector of data.scannedSectors) {
          const parts = [`Sector ${sector.id} [${sector.type}]`];
          if (sector.planets.length > 0) parts.push(`${sector.planets.length} planet(s)`);
          if (sector.players.length > 0) parts.push(`${sector.players.length} pilot(s)`);
          ctx.addLine(`  ${parts.join(' - ')}`, 'info');
        }
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Scan failed', 'error'));
      break;

    case 'map':
      ctx.addLine('Fetching explored map...', 'info');
      api.getMap().then(({ data }) => {
        ctx.addLine(`Explored ${data.sectors.length} sectors`, 'system');
        ctx.addLine(`Current: Sector ${data.currentSectorId}`, 'info');
        const starMalls = data.sectors.filter((s: any) => s.hasStarMall);
        if (starMalls.length > 0) {
          ctx.addLine(`Star Malls discovered: ${starMalls.map((s: any) => `Sector ${s.id}`).join(', ')}`, 'success');
        }
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Map failed', 'error'));
      break;

    case 'dock': {
      const outpost = ctx.sector?.outposts?.[0];
      if (!outpost) { ctx.addLine('No outpost in this sector', 'error'); break; }
      ctx.addLine(`Docking at ${outpost.name}...`, 'info');
      api.getOutpost(outpost.id).then(({ data }) => {
        ctx.addLine(`=== ${data.name} ===`, 'system');
        ctx.addLine(`Treasury: ${data.treasury.toLocaleString()} cr`, 'info');
        for (const [commodity, info] of Object.entries(data.prices) as [string, any][]) {
          const modeColor = info.mode === 'sell' ? 'success' : info.mode === 'buy' ? 'trade' : 'info';
          ctx.addLine(`  ${commodity.padEnd(12)} ${String(info.price).padStart(5)} cr  [${info.stock}/${info.capacity}]  ${info.mode}`, modeColor as any);
        }
        ctx.addLine('Use "buy <commodity> <qty>" or "sell <commodity> <qty>"', 'info');
        ctx.advanceTutorial('dock');
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Dock failed', 'error'));
      break;
    }

    case 'buy': {
      if (args.length < 2) { ctx.addLine('Usage: buy <commodity> <quantity>', 'error'); break; }
      const outpost = ctx.sector?.outposts?.[0];
      if (!outpost) { ctx.addLine('No outpost in this sector', 'error'); break; }
      ctx.doBuy(outpost.id, args[0].toLowerCase(), parseInt(args[1]) || 1);
      break;
    }

    case 'sell': {
      if (args.length < 2) { ctx.addLine('Usage: sell <commodity> <quantity>', 'error'); break; }
      const outpost = ctx.sector?.outposts?.[0];
      if (!outpost) { ctx.addLine('No outpost in this sector', 'error'); break; }
      ctx.doSell(outpost.id, args[0].toLowerCase(), parseInt(args[1]) || 1);
      break;
    }

    case 'fire': {
      if (args.length < 2) { ctx.addLine('Usage: fire <player_name> <energy>', 'error'); break; }
      const targetName = args[0];
      const energy = parseInt(args[1]);
      if (isNaN(energy)) { ctx.addLine('Energy must be a number', 'error'); break; }
      const target = ctx.sector?.players?.find((p: any) => p.username.toLowerCase() === targetName.toLowerCase());
      if (!target) { ctx.addLine('Player not found in sector', 'error'); break; }
      ctx.doFire(target.id, energy);
      break;
    }

    case 'flee':
      ctx.doFlee();
      break;

    case 'land': {
      if (args.length < 1) { ctx.addLine('Usage: land <planet_name>', 'error'); break; }
      const name = args.join(' ').toLowerCase();
      const planet = ctx.sector?.planets?.find((p: any) => p.name.toLowerCase().includes(name));
      if (!planet) { ctx.addLine('Planet not found in sector', 'error'); break; }
      api.getPlanet(planet.id).then(({ data }) => {
        ctx.addLine(`=== ${data.name} [Class ${data.planetClass}] ===`, 'system');
        ctx.addLine(`Owner: ${data.ownerId || 'Unclaimed'} | Level: ${data.upgradeLevel} | Colonists: ${data.colonists.toLocaleString()}`, 'info');
        ctx.addLine(`Stocks: Cyr=${data.cyrilliumStock} Food=${data.foodStock} Tech=${data.techStock} Drones=${data.droneCount}`, 'info');
        ctx.addLine(`Production/tick: Cyr=${data.production.cyrillium} Food=${data.production.food} Tech=${data.production.tech}`, 'trade');
        if (data.canUpgrade) ctx.addLine('This planet can be upgraded! Type "upgrade <name>"', 'success');
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Landing failed', 'error'));
      break;
    }

    case 'claim': {
      if (args.length < 1) { ctx.addLine('Usage: claim <planet_name>', 'error'); break; }
      const name = args.join(' ').toLowerCase();
      const planet = ctx.sector?.planets?.find((p: any) => p.name.toLowerCase().includes(name));
      if (!planet) { ctx.addLine('Planet not found in sector', 'error'); break; }
      api.claimPlanet(planet.id).then(() => {
        ctx.addLine(`Claimed ${planet.name}!`, 'success');
        ctx.refreshSector();
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Claim failed', 'error'));
      break;
    }

    case 'colonize': {
      if (args.length < 2) { ctx.addLine('Usage: colonize <planet_name> <quantity>', 'error'); break; }
      const qty = parseInt(args[args.length - 1]);
      if (isNaN(qty)) { ctx.addLine('Quantity must be a number', 'error'); break; }
      const name = args.slice(0, -1).join(' ').toLowerCase();
      const planet = ctx.sector?.planets?.find((p: any) => p.name.toLowerCase().includes(name));
      if (!planet) { ctx.addLine('Planet not found in sector', 'error'); break; }
      api.colonizePlanet(planet.id, qty).then(({ data }) => {
        ctx.addLine(`Deposited ${data.deposited} colonists on ${planet.name} (${data.planetColonists} total)`, 'success');
        ctx.refreshStatus();
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Colonize failed', 'error'));
      break;
    }

    case 'collect': {
      if (args.length < 2) { ctx.addLine('Usage: collect <planet_name> <quantity>', 'error'); break; }
      const qty = parseInt(args[args.length - 1]);
      if (isNaN(qty)) { ctx.addLine('Quantity must be a number', 'error'); break; }
      const name = args.slice(0, -1).join(' ').toLowerCase();
      const planet = ctx.sector?.planets?.find((p: any) => p.name.toLowerCase().includes(name));
      if (!planet) { ctx.addLine('Planet not found in sector', 'error'); break; }
      api.collectColonists(planet.id, qty).then(({ data }) => {
        ctx.addLine(`Collected ${data.collected} colonists from ${planet.name}`, 'success');
        ctx.refreshStatus();
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Collect failed', 'error'));
      break;
    }

    case 'upgrade': {
      if (args.length < 1) { ctx.addLine('Usage: upgrade <planet_name>', 'error'); break; }
      const name = args.join(' ').toLowerCase();
      const planet = ctx.sector?.planets?.find((p: any) => p.name.toLowerCase().includes(name));
      if (!planet) { ctx.addLine('Planet not found in sector', 'error'); break; }
      api.upgradePlanet(planet.id).then(({ data }) => {
        ctx.addLine(`${planet.name} upgraded to level ${data.newLevel}!`, 'success');
        ctx.refreshStatus();
        ctx.refreshSector();
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Upgrade failed', 'error'));
      break;
    }

    case 'dealer':
      api.getDealer().then(({ data }) => {
        ctx.addLine('=== SHIP DEALER ===', 'system');
        for (const ship of data.ships) {
          ctx.addLine(`  ${ship.name.padEnd(24)} ${String(ship.price).padStart(8)} cr  W:${ship.baseWeaponEnergy} C:${ship.baseCargoHolds} E:${ship.baseEngineEnergy}`, 'info');
        }
        ctx.addLine('Use "buyship <type>" to purchase', 'info');
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'No star mall here', 'error'));
      break;

    case 'buyship': {
      if (args.length < 1) { ctx.addLine('Usage: buyship <ship_type>', 'error'); break; }
      api.buyShip(args[0]).then(({ data }) => {
        ctx.addLine(`Purchased ${data.shipType}! Credits remaining: ${data.newCredits.toLocaleString()}`, 'success');
        ctx.refreshStatus();
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Purchase failed', 'error'));
      break;
    }

    case 'cloak':
      api.toggleCloak().then(({ data }) => {
        ctx.addLine(data.cloaked ? 'Cloaking device engaged' : 'Cloaking device disengaged', data.cloaked ? 'success' : 'info');
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Cloak failed', 'error'));
      break;

    case 'eject': {
      if (args.length < 2) { ctx.addLine('Usage: eject <commodity> <quantity>', 'error'); break; }
      api.ejectCargo(args[0].toLowerCase(), parseInt(args[1]) || 1).then(({ data }) => {
        ctx.addLine(`Jettisoned ${data.ejected} ${data.commodity} (${data.remaining} remaining)`, 'warning');
        ctx.refreshStatus();
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Eject failed', 'error'));
      break;
    }

    case 'chat': {
      if (args.length < 1) { ctx.addLine('Usage: chat <message>', 'error'); break; }
      const msg = args.join(' ');
      const name = ctx.player?.username || 'You';
      ctx.addLine(`[${name}] ${msg}`, 'info');
      ctx.emit('chat:sector', { message: msg });
      break;
    }

    case 'bounty': {
      if (args.length < 2) { ctx.addLine('Usage: bounty <player_name> <amount>', 'error'); break; }
      const amount = parseInt(args[args.length - 1]);
      if (isNaN(amount)) { ctx.addLine('Amount must be a number', 'error'); break; }
      // Find the player - they need to be known somehow. For now just pass the name.
      ctx.addLine(`Placing bounty... (TODO: resolve player by name)`, 'warning');
      break;
    }

    case 'bounties':
      api.getBounties().then(({ data }) => {
        if (data.bounties.length === 0) { ctx.addLine('No active bounties', 'info'); return; }
        ctx.addLine('=== ACTIVE BOUNTIES ===', 'system');
        for (const b of data.bounties) {
          ctx.addLine(`  ${b.targetUsername.padEnd(20)} ${String(b.amount).padStart(8)} cr  (placed by ${b.placedByUsername})`, 'warning');
        }
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Failed to fetch bounties', 'error'));
      break;

    case 'mall':
      api.getStarMallOverview().then(({ data }) => {
        ctx.addLine('=== STAR MALL ===', 'system');
        for (const [name, svc] of Object.entries(data.services) as [string, any][]) {
          const extra = svc.storedShips != null ? ` (${svc.storedShips} ships stored)` :
            svc.activeBounties != null ? ` (${svc.activeBounties} active)` : '';
          ctx.addLine(`  ${name.padEnd(16)} ${svc.available ? 'OPEN' : 'CLOSED'}${extra}`, svc.available ? 'success' : 'warning');
        }
        ctx.addLine(`Credits: ${data.credits.toLocaleString()}`, 'info');
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Not at a star mall', 'error'));
      break;

    case 'store':
      api.getStoreCatalog().then(({ data }) => {
        ctx.addLine('=== GENERAL STORE ===', 'system');
        for (const item of data.items) {
          const avail = item.canUse ? '' : ` [${item.reason}]`;
          ctx.addLine(`  ${item.name.padEnd(28)} ${String(item.price).padStart(8)} cr  [${item.category}]${avail}`, item.canUse ? 'info' : 'warning');
        }
        ctx.addLine('Use "purchase <item_id>" to buy', 'info');
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Not at a star mall', 'error'));
      break;

    case 'purchase': {
      if (args.length < 1) { ctx.addLine('Usage: purchase <item_id>', 'error'); break; }
      api.buyStoreItem(args[0]).then(({ data }) => {
        ctx.addLine(`Purchased ${data.name || data.item}! Credits: ${data.newCredits?.toLocaleString() ?? 'N/A'}`, 'success');
        ctx.refreshStatus();
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Purchase failed', 'error'));
      break;
    }

    case 'inventory':
      api.getInventory().then(({ data }) => {
        if (data.inventory.length === 0) { ctx.addLine('Your inventory is empty', 'info'); return; }
        ctx.addLine('=== INVENTORY ===', 'system');
        for (const item of data.inventory) {
          ctx.addLine(`  ${item.name} (${item.itemId})`, 'info');
        }
        ctx.addLine('Use "use <item_id>" to use an item', 'info');
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Failed', 'error'));
      break;

    case 'use': {
      if (args.length < 1) { ctx.addLine('Usage: use <item_id> [args]', 'error'); break; }
      const extra = args.length > 1 ? { sectorId: parseInt(args[1]) } : {};
      api.useStoreItem(args[0], extra).then(({ data }) => {
        ctx.addLine(`Used item successfully`, 'success');
        if (data.sectorId) {
          ctx.addLine(`Sector ${data.sectorId} [${data.sectorType}]:`, 'system');
          if (data.players?.length) ctx.addLine(`  Players: ${data.players.join(', ')}`, 'warning');
          if (data.outposts?.length) ctx.addLine(`  Outposts: ${data.outposts.join(', ')}`, 'info');
          if (data.planets?.length) ctx.addLine(`  Planets: ${data.planets.map((p: any) => `${p.name} [${p.class}]`).join(', ')}`, 'info');
        }
        ctx.refreshStatus();
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Use failed', 'error'));
      break;
    }

    case 'garage':
      api.getGarage().then(({ data }) => {
        if (data.ships.length === 0) { ctx.addLine('No ships in garage', 'info'); return; }
        ctx.addLine('=== GARAGE ===', 'system');
        for (const ship of data.ships) {
          ctx.addLine(`  ${ship.name.padEnd(24)} W:${ship.weaponEnergy} E:${ship.engineEnergy} C:${ship.cargoHolds}  [${ship.id.slice(0, 8)}]`, 'info');
        }
        ctx.addLine('Use "retrieve <ship_id>" to get a ship', 'info');
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Not at a star mall', 'error'));
      break;

    case 'storeship':
      api.storeShipInGarage().then(({ data }) => {
        ctx.addLine(`Ship stored in garage. Switched to ${data.switchedTo.slice(0, 8)}`, 'success');
        if (data.note) ctx.addLine(data.note, 'warning');
        ctx.refreshStatus();
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Store failed', 'error'));
      break;

    case 'retrieve': {
      if (args.length < 1) { ctx.addLine('Usage: retrieve <ship_id>', 'error'); break; }
      api.retrieveShipFromGarage(args[0]).then(({ data }) => {
        ctx.addLine(`Retrieved ${data.name} from garage`, 'success');
        ctx.refreshStatus();
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Retrieve failed', 'error'));
      break;
    }

    case 'salvage':
      if (args.length > 0 && args[0] !== 'list') {
        api.salvageShip(args[0]).then(({ data }) => {
          ctx.addLine(`Salvaged ${data.shipType} for ${data.salvageValue.toLocaleString()} credits`, 'success');
          ctx.refreshStatus();
        }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Salvage failed', 'error'));
      } else {
        api.getSalvageOptions().then(({ data }) => {
          if (data.ships.length === 0) { ctx.addLine('No ships available for salvage', 'info'); return; }
          ctx.addLine('=== SALVAGE YARD ===', 'system');
          for (const ship of data.ships) {
            const status = ship.hasCargo ? ' [has cargo!]' : '';
            ctx.addLine(`  ${ship.name.padEnd(24)} ${String(ship.salvageValue).padStart(8)} cr${status}  [${ship.id.slice(0, 8)}]`, ship.hasCargo ? 'warning' : 'info');
          }
          ctx.addLine('Use "salvage <ship_id>" to sell', 'info');
        }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Not at a star mall', 'error'));
      }
      break;

    case 'cantina':
      api.getCantina().then(({ data }) => {
        ctx.addLine('=== CANTINA ===', 'system');
        ctx.addLine(`"${data.rumor}"`, 'info');
        ctx.addLine(`Intel available for ${data.intelCost} credits. Type "intel" to buy.`, 'trade');
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Not at a star mall', 'error'));
      break;

    case 'intel':
      api.buyCantineIntel().then(({ data }) => {
        ctx.addLine('=== SECTOR INTELLIGENCE ===', 'system');
        ctx.addLine('Richest Outposts:', 'info');
        for (const o of data.intel.richOutposts) {
          ctx.addLine(`  ${o.name} (Sector ${o.sectorId}) - ${Number(o.treasury).toLocaleString()} cr`, 'trade');
        }
        ctx.addLine('Most Populated Planets:', 'info');
        for (const p of data.intel.topPlanets) {
          ctx.addLine(`  ${p.name} [${p.planetClass}] (Sector ${p.sectorId}) - ${Number(p.colonists).toLocaleString()} colonists`, 'info');
        }
        if (data.intel.dangerousSectors.length > 0) {
          ctx.addLine(`Dangerous Sectors: ${data.intel.dangerousSectors.join(', ')}`, 'warning');
        }
        ctx.addLine(`Cost: ${data.cost} cr | Credits: ${data.newCredits.toLocaleString()}`, 'trade');
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Intel failed', 'error'));
      break;

    case 'refuel': {
      const qty = args.length > 0 ? parseInt(args[0]) : 50;
      api.refuel(isNaN(qty) ? 50 : qty).then(({ data }) => {
        ctx.addLine(`Refueled ${data.refueled} energy for ${data.cost} credits. Energy: ${data.newEnergy}`, 'success');
        ctx.refreshStatus();
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Refuel failed', 'error'));
      break;
    }

    case 'deploy': {
      if (args.length < 1) { ctx.addLine('Usage: deploy <item_id> [toll_amount] [buoy_message...]', 'error'); break; }
      const tollAmt = args.length > 1 ? parseInt(args[1]) : undefined;
      const buoyMsg = args.length > 1 ? args.slice(1).join(' ') : undefined;
      api.deploy(args[0], tollAmt, buoyMsg).then(({ data }) => {
        ctx.addLine(`Deployed ${data.type} in sector ${data.sectorId}. Credits: ${data.newCredits.toLocaleString()}`, 'success');
        ctx.refreshStatus();
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Deploy failed', 'error'));
      break;
    }

    case 'combatlog':
      api.getCombatLog().then(({ data }) => {
        if (data.logs.length === 0) { ctx.addLine('No combat records', 'info'); return; }
        ctx.addLine('=== COMBAT LOG ===', 'system');
        for (const log of data.logs) {
          ctx.addLine(`  ${log.attackerName} → ${log.defenderName} | ${log.damageDealt} dmg [${log.outcome}] Sector ${log.sectorId}`, 'combat');
        }
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Failed', 'error'));
      break;

    // === MISSIONS ===
    case 'missions':
      if (args[0] === 'completed') {
        api.getCompletedMissions().then(({ data }) => {
          if (data.missions.length === 0) { ctx.addLine('No completed missions', 'info'); return; }
          ctx.addLine('=== COMPLETED MISSIONS ===', 'system');
          for (const m of data.missions) {
            ctx.addLine(`  ${m.title} | +${m.rewardCredits} cr`, 'success');
          }
        }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Failed', 'error'));
      } else {
        api.getActiveMissions().then(({ data }) => {
          if (data.missions.length === 0) { ctx.addLine('No active missions. Visit a Star Mall mission board.', 'info'); return; }
          ctx.addLine('=== ACTIVE MISSIONS ===', 'system');
          for (const m of data.missions) {
            const progress = JSON.stringify(m.progress);
            ctx.addLine(`  [${m.missionId.slice(0, 8)}] ${m.title} (${m.type})`, 'info');
            ctx.addLine(`    Progress: ${progress} | Reward: ${m.rewardCredits} cr`, 'trade');
          }
        }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Failed', 'error'));
      }
      break;

    case 'missionboard':
      api.getAvailableMissions().then(({ data }) => {
        if (data.missions.length === 0) { ctx.addLine('No missions available', 'info'); return; }
        ctx.addLine('=== MISSION BOARD ===', 'system');
        for (const m of data.missions) {
          ctx.addLine(`  [${m.id.slice(0, 8)}] ${m.title} (Diff: ${m.difficulty})`, 'info');
          ctx.addLine(`    ${m.description}`, 'info');
          ctx.addLine(`    Reward: ${m.rewardCredits} cr${m.timeLimitMinutes ? ` | Time: ${m.timeLimitMinutes}m` : ''}`, 'trade');
        }
        ctx.addLine('Use "accept <mission_id>" to accept', 'info');
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Not at a star mall', 'error'));
      break;

    case 'accept': {
      if (args.length < 1) { ctx.addLine('Usage: accept <mission_id>', 'error'); break; }
      api.acceptMission(args[0]).then(({ data }) => {
        ctx.addLine(`Accepted: ${data.title}`, 'success');
        ctx.addLine(`Reward: ${data.rewardCredits} cr${data.expiresAt ? ` | Expires: ${new Date(data.expiresAt).toLocaleTimeString()}` : ''}`, 'trade');
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Accept failed', 'error'));
      break;
    }

    case 'abandon': {
      if (args.length < 1) { ctx.addLine('Usage: abandon <mission_id>', 'error'); break; }
      api.abandonMission(args[0]).then(() => {
        ctx.addLine('Mission abandoned', 'warning');
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Abandon failed', 'error'));
      break;
    }

    // === SECTOR EVENTS ===
    case 'investigate': {
      if (args.length < 1) {
        // Investigate first event in sector
        const evt = ctx.sector?.events?.[0];
        if (!evt) { ctx.addLine('No anomalies in this sector', 'error'); break; }
        api.investigateEvent(evt.id).then(({ data }) => {
          ctx.addLine(data.message, 'success');
          if (data.creditsGained) ctx.addLine(`+${data.creditsGained} credits`, 'trade');
          if (data.creditsLost) ctx.addLine(`-${data.creditsLost} credits`, 'warning');
          if (data.cargoGained) ctx.addLine(`+${data.cargoGained.quantity} ${data.cargoGained.commodity}`, 'trade');
          ctx.refreshStatus();
          ctx.refreshSector();
        }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Investigation failed', 'error'));
      } else {
        api.investigateEvent(args[0]).then(({ data }) => {
          ctx.addLine(data.message, 'success');
          if (data.creditsGained) ctx.addLine(`+${data.creditsGained} credits`, 'trade');
          if (data.creditsLost) ctx.addLine(`-${data.creditsLost} credits`, 'warning');
          if (data.cargoGained) ctx.addLine(`+${data.cargoGained.quantity} ${data.cargoGained.commodity}`, 'trade');
          ctx.refreshStatus();
          ctx.refreshSector();
        }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Investigation failed', 'error'));
      }
      break;
    }

    // === LEADERBOARDS ===
    case 'leaderboard': {
      const category = args[0] || '';
      if (category) {
        api.getLeaderboard(category).then(({ data }) => {
          ctx.addLine(`=== LEADERBOARD: ${data.category.toUpperCase()} ===`, 'system');
          for (const entry of data.entries) {
            ctx.addLine(`  #${String(entry.rank).padStart(2)}  ${entry.player_name.padEnd(20)} ${String(entry.score).padStart(10)}`, 'info');
          }
        }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Failed', 'error'));
      } else {
        api.getLeaderboardOverview().then(({ data }) => {
          ctx.addLine('=== LEADERBOARDS ===', 'system');
          for (const [cat, entries] of Object.entries(data.leaderboards) as [string, any[]][]) {
            ctx.addLine(`--- ${cat.toUpperCase()} ---`, 'system');
            for (const e of entries) {
              ctx.addLine(`  #${String(e.rank).padStart(2)}  ${e.player_name.padEnd(20)} ${String(e.score).padStart(10)}`, 'info');
            }
          }
          ctx.addLine('Use "leaderboard <category>" for full rankings', 'info');
          ctx.addLine('Categories: credits, planets, combat, explored, trade, syndicate', 'info');
        }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Failed', 'error'));
      }
      break;
    }

    // === MAIL ===
    case 'mail': {
      const sub = args[0];
      if (sub === 'read' && args[1]) {
        api.readMessage(args[1]).then(({ data }) => {
          ctx.addLine(`=== MESSAGE ===`, 'system');
          ctx.addLine(`From: ${data.senderName} | To: ${data.recipientName}`, 'info');
          ctx.addLine(`Subject: ${data.subject}`, 'info');
          ctx.addLine(`---`, 'system');
          ctx.addLine(data.body, 'info');
        }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Failed', 'error'));
      } else if (sub === 'send' && args.length >= 4) {
        const recipient = args[1];
        const subject = args[2];
        const body = args.slice(3).join(' ');
        api.sendMessage(recipient, subject, body).then(() => {
          ctx.addLine(`Message sent to ${recipient}`, 'success');
        }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Send failed', 'error'));
      } else if (sub === 'delete' && args[1]) {
        api.deleteMessage(args[1]).then(() => {
          ctx.addLine('Message deleted', 'success');
        }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Delete failed', 'error'));
      } else if (sub === 'sent') {
        api.getSentMessages().then(({ data }) => {
          if (data.messages.length === 0) { ctx.addLine('No sent messages', 'info'); return; }
          ctx.addLine('=== SENT MAIL ===', 'system');
          for (const m of data.messages) {
            ctx.addLine(`  [${m.id.slice(0, 8)}] To: ${m.recipientName} - ${m.subject}`, 'info');
          }
        }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Failed', 'error'));
      } else {
        // Default: show inbox
        api.getInbox().then(({ data }) => {
          if (data.messages.length === 0) { ctx.addLine('Inbox empty', 'info'); return; }
          ctx.addLine('=== INBOX ===', 'system');
          for (const m of data.messages) {
            const unread = m.read ? '' : ' [NEW]';
            ctx.addLine(`  [${m.id.slice(0, 8)}] ${m.senderName.padEnd(16)} ${m.subject}${unread}`, m.read ? 'info' : 'warning');
          }
          ctx.addLine('Use "mail read <id>" to read, "mail send <to> <subject> <body>" to send', 'info');
        }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Failed', 'error'));
      }
      break;
    }

    // === SHIP UPGRADES ===
    case 'upgrades':
      api.getAvailableUpgrades().then(({ data }) => {
        if (data.upgrades.length === 0) { ctx.addLine('No upgrades available', 'info'); return; }
        ctx.addLine('=== AVAILABLE UPGRADES ===', 'system');
        for (const u of data.upgrades) {
          ctx.addLine(`  ${u.name.padEnd(20)} ${String(u.price).padStart(8)} cr  [${u.slot}] +${u.statBonus}`, 'info');
          ctx.addLine(`    ${u.description} (ID: ${u.id})`, 'info');
        }
        ctx.addLine('Use "install <upgrade_id>" to install', 'info');
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Not at a star mall', 'error'));
      break;

    case 'shipupgrades':
      api.getShipUpgrades().then(({ data }) => {
        if (data.upgrades.length === 0) { ctx.addLine('No upgrades installed on current ship', 'info'); return; }
        ctx.addLine('=== SHIP UPGRADES ===', 'system');
        for (const u of data.upgrades) {
          ctx.addLine(`  ${u.name.padEnd(20)} [${u.slot}] +${u.effectiveBonus}  (${u.installId.slice(0, 8)})`, 'info');
        }
        ctx.addLine('Use "uninstall <install_id>" to remove', 'info');
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Not at a star mall', 'error'));
      break;

    case 'install': {
      if (args.length < 1) { ctx.addLine('Usage: install <upgrade_name>', 'error'); break; }
      const query = args.join(' ').toLowerCase();
      api.getAvailableUpgrades().then(({ data }) => {
        const matches = data.upgrades.filter((u: any) =>
          u.id.toLowerCase().includes(query) || u.name.toLowerCase().includes(query)
        );
        if (matches.length === 0) {
          ctx.addLine(`No upgrade matching "${query}". Type "upgrades" to see available options.`, 'error');
        } else if (matches.length === 1) {
          api.installUpgrade(matches[0].id).then(({ data: installData }) => {
            ctx.addLine(`Installed ${installData.name} [${installData.slot}] +${installData.effectiveBonus}`, 'success');
            ctx.addLine(`Credits: ${installData.newCredits.toLocaleString()}`, 'trade');
            ctx.refreshStatus();
          }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Install failed', 'error'));
        } else {
          ctx.addLine(`Multiple matches for "${query}":`, 'warning');
          for (const m of matches) {
            ctx.addLine(`  ${m.name} (${m.id}) — ${m.price} cr [${m.slot}]`, 'info');
          }
          ctx.addLine('Be more specific, e.g. "install cargo_mk2"', 'info');
        }
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Not at a star mall', 'error'));
      break;
    }

    case 'uninstall': {
      if (args.length < 1) { ctx.addLine('Usage: uninstall <install_id>', 'error'); break; }
      api.uninstallUpgrade(args[0]).then(() => {
        ctx.addLine('Upgrade removed', 'success');
      }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Uninstall failed', 'error'));
      break;
    }

    // === WARP GATES ===
    case 'warp': {
      const sub = args[0];
      if (sub === 'build' && args[1]) {
        const destSector = parseInt(args[1]);
        if (isNaN(destSector)) { ctx.addLine('Usage: warp build <sector_id>', 'error'); break; }
        api.buildWarpGate(destSector).then(({ data }) => {
          ctx.addLine(`Warp gate built! Sector ${data.sectorA} ↔ Sector ${data.sectorB}`, 'success');
          ctx.addLine(`Credits: ${data.newCredits.toLocaleString()}`, 'trade');
          ctx.refreshStatus();
          ctx.refreshSector();
        }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Build failed', 'error'));
      } else if (sub === 'toll' && args[1] && args[2]) {
        const toll = parseInt(args[2]);
        if (isNaN(toll)) { ctx.addLine('Usage: warp toll <gate_id> <amount>', 'error'); break; }
        api.setWarpGateToll(args[1], toll).then(({ data }) => {
          ctx.addLine(`Toll set to ${data.newToll} cr`, 'success');
        }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Failed', 'error'));
      } else if (sub === 'list') {
        api.getSyndicateWarpGates().then(({ data }) => {
          if (data.gates.length === 0) { ctx.addLine('No syndicate warp gates', 'info'); return; }
          ctx.addLine('=== SYNDICATE WARP GATES ===', 'system');
          for (const g of data.gates) {
            ctx.addLine(`  [${g.id.slice(0, 8)}] Sector ${g.sectorA} ↔ Sector ${g.sectorB} | Toll: ${g.tollAmount} cr | HP: ${g.health}`, 'info');
          }
        }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Failed', 'error'));
      } else {
        // Use a warp gate in current sector
        const gate = ctx.sector?.warpGates?.[0];
        if (args[0]) {
          api.useWarpGate(args[0]).then(({ data }) => {
            ctx.addLine(`Warped to sector ${data.destinationSectorId}!${data.tollPaid > 0 ? ` Toll: ${data.tollPaid} cr` : ''}`, 'success');
            ctx.refreshStatus();
            ctx.refreshSector();
          }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Warp failed', 'error'));
        } else if (gate) {
          api.useWarpGate(gate.id).then(({ data }) => {
            ctx.addLine(`Warped to sector ${data.destinationSectorId}!${data.tollPaid > 0 ? ` Toll: ${data.tollPaid} cr` : ''}`, 'success');
            ctx.refreshStatus();
            ctx.refreshSector();
          }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Warp failed', 'error'));
        } else {
          ctx.addLine('No warp gate in sector. Usage: warp [gate_id], warp build <sector>, warp toll <gate> <amt>, warp list', 'error');
        }
      }
      break;
    }

    // === NOTES ===
    case 'note': {
      if (args.length < 1) { ctx.addLine('Usage: note <text> — create a note, or: note del <id>', 'error'); break; }
      if (args[0] === 'del' && args[1]) {
        const prefix = args[1].toLowerCase();
        api.getNotes().then(({ data }) => {
          const match = data.notes.find((n: any) => n.id.toLowerCase().startsWith(prefix));
          if (!match) { ctx.addLine('Note not found', 'error'); return; }
          api.deleteNote(match.id).then(() => {
            ctx.addLine('Note deleted', 'success');
          }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Delete failed', 'error'));
        }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Failed', 'error'));
      } else {
        const content = args.join(' ');
        api.createNote(content).then(({ data }) => {
          ctx.addLine(`Note saved [${data.id.slice(0, 8)}]`, 'success');
        }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Failed to save note', 'error'));
      }
      break;
    }

    case 'notes': {
      if (args[0] === 'search' && args.length > 1) {
        const term = args.slice(1).join(' ');
        api.getNotes(term).then(({ data }) => {
          if (data.notes.length === 0) { ctx.addLine('No matching notes', 'info'); return; }
          ctx.addLine(`=== NOTES (search: ${term}) ===`, 'system');
          for (const n of data.notes) {
            ctx.addLine(`  [${n.id.slice(0, 8)}] ${n.content}`, 'info');
          }
        }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Failed', 'error'));
      } else {
        api.getNotes().then(({ data }) => {
          if (data.notes.length === 0) { ctx.addLine('No notes yet', 'info'); return; }
          ctx.addLine('=== NOTES ===', 'system');
          for (const n of data.notes) {
            ctx.addLine(`  [${n.id.slice(0, 8)}] ${n.content}`, 'info');
          }
        }).catch((err: any) => ctx.addLine(err.response?.data?.error || 'Failed', 'error'));
      }
      break;
    }

    case 'tips': {
      ctx.addLine('=== TIPS ===', 'system');
      ctx.addLine('Type "help <category>" for commands in a specific area.', 'info');
      const p = ctx.player;
      const s = ctx.sector;
      if (s?.hasStarMall) {
        ctx.addLine('You\'re at a Star Mall! Try: "upgrades" to see ship improvements, "missionboard" for missions, "store" for items.', 'success');
      }
      if (p?.currentShip) {
        const total = p.currentShip.cyrilliumCargo + p.currentShip.foodCargo + p.currentShip.techCargo + p.currentShip.colonistsCargo;
        if (total > 0) {
          ctx.addLine('You\'re carrying cargo. Find an outpost to "sell" it — buy low, sell high!', 'trade');
        }
      }
      ctx.addLine('Explore more sectors to find Star Malls, outposts, and planets. Use "map" to see where you\'ve been.', 'info');
      ctx.addLine('Outposts that BUY goods pay more. Outposts that SELL goods charge less. Check "dock" prices.', 'trade');
      ctx.addLine('See another player? "fire <name> <energy>" to attack. "flee" to escape.', 'combat');
      ctx.addLine('Check your mission progress with "missions".', 'info');
      break;
    }

    case 'help': {
      if (args.length > 0) {
        const query = args[0].toLowerCase();
        // Check if it's a category first
        const categoryLines = getHelpForCategory(query);
        if (categoryLines) {
          categoryLines.forEach(line => ctx.addLine(line.text, line.type));
        } else {
          // Try as a command
          const cmdLines = getHelpForCommand(query);
          cmdLines.forEach(line => ctx.addLine(line, 'info'));
        }
      } else {
        ctx.addLine('=== COMMAND CATEGORIES ===', 'system');
        ctx.addLine('  navigation    Movement & exploration (move, look, scan, map)', 'info');
        ctx.addLine('  trading       Buying & selling goods (dock, buy, sell)', 'info');
        ctx.addLine('  combat        Fighting & fleeing (fire, flee)', 'info');
        ctx.addLine('  planets       Planet management (land, claim, colonize, collect, upgrade)', 'info');
        ctx.addLine('  ships         Ships & garage (dealer, buyship, cloak, eject, garage, storeship, retrieve, salvage)', 'info');
        ctx.addLine('  upgrades      Ship upgrades (upgrades, shipupgrades, install, uninstall)', 'info');
        ctx.addLine('  store         Store & items (mall, store, purchase, inventory, use, refuel)', 'info');
        ctx.addLine('  deploy        Deployables (deploy)', 'info');
        ctx.addLine('  missions      Missions (missions, missionboard, accept, abandon)', 'info');
        ctx.addLine('  social        Social features (chat, bounties, leaderboard)', 'info');
        ctx.addLine('  mail          Messaging (mail read/send/delete/sent)', 'info');
        ctx.addLine('  notes         Notes (note, notes)', 'info');
        ctx.addLine('  warp          Warp gates (warp use/build/toll/list)', 'info');
        ctx.addLine('  events        Events (investigate)', 'info');
        ctx.addLine('', 'info');
        ctx.addLine('Type "help <category>" for commands or "help <command>" for details.', 'info');
        ctx.addLine('Type "tips" for contextual guidance.', 'info');
      }
      break;
    }

    case 'clear':
      ctx.clearLines();
      break;

    default:
      ctx.addLine(`Unknown command: ${command}. Type "help" for commands.`, 'error');
  }
}

function getHelpForCategory(category: string): { text: string; type: 'info' | 'system' }[] | null {
  const categories: Record<string, { title: string; commands: string[] }> = {
    navigation: {
      title: 'NAVIGATION',
      commands: [
        'move <sector>    (m)   Move to an adjacent sector',
        'look             (l)   View current sector contents',
        'scan             (s)   Scan adjacent sectors',
        'map                    View your explored map',
        'status           (st)  View your pilot status',
      ],
    },
    trading: {
      title: 'TRADING',
      commands: [
        'dock             (d)   Dock at outpost and view prices',
        'buy <item> <qty>       Buy commodity from outpost',
        'sell <item> <qty>      Sell commodity to outpost',
      ],
    },
    combat: {
      title: 'COMBAT',
      commands: [
        'fire <name> <nrg> (f)  Attack a player in your sector',
        'flee                    Attempt to escape combat',
        'combatlog               View combat history',
      ],
    },
    planets: {
      title: 'PLANETS',
      commands: [
        'land <planet>          View planet details',
        'claim <planet>         Claim an unclaimed planet',
        'colonize <planet> <qty> Deposit colonists on planet',
        'collect <planet> <qty>  Collect colonists from seed planet',
        'upgrade <planet>       Upgrade your planet',
      ],
    },
    ships: {
      title: 'SHIPS & GARAGE',
      commands: [
        'dealer           (ships) View ship dealer',
        'buyship <type>          Purchase a new ship',
        'cloak                   Toggle cloaking device',
        'eject <item> <qty>      Jettison cargo',
        'garage                  View stored ships',
        'storeship               Store current ship in garage',
        'retrieve <id>           Retrieve ship from garage',
        'salvage [id]            Salvage yard / sell a ship',
      ],
    },
    upgrades: {
      title: 'SHIP UPGRADES',
      commands: [
        'upgrades                View available upgrades',
        'shipupgrades            View installed upgrades',
        'install <name>          Install an upgrade (fuzzy match)',
        'uninstall <id>          Remove an upgrade',
      ],
    },
    store: {
      title: 'STORE & ITEMS',
      commands: [
        'mall                    Star Mall overview',
        'store                   Browse the general store',
        'purchase <id>           Buy a store item',
        'inventory               View your items',
        'use <id> [args]         Use a consumable item',
        'refuel [qty]    (fuel)  Buy energy (10 cr/unit)',
      ],
    },
    deploy: {
      title: 'DEPLOYABLES',
      commands: [
        'deploy <item> [args]    Deploy mine, drone, or buoy',
      ],
    },
    missions: {
      title: 'MISSIONS',
      commands: [
        'missions [completed]    View active or completed missions',
        'missionboard            Browse available missions',
        'accept <id>             Accept a mission',
        'abandon <id>            Abandon a mission',
      ],
    },
    social: {
      title: 'SOCIAL',
      commands: [
        'chat <msg>      (say)  Send sector chat message',
        'bounties                View active bounties',
        'leaderboard [cat] (lb) View rankings',
      ],
    },
    mail: {
      title: 'MAIL',
      commands: [
        'mail                    View inbox',
        'mail read <id>          Read a message',
        'mail send <to> <subj> <body>  Send a message',
        'mail delete <id>        Delete a message',
        'mail sent               View sent messages',
      ],
    },
    notes: {
      title: 'NOTES',
      commands: [
        'note <text>      (n)   Save a note',
        'notes                   List all notes',
        'notes search <term>     Search notes',
        'note del <id>           Delete a note',
      ],
    },
    warp: {
      title: 'WARP GATES',
      commands: [
        'warp [gate_id]          Use a warp gate',
        'warp build <sector>     Build a warp gate',
        'warp toll <gate> <amt>  Set gate toll',
        'warp list               View syndicate gates',
      ],
    },
    events: {
      title: 'EVENTS',
      commands: [
        'investigate [id]        Investigate a sector anomaly',
      ],
    },
  };

  const cat = categories[category];
  if (!cat) return null;

  const lines: { text: string; type: 'info' | 'system' }[] = [];
  lines.push({ text: `=== ${cat.title} ===`, type: 'system' });
  for (const cmd of cat.commands) {
    lines.push({ text: `  ${cmd}`, type: 'info' });
  }
  return lines;
}

function getHelpForCommand(cmd: string): string[] {
  const help: Record<string, string[]> = {
    move: ['move <sector_id>', '  Move your ship to an adjacent sector. Costs 1 energy.', '  Aliases: m'],
    look: ['look', '  Display contents of your current sector including players, outposts, planets, and anomalies.', '  Aliases: l'],
    scan: ['scan', '  Scan adjacent sectors for planets and players.', '  Requires a ship with a planetary scanner.', '  Aliases: s'],
    status: ['status', '  View your pilot status: energy, credits, ship stats, and cargo.', '  Aliases: st'],
    map: ['map', '  View your explored star chart including discovered Star Malls, outposts, and planets.'],
    dock: ['dock', '  Dock at the outpost in your current sector and view commodity prices.', '  Aliases: d'],
    buy: ['buy <commodity> <quantity>', '  Buy a commodity from the outpost in your sector.', '  Commodities: cyrillium, food, tech', '  Costs 1 energy.'],
    sell: ['sell <commodity> <quantity>', '  Sell a commodity to the outpost in your sector.', '  Costs 1 energy.'],
    fire: ['fire <player_name> <energy>', '  Fire weapons at a player in your sector.', '  Damage scales with energy spent.', '  Aliases: f, attack'],
    flee: ['flee', '  Attempt to escape when under attack.', '  Success chance depends on number of attackers.'],
    land: ['land <planet_name>', '  View details of a planet in your sector: class, colonists, stocks, and production.'],
    claim: ['claim <planet_name>', '  Claim an unclaimed planet in your sector as your own.'],
    colonize: ['colonize <planet_name> <quantity>', '  Deposit colonists from your ship onto a planet you own.'],
    collect: ['collect <planet_name> <quantity>', '  Collect colonists from a seed planet onto your ship.'],
    upgrade: ['upgrade <planet_name>', '  Upgrade a planet you own to the next level (requires resources).'],
    dealer: ['dealer', '  View ships available for purchase at a Star Mall.', '  Aliases: ships'],
    buyship: ['buyship <ship_type>', '  Purchase a new ship at a Star Mall.'],
    cloak: ['cloak', '  Toggle your cloaking device on or off.'],
    eject: ['eject <commodity> <quantity>', '  Jettison cargo from your ship into space.', '  Aliases: jettison'],
    chat: ['chat <message>', '  Send a message to all players in your sector.', '  Aliases: say'],
    bounties: ['bounties', '  View all active bounties on players.'],
    leaderboard: ['leaderboard [category]', '  View rankings.', '  Categories: credits, planets, combat, explored, trade, syndicate', '  Aliases: lb, top'],
    mall: ['mall', '  View Star Mall services overview (requires Star Mall sector).'],
    store: ['store', '  Browse items in the general store (requires Star Mall).'],
    purchase: ['purchase <item_id>', '  Buy an item from the general store.'],
    inventory: ['inventory', '  View items in your inventory.'],
    use: ['use <item_id> [args]', '  Use a consumable item from your inventory.'],
    refuel: ['refuel [quantity]', '  Buy energy at a Star Mall (10 credits per unit, max 200).', '  Aliases: fuel'],
    deploy: ['deploy <item_id> [toll_amount] [buoy_message]', '  Deploy a mine, drone, or buoy in your sector.'],
    missions: ['missions [completed]', '  View your active missions, or use "missions completed" to see finished ones.'],
    missionboard: ['missionboard', '  Browse available missions at a Star Mall.'],
    accept: ['accept <mission_id>', '  Accept a mission from the mission board.'],
    abandon: ['abandon <mission_id>', '  Abandon an active mission.'],
    investigate: ['investigate [event_id]', '  Investigate a sector anomaly. Costs 1 energy.'],
    mail: ['mail [read|send|delete|sent]', '  View inbox, or use subcommands:', '  mail read <id> — Read a message', '  mail send <to> <subject> <body> — Send a message', '  mail delete <id> — Delete a message', '  mail sent — View sent messages'],
    note: ['note <text>', '  Save a quick note. Use "note del <id>" to delete.', '  Aliases: n'],
    notes: ['notes [search <term>]', '  List all notes, or search with "notes search <term>".'],
    upgrades: ['upgrades', '  View available ship upgrades at a Star Mall.'],
    shipupgrades: ['shipupgrades', '  View upgrades installed on your current ship.'],
    install: ['install <name>', '  Install a ship upgrade. Accepts partial names (e.g. "install cargo").'],
    uninstall: ['uninstall <install_id>', '  Remove an upgrade from your ship (at a Star Mall).'],
    warp: ['warp [gate_id|build|toll|list]', '  Use a warp gate, or manage gates:', '  warp build <sector> — Build a warp gate', '  warp toll <gate> <amount> — Set gate toll', '  warp list — View syndicate gates'],
    garage: ['garage', '  View ships stored in your garage (Star Mall).'],
    storeship: ['storeship', '  Store your current ship in the garage (Star Mall).'],
    retrieve: ['retrieve <ship_id>', '  Retrieve a ship from your garage.'],
    salvage: ['salvage [ship_id]', '  View salvage options or sell a ship for credits.'],
    combatlog: ['combatlog', '  View your recent combat history.'],
    tips: ['tips', '  Show contextual tips and guidance based on your current situation.'],
  };
  return help[cmd] || [`No detailed help for "${cmd}". Try "help" to see categories.`];
}
