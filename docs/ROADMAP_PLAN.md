# Cosmic Horizon Feature Roadmap

## Implementation Order

1. Quick Fixes (Items A-E)
2. Leveling System (Item F)
3. Mission Expansion (Item G)
4. NPC System (Item H)
5. Tablet System (Item I)
6. Single Player Mode (Item J)

---

## A. Fix Inventory System

### Problem
Purchased items don't appear in inventory. The root cause: the store buy handler
(`server/src/api/store.ts:60`) only inserts into `game_events` for **consumable** items
(probe, disruptor_torpedo, rache_device, cloaking_cell). Equipment items (jump_drive,
pgd, planetary_scanner) are applied directly to the ship. Deployable items
(mines, drones, buoys) are handled outside the inventory flow. Fuel cells are consumed
immediately on purchase.

The inventory endpoint (`GET /store/inventory`) queries `game_events WHERE read=false
AND event_type LIKE 'item:%'` — so only consumables that were purchased but not yet
used show up. This is technically working but confusing: buying a probe should show it,
and it does. The likely user-facing issue is:
- Deployables don't appear in inventory (they're stored elsewhere or applied immediately)
- Equipment doesn't appear (applied directly to ship)
- No quantity stacking for duplicate items

### Changes

#### Server: `server/src/api/store.ts`

1. **Deployable purchases** — currently deployables are purchased but the code may not
   insert them into `game_events`. Verify the buy handler inserts a `game_events` row
   for deployable category items. The `deploy` command should then consume the inventory
   entry (mark `read: true`) when the item is actually deployed.

2. **Inventory endpoint** — update `GET /store/inventory` to aggregate duplicate items:
   ```
   Group by event_type, return { itemId, name, quantity, category }
   ```
   Instead of returning each `game_events` row individually, group by `event_type` and
   return a count.

3. **Equipment tracking** — equipment items applied to the ship should be queryable.
   Add a `/store/equipment` endpoint or include equipped items in inventory response
   with an `equipped: true` flag, pulling from the `ships` table fields
   (`has_jump_drive`, etc.).

#### Client: `client/src/services/commands.ts`

4. **Show quantities** in inventory listing:
   ```
   [1] Probe              x3  (probe)
   [2] Halberd Mine       x1  (mine_halberd)
   ```

5. **Show equipped equipment** section:
   ```
   === INVENTORY ===
     [1] Probe              x3  (probe)
   === EQUIPPED ===
     Jump Drive             [installed on ship]
   ```

#### Files Modified
- `server/src/api/store.ts` — buy handler (deployable insertion), inventory endpoint (aggregation)
- `client/src/services/commands.ts` — inventory display formatting

---

## B. Planets Command (Owned Planets, Colonists, Production)

### New Command: `planets`

Shows all planets owned by the player with full details.

#### Server: New API Endpoint

Add `GET /api/planets/owned` in a new or existing route file:
```sql
SELECT p.*, s.sector_id
FROM planets p
JOIN sectors s ON p.sector_id = s.id
WHERE p.owner_id = :playerId
ORDER BY p.created_at
```

Response includes per-planet:
- name, planetClass, sectorId
- colonists count
- upgradeLevel
- cyrilliumStock, foodStock, techStock
- production rates (derived from planet class config in `server/src/config/planet-types.ts`)

#### Client: `client/src/services/commands.ts`

Add `case 'planets':` handler. Display format:
```
=== YOUR PLANETS ===
  [1] Terra Nova [H] Sector 42    Level 3
      Colonists: 12,500 | Cyr: 150 Food: 200 Tech: 80
      Production/tick: Cyr=5 Food=8 Tech=3
  [2] Frost Peak [F] Sector 87    Level 1
      Colonists: 2,100 | Cyr: 30 Food: 10 Tech: 50
      Production/tick: Cyr=2 Food=1 Tech=4
```

Store listing with `setLastListing` for planet IDs — but note these are not
sector-local, so action commands (claim, colonize, etc.) still require being
in the same sector.

#### Client: `client/src/services/api.ts`
Add `getOwnedPlanets` API call.

#### Files Modified
- `server/src/api/` — new endpoint for owned planets
- `client/src/services/api.ts` — new API function
- `client/src/services/commands.ts` — new `planets` command + help text

---

## C. Seed Planets Not Claimable

### Problem
Seed planets (planetClass 'S') may be claimable. They should be protected.

### Changes

#### Server: `server/src/api/` (planet claim handler)

