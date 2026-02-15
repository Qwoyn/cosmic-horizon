export interface ParsedCommand {
  command: string;
  args: string[];
  raw: string;
}

export interface CommandDefinition {
  name: string;
  aliases: string[];
  usage: string;
  description: string;
  minArgs: number;
}

export const COMMANDS: CommandDefinition[] = [
  { name: 'move', aliases: ['m'], usage: 'move <sector_id>', description: 'Move to an adjacent sector', minArgs: 1 },
  { name: 'look', aliases: ['l'], usage: 'look', description: 'View current sector contents', minArgs: 0 },
  { name: 'scan', aliases: ['s'], usage: 'scan', description: 'Scan adjacent sectors (requires scanner)', minArgs: 0 },
  { name: 'status', aliases: ['st'], usage: 'status', description: 'View your pilot status', minArgs: 0 },
  { name: 'map', aliases: [], usage: 'map', description: 'View explored sector map', minArgs: 0 },
  { name: 'dock', aliases: ['d'], usage: 'dock', description: 'Dock at outpost in current sector', minArgs: 0 },
  { name: 'buy', aliases: [], usage: 'buy <commodity> <quantity>', description: 'Buy commodity from outpost', minArgs: 2 },
  { name: 'sell', aliases: [], usage: 'sell <commodity> <quantity>', description: 'Sell commodity to outpost', minArgs: 2 },
  { name: 'fire', aliases: ['f', 'attack'], usage: 'fire <player> <energy>', description: 'Fire weapons at a player', minArgs: 2 },
  { name: 'flee', aliases: [], usage: 'flee', description: 'Attempt to escape combat', minArgs: 0 },
  { name: 'land', aliases: [], usage: 'land <planet_name>', description: 'Land on a planet in current sector', minArgs: 1 },
  { name: 'claim', aliases: [], usage: 'claim <planet_name>', description: 'Claim an unclaimed planet', minArgs: 1 },
  { name: 'colonize', aliases: [], usage: 'colonize <planet_name> <quantity>', description: 'Deposit colonists on your planet', minArgs: 2 },
  { name: 'collect', aliases: [], usage: 'collect <planet_name> <quantity>', description: 'Collect colonists from seed planet', minArgs: 2 },
  { name: 'upgrade', aliases: [], usage: 'upgrade <planet_name>', description: 'Upgrade your planet', minArgs: 1 },
  { name: 'dealer', aliases: ['ships'], usage: 'dealer', description: 'View ships for sale at star mall', minArgs: 0 },
  { name: 'buyship', aliases: [], usage: 'buyship <ship_type>', description: 'Purchase a ship', minArgs: 1 },
  { name: 'cloak', aliases: [], usage: 'cloak', description: 'Toggle cloaking device', minArgs: 0 },
  { name: 'eject', aliases: ['jettison'], usage: 'eject <commodity> <quantity>', description: 'Jettison cargo', minArgs: 2 },
  { name: 'chat', aliases: ['say'], usage: 'chat <message>', description: 'Send message to players in sector', minArgs: 1 },
  { name: 'bounty', aliases: [], usage: 'bounty <player> <amount>', description: 'Place a bounty on a player', minArgs: 2 },
  { name: 'bounties', aliases: [], usage: 'bounties', description: 'View active bounties', minArgs: 0 },
  { name: 'mall', aliases: [], usage: 'mall', description: 'View star mall services', minArgs: 0 },
  { name: 'store', aliases: [], usage: 'store', description: 'Browse general store', minArgs: 0 },
  { name: 'purchase', aliases: [], usage: 'purchase <item_id>', description: 'Buy item from general store', minArgs: 1 },
  { name: 'inventory', aliases: ['inv'], usage: 'inventory', description: 'View your consumable items', minArgs: 0 },
  { name: 'use', aliases: [], usage: 'use <item_id> [args]', description: 'Use a consumable item', minArgs: 1 },
  { name: 'garage', aliases: [], usage: 'garage', description: 'View ships in garage storage', minArgs: 0 },
  { name: 'storeship', aliases: [], usage: 'storeship', description: 'Store current ship in garage', minArgs: 0 },
  { name: 'retrieve', aliases: [], usage: 'retrieve <ship_id>', description: 'Retrieve ship from garage', minArgs: 1 },
  { name: 'salvage', aliases: [], usage: 'salvage [ship_id]', description: 'Salvage yard / sell ship for parts', minArgs: 0 },
  { name: 'cantina', aliases: [], usage: 'cantina', description: 'Visit cantina for rumors', minArgs: 0 },
  { name: 'intel', aliases: [], usage: 'intel', description: 'Buy sector intelligence', minArgs: 0 },
  { name: 'refuel', aliases: [], usage: 'refuel [quantity]', description: 'Buy energy at outpost or star mall', minArgs: 0 },
  { name: 'deploy', aliases: [], usage: 'deploy <item_id> [args]', description: 'Deploy mine, drone, or buoy', minArgs: 1 },
  { name: 'combatlog', aliases: ['clog'], usage: 'combatlog', description: 'View recent combat history', minArgs: 0 },
  { name: 'help', aliases: ['?', 'commands'], usage: 'help [command]', description: 'Show available commands', minArgs: 0 },
];

export function parseCommand(input: string): ParsedCommand | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const parts = trimmed.split(/\s+/);
  const rawCommand = parts[0].toLowerCase();
  const args = parts.slice(1);

  // Resolve aliases
  const def = COMMANDS.find(c => c.name === rawCommand || c.aliases.includes(rawCommand));
  const command = def?.name ?? rawCommand;

  return { command, args, raw: trimmed };
}

export function getCommandHelp(commandName?: string): string[] {
  if (commandName) {
    const def = COMMANDS.find(c => c.name === commandName || c.aliases.includes(commandName));
    if (!def) return [`Unknown command: ${commandName}`];
    const lines = [
      `${def.usage}`,
      `  ${def.description}`,
    ];
    if (def.aliases.length > 0) {
      lines.push(`  Aliases: ${def.aliases.join(', ')}`);
    }
    return lines;
  }

  return [
    '=== COMMANDS ===',
    ...COMMANDS.map(c => {
      const aliases = c.aliases.length > 0 ? ` (${c.aliases.join(', ')})` : '';
      return `  ${c.usage.padEnd(32)}${c.description}${aliases}`;
    }),
  ];
}
