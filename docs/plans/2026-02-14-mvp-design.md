# Cosmic Horizon MVP Design

## Overview

Text-based multiplayer space trading game inspired by TradeWars 2002. Web-based with a retro terminal UI, perpetual open world, and an Android companion app. Full whitepaper mechanics minus blockchain integration.

## Decisions

- **Platform**: Web-based (browser client + Node.js server)
- **Scale target**: Medium (50-500 concurrent), designed for horizontal scaling later
- **UI style**: Retro terminal aesthetic with modern touches (clickable elements, side panels)
- **Scope**: Full whitepaper mechanics minus blockchain ($COHO as DB-tracked currency)
- **World model**: Perpetual with regenerating energy, decay mechanics, frontier expansion
- **Map size**: ~5,000 sectors, expandable
- **Android app**: Lite companion first (notifications, status, quick actions), full client later

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + TypeScript, Express, Socket.io |
| Database | PostgreSQL with migrations (node-pg-migrate or Knex) |
| Frontend | React + TypeScript, terminal-style UI |
| Android | React Native (Phase 2) |
| Auth | Session-based (email/password), OAuth later |
| Deployment | Docker containers, single server |

## Architecture

Monolithic server with clean internal separation:

```
[Browser Client] <--REST/WS--> [API Layer] <--> [Game Engine] <--> [PostgreSQL]
[Android App]    <--REST/WS--> [API Layer]
```

- **Game Engine**: Pure logic, no transport awareness. All actions validated and executed here.
- **API Layer**: REST endpoints for CRUD operations, auth, querying state.
- **WS Layer**: Real-time events (movement, combat, alerts, sector activity).
- **Game Tick**: 60-second interval handling AP regen, production, decay, economy drift.

## Data Model

### Core Entities

- **Players**: account, current sector, ship, energy (AP), $COHO balance, explored sectors
- **Sectors**: adjacency graph, type (standard/one-way/protected), contents
- **Ships**: type, owner, stats (attack/defense ratios, weapon energy, cargo holds), fuel, equipment
- **Outposts**: sector, commodity inventory, treasury, derived prices
- **Planets**: sector, owner, class (8 types), colonists, upgrade level (0-7), defenses, stockpiles
- **Syndicates**: members, shared assets, alliances, governance charter
- **Deployables**: drones, mines, buoys — sector, owner, type, mode, degradation timer
- **Combat/Trade logs**: timestamped event records

### Sector Graph

Stored as adjacency list. Each sector row contains an array of adjacent sector IDs with directional flags (for one-way sectors). The full graph is generated at world creation.

## Universe Generation

- Procedural graph generation creating ~5,000 connected sectors
- Clustered regions (20-50 sectors) linked by sparser connections, creating natural choke points
- Sector type distribution: ~85% standard, ~5% one-way, ~5% protected, ~5% special
- Star Malls in protected sectors, evenly distributed
- Seed planets in protected zones near star malls
- Harmony-enforced routes between star malls and seed planets
- Outposts scattered with randomized commodity profiles
- Unclaimed planets weighted toward harder-to-reach sectors
- Expandable: new quadrants stitch onto existing graph

## Game Loop

- **Energy**: 1 AP/minute, cap 500. Move=1, trade=1, combat volley=2, deploy=1. Planet management free.
- **Game tick** (60s): AP regen, planet production, colonist growth, decay, outpost economy drift
- **Combat**: Tractor beam lock -> choose energy -> fire -> recharge delay. Real-time but deliberate.
- **Trading**: Dock at outpost, view supply/demand prices, buy/sell. Prices shift with each trade.
- **Decay**: Inactive planets lose colonists (1-2%/day after 48h offline), defenses drain, deployables expire (~7 days)
- **New players**: Start at random star mall, starter ship, seed $COHO, 2x AP regen for 72 hours
- **Frontier expansion**: Admin-triggered new quadrant generation, announced as wormhole discovery

## Project Structure

```
cosmic-horizon/
├── whitepaper.md
├── docs/plans/
├── server/
│   ├── src/
│   │   ├── index.ts
│   │   ├── config/
│   │   ├── db/
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   ├── engine/
│   │   │   ├── universe.ts
│   │   │   ├── trading.ts
│   │   │   ├── combat.ts
│   │   │   ├── planets.ts
│   │   │   ├── ships.ts
│   │   │   ├── energy.ts
│   │   │   ├── decay.ts
│   │   │   └── syndicates.ts
│   │   ├── api/
│   │   ├── ws/
│   │   └── middleware/
│   └── package.json
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Terminal.tsx
│   │   │   ├── MapPanel.tsx
│   │   │   ├── StatusBar.tsx
│   │   │   ├── TradeTable.tsx
│   │   │   └── CombatView.tsx
│   │   ├── hooks/
│   │   └── services/
│   └── package.json
├── companion/                    # React Native (Phase 2)
└── docker-compose.yml
```

## Android Companion App

### Phase 1: Lite Companion
- Ship status, location, inventory
- Planet production and colonist monitoring
- Outpost price tracking
- Push notifications (attacks, trades, milestones)
- Quick actions (defense settings, drone modes)
- Same REST/WebSocket API as web client
- React Native, shared TypeScript

### Phase 2: Full Mobile Client
- Complete gameplay from mobile
- Mobile-optimized UI
- Post-MVP
