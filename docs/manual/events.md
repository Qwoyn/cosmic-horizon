# Events & Anomalies

[← Back to Manual](../players-manual.md)

---

## Overview

The Cosmic Horizon is full of dynamic events — anomalies, resource deposits, derelict ships, and alien artifacts that spawn randomly across the galaxy. Investigating them earns resources, credits, XP, and sometimes ultra-rare materials. Events are first-come-first-served — once investigated, they're gone.

---

## Event Spawning

- **Spawn chance:** 2% per sector per game tick (60 seconds)
- **Max active events:** 50 across the entire galaxy
- **Default lifetime:** 120 minutes (2 hours)
- **Investigation cost:** 1 energy
- **Investigation XP:** 25 XP base

Events appear in your `look` output:

```
> look
=== Sector 88 ===
...
Events: Asteroid Field detected! | Distress Signal received!
```

---

## Event Types

### Asteroid Field

Mine valuable minerals from a debris field.

```
> investigate
You mine the asteroid field...
Gained 8 cyrillium! (+25 XP)
```

- **Reward:** 1–11 cyrillium
- **Risk:** None
- **Strategy:** Always investigate — free cargo with no downside

### Nebula

Sensor interference creates unpredictable conditions.

```
> investigate
You navigate the nebula...
[50% chance] Interference! Lost 5 energy.
[50% chance] Clear passage! Gained 10 energy.
```

- **Risk:** 50% chance of losing 5 energy
- **Reward:** 50% chance of gaining 10 energy
- **Strategy:** Investigate when you have energy to spare. The expected value is positive (+2.5 energy average).

### Distress Signal

A ship in trouble needs help.

```
> investigate
You respond to the distress signal...
Rescued survivors! Gained 900 credits. (+25 XP)
```

- **Reward:** 500 + (urgency × 200) credits
- **Risk:** None
- **Strategy:** Always investigate — pure credit reward

### Derelict Ship

An abandoned vessel drifting in space. Salvageable, but possibly booby-trapped.

```
> investigate
You board the derelict...
[70% chance] Salvage successful! Gained 1,800 credits. (+30 XP)
[30% chance] It's a trap! Lost 15 energy.
```

- **Salvage value:** 500–2,500 credits
- **Bonus resource (40% chance):** 3–10 units of a Tier 1 resource
- **Trap chance:** 30% — lose 15 energy
- **XP:** 30 XP (salvage-specific)
- **Strategy:** Investigate unless you're critically low on energy. The 70% success rate with 500–2,500 credit payouts makes it worthwhile.

### Resource Cache

A hidden stash of commodities.

```
> investigate
You discover a resource cache!
Gained 12 food! (+25 XP)
```

- **Reward:** 5–15 units of a random commodity (cyrillium, food, or tech)
- **Risk:** None
- **Strategy:** Always investigate — free cargo

### Ion Storm

Electromagnetic chaos damages your ship's systems.

```
> investigate
The ion storm engulfs your ship...
Lost 18 energy!
```

- **Damage:** 5–25 energy loss
- **Risk:** Always negative
- **Strategy:** **Avoid if possible.** Ion storms are the only event type with no upside. Check event names in `look` before investigating.

---

## Resource Events (Advanced)

Beyond basic events, the galaxy spawns persistent resource opportunities:

### Asteroid Fields (Resource Type)

- **Nodes:** 3–8 resource nodes per spawn
- **Resources:** 60% Tier 1 unique resources, 30% base commodities, 10% rare materials
- **Quantity:** 1–5 units per node
- **Duration:** 4–8 hours
- **XP:** 15 per harvest

```
> look
Asteroid field with 5 resource nodes detected!
> harvest
Mined 3 Silica Glass from node. 4 nodes remaining. (+15 XP)
```

### Derelicts (Resource Type)

Persistent wreckage with guaranteed loot:

- **Credits:** 1,000–5,000
- **Bonus resource (40%):** 3–10 units of Tier 1 unique resource
- **Duration:** 2–4 hours
- **Trap chance:** 30% lose 15 energy
- **XP:** 30 per salvage

### Anomalies

High-value single resource deposits:

- **Quantity:** 20–50 units of a single resource
- **Duration:** 1–2 hours (short-lived!)
- **XP:** 25 per investigation

### Alien Caches

The rarest and most valuable events. Guarded by automated defenses.

---

## Alien Caches

Alien caches are remnants of the ancient civilization that built the warp tunnel network. They contain ultra-rare resources essential for mega projects.

### Finding Alien Caches

- **Drop chance:** 15% from other event investigations
- **Duration:** 6 hours
- **Rarity:** Very rare — you might explore for days before finding one

### The Guardian

Alien caches are protected by an automated guardian with **50 HP**. You must defeat it before claiming the cache:

```
> investigate
An alien guardian blocks the cache! (50 HP)
> fire guardian 20
Hit! Guardian HP: 30/50.
> fire guardian 30
Hit! Guardian destroyed! (+100 XP)
The cache is now accessible.
> investigate
Claimed alien cache! Found 2 Dark Matter Shards! (+200 XP)
```

### Cache Loot

| Reward | Chance | Amount |
|--------|--------|--------|
| Primary ultra-rare resource | 100% | 1–3 units |
| Secondary ultra-rare resource | 30% | 1 unit |

### Ultra-Rare Resources

These only come from alien caches and rare planet variants:

| Resource | Origin Planet | Value |
|----------|--------------|-------|
| Dark Matter Shard | Volcanic-Prime variant | 25,000 cr |
| Cryo-Fossil | Frozen-Ancient variant | 25,000 cr |
| Ion Crystal | Gaseous-Storm variant | 20,000 cr |
| Leviathan Pearl | Ocean-Abyssal variant | 25,000 cr |
| Artifact Fragment | Desert-Ruin variant | 20,000 cr |
| Harmonic Resonator | Alpine-Crystal variant | 25,000 cr |

Ultra-rare resources are required for syndicate mega projects. See [Syndicates](syndicates.md#mega-projects).

---

## Event Strategy

### Always Investigate

Most events have positive expected value:

| Event | Expected Value |
|-------|---------------|
| Asteroid Field | +6 cyrillium average |
| Nebula | +2.5 energy average |
| Distress Signal | +700 credits average |
| Derelict Ship | +1,050 credits (70% of 1,500) minus 4.5 energy (30% of 15) |
| Resource Cache | +10 commodity units average |
| Ion Storm | -15 energy average (AVOID) |

### Event Hunting Route

1. Explore a circuit of 20–30 sectors
2. Check `look` in each for events
3. Investigate everything except Ion Storms
4. Return to start and repeat — events respawn every 2 hours

### Alien Cache Hunting

1. Investigate every event you find — 15% chance to spawn a cache
2. Keep a combat ship ready for guardian fights (50 HP)
3. Focus on sectors you visit frequently — caches last 6 hours
4. Ultra-rare loot is worth 20,000–25,000 credits per unit, plus they're essential for mega projects

---

## Tips

- **Check `look` every time you enter a sector** — events are easy to miss
- **Ion Storms are the only bad event** — learn to recognize them and skip them
- **Derelicts have a 30% trap chance** — don't investigate if you're low on energy
- **Alien caches require combat** — bring a ship with weapons, not a Freighter
- **Events are first-come-first-served** — if another player investigates before you, it's gone
- **Events respawn** — your favorite sectors will get new events every few hours
- **Anomalies are short-lived** (1–2 hours) but high-value — investigate immediately when you find one
- **Ultra-rare resources are the most valuable items in the game** — a single Dark Matter Shard is worth 25,000 credits

[← Back to Manual](../players-manual.md)
