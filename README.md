# Cosmic Horizon

A persistent multiplayer space trading game inspired by TradeWars 2002. Explore a galaxy of 5,000 sectors, trade commodities between outposts, claim and colonize planets, build syndicates, and fight for dominance — all through a retro terminal interface with animated pixel art scenes.

Based on the [Cosmic Horizon Whitepaper](whitepaper.md) by W. Moglia, D. Pittman, and S. Lott.

## Screenshots

*Coming soon*

## Features

### Galaxy & Exploration
- **5,000-sector procedurally generated galaxy** with seeded RNG, regional clusters, chokepoints, and one-way warps
- **200 outposts** with unique commodity profiles (buy/sell/none per commodity)
- **300+ planets** across 8 classes (Hospitable, Desert, Ocean, Alpine, Frozen, Volcanic, Gaseous, Seed)
- **8 Star Malls** — protected trading hubs with ship dealer, general store, garage, salvage yard, cantina, intel, upgrades, mission board, bounty board, and refueling
- **6 sector event types** — asteroid fields, nebulae, distress signals, derelict ships, resource caches, ion storms

### Ships & Combat
- **8 ship classes** — Dodge Pod, Scout, Freighter, Corvette, Cruiser, Battleship, Stealth Runner, Colony Ship
- **Real-time multiplayer combat** via WebSocket — weapon/engine energy allocation, flee mechanics, ship destruction with dodge pod ejection
- **Ship upgrades** — 8 upgrade types (weapon/engine/cargo/shield mk1/mk2) with stacking and diminishing returns
- **Deployables** — offensive/defensive/toll drones, halberd/barnacle mines, buoys, probes

### Economy & Trading
- **Three-commodity economy** (cyrillium, food, tech) with outpost supply/demand pricing
- **Planet colonization** — deposit colonists, upgrade through 7 tiers, production per tick
- **General store** — consumables (probes, torpedoes, fuel cells), equipment (jump drives, scanners, PGDs), deployables
- **Syndicates** — player organizations with treasury, governance, shared planets, warp gate construction

### Social & Progression
- **4 playable races** — Muscarian (combat), Vedic (scanning), Kalin (defense), Tar'ri (trade) — each with permanent traits and starting bonuses
- **Missions** — 21 mission templates across 6 types (deliver cargo, visit sector, destroy ship, colonize planet, trade units, scan sectors) with progress tracking
- **Bounty system** — place bounties on players, auto-claimed on destruction
- **Leaderboards** — rankings across 6 categories (credits, planets, combat, explored, trade, syndicate)
- **Player messaging** — in-game mail with inbox, sent, read/unread, delete
- **Warp gates** — syndicate-built instant travel links with toll collection

### Interface
- **Retro terminal UI** — 54 commands with aliases, fuzzy matching, and numbered listings for quick item/ship/mission selection
- **Animated pixel art viewport** — ambient scenes (space, outpost, docked), action scenes (combat, docking, warping, refueling, salvaging, colonizing), and full-screen story sequences
- **Guided onboarding** — intro lore sequence, interactive tutorial with sandbox, post-tutorial story transition
- **Contextual audio** — separate tracks for intro, gameplay, Star Mall, combat, and post-tutorial
- **Action point system** — 1 AP/min regeneration, 500 max, 2x bonus for new players
- **Decay mechanics** — inactive colonies lose population, deployables expire, defenses drain

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, TypeScript, Express, Socket.io |
| Database | SQLite (dev) / PostgreSQL (production) via Knex.js |
| Frontend | React, TypeScript, Vite |
| Real-time | Socket.io WebSocket events |
| Auth | Express sessions with bcrypt |
| Containers | Docker + Docker Compose |

## Project Structure

```
cosmic-horizon/
  server/               # Express API + game engine
    src/
      api/              # REST route handlers (auth, planets, store, combat, missions, etc.)
      config/           # Game constants (ship types, planet classes, races, store items, upgrades)
      db/
        migrations/     # 21 Knex migrations (players, sectors, ships, planets, deployables, etc.)
        seeds/          # Universe generation (5,000 sectors, outposts, planets, missions)
      engine/           # Pure game logic (combat, trading, planets, energy, missions, events, upgrades, universe gen)
      services/         # Shared services (mission tracker, push notifications)
      middleware/       # Auth middleware
      ws/               # WebSocket event handlers (chat, combat, notifications)
  client/               # React frontend
    src/
      components/       # Terminal, StatusBar, MapPanel, TradeTable, CombatView, PixelScene, SceneViewport, etc.
      config/
        scenes/         # Pixel art scene definitions (ambient, combat, docking, warp, deploy, etc.)
        audio-tracks.ts # Audio track configuration
      hooks/            # useGameState, useSocket, useAudio, useActivePanel
      services/         # API client (100+ endpoints), command parser (54 commands)
      pages/            # Login, Register, Game
      types/            # TypeScript type definitions
  docs/
    plans/              # Design docs, implementation plans
    players-manual.md   # Full player's manual
    testing-guide.md    # Manual QA testing guide
    ROADMAP_PLAN.md     # Feature roadmap with detailed specs
```

