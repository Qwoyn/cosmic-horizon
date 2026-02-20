# Combat & PvP

[← Back to Manual](../players-manual.md)

---

## Combat Basics

Combat in Cosmic Horizon is real-time and energy-based. You expend weapon energy to deal damage. Combat is **only allowed in standard sectors** — protected and harmony-enforced sectors are safe zones.

### Firing

```
> fire SpaceCowboy 10
You fire 10 weapon energy at SpaceCowboy!
Hit! Dealt 15 damage. SpaceCowboy hull: 85/100.
```

**Cost:** 2 energy per volley

### The Damage Formula

```
Raw Damage = Energy Expended × (Your Attack Ratio / Target's Defense Ratio)
Actual Damage = min(Raw Damage, Target's Hull HP)
```

**Attack and Defense Ratios by Ship:**

| Ship | Attack | Defense |
|------|--------|---------|
| DodgePod | 0.0 | 0.0 |
| Scout | 0.8 | 1.0 |
| Freighter | 0.5 | 0.8 |
| Colony Ship | 0.3 | 0.5 |
| Corvette | 1.2 | 1.0 |
| Shadow Runner | 0.9 | 1.5 |
| Cruiser | 1.5 | 1.2 |
| Battleship | 2.0 | 1.0 |

### Damage Examples

**Corvette (1.2 atk) firing 10 energy at a Scout (1.0 def):**
```
Damage = 10 × (1.2 / 1.0) = 12 damage
```

**Battleship (2.0 atk) firing 20 energy at a Shadow Runner (1.5 def):**
```
Damage = 20 × (2.0 / 1.5) = 26.7 damage
```

**Scout (0.8 atk) firing 10 energy at a Battleship (1.0 def):**
```
Damage = 10 × (0.8 / 1.0) = 8 damage
```

The Muscarian racial bonus (+5% attack) stacks multiplicatively with ship attack ratio. A Muscarian Battleship has an effective attack of 2.1.

---

## Ship Destruction

When a ship's hull reaches 0 HP, it's **destroyed**. The pilot ejects into a **DodgePod**:

- 0 weapons, 0 cargo, 20 engine energy, 10 hull HP
- All cargo is lost
- All upgrades on the destroyed ship are lost
- The pilot keeps their credits and level

### The DodgePod Escape

You're alive but defenseless. Your priorities:
1. **Get to a Star Mall** — buy a new ship
2. **Avoid combat sectors** — anything can kill you
3. **Use protected sectors** as a safe route

### Overkill Efficiency

If your volley would deal more damage than the target has hull HP, you don't waste all your weapon energy. The game calculates the proportional energy cost:

```
If target has 5 HP and your volley would deal 20 damage:
You only spend 25% of the energy you committed.
```

---

## Fleeing

If you're outgunned, run:

```
> flee
Escape successful! You fled to sector 201.
```

Or:

```
> flee
Escape failed! You're still in sector 42.
```

### Flee Chance

| Situation | Success Rate |
|-----------|-------------|
| 1 attacker | 15% |
| 2 attackers | 25% |
| 3 attackers | 35% |
| 4 attackers | 45% |
| 5+ attackers | Up to 90% (max) |

**Formula:** `min(90%, 15% + (numAttackers - 1) × 10%)`

Wait — that seems backwards! The more attackers, the *easier* it is to flee? Yes — the chaos of multiple combatants creates confusion you can exploit. But if there's only one attacker focused on you, it's very hard to slip away.

### Flee Destination

When you successfully flee, you're sent to a **random adjacent sector**. You can't choose where you end up.

---

## Cloaking

The **Shadow Runner** can toggle its cloaking device:

```
> cloak
Cloaking device activated. You are now invisible.

> cloak
Cloaking device deactivated. You are now visible.
```

While cloaked:
- You **don't appear** in `look` or `scan` results
- Other players **can't target you** with `fire`
- You can move freely without being detected

Cloaking **deactivates** when you:
- Fire weapons
- Dock at an outpost
- Deploy something

Non-Shadow Runner ships can use a **Cloaking Cell** (2,000 credits) for single-use temporary cloaking.

---

## Bounties

Place bounties on players you want eliminated:

```
> bounty SpaceCowboy 5000
Placed 5,000 credit bounty on SpaceCowboy.
```

### Bounty Rules

- **Minimum bounty:** 100 credits
- **Multiple bounties stack** on the same target
- When the target's ship is destroyed, the killer **automatically collects** all active bounties
- Bounties are visible to all players via the `bounties` command

```
> bounties
=== ACTIVE BOUNTIES ===
SpaceCowboy: 5,000 cr (placed by: Nova7)
Rogue_Alpha: 12,500 cr (3 bounties)
```

### Bounty Strategy

