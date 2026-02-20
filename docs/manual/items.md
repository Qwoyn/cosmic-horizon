# Items & Deployables

[← Back to Manual](../players-manual.md)

---

## Inventory

Your inventory holds consumables, equipment, and deployables you've purchased or crafted.

```
> inventory
=== INVENTORY ===
--- EQUIPPED ---
[1] Jump Drive [equipment]

--- ITEMS ---
[2] Sector Probe x3 [consumable]
[3] Fuel Cell x2 [consumable]
[4] Halberd Mine x1 [deployable]
```

**Alias:** `inv` works the same.

### Using Items

Use items by number or name:

```
> use 2
Used Sector Probe. Target sector?

> use fuelcell
Used Fuel Cell. Energy: +50. Now: 450/500.
```

---

## Consumables

Single-use items that provide immediate effects.

### Sector Probe (300 cr)

Remotely scan any sector in the galaxy:

```
> use probe 2501
=== Sector 2501 Scan ===
Type: standard | Players: 2 | Outposts: 0
Mines: 2 detected! | Planets: 1
```

**Strategy:** Always probe before jumping into unknown sectors. A 300-credit probe is cheap insurance against mines that could cost you a 150,000-credit Battleship.

### Fuel Cell (500 cr)

Instantly restore 50 energy anywhere:

```
> use fuelcell
Energy: +50. Now: 450/500.
```

**Strategy:** Carry 2-3 on long trade runs or exploration trips. Much cheaper than losing time returning to a Star Mall for refueling.

### Disruptor Torpedo (3,000 cr)

Disables a target ship's engines for 5 minutes:

```
> use disruptor SpaceCowboy
Disruptor hit! SpaceCowboy's engines disabled for 5 minutes.
```

**Strategy:** Fire this before engaging in combat. A target that can't flee is a target you can finish at your leisure. Especially effective against Shadow Runners trying to cloak and run.

### Cloaking Cell (2,000 cr)

Grants temporary cloaking to any ship (not just Shadow Runners):

```
> use cloak
Cloaking activated. You are invisible until you fire or dock.
```

**Strategy:** Use to slip through a mined or camped sector. The cloak breaks when you fire, dock, or deploy anything.

### Rache Device (10,000 cr)

The nuclear option. Self-destructs your ship, dealing 50% of your weapon energy as area damage to ALL ships in your sector:

```
> use rache
WARNING: This will DESTROY YOUR SHIP! Are you sure? (y/n)
> y
DETONATION! Dealt 50 damage to all ships in sector 42.
Your ship is destroyed. You are now in a DodgePod.
```

**Strategy:** Last resort only. Use when surrounded by enemies with no escape. A Battleship (100 weapon energy) deals 50 AOE damage — enough to seriously hurt everyone in the sector.

---

## Equipment

Permanent items that enhance your ship's capabilities.

### Planet Gravity Drive (50,000 cr)

Allows ships with the `canCarryPgd` flag (Cruiser, Battleship) to tow planets between sectors.

**Strategy:** Move your planets closer together or to safer sectors. Extremely expensive but invaluable for syndicate territory management.

### Jump Drive (25,000 cr)

Allows ships with `hasJumpDriveSlot` (Cruiser, Battleship) to instantly travel to any explored sector. Costs energy proportional to distance.

**Strategy:** The single most impactful equipment purchase. Turns a Cruiser into an instant-response vessel. Jump to trade routes, to your planets, or to assist allies in combat.

### Planetary Scanner Upgrade (8,000 cr)

Reveals planet details when scanning adjacent sectors:

```
> scan
Sector 88: 1 planet (Volcanic, Level 3, 5,200 colonists, owned by Nova7)
```

**Strategy:** Invaluable for finding good planets to claim and assessing enemy colony strength. Worth buying early.

---

## Deployables

Items you place in sectors that persist until destroyed or expired. All deployables expire after **7 days** unless maintained.

### Mines

Mines require a ship with the `canCarryMines` flag (Corvette, Shadow Runner, Cruiser, Battleship).

#### Halberd Mine (1,500 cr)

Heavy damage mine that explodes on contact:

```
> deploy mine_halberd
Deployed Halberd Mine in sector 42.
```

- **Damage:** 20 × power level (scales with upgrades)
- **Effect:** Explodes when a ship enters the sector
- **Mine is destroyed** after detonation

**Strategy:** Place in chokepoint sectors — narrow corridors between regions where traffic is forced through. Multiple mines stack for devastating ambushes.

#### Barnacle Mine (2,000 cr)

Attaches to ships and drains engine energy over time:

```
> deploy mine_barnacle
Deployed Barnacle Mine in sector 42.
```

- **Initial damage:** 5 × power level
- **Ongoing drain:** 2 × power level engine energy per tick
- **Mine persists** — keeps draining until removed

**Strategy:** More insidious than Halberd mines. A target with drained engines can't flee. Place these in sectors you know enemies frequent, then follow up with an attack.

### Drones

#### Offensive Drone (800 cr)

Attacks hostile ships that enter your sector:

```
> deploy drone_offensive
Deployed Offensive Drone in sector 42.
```

- **Damage:** 10 × power level per tick
- **Drone survives** after attacking

**Strategy:** Cheap sector defense. Deploy several in your home territory. They'll soften up intruders before you engage.

#### Defensive Drone (600 cr)

Boosts defense for allied ships in the sector:

```
> deploy drone_defensive
Deployed Defensive Drone in sector 42.
```

**Strategy:** Deploy around your planets and trade outposts for passive protection.

#### Toll Drone (1,000 cr)

Charges passing ships a fee:

```
> deploy drone_toll 250
Deployed Toll Drone in sector 42. Toll: 250 credits.
```

- **Default toll:** 100 credits
- **Custom toll:** Specify amount when deploying

**Strategy:** Place in busy sectors for passive income. A toll drone on a popular trade route earning 250 credits × 50 ships/day = 12,500 credits/day. Pays for itself in under an hour.

### Navigation Buoy (200 cr)

Leaves a message visible to all pilots and logs who passes through:

```
> deploy buoy Warning: mines ahead!
Deployed Navigation Buoy in sector 42. Message: "Warning: mines ahead!"
```

**Strategy:** Use for communication, territory marking, or misdirection. Mark your territory, warn allies, or lure enemies into traps with false intel.

---

## Deployable Decay

- All deployables **expire after 7 days** from creation
- Drones lose **1% energy per tick** (60 seconds)
- Mines remain at full power until triggered
- Expired deployables are automatically removed

---

## Deployment Rules

- **Cost:** 1 energy per deployment
- **Location:** Most deployables can only be placed in standard sectors (not protected or harmony-enforced)
- **Visibility:** Mines are hidden from `look` output. Drones and buoys are visible.
- **Friendly fire:** Your own mines WILL damage you if you enter the sector! Remember where you placed them.

---

## Tips

- **Probe before you jump** — 300 credits is nothing compared to flying into a minefield
- **Fuel Cells are the best consumable** — always carry a few for emergency refueling
- **Mines don't care who trips them** — including you. Use notes to track mine placements
- **Toll drones are passive income machines** — deploy them on trade routes and forget about them
- **Disruptor Torpedoes win fights** — disabling an enemy's engines guarantees they can't flee for 5 minutes
- **Stack mines for ambushes** — 3 Halberd Mines in one sector will cripple any ship that enters
- **Cloaking Cells let any ship cloak** — not just Shadow Runners. Carry one for emergencies
- **Navigation Buoys are cheap territory markers** — 200 credits to mark your turf

[← Back to Manual](../players-manual.md)
