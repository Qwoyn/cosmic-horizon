# Navigation & Exploration

[← Back to Manual](../players-manual.md)

---

## The Universe

The Cosmic Horizon spans **5,000 sectors** connected by warp tunnels. Sectors are organized into clusters (regions) of roughly 35 sectors each, with each sector connected to up to 12 neighbors.

### Sector Types

| Type | Color | Rules |
|------|-------|-------|
| **Standard** | Dark blue | All actions allowed — trading, combat, deploying |
| **Protected** | Green | No combat. Safe havens for docking and trading |
| **Harmony Enforced** | Teal | No combat. Diplomatic zones |
| **One-Way** | Yellow | Some warp tunnels only go in one direction — you can enter but may not be able to go back the way you came |

### What's in a Sector?

Sectors can contain any combination of:

- **Star Malls** (8 total) — Full-service trading stations. ★ icon on map
- **Outposts** (200 total) — Buy/sell commodities. ◆ icon on map
- **Planets** (300+ total) — Claimable worlds for colonization. ● icon on map
- **Other players** — Visible in `look` output
- **Events/Anomalies** — Temporary resource opportunities
- **Deployables** — Mines, drones, and buoys left by players
- **NPCs** — Non-player characters with quests and services
- **Warp Gates** — Syndicate-built instant travel portals

---

## Movement

### Basic Movement

Move to any adjacent sector by typing `move <sector_id>` or just `m <sector_id>`:

```
> move 42
Moved to sector 42. Energy: 499/500.
```

You can also **click adjacent sectors directly on the sector map** to warp there — no typing needed.

**Cost:** 1 energy per move (some ships cost more — see [Ships](ships.md))

### Fuel Costs by Ship

Not all ships are equally efficient:

| Ship | Fuel per Sector |
|------|----------------|
| DodgePod | 1 |
| Scout | 1 |
| Freighter | 2 |
| Corvette | 2 |
| Shadow Runner | 2 |
| Colony Ship | 3 |
| Cruiser | 3 |
| Battleship | 4 |

**Tip:** If you're exploring, use a Scout or DodgePod. Save the big ships for when you have a destination in mind.

### Towing

Ships with tow capability can haul other objects, but at increased fuel cost:

| Ship | Tow Fuel Multiplier |
|------|-------------------|
| Freighter | 2.0x |
| Corvette | 1.8x |
| Cruiser | 1.5x |
| Battleship | 1.5x |

### Jump Drive

The **Jump Drive** (25,000 credits from Star Mall store) lets Cruisers and Battleships instantly travel to any previously explored sector. It costs energy proportional to the distance, but it's far faster than hopping sector by sector.

```
> use jumpdrive 1842
Jumped to sector 1842. Energy: 480/500.
```

### Warp Gates

Syndicates can build permanent warp gates connecting distant sectors. Using a gate costs 2 energy and may charge a toll for non-members. See [Syndicates](syndicates.md) for details.

```
> warp
=== Warp Gates in Sector 127 ===
[1] Gate to Sector 2501 (Toll: 500 cr)
> warp 1
Warped to sector 2501. Energy: 498/500. Toll: 500 credits.
```

---

## Scanning

### Look (Free Info)

`look` (alias: `l`) shows you everything in your current sector — players, outposts, planets, events, and adjacent sectors. This is your most-used command.

```
> look
=== Sector 88 [standard] ===
Players: None
Outposts: Deep Space Depot
Planets: [1] Verdant Prime (H) *unclaimed*  [2] Dust Bowl (D) [owned by: Nova7]
Events: Asteroid Field detected!
Adjacent: 42, 91, 103, 127
```

### Scan (Adjacent Sectors)

`scan` (alias: `s`) reveals what's in adjacent sectors without moving there. Requires a **Planetary Scanner** (available on Cruisers and Battleships, or purchasable as an upgrade for 8,000 credits).

```
> scan
=== Adjacent Sector Scan ===
Sector 42: 2 players, 1 outpost
Sector 91: empty
Sector 103: 1 planet, asteroid field
Sector 127: Star Mall, 3 players
```

**Cost:** 1 energy

### Probes (Remote Scanning)

**Sector Probes** (300 credits from Star Mall) let you scan any sector in the galaxy, not just adjacent ones:

