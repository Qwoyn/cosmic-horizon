# Cosmic Horizon - Public Beta Testing Guide

Welcome to Cosmic Horizon, a persistent multiplayer space trading game inspired by TradeWars 2002. This guide will help you get set up, learn the basics, and know what to test.

---

## Getting Started

### Prerequisites

- **Node.js 20+** and **npm**
- A modern web browser (Chrome, Firefox, Edge, Safari)
- (Optional) **Docker** and **Docker Compose** for containerized setup

### Option A: Local Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Qwoyn/cosmic-horizon.git
   cd cosmic-horizon
   ```

2. **Install dependencies**
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

3. **Initialize the database**
   ```bash
   cd ../server
   npx knex migrate:latest --knexfile knexfile.ts
   npx knex seed:run --knexfile knexfile.ts
   ```
   This generates 5,000 sectors, 200 outposts, 306 planets, 8 ship types, 25 mission templates, and more.

4. **Start the server** (Terminal 1)
   ```bash
   cd server
   npm run dev
   ```

5. **Start the client** (Terminal 2)
   ```bash
   cd client
   npm run dev
   ```

6. **Open the game** at `http://localhost:5173`

### Option B: Docker Compose

```bash
git clone https://github.com/Qwoyn/cosmic-horizon.git
cd cosmic-horizon
docker-compose up --build
```

This starts PostgreSQL, the server (port 3000), and the client (port 80). Open `http://localhost` in your browser.

### Environment Variables (Optional)

Copy the example config if you want to customize ports or secrets:
```bash
cp .env.example server/.env
```

Key variables:
| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Server port |
| `CLIENT_URL` | `http://localhost:5173` | Client origin for CORS |
| `SESSION_SECRET` | dev default | Session signing key |
| `JWT_SECRET` | dev default | JWT signing key |

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

Cosmic Horizon uses a terminal-style interface. Type commands in the input bar at the bottom of the screen.

**Getting help:**
- `help` — View command categories at a glance
- `help <category>` — View commands in a category (e.g., `help trading`)
- `help <command>` — Detailed help for a specific command (e.g., `help buy`)
- `tips` — Contextual tips based on your current situation
- `clear` — Clear the terminal screen

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

**Note:** Installed upgrades now appear in your `status` — weapon energy, engine energy, and cargo capacity all reflect upgrade bonuses.

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
| `bounties` | | View active bounties |
| `leaderboard [category]` | `lb` | View rankings |

#### Missions

| Command | What it does |
|---|---|
| `missionboard` | Browse available missions (at Star Mall) |
| `accept <template_id>` | Accept a mission |
| `missions` | View active missions |
| `missions completed` | View completed missions |
| `abandon <mission_id>` | Abandon a mission |

**Note:** After completing the tutorial, 3 starter missions are automatically assigned: Pathfinder, First Trades, and Scanner Training.

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

#### Utility

| Command | What it does |
|---|---|
| `help [category\|command]` | View help categories, category commands, or command details |
| `tips` | Contextual guidance based on your situation |
| `clear` | Clear the terminal screen |
| `inventory` | View items in your inventory |
| `use <item_id> [args]` | Use an item from inventory |

---

## What to Test

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
4. Type `map` to see explored sectors on the visual map
5. Try `move 99999` (non-adjacent) — should fail with an error
6. Try the +/- zoom buttons on the map panel and drag to pan when zoomed

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

### Test 11b: Starter Missions (Post-Tutorial)

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

### Test 12: Sector Events

1. Navigate through sectors, checking `look` in each
2. Find a sector with an event/anomaly listed
3. `investigate` — interact with the event
4. Note the outcome (credits, cargo, or energy change)
5. `look` — event should be gone
6. `investigate` again — should fail

**Watch for:** Events persisting after investigation, no energy cost.

---

### Test 13: Leaderboards

1. `leaderboard` — view overview (top 5 per category)
2. `leaderboard credits` — view top 20 by credits
3. Try other categories: `planets`, `combat`, `explored`, `trade`, `syndicate`

**Watch for:** Empty leaderboards after activity, incorrect rankings, duplicate entries.

---

### Test 14: Player Messaging

1. `mail` — view inbox (should be empty)
2. `mail send <player> Hello | Testing the mail system!`
3. Other player: `mail` — should see the message
4. `mail read <message_id>` — read it
5. `mail sent` — view sent messages
6. `mail delete <message_id>` — delete a message

**Watch for:** Messages not arriving, read status not updating, deleted messages still showing.

---

### Test 15: Ship Upgrades

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

**Watch for:** Stats not changing after install, `status` not reflecting upgrade bonuses, cargo capacity not including upgrade bonus when buying/selling, fuzzy match not working.

---

### Test 16: Warp Gates

1. Create or join a syndicate
2. Navigate to a standard sector
3. `warp build <destination_sector_id>` — build a gate (requires credits + cargo)
4. Use the warp gate to travel
5. `warp toll <gate_id> 500` — set a toll
6. Have a non-syndicate player use the gate — toll should be charged

**Watch for:** Building without resources succeeding, toll not charging non-members.

