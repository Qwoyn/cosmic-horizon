# Ships & Upgrades

[← Back to Manual](../players-manual.md)

---

## Ship Classes

There are 8 ship classes in Cosmic Horizon (plus the emergency DodgePod). Each serves a different role and playstyle.

### Full Ship Comparison

| Ship | Price | Weapons | Engines | Cargo | Hull HP | Fuel/Sector | Level Req |
|------|-------|---------|---------|-------|---------|-------------|-----------|
| DodgePod | Free | 0 | 20 | 0 | 10 | 1 | — |
| Scout | 5,000 | 25 | 50 | 10 | 50 | 1 | 1 |
| Freighter | 15,000 | 15 | 60 | 40 | 80 | 2 | — |
| Colony Ship | 25,000 | 10 | 50 | 60 | 60 | 3 | — |
| Corvette | 30,000 | 50 | 75 | 15 | 100 | 2 | 5 |
| Shadow Runner | 50,000 | 30 | 60 | 8 | 40 | 2 | — |
| Cruiser | 75,000 | 75 | 100 | 20 | 150 | 3 | — |
| Battleship | 150,000 | 100 | 80 | 10 | 200 | 4 | — |

### Max Stats (Fully Upgraded)

| Ship | Max Weapons | Max Engines | Max Cargo | Max Hull |
|------|------------|------------|-----------|----------|
| DodgePod | 0 | 20 | 0 | 10 |
| Scout | 75 | 100 | 20 | 75 |
| Freighter | 50 | 120 | 80 | 120 |
| Colony Ship | 30 | 100 | 100 | 100 |
| Corvette | 150 | 150 | 30 | 175 |
| Shadow Runner | 80 | 120 | 15 | 60 |
| Cruiser | 200 | 200 | 40 | 250 |
| Battleship | 300 | 180 | 25 | 350 |

---

## Ship Details

### DodgePod
*"Better than floating in the void."*

The emergency escape vehicle you end up in when your ship is destroyed. No weapons, no cargo, minimal engines. Your only goal is to limp to a Star Mall and buy a real ship.

- **Role:** Emergency survival
- **Special:** None
- **Tip:** Don't stay in one. Get to a Star Mall immediately.

### Calvatian Scout
*"Fast, cheap, and expendable."*

The starter ship for many pilots. Low in every stat but fuel-efficient at 1 energy per sector. Great for exploration but terrible in a fight.

- **Role:** Exploration, early game
- **Special:** Max 1 drone
- **Attack: 0.8 | Defense: 1.0** | Recharge: 4s
- **Tip:** Keep this as your exploration workhorse until you can afford a Corvette. Its 1 fuel/sector efficiency is unbeatable for mapping the galaxy.

### Tar'ri Freighter
*"Space trucker supreme."*

The hauling champion. 40 base cargo (80 max) makes this the most profitable trading vessel. Weak in combat but can tow objects and take a hit with decent hull.

- **Role:** Trading, hauling
- **Special:** Can tow (2.0x fuel), Max 1 drone
- **Attack: 0.5 | Defense: 0.8** | Recharge: 8s
- **Tip:** Pair with Cargo Expander Mk2 upgrades for 80+ cargo capacity. A full hold of tech can net you 4,000+ credits per trip.

### Muscarian Corvette
*"The workhorse of the frontier fleet."*

The first real combat ship. Balanced stats, mine capability, and towing make it versatile. Requires Level 5 to purchase.

- **Role:** Combat, multi-purpose
- **Special:** Can carry mines, tow (1.8x fuel), Max 2 drones
- **Attack: 1.2 | Defense: 1.0** | Recharge: 5s
- **Tip:** The Corvette is the best value combat ship. It's strong enough to handle most encounters and cheap enough to replace if you lose it.

### Shadow Runner
*"Now you see me..."*

The stealth specialist. Cloaking makes you invisible to other players and scans. Low combat stats but the highest defense ratio in the game and fastest recharge.

