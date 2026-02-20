# Cosmic Horizon - Gameplay Testing Guide

This guide walks through every game system for playtesting. Work through each test and use the checklist at the bottom to track progress.

---

## Creating Your Account

1. Go to the registration page
2. Choose a **username** (3-32 characters), enter your **email** and a **password** (8+ characters)
3. Pick a **race** — each has different starting bonuses:
   - **Muscarian** — extra combat strength
   - **Vedic** — extra energy capacity
   - **Kalin** — extra starting credits
   - **Tar'ri** — extra cargo space
4. You'll spawn at a random Star Mall sector with a starter ship and 10,000 credits
5. You can log in later with either your **username or email**

---

## How to Play

The game uses a panel-based UI with a command input at the bottom of the context panel (right sidebar). You can interact via typed commands or by using buttons in the activity panels.

**Getting help:**
- `help` — View command categories at a glance
- `help <category>` — View commands in a category (e.g., `help trading`)
- `help <command>` — Detailed help for a specific command (e.g., `help buy`)
- `tips` — Contextual tips based on your current situation

### Command Categories

#### Navigation

| Command | Alias | What it does |
|---|---|---|
| `move <sector_id>` | `m` | Travel to an adjacent sector (costs 1 energy) |
| `look` | `l` | See current sector contents (players, outposts, planets, events) |
| `scan` | `s` | Scan adjacent sectors (requires planetary scanner) |
| `map` | | View your explored sector map |
| `status` | `st` | Show your stats (energy, credits, cargo, ship) |

#### Trading

| Command | Alias | What it does |
|---|---|---|
| `dock` | `d` | View outpost prices and stock |
| `buy <commodity> <qty>` | | Buy cargo from outpost |
| `sell <commodity> <qty>` | | Sell cargo to outpost |
| `eject <commodity> <qty>` | | Jettison cargo into space |

Commodities: **cyrillium**, **food**, **tech**

#### Star Mall (must be at a Star Mall sector)

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

#### Ship Upgrades (at Star Mall)

| Command | What it does |
|---|---|
| `upgrades` | Browse available ship upgrades |
| `install <name>` | Install an upgrade (accepts partial names, e.g., `install cargo`) |
| `shipupgrades` | View upgrades installed on current ship |
| `uninstall <install_id>` | Remove an upgrade |

#### Planets

| Command | What it does |
|---|---|
| `land <planet_name>` | View planet details |
| `claim <planet_name>` | Claim an unclaimed planet |
| `colonize <planet_name> <qty>` | Deposit colonists |
| `collect <planet_name> <qty>` | Pick up colonists from seed planets |
| `upgrade <planet_name>` | Upgrade your planet (costs resources) |

#### Combat (standard sectors only)

| Command | Alias | What it does |
|---|---|---|
| `fire <player> <energy>` | `f` | Attack another player |
| `flee` | | Attempt to escape combat |
| `cloak` | | Toggle cloaking (Shadow Runner only) |
| `combatlog` | | View recent combat history |
| `bounties` | | View active bounties |

#### Social & Chat

| Command | Alias | What it does |
|---|---|---|
| `chat <message>` | `say` | Send a message to players in your sector |
| `leaderboard [category]` | `lb` | View rankings |

#### Missions

| Command | What it does |
|---|---|
| `missionboard` | Browse available missions (at Star Mall) |
| `accept <template_id>` | Accept a mission |
| `missions` | View active missions |
| `missions completed` | View completed missions |
| `abandon <mission_id>` | Abandon a mission |
| `claimreward` | Claim completed mission rewards (at Star Mall) |

#### Mail

| Command | What it does |
|---|---|
| `mail` | View inbox |
| `mail read <id>` | Read a message |
| `mail send <player> <subject> <body>` | Send a message |
| `mail delete <id>` | Delete a message |
| `mail sent` | View sent messages |

#### Notes

| Command | Alias | What it does |
|---|---|---|
| `note <text>` | `n` | Save a personal note |
| `notes` | | List all notes |
| `notes search <term>` | | Search your notes |
| `note del <id>` | | Delete a note |

#### Warp Gates

| Command | What it does |
|---|---|
| `warp [gate_id]` | Use a warp gate in current sector |
| `warp build <sector_id>` | Build a warp gate (syndicate officers) |
| `warp toll <gate_id> <amount>` | Set gate toll |
| `warp list` | View syndicate warp gates |

