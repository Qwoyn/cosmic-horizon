# Cosmic Horizon - Player's Manual

## Welcome, Pilot

Cosmic Horizon is a text-based multiplayer space trading game set in a universe of 5,000 interconnected sectors. Trade commodities, claim planets, build an empire, and fight for dominance.

## Getting Started

### Registration
Create an account at the login screen. You'll spawn at a random Star Mall sector with:
- A Scout-class ship
- 10,000 credits
- 500 energy (action points)
- 72 hours of bonus energy regeneration (2x rate)

### The Interface
- **Terminal** (left): Your main command input. Type commands here.
- **Status Bar** (top): Your pilot stats, energy, credits, ship info.
- **Map Panel** (right): Adjacent sectors you can move to.
- **Trade Table** (right): Outpost trading when docked.
- **Combat View** (right): Appears when other players are in your sector.

---

## Core Concepts

### Energy (Action Points)
Every action costs energy. Energy regenerates at 1 point per minute (2/min for new players).

| Action | Cost |
|--------|------|
| Move to adjacent sector | 1 |
| Buy or sell commodities | 1 |
| Fire weapons | 2 |
| Deploy mine/drone/buoy | 1 |

### Sectors
The universe has 5,000 sectors connected by warps. Sector types:
- **Standard** - Normal space. Trading, combat, everything allowed.
- **Protected** - Safe zones. No combat allowed.
- **Harmony Enforced** - No combat allowed.
- **One-Way** - Some warps only go in one direction.

### Star Malls
8 special sectors with full services: ship dealer, general store, garage, salvage yard, cantina, refueling, and bounty board.

---

## Commands Reference

### Navigation

```
move 42          Move to sector 42 (alias: m 42)
look             View current sector contents (alias: l)
scan             Scan adjacent sectors for players/planets (alias: s)
map              View all sectors you've explored
```

### Status

```
status           View your pilot stats, ship, and cargo (alias: st)
```

### Trading

To trade, you must be in a sector with an outpost.

```
dock             Dock at the outpost to see prices (alias: d)
buy cyrillium 10 Buy 10 cyrillium from the outpost
buy food 5       Buy 5 food
sell tech 20     Sell 20 tech to the outpost
```

**Commodities:**
- **Cyrillium** - Base price ~10 cr. Mined on desert/volcanic worlds.
- **Food** - Base price ~25 cr. Produced on ocean/hospitable worlds.
- **Tech** - Base price ~50 cr. Manufactured on alpine/frozen worlds.

Prices vary by outpost supply. Buy low (high stock), sell high (low stock). Outposts have modes:
- **sell** - Outpost sells this commodity to you.
- **buy** - Outpost buys this commodity from you.

### Planets

```
land Test World  View details of a planet in your sector
claim Test World Claim an unclaimed planet
colonize Test World 50   Deposit 50 colonists on your planet
collect Seed World I 100 Collect 100 colonists from a seed planet
upgrade Test World       Upgrade your planet (requires resources)
```

**Planet Classes:**
| Class | Name | Specialty |
|-------|------|-----------|
| H | Goldilocks | Balanced, high food |
| D | Desert | High cyrillium |
| O | Ocean | Highest food |
| A | Alpine | Balanced all three |
| F | Frozen | High tech |
| V | Volcanic | Highest cyrillium |
| G | Gaseous | High cyrillium + tech |
| S | Seed Planet | Produces colonists (not claimable) |

**Building a Colony:**
1. Find a seed planet (sector type: has_seed_planet). Collect colonists.
2. Find an unclaimed planet. Claim it.
3. Deposit colonists on your planet.
4. Colonists automatically produce commodities each game tick (60s).
5. Upgrade your planet to increase capacity and production.

### Ships

```
dealer           View ships for sale at a star mall (alias: ships)
buyship corvette Purchase a corvette
cloak            Toggle cloaking device (Shadow Runner only)
eject food 10    Jettison 10 food from cargo (alias: jettison)
```