1. Find the claim endpoint (likely in a planets or commands route).
2. Add validation: if `planet.planet_class === 'S'`, return 400 error:
   `"Seed planets cannot be claimed — they belong to the galaxy."`

#### Client: `client/src/services/commands.ts`

3. In the `look` command, suppress the `*unclaimed*` label for seed planets
   (planetClass 'S'). Show them as `[seed world]` instead:
   ```
   Planets: Seed World I [S] [seed world], Terra Nova [H] *unclaimed*
   ```

#### Files Modified
- `server/src/api/` — claim handler validation
- `client/src/services/commands.ts` — look command planet display

---

## D. Planet Commands Accept Numbers (from look)

### Problem
Planet commands (land, claim, colonize, collect, upgrade) require typing the full planet
name. Should accept numbered references from the `look` listing and substring matching.

### Changes

#### Client: `client/src/services/commands.ts`

1. **Update `look`** — number the planets in the display and call `setLastListing`:
   ```
   Planets:
     [1] Terra Nova [H] *unclaimed*
     [2] Frost Peak [F] (owned by Player1)
   ```
   ```typescript
   ctx.setLastListing(s.planets.map(p => ({ id: p.id, label: p.name })));
   ```

2. **Update all planet commands** (land, claim, colonize, collect, upgrade) to use
   `resolveItem()` against the sector's planet list:
   ```typescript
   case 'claim': {
     if (args.length < 1) { ctx.addLine('Usage: claim <name or #>', 'error'); break; }
     const planets = ctx.sector?.planets ?? [];
     const items = planets.map(p => ({ id: p.id, name: p.name }));
     const result = resolveItem(args.join(' '), items, ctx);
     if (result === null) { ctx.addLine('Planet not found in sector', 'error'); break; }
     if (result === 'ambiguous') break;
     // proceed with result.id
   }
   ```

3. **Colonize and collect** take `<planet> <quantity>` — the last numeric arg is the
   quantity, everything before it is the planet query. Handle the ambiguity:
   - If last arg is a number AND there are 2+ args, treat last as quantity
   - If only 1 arg and it's a number, treat as planet reference from listing
     (user must provide quantity separately — show usage hint)

#### Files Modified
- `client/src/services/commands.ts` — look numbering, all 5 planet commands refactored

---

## E. Star Mall Location Scenes

### Problem
Entering Star Mall services (cantina, dealer, garage, etc.) shows the ship scene.
Should show interior scenes per location. Ship scenes should only appear in space.

### Design

**Scene hierarchy:**
- **In space (undocked, no outpost):** Ship idle scene (existing `buildIdleSpaceScene`)
- **At outpost sector (undocked):** Outpost exterior (existing `buildIdleOutpostScene`)
- **Docked at non-mall outpost:** Docked scene (existing `buildIdleDockedScene`)
- **Docked at Star Mall:** Mall interior scene (NEW)
- **Running a service command (cantina, dealer, etc.):** Service-specific interior (NEW action scenes already partially exist — `buildCantinaScene`, `buildGarageScene`, `buildDealerScene`, etc.)

### Changes

#### Client: `client/src/config/scenes/`

1. **Create `mall-interior-scene.ts`** — ambient scene for when docked at a Star Mall.
   Shows a generic mall concourse/hub.

2. **Create or update service-specific scenes:**
   - `cantina-scene.ts` — seedy space bar interior (dark, neon, alien patrons, smoke).
     Currently exists but may show a ship. Update to show bar interior.
   - `garage-scene.ts` — hangar bay with ships
   - `dealer-scene.ts` — showroom floor
   - `salvage-scene.ts` — junkyard
   - `upgrade-scene.ts` — workshop/tech lab
   - `mission-board-scene.ts` — bulletin board area
   - `bounty-board-scene.ts` — bounty office
   - `refuel-scene.ts` — fuel depot

   Each scene: pixel art interior, ~4-6 second ambient loop.

3. **Update ambient scene logic** in `Game.tsx`:
   Currently `ambientScene` is computed in a `useMemo` based on docked state and
   sector contents. Add a check: if docked at a sector with `hasStarMall`, return
   `buildMallInteriorScene()` instead of `buildIdleDockedScene`.

   ```typescript
   if (game.player?.dockedAtOutpostId) {
     if (game.sector?.hasStarMall) {
       return buildMallInteriorScene(ctx);
     }
     return buildIdleDockedScene(ctx);
   }
   ```

4. **Service action scenes** already fire via `ctx.enqueueScene?.()` — these will
   overlay the ambient. The cantina, dealer, etc. scenes need interior artwork
   instead of ship-based scenes.

