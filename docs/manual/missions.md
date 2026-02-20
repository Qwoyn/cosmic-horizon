# Missions & Quests

[← Back to Manual](../players-manual.md)

---

## Overview

Missions are structured objectives that pay credits and XP upon completion. They range from simple "visit 5 sectors" tasks to complex multi-step quests with prerequisites. The mission system has three sources: the **Mission Board** at Star Malls, **Starter Missions** assigned after the tutorial, and **Cantina Missions** from NPC bartenders.

---

## Mission Board

Every Star Mall has a mission board offering a rotating pool of missions:

```
> missionboard
=== MISSION BOARD ===

--- Tier 1 ---
[1] Pathfinder Scout (visit_sector) - Visit 10 sectors
    Reward: 2,000 cr + 75 XP
[2] Courier Run (deliver_cargo) - Deliver 20 cyrillium
    Reward: 3,000 cr + 100 XP

--- Tier 2 [LOCKED - Requires Level 10] ---
[3] Deep Space Survey (scan_sectors) - Scan 15 sectors
    Reward: 5,000 cr + 150 XP
...
```

### Accepting Missions

```
> accept 1
Mission accepted: Pathfinder Scout
Objectives:
  [ ] Visit 10 distinct sectors (0/10) — Hint: explore new territory
```

### Mission Limits

- **Maximum 5 active missions** at a time
- Pool refreshes every **30 minutes** with 6 random missions
- Some missions have **time limits** — check before accepting

---

## Mission Tiers

Missions are organized into 5 tiers that unlock as you level up:

| Tier | Required Level | Difficulty | Typical Rewards |
|------|---------------|------------|-----------------|
| 1 | Level 1 | Easy | 1,000–3,000 cr, 50–100 XP |
| 2 | Level 10 | Moderate | 3,000–8,000 cr, 100–200 XP |
| 3 | Level 20 | Challenging | 8,000–20,000 cr, 200–350 XP |
| 4 | Level 35 | Hard | 15,000–40,000 cr, 300–500 XP |
| 5 | Level 50 | Expert | 30,000–100,000 cr, 500–1,000 XP |

Higher tiers pay significantly more but require more work and often have prerequisites.

---

## Mission Types

### Visit Sector
Travel to a specified number of distinct sectors.

```
Objective: Visit 10 sectors (3/10)
Hint: Keep exploring — each new sector counts!
```

**Strategy:** Combine with exploration for double XP (10 XP per new sector + mission XP).

### Deliver Cargo
Sell a specific quantity of a commodity at any outpost.

```
Objective: Deliver 20 food to any outpost (8/20)
Hint: Buy food at a high-stock outpost, sell at another
```

**Strategy:** Plan your trade route to complete this alongside profitable trades.

### Trade Units
Buy or sell a total quantity of any goods. Both buying and selling count.

```
Objective: Trade 50 total units (22/50)
Hint: Any trade at any outpost counts
```

**Strategy:** The easiest mission type — just trade normally and it completes itself.

### Destroy Ship
Destroy other players' ships in combat.

```
Objective: Destroy 3 enemy ships (1/3)
Hint: Find players in standard sectors
```

**Strategy:** Check busy standard sectors. Target weaker ships. Have a strong combat ship.

### Colonize Planet
Deposit colonists on any planet you own.

```
Objective: Deposit 100 colonists (40/100)
Hint: Collect from seed planets, deposit on your claimed planets
```

**Strategy:** Use a Colony Ship (60 cargo) for maximum colonist hauling per trip.

### Scan Sectors
Perform sector scans. Requires a Planetary Scanner.

```
Objective: Scan 5 sectors (2/5)
Hint: Use the scan command in each sector
```

**Strategy:** Scan as you explore. Each scan reveals adjacent sector contents too.

---

## Mission Progress

Track your active missions:

```
> missions
=== ACTIVE MISSIONS ===

1. Pathfinder Scout (Tier 1)
   [x] Visit 5 sectors (5/5)
   [x] Visit 5 more sectors (10/10)
   Status: COMPLETE - rewards auto-claimed!
   Reward: 2,000 cr + 75 XP ✓

2. Trade Mogul (Tier 2)
   [x] Trade 30 units (30/30)
   [ ] Trade 20 more units (12/20)
   Status: IN PROGRESS
   Reward: 5,000 cr + 150 XP

3. Frontier Logistics (Tier 3)
   [x] Deliver 50 cyrillium (50/50)
   [x] Deliver 30 tech (30/30)
   Status: PENDING CLAIM - visit any Star Mall
   Reward: 15,000 cr + 300 XP
```

