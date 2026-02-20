# Planets & Colonization

[← Back to Manual](../players-manual.md)

---

## Overview

Planets are your path to passive income. Claim a planet, populate it with colonists, and they'll produce commodities automatically every 60 seconds. Upgrade your planet to increase capacity and production. Eventually, planets become crafting hubs where you create advanced upgrades, consumables, and rare items.

---

## Planet Classes

Each planet class specializes in different resources:

| Class | Name | Ideal Pop | Cyrillium | Food | Tech | Growth Rate | Key Resources |
|-------|------|-----------|-----------|------|------|-------------|---------------|
| **H** | Goldilocks | 15,000 | 2 | 8 | 3 | 0.30% | Bio-Fiber, Fertile Soil |
| **D** | Desert | 8,000 | 8 | 1 | 2 | 0.10% | Silica Glass, Solar Crystal |
| **O** | Ocean | 12,000 | 1 | 10 | 1 | 0.25% | Bio-Extract, Coral Alloy |
| **A** | Alpine | 10,000 | 3 | 4 | 5 | 0.20% | Resonite Ore, Wind Essence |
| **F** | Frozen | 6,000 | 5 | 1 | 6 | 0.10% | Cryo Compound, Frost Lattice |
| **V** | Volcanic | 5,000 | 10 | 0 | 4 | 0.08% | Magma Crystal, Obsidian Plate |
| **G** | Gaseous | 3,000 | 12 | 0 | 8 | 0.05% | Plasma Vapor, Nebula Dust |
| **S** | Seed | 50,000 | 0 | 5 | 0 | 0.50% | Genome Fragment, Spore Culture |

**Production rates are per 1,000 colonists per game tick (60 seconds).**

### Choosing a Planet

**For credits (trading):**
- **Volcanic** (V) — Highest cyrillium production (10/tick)
- **Ocean** (O) — Highest food production (10/tick)
- **Gaseous** (G) — Best for both cyrillium (12) and tech (8)

**For crafting:**
- **Alpine** (A) — Most balanced production across all three commodities
- **Frozen** (F) — High tech (6) for advanced recipes

**For population growth:**
- **Goldilocks** (H) — Fastest growth (0.30%) with high ideal population (15,000)
- **Seed** (S) — Can't be claimed, but produces colonists at 0.50% growth

### Rare Planet Variants

1.5% of eligible planets spawn as rare variants that produce ultra-rare resources:

| Variant | Base Class | Ultra-Rare Resource | Value |
|---------|-----------|---------------------|-------|
| Volcanic-Prime | Volcanic | Dark Matter Shard | 25,000 cr |
| Frozen-Ancient | Frozen | Cryo-Fossil | 25,000 cr |
| Gaseous-Storm | Gaseous | Ion Crystal | 20,000 cr |
| Ocean-Abyssal | Ocean | Leviathan Pearl | 25,000 cr |
| Desert-Ruin | Desert | Artifact Fragment | 20,000 cr |
| Alpine-Crystal | Alpine | Harmonic Resonator | 25,000 cr |

These resources are essential for syndicate mega projects and high-tier crafting.

---

## Claiming a Planet

### Step 1: Find an Unclaimed Planet

Explore sectors and use `look` to find planets marked as `*unclaimed*`:

```
> look
=== Sector 88 ===
Planets: [1] Verdant Prime (H) *unclaimed*  [2] Dust Bowl (D) [owned by: Nova7]
```

### Step 2: Claim It

```
> claim Verdant Prime
Planet claimed! Verdant Prime is now yours. (+75 XP)
```

You can also use the number from the `look` listing:

```
> claim 1
Planet claimed! Verdant Prime is now yours. (+75 XP)
```

### Seed Planet Rules

Seed planets (class S) **cannot be claimed**. They show as `[seed world]` in `look` output. They exist solely as colonist sources.

---

## Colonization

### Getting Colonists

Colonists come from **Seed Planets** (class S). There are only 6 in the galaxy, so finding one is valuable.

```
> collect SeedWorld 50
Collected 50 colonists from Seed World. Cargo: 50/60. (+50 XP)
```