#### Files Modified
- `client/src/config/scenes/mall-interior-scene.ts` — new file
- `client/src/config/scenes/cantina-scene.ts` — update to bar interior
- `client/src/config/scenes/garage-scene.ts` — update to hangar
- `client/src/config/scenes/dealer-scene.ts` — update to showroom
- `client/src/config/scenes/salvage-scene.ts` — update to junkyard
- `client/src/config/scenes/upgrade-scene.ts` — update to workshop
- `client/src/config/scenes/refuel-scene.ts` — update to fuel depot
- `client/src/pages/Game.tsx` — ambient scene selection logic

---

## F. Leveling System

### Overview
100 levels with named ranks. XP earned from combat (most), missions, trading, and
exploration (least). Leveling unlocks tablet slots, ship access, mission tiers, and
stat bonuses. Achievements are a mix of visible goals and hidden surprises.

### Data Model

#### Server: New Migration — `player_progression`

```sql
CREATE TABLE player_progression (
  player_id     UUID PRIMARY KEY REFERENCES players(id),
  xp            BIGINT NOT NULL DEFAULT 0,
  level         INT NOT NULL DEFAULT 1,
  rank_title    VARCHAR(32) NOT NULL DEFAULT 'Recruit',
  -- Stat bonuses (cumulative from leveling)
  bonus_max_energy    INT NOT NULL DEFAULT 0,
  bonus_cargo         INT NOT NULL DEFAULT 0,
  bonus_weapon_power  INT NOT NULL DEFAULT 0,
  bonus_engine_power  INT NOT NULL DEFAULT 0,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### Server: New Migration — `achievements`

```sql
CREATE TABLE achievement_definitions (
  id            VARCHAR(64) PRIMARY KEY,   -- e.g., 'first_kill', 'trade_100k'
  name          VARCHAR(128) NOT NULL,
  description   TEXT NOT NULL,
  category      VARCHAR(32) NOT NULL,      -- 'combat', 'trade', 'exploration', 'missions'
  xp_reward     INT NOT NULL DEFAULT 0,
  hidden        BOOLEAN NOT NULL DEFAULT false,
  criteria      JSON NOT NULL              -- machine-readable unlock condition
);

CREATE TABLE player_achievements (
  id            UUID PRIMARY KEY,
  player_id     UUID NOT NULL REFERENCES players(id),
  achievement_id VARCHAR(64) NOT NULL REFERENCES achievement_definitions(id),
  unlocked_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(player_id, achievement_id)
);
```

#### XP Curve

Level N requires `floor(100 * N^1.8)` total XP. This creates a long grind:
- Level 10: ~6,310 XP
- Level 25: ~34,000 XP
- Level 50: ~118,000 XP
- Level 100: ~398,000 XP

#### XP Sources (relative weights)
- **Combat victory:** 50-200 XP (scales with opponent level)
- **Mission complete:** 30-150 XP (scales with difficulty)
- **Trade profit:** 1 XP per 100 credits profit
- **Exploration:** 5 XP per new sector visited, 20 XP per planet claimed

#### Rank Titles (sample at key levels)
```
1-4:   Recruit
5-9:   Spacer
10-14: Ensign
15-19: Pilot
20-29: Lieutenant
30-39: Captain
40-49: Commander
50-59: Commodore
60-69: Admiral
70-79: Fleet Admiral
80-89: Grand Admiral
90-99: Sovereign
100:   Cosmic Legend
```

#### Level-Up Rewards
- Every level: small stat bonus (+1 max energy, alternating +1 cargo/weapon/engine)
- Level 10: 1st tablet slot unlocked
- Level 30: 2nd tablet slot unlocked
- Level 60: 3rd tablet slot unlocked
- Ship access gates: corvette (5), cruiser (15), battleship (25), stealth (35), colony_ship (45)
- Mission tier gates: tier 2 (10), tier 3 (20), tier 4 (35), tier 5 (50)

### Server Implementation

#### XP Award Service: `server/src/engine/progression.ts`

Central function `awardXP(playerId, amount, source)`:
1. Update `player_progression.xp`
2. Check if new XP crosses level threshold
3. If level up: update level, rank_title, apply stat bonuses
4. Check achievement criteria against new state
5. Return `{ newXP, newLevel, leveledUp, achievementsUnlocked }`

Call this from:
- Combat resolution handler (after victory)
- Mission completion handler
- Trade handler (on profitable sale)
- Move handler (on visiting new sector)
- Planet claim handler

#### Achievement Checker: `server/src/engine/achievements.ts`

Function `checkAchievements(playerId)`:
- Query player stats (kills, trades, sectors explored, missions completed, etc.)
- Compare against `achievement_definitions.criteria`
- Insert any newly unlocked achievements into `player_achievements`
- Award XP for each unlocked achievement

### Client Implementation

#### New Commands
- **`profile`** — full view: level, XP bar, rank, achievements, stats
- **`achievements`** — list all visible + unlocked hidden achievements
- Update **`status`** to show level and rank inline:
  ```
  === PlayerName [Muscarian] ===
  Rank: Captain (Level 32) | XP: 45,200/52,000
  Sector: 42 | Energy: 150/200 | Credits: 125,000
  ```

#### Files Modified
- `server/src/db/migrations/` — 2 new migrations (progression, achievements)
- `server/src/engine/progression.ts` — new file, XP/level logic
- `server/src/engine/achievements.ts` — new file, achievement checker
- `server/src/engine/commands.ts` — hook XP awards into combat, trade, move
- `server/src/api/` — new endpoints for profile, achievements
- `client/src/services/api.ts` — new API calls
- `client/src/services/commands.ts` — profile, achievements commands, status update
- `server/src/db/seeds/` — seed achievement definitions

---

## G. Mission Expansion

### Overview
- 3 starter missions (already exist)
- 20 standard multiplayer missions (tiered with some linear chains, some parallel)
- 10 cantina-exclusive missions (unlocked via a gate mission + bartender/pay/random)
- All 4 mission types: delivery, combat, exploration, collection
- Max 3-5 active missions at once
- Detailed progress + hints
- Some missions require returning to any Star Mall to claim reward
- Rewards: mix of hand-crafted credits + XP + items (including tablets once available)

### Data Model Changes

#### Server: Migration — extend `mission_templates`

Add fields:
```sql
ALTER TABLE mission_templates ADD COLUMN tier INT NOT NULL DEFAULT 1;
ALTER TABLE mission_templates ADD COLUMN prerequisite_mission_id UUID REFERENCES mission_templates(id);
ALTER TABLE mission_templates ADD COLUMN source VARCHAR(32) NOT NULL DEFAULT 'board';
  -- 'board' = standard, 'cantina' = cantina-exclusive, 'starter' = tutorial