## Quick Start

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### Initialize the Database

```bash
cd server
npx knex migrate:latest --knexfile knexfile.ts
npx knex seed:run --knexfile knexfile.ts
```

The seed generates the full universe: 5,000 sectors, 200 outposts, 306 planets, 8 ship types, 25 mission templates, and 8 ship upgrade types.

### Configure

Copy the example environment file and edit as needed:

```bash
cp .env.example server/.env
```

```
PORT=3000
CLIENT_URL=http://localhost:5173
SESSION_SECRET=change-this-to-something-random
```

If hosting on a remote server, set `VITE_API_URL` before building the client:

```bash
cd client
VITE_API_URL=http://your-server:3000 npx vite build
```

### Run (Development)

```bash
# Terminal 1 — Server
cd server
npx ts-node src/index.ts

# Terminal 2 — Client
cd client
npx vite
```

Open `http://localhost:5173`, register a pilot, and start exploring.

### Run (PM2)

```bash
cd server
pm2 start npx --name "coho-server" -- ts-node src/index.ts

cd ../client
npx vite build
pm2 start npx --name "coho-client" -- vite preview --host 0.0.0.0 --port 5173
```

### Run (Docker)

```bash
docker-compose up --build
```

Requires PostgreSQL. See `docker-compose.yml` for configuration.

## How to Play

Register at the login screen. You choose a race, watch the intro lore sequence, then spawn at a Star Mall with a starter ship, 10,000 credits, and 500 energy. A guided tutorial walks you through the basics.

```
help              Show all command categories
look              View current sector (players, planets, outposts, events, warp gates)
move 42           Move to sector 42
status            View pilot status (energy, credits, ship, cargo)
mall              Star Mall services with command hints
dock              Dock at an outpost to trade
buy cyrillium 10  Buy 10 cyrillium
sell food 5       Sell 5 food
dealer            Browse ships at a star mall
store             Browse general store (numbered items)
purchase 1        Buy item #1 from last listing (or by name)
inventory         View your items
garage            View stored ships (numbered)
retrieve scout    Retrieve a ship by name (or by #)
upgrades          Browse ship upgrades (numbered)
install cargo     Install an upgrade by name (fuzzy match)
missionboard      Browse available missions (numbered)
accept 1          Accept mission #1 from last listing
missions          View active missions with progress
fire player1 10   Fire 10 weapon energy at another player
flee              Attempt to escape combat
investigate       Investigate a sector anomaly
leaderboard       View galaxy rankings
mail              View your inbox
warp              Use a warp gate in your sector
```

Most listing commands show numbered items. Use the number or a name/keyword with action commands (e.g., `purchase 2`, `retrieve scout`, `accept deliver`). Ambiguous matches show a disambiguation list you can select from by number.

See [docs/players-manual.md](docs/players-manual.md) for the full command reference, ship stats, planet classes, item catalog, and strategy tips.

## Testing

### Automated Tests

```bash
cd server
npx jest
```

95 tests across 7 suites: energy, trading, combat, planets, universe generation, deployables, and API integration.

The test suite validates all core engine logic. New game systems (missions, events, leaderboards, messages, upgrades, warp gates) are verified through the integration test suite and manual testing.

### Manual Testing

See [docs/testing-guide.md](docs/testing-guide.md) for 15 structured test scenarios covering all game systems.

## Roadmap

### Completed

