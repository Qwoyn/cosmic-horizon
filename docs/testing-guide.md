# Cosmic Horizon - Gameplay Testing Guide

This guide walks through every game system for playtesting. Work through each test and use the checklist at the bottom to track progress.

---

## Creating Your Account

1. Go to the registration page
2. Choose a **username** (3-32 characters), enter your **email** and a **password** (8+ characters)
3. Pick a **race** — each has different starting bonuses:
   - **Muscarian** — +5% attack ratio, +2,000 bonus credits
   - **Vedic** — +10% scan range, +100 max energy
   - **Kalin** — +5% defense ratio, +10 weapon/engine energy
   - **Tar'ri** — +5% trade bonus, +5,000 bonus credits
4. You'll spawn at a random Star Mall sector with a starter ship and 10,000 credits
5. You can log in later with either your **username or email**

---

## The Interface

The game uses a panel-based UI with an interactive sector map, notification log, activity panels, and a persistent info sidebar.

### Layout Overview

| Area | Location | Contents |
|------|----------|----------|
| **Status Bar** | Top | Username, sector, energy, credits, cargo, ship type, level/rank |
| **Activity Bar** | Far left | 12 panel icons — click to switch active panel |
| **Sector Map** | Center-left (2/3) | Interactive SVG map with parallax starfield background |
| **Notification Log** | Center-right (1/3) | Color-coded game events with `[i]`, `[!]`, `[$]`, `[✓]`, `[★]`, `[⚔]`, `[⚠]` prefixes |
| **Active Panel** | Below map/log | Currently selected panel content (Nav, Trade, Combat, etc.) |
| **Scene Viewport** | Below panel | Animated pixel art scenes (ambient, docked, combat, etc.) |
| **Context Panel** | Right sidebar (280px) | Player profile, ship card, mini chat, command input |

### Activity Panels (12 total)

| Panel | Icon | Purpose |
|-------|------|---------|
| NAV MAP | 🗺️ | Sector info, adjacent sectors, LOOK/SCAN/WARP buttons |
| EXPLORE | 🔭 | Exploration tools |
| TRADE | 💰 | Outpost trading interface |
| COMBAT | ⚔️ | Combat controls |
| CREW | 👥 | Crew management |
| MISSIONS | 📋 | Mission board and active missions |
| PLANETS | 🌍 | Owned/discovered planets |
| GEAR | ⚙️ | Ship actions, inventory, tablets, crafting, upgrades |
| COMMS | 💬 | Full chat interface and mail |
| SYNDICATE | 🏛️ | Syndicate management |
| WALLET | 💎 | Wallet/credits |
| ACTIONS | ⚡ | Misc commands (status, achievements, ranks, help, notes, etc.) |

### Context Panel (Right Sidebar)

Always visible with four sections:
1. **Player Profile** — Race portrait, username, race, credits
2. **Ship Card** — Ship sprite, weapon/engine energy, hull HP bar, cargo breakdown (Cyr/Fd/Tc/Co)
3. **Mini Chat** — Channel tabs (Sector/Syndicate/Alliance), last 8 messages, input field
4. **Command Input** — `>` prompt with command history (up/down arrows)

### Getting Help

- `help` — View command categories
- `help <category>` — View commands in a category (e.g., `help trading`)
- `help <command>` — Detailed help for a specific command (e.g., `help buy`)
- `tips` — Contextual tips based on your current situation

---

## Command Reference

### Navigation

| Command | Alias | What it does |
|---|---|---|
| `move <sector_id>` | `m` | Travel to an adjacent sector (costs 1 energy) |
| `look` | `l` | See current sector contents (players, outposts, planets, events) |
| `scan` | `s` | Scan adjacent sectors (requires planetary scanner) |
| `map` | | View your explored sector map |
| `status` | `st` | Show your stats (energy, credits, cargo, ship) |

### Trading

| Command | Alias | What it does |
|---|---|---|
| `dock` | `d` | View outpost prices and stock |
| `buy <commodity> <qty>` | | Buy cargo from outpost |
| `sell <commodity> <qty>` | | Sell cargo to outpost |
| `eject <commodity> <qty>` | | Jettison cargo into space |