ALTER TABLE mission_templates ADD COLUMN requires_claim_at_mall BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE mission_templates ADD COLUMN reward_xp INT NOT NULL DEFAULT 0;
ALTER TABLE mission_templates ADD COLUMN reward_items JSON;  -- array of {itemId, quantity}
ALTER TABLE mission_templates ADD COLUMN hints JSON;  -- array of hint strings per objective
ALTER TABLE mission_templates ADD COLUMN sort_order INT NOT NULL DEFAULT 0;
```

#### Server: Migration — extend `player_missions`

Add fields:
```sql
ALTER TABLE player_missions ADD COLUMN objectives_detail JSON;
  -- per-objective progress: [{description, target, current, complete, hint}]
ALTER TABLE player_missions ADD COLUMN claim_status VARCHAR(16) DEFAULT 'auto';
  -- 'auto' = completes immediately, 'pending_claim' = must visit mall, 'claimed'
```

### Mission Tiers

**Tier 1 (Level 1-9):** 3 starter missions (existing) + 3 standard missions
- Mostly exploration and simple delivery

**Tier 2 (Level 10-19):** 5 missions
- Mix of delivery, combat, exploration
- First combat mission here

**Tier 3 (Level 20-34):** 5 missions
- Harder deliveries, multi-step objectives
- Some require claiming at Star Mall

**Tier 4 (Level 35-49):** 4 missions
- Combat-heavy, collection chains
- Prerequisite chains (complete mission X to unlock Y)

**Tier 5 (Level 50+):** 3 missions
- End-game difficulty, multi-objective
- Tablet rewards

**Cantina Missions (10 total):**
- Gate mission: "The Bartender's Trust" (tier 2, from standard board) — completing
  this unlocks cantina mission access
- After unlocking, cantina missions become available via:
  - Talking to bartender (new `talk bartender` sub-command in cantina)
  - Paying for intel (existing intel command, extended)
  - Random encounter (% chance each cantina visit to be offered a mission)
- Cantina missions span tiers 2-5 in difficulty
- Themed around underworld activities: smuggling, espionage, sabotage

### Active Mission Limit
- Max 5 active missions at once (configurable in server config)
- If at limit, `accept` returns: "You have too many active missions. Abandon one first."

### Progress Detail
Each mission stores per-objective progress:
```json
{
  "objectives": [
    {
      "description": "Deliver 5 Cyrillium to Sector 42",
      "target": 5,
      "current": 2,
      "complete": false,
      "hint": "Buy Cyrillium at outposts and travel to Sector 42"
    }
  ]
}
```

Displayed in `missions` command:
```
[1] Galactic Courier (deliver_cargo)
    [ ] Deliver 5 Cyrillium to Sector 42 (2/5)
        Hint: Buy Cyrillium at outposts and travel to Sector 42
    [x] Visit Star Mall in Sector 15 (1/1)
    Reward: 2,000 cr + 50 XP
    Status: Return to any Star Mall to claim
