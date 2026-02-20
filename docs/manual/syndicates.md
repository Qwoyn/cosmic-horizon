# Syndicates & Alliances

[← Back to Manual](../players-manual.md)

---

## Overview

Syndicates are player-run organizations. They provide shared resources, governance, warp gate networks, planetary factories, and access to mega projects — massive undertakings that no solo player can achieve. Joining or creating a syndicate is essential for late-game progression.

---

## Creating a Syndicate

Any player can create a syndicate:

```
> syndicate create Void Reapers
Syndicate "Void Reapers" created! You are the Leader.
```

The creator becomes the **Leader** — the highest authority in the syndicate.

---

## Roles & Permissions

### Default Roles

| Role | Abilities |
|------|-----------|
| **Leader** | Full control. Create/edit roles, manage members, set factory, manage pool, governance |
| **Officer** | Manage resources, designate factories, invite members |
| **Member** | Basic access, deposit to pool (if permitted) |

### Custom Roles

The Leader can create custom roles with specific permissions:

| Permission | What It Controls |
|------------|-----------------|
| `deposit` | Can contribute to resource pool |
| `withdraw` | Can withdraw from resource pool |
| `manager` | Full pool management access |
| `factory` | Can manage factory operations |

---

## Resource Pool

The syndicate resource pool is a shared treasury that members contribute to for collective goals.

### Contributing

```
> pool deposit 5000
Deposited 5,000 credits to syndicate pool. Pool: 45,000 cr.
```

### Pool Access Levels

| Level | What You Can Do |
|-------|----------------|
| **None** | No pool access |
| **Deposit** | Can contribute credits and resources |
| **Manager** | Can deposit and withdraw |
| **Full** | Complete control (Leader/Officer only) |

### Pool Log

All transactions are logged for transparency:

```
> pool log
[12:00] Nova7 deposited 5,000 credits
[12:15] Rogue_Alpha withdrew 2,000 credits (factory construction)
[13:00] System: factory production bonus credited
```

---

## Factories

A syndicate can designate one of its members' planets as a **factory** — a supercharged production facility.

### Requirements

- Planet must be **level 5 or higher**
- Syndicate treasury must have **50,000+ credits**
- **Cost:** 50,000 credits from treasury

### Factory Bonuses

| Bonus | Amount |
|-------|--------|
| Production boost | +50% to all commodities (cyrillium, food, tech, drones) |
| Refinery slots | +2 additional crafting slots |

### Managing Factories

```
> factory designate MyPlanet
Planet "MyPlanet" designated as syndicate factory. 50,000 credits deducted.

> factory revoke
Factory status revoked from MyPlanet.
```

Only the Leader can revoke factory status.

### Factory Strategy

- Choose a **Volcanic or Gaseous planet** for maximum cyrillium/tech output
- The +50% bonus on a level 5+ planet is massive — a Volcanic planet producing 50 cyrillium/tick becomes 75/tick
- The +2 refinery slots mean more simultaneous crafting
- Factory output benefits the entire syndicate

---

## Warp Gates

Syndicates can build permanent warp gates connecting distant sectors for instant travel.

### Building a Gate

```
> warp build 2501
Building warp gate from sector 127 to sector 2501...
Gate constructed! Cost: 100,000 cr, 500 tech, 200 cyrillium.
```

### Requirements

| Requirement | Value |
|-------------|-------|
| Credits | 100,000 |
| Tech | 500 units |
| Cyrillium | 200 units |
| Rank | Officer or Leader |
| Limit | 3 gates per syndicate |

### Using Gates

```
> warp
=== Warp Gates in Sector 127 ===
[1] → Sector 2501 (Toll: 0 cr) [Void Reapers]

> warp 1
Warped to sector 2501. Energy: -2 AP.
```

### Tolls

Set tolls on your gates for passive income:

```
> warp toll gate123 500
Toll set to 500 credits for gate gate123.
```

- **Syndicate members** travel free
- **Non-members** pay the toll
- Toll revenue goes to the syndicate treasury

### Gate Strategy

- **Connect your territory** — gates between your planets and Star Malls save enormous energy
- **Charge tolls on busy routes** — 500 credits per use adds up fast on popular corridors
- **Gates are bidirectional** — one gate connects both sectors
- **3-gate limit** means you need to be strategic about placement

---

## Governance

### Voting System

Officers and Leaders can initiate votes on syndicate matters:

- Role changes
- Factory designation
- Resource allocation
- Member management

```
> vote kick BadMember
Vote initiated: Kick BadMember from syndicate.
Members, vote with: vote yes / vote no
```

### Leader Succession

If the Leader goes inactive, Officers can initiate a leadership vote.

---

## Mega Projects

The ultimate expression of syndicate power. These are massive constructions that require multiple members, enormous resources, and days of build time.

### Available Mega Projects

| Project | Cost | Build Time | Min Members | Key Resources |
|---------|------|-----------|-------------|---------------|
| **Space Station** | 500,000 cr | 72 hours | 3 | 50 Hardened Core, 30 Quantum Coolant, 20 Star Alloy, 40 Nano-Weave |
| **Warp Network Hub** | 750,000 cr | 96 hours | 4 | 50 Void Catalyst, 50 Quantum Coolant, 5 Dark Matter Shard, 5 Ion Crystal |
| **Mega Weapon Platform** | 1,000,000 cr | 120 hours | 5 | 100 Hardened Core, 80 Star Alloy, 30 Void Catalyst, 10 Dark Matter Shard, 5 Harmonic Resonator |
| **Colony Ship** | 600,000 cr | 48 hours | 3 | 60 Nano-Weave, 40 Stim Compound, 30 Hardened Core, 3 Leviathan Pearl |
| **Research Lab** | 400,000 cr | 48 hours | 2 | 40 Quantum Coolant, 30 Nano-Weave, 3 Cryo-Fossil, 3 Artifact Fragment |

### Resource Sourcing

Mega projects require **Tier 3 crafted materials** and **ultra-rare resources** from rare planet variants and alien caches:

| Material | Source |
|----------|--------|
| Hardened Core | Tier 3 crafting (90 min) |
| Quantum Coolant | Tier 3 crafting (120 min) |
| Star Alloy | Tier 3 crafting (180 min) |
| Nano-Weave | Tier 3 crafting (150 min) |
| Void Catalyst | Tier 3 crafting (180 min) |
| Stim Compound | Tier 3 crafting (90 min) |
| Dark Matter Shard | Volcanic-Prime rare planet variant |
| Ion Crystal | Gaseous-Storm rare planet variant |
| Cryo-Fossil | Frozen-Ancient rare planet variant |
| Leviathan Pearl | Ocean-Abyssal rare planet variant |
| Artifact Fragment | Desert-Ruin rare planet variant |
| Harmonic Resonator | Alpine-Crystal rare planet variant |

### Building a Mega Project

1. Have enough members at the required minimum
2. Stockpile all required resources in the syndicate pool
3. Contribute the credit cost from the treasury
4. Initiate construction — the build timer starts
5. Wait for completion (48–120 hours)

---

## Syndicate Panel

The Syndicate activity panel provides access to all syndicate functions:

- View members and roles
- Access the resource pool
- Manage factory status
- Pool access controls
- Governance and voting

---

## Syndicate Strategy

### Starting a Syndicate

1. **Recruit 2-3 active players** — quality over quantity
2. **Pool resources early** — everyone contributes credits
3. **Designate a factory planet** as soon as a member has a level 5 planet
4. **Build your first warp gate** connecting your core territory to a Star Mall

### Growing Your Syndicate

1. **Set toll gates** on busy routes for passive income
2. **Diversify planet classes** among members — you need all resource types
3. **Start Tier 3 crafting** to stockpile mega project materials
4. **Hunt rare planet variants** — the ultra-rare resources they produce are essential

### Late Game

1. **Build mega projects** — Space Station first (cheapest at 500K credits)
2. **Control key sectors** with mines, drones, and warp gates
3. **Coordinate attacks** on rival syndicates — syndicate chat keeps communication private
4. **Compete on the syndicate leaderboard** — treasury size and member count drive rankings

---

## Tips

- **Join a syndicate early** — even a small one provides access to pooled resources and factory bonuses
- **Factory designation is the single biggest production boost** — +50% output on a high-level planet is enormous
- **Warp gates save thousands of energy over time** — a 3-gate network between your planets and Star Malls is transformative
- **Toll gates generate passive income** — 500 credits × 50 uses/day = 25,000 credits/day
- **Ultra-rare resources are the bottleneck** for mega projects — start hunting rare planet variants early
- **Syndicate chat** (via the mini chat channel selector) keeps your communications private from other players

[← Back to Manual](../players-manual.md)