#### Deployables

| Command | What it does |
|---|---|
| `deploy <item> [args]` | Deploy a mine, drone, buoy, or probe |

#### Events

| Command | What it does |
|---|---|
| `investigate [event_id]` | Interact with a sector event/anomaly |

#### Progression

| Command | Alias | What it does |
|---|---|---|
| `profile` | `p`, `rank`, `lvl` | View level, XP bar, rank, and level bonuses |
| `achievements` | `ach` | View earned and available achievements |
| `ranks` | | View all rank tiers and ship level gates |

#### Utility

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
3. Log out (refresh and go to login page)
4. Log back in with your **username** — should work
5. Log out and log back in with your **email** — should also work
6. Try logging in with a wrong password — should be rejected

**Watch for:** Blank status bar, energy showing 0, no sector data loading.

---

### Test 2: Navigation & Exploration

1. Type `look` — note your current sector and adjacent sectors
2. Type `move <adjacent_sector_id>` to travel
3. Type `status` to verify sector changed and energy decreased by 1
4. Click adjacent sectors on the sector map to warp
5. Try the +/- zoom buttons on the map and drag to pan when zoomed
6. Try `move 99999` (non-adjacent) — should fail with an error

**Watch for:** Energy not decreasing, sector not updating, map not showing visited sectors, zoom/pan not working.

---

### Test 3: Star Mall Services

Must be at a Star Mall sector (your starting sector is one).

1. `mall` — view available services
2. `dealer` — view ships for sale (7 types)
3. `store` — browse general store items
4. `cantina` — get a rumor
5. `intel` — buy sector intelligence (costs 500 credits)
6. `refuel 10` — buy 10 energy
7. `garage` — should be empty initially

**Watch for:** "Not at a star mall" error when you are at one, credits not deducting after purchases.

---

### Test 4: Ship Purchase & Management

1. `dealer` — note prices
2. Try buying a ship you can't afford — should fail
3. `buyship scout` — buy a scout (5,000 credits)
4. `status` — verify new ship and credits deducted
5. `storeship` — store ship in garage (at Star Mall)
6. `garage` — verify ship is listed
7. `retrieve <ship_id>` — get it back

**Watch for:** Buying with insufficient credits succeeding, status not reflecting new ship.

---

### Test 5: Trading

1. Navigate to a sector with an outpost (`look` to find one)
2. `dock` — view outpost prices and stock
3. Buy a commodity that's in "sell" mode: `buy cyrillium 5`
4. `status` — verify cargo updated and credits deducted
5. Navigate to another outpost and sell: `sell cyrillium 5`
6. `status` — verify cargo empty and credits increased

**Watch for:** Cargo not updating, incorrect credit math, buying commodities the outpost doesn't sell.

---

### Test 6: Planet Claiming & Colonization

1. Navigate around and find a sector with planets (`look` in each)
2. `land <planet_name>` — view planet details
3. `claim <planet_name>` — claim an unclaimed planet
4. Find a seed planet (class S) and `collect <name> 5` to pick up colonists
5. Navigate back to your planet and `colonize <planet_name> 5`
6. `land <planet_name>` — verify colonist count

**Watch for:** Claiming already-owned planets succeeding, colonist cargo not updating.

---

### Test 7: Combat (Two Players)

Open two browser windows and register two separate accounts.

1. **Player 1**: Navigate to a standard (non-protected) sector
2. **Player 2**: Navigate to the same sector
3. Both type `look` — should see each other
4. **Player 1**: `fire <player2_name> 5`
5. **Player 2**: Check for combat notification, then `status` to verify damage
6. **Player 2**: `flee` — attempt to escape
7. Try firing in a **protected** sector — should be blocked

**Watch for:** Fire working in protected sectors, no damage being dealt, flee always succeeding/failing.

---

### Test 8: Ship Destruction

1. Get both players in the same standard sector
2. Repeatedly fire at a player until their ship is destroyed
3. Destroyed player should end up in a dodge pod (0 weapons, 0 cargo, 20 engine)
4. Check `combatlog` for the engagement record

**Watch for:** Ship never getting destroyed, no dodge pod spawning, player unable to move after destruction.

---

### Test 9: Deployables

1. Purchase a deployable at the Star Mall store: `store` then buy a mine or drone
2. Navigate to a standard sector
3. `deploy <item_type>` — deploy it
4. Navigate away and back, `look` — deployable should still be there