```

### Claim-at-Mall Mechanic
For missions with `requires_claim_at_mall = true`:
1. When all objectives complete, status changes to `pending_claim`
2. Player sees "Return to any Star Mall to claim" in mission listing
3. At a Star Mall, running `missionboard` or a new `claim` sub-command shows claimable
   missions
4. Player runs `claim <#>` (or a confirm) to receive rewards

### Server Implementation

#### Mission progress tracking: `server/src/engine/missions.ts`

Extend existing mission progress hooks:
- `onCargoDelivered(playerId, commodity, quantity, sectorId)` — check delivery missions
- `onSectorVisited(playerId, sectorId)` — check visit/explore missions
- `onCombatVictory(playerId, defeatedId)` — check combat missions
- `onPlanetColonized(playerId, planetId)` — check colonize missions
- `onTradeCompleted(playerId, commodity, quantity)` — check trade missions
- `onScanPerformed(playerId)` — check scan missions

Each hook updates `player_missions.objectives_detail` and checks completion.

### Files Modified
- `server/src/db/migrations/` — 1-2 new migrations (mission schema extensions)
- `server/src/db/seeds/` — seed 20 mission templates + 10 cantina missions
- `server/src/engine/missions.ts` — extended progress tracking
- `server/src/api/store.ts` or new `api/missions.ts` — claim endpoint
- `server/src/api/cantina.ts` or equivalent — bartender talk, mission reveal
- `client/src/services/commands.ts` — updated missions display, claim command, cantina talk
- `client/src/services/api.ts` — new API calls

---

## H. NPC System

### Overview
NPCs live on outposts and planets. ~1 NPC per 10-15 sectors. First encounter triggers
a cutscene in the viewport; subsequent visits allow dialogue choices. Some NPCs offer
ongoing services (trade, missions, info), others are story-only. Full relationship/
reputation system per NPC. Journal/contacts list to track met NPCs.

NPCs are instanced per player — same NPCs at same locations, but dialogue and reputation
tracked individually per player.

Factions: mix of faction-aligned and independent NPCs.
Visuals: race-based sprite templates with minor variations.

### Data Model

#### Server: Migration — `npc_definitions`

```sql
CREATE TABLE npc_definitions (
  id              VARCHAR(64) PRIMARY KEY,  -- e.g., 'bartender_zyx', 'trader_quinn'
  name            VARCHAR(64) NOT NULL,
  title           VARCHAR(64),              -- e.g., 'Bartender', 'Merchant'
  race            VARCHAR(32),              -- ties to race-based sprite template
  faction_id      VARCHAR(64),              -- nullable, for faction-aligned NPCs
  location_type   VARCHAR(16) NOT NULL,     -- 'outpost', 'planet', 'sector'
  location_id     VARCHAR(64),              -- sector_id, outpost_id, or planet_id
  dialogue_tree   JSON NOT NULL,            -- branching dialogue structure
  services        JSON,                     -- array of services offered
  first_encounter JSON NOT NULL,            -- cutscene/story data for first meeting
  sprite_config   JSON NOT NULL,            -- race template + variation params
  is_key_npc      BOOLEAN NOT NULL DEFAULT false
);
```

#### Server: Migration — `player_npc_state`

```sql
CREATE TABLE player_npc_state (
  id              UUID PRIMARY KEY,
  player_id       UUID NOT NULL REFERENCES players(id),
  npc_id          VARCHAR(64) NOT NULL REFERENCES npc_definitions(id),
  encountered     BOOLEAN NOT NULL DEFAULT false,
  reputation      INT NOT NULL DEFAULT 0,     -- -100 to +100
  dialogue_state  JSON,                       -- tracks where in dialogue tree
  last_visited    TIMESTAMP,
  notes           TEXT,                        -- player can add notes about NPC
  UNIQUE(player_id, npc_id)
);
```