- **Place bounties to discourage aggression** — if someone keeps raiding your trade route, a bounty incentivizes others to hunt them
- **Check bounties before combat** — destroying a bountied target earns you the bounty on top of any loot
- **Bounty hunting** is a viable playstyle — check the board regularly and seek out bountied targets

---

## Deployables in Combat

Mines and drones add another layer to combat. See [Items & Deployables](items.md) for full details, but here's the combat-relevant summary:

### Mines

| Mine | Damage | Effect |
|------|--------|--------|
| **Halberd Mine** | 20 × power level | Explodes on contact, mine destroyed |
| **Barnacle Mine** | 5 × power level initial | Attaches, drains 2 × power engine per tick |

Deploy mines in chokepoint sectors to damage enemies:

```
> deploy mine_halberd
Deployed Halberd Mine in sector 42.
```

### Drones

| Drone | Effect |
|-------|--------|
| **Offensive Drone** | Attacks hostile ships for 10 × power damage |
| **Defensive Drone** | Boosts ally defense in sector |
| **Toll Drone** | Charges passing ships a toll |

### Rache Device (Self-Destruct)

The nuclear option. The Rache Device (10,000 credits) deals **50% of your weapon energy as area damage** to ALL ships in your sector:

```
> use rache
WARNING: This will destroy your ship! Confirm? (y/n)
> y
DETONATION! Dealt 50 damage to all ships in sector. Your ship is destroyed.
```

Use this as a last resort when surrounded — you'll go down, but you'll take everyone with you.

---

## Combat XP

| Action | XP Earned |
|--------|----------|
| Fire volley (hit) | 15 XP |
| Destroy enemy ship | 150 XP |
| Defeat alien cache guardian | 100 XP |

---

## Gear Panel Combat Buttons

The Gear activity panel provides buttons for combat-related actions:

- **CLOAK** — Toggle cloaking (Shadow Runner only)
- **REFUEL** — Quick refuel at Star Mall
- **EJECT** — Emergency eject (requires confirmation)
- **SELF-DESTRUCT** — Destroy your own ship (requires double confirmation)

---

## PvP Strategy

### Offensive Tips

1. **Choose your ship wisely.** Battleship for raw power, Corvette for cost-efficiency, Shadow Runner for ambush
2. **Scout first.** Use `scan` or probes to find targets before engaging
3. **Alpha strike.** Commit high energy on the first volley — catching someone off guard with a devastating opener can end the fight before it starts
4. **Target traders.** Freighters and Colony Ships have low attack/defense ratios. They're loaded with cargo and can't fight back effectively
5. **Mine the escape routes.** Place Halberd Mines in adjacent sectors so fleeing targets run into them
6. **Carry a Disruptor Torpedo.** Disabling an enemy's engines prevents them from fleeing for 5 minutes

### Defensive Tips

1. **Stay in protected sectors** when carrying valuable cargo
2. **Use cloaking** (Shadow Runner or Cloaking Cell) to slip through dangerous territory
3. **Deploy defensive drones** in sectors you frequent
4. **Travel light** — don't carry more cargo than you're willing to lose
5. **Keep energy reserves** — if you can't flee or fight back, you're dead
6. **Have an escape plan** — know which adjacent sectors are protected before entering a combat zone
7. **Store valuable ships** at Star Malls when you log off

### When to Fight vs. When to Run

**Fight when:**
- You have a significant ship advantage
- The target is a weaker ship class
- You have mines/drones deployed for support
- There's a bounty worth collecting

**Run when:**
- You're outnumbered
- You're carrying valuable cargo
- Your hull is below 50%
- You're in a weaker ship
- You're low on energy

---

## Combat Log

Review your recent combat history:

```
> combatlog
=== COMBAT LOG ===
[12:45] You fired 10 at SpaceCowboy → 15 damage (Hull: 85/100)
[12:46] SpaceCowboy fired 15 at you → 12 damage (Hull: 88/100)
[12:47] You fired 20 at SpaceCowboy → 30 damage (Hull: 55/100)
[12:48] SpaceCowboy fled to sector 201
```

---

## Tips

- **The Battleship's 2.0 attack ratio is devastating** — it effectively doubles every point of weapon energy you spend
- **The Shadow Runner's 1.5 defense ratio means it takes 33% less damage** from everything — combined with cloaking, it's the hardest ship to pin down
- **Recharge time matters** — a Shadow Runner (3s recharge) can fire 2-3 times before a Battleship (7s) fires again
- **Overkill protection saves energy** — you won't waste 50 weapon energy to deal 5 damage to a nearly-dead target
- **Flee chance with 1 attacker is only 15%** — if someone catches you alone, you're probably fighting whether you want to or not
- **Mines don't discriminate** — your own mines will damage you if you enter the sector. Remember where you placed them!

[← Back to Manual](../players-manual.md)