Commodities: **cyrillium**, **food**, **tech**

### Star Mall (must be at a Star Mall sector)

| Command | What it does |
|---|---|
| `mall` | View all Star Mall services |
| `dealer` | Browse ships for sale |
| `buyship <type>` | Purchase a ship |
| `store` | Browse the general store |
| `refuel <qty>` or `fuel <qty>` | Buy energy (10 credits per unit) |
| `garage` | View stored ships |
| `storeship` | Store current ship in garage |
| `retrieve <ship_id>` | Retrieve a stored ship |
| `salvage [ship_id]` | Salvage yard / sell a ship for credits |
| `cantina` | Hear a rumor |
| `intel` | Buy sector intelligence (500 credits) |

### Ship Upgrades (at Star Mall)

| Command | What it does |
|---|---|
| `upgrades` | Browse available ship upgrades |
| `install <name>` | Install an upgrade (accepts partial names, e.g., `install cargo`) |
| `shipupgrades` | View upgrades installed on current ship |
| `uninstall <install_id>` | Remove an upgrade |

### Planets

| Command | What it does |
|---|---|
| `land <planet_name>` | View planet details |
| `claim <planet_name>` | Claim an unclaimed planet |
| `colonize <planet_name> <qty>` | Deposit colonists |
| `collect <planet_name> <qty>` | Pick up colonists from seed planets |
| `upgrade <planet_name>` | Upgrade your planet (costs resources) |

### Combat (standard sectors only)

| Command | Alias | What it does |
|---|---|---|
| `fire <player> <energy>` | `f` | Attack another player |
| `flee` | | Attempt to escape combat |
| `cloak` | | Toggle cloaking (Shadow Runner only) |
| `combatlog` | | View recent combat history |
| `bounties` | | View active bounties |

### Social & Chat

| Command | Alias | What it does |
|---|---|---|
| `chat <message>` | `say` | Send a message to players in your sector |
| `leaderboard [category]` | `lb` | View rankings |

### Missions

| Command | What it does |
|---|---|
| `missionboard` | Browse available missions (at Star Mall) |
| `accept <template_id>` | Accept a mission |
| `missions` | View active missions |
| `missions completed` | View completed missions |
| `abandon <mission_id>` | Abandon a mission |
| `claimreward` | Claim completed mission rewards (at Star Mall) |

### Mail

| Command | What it does |
|---|---|
| `mail` | View inbox |
| `mail read <id>` | Read a message |
| `mail send <player> <subject> <body>` | Send a message |
| `mail delete <id>` | Delete a message |
| `mail sent` | View sent messages |

### Notes

| Command | Alias | What it does |
|---|---|---|
| `note <text>` | `n` | Save a personal note |
| `notes` | | List all notes |
| `notes search <term>` | | Search your notes |
| `note del <id>` | | Delete a note |

### Warp Gates

| Command | What it does |
|---|---|
| `warp [gate_id]` | Use a warp gate in current sector |
| `warp build <sector_id>` | Build a warp gate (syndicate officers) |
| `warp toll <gate_id> <amount>` | Set gate toll |
| `warp list` | View syndicate warp gates |

### Deployables

| Command | What it does |
|---|---|
| `deploy <item> [args]` | Deploy a mine, drone, buoy, or probe |

### Events

| Command | What it does |
|---|---|
| `investigate [event_id]` | Interact with a sector event/anomaly |

### Progression

| Command | Alias | What it does |
|---|---|---|
| `profile` | `p`, `rank`, `lvl` | View level, XP bar, rank, and level bonuses |
| `achievements` | `ach` | View earned and available achievements |
| `ranks` | | View all rank tiers and ship level gates |

### Utility

| Command | What it does |
|---|---|
| `help [category\|command]` | View help categories, category commands, or command details |
| `tips` | Contextual guidance based on your situation |
| `inventory` | View items in your inventory |
| `use <item_id> [args]` | Use an item from inventory |

---

## Gameplay Tests

### Test 1: Registration & Login