**Watch for:** Deploying in protected sectors, no energy cost, deploying without purchasing.

---

### Test 10: Bounties

1. `bounties` — view active bounties
2. Place a bounty on another player (via the bounty system)
3. The other player should see the bounty listed
4. Destroy the target's ship — bounty should auto-claim
5. Check `combatlog` for the record

**Watch for:** Bounty not appearing, reward not paying out on kill.

---

### Test 11: Missions & Quests

1. Navigate to a Star Mall sector
2. `missionboard` — browse available missions
3. `accept <template_id>` — accept a mission
4. `missions` — verify it appears as active with progress
5. Complete the objective (e.g., move to a specific sector, trade a commodity)
6. Check that rewards are granted on completion
7. Try accepting more than 5 missions — should fail

**Watch for:** Empty mission board, progress not updating, rewards not paying.

---

### Test 12: Starter Missions (Post-Tutorial)

1. Register a new account and complete (or skip) the tutorial
2. After the post-tutorial lore sequence, verify a welcome message appears with getting-started guidance
3. `missions` — verify 3 starter missions are automatically assigned:
   - **Pathfinder** (visit 5 sectors, 1,000 cr reward)
   - **First Trades** (trade 10 units, 1,000 cr reward)
   - **Scanner Training** (2 scans, 500 cr reward)
4. Complete a starter mission and verify credits are awarded
5. Register another account and skip the tutorial — verify starter missions are still assigned

**Watch for:** Starter missions not appearing, duplicate missions on re-login, rewards not paying.

---

### Test 13: Sector Events

1. Navigate through sectors, checking `look` in each
2. Find a sector with an event/anomaly listed
3. `investigate` — interact with the event
4. Note the outcome (credits, cargo, or energy change)
5. `look` — event should be gone
6. `investigate` again — should fail

**Watch for:** Events persisting after investigation, no energy cost.

---

### Test 14: Leaderboards

1. `leaderboard` — view overview (top 5 per category)
2. `leaderboard credits` — view top 20 by credits
3. Try other categories: `planets`, `combat`, `explored`, `trade`, `syndicate`, `level`

**Watch for:** Empty leaderboards after activity, incorrect rankings, duplicate entries.

---

### Test 15: Player Messaging

1. `mail` — view inbox (should be empty)
2. `mail send <player> Hello | Testing the mail system!`
3. Other player: `mail` — should see the message
4. `mail read <message_id>` — read it
5. `mail sent` — view sent messages
6. `mail delete <message_id>` — delete a message

**Watch for:** Messages not arriving, read status not updating, deleted messages still showing.

---

### Test 16: Ship Upgrades

1. Navigate to a Star Mall
2. `upgrades` — browse available upgrades
3. `install cargo` — install using a partial/friendly name (should match cargo_mk2)
4. `shipupgrades` — verify it's listed
5. `status` — verify stats reflect the bonus (cargo capacity should be increased)
6. Try buying cargo at an outpost — free space should reflect the upgraded capacity
7. `uninstall <install_id>` — remove it
8. `status` — verify stats return to base values
9. `install xyz` — try a non-existent upgrade, should show error
10. If multiple upgrades match a search term, verify disambiguation list is shown

**Watch for:** Stats not changing after install, cargo capacity not including upgrade bonus when buying/selling, fuzzy match not working.

---

### Test 17: Warp Gates

1. Create or join a syndicate
2. Navigate to a standard sector
3. `warp build <destination_sector_id>` — build a gate (requires credits + cargo)
4. Use the warp gate to travel
5. `warp toll <gate_id> 500` — set a toll
6. Have a non-syndicate player use the gate — toll should be charged

**Watch for:** Building without resources succeeding, toll not charging non-members.

---

### Test 18: Cloaking (Shadow Runner Only)

1. Purchase a Shadow Runner: `buyship stealth`
2. `cloak` — toggle on
3. `cloak` — toggle off
4. Try cloaking in a different ship type — should fail

**Watch for:** Cloaking working on non-stealth ships.

---

### Test 19: Energy Regeneration

1. Note energy via `status`
2. Spend some energy moving around
3. Wait 2-3 minutes
4. `status` — energy should have increased (1/min, or 2/min for new players in first 72 hours)

**Watch for:** Energy exceeding max, no regeneration happening.

---

### Test 20: Edge Cases