#### Server: Migration — `factions`

```sql
CREATE TABLE factions (
  id              VARCHAR(64) PRIMARY KEY,
  name            VARCHAR(64) NOT NULL,
  description     TEXT,
  alignment       VARCHAR(16)               -- 'lawful', 'neutral', 'criminal'
);

-- Player faction reputation
CREATE TABLE player_faction_rep (
  player_id       UUID NOT NULL REFERENCES players(id),
  faction_id      VARCHAR(64) NOT NULL REFERENCES factions(id),
  reputation      INT NOT NULL DEFAULT 0,
  PRIMARY KEY(player_id, faction_id)
);
```

### Dialogue System

Dialogue trees stored as JSON:
```json
{
  "root": {
    "text": "Welcome, traveler. What brings you to my cantina?",
    "options": [
      {
        "label": "I'm looking for work.",
        "next": "work_branch",
        "requires": { "reputation": 0 }
      },
      {
        "label": "Just passing through.",
        "next": "casual_branch"
      },
      {
        "label": "I heard you know things...",
        "next": "intel_branch",
        "requires": { "reputation": 20 }
      }
    ]
  }
}
```

Options can have requirements (reputation level, items owned, missions completed).
Some options are hidden until requirements met.

### First Encounter Flow

1. Player enters sector/lands on planet with an unmet NPC
2. Server detects `player_npc_state.encountered = false` for this NPC
3. Returns NPC encounter data with the response
4. Client plays cutscene in viewport (pixel scene with NPC sprite + location bg)
5. Terminal shows intro dialogue text
6. After cutscene, marks `encountered = true`
7. Subsequent visits go straight to dialogue tree

### Client Commands

- **`talk [npc name or #]`** — interact with an NPC in current location
- **`contacts`** — show journal of all met NPCs with location, reputation, last visit
- **`contact <name>`** — show details for a specific NPC

### Viewport Integration

NPC scenes use race-based sprite templates:
- Each race (muscarian, vedic, kalin, tarri + NPC-only races) has a base sprite
- NPCs get color palette swaps and accessories (hats, scars, gear)
- Scene shows NPC sprite in their location context (bar, shop, planet surface)
- Dialogue appears in terminal, choices presented as numbered options

### Files Modified
- `server/src/db/migrations/` — 3 new migrations (npc_definitions, player_npc_state, factions)
- `server/src/db/seeds/` — seed NPC definitions, faction data
- `server/src/engine/npcs.ts` — new file, NPC encounter/dialogue logic
- `server/src/api/npcs.ts` — new file, NPC API endpoints
- `server/src/api/` — hook NPC encounter checks into sector entry, planet landing
- `client/src/services/api.ts` — new API calls
- `client/src/services/commands.ts` — talk, contacts commands
- `client/src/config/scenes/` — NPC encounter scenes, race sprite templates

---

## I. Tablet System

### Overview
Collectible upgrade tablets with 6 rarity tiers. Acquired from exploration and mission
rewards. Can combine same-tier to upgrade, or use special recipes. Provide stat boosts,
special abilities, and passive perks. 3 equip slots unlocked at levels 10, 30, 60.
Tradeable between players. Storage capacity scales with level. Costs credits to swap
equipped tablets. Dedicated `tablets` command plus visible in inventory.

### Data Model

#### Server: Migration — `tablet_definitions`

```sql
CREATE TABLE tablet_definitions (
  id              VARCHAR(64) PRIMARY KEY,  -- e.g., 'cargo_boost_common'
  name            VARCHAR(128) NOT NULL,
  description     TEXT NOT NULL,
  rarity          VARCHAR(16) NOT NULL,     -- common/uncommon/rare/epic/legendary/mythic
  category        VARCHAR(32) NOT NULL,     -- 'stat', 'ability', 'perk'
  effects         JSON NOT NULL,            -- {type: 'cargo', value: +2} or {type: 'shield', ...}
  combinable      BOOLEAN NOT NULL DEFAULT true,
  recipe_result   VARCHAR(64),              -- if combining specific tablets yields this
  icon            VARCHAR(32)               -- sprite reference
);
```

#### Server: Migration — `player_tablets`

