# Star Mall Services

[← Back to Manual](../players-manual.md)

---

## Overview

Star Malls are the 8 massive orbital trading stations that serve as the frontier's hubs. They're protected zones (no combat) and offer every service a pilot needs. You start the game at a random Star Mall.

```
> mall
=== STAR MALL ===
Available services:
  → type "dealer"    — Ship dealer
  → type "store"     — General store
  → type "upgrades"  — Ship upgrades
  → type "garage"    — Ship storage
  → type "salvage"   — Sell ships for scrap
  → type "cantina"   — Rumors & missions
  → type "refuel"    — Buy energy
  → type "intel"     — Sector intelligence
  → type "missionboard" — Accept missions
```

---

## Ship Dealer

Browse and purchase ships:

```
> dealer
=== SHIP DEALER ===
[1] Calvatian Scout     5,000 cr   W:25  E:50  C:10  H:50
[2] Tar'ri Freighter   15,000 cr   W:15  E:60  C:40  H:80
[3] Colony Ship        25,000 cr   W:10  E:50  C:60  H:60
[4] Muscarian Corvette 30,000 cr   W:50  E:75  C:15  H:100  [Lv.5]
[5] Shadow Runner      50,000 cr   W:30  E:60  C:8   H:40
[6] Vedic Cruiser      75,000 cr   W:75  E:100 C:20  H:150
[7] Kalin Battleship  150,000 cr   W:100 E:80  C:10  H:200

> buyship corvette
Purchased Muscarian Corvette for 30,000 credits.
```

Ships with `[Lv.X]` require that level to purchase. See [Ships](ships.md) for detailed comparisons.

---

## General Store

The store sells equipment, consumables, and deployables:

```
> store
=== GENERAL STORE ===
[1]  Halberd Mine          1,500 cr  [deployable]
[2]  Barnacle Mine         2,000 cr  [deployable]
[3]  Offensive Drone         800 cr  [deployable]
[4]  Defensive Drone         600 cr  [deployable]
[5]  Toll Drone            1,000 cr  [deployable]
[6]  Navigation Buoy         200 cr  [deployable]
[7]  Planet Gravity Drive 50,000 cr  [equipment]
[8]  Jump Drive           25,000 cr  [equipment]
[9]  Planetary Scanner     8,000 cr  [equipment]
[10] Sector Probe            300 cr  [consumable]
[11] Disruptor Torpedo     3,000 cr  [consumable]
[12] Rache Device         10,000 cr  [consumable]
[13] Cloaking Cell         2,000 cr  [consumable]
[14] Fuel Cell               500 cr  [consumable]

> purchase 14
Purchased Fuel Cell for 500 credits.
```

You can buy by number or by name: `purchase fuelcell` works too.

### Item Categories

**Deployables** — Place in sectors. See [Items & Deployables](items.md).

| Item | Price | Effect |
|------|-------|--------|
| Halberd Mine | 1,500 | Explodes on contact, heavy damage |
| Barnacle Mine | 2,000 | Attaches, drains engine energy over time |
| Offensive Drone | 800 | Attacks hostile ships |
| Defensive Drone | 600 | Protects allied ships |
| Toll Drone | 1,000 | Charges passing ships |
| Navigation Buoy | 200 | Leaves messages, logs visitors |

**Equipment** — Permanent ship enhancements.

| Item | Price | Requires | Effect |
|------|-------|----------|--------|
| Planet Gravity Drive | 50,000 | canCarryPgd flag | Tow planets between sectors |
| Jump Drive | 25,000 | hasJumpDriveSlot flag | Instant travel to explored sectors |
| Planetary Scanner | 8,000 | — | Reveals adjacent sector planet details |

**Consumables** — Single-use items.

| Item | Price | Effect |
|------|-------|--------|
| Sector Probe | 300 | Scan any sector remotely |
| Disruptor Torpedo | 3,000 | Disables target engines for 5 minutes |
| Rache Device | 10,000 | Self-destruct: 50% weapon energy as AOE |
| Cloaking Cell | 2,000 | Single-use cloak until you fire or dock |
| Fuel Cell | 500 | +50 energy instantly |

---

## Ship Upgrades

Install stat-boosting upgrades on your ship:

```
> upgrades
=== SHIP UPGRADES ===
Weapon Mk1     +5 weapon     3,000 cr (max 3)
Weapon Mk2    +12 weapon     8,000 cr (max 2)
Engine Mk1     +5 engine     3,000 cr (max 3)
Engine Mk2    +12 engine     8,000 cr (max 2)
Cargo Mk1    +10 cargo       2,500 cr (max 3)
Cargo Mk2    +25 cargo       7,000 cr (max 2)
Shield Mk1    +5 shield      4,000 cr (max 3)
Shield Mk2   +15 shield     10,000 cr (max 2)
```

See [Ships](ships.md#ship-upgrades) for upgrade mechanics, stacking, and strategy.

---

## Garage

Store and retrieve ships:

```
> storeship
Ship stored in garage.

> garage
=== GARAGE ===
[1] Corvette (abc123) W:50 E:75 C:15 H:100/100
[2] Freighter (def456) W:15 E:60 C:40 H:80/80

> retrieve abc123
Retrieved Corvette.
```

Upgrades stay on stored ships. Cargo is preserved.

---

## Salvage Yard

Sell ships you no longer need for **50% of purchase price**:

```
> salvage
=== SALVAGE YARD ===
[1] Scout (ghi789) — Value: 2,500 cr

> salvage ghi789
Salvaged Scout for 2,500 credits.
```

---

## Cantina

The cantina offers rumors and, once unlocked, exclusive missions:

```
> cantina
A rumor floats through the bar...
"I heard sector 1842 has some unusual energy readings."
```

### Cantina Talk (Unlockable)

After completing "The Bartender's Trust" mission:

```
> cantina talk
The bartender leans close...
```

There's a 25% chance per visit that the bartender offers an exclusive mission. See [Missions](missions.md#cantina-missions).

**Alias:** `ct` works the same as `cantina talk`

---

## Refueling

Buy energy at 10 credits per AP:

```
> refuel 100
Purchased 100 energy for 1,000 credits. Energy: 500/500.
```

**Alias:** `fuel 100` works the same.

**Tip:** Fuel Cells (500 credits for +50 energy) can be used anywhere, not just at Star Malls. Carry a few for emergencies.

---

## Sector Intelligence

Buy info about nearby sectors for 500 credits:

```
> intel
Purchased sector intelligence for 500 credits.
Check your mail for the report.
```

The report arrives via in-game mail with information about profitable outposts, dangerous sectors, and points of interest.

---

## Mission Board

Accept structured missions for credit and XP rewards:

```
> missionboard
```

See [Missions](missions.md) for the complete mission system guide.

---

## Star Mall Scenes

When you dock at a Star Mall, the ambient scene changes to show the mall interior — a massive station with holographic displays, docking bays, and a subtle starfield visible through the viewports. The cantina has its own bar interior scene.

---

## Tips

- **Star Malls are safe zones** — no combat, no mines, no tolls. Use them as a safe harbor
- **Always refuel before a long trip** — running out of energy in hostile territory is dangerous
- **Check the store before heading out** — a 300-credit probe could save your life
- **The cantina is worth unlocking** — exclusive missions with good rewards
- **Buy Fuel Cells in bulk** — at 500 credits each, they're cheap insurance against getting stranded
- **Keep a ship in the garage** — swap between a trading ship and combat ship as needed
- **Salvage old ships** — a Scout sitting in your garage is worth 2,500 credits at the salvage yard

[← Back to Manual](../players-manual.md)
