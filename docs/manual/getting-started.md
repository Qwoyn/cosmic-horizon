# Getting Started

[← Back to Manual](../players-manual.md)

---

## Creating Your Account

Head to the registration page and fill in:

- **Username** (3–32 characters) — this is your pilot name, visible to all players
- **Email** — used for login recovery
- **Password** (8+ characters)
- **Race** — choose carefully, this is permanent

### Choosing Your Race

Your race gives you a permanent gameplay bonus and determines your starting ship:

| Race | Permanent Bonus | Starting Perk (72 hours) | Starter Ship |
|------|----------------|--------------------------|--------------|
| **Muscarian** | +5% Attack Ratio | +2,000 bonus credits | Corvette |
| **Vedic** | +10% Scan Range | +100 max energy | Cruiser |
| **Kalin** | +5% Defense Ratio | +10 weapon, +10 engine energy | Battleship |
| **Tar'ri** | +5% Trade Bonus | +5,000 bonus credits | Freighter |

**Which race should you pick?**

- Want to fight? **Muscarian** — the attack bonus stacks with everything and the Corvette is a solid early combat ship
- Want to explore and do missions? **Vedic** — the extra scan range and energy capacity let you cover more ground
- Want to be hard to kill? **Kalin** — defense bonus + Battleship hull makes you a tough target from day one
- Want to trade and build? **Tar'ri** — the trade bonus earns you more per transaction, and the Freighter hauls massive loads

### What You Start With

Every new pilot spawns at a random Star Mall sector with:

- Your race's starter ship
- **10,000 credits** (+ race bonus if applicable)
- **500 energy** (action points)
- **72 hours of double energy regeneration** (2 AP/minute instead of 1)

---

## The Interface

### Status Bar (Top)

The status bar runs across the top of the screen and shows your key stats at a glance:

```
PILOT: YourName | SECTOR: 42 | ENERGY: 485/500 | CREDITS: 10,000 | SHIP: scout | WEAPONS: 25 | ENGINES: 50 | HULL: 50/50 | CARGO: 0/10
```

Values flash briefly when they change — green for increases, red for decreases.

### Sector Map (Center Left)

The interactive sector map shows your explored universe. Your current sector pulses with a magenta ring, and adjacent sectors (where you can move) glow blue when you hover them.

- **Click an adjacent sector** to warp there
- **Scroll or use +/- buttons** to zoom in and out
- **Click and drag** to pan when zoomed in
- **Hover a sector node** to see its type and ID
- **Click the ? button** to toggle the legend

Sector icons tell you what's there:
- ★ Star Mall
- ◆ Outpost
- ● Planet

### Notification Log (Center Right)

All game events, command responses, and errors appear here with color-coded prefixes:

- `[i]` Info (cyan) — general information
- `[✓]` Success (green) — successful actions
- `[!]` Error (red) — something went wrong
- `[⚠]` Warning (yellow) — caution
- `[★]` System (blue) — system messages
- `[⚔]` Combat (orange) — combat events
- `[$]` Trade (purple) — trading activity

Click **CLEAR** to wipe the log.

### Activity Bar (Far Left)

The vertical icon bar on the left lets you switch between panels. Each icon opens a different game system:

- **Nav** — Sector details, LOOK/SCAN/WARP buttons
- **Explore** — Galaxy exploration tools
- **Trade** — Outpost trading interface
- **Combat** — Combat actions and nearby players
- **Crew** — Crew management
- **Missions** — Active missions and progress
- **Planets** — Owned and discovered planets
- **Gear** — Ship equipment, CLOAK/REFUEL/EJECT buttons
- **Comms** — Full chat interface
- **Syndicate** — Syndicate management
- **Wallet** — Financial overview
- **Actions** — Miscellaneous commands (STATUS, ACHIEVEMENTS, HELP, etc.)

### Context Panel (Right Sidebar)

The always-visible right sidebar shows:

1. **Player Profile** — Your name, race, and credits
2. **Energy Bar** — Current/max energy with visual bar
3. **Ship Card** — Ship type, hull HP bar, cargo bar with breakdown, weapon/engine energy
4. **Mini Chat** — Last few messages with channel tabs (Sector/Syndicate/Alliance)
5. **Command Input** — Type commands here with `>` prompt. Use up/down arrows for command history

---

## Your First Steps

### 1. Look Around

Type `look` (or just `l`) to see what's in your current sector. You'll see:
- Sector type (protected, standard, etc.)
- Other players present
- Outposts, planets, and events
- Adjacent sectors you can move to

```
> look
=== Sector 127 [protected] ===
★ Star Mall present
Players: SpaceCowboy (vedic), Nova7 (muscarian)
Outposts: Frontier Trading Post
Adjacent sectors: 42, 88, 201, 315
```

### 2. Check Your Status

Type `status` (or `st`) to see your full pilot stats:

```
> status
=== YourName [Muscarian] Lv.1 | Recruit ===
Sector: 127 | Energy: 500/500 | Credits: 12,000
Ship: corvette | Hull: 100/100
Weapons: 50 | Engines: 75 | Cargo: 0/15
```

### 3. Explore Nearby Sectors

Move to an adjacent sector:

```
> move 42
Moved to sector 42. Energy: 499/500. (+10 XP - new sector!)
```

Or just click the sector node on the map. Every new sector you visit earns **10 XP**.

### 4. Find an Outpost and Trade

When you find a sector with an outpost, dock to see prices:

```
> dock
=== Frontier Trading Post ===
Commodity    | Mode | Stock | Price
Cyrillium    | sell | 450   | 8 cr
Food         | buy  | 120   | 32 cr
```

"Sell" mode means the outpost is selling to you. "Buy" mode means they're buying from you. Buy low, sell high!

```
> buy cyrillium 10
Bought 10 cyrillium for 80 credits. Cargo: 10/15. (+20 XP)
```

### 5. Check Your Missions

After the tutorial, you'll have 3 starter missions:

```
> missions
=== Active Missions ===
1. Pathfinder - Visit 5 sectors (0/5) - Reward: 1,000 cr
2. First Trades - Trade 10 units (0/10) - Reward: 1,000 cr
3. Scanner Training - Scan 2 sectors (0/2) - Reward: 500 cr
```

These are great for early credits and XP. Just play normally and they'll complete themselves.

---

## The Tutorial

When you first log in, you'll be offered an optional tutorial. It walks you through:

1. Looking at your sector
2. Moving between sectors
3. Checking your status
4. Docking at an outpost
5. Buying commodities
6. Selling at another outpost
7. Landing on a planet
8. Using the mission board

Completing the tutorial awards **5,000 credits**. You can skip it if you prefer to figure things out on your own — you'll still receive the 3 starter missions either way.

After the tutorial (or skipping it), you'll see a brief lore sequence followed by a welcome message with getting-started tips.

---

## Essential Commands

These are the commands you'll use most often:

| Command | Alias | What It Does |
|---------|-------|-------------|
| `look` | `l` | See what's in your current sector |
| `move <sector>` | `m` | Travel to an adjacent sector |
| `status` | `st` | View your pilot stats |
| `dock` | `d` | Dock at an outpost to trade |
| `buy <commodity> <qty>` | | Buy cargo from outpost |
| `sell <commodity> <qty>` | | Sell cargo to outpost |
| `help` | `?` | View command categories |
| `help <category>` | | View commands in a category |
| `tips` | | Get contextual advice |
| `profile` | `p` | View your level and progression |
| `missions` | | View active missions |
| `map` | | View explored sector map |

---

## Logging In Later

You can log in with either your **username** or **email** address. Your progress is saved automatically — energy regenerates while you're offline, planets continue producing, and the galaxy keeps turning.

---

## What Next?

- **Want to make money?** → Read the [Trading Guide](trading.md)
- **Want a better ship?** → Read the [Ships Guide](ships.md)
- **Want to build an empire?** → Read the [Planets Guide](planets.md)
- **Want to fight?** → Read the [Combat Guide](combat.md)
- **Want to level up?** → Read the [Progression Guide](progression.md)

[← Back to Manual](../players-manual.md)