```sql
CREATE TABLE player_tablets (
  id              UUID PRIMARY KEY,
  player_id       UUID NOT NULL REFERENCES players(id),
  tablet_id       VARCHAR(64) NOT NULL REFERENCES tablet_definitions(id),
  equipped_slot   INT,                      -- NULL = in storage, 1/2/3 = equipped slot
  acquired_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### Server: Migration — `tablet_recipes`

```sql
CREATE TABLE tablet_recipes (
  id              UUID PRIMARY KEY,
  input_tablets   JSON NOT NULL,            -- [{tabletId, quantity}]
  output_tablet   VARCHAR(64) NOT NULL REFERENCES tablet_definitions(id),
  credits_cost    INT NOT NULL DEFAULT 0
);
```

### Rarity Tiers
```
Common     — gray    — basic stat boosts (+1-2)
Uncommon   — green   — better stat boosts (+3-5)
Rare       — blue    — significant boosts (+5-8) or basic abilities
Epic       — purple  — strong abilities or multi-stat boosts
Legendary  — orange  — powerful unique abilities
Mythic     — red     — game-changing effects, extremely rare
```

### Combining System

**Same-tier merge:** 3x Common = 1x random Uncommon, 3x Uncommon = 1x random Rare, etc.
- Merge at any Star Mall using `combine` command
- Costs credits scaling with tier

**Recipe-based:** Specific combinations yield specific tablets:
- e.g., `Cargo Boost Rare` + `Engine Boost Rare` + `1000 cr` = `Swift Hauler Epic`
- Recipes discoverable through NPC hints, cantina intel, or exploration

### Storage Capacity
- Base: 5 tablets
- +1 per 5 levels (level 5: 6, level 10: 7, ... level 100: 25)
- Formula: `5 + floor(level / 5)`

### Equip/Swap Cost
- Swap cost: `rarity_multiplier * 500` credits
  - Common: 500, Uncommon: 1000, Rare: 1500, Epic: 2000, Legendary: 2500, Mythic: 3000
- Must be at a Star Mall to swap

### Trading
- New `trade tablet <player> <tablet#>` command
- Both players must be in same sector
- Confirm/accept flow similar to existing trade

### Acquisition Sources
- **Exploration:** sector events (anomalies) can drop tablets, weighted by rarity
  - Common: 30%, Uncommon: 25%, Rare: 20%, Epic: 15%, Legendary: 8%, Mythic: 2%
- **Mission rewards:** specific missions award specific tablets
  - Higher tier missions reward rarer tablets

### Client Commands
- **`tablets`** — show all owned tablets (storage + equipped)
- **`equip <tablet # or name> <slot 1-3>`** — equip a tablet
- **`unequip <slot 1-3>`** — unequip (costs credits)
- **`combine <tablet#> <tablet#> <tablet#>`** — merge 3 same-tier tablets
- **`recipes`** — show known recipes
- **`trade tablet <player> <tablet#>`** — offer trade

Display format:
```
=== TABLETS ===
  Equipped:
    [Slot 1] Cargo Boost MK2 (Rare) — +5 cargo holds
    [Slot 2] (empty, unlocks at Level 30)
    [Slot 3] (locked, unlocks at Level 60)
  Storage (4/7):
    [1] Shield Pulse (Common) — Absorb 1 hit per 5 min
    [2] Engine Boost (Common) — +1 engine power
    [3] Trade Luck (Uncommon) — +3% trade profit
    [4] Cargo Boost (Common) — +2 cargo holds
```

### Files Modified
- `server/src/db/migrations/` — 3 new migrations
- `server/src/db/seeds/` — tablet definitions, recipes
- `server/src/engine/tablets.ts` — new file, combine/equip/effect logic
- `server/src/api/tablets.ts` — new file, tablet API endpoints
- `server/src/engine/` — hook tablet effects into combat, trade, movement calculations
- `client/src/services/api.ts` — new API calls
- `client/src/services/commands.ts` — tablets, equip, unequip, combine, recipes commands

---

## J. Single Player Mode

### Overview
Standalone mode with 200 sectors, fixed seed (same universe for all players).
Static NPC encounters (not free-roaming AI). 20 standalone missions. Star Malls
unlock through mission progress. Progression carries over to multiplayer.
On completion, prompt to join multiplayer.

### Architecture

#### Server: Game Mode Flag

Add `game_mode` field to `players` table:
```sql
ALTER TABLE players ADD COLUMN game_mode VARCHAR(16) NOT NULL DEFAULT 'multiplayer';
  -- 'singleplayer', 'multiplayer'
```

#### Server: SP Universe Generation

New seed file: `server/src/db/seeds/sp_universe.ts`
- Fixed seed (e.g., seed 1337) for deterministic 200-sector universe
- Same generation algorithm as multiplayer but with:
  - 200 sectors
  - 2-3 Star Malls (initially locked, unlock flags in sector data)
  - NPCs pre-placed at outposts and planets
  - Sector events seeded for tablet drops