- **Role:** Stealth, evasion, scouting
- **Special:** Can cloak, carry mines, Max 1 drone
- **Attack: 0.9 | Defense: 1.5** | Recharge: 3s
- **Tip:** Use cloaking to slip through dangerous sectors undetected. Engage only when you have the element of surprise — your hull can't take sustained fire.

### Vedic Cruiser
*"Power and precision."*

The all-rounder. Strong weapons, solid hull, and access to both Jump Drive and Planetary Scanner make it the best exploration-combat hybrid.

- **Role:** Combat, exploration, multi-role
- **Special:** Can carry PGD & mines, tow (1.5x fuel), jump drive capable, planetary scanner, Max 2 drones
- **Attack: 1.5 | Defense: 1.2** | Recharge: 5s
- **Tip:** The Cruiser is the most versatile ship in the game. Install a Jump Drive for instant travel across your explored territory.

### Kalin Battleship
*"Overwhelming force."*

The ultimate combat vessel. Highest weapon energy, most hull HP, and devastating attack ratio. Expensive to buy and fuel-hungry, but nothing hits harder.

- **Role:** Dominant combat, territorial control
- **Special:** Can carry PGD & mines, tow (1.5x fuel), jump drive capable, planetary scanner, Max 3 drones
- **Attack: 2.0 | Defense: 1.0** | Recharge: 7s
- **Tip:** The Battleship's 4 fuel/sector cost means you burn through energy fast. Keep it near your territory and use a Jump Drive for strategic repositioning.

### Muscarian Colony Ship
*"A civilization in transit."*

Massive cargo capacity for hauling colonists and resources to your planets. Almost useless in combat.

- **Role:** Colonization, bulk hauling
- **Special:** None, Max 0 drones
- **Attack: 0.3 | Defense: 0.5** | Recharge: 10s
- **Tip:** Buy one specifically for colonization runs. Load up 60 colonists, deliver them to your planet, then switch back to your combat ship via the garage.

---

## Buying Ships

Ships are purchased at **Star Mall dealers**:

```
> dealer
=== SHIP DEALER ===
[1] Scout          5,000 cr   W:25  E:50  C:10  H:50
[2] Freighter     15,000 cr   W:15  E:60  C:40  H:80
[3] Colony Ship   25,000 cr   W:10  E:50  C:60  H:60
[4] Corvette      30,000 cr   W:50  E:75  C:15  H:100  [Lv.5]
...

> buyship corvette
Purchased Corvette for 30,000 credits.
```

Ships with a **[Lv.X]** tag require that level to purchase. Check `ranks` to see all level gates.

### Level Requirements

| Ship | Required Level |
|------|---------------|
| Corvette | Level 5 |
| All others | Level 1 |

---

## Ship Management

### Garage (Storage)

Star Malls have garages where you can store ships and swap between them:

```
> storeship
Ship stored in garage. You are now in a DodgePod.

> garage
=== GARAGE ===
[1] Corvette (ID: abc123) W:50 E:75 C:15 H:100/100
[2] Freighter (ID: def456) W:15 E:60 C:40 H:80/80

> retrieve abc123
Retrieved Corvette from garage.
```

**Tip:** Keep a Freighter in storage for trading runs and a combat ship for PvP. Swap at any Star Mall.

### Salvage Yard

Sell unwanted ships for **50% of their purchase price**:

```
> salvage
=== SALVAGE YARD ===
Ships available for salvage:
[1] Scout (ID: ghi789) - Salvage value: 2,500 cr

> salvage ghi789
Salvaged Scout for 2,500 credits.
```

---

## Ship Upgrades

Install upgrades at Star Mall to boost your ship's stats.

### Available Upgrades