1. Register a new account
2. Verify you land on the game screen with status bar showing your username, sector, energy 500/500, credits
3. Verify context panel shows player profile with race portrait, ship card, mini chat, and command input
4. Log out (refresh and go to login page)
5. Log back in with your **username** — should work
6. Log out and log back in with your **email** — should also work
7. Try logging in with a wrong password — should be rejected

**Watch for:** Blank status bar, energy showing 0, context panel sections missing, no sector data loading.

---

### Test 2: Layout & Visual Polish

1. **Status bar** at top shows all stats with subtle ambient flicker (~30-50s intervals)
2. **Activity bar** on far left shows 12 panel icons — inactive icons shimmer subtly
3. **Sector map** fills left 2/3 of center area with parallax starfield + nebula background
4. **Notification log** fills right 1/3 of center area with "NOTIFICATION LOG" header and CLEAR button
5. **Context panel** (right sidebar) shows player profile, ship card, mini chat, command input
6. **Scene viewport** below panels shows ambient pixel art scene
7. Move mouse over sector map — star layers shift with parallax depth effect
8. Border corners pulse with accent color
9. Ship sprite in context panel has breathing glow

**Watch for:** Layout elements overlapping, parallax not working, sections missing, animations too fast or not playing.

---

### Test 3: Navigation & Exploration

1. Type `look` in command input — note your current sector and adjacent sectors
2. Type `move <adjacent_sector_id>` to travel
3. Verify sector changed in status bar and energy decreased by 1
4. Click adjacent sectors on the sector map to warp
5. Try the +/- zoom buttons on the map and drag to pan when zoomed
6. Hover over sector nodes — tooltip shows sector ID and type
7. Click the legend button — legend overlay toggles on/off
8. Try `move 99999` (non-adjacent) — should fail with an error
9. Open Nav panel — verify LOOK, SCAN, WARP buttons work
10. Use WARP input field to enter a sector number and click WARP

**Watch for:** Energy not decreasing, sector not updating, map not showing visited sectors, zoom/pan broken, tooltips mispositioned.

---

### Test 4: Star Mall Services

Must be at a Star Mall sector (your starting sector is one).

1. `mall` — view available services
2. `dealer` — view ships for sale (7 types)
3. `store` — browse general store items with prices
4. `cantina` — get a rumor, verify bar interior scene plays in viewport
5. `intel` — buy sector intelligence (costs 500 credits)
6. `refuel 10` — buy 10 energy (also test `fuel 10` alias)
7. `garage` — should be empty initially
8. `dock` at Star Mall — verify mall interior ambient scene with holographic displays

**Watch for:** "Not at a star mall" error when you are at one, credits not deducting, mall scene not showing.

---

### Test 5: Ship Purchase & Management

1. `dealer` — note prices and level gates (locked ships show `[Lv.X]`)
2. Try `buyship corvette` at level 1 — should fail with "Requires level 5"
3. `buyship scout` — buy a scout (no level gate)
4. `status` — verify new ship and credits deducted
5. Ship card in context panel updates with new ship type and stats
6. `storeship` — store ship in garage (at Star Mall)
7. `garage` — verify ship is listed
8. `retrieve <ship_id>` — get it back

**Watch for:** Buying with insufficient credits succeeding, locked ships purchasable, context panel not updating.

---

### Test 6: Trading

1. Navigate to a sector with an outpost (`look` to find one)
2. `dock` — view outpost prices and stock
3. Open Trade panel — verify trade table matches dock output
4. Buy a commodity that's in "sell" mode: `buy cyrillium 5`
5. Verify cargo breakdown updates in context panel ship card (Cyr count)
6. Navigate to another outpost and sell: `sell cyrillium 5`
7. Verify cargo empty and credits increased in both status bar and context panel

**Watch for:** Cargo breakdown not updating in ship card, incorrect credit math, Trade panel not syncing.

---

### Test 7: Planet Claiming & Colonization