SP sectors stored in same `sectors` table but with a namespace/flag:
```sql
ALTER TABLE sectors ADD COLUMN universe VARCHAR(16) NOT NULL DEFAULT 'multiplayer';
  -- 'singleplayer', 'multiplayer'
```

Or alternatively, SP uses a separate database/schema to keep it fully isolated.

#### Star Mall Unlocking

Star Malls start as `locked = true` in SP. Mission completions toggle them:
- Mission 5 completion: unlock Star Mall 1
- Mission 12 completion: unlock Star Mall 2
- Mission 18 completion: unlock Star Mall 3

Locked malls show in `look` as "Star Mall [LOCKED] — complete more missions to unlock"

#### SP Missions (20 total)

Standalone objectives spanning all mission types:
```
Tier 1 (Missions 1-5): Tutorial-adjacent
  1. Scout's Path — Visit 10 sectors
  2. First Haul — Buy and sell 5 cargo at different outposts
  3. Staking Claim — Claim your first planet
  4. Colony Seed — Colonize a planet with 100 colonists
  5. Mall Rat — Visit the newly unlocked Star Mall
     [UNLOCKS: Star Mall 1]

Tier 2 (Missions 6-10): Building up
  6. Upgrade Path — Upgrade your planet to level 2
  7. Armed & Ready — Install your first ship upgrade
  8. NPC Contact — Talk to 3 different NPCs
  9. Trade Route — Earn 10,000 credits from trading
  10. Deep Space — Explore 50 sectors

Tier 3 (Missions 11-15): Mid-game
  11. Fleet Builder — Own 2 ships
  12. Mall Network — Complete to unlock Star Mall 2
      [UNLOCKS: Star Mall 2]
  13. Combat Training — Defeat 3 NPCs in combat
  14. Resource Empire — Own 3 planets
  15. Scanner Expert — Use 5 probes

Tier 4 (Missions 16-20): End-game
  16. Capital Ship — Purchase a battleship or better
  17. Production Master — Reach 100 colonists on 3 planets
  18. Full Network — Unlock final Star Mall
      [UNLOCKS: Star Mall 3]
  19. Tablet Hunter — Find and equip 3 tablets
  20. Frontier Ready — Reach Level 15
      [COMPLETION: Prompt to join multiplayer]
```

#### Multiplayer Transition

When mission 20 is complete:
1. Show completion scene/cutscene
2. Display: "The frontier awaits. Your progress will carry over. Join multiplayer?"
3. On confirm:
   - Set `game_mode = 'multiplayer'`
   - Keep: level, XP, achievements, credits, tablets, ship upgrades
   - Reset: sector position (spawn at MP starting sector), planet ownership (SP planets
     don't exist in MP)
   - Keep ships in garage
4. Player can also choose to continue playing SP indefinitely

#### Static NPC Encounters

SP NPCs are the same NPC system (Item H) but pre-placed during SP universe generation.
~15-20 NPCs across the 200 sectors. Some tied to missions (mission 8 requires talking
to 3 NPCs). NPCs in SP use the same dialogue/reputation system.

### Files Modified
- `server/src/db/migrations/` — game_mode field, universe field on sectors
- `server/src/db/seeds/sp_universe.ts` — new file, SP universe generation
- `server/src/db/seeds/sp_missions.ts` — new file, 20 SP mission templates
- `server/src/engine/sp.ts` — new file, SP-specific logic (mall unlocking, transition)
- `server/src/api/` — SP game mode checks, transition endpoint
- `client/src/services/commands.ts` — SP completion flow
- `client/src/pages/Game.tsx` — SP/MP mode awareness
- `client/src/components/` — SP completion UI, mode selector

---

## Dependency Graph

```
A (Inventory Fix) ──────────────────────────────────────────► standalone
B (Planets Command) ────────────────────────────────────────► standalone
C (Seed Planet Guard) ──────────────────────────────────────► standalone
D (Planet Numbering) ───────────────────────────────────────► standalone
E (Mall Scenes) ────────────────────────────────────────────► standalone

F (Leveling System) ────► G (Mission Expansion) ──┐
                    ├───► I (Tablet System) ───────┤
                    │                              ▼
                    └───► H (NPC System) ────► J (Single Player Mode)
```

Items A-E have no dependencies and can be done in any order.
F (Leveling) must come before G, H, I, J.
G (Missions) and H (NPCs) can be done in parallel after F.
I (Tablets) needs F.
J (Single Player) needs F + G + H + I.