| Upgrade | Stat | Bonus | Price | Max Stack |
|---------|------|-------|-------|-----------|
| Weapon Mk1 | Weapon | +5 | 3,000 | 3 |
| Weapon Mk2 | Weapon | +12 | 8,000 | 2 |
| Weapon Mk3 | Weapon | Crafted | — | — |
| Weapon Mk4 | Weapon | Crafted | — | — |
| Engine Mk1 | Engine | +5 | 3,000 | 3 |
| Engine Mk2 | Engine | +12 | 8,000 | 2 |
| Engine Mk3 | Engine | Crafted | — | — |
| Cargo Mk1 | Cargo | +10 | 2,500 | 3 |
| Cargo Mk2 | Cargo | +25 | 7,000 | 2 |
| Cargo Mk3 | Cargo | Crafted | — | — |
| Shield Mk1 | Shield | +5 | 4,000 | 3 |
| Shield Mk2 | Shield | +15 | 10,000 | 2 |
| Shield Mk3/Mk4 | Shield | Crafted | — | — |

Mk3 and Mk4 upgrades are crafted on planets — see [Planets](planets.md#crafting).

### Installation

```
> upgrades
=== AVAILABLE UPGRADES ===
...

> install cargo
Installed Cargo Expander Mk1. Cargo capacity: +10 (now 50/50).

> shipupgrades
=== INSTALLED UPGRADES ===
[1] Cargo Expander Mk1 (cargo +10)

> uninstall 1
Removed Cargo Expander Mk1. Cargo capacity: 40.
```

**Fuzzy matching works** — `install cargo` finds "Cargo Expander Mk1", `install weapon` finds weapon upgrades.

### Diminishing Returns (Stacking)

Each additional copy of the same upgrade type gives 80% of the previous:

| Stack | Weapon Mk1 Bonus | Cumulative |
|-------|-----------------|------------|
| 1st | +5.0 | +5.0 |
| 2nd | +4.0 (5 × 0.8) | +9.0 |
| 3rd | +3.2 (5 × 0.64) | +12.2 |

### Upgrade Limits

- **Maximum 6 upgrades** per ship
- **Maximum 3 stacks** of the same type
- Must be docked at a Star Mall to install or uninstall

### Upgrade Strategy

**For trading:** Stack Cargo Mk2 upgrades. Two Cargo Mk2 give +45 cargo (25 + 20).

**For combat:** Mix Weapon Mk2 and Shield Mk2. Raw damage + survivability beats pure offense.

**For exploration:** Engine Mk2 improves... well, engines aren't as useful as other stats. Save the slots for weapons/cargo/shield.

---

## Which Ship Should I Buy?

### Budget: Under 20,000 credits

**Scout** (5,000) if you need fuel efficiency for exploration.
**Freighter** (15,000) if you want to make money trading. The 40 cargo makes it the best early earner.

### Budget: 20,000–50,000 credits

**Corvette** (30,000) if you want to fight. It's the best value combat ship and unlocks mine deployment.
**Colony Ship** (25,000) if you're ready to start colonizing. Load 60 colonists per trip.

### Budget: 50,000–100,000 credits

**Shadow Runner** (50,000) if you prefer stealth and evasion. Cloaking is incredibly powerful.
**Cruiser** (75,000) if you want the best all-rounder. Jump Drive + Scanner + solid combat stats.

### Budget: 150,000+ credits

**Battleship** (150,000) for total combat dominance. Nothing else comes close in a straight fight.

### The Multi-Ship Strategy

Experienced pilots own multiple ships stored in Star Mall garages:
- **Freighter** for trading runs
- **Colony Ship** for colonist hauling
- **Corvette/Cruiser** for combat and general play
- **Scout** for cheap exploration

Swap at any Star Mall based on what you're about to do.

---

## Tips

- **Don't fly a DodgePod longer than necessary** — it has 0 weapons, 0 cargo, and only 10 hull HP
- **Your ship's attack/defense ratios matter more than raw weapon energy** in combat — a Battleship's 2.0 attack doubles its effective damage
- **Fuel costs add up** — a Battleship burning 4 energy per sector costs 40 energy to cross 10 sectors, versus 10 for a Scout
- **Store your combat ship before trading** — losing a 150,000 credit Battleship full of cargo to a pirate is devastating
- **Upgrades persist on the ship**, not the pilot — if you store a ship, its upgrades stay on it
- **Recharge time matters in combat** — a Shadow Runner (3s) can fire again before a Colony Ship (10s) finishes recharging

[← Back to Manual](../players-manual.md)