1. Navigate around and find a sector with planets (`look` in each)
2. `land <planet_name>` — view planet details
3. `claim <planet_name>` — claim an unclaimed planet
4. Open Planets panel — verify planet appears in Owned tab
5. Find a seed planet (class S) and `collect <name> 5` to pick up colonists
6. Navigate back to your planet and `colonize <planet_name> 5`
7. `land <planet_name>` — verify colonist count
8. Click "Discovered" tab in Planets panel — verify all visited planets appear with ownership markers
9. Seed planets show `[seed world]` in `look`, cannot be claimed

**Watch for:** Claiming already-owned planets, Planets panel not updating, seed planets being claimable.

---

### Test 8: Combat (Two Players)

Open two browser windows and register two separate accounts.

1. **Player 1**: Navigate to a standard (non-protected) sector
2. **Player 2**: Navigate to the same sector
3. Both type `look` — should see each other
4. Open Combat panel — verify combat controls are available
5. **Player 1**: `fire <player2_name> 5`
6. **Player 2**: Check for combat notification in log, then verify damage in ship card HP bar
7. **Player 2**: `flee` — attempt to escape
8. Try firing in a **protected** sector — should be blocked

**Watch for:** Fire working in protected sectors, no damage shown in HP bar, flee always succeeding/failing.

---

### Test 9: Ship Destruction

1. Get both players in the same standard sector
2. Repeatedly fire at a player until their ship is destroyed
3. Destroyed player should end up in a dodge pod (0 weapons, 0 cargo, 20 engine)
4. Ship card in context panel should update to DodgePod
5. Check `combatlog` for the engagement record

**Watch for:** Ship never getting destroyed, no dodge pod, context panel not reflecting destruction.

---

### Test 10: Gear Panel & Ship Actions

1. Open Gear panel — verify 4 action buttons: CLOAK, REFUEL, EJECT, SELF-DESTRUCT
2. Click CLOAK — should fail unless in a Shadow Runner
3. Click REFUEL — should refuel (at Star Mall)
4. Click EJECT — first click shows confirmation, second click ejects cargo
5. Click SELF-DESTRUCT — double confirmation (first = "ARE YOU SURE?", second = "CONFIRM DESTRUCT")
6. Verify 4 tabs below: Items | Tablets | Crafting | Upgrades
7. Click Items tab — shows inventory
8. Click Upgrades tab (at Star Mall) — shows available ship upgrades

**Watch for:** Buttons not responding, confirmation states not working, tabs not switching.

---

### Test 11: Inventory & Items

1. Navigate to a Star Mall and `dock`
2. `store` — verify numbered items with prices, categories, and IDs
3. `purchase 1` (or `purchase fuel`) — verify item purchased and credits deducted
4. `inventory` — verify purchased items show with quantities and category tags
5. Open Gear panel → Items tab — verify same items displayed
6. Buy a deployable (e.g. mine): `purchase mine`
7. Navigate to a standard sector and `deploy` the mine — verify consumed from inventory
8. `use 1` — verify using a consumable by number works
9. `use probe` — verify using a consumable by name works

**Watch for:** Items not appearing, quantities not stacking, Gear panel Items tab not syncing.

---

### Test 12: Ship Upgrades

1. Navigate to a Star Mall
2. `upgrades` — browse available upgrades
3. Open Gear panel → Upgrades tab — verify same list
4. `install cargo` — install using a partial/friendly name (should match cargo_mk2)
5. `shipupgrades` — verify it's listed
6. Ship card in context panel — verify cargo capacity reflects the bonus
7. Try buying cargo at an outpost — free space should include upgrade bonus
8. `uninstall <install_id>` — remove it
9. Verify stats return to base values in ship card
10. `install xyz` — try a non-existent upgrade, should show error

**Watch for:** Stats not changing in ship card, cargo capacity not including bonus, fuzzy match not working.

---

### Test 13: Deployables

1. Purchase a deployable at the Star Mall store
2. Navigate to a standard sector
3. `deploy <item_type>` — deploy it
4. Navigate away and back, `look` — deployable should still be there
5. Nav panel shows deployed items in sector info

**Watch for:** Deploying in protected sectors, no energy cost, deploying without purchasing.

---

### Test 14: Bounties

