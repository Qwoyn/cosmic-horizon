import * as api from './api';

interface CommandContext {
  addLine: (text: string, type: 'info' | 'success' | 'error' | 'warning' | 'system' | 'combat' | 'trade') => void;
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
      ctx.emit('chat:sector', { message: args.join(' ') });
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

    case 'help': {
      if (args.length > 0) {
        const cmd = args[0].toLowerCase();
        const helpLines = getHelpForCommand(cmd);
        helpLines.forEach(line => ctx.addLine(line, 'info'));
      } else {
        ctx.addLine('=== COMMANDS ===', 'system');
        ctx.addLine('  move <sector>       (m)   Move to adjacent sector', 'info');
        ctx.addLine('  look                (l)   View current sector', 'info');
        ctx.addLine('  scan                (s)   Scan adjacent sectors', 'info');
        ctx.addLine('  status              (st)  View your status', 'info');
        ctx.addLine('  map                        View explored map', 'info');
        ctx.addLine('  dock                (d)   Dock at outpost', 'info');
        ctx.addLine('  buy <item> <qty>           Buy from outpost', 'info');
        ctx.addLine('  sell <item> <qty>          Sell to outpost', 'info');
        ctx.addLine('  fire <player> <nrg> (f)   Attack player', 'info');
        ctx.addLine('  flee                       Escape combat', 'info');
        ctx.addLine('  land <planet>              View planet details', 'info');
        ctx.addLine('  claim <planet>             Claim unclaimed planet', 'info');
        ctx.addLine('  colonize <planet> <qty>    Deposit colonists', 'info');
        ctx.addLine('  collect <planet> <qty>     Collect from seed planet', 'info');
        ctx.addLine('  upgrade <planet>           Upgrade your planet', 'info');
        ctx.addLine('  dealer              (ships) View ship dealer', 'info');
        ctx.addLine('  buyship <type>             Purchase a ship', 'info');
        ctx.addLine('  cloak                      Toggle cloaking', 'info');
        ctx.addLine('  eject <item> <qty>         Jettison cargo', 'info');
        ctx.addLine('  chat <msg>          (say)  Sector chat', 'info');
        ctx.addLine('  bounties                   View active bounties', 'info');
        ctx.addLine('--- Star Mall ---', 'system');
        ctx.addLine('  mall                       Star mall overview', 'info');
        ctx.addLine('  store                      Browse general store', 'info');
        ctx.addLine('  purchase <id>              Buy store item', 'info');
        ctx.addLine('  inventory                  View your items', 'info');
        ctx.addLine('  use <id> [args]            Use consumable item', 'info');
        ctx.addLine('  garage                     View stored ships', 'info');
        ctx.addLine('  storeship                  Store current ship', 'info');
        ctx.addLine('  retrieve <id>              Retrieve stored ship', 'info');
        ctx.addLine('  salvage [id]               Salvage yard / sell ship', 'info');
        ctx.addLine('  cantina                    Visit the cantina', 'info');
        ctx.addLine('  intel                      Buy sector intelligence', 'info');
        ctx.addLine('  refuel [qty]               Buy energy', 'info');
        ctx.addLine('  deploy <item> [args]       Deploy mine/drone/buoy', 'info');
        ctx.addLine('  combatlog                  View combat history', 'info');
        ctx.addLine('  help <cmd>          (?)   Detailed command help', 'info');
      }
      break;
    }

    default:
      ctx.addLine(`Unknown command: ${command}. Type "help" for commands.`, 'error');
  }
}

function getHelpForCommand(cmd: string): string[] {
  const help: Record<string, string[]> = {
    move: ['move <sector_id>', '  Move your ship to an adjacent sector. Costs 1 AP.', '  Aliases: m'],
    look: ['look', '  Display contents of your current sector.', '  Aliases: l'],
    scan: ['scan', '  Scan adjacent sectors for planets and players.', '  Requires a ship with a planetary scanner.', '  Aliases: s'],
    buy: ['buy <commodity> <quantity>', '  Buy a commodity from the outpost in your sector.', '  Commodities: cyrillium, food, tech', '  Costs 1 AP.'],
    sell: ['sell <commodity> <quantity>', '  Sell a commodity to the outpost in your sector.', '  Costs 1 AP.'],
    fire: ['fire <player_name> <energy>', '  Fire weapons at a player in your sector.', '  Costs 2 AP.', '  Aliases: f, attack'],
    flee: ['flee', '  Attempt to escape when under attack.', '  Success chance depends on number of attackers.'],
  };
  return help[cmd] || [`No detailed help for: ${cmd}`];
}
