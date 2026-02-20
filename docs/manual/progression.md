# Progression & Ranks

[← Back to Manual](../players-manual.md)

---

## Overview

Your pilot progresses through 100 levels, earning XP from nearly every action in the game. Each level grants stat bonuses, and every 5 levels earns you a new rank title. Higher levels unlock better ships, mission tiers, tablet slots, and syndicate content.

---

## Leveling

### XP Requirements

The XP needed for each level follows a power curve:

```
XP for Level N = floor(100 × N^1.8)
```

| Level | Total XP Needed | XP to Next Level |
|-------|----------------|-----------------|
| 1 | 0 | 348 |
| 2 | 348 | 300 |
| 5 | 1,748 | 470 |
| 10 | 6,310 | 1,000 |
| 25 | 22,387 | 3,800 |
| 50 | 118,850 | 5,500 |
| 75 | 344,095 | 7,600 |
| 100 | 398,107 | — (max) |

### Level-Up Bonuses

Every level gives you:
- **+1 Max Energy** (permanent)
- **+1 to a rotating stat** based on your level:
  - Level divisible by 3: **+1 Cargo**
  - Level % 3 = 1: **+1 Weapon**
  - Level % 3 = 2: **+1 Engine**

By level 100, you'll have +100 max energy, +33 cargo, +34 weapon, and +33 engine from leveling alone.

### Checking Your Level

```
> profile
=== YourName — Level 15 / 100 ===
Rank: Lieutenant
XP: 12,450 / 14,230 (next level)
[████████████░░░░] 87%

Level Bonuses:
  Max Energy: +15
  Weapon: +5
  Engine: +5
  Cargo: +5
```

**Aliases:** `p`, `rank`, `lvl` all work the same as `profile`

---

## XP Sources

### Exploration

| Action | XP |
|--------|-----|
| Visit a new sector | 10 |
| Revisit a sector | 0 |

### Trading

| Action | XP per Unit |
|--------|-------------|
| Buy commodities | 2 |
| Sell commodities | 5 |

### Combat

| Action | XP |
|--------|-----|
| Fire volley (hit) | 15 |
| Destroy enemy ship | 150 |
| Defeat alien cache guardian | 100 |
| First NPC encounter | 15 |

### Planets

| Action | XP |
|--------|-----|
| Claim a planet | 75 |
| Colonize (per colonist) | 1 |
| Collect resources | 5 |

### Events

| Action | XP |
|--------|-----|
| Investigate anomaly | 25 |
| Harvest asteroid | 15 |
| Salvage derelict | 30 |
| Claim alien cache | 200 |

### Crafting

| Action | XP |
|--------|-----|
| Tier 2 craft | 10 |
| Tier 3 craft | 25 |
| Tier 4 craft | 50 |

### Missions

Missions award XP on completion. Amount varies by difficulty tier — see [Missions](missions.md).

---

## Ranks

Every 5 levels earns you a new rank title. Your rank appears in your status bar and profile.

| Levels | Rank |
|--------|------|
| 1–4 | Recruit |
| 5–9 | Cadet |
| 10–14 | Ensign |
| 15–19 | Lieutenant |
| 20–24 | Commander |
| 25–29 | Captain |
| 30–34 | Commodore |
| 35–39 | Rear Admiral |
| 40–44 | Vice Admiral |
| 45–49 | Admiral |
| 50–54 | Fleet Admiral |
| 55–59 | Warden |
| 60–64 | Sentinel |
| 65–69 | Vanguard |
| 70–74 | Champion |
| 75–79 | Overlord |
| 80–84 | Star Marshal |
| 85–89 | Galactic Commander |
| 90–94 | Cosmic Admiral |
| 95–99 | Cosmic Sovereign |
| 100 | Cosmic Legend |

```
> ranks
=== RANK TIERS ===
Recruit (1-4) → Cadet (5-9) → Ensign (10-14) → ...
Ship level gates: Corvette → Lv.5
```

---

## Unlocks by Level