```
> use probe 2501
=== Sector 2501 Scan ===
Type: standard
Players: Rogue_Alpha (muscarian), DeathStar99 (kalin)
Outposts: None
Planets: [1] Ice World (F) [owned by: Rogue_Alpha]
Deployables: 2 mines detected!
```

**Tip:** Always probe before jumping into unknown territory. Those mines could cost you your ship.

---

## The Sector Map

The interactive sector map in the center of the screen shows all sectors you've explored.

### Reading the Map

- **Magenta pulsing ring** — your current sector
- **Blue highlighted nodes** — adjacent sectors (click to warp)
- **★ icon** above a node — Star Mall
- **◆ icon** below-left — Outpost
- **● icon** below-right — Planet
- **Arrow on edge** — one-way route

### Map Controls

| Action | How |
|--------|-----|
| Warp to adjacent sector | Click the blue node |
| Zoom in/out | Click +/- buttons |
| Pan | Click and drag when zoomed |
| See sector details | Hover over any node |
| Toggle legend | Click the ? button |

### Nav Panel Buttons

The Nav activity panel provides buttons for common navigation actions:

- **LOOK** — Same as typing `look`
- **SCAN** — Same as typing `scan`
- **WARP** — Enter a sector number to warp directly (if adjacent)

---

## Energy Management

Energy (Action Points / AP) is your most important resource. Every action costs energy, and running out means you can't do anything until it regenerates.

### Regeneration

- **Base rate:** 1 AP per minute
- **New player bonus:** 2 AP per minute for the first 72 hours
- **Level bonus:** +1 max energy per level

Energy regenerates even while you're offline.

### Energy Costs

| Action | Cost |
|--------|------|
| Move to adjacent sector | 1 AP (varies by ship) |
| Buy or sell commodities | 1 AP |
| Fire weapons | 2 AP |
| Deploy mine/drone/buoy | 1 AP |
| Investigate sector event | 1 AP |
| Use warp gate | 2 AP |
| Scan adjacent sectors | 1 AP |
| Harvest resource node | 1 AP |
| Salvage derelict | 1 AP |

### Refueling

At any Star Mall, you can buy energy:

```
> refuel 100
Purchased 100 energy for 1,000 credits. Energy: 500/500.
```

**Cost:** 10 credits per AP

**Shortcut:** `fuel 100` works the same as `refuel 100`

You can also use **Fuel Cells** (500 credits from the store) for +50 energy anywhere:

```
> use fuelcell
Used Fuel Cell. Energy: +50. Now: 450/500.
```

---

## Exploration Strategy

### Early Game Exploration

1. **Spiral outward** from your starting Star Mall. Visit every adjacent sector before moving deeper
2. **Check `look` in every new sector** — you'll find outposts for trading and planets for claiming
3. **Each new sector = 10 XP** — exploration is the easiest way to level up early
4. **Mark important sectors** with `note` — e.g., `note Sector 88 has cheap cyrillium`

### Finding Specific Things

| Looking For | Strategy |
|------------|----------|
| Outposts | Explore methodically. ~200 spread across 5,000 sectors |
| Unclaimed planets | Explore and `look` — they'll show as `*unclaimed*` |
| Seed planets | Rarer — only 6 in the galaxy. Ask other players or buy intel |
| Star Malls | 8 total. You start at one. Others are spread evenly |
| Events | Spawn randomly. Check back in sectors you've visited |
| Rare planet variants | 1.5% chance on eligible planets. Explore heavily |

### Intel

At any Star Mall, you can buy sector intelligence for 500 credits:

```
> intel
Purchased sector intelligence. Check your mail for the report.
```

This sends you a mail with information about nearby rich sectors, dangerous areas, and points of interest.

---

## Tips

- **Use the map aggressively** — clicking sectors is faster than typing `move` commands
- **Bookmark important sectors** with notes: `note Sector 42 - great cyrillium outpost`
- **Protected sectors are your friend** early on — dock there when you're carrying valuable cargo
- **One-way sectors are traps** for the unwary — check the map legend for arrow indicators before entering
- **Scan before you move** if you have a scanner — knowing what's ahead saves energy and lives
- **Fuel efficiency matters** — a Scout covers 500 sectors on a full tank, a Battleship only covers 125

[← Back to Manual](../players-manual.md)