### Mission Statuses

| Status | Meaning |
|--------|---------|
| IN PROGRESS | Objectives not yet complete |
| COMPLETE | All objectives done, rewards auto-claimed |
| PENDING CLAIM | Objectives done, must claim at Star Mall |

---

## Claiming Rewards

Some missions (typically Tier 3+) require you to return to a Star Mall to claim your reward:

```
> claimreward
=== CLAIMABLE MISSIONS ===
[1] Frontier Logistics - 15,000 cr + 300 XP

> claimreward 1
Mission complete! Received 15,000 credits and 300 XP.
```

If only one mission is claimable, `claimreward` auto-claims it:

```
> claimreward
Mission complete! Received 15,000 credits and 300 XP.
```

**Alias:** `cr` works the same as `claimreward`

---

## Prerequisite Missions

Some missions require completing another mission first:

```
> missionboard
...
[5] Supply Chain Master (Tier 3) — Requires: "Interstellar Logistics" ← LOCKED
```

Complete the prerequisite mission first, then the locked mission becomes available.

### Prerequisite Chains

Some missions form chains where each unlocks the next:
1. Basic Trading Run (Tier 1)
2. → Interstellar Logistics (Tier 2)
3. → Supply Chain Master (Tier 3)
4. → Galactic Trade Baron (Tier 4)

Completing the full chain pays increasingly large rewards.

---

## Starter Missions

After completing (or skipping) the tutorial, you receive 3 starter missions automatically:

| Mission | Objective | Reward |
|---------|-----------|--------|
| **Pathfinder** | Visit 5 sectors | 1,000 cr |
| **First Trades** | Trade 10 units | 1,000 cr |
| **Scanner Training** | Scan 2 sectors | 500 cr |

These are auto-claim missions — rewards are granted immediately on completion. They teach the basics while giving you a financial boost.

---

## Cantina Missions

The cantina at Star Malls offers exclusive missions from the bartender NPC. Access requires completing the gate mission **"The Bartender's Trust"**.

### Unlocking the Cantina

1. At a Star Mall, check the mission board for "The Bartender's Trust" (Tier 2)
2. Accept and complete it (requires trading 100 units)
3. After completion, `cantina talk` (or `ct`) opens up bartender interactions

### Getting Cantina Missions

```
> cantina talk
The bartender leans in... "I've got a job for you. Interested?"
[Accept mission details...]
```

- **25% chance** the bartender offers a mission each time you talk
- Cantina missions are **exclusive** — they don't appear on the regular board
- They're repeatable and often involve unique objectives
- Accept them via the normal `accept` command

---

## Abandoning Missions

If you can't or don't want to complete a mission:

```
> abandon 2
Mission abandoned: Trade Mogul. No penalty.
```

There's no penalty for abandoning, but you lose all progress on that mission.

---

## Mission Strategy

### Early Game (Level 1-9)

- **Do all 3 starter missions first** — they're free money
- **Stack exploration missions** with your normal exploring — double-dip on XP
- **Trade missions are the easiest** — just trade normally
- Keep 1-2 mission slots free for opportunistic accepts

### Mid Game (Level 10-34)

- **Tier 2 missions unlock at level 10** — significant reward jump
- **Prioritize trade and delivery missions** — they align with your trading activities
- **Start working on prerequisite chains** — the payoffs compound
- **Unlock the cantina** — "The Bartender's Trust" requires 100 trade units, which you'll hit naturally

### Late Game (Level 35+)

- **Tier 4-5 missions pay massively** — 30,000–100,000 credits per mission
- **Combat missions become viable** with end-game ships
- **Claim-at-mall missions** require returning to a Star Mall — plan your routes
- **Complete prerequisite chains** for the biggest payouts

---

## Tips

- **Check the mission board every time you visit a Star Mall** — the pool refreshes every 30 minutes
- **Mission XP stacks with action XP** — trading for a mission earns both trade XP and mission completion XP
- **Don't hoard missions** — if you have 5 active and can't complete one, abandon it to make room
- **Cantina missions are the hidden gem** — exclusive content and good rewards
- **`missions completed`** shows your finished missions — useful for tracking what prerequisites you've met
- **Multi-objective missions** show per-objective progress with checkboxes — keep an eye on which parts are done

[← Back to Manual](../players-manual.md)