| Level | What Unlocks |
|-------|-------------|
| 1 | Base game, Tier 1 missions, Tablet slot 1 |
| 5 | Corvette purchase, Cadet rank |
| 10 | Tier 2 missions, Ensign rank, Tablet slot 2 |
| 20 | Tier 3 missions, Commander rank |
| 30 | Tablet slot 3, Commodore rank |
| 35 | Tier 4 missions, Rear Admiral rank |
| 50 | Tier 5 missions, Fleet Admiral rank |
| 60 | Tablet slot 4, Sentinel rank |
| 100 | Cosmic Legend rank |

---

## Achievements

Achievements reward you for hitting gameplay milestones. They award both XP and credits.

### Leveling Achievements

| Achievement | Requirement | XP | Credits |
|------------|-------------|-----|---------|
| Rising Star | Reach Level 10 | 100 | 1,000 |
| Seasoned Pilot | Reach Level 25 | 250 | 5,000 |
| Veteran | Reach Level 50 | 500 | 15,000 |
| Elite | Reach Level 75 | 750 | 30,000 |
| Cosmic Legend | Reach Level 100 | 0 | 100,000 |

### Combat Achievements

| Achievement | Requirement | XP | Credits |
|------------|-------------|-----|---------|
| First Blood | Destroy 1 ship | 50 | 500 |
| Destroyer | Destroy 10 ships | 200 | 5,000 |
| Annihilator | Destroy 50 ships | 500 | 25,000 |

### Exploration Achievements

| Achievement | Requirement | XP | Credits |
|------------|-------------|-----|---------|
| Explorer | Visit 100 sectors | 100 | 2,000 |
| Cartographer | Visit 500 sectors | 300 | 10,000 |
| Galaxy Mapper | Visit 1,000 sectors | 500 | 25,000 |

### Trading Achievements

| Achievement | Requirement | XP | Credits |
|------------|-------------|-----|---------|
| First Trade | Complete 1 trade | 25 | 250 |
| Trade Baron | Trade 1,000+ units | 300 | 10,000 |

### Mission Achievements

| Achievement | Requirement | XP | Credits |
|------------|-------------|-----|---------|
| Mission Runner | Complete 1 mission | 25 | 250 |
| Task Master | Complete 10 missions | 200 | 5,000 |
| Mission Legend | Complete 50 missions | 500 | 20,000 |

### Planet Achievements

| Achievement | Requirement | XP | Credits |
|------------|-------------|-----|---------|
| Landowner | Claim 1 planet | 50 | 1,000 |
| Empire Builder | Own 5 planets | 250 | 10,000 |

### Hidden Achievements

These don't appear until you earn them:

| Achievement | Requirement | XP | Credits |
|------------|-------------|-----|---------|
| Origin Story | Visit Sector 1 | 100 | 5,000 |
| Millionaire | Accumulate 1,000,000 credits | 200 | 0 |

```
> achievements
=== ACHIEVEMENTS ===

--- EARNED ---
[✓] First Trade — Complete your first trade (25 XP, 250 cr) ✓
[✓] Explorer — Visit 100 sectors (100 XP, 2,000 cr) ✓

--- LOCKED ---
[ ] Cartographer — Visit 500 sectors (300 XP, 10,000 cr) [280/500]
[ ] First Blood — Destroy an enemy ship (50 XP, 500 cr) [0/1]
...
```

---

## Tablets

Tablets are equippable stat modifiers that drop from events, crafting, and alien caches.

### Tablet Slots

| Slot | Unlocks At |
|------|-----------|
| Slot 1 | Level 1 |
| Slot 2 | Level 10 |
| Slot 3 | Level 30 |
| Slot 4 | Level 60 |

### Tablet Rarities

| Rarity | Drop Rate | Example |
|--------|-----------|---------|
| Common | 50% | Iron Focus (+2 weapon) |
| Uncommon | 25% | Tempered Edge (+4 weapon) |
| Rare | 15% | War Shard (+8 weapon, +5 shield) |
| Epic | 7% | Multi-stat tablets |
| Legendary | 2.5% | Powerful unique effects |
| Mythic | 0.5% | Extremely rare, best in game |

### Sample Tablets

| Tablet | Rarity | Stats |
|--------|--------|-------|
| Iron Focus | Common | +2 weapon |
| Swift Step | Common | +2 engine |
| Deep Hold | Common | +3 cargo |
| Hull Plate | Common | +3 shield |
| Quick Study | Common | +5% XP multiplier |
| War Shard | Rare | +8 weapon, +5 shield |