**Ship Types:**
| Ship | Price | Weapons | Cargo | Engines | Special |
|------|-------|---------|-------|---------|---------|
| Scout | 5,000 | 25 | 10 | 50 | Starter ship |
| Freighter | 15,000 | 10 | 50 | 40 | Can tow, high cargo |
| Corvette | 30,000 | 40 | 20 | 60 | Mines, tow |
| Cruiser | 75,000 | 60 | 30 | 80 | PGD, jump drive, scanner |
| Battleship | 150,000 | 100 | 20 | 70 | PGD, mines, 3 drones |
| Shadow Runner | 50,000 | 35 | 15 | 90 | Cloaking, mines |
| Colony Ship | 20,000 | 5 | 75 | 30 | Massive cargo |

### Combat

```
fire spacecowboy 10   Fire 10 weapon energy at player "spacecowboy"
flee                   Attempt to escape (random adjacent sector)
```

- Combat is only allowed in standard sectors.
- Damage depletes the target's weapon energy first, then engine energy.
- When both hit zero, the ship is destroyed and the player ejects in a dodge pod.
- Flee chance starts at 85% with 1 attacker, decreases with more.

### Star Mall Services

```
mall             Overview of all star mall services
store            Browse the general store catalog
purchase probe   Buy a probe from the store
inventory        View your consumable items (alias: inv)
use probe 150    Use a probe to scan sector 150
garage           View ships stored in the garage
storeship        Store your current ship in the garage
retrieve abc123  Retrieve a ship from garage by ID
salvage          View ships available for salvage (50% value)
salvage abc123   Sell a specific ship for salvage
cantina          Visit the cantina for rumors
intel            Buy sector intelligence (500 cr)
refuel 100       Buy 100 energy points (10 cr each)
```

**Store Items:**
| Item | Price | Type | Description |
|------|-------|------|-------------|
| Halberd Mine | 1,500 | Deployable | Explodes on contact |
| Barnacle Mine | 2,000 | Deployable | Attaches, drains engines |
| Offensive Drone | 800 | Deployable | Attacks hostiles |
| Defensive Drone | 600 | Deployable | Protects allies |
| Toll Drone | 1,000 | Deployable | Charges passing ships |
| Navigation Buoy | 200 | Deployable | Leaves messages, logs visitors |
| Planet Gravity Drive | 50,000 | Equipment | Tow planets |
| Jump Drive | 25,000 | Equipment | Instant travel |
| Sector Probe | 300 | Consumable | Scan any sector |
| Disruptor Torpedo | 3,000 | Consumable | Disables engines |
| Rache Device | 10,000 | Consumable | Self-destruct bomb |
| Cloaking Cell | 2,000 | Consumable | Single-use cloak |
| Fuel Cell | 500 | Consumable | +50 energy |

### Deployables

```
deploy mine_halberd          Deploy a halberd mine in current sector
deploy drone_toll 250        Deploy a toll drone charging 250 cr
deploy buoy Hello pilots!    Deploy a buoy with a message
```

Deployables expire after 7 days unless maintained.

### Social

```
chat Hello sector!   Send message to all players in your sector (alias: say)
bounties             View active bounties
combatlog            View your recent combat history (alias: clog)
```

### Help

```
help             Show all commands
help fire        Detailed help for a specific command
```

---

## Strategy Tips

1. **Early game**: Collect colonists from seed planets, claim a planet, start producing.
2. **Trading route**: Find outposts that sell cheap cyrillium and ones that buy food at high prices. The price depends on stock levels.
3. **Upgrade your ship**: A scout is fragile. Save for a corvette or freighter.
4. **Planet upgrades**: Each level increases production. Level 7 planets are powerhouses.
5. **Avoid dodge pods**: If your ship is destroyed, you're stuck in a dodge pod with no weapons or cargo. Get to a star mall fast.
6. **Use probes**: Before entering unknown sectors, probe them to check for mines or hostile players.
7. **Star mall intel**: The cantina sells intelligence about rich outposts and dangerous sectors for 500 cr.
8. **Mines**: Deploy halberd mines in chokepoint sectors to damage enemies.
9. **Toll drones**: Place toll drones in busy sectors for passive income.
10. **Protected sectors**: Retreat to protected sectors if you're being hunted.