1. `bounties` — view active bounties
2. Place a bounty on another player
3. The other player should see the bounty listed
4. Destroy the target's ship — bounty should auto-claim
5. Check `combatlog` for the record

**Watch for:** Bounty not appearing, reward not paying out on kill.

---

### Test 15: Missions & Quests

1. Navigate to a Star Mall sector
2. `missionboard` — browse available missions grouped by tier
3. Open Missions panel — verify same data
4. Tiers above your level show `[LOCKED - Requires Level X]`
5. `accept <template_id>` — accept a mission from unlocked tier
6. `missions` — verify it appears active with per-objective `[ ]` checkboxes and hints
7. Complete the objective — verify counts update, `[x]` on completion
8. Try accepting more than 5 missions — should fail
9. Try accepting from a locked tier — should be rejected

**Watch for:** Empty mission board, Missions panel not syncing, progress not updating, locked missions accepted.

---

### Test 16: Starter Missions (Post-Tutorial)

1. Register a new account and complete (or skip) the tutorial
2. After the post-tutorial lore sequence, verify a welcome message appears
3. `missions` — verify 3 starter missions are automatically assigned:
   - **Pathfinder** (visit 5 sectors, 1,000 cr reward)
   - **First Trades** (trade 10 units, 1,000 cr reward)
   - **Scanner Training** (2 scans, 500 cr reward)
4. Complete a starter mission and verify credits are awarded
5. Register another account and skip the tutorial — verify starter missions are still assigned

**Watch for:** Starter missions not appearing, duplicate missions on re-login, rewards not paying.

---

### Test 17: Mission Claims & Prerequisites

1. Complete a claim-at-mall mission — should show `PENDING CLAIM`
2. Move away from Star Mall — `claimreward` should error
3. At Star Mall, `claimreward` — rewards granted (credits + XP)
4. `cr` alias works for claimreward
5. Find a mission with a prerequisite — can't accept child until parent completed
6. Complete parent, then accept child — should work
7. `cantina talk` before "The Bartender's Trust" — bartender doesn't trust you
8. Complete "The Bartender's Trust" mission
9. `cantina talk` (or `ct`) — bartender interacts, may offer cantina mission

**Watch for:** Rewards auto-granted before claiming, prerequisite not checked, cantina unlocking early.

---

### Test 18: Sector Events

1. Navigate through sectors, checking `look` in each
2. Find a sector with an event/anomaly listed
3. Nav panel shows event alerts (resource events, alien cache, etc.)
4. `investigate` — interact with the event
5. Note the outcome (credits, cargo, or energy change) in notification log
6. `look` — event should be gone
7. `investigate` again — should fail

**Watch for:** Events persisting after investigation, no energy cost, alerts not showing in Nav panel.

---

### Test 19: Sector Chat & Mini Chat

1. Open two browser windows with two separate accounts
2. Navigate both to the same sector
3. **Player 1**: `chat hello!` — message appears in notification log and mini chat
4. **Player 2**: Should see Player 1's message in mini chat (context panel)
5. **Player 2**: Type message in mini chat input field and send — Player 1 should see it
6. Try `say hello` (alias) — should work the same
7. Test channel tabs in mini chat: Sector / Syndicate / Alliance
8. Open Comms panel — verify full chat interface with more history

**Watch for:** Own messages not appearing, messages in wrong channel, mini chat not scrolling to new messages.

---

### Test 20: Notification Log

1. Run several commands to generate log entries
2. Verify entries have color-coded prefixes:
   - `[i]` info (blue), `[!]` error (red), `[$]` trade (yellow)
   - `[✓]` success (green), `[★]` system (cyan), `[⚔]` combat (red), `[⚠]` warning (orange)
3. Verify faint horizontal scanline sweep animation
4. Click CLEAR — log should be empty
5. Run a command after clear — should work normally
6. Verify auto-scroll keeps newest entries visible

**Watch for:** Prefixes missing, colors wrong, clear not working, log not scrolling.

---

### Test 21: Actions Panel