Colonists take up cargo space — 1 colonist = 1 cargo slot. A Colony Ship (60 cargo) is ideal for hauling colonists.

### Depositing Colonists

Fly to your claimed planet and deposit:

```
> colonize Verdant Prime 50
Deposited 50 colonists on Verdant Prime. Population: 50. (+50 XP)
```

### Population Growth

Colonists reproduce naturally **if the planet has food stock > 0**:

```
New colonists = current population × growth rate
```

Growth rates vary by planet class (see table above). A Goldilocks planet with 10,000 colonists grows by 30 per tick. A Gaseous planet with 3,000 grows by only 1.5 per tick.

### Population Efficiency

Production efficiency drops when population exceeds the ideal:

```
Efficiency = 1.0 if population ≤ ideal
Efficiency drops (squared) if population > ideal
```

For example, a Goldilocks planet (ideal 15,000) is at full efficiency with 15,000 colonists. At 20,000, efficiency drops significantly. Don't overpopulate — it wastes resources.

---

## Planet Production

Every game tick (60 seconds), your planet produces resources:

```
Production = base_rate × (colonists / 1,000) × efficiency
```

### Example: Volcanic Planet with 5,000 Colonists

```
Cyrillium: 10 × 5 × 1.0 = 50 cyrillium per tick
Tech: 4 × 5 × 1.0 = 20 tech per tick
Food: 0 × 5 × 1.0 = 0 food per tick
```

That's 50 cyrillium per minute, or 3,000 per hour, or 72,000 per day. At 10 credits each, that's 720,000 credits worth of cyrillium daily — passively.

### Collecting Planet Resources

```
> land Verdant Prime
=== Verdant Prime (Goldilocks) ===
Level: 3 | Population: 8,500 / 15,000
Stocks: Cyrillium: 450  Food: 2,100  Tech: 680
Production/tick: Cyr: 17  Food: 68  Tech: 25

> collect Verdant Prime cyrillium 40
Collected 40 cyrillium. Cargo: 40/40. (+5 XP)
```

### Drone Production

Planets also produce drones at a rate determined by class. Drones are used in combat deployments.

---

## Planet Upgrades

Each upgrade level increases your planet's capacity and production multiplier.

### Upgrade Requirements

| Level | Colonists | Cyrillium | Food | Tech | Credits |
|-------|-----------|-----------|------|------|---------|
| 1 → 2 | 1,000 | 100 | 200 | 100 | 5,000 |
| 2 → 3 | 3,000 | 300 | 500 | 300 | 15,000 |
| 3 → 4 | 5,000 | 800 | 800 | 800 | 40,000 |
| 4 → 5 | 8,000 | 1,500 | 1,000 | 1,500 | 80,000 |
| 5 → 6 | 10,000 | 3,000 | 1,500 | 3,000 | 150,000 |
| 6 → 7 | 12,000 | 5,000 | 2,000 | 5,000 | 250,000 |
| 7 (max) | 15,000 | 10,000 | 3,000 | 10,000 | 500,000 |

Resources are consumed from the planet's stocks, not your cargo.

```
> upgrade Verdant Prime
Planet upgraded to level 3! Production capacity increased.
```

### The Path to Level 7

Reaching max level requires significant investment:

**Total resources (levels 1→7):**
- 20,700 cyrillium
- 9,000 food
- 20,700 tech
- 1,040,000 credits

This is a long-term goal. Focus on getting a planet to level 3-4 first for crafting access.

---

## Crafting

Planets with refineries can craft advanced items. Refinery slots increase with planet level.

### Refinery Slots

- **Base:** 1 slot per planet
- **Level 3+:** +1 slot per level above 3
- **Syndicate factory:** +2 additional slots

### Tier 2 Crafting (Planet Level 1+)

8 intermediate materials. 20–45 minute craft times.