### Equip Costs

| Rarity | Cost to Equip |
|--------|--------------|
| Common | 500 cr |
| Uncommon | 1,000 cr |
| Rare | 1,500 cr |
| Epic | 2,000 cr |
| Legendary | 2,500 cr |
| Mythic | 3,000 cr |

### Storage

- **Base storage:** 5 tablets
- **Bonus:** +1 per 5 levels above level 5
- At level 50, you can store 14 tablets

### Combining Tablets

Combine 3 tablets to create a higher-rarity tablet:

```
Combine 3 Common tablets → 1 Uncommon tablet
Combine 3 Uncommon tablets → 1 Rare tablet
...
```

| Combine From | Cost |
|-------------|------|
| 3 Common → Uncommon | 500 cr |
| 3 Uncommon → Rare | 1,500 cr |
| 3 Rare → Epic | 5,000 cr |
| 3 Epic → Legendary | 15,000 cr |
| 3 Legendary → Mythic | 50,000 cr |

Combining 3 tablets of the **same type** creates a better version of that type.

---

## Leaderboards

Compare your progress against other pilots:

```
> leaderboard
=== LEADERBOARD OVERVIEW ===
Credits: 1. SpaceCowboy (2.5M) ...
Planets: 1. Nova7 (12) ...
Combat: 1. Rogue_Alpha (47 kills) ...
...

> leaderboard level
=== LEVEL RANKINGS ===
1. SpaceCowboy — Level 42 (Vice Admiral) — 89,200 XP
2. Nova7 — Level 38 (Rear Admiral) — 67,500 XP
...
```

### Categories

| Category | Ranked By |
|----------|----------|
| `credits` | Total wealth |
| `planets` | Planets owned |
| `combat` | Ships destroyed |
| `explored` | Sectors visited |
| `trade` | Units traded |
| `syndicate` | Member count & treasury |
| `level` | Player level, then XP |

Rankings refresh every **5 minutes**.

---

## Leveling Strategy

### Fastest XP Methods

| Method | XP Rate | Notes |
|--------|---------|-------|
| **Exploring new sectors** | 10 XP each | Fast early, slows as you run out of new sectors |
| **Selling commodities** | 5 XP/unit | 200 XP per full Freighter of 40 units |
| **Completing missions** | 50–1,000 XP | Best XP/effort ratio at higher tiers |
| **Combat kills** | 150 XP each | High XP but risky |
| **Claiming alien caches** | 200 XP | Rare but very rewarding |
| **Tier 4 crafting** | 50 XP each | Consistent once you have a level 5 planet |

### Early Game (Level 1-10)

Focus on **exploration** (10 XP/sector) and **trading** (2-5 XP/unit). Complete starter missions. Every new sector counts. Reach level 10 to unlock Tier 2 missions and tablet slot 2.

### Mid Game (Level 10-35)

**Trading** becomes the primary XP source. A Freighter selling 40 tech earns 200 XP per trip. Stack with **mission completion** for bonus XP. Start **crafting** for additional XP. Tier 3 missions unlock at level 20 with bigger XP rewards.

### Late Game (Level 35-100)

**Tier 4-5 missions** are the most efficient XP source (500-1,000 XP per completion). **Crafting** at level 50+ planets gives consistent 50 XP per Tier 4 craft. **Alien caches** (200 XP) and **combat** (150 XP per kill) supplement mission XP. The grind from 75-100 requires ~54,000 XP — about 100 Tier 5 missions or 10,800 trade units.

---

## Tips

- **Selling gives 2.5x more XP than buying** — always complete your trade loops
- **New sectors are free XP** — explore whenever you have spare energy
- **Achievements give one-time XP boosts** — check which ones you're close to completing
- **The Quick Study tablet** gives +5% XP multiplier — equip it early for compounding returns
- **Level 5 is the first major milestone** — unlocks the Corvette
- **Level 10 is the second** — Tier 2 missions and tablet slot 2
- **Don't ignore crafting XP** — Tier 4 crafts give 50 XP each and can be batch-produced
- **Combine common tablets aggressively** — 3 commons → 1 uncommon is always worth it

[← Back to Manual](../players-manual.md)