Try each of these and verify you get a helpful error (not a crash):

- `move` with no argument
- `buy` with no arguments
- `fire` with no target
- `sell food 999999` (more than you have)
- `buy cyrillium 999999` (more than cargo space)
- Register with a duplicate username
- Register with a 3-character password
- Open an incognito window and try to access the game without logging in

---

### Test 21: Help System

1. `help` — should show a compact list of ~14 categories (not a wall of commands)
2. `help trading` — should show trading commands with usage
3. `help navigation` — should show nav commands
4. `help combat` — should show combat commands
5. `help buy` — should show detailed help for the buy command
6. `help fakecmd` — should show "no detailed help" message
7. `?` — alias for help, should work the same
8. Try all categories: navigation, trading, combat, planets, ships, upgrades, store, deploy, missions, social, mail, notes, warp, events

**Watch for:** Categories showing wrong commands, `help <command>` not working, crash on unknown input.

---

### Test 22: Sector Chat

1. Open two browser windows with two separate accounts
2. Navigate both to the same sector
3. **Player 1**: `chat hello!` — should see the message in mini chat
4. **Player 2**: Should see Player 1's message appear
5. **Player 2**: `chat hi back!` — Player 1 should see it
6. Try `say hello` (alias) — should work the same as chat
7. Test channel switching in mini chat (Sector/Syndicate/Alliance tabs)

**Watch for:** Own messages not appearing, duplicate messages, messages appearing in wrong sectors/channels.

---

### Test 23: Notification Log

1. Run several commands to generate log entries
2. Verify log entries have color-coded prefixes ([i], [!], [$], etc.)
3. Click CLEAR — log should be empty
4. Run a command after clear — should work normally
5. Verify auto-scroll keeps newest entries visible

**Watch for:** Clear not working, prefixes missing, log not scrolling to bottom.

---

### Test 24: Inventory System

1. Navigate to a Star Mall and `dock`
2. `store` — verify numbered items with prices, categories, and IDs
3. `purchase 1` (or `purchase fuel`) — verify item purchased and credits deducted
4. `inventory` — verify purchased items show with quantities and category tags
5. Buy a deployable (e.g. mine): `purchase mine` — verify it appears in inventory
6. Navigate to a standard sector and `deploy` the mine — verify it's consumed from inventory
7. `use 1` — verify using a consumable by number works
8. `use probe` — verify using a consumable by name works

**Watch for:** Items not appearing after purchase, quantities not stacking, deploy not consuming inventory item.

---

### Test 25: Planets Panel & Commands

1. Own at least one planet (claim one from a sector with unclaimed planets)
2. `planets` — verify output shows name, class, sector, level, colonists, stocks, and production
3. Click the Planets icon in the activity bar — verify the panel shows the same data
4. `planets all` — verify discovered planets view shows ownership markers (`[YOURS]`, owner name, or `*unclaimed*`)
5. In the Planets panel, click "Discovered" tab — verify all visited planets appear
6. Seed planets show `[seed world]` in `look`, cannot be claimed
7. `land 1` — planet commands accept numbers from look listing
8. `colonize 1 50` — verify number resolves to the planet, not the quantity

**Watch for:** Panel not loading, numbers not resolving, seed planets being claimable.

---

### Test 26: Star Mall Scenes

1. Navigate to a Star Mall sector and `dock` — verify:
   - Mall interior ambient scene with holographic displays
   - Welcome message with `=== STAR MALL ===`
   - Each service shows with command hint
2. `mall` — verify service list with command hints
3. `cantina` — verify interior bar scene plays
4. `undock` — verify ambient scene returns to normal space
5. Navigate to a non-mall outpost and `dock` — verify normal docked scene (no mall interior)

**Watch for:** Mall interior not showing, command hints empty, normal outpost showing mall interior.

---

### Test 27: Leveling & Progression

1. `status` — verify level, rank, and XP shown (e.g. `Lv.1 | Recruit`)
2. `profile` (or `p`, `rank`, `lvl`) — verify full progression display
3. Move to a **new** sector — verify +10 XP awarded
4. Move to an already-visited sector — verify no XP
5. `buy` and `sell` at outpost — verify trade XP in response
6. `claim` a planet — verify +75 XP
7. `investigate` an anomaly — verify +25 XP
8. Earn enough XP to level up — verify max_energy increases and bonuses display

**Watch for:** XP for revisiting sectors, missing XP on actions, max energy not increasing on level-up.