---

### Test 17: Cloaking (Shadow Runner Only)

1. Purchase a Shadow Runner: `buyship stealth`
2. `cloak` — toggle on
3. `cloak` — toggle off
4. Try cloaking in a different ship type — should fail

**Watch for:** Cloaking working on non-stealth ships.

---

### Test 18: Energy Regeneration

1. Note energy via `status`
2. Spend some energy moving around
3. Wait 2-3 minutes
4. `status` — energy should have increased (1/min, or 2/min for new players in first 72 hours)

**Watch for:** Energy exceeding max, no regeneration happening.

---

### Test 19: Edge Cases

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

### Test 20: Help System (Categorized)

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

### Test 21: Tips Command

1. `tips` — should show contextual guidance
2. Navigate to a Star Mall sector and type `tips` — should mention Star Mall services
3. Buy some cargo and type `tips` — should mention you're carrying cargo
4. Verify it always shows the "help <category>" hint

**Watch for:** Tips crashing when player has no ship, tips not detecting Star Mall.

---

### Test 22: Sector Chat

1. Open two browser windows with two separate accounts
2. Navigate both to the same sector
3. **Player 1**: `chat hello!` — should see `[Player1] hello!` in their own terminal
4. **Player 2**: Should see `[Player1] hello!` appear
5. **Player 2**: `chat hi back!` — should echo locally, Player 1 should see it
6. Try `say hello` (alias) — should work the same as chat

**Watch for:** Own messages not appearing, duplicate messages, messages appearing in wrong sectors.

---

### Test 23: Terminal Clear & Auto-trim

1. Run several commands to fill the terminal
2. `clear` — terminal should be completely empty
3. Run a command after clear — should work normally
4. (Stress test) Run 250+ commands rapidly — terminal should not exceed ~200 lines (older lines auto-trimmed)

**Watch for:** Clear not working, auto-trim removing lines too aggressively, clear breaking command input.

---

### Test 24: Fuel Alias

1. Navigate to a Star Mall
2. `fuel 10` — should work exactly like `refuel 10`
3. Verify energy increased and credits deducted

**Watch for:** "Unknown command" error for fuel.

---

### Test 25: Sector Map Layout

1. Explore 10+ sectors by moving around
2. Open the sector map in the sidebar
3. Verify sectors are visually spread out with clear spacing between nodes
4. Verify connected sectors have visible edge lines between them
5. Zoom in/out — nodes should remain well-spaced
6. Drag to pan when zoomed in

**Watch for:** Nodes piled on top of each other, edges overlapping, map too cramped.

---

## Quick Smoke Test Checklist

Run through this abbreviated flow to verify the basics:

- [ ] Register a new player
- [ ] Complete or skip the tutorial — verify starter missions are assigned
- [ ] After post-tutorial lore, verify welcome message with getting-started tips appears
- [ ] Log out and log back in (try both username and email)
- [ ] `look` — see sector contents
- [ ] `move` to adjacent sector and back
- [ ] `status` — verify energy decreased
- [ ] `map` — verify map shows explored sectors with good spacing, zoom and pan work
- [ ] `dock` at outpost, `buy` a commodity, `sell` at another
- [ ] `dealer` at Star Mall, buy a ship
- [ ] `land` on a planet, `claim` it
- [ ] Second player can see first player in same sector
- [ ] `chat hello` — message appears in both players' terminals
- [ ] `fire` works in standard sector, blocked in protected
- [ ] `flee` returns success/failure
- [ ] `missions` — verify starter missions are listed
- [ ] `missionboard` and `accept` a mission
- [ ] `investigate` a sector event
- [ ] `leaderboard` shows rankings
- [ ] `mail send` and `mail` for messaging
- [ ] `upgrades` and `install cargo` — fuzzy match works, `status` reflects bonus
- [ ] `warp` gates work with tolls
- [ ] `help` — shows categories (not a wall of text)
- [ ] `help trading` — shows trading commands
- [ ] `help buy` — shows detailed help for buy
- [ ] `tips` — shows contextual guidance
- [ ] `fuel 10` — alias for refuel works
- [ ] `clear` — clears the terminal
- [ ] `note test` and `notes` — notes system works

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
- The sector map in the sidebar shows icons for Star Malls, outposts, and planets
- You can zoom into the map with the +/- buttons and drag to pan when zoomed
- Outposts buy and sell different commodities — check the mode column when you `dock`
- Seed planets (class S) are where you pick up colonists to populate your own planets
- Type `tips` anytime for contextual guidance based on your current situation
- Type `help <category>` to see commands in a specific area (e.g., `help trading`)
- Ship upgrades now show in `status` — install a cargo upgrade and watch your capacity increase
- You can install upgrades by name: `install cargo` instead of `install cargo_mk2`
- Use `clear` to clean up the terminal when it gets cluttered
- The terminal auto-trims to 200 lines during long sessions
- After completing the tutorial, check `missions` for 3 starter missions to earn early credits
- Use `fuel` as a shortcut for `refuel`
- Use `chat <message>` or `say <message>` to talk to other players in your sector