1. Click ⚡ icon in activity bar — Actions panel opens
2. **Information section**: Click STATUS, ACHIEVEMENTS, RANKS, LEADERBOARD, COMBAT LOG — each triggers correct command
3. INTEL — enter a player name and click, verify lookup works
4. **Utility section**: Click HELP, TIPS, NOTES, EVENTS — each triggers correct command
5. CLEAR LOG — clears the notification log
6. **Crafting & Resources**: Click RESOURCES, RECIPES, TABLETS — each works

**Watch for:** Buttons not triggering commands, wrong command executed, panel not opening.

---

### Test 22: Player Messaging

1. `mail` — view inbox (should be empty)
2. `mail send <player> Hello | Testing the mail system!`
3. Other player: `mail` — should see the message
4. `mail read <message_id>` — read it
5. `mail sent` — view sent messages
6. `mail delete <message_id>` — delete a message

**Watch for:** Messages not arriving, read status not updating, deleted messages still showing.

---

### Test 23: Notes System

1. `note Trade route: sector 42 → 88, 12 cr/unit profit`
2. `notes` — verify note appears
3. `notes search trade` — should find the note
4. `note del <id>` — delete it
5. Open Actions panel → click NOTES — verify same data

**Watch for:** Notes not saving, search not finding matches, Actions panel button not working.

---

### Test 24: Leveling & Progression

1. Status bar shows level, rank, and XP
2. `profile` (or `p`, `rank`, `lvl`) — verify full progression display
3. Move to a **new** sector — verify +10 XP awarded in notification log
4. Move to an already-visited sector — verify no XP
5. `buy` and `sell` at outpost — verify trade XP in response
6. `claim` a planet — verify +75 XP
7. `investigate` an anomaly — verify +25 XP
8. Earn enough XP to level up — verify max_energy increases and bonuses display

**Watch for:** XP for revisiting sectors, missing XP on actions, max energy not increasing on level-up.

---

### Test 25: Achievements & Ranks

1. `achievements` (or `ach`) — verify locked/available achievements shown
2. Perform an action that triggers an achievement (explore sectors, make a trade)
3. `achievements` — verify it moved from LOCKED to EARNED
4. `ranks` — verify full rank tier table (21 tiers from Recruit to Cosmic Legend)
5. Verify ship level gates section matches `dealer` locked ships

**Watch for:** Achievements not unlocking, credit rewards not paying, rank table incomplete.

---

### Test 26: Leaderboards

1. `leaderboard` — view overview (top 5 per category)
2. `leaderboard credits` — view top 20 by credits
3. Try other categories: `planets`, `combat`, `explored`, `trade`, `syndicate`, `level`
4. Open Actions panel → click LEADERBOARD — same result

**Watch for:** Empty leaderboards after activity, incorrect rankings, duplicate entries.

---

### Test 27: Warp Gates

1. Create or join a syndicate
2. Navigate to a standard sector
3. `warp build <destination_sector_id>` — build a gate (requires credits + cargo)
4. Use the warp gate to travel
5. Nav panel shows warp gates with purple border and toll info
6. `warp toll <gate_id> 500` — set a toll
7. Have a non-syndicate player use the gate — toll should be charged

**Watch for:** Building without resources succeeding, toll not charging, Nav panel not showing gates.

---

### Test 28: Cloaking (Shadow Runner Only)

1. Purchase a Shadow Runner: `buyship stealth`
2. `cloak` — toggle on, verify cloak indicator in ship card
3. `cloak` — toggle off
4. Try cloaking in a different ship type — should fail
5. Try via Gear panel CLOAK button — same behavior

**Watch for:** Cloaking working on non-stealth ships, indicator not showing.

---

### Test 29: Energy Regeneration

1. Note energy via status bar and ship card
2. Spend some energy moving around
3. Wait 2-3 minutes
4. Verify energy increased in both status bar and ship card (1/min, or 2/min for new players in first 72 hours)

**Watch for:** Energy exceeding max, no regeneration happening, status bar and ship card out of sync.

---

### Test 30: Context Panel Sync

