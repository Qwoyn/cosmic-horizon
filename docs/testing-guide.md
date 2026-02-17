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

Cosmic Horizon uses a terminal-style interface. Type commands in the input bar at the bottom of the screen. Type `help` at any time to see all available commands.

### Core Commands

| Command | What it does |
|---|---|
| `help` | List all commands |
| `status` | Show your stats (energy, credits, cargo, ship) |
| `look` | See current sector contents (players, outposts, planets, events) |
| `move <sector_id>` | Travel to an adjacent sector (costs 1 energy) |
| `map` | View your explored sector map |
| `scan` | Scan adjacent sectors (requires planetary scanner) |

### Trading

| Command | What it does |
|---|---|
| `dock` | View outpost prices and stock |
| `buy <commodity> <qty>` | Buy cargo from outpost |
| `sell <commodity> <qty>` | Sell cargo to outpost |
| `eject <commodity> <qty>` | Jettison cargo into space |

Commodities: **cyrillium**, **food**, **tech**

### Star Mall (must be at a Star Mall sector)

| Command | What it does |
|---|---|
| `mall` | View all Star Mall services |
| `dealer` | Browse ships for sale |
| `buyship <type>` | Purchase a ship |
| `store` | Browse the general store |
| `refuel <qty>` | Buy energy (10 credits per unit) |
| `garage` | View stored ships |
| `storeship` | Store current ship in garage |
| `retrieve <ship_id>` | Retrieve a stored ship |
| `cantina` | Hear a rumor |
| `intel` | Buy sector intelligence (500 credits) |
| `upgrades` | Browse ship upgrades |
| `install <upgrade_id>` | Install an upgrade |
| `shipupgrades` | View installed upgrades |
| `uninstall <install_id>` | Remove an upgrade |

### Planets

| Command | What it does |
|---|---|
| `land <planet_name>` | View planet details |
| `claim <planet_name>` | Claim an unclaimed planet |
| `colonize <planet_name> <qty>` | Deposit colonists |
| `collect <planet_name> <qty>` | Pick up colonists from seed planets |

### Combat (standard sectors only)

| Command | What it does |
|---|---|
| `fire <player> <energy>` | Attack another player |
| `flee` | Attempt to escape combat |
| `cloak` | Toggle cloaking (Shadow Runner only) |
| `combatlog` | View recent combat history |
| `bounties` | View active bounties |

### Social

| Command | What it does |
|---|---|
| `ally <player>` | Toggle alliance with a player |
| `syndicate create <name>` | Create a syndicate |
| `syndicate` | View your syndicate |
| `mail` | View inbox |
| `mail send <player> <subject> \| <body>` | Send a message |
| `leaderboard` | View rankings |

### Missions

| Command | What it does |
|---|---|
| `missionboard` | Browse available missions (at Star Mall) |
| `accept <template_id>` | Accept a mission |
| `missions` | View active missions |
| `abandon <mission_id>` | Abandon a mission |

### Other

| Command | What it does |
|---|---|
| `investigate` | Interact with a sector event/anomaly |
| `deploy <item>` | Deploy a mine, drone, buoy, or probe |
| `warp` | View warp gates in current sector |
| `warp build <sector_id>` | Build a warp gate (syndicate officers) |

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
3. `install <upgrade_id>` — install one
4. `shipupgrades` — verify it's listed
5. `status` — verify stats reflect the bonus
6. `uninstall <install_id>` — remove it

**Watch for:** Stats not changing after install, exceeding max upgrades.

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

## Quick Smoke Test Checklist

Run through this abbreviated flow to verify the basics:

- [ ] Register a new player
- [ ] Log out and log back in (try both username and email)
- [ ] `look` — see sector contents
- [ ] `move` to adjacent sector and back
- [ ] `status` — verify energy decreased
- [ ] `map` — verify map shows explored sectors, zoom and pan work
- [ ] `dock` at outpost, `buy` a commodity, `sell` at another
- [ ] `dealer` at Star Mall, buy a ship
- [ ] `land` on a planet, `claim` it
- [ ] Second player can see first player in same sector
- [ ] `fire` works in standard sector, blocked in protected
- [ ] `flee` returns success/failure
- [ ] `missionboard` and `accept` a mission
- [ ] `investigate` a sector event
- [ ] `leaderboard` shows rankings
- [ ] `mail send` and `mail` for messaging
- [ ] `upgrades` and `install` at Star Mall
- [ ] `warp` gates work with tolls
- [ ] `help` shows all commands

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