---

### Test 28: Achievements & Ranks

1. `achievements` (or `ach`) — verify locked/available achievements shown
2. Perform an action that triggers an achievement (explore sectors, make a trade)
3. `achievements` — verify it moved from LOCKED to EARNED
4. `ranks` — verify full rank tier table (21 tiers from Recruit to Cosmic Legend)
5. Verify ship level gates section matches `dealer` locked ships

**Watch for:** Achievements not unlocking, credit rewards not paying, rank table incomplete.

---

### Test 29: Ship Level Gates

1. `dealer` — verify locked ships show `[Lv.X]` in warning color
2. Try `buyship corvette` at level 1 — should fail with "Requires level 5"
3. `buyship scout` (no level gate) — should succeed at any level

**Watch for:** Locked ships purchasable, wrong error message.

---

### Test 30: Tiered Mission Board

1. At Star Mall, `missionboard` — verify missions grouped by tier
2. Tiers above your level show `[LOCKED - Requires Level X]`
3. Each mission shows tier tag, type, reward credits, and XP
4. Try to `accept` a mission from a locked tier — should be rejected
5. Accept from an unlocked tier — should succeed with objectives shown

**Watch for:** All tiers locked, missing tier headers, locked missions accepted.

---

### Test 31: Mission Objectives & Claims

1. Accept a mission and `missions` — verify per-objective `[ ]` checkboxes with hints
2. Make progress — verify counts update, `[x]` on completion
3. Complete a claim-at-mall mission — should show `PENDING CLAIM`
4. Move away from Star Mall — `claimreward` should error
5. At Star Mall, `claimreward` — rewards granted (credits + XP)
6. `cr` alias works for claimreward

**Watch for:** Progress not updating, rewards auto-granted before claiming, alias not working.

---

### Test 32: Prerequisite & Cantina Missions

1. Find a mission with a prerequisite — can't accept child until parent completed
2. Complete parent, then accept child — should work
3. `cantina talk` before "The Bartender's Trust" — bartender doesn't trust you
4. Complete "The Bartender's Trust" mission
5. `cantina talk` (or `ct`) — bartender interacts, may offer cantina mission

**Watch for:** Prerequisite not checked, cantina unlocking before gate mission done.

---

### Test 33: UI & Layout

1. Sector map fills left 2/3 of top area with space background (starfield + nebula parallax)
2. Notification log fills right 1/3 of top area
3. Activity bar on far left with panel icons
4. Context panel (right sidebar) shows: player profile, ship card, mini chat, command input
5. Move mouse over sector map — star layers shift with parallax depth effect
6. Hover sector nodes — tooltip shows sector ID and type
7. Click legend button (?) — legend overlay toggles
8. Status bar at bottom shows all player stats with subtle ambient flicker

**Watch for:** Layout elements overlapping, parallax not working, tooltips mispositioned, missing sections in context panel.

---

### Test 34: Activity Panels

1. Click each icon in the activity bar — correct panel opens
2. Nav panel: LOOK, SCAN, WARP buttons work
3. Gear panel: CLOAK, REFUEL, EJECT, SELF-DESTRUCT buttons work (with confirmations)
4. Planets panel: LAND buttons appear for planets in current sector
5. Actions panel (⚡): all buttons trigger correct commands
6. Comms panel: full chat interface works
7. Syndicate panel: pool-access, revoke-factory, cancel vote available

**Watch for:** Wrong panel opening, buttons not triggering commands, missing panels.

---

### Test 35: Ambient Animations

1. Sector map nodes twinkle subtly at different rates
2. Notification log prefixes pulse gently
3. Inactive activity bar icons shimmer
4. Border corners pulse with accent color
5. Ship sprite in context panel has breathing glow
6. Status bar values flicker occasionally (~30-50s intervals)
7. Notification log has faint horizontal scanline sweep

**Watch for:** Animations too fast/distracting, animations not playing, performance issues.

---

## Quick Smoke Test Checklist