1. Perform a trade — verify credits update in both status bar and context panel profile
2. Take damage — verify hull HP bar updates in ship card
3. Move sectors — verify sector updates in status bar
4. Buy a ship — verify ship card updates (sprite, type, stats)
5. Use a fuel cell — verify energy bar updates
6. Load/sell cargo — verify cargo breakdown bars update (Cyr/Fd/Tc/Co)

**Watch for:** Status bar and context panel showing different values, delayed updates, stale data.

---

### Test 31: Star Mall Scenes

1. Navigate to a Star Mall sector and `dock` — verify:
   - Mall interior ambient scene with holographic displays in viewport
   - Welcome message with `=== STAR MALL ===` in notification log
2. `cantina` — verify bar interior scene plays
3. `undock` — verify ambient scene returns to normal space
4. Navigate to a non-mall outpost and `dock` — verify normal docked scene (no mall interior)

**Watch for:** Mall interior not showing, normal outpost showing mall interior, scenes not transitioning.

---

### Test 32: Help System

1. `help` — should show a compact list of ~14 categories (not a wall of commands)
2. `help trading` — should show trading commands with usage
3. `help combat` — should show combat commands
4. `help buy` — should show detailed help for the buy command
5. `help fakecmd` — should show "no detailed help" message
6. `?` — alias for help, should work the same
7. Open Actions panel → click HELP — same result
8. Open Actions panel → click TIPS — contextual tips based on situation

**Watch for:** Categories showing wrong commands, `help <command>` not working, crash on unknown input.

---

### Test 33: Edge Cases

Try each of these and verify you get a helpful error (not a crash):

- `move` with no argument
- `buy` with no arguments
- `fire` with no target
- `sell food 999999` (more than you have)
- `buy cyrillium 999999` (more than cargo space)
- Register with a duplicate username
- Register with a 3-character password
- Open an incognito window and try to access the game without logging in
- Rapidly click multiple panel icons — panels should switch cleanly
- Submit empty command in command input — nothing should happen

---

## Quick Smoke Test Checklist

### Account & Login
- [ ] Register a new player — spawns at Star Mall with starter ship
- [ ] Complete or skip tutorial — verify starter missions assigned
- [ ] After post-tutorial lore, verify welcome message appears
- [ ] Log out and log back in (try both username and email)

### Layout & UI
- [ ] Status bar at top shows username, sector, energy, credits, ship, level
- [ ] Activity bar on far left with 12 panel icons
- [ ] Sector map (left 2/3) with parallax starfield background
- [ ] Notification log (right 1/3) with color-coded prefixes and CLEAR button
- [ ] Context panel (right sidebar): profile, ship card, mini chat, command input
- [ ] Scene viewport shows ambient pixel art
- [ ] Mouse parallax on sector map background
- [ ] Ambient animations: status bar flicker, icon shimmer, border pulse, ship glow, scanlines

### Navigation
- [ ] `look` — see sector contents
- [ ] `move` to adjacent sector — energy decreases
- [ ] Click sector on map to warp
- [ ] Map zoom/pan works, hover tooltips on sectors, legend toggle
- [ ] Nav panel: LOOK, SCAN, WARP buttons all work
- [ ] Nav panel shows sector info, adjacent sectors, players, outposts, planets

### Trading & Economy
- [ ] `dock` at outpost — prices and stock shown
- [ ] Trade panel shows trade table
- [ ] `buy` commodity — cargo breakdown updates in ship card
- [ ] `sell` commodity — credits update in status bar and profile
- [ ] `store` at Star Mall — numbered items with prices
- [ ] `purchase` by number or name — credits deducted

### Ships & Gear
- [ ] `dealer` — locked ships show `[Lv.X]`, can't buy locked ships
- [ ] `buyship` — ship card in context panel updates
- [ ] `storeship` and `retrieve` — garage system works
- [ ] `upgrades` and `install cargo` — fuzzy match works, ship card reflects bonus
- [ ] `uninstall` — stats return to base values
- [ ] Gear panel: CLOAK, REFUEL, EJECT, SELF-DESTRUCT buttons with confirmations
- [ ] Gear panel tabs: Items, Tablets, Crafting, Upgrades all switch correctly
- [ ] `inventory` — items show with quantities

