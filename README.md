# Cosmic Horizon

A persistent multiplayer space trading game inspired by TradeWars 2002. Explore a galaxy of 5,000 sectors, trade commodities between outposts, claim and colonize planets, build syndicates, and fight for dominance — all through a retro terminal interface.

Based on the [Cosmic Horizon Whitepaper](whitepaper.md) by W. Moglia, D. Pittman, and S. Lott.

## Screenshots

*Coming soon*

## Features

- **5,000-sector procedurally generated galaxy** with regions, chokepoints, and one-way warps
- **Three-commodity trading economy** (cyrillium, food, tech) with supply/demand pricing
- **8 planet classes** with colonization, production, and 7 upgrade tiers
- **8 ship classes** from scouts to battleships, each with unique capabilities
- **Real-time multiplayer** via WebSocket — see players enter your sector, chat, fight
- **Combat system** with weapon/engine energy, flee mechanics, and ship destruction
- **Deployables** — mines, drones, buoys, probes
- **Syndicates** — player organizations with treasury, governance, shared planets
- **Bounty system** — place bounties, auto-claimed on ship destruction
- **Star Malls** — ship dealer, general store, garage, salvage yard, cantina, intel
- **Action point system** — 1 AP/min regeneration, 500 max, 2x bonus for new players
- **Decay mechanics** — inactive colonies lose population, deployables expire, defenses drain
- **37+ terminal commands** with aliases

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
      api/              # REST route handlers
      config/           # Game constants, ship types, store items
      db/               # Knex migrations and seeds
      engine/           # Pure game logic (combat, trading, planets, energy)
      middleware/       # Auth middleware
      ws/               # WebSocket event handlers
  client/               # React frontend
    src/
      components/       # Terminal, StatusBar, MapPanel, TradeTable, CombatView
      hooks/            # useGameState, useSocket
      services/         # API client, command parser
      pages/            # Login, Register, Game
  docs/
    plans/              # Design doc, implementation plan
    players-manual.md   # Full player's manual
    testing-guide.md    # Manual QA testing guide
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

The seed generates the full universe: 5,000 sectors, 200 outposts, 306 planets, 8 ship types.

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

Register at the login screen. You spawn at a Star Mall with a Scout ship, 10,000 credits, and 500 energy.

```
help              Show all commands
look              View your current sector
move 42           Move to sector 42
dock              Dock at an outpost to trade
buy cyrillium 10  Buy 10 cyrillium
sell food 5       Sell 5 food
dealer            Browse ships at a star mall
land Kepler VII   View planet details
claim Kepler VII  Claim an unclaimed planet
fire player1 10   Fire 10 weapon energy at another player
flee              Attempt to escape combat
mall              Star mall services overview
```

See [docs/players-manual.md](docs/players-manual.md) for the full command reference, ship stats, planet classes, item catalog, and strategy tips.

## Testing

### Automated Tests

```bash
cd server
npx jest
```

95 tests across 7 suites: energy, trading, combat, planets, universe generation, deployables, and API integration.

### Manual Testing

See [docs/testing-guide.md](docs/testing-guide.md) for 15 structured test scenarios covering all game systems.

## Roadmap

- [x] Phase 1-4: Core engine, database, API, universe generation
- [x] Phase 5: React terminal frontend
- [x] Phase 6: Docker, command parser, integration tests
- [x] Phase 7: General store, syndicates, bounties, star mall
- [ ] Android companion app (React Native) — [see plan](docs/plans/2026-02-14-mvp-implementation.md)
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

Audio files are not included in the repository. Place MP3 files in `client/public/audio/` using the filenames defined in `client/src/config/audio-tracks.ts`.

## License

[CC BY-NC 4.0](LICENSE) — free to use, modify, and share for non-commercial purposes with attribution.