- [x] Core engine, database, API, universe generation (5,000 seeded sectors)
- [x] React terminal frontend with 54 commands, aliases, fuzzy matching, and numbered listings
- [x] Docker, command parser, integration tests (95 tests across 7 suites)
- [x] General store, syndicates, bounties, Star Mall services
- [x] 4 playable races with unique traits and starting bonuses
- [x] Guided onboarding — intro lore sequence, interactive tutorial, post-tutorial transition
- [x] Animated pixel art viewport — ambient, action, and fullscreen scenes
- [x] Contextual audio system — intro, gameplay, Star Mall, combat, post-tutorial tracks
- [x] Missions & quests (21 templates, 6 types, progress tracking)
- [x] Sector events & anomalies (6 event types, investigation mechanic)
- [x] Leaderboards (6 categories, cached rankings)
- [x] Player messaging (in-game mail with inbox/sent/read/delete)
- [x] Ship upgrades & customization (8 upgrade types, diminishing returns, stacking)
- [x] Warp gates (syndicate-built instant travel with toll collection)

### In Progress

- [ ] UX improvements — inventory fixes, planet info command, seed planet guards, planet commands by number, Star Mall interior scenes

### Planned

See [docs/ROADMAP_PLAN.md](docs/ROADMAP_PLAN.md) for detailed specs on each item.

- [ ] **Leveling system** — 100 levels, named ranks, XP from combat/missions/trade/exploration, achievements (visible + hidden), stat bonuses per level
- [ ] **Mission expansion** — 20 standard multiplayer missions (tiered, chained), 10 cantina-exclusive missions, detailed progress with hints, claim-at-mall mechanic, 3-5 active mission limit
- [ ] **NPC system** — NPCs on outposts and planets, first-encounter cutscenes, branching dialogue trees, reputation per NPC, faction system, journal/contacts list
- [ ] **Tablet system** — collectible upgrade tablets (6 rarity tiers: common to mythic), combining/recipes, 3 equip slots (unlocked at levels 10/30/60), stat boosts + abilities + perks, tradeable between players
- [ ] **Single player mode** — 200-sector universe (fixed seed), 20 standalone missions, static NPC encounters, Star Malls unlock through progression, carries over to multiplayer
- [ ] Android companion app (React Native) — [see plan](docs/plans/2026-02-14-mvp-implementation.md)
- [ ] Jump drives, PGDs, vessel capture, towing mechanics
- [ ] Frontier expansion (new sectors via wormholes)
- [ ] Terraforming with ecocredit integration
- [ ] On-chain $COHO token mechanics

## Audio Credits

| Track | File | Artist | Source |
|-------|------|--------|--------|
| Intro | `intro.mp3` | "Galactic Arcade Music" by [kissan4](https://pixabay.com/users/kissan4-10387284/) | [Pixabay](https://pixabay.com/music/441548/) |
| Gameplay | `gameplay-1.mp3` | "In 3025" by [Paul Winter](https://pixabay.com/users/kaazoom-448850/) | [Pixabay](https://pixabay.com/music/384511/) |
| Gameplay | `gameplay-2.mp3` | "Synthwave Soundscape" by [Tunetank](https://pixabay.com/users/tunetank-50201703/) | [Pixabay](https://pixabay.com/music/348458/) |
| Gameplay | `gameplay-3.mp3` | "Ghost Coast 2030" by [Eidunn](https://pixabay.com/users/eidunn-25617524/) | [Pixabay](https://pixabay.com/music/20822/) |
| Gameplay | `gameplay-4.mp3` | "Moebius" by [Eidunn](https://pixabay.com/users/eidunn-25617524/) | [Pixabay](https://pixabay.com/music/21329/) |
| Gameplay | `gameplay-5.mp3` | "Pulsar" by [Marco Belloni](https://pixabay.com/users/marcobellonimusic-42487602/) | [Pixabay](https://pixabay.com/music/193764/) |
| Combat | `combat.mp3` | "Cyber Relay" by [Douglas Gustafson](https://pixabay.com/users/psychronic-13092015/) | [Pixabay](https://pixabay.com/music/429875/) |
| Star Mall | `starmall.mp3` | "Luminous Presence" by [Andrea Good](https://pixabay.com/users/luminouspresence-40519492/) | [Pixabay](https://pixabay.com/music/294166/) |
| Post-Tutorial | `post-tutorial.mp3` | "Dark Sci-Fi Suspense Trailer" by [Tamas Kolozsvari](https://pixabay.com/users/sound4stock-53243298/) | [Pixabay](https://pixabay.com/music/444587/) |

Audio files are not included in the repository. Place MP3 files in `client/public/audio/` using the filenames defined in `client/src/config/audio-tracks.ts`.

## License

[CC BY-NC 4.0](LICENSE) — free to use, modify, and share for non-commercial purposes with attribution.