### Planets
- [ ] `land` on planet, `claim` it
- [ ] Planets panel: Owned tab shows claimed planets
- [ ] Planets panel: Discovered tab shows all visited planets with ownership markers
- [ ] Seed planet shows `[seed world]`, cannot be claimed
- [ ] `colonize` and `collect` colonists

### Combat
- [ ] `fire` works in standard sector, blocked in protected
- [ ] Damage shows in target's ship card HP bar
- [ ] `flee` returns success/failure
- [ ] Ship destruction → DodgePod in ship card
- [ ] `combatlog` shows engagement history

### Missions
- [ ] 3 starter missions assigned after tutorial
- [ ] `missionboard` — tiered grouping, locked tiers grayed out
- [ ] `accept` mission — `missions` shows per-objective checkboxes with hints
- [ ] Progress updates, `[x]` on completion
- [ ] `claimreward` at Star Mall works, `cr` alias works
- [ ] Prerequisite missions enforced
- [ ] `cantina talk` locked until gate mission completed

### Social & Communication
- [ ] Sector chat via command and mini chat input field
- [ ] Mini chat channel tabs: Sector / Syndicate / Alliance
- [ ] Comms panel: full chat interface
- [ ] `mail send` and `mail` for messaging
- [ ] `note` and `notes` — notes system works

### Actions Panel
- [ ] ⚡ icon opens Actions panel
- [ ] STATUS, ACHIEVEMENTS, RANKS, LEADERBOARD, COMBAT LOG buttons work
- [ ] INTEL lookup with player name input
- [ ] HELP, TIPS, NOTES, EVENTS, CLEAR LOG buttons work
- [ ] RESOURCES, RECIPES, TABLETS buttons work

### Progression
- [ ] `profile` shows level, XP bar, rank, bonuses
- [ ] New sector → +10 XP, revisit → no XP
- [ ] Trade, claim, investigate → XP awarded
- [ ] Level up → max energy increase
- [ ] `achievements` — earned/locked tracking
- [ ] `ranks` — 21 rank tiers
- [ ] `leaderboard` — multiple categories

### Events & Deployables
- [ ] Sector events found via `look` and Nav panel alerts
- [ ] `investigate` — event consumed, rewards granted
- [ ] `deploy` mine/drone/buoy — consumed from inventory
- [ ] `warp` gates work with tolls
- [ ] `bounties` — view and collect

### Help
- [ ] `help` — categories (not wall of text)
- [ ] `help <category>` — shows category commands
- [ ] `help <command>` — detailed help
- [ ] `tips` — contextual guidance

---

## Reporting Bugs

If you find a bug, please open an issue on GitHub:

**https://github.com/Qwoyn/cosmic-horizon/issues**

Include:
- What you were doing (command, button click, or panel interaction)
- What you expected to happen
- What actually happened
- Any error messages (check the browser console with F12 for details)
- Your browser and OS

---

## Tips

- New players get **double energy regeneration** for the first 72 hours
- Star Mall sectors are safe zones — no combat allowed
- The sector map shows icons for Star Malls, outposts, and planets
- You can zoom into the map with +/- buttons and drag to pan when zoomed
- Hover over sector nodes for tooltips with sector ID and type
- The context panel command input supports up/down arrow keys for command history
- Outposts buy and sell different commodities — check the mode column when you `dock`
- Seed planets (class S) are where you pick up colonists to populate your own planets
- Type `tips` anytime for contextual guidance based on your current situation
- Type `help <category>` to see commands in a specific area (e.g., `help trading`)
- Ship upgrades reflect immediately in the ship card — install a cargo upgrade and watch capacity increase
- You can install upgrades by partial name: `install cargo` instead of `install cargo_mk2`
- After completing the tutorial, check `missions` for 3 starter missions to earn early credits
- Use `fuel` as a shortcut for `refuel`
- Use the mini chat input in the context panel for quick messages — channel tabs switch between Sector/Syndicate/Alliance
- The Actions panel (⚡) gives button access to utility commands like status, achievements, help, and notes