| Recipe | Inputs | Time | Output |
|--------|--------|------|--------|
| Refined Cyrillium | Cyrillium + resources | 20 min | Refined Cyr |
| Nutrient Paste | Food + resources | 25 min | Nutrient Paste |
| Molten Alloy | Cyrillium + resources | 30 min | Molten Alloy |
| Crystal Matrix | Tech + resources | 35 min | Crystal Matrix |
| Bio-Gel | Food + resources | 25 min | Bio-Gel |
| Resonite Plate | Unique resources | 40 min | Resonite Plate |
| Plasma Cell | Unique resources | 45 min | Plasma Cell |
| Synth-Fiber | Unique resources | 30 min | Synth-Fiber |

**XP per craft:** 10 XP

### Tier 3 Crafting (Planet Level 3+)

6 advanced materials. 90–180 minute craft times.

| Recipe | Time | Output |
|--------|------|--------|
| Hardened Core | 90 min | Used in mega projects |
| Quantum Coolant | 120 min | Used in mega projects |
| Stim Compound | 90 min | Used in consumables |
| Nano-Weave | 150 min | Used in mega projects |
| Void Catalyst | 180 min | Used in mega projects |
| Star Alloy | 180 min | Used in mega projects |

**XP per craft:** 25 XP

### Tier 4 Crafting (Planet Level 5+)

Instant crafting. Creates finished products:

- **Ship upgrades:** Mk3 and Mk4 versions (5,000–10,000 credits + materials)
- **Consumables:** Advanced combat items (500–5,000 credits)
- **Tablets:** Stat-boosting equippables (500–15,000 credits)
- **Trade goods:** High-value sellables (free, resource cost only)

**XP per craft:** 50 XP

### Max Batch Size

You can queue up to **5 batches** at a time across all refineries.

---

## Colonist Decay

If you stop playing for extended periods, your colonies slowly decline:

- **Trigger:** 48+ hours of inactivity
- **Rate:** 1.5% population loss per day of inactivity
- **Formula:** `newPop = currentPop × (1 - (hoursInactive / 1440 × 0.015))`

Log in regularly to keep your colonies healthy.

---

## Planets Panel

Click the Planets icon in the activity bar to open the Planets panel:

- **Owned tab** — Shows all your planets with production stats, stocks, and levels
- **Discovered tab** — Shows all planets from sectors you've visited, with ownership markers

The panel also has **LAND** buttons for planets in your current sector.

---

## Planet Strategy

### Early Game (Levels 1-2)

1. Find a Seed Planet — explore until you find one of the 6 in the galaxy
2. Collect colonists (use a Colony Ship for efficiency)
3. Claim your first planet — Goldilocks (H) or Volcanic (V) are good starters
4. Deposit colonists and wait for production to start
5. Collect output and sell at outposts

### Mid Game (Levels 3-4)

1. Upgrade to level 3 to unlock Tier 3 crafting
2. Start crafting intermediate materials
3. Claim a second planet of a different class for resource diversity
4. Begin stockpiling for level 5 upgrade

### Late Game (Levels 5-7)

1. Level 5 unlocks Tier 4 crafting — Mk3/Mk4 upgrades
2. Level 5 also qualifies your planet for syndicate factory status
3. Push toward level 7 for maximum production
4. Rare planet variants become essential for mega project materials

### Choosing Planet Locations

- **Near a Star Mall** — easy to sell production
- **In protected sectors** — safe from raiders
- **Near each other** — efficient collection routes
- **In different classes** — resource diversity for crafting

---

## Tips

- **Goldilocks planets are the best all-rounders** — high ideal population, fast growth, balanced production
- **Gaseous planets are the most valuable per colonist** — 12 cyrillium + 8 tech per 1,000 colonists
- **Don't overpopulate** — production drops sharply above ideal population
- **Seed planets have the fastest growth** (0.50%) — check back regularly for free colonists
- **Rare planet variants are extremely valuable** — the ultra-rare resources they produce are needed for mega projects worth millions
- **Upgrade to level 3 ASAP** — Tier 3 crafting opens up significant income
- **Planet production runs 24/7** — even while you're offline, your colonies are working
- **Use notes to track seed planet locations** — they're rare and incredibly useful

[← Back to Manual](../players-manual.md)