- [ ] Register a new player
- [ ] Complete or skip the tutorial — verify starter missions assigned
- [ ] After post-tutorial lore, verify welcome message appears
- [ ] Log out and log back in (try both username and email)
- [ ] `look` — see sector contents
- [ ] `move` to adjacent sector and back
- [ ] Click adjacent sector on map to warp
- [ ] `status` — verify energy decreased
- [ ] Sector map shows explored sectors, zoom/pan works, parallax background
- [ ] `dock` at outpost, `buy` a commodity, `sell` at another
- [ ] `dealer` at Star Mall, buy a ship
- [ ] `land` on a planet, `claim` it
- [ ] Second player can see first player in same sector
- [ ] Chat works in mini chat (context panel) and Comms panel
- [ ] `fire` works in standard sector, blocked in protected
- [ ] `flee` returns success/failure
- [ ] `missions` — starter missions listed with per-objective detail
- [ ] `missionboard` and `accept` a mission
- [ ] `investigate` a sector event
- [ ] `leaderboard` shows rankings
- [ ] `mail send` and `mail` for messaging
- [ ] `upgrades` and `install cargo` — fuzzy match works, `status` reflects bonus
- [ ] `warp` gates work with tolls
- [ ] `help` — shows categories (not a wall of text)
- [ ] `help trading` — shows trading commands
- [ ] `help buy` — shows detailed help
- [ ] `tips` — shows contextual guidance
- [ ] `fuel 10` — alias for refuel works
- [ ] Notification log shows color-coded entries, CLEAR button works
- [ ] `note test` and `notes` — notes system works
- [ ] `store` at Star Mall — numbered items with prices
- [ ] `purchase 1` — buy by number, credits deducted
- [ ] `inventory` — items show with quantities and category tags
- [ ] `planets` — owned planets with stocks and production
- [ ] `planets all` — discovered planets with ownership markers
- [ ] Planets panel — Owned/Discovered tabs work
- [ ] Seed planet shows `[seed world]`, cannot be claimed
- [ ] `land 1` — planet commands accept numbers
- [ ] Star Mall dock — mall interior scene with service hints
- [ ] `cantina` — bar interior scene plays
- [ ] `status` shows level, rank, XP
- [ ] `profile` shows level, XP bar, rank, bonuses
- [ ] Move to new sector — XP awarded, revisit — no XP
- [ ] Trade at outpost — trade XP in response
- [ ] `claim` planet — +75 XP
- [ ] `investigate` anomaly — +25 XP
- [ ] `achievements` — shows locked/earned achievements
- [ ] `ranks` — shows all 21 rank tiers and ship level gates
- [ ] `dealer` — locked ships show `[Lv.X]`, can't buy locked ships
- [ ] `leaderboard level` — shows level rankings
- [ ] Level up triggers max_energy increase and bonus display
- [ ] `missionboard` — tiered grouping, locked tiers grayed out
- [ ] Accept mission — `missions` shows per-objective detail with hints
- [ ] Complete objectives — progress updates, `[x]` on completion
- [ ] Claim-at-mall mission — `claimreward` at Star Mall works
- [ ] `cr` alias works for claimreward
- [ ] Prerequisite mission — can't accept child until parent completed
- [ ] `cantina talk` locked until gate mission completed
- [ ] After gate mission, cantina offers missions
- [ ] Mission rewards show both credits and XP
- [ ] Context panel: profile, ship card, mini chat, command input all visible
- [ ] Activity bar panels all open correctly
- [ ] Nav panel: LOOK/SCAN/WARP buttons work
- [ ] Gear panel: CLOAK/REFUEL/EJECT/SELF-DESTRUCT buttons work
- [ ] Actions panel (⚡): all action buttons functional
- [ ] Ambient animations running smoothly (twinkle, shimmer, pulse, flicker, scanline)
- [ ] Space background parallax responds to mouse movement

---

## Reporting Bugs

If you find a bug, please open an issue on GitHub:

**https://github.com/Qwoyn/cosmic-horizon/issues**

Include:
- What you were doing (command or action)
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
- Outposts buy and sell different commodities — check the mode column when you `dock`
- Seed planets (class S) are where you pick up colonists to populate your own planets
- Type `tips` anytime for contextual guidance based on your current situation
- Type `help <category>` to see commands in a specific area (e.g., `help trading`)
- Ship upgrades show in `status` — install a cargo upgrade and watch your capacity increase
- You can install upgrades by partial name: `install cargo` instead of `install cargo_mk2`
- After completing the tutorial, check `missions` for 3 starter missions to earn early credits
- Use `fuel` as a shortcut for `refuel`
- Use `chat <message>` or `say <message>` to talk to other players in your sector
- The mini chat in the context panel supports channel switching (Sector/Syndicate/Alliance)
