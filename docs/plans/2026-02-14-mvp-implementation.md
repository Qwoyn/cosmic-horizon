# Cosmic Horizon MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a fully playable persistent multiplayer space strategy game (Cosmic Horizon) as a web application with all whitepaper mechanics except blockchain.

**Architecture:** Monolithic Node.js/TypeScript backend with Express REST API + Socket.io WebSockets, PostgreSQL database, React/TypeScript frontend with panel-based UI. Game engine is isolated from transport layer. 60-second game tick handles regeneration, production, decay.

**Tech Stack:** Node.js, TypeScript, Express, Socket.io, PostgreSQL, Knex (migrations/queries), React, Vite, Docker

---

## Phase 1: Project Scaffolding & Database

### Task 1: Initialize Server Project

**Files:**
- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/src/index.ts`
- Create: `server/.env.example`

**Step 1: Initialize the server package**

```bash
cd /workspace/cosmic-horizon
mkdir -p server/src
cd server
npm init -y
npm install express socket.io knex pg bcrypt express-session connect-pg-simple cors dotenv
npm install -D typescript @types/node @types/express @types/bcrypt @types/express-session @types/cors ts-node nodemon
npx tsc --init
```

**Step 2: Configure tsconfig.json**

`server/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Create minimal server entry point**

`server/src/index.ts`:
```typescript
import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', game: 'Cosmic Horizon' });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Cosmic Horizon server running on port ${PORT}`);
});

export { app, server, io };
```

**Step 4: Create .env.example**

`server/.env.example`:
```
PORT=3000
CLIENT_URL=http://localhost:5173
DATABASE_URL=postgres://coho:coho@localhost:5432/cosmic_horizon
SESSION_SECRET=change-me-in-production
```

**Step 5: Add npm scripts to package.json**

Add to `server/package.json` scripts:
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "migrate": "knex migrate:latest",
    "migrate:rollback": "knex migrate:rollback",
    "seed": "knex seed:run"
  }
}
```

**Step 6: Verify server starts**

```bash
cd /workspace/cosmic-horizon/server
npx ts-node src/index.ts &
curl http://localhost:3000/api/health
# Expected: {"status":"ok","game":"Cosmic Horizon"}
kill %1
```

**Step 7: Commit**

```bash
git add server/
git commit -m "feat: initialize server project with Express and Socket.io"
```

---

### Task 2: Database Setup & Knex Configuration

**Files:**
- Create: `server/knexfile.ts`
- Create: `server/src/db/connection.ts`
- Create: `docker-compose.yml`

**Step 1: Create docker-compose for PostgreSQL**

`docker-compose.yml` (project root):
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: coho
      POSTGRES_PASSWORD: coho
      POSTGRES_DB: cosmic_horizon
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

**Step 2: Create knexfile.ts**

`server/knexfile.ts`:
```typescript
import type { Knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const config: Record<string, Knex.Config> = {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL || {
      host: 'localhost',
      port: 5432,
      user: 'coho',
      password: 'coho',
      database: 'cosmic_horizon',
    },
    migrations: {
      directory: './src/db/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/db/seeds',
      extension: 'ts',
    },
  },
};

export default config;
```

**Step 3: Create db connection module**

`server/src/db/connection.ts`:
```typescript
import knex from 'knex';
import config from '../../knexfile';

const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

export default db;
```

**Step 4: Start Postgres and verify connection**

```bash
cd /workspace/cosmic-horizon
docker-compose up -d postgres
cd server
npx ts-node -e "import db from './src/db/connection'; db.raw('SELECT 1').then(() => { console.log('DB connected'); process.exit(0); }).catch(e => { console.error(e); process.exit(1); });"
# Expected: "DB connected"
```

**Step 5: Commit**

```bash
git add docker-compose.yml server/knexfile.ts server/src/db/
git commit -m "feat: add PostgreSQL with Docker and Knex configuration"
```

---

### Task 3: Core Database Migrations

**Files:**
- Create: `server/src/db/migrations/001_players.ts`
- Create: `server/src/db/migrations/002_sectors.ts`
- Create: `server/src/db/migrations/003_ships.ts`
- Create: `server/src/db/migrations/004_outposts.ts`
- Create: `server/src/db/migrations/005_planets.ts`
- Create: `server/src/db/migrations/006_syndicates.ts`
- Create: `server/src/db/migrations/007_deployables.ts`
- Create: `server/src/db/migrations/008_logs.ts`

**Step 1: Create players migration**

`server/src/db/migrations/001_players.ts`:
```typescript
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('players', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.string('username', 32).notNullable().unique();
    t.string('email').notNullable().unique();
    t.string('password_hash').notNullable();
    t.integer('current_sector_id').nullable();
    t.uuid('current_ship_id').nullable();
    t.integer('energy').notNullable().defaultTo(500);
    t.integer('max_energy').notNullable().defaultTo(500);
    t.bigInteger('credits').notNullable().defaultTo(0); // $COHO
    t.jsonb('explored_sectors').notNullable().defaultTo('[]');
    t.timestamp('last_login').nullable();
    t.timestamp('energy_regen_bonus_until').nullable(); // 2x regen for new players
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('players');
}
```

**Step 2: Create sectors migration**

`server/src/db/migrations/002_sectors.ts`:
```typescript
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('sectors', (t) => {
    t.integer('id').primary();
    t.enum('type', ['standard', 'one_way', 'protected', 'harmony_enforced']).notNullable().defaultTo('standard');
    t.boolean('has_star_mall').notNullable().defaultTo(false);
    t.boolean('has_seed_planet').notNullable().defaultTo(false);
    t.integer('region_id').nullable(); // cluster grouping
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('sector_edges', (t) => {
    t.integer('from_sector_id').notNullable().references('id').inTable('sectors').onDelete('CASCADE');
    t.integer('to_sector_id').notNullable().references('id').inTable('sectors').onDelete('CASCADE');
    t.boolean('one_way').notNullable().defaultTo(false);
    t.primary(['from_sector_id', 'to_sector_id']);
  });

  await knex.schema.raw('CREATE INDEX idx_sector_edges_from ON sector_edges(from_sector_id)');
  await knex.schema.raw('CREATE INDEX idx_sector_edges_to ON sector_edges(to_sector_id)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('sector_edges');
  await knex.schema.dropTableIfExists('sectors');
}
```

**Step 3: Create ships migration**

`server/src/db/migrations/003_ships.ts`:
```typescript
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Ship type definitions (templates)
  await knex.schema.createTable('ship_types', (t) => {
    t.string('id', 32).primary(); // e.g. 'scout', 'freighter', 'battleship'
    t.string('name').notNullable();
    t.text('description');
    t.integer('base_weapon_energy').notNullable();
    t.integer('max_weapon_energy').notNullable();
    t.integer('base_cargo_holds').notNullable();
    t.integer('max_cargo_holds').notNullable();
    t.integer('base_engine_energy').notNullable();
    t.integer('max_engine_energy').notNullable();
    t.float('attack_ratio').notNullable().defaultTo(1.0);
    t.float('defense_ratio').notNullable().defaultTo(1.0);
    t.integer('recharge_delay_ms').notNullable().defaultTo(5000); // ms between volleys
    t.integer('fuel_per_sector').notNullable().defaultTo(1);
    t.integer('price').notNullable();
    t.boolean('can_cloak').notNullable().defaultTo(false);
    t.boolean('can_carry_pgd').notNullable().defaultTo(false);
    t.boolean('can_carry_mines').notNullable().defaultTo(false);
    t.boolean('can_tow').notNullable().defaultTo(false);
    t.boolean('has_jump_drive_slot').notNullable().defaultTo(false);
    t.boolean('has_planetary_scanner').notNullable().defaultTo(false);
    t.integer('max_drones').notNullable().defaultTo(1);
    t.float('tow_fuel_multiplier').notNullable().defaultTo(2.0);
  });

  // Player-owned ship instances
  await knex.schema.createTable('ships', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.string('ship_type_id', 32).notNullable().references('id').inTable('ship_types');
    t.uuid('owner_id').nullable().references('id').inTable('players').onDelete('SET NULL');
    t.string('name', 64).nullable();
    t.integer('sector_id').nullable().references('id').inTable('sectors');
    t.integer('weapon_energy').notNullable();
    t.integer('max_weapon_energy').notNullable();
    t.integer('engine_energy').notNullable();
    t.integer('max_engine_energy').notNullable();
    t.integer('cargo_holds').notNullable();
    t.integer('max_cargo_holds').notNullable();
    t.integer('cyrillium_cargo').notNullable().defaultTo(0);
    t.integer('food_cargo').notNullable().defaultTo(0);
    t.integer('tech_cargo').notNullable().defaultTo(0);
    t.integer('colonist_cargo').notNullable().defaultTo(0);
    t.boolean('is_cloaked').notNullable().defaultTo(false);
    t.integer('cloak_cells').notNullable().defaultTo(0);
    t.boolean('has_rache_device').notNullable().defaultTo(false);
    t.boolean('has_jump_drive').notNullable().defaultTo(false);
    t.uuid('towing_ship_id').nullable(); // ship being towed
    t.boolean('is_destroyed').notNullable().defaultTo(false);
    t.boolean('is_registered').notNullable().defaultTo(true); // false for captured unregistered ships
    t.uuid('stored_at_star_mall_sector').nullable(); // if in garage
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  // DodgePods (created when ship destroyed)
  await knex.schema.createTable('dodge_pods', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.uuid('player_id').notNullable().references('id').inTable('players').onDelete('CASCADE');
    t.integer('sector_id').notNullable().references('id').inTable('sectors');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('dodge_pods');
  await knex.schema.dropTableIfExists('ships');
  await knex.schema.dropTableIfExists('ship_types');
}
```

**Step 4: Create outposts migration**

`server/src/db/migrations/004_outposts.ts`:
```typescript
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('outposts', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.string('name').notNullable();
    t.integer('sector_id').notNullable().references('id').inTable('sectors');
    t.boolean('sells_fuel').notNullable().defaultTo(false);
    // Commodity inventory (what the outpost has in stock)
    t.integer('cyrillium_stock').notNullable().defaultTo(0);
    t.integer('food_stock').notNullable().defaultTo(0);
    t.integer('tech_stock').notNullable().defaultTo(0);
    // Max capacity
    t.integer('cyrillium_capacity').notNullable().defaultTo(10000);
    t.integer('food_capacity').notNullable().defaultTo(10000);
    t.integer('tech_capacity').notNullable().defaultTo(10000);
    // Which commodities this outpost buys/sells (B=buys, S=sells)
    t.enum('cyrillium_mode', ['buy', 'sell', 'none']).notNullable().defaultTo('none');
    t.enum('food_mode', ['buy', 'sell', 'none']).notNullable().defaultTo('none');
    t.enum('tech_mode', ['buy', 'sell', 'none']).notNullable().defaultTo('none');
    // Treasury
    t.bigInteger('treasury').notNullable().defaultTo(50000);
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('outposts');
}
```

**Step 5: Create planets migration**

`server/src/db/migrations/005_planets.ts`:
```typescript
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('planets', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.string('name').notNullable();
    t.integer('sector_id').notNullable().references('id').inTable('sectors');
    t.uuid('owner_id').nullable().references('id').inTable('players').onDelete('SET NULL');
    t.uuid('syndicate_id').nullable(); // FK added after syndicates table
    t.enum('planet_class', ['H', 'D', 'O', 'A', 'F', 'V', 'G', 'S']).notNullable();
    t.integer('colonists').notNullable().defaultTo(0);
    t.integer('ideal_population').notNullable().defaultTo(10000);
    t.integer('upgrade_level').notNullable().defaultTo(0); // 0-7
    // Stockpiles
    t.integer('cyrillium_stock').notNullable().defaultTo(0);
    t.integer('food_stock').notNullable().defaultTo(0);
    t.integer('tech_stock').notNullable().defaultTo(0);
    t.integer('refined_cyrillium').notNullable().defaultTo(0);
    // Defenses (level 2+)
    t.integer('drone_count').notNullable().defaultTo(0);
    t.enum('drone_mode', ['offensive', 'defensive', 'toll']).nullable();
    // Atmospheric defenses (level 3+)
    t.integer('cannon_energy').notNullable().defaultTo(0);
    t.integer('cannon_max_energy').notNullable().defaultTo(0);
    t.integer('cannon_shot_power').notNullable().defaultTo(10); // default energy per shot
    // PSD (level 4+)
    t.boolean('psd_active').notNullable().defaultTo(false);
    t.integer('psd_intensity').notNullable().defaultTo(5);
    // Shield (level 5+)
    t.integer('shield_energy').notNullable().defaultTo(0);
    t.integer('shield_max_energy').notNullable().defaultTo(0);
    // AATB (level 6+)
    t.boolean('aatb_active').notNullable().defaultTo(false);
    // Warp (level 7)
    t.boolean('has_warp_drive').notNullable().defaultTo(false);
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('planets');
}
```

**Step 6: Create syndicates migration**

`server/src/db/migrations/006_syndicates.ts`:
```typescript
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('syndicates', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.string('name', 64).notNullable().unique();
    t.text('charter').nullable();
    t.bigInteger('treasury').notNullable().defaultTo(0);
    t.uuid('leader_id').notNullable().references('id').inTable('players');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('syndicate_members', (t) => {
    t.uuid('syndicate_id').notNullable().references('id').inTable('syndicates').onDelete('CASCADE');
    t.uuid('player_id').notNullable().references('id').inTable('players').onDelete('CASCADE');
    t.enum('role', ['leader', 'officer', 'member']).notNullable().defaultTo('member');
    t.timestamp('joined_at').notNullable().defaultTo(knex.fn.now());
    t.primary(['syndicate_id', 'player_id']);
  });

  await knex.schema.createTable('alliances', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    // Player-to-player alliances
    t.uuid('player_a_id').nullable().references('id').inTable('players').onDelete('CASCADE');
    t.uuid('player_b_id').nullable().references('id').inTable('players').onDelete('CASCADE');
    // Syndicate-to-syndicate alliances
    t.uuid('syndicate_a_id').nullable().references('id').inTable('syndicates').onDelete('CASCADE');
    t.uuid('syndicate_b_id').nullable().references('id').inTable('syndicates').onDelete('CASCADE');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  // Add syndicate FK to planets
  await knex.schema.alterTable('planets', (t) => {
    t.foreign('syndicate_id').references('id').inTable('syndicates').onDelete('SET NULL');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('planets', (t) => {
    t.dropForeign('syndicate_id');
  });
  await knex.schema.dropTableIfExists('alliances');
  await knex.schema.dropTableIfExists('syndicate_members');
  await knex.schema.dropTableIfExists('syndicates');
}
```

**Step 7: Create deployables migration**

`server/src/db/migrations/007_deployables.ts`:
```typescript
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('deployables', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.uuid('owner_id').notNullable().references('id').inTable('players').onDelete('CASCADE');
    t.integer('sector_id').notNullable().references('id').inTable('sectors');
    t.enum('type', ['drone_offensive', 'drone_defensive', 'drone_toll', 'mine_halberd', 'mine_barnacle', 'buoy']).notNullable();
    t.integer('power_level').notNullable().defaultTo(1); // 1-3 for drones
    t.integer('toll_amount').nullable(); // for toll drones
    t.string('buoy_message', 256).nullable(); // for buoys
    t.jsonb('buoy_log').nullable(); // ships that passed by
    t.uuid('attached_to_ship_id').nullable(); // for barnacle mines
    t.integer('health').notNullable().defaultTo(100);
    t.timestamp('deployed_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('expires_at').notNullable(); // ~7 days from deploy
    t.timestamp('last_maintained_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.raw('CREATE INDEX idx_deployables_sector ON deployables(sector_id)');
  await knex.schema.raw('CREATE INDEX idx_deployables_owner ON deployables(owner_id)');
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('deployables');
}
```

**Step 8: Create logs migration**

`server/src/db/migrations/008_logs.ts`:
```typescript
import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('combat_logs', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.uuid('attacker_id').notNullable().references('id').inTable('players');
    t.uuid('defender_id').notNullable().references('id').inTable('players');
    t.integer('sector_id').notNullable().references('id').inTable('sectors');
    t.integer('energy_expended').notNullable();
    t.integer('damage_dealt').notNullable();
    t.enum('outcome', ['hit', 'miss', 'ship_destroyed', 'ship_captured', 'fled']).notNullable();
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('trade_logs', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.uuid('player_id').notNullable().references('id').inTable('players');
    t.uuid('outpost_id').notNullable().references('id').inTable('outposts');
    t.enum('commodity', ['cyrillium', 'food', 'tech']).notNullable();
    t.integer('quantity').notNullable();
    t.integer('price_per_unit').notNullable();
    t.bigInteger('total_price').notNullable();
    t.enum('direction', ['buy', 'sell']).notNullable();
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  // General event log for notifications
  await knex.schema.createTable('game_events', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.uuid('player_id').notNullable().references('id').inTable('players');
    t.string('event_type', 64).notNullable(); // 'attacked', 'trade_complete', 'planet_milestone', etc.
    t.jsonb('data').notNullable().defaultTo('{}');
    t.boolean('read').notNullable().defaultTo(false);
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.raw('CREATE INDEX idx_game_events_player ON game_events(player_id, read)');

  // Bounties (Justice Center)
  await knex.schema.createTable('bounties', (t) => {
    t.uuid('id').primary().defaultTo(knex.fn.uuid());
    t.uuid('placed_by_id').notNullable().references('id').inTable('players');
    t.uuid('target_player_id').nullable().references('id').inTable('players');
    t.uuid('target_ship_id').nullable().references('id').inTable('ships');
    t.bigInteger('reward').notNullable();
    t.boolean('active').notNullable().defaultTo(true);
    t.uuid('claimed_by_id').nullable().references('id').inTable('players');
    t.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    t.timestamp('claimed_at').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('bounties');
  await knex.schema.dropTableIfExists('game_events');
  await knex.schema.dropTableIfExists('trade_logs');
  await knex.schema.dropTableIfExists('combat_logs');
}
```

**Step 9: Run migrations**

```bash
cd /workspace/cosmic-horizon/server
npx knex migrate:latest --knexfile knexfile.ts
# Expected: Batch 1 run: 8 migrations
```

**Step 10: Verify tables exist**

```bash
docker exec -it $(docker ps -q -f name=postgres) psql -U coho cosmic_horizon -c "\dt"
# Expected: list of all created tables
```

**Step 11: Commit**

```bash
git add server/src/db/migrations/
git commit -m "feat: add all core database migrations"
```

---

### Task 4: Game Configuration Constants

**Files:**
- Create: `server/src/config/game.ts`
- Create: `server/src/config/ship-types.ts`
- Create: `server/src/config/planet-types.ts`

**Step 1: Create game constants**

`server/src/config/game.ts`:
```typescript
export const GAME_CONFIG = {
  // Energy / Action Points
  MAX_ENERGY: 500,
  ENERGY_REGEN_RATE: 1, // per minute
  ENERGY_REGEN_BONUS_MULTIPLIER: 2, // for new players
  ENERGY_REGEN_BONUS_DURATION_HOURS: 72,

  // AP costs
  AP_COST_MOVE: 1,
  AP_COST_TRADE: 1,
  AP_COST_COMBAT_VOLLEY: 2,
  AP_COST_DEPLOY: 1,

  // Universe
  TOTAL_SECTORS: 5000,
  SECTORS_PER_REGION: 35, // average cluster size
  MAX_ADJACENT_SECTORS: 12,
  SECTOR_TYPE_DISTRIBUTION: {
    standard: 0.85,
    one_way: 0.05,
    protected: 0.05,
    harmony_enforced: 0.05,
  },
  NUM_STAR_MALLS: 8,
  NUM_SEED_PLANETS: 6,
  NUM_OUTPOSTS: 200,
  NUM_STARTING_PLANETS: 300,

  // Economy
  STARTING_CREDITS: 10000,
  OUTPOST_BASE_TREASURY: 50000,
  OUTPOST_TREASURY_INJECTION: 500, // per game tick
  BASE_CYRILLIUM_PRICE: 10,
  BASE_FOOD_PRICE: 25,
  BASE_TECH_PRICE: 50,
  PRICE_ELASTICITY: 0.02, // price change per unit of supply delta

  // Decay
  DECAY_INACTIVE_THRESHOLD_HOURS: 48,
  DECAY_COLONIST_RATE: 0.015, // 1.5% per day
  DECAY_DEFENSE_DRAIN_RATE: 0.01, // 1% energy per tick
  DEPLOYABLE_LIFETIME_DAYS: 7,

  // Combat
  MIN_FLEE_CHANCE: 0.15,
  MULTI_SHIP_FLEE_BONUS: 0.10, // per additional attacker
  RACHE_DAMAGE_MULTIPLIER: 0.5,

  // Game tick interval
  TICK_INTERVAL_MS: 60000, // 60 seconds

  // New player
  STARTER_SHIP_TYPE: 'scout',
} as const;
```

**Step 2: Create ship type definitions**

`server/src/config/ship-types.ts`:
```typescript
export interface ShipTypeConfig {
  id: string;
  name: string;
  description: string;
  baseWeaponEnergy: number;
  maxWeaponEnergy: number;
  baseCargoHolds: number;
  maxCargoHolds: number;
  baseEngineEnergy: number;
  maxEngineEnergy: number;
  attackRatio: number;
  defenseRatio: number;
  rechargeDelayMs: number;
  fuelPerSector: number;
  price: number;
  canCloak: boolean;
  canCarryPgd: boolean;
  canCarryMines: boolean;
  canTow: boolean;
  hasJumpDriveSlot: boolean;
  hasPlanetaryScanner: boolean;
  maxDrones: number;
  towFuelMultiplier: number;
}

export const SHIP_TYPES: ShipTypeConfig[] = [
  {
    id: 'dodge_pod',
    name: 'DodgePod',
    description: 'Emergency escape pod. No weapons, no cargo.',
    baseWeaponEnergy: 0, maxWeaponEnergy: 0,
    baseCargoHolds: 0, maxCargoHolds: 0,
    baseEngineEnergy: 20, maxEngineEnergy: 20,
    attackRatio: 0, defenseRatio: 0,
    rechargeDelayMs: 0, fuelPerSector: 1, price: 0,
    canCloak: false, canCarryPgd: false, canCarryMines: false,
    canTow: false, hasJumpDriveSlot: false, hasPlanetaryScanner: false,
    maxDrones: 0, towFuelMultiplier: 1,
  },
  {
    id: 'scout',
    name: 'Calvatian Scout',
    description: 'A nimble starter ship. Light weapons, modest cargo. Good for exploration and early trading.',
    baseWeaponEnergy: 25, maxWeaponEnergy: 75,
    baseCargoHolds: 10, maxCargoHolds: 20,
    baseEngineEnergy: 50, maxEngineEnergy: 100,
    attackRatio: 0.8, defenseRatio: 1.0,
    rechargeDelayMs: 4000, fuelPerSector: 1, price: 5000,
    canCloak: false, canCarryPgd: false, canCarryMines: false,
    canTow: false, hasJumpDriveSlot: false, hasPlanetaryScanner: false,
    maxDrones: 1, towFuelMultiplier: 1,
  },
  {
    id: 'freighter',
    name: 'Tar\'ri Freighter',
    description: 'Built for hauling. Massive cargo capacity but weak in combat.',
    baseWeaponEnergy: 15, maxWeaponEnergy: 50,
    baseCargoHolds: 40, maxCargoHolds: 80,
    baseEngineEnergy: 60, maxEngineEnergy: 120,
    attackRatio: 0.5, defenseRatio: 0.8,
    rechargeDelayMs: 8000, fuelPerSector: 2, price: 15000,
    canCloak: false, canCarryPgd: false, canCarryMines: false,
    canTow: true, hasJumpDriveSlot: false, hasPlanetaryScanner: false,
    maxDrones: 1, towFuelMultiplier: 2.0,
  },
  {
    id: 'corvette',
    name: 'Muscarian Corvette',
    description: 'A balanced warship. Decent weapons and cargo. Can carry mines.',
    baseWeaponEnergy: 50, maxWeaponEnergy: 150,
    baseCargoHolds: 15, maxCargoHolds: 30,
    baseEngineEnergy: 75, maxEngineEnergy: 150,
    attackRatio: 1.2, defenseRatio: 1.0,
    rechargeDelayMs: 5000, fuelPerSector: 2, price: 30000,
    canCloak: false, canCarryPgd: false, canCarryMines: true,
    canTow: true, hasJumpDriveSlot: false, hasPlanetaryScanner: false,
    maxDrones: 2, towFuelMultiplier: 1.8,
  },
  {
    id: 'cruiser',
    name: 'Vedic Cruiser',
    description: 'Advanced multi-role vessel. Strong scanners, can carry PGDs. Jump drive capable.',
    baseWeaponEnergy: 75, maxWeaponEnergy: 200,
    baseCargoHolds: 20, maxCargoHolds: 40,
    baseEngineEnergy: 100, maxEngineEnergy: 200,
    attackRatio: 1.5, defenseRatio: 1.2,
    rechargeDelayMs: 5000, fuelPerSector: 3, price: 75000,
    canCloak: false, canCarryPgd: true, canCarryMines: true,
    canTow: true, hasJumpDriveSlot: true, hasPlanetaryScanner: true,
    maxDrones: 2, towFuelMultiplier: 1.5,
  },
  {
    id: 'battleship',
    name: 'Kalin Battleship',
    description: 'Devastating firepower and heavy defenses. Slow, expensive, and feared.',
    baseWeaponEnergy: 100, maxWeaponEnergy: 300,
    baseCargoHolds: 10, maxCargoHolds: 25,
    baseEngineEnergy: 80, maxEngineEnergy: 180,
    attackRatio: 2.0, defenseRatio: 1.0,
    rechargeDelayMs: 7000, fuelPerSector: 4, price: 150000,
    canCloak: false, canCarryPgd: true, canCarryMines: true,
    canTow: true, hasJumpDriveSlot: true, hasPlanetaryScanner: true,
    maxDrones: 3, towFuelMultiplier: 1.5,
  },
  {
    id: 'stealth',
    name: 'Shadow Runner',
    description: 'Cloaking-capable vessel. Light weapons but nearly invisible. Perfect for espionage.',
    baseWeaponEnergy: 30, maxWeaponEnergy: 80,
    baseCargoHolds: 8, maxCargoHolds: 15,
    baseEngineEnergy: 60, maxEngineEnergy: 120,
    attackRatio: 0.9, defenseRatio: 1.5,
    rechargeDelayMs: 3000, fuelPerSector: 2, price: 50000,
    canCloak: true, canCarryPgd: false, canCarryMines: true,
    canTow: false, hasJumpDriveSlot: false, hasPlanetaryScanner: false,
    maxDrones: 1, towFuelMultiplier: 1,
  },
  {
    id: 'colony_ship',
    name: 'Muscarian Colony Ship',
    description: 'Specialized for transporting colonists. High capacity, minimal combat ability.',
    baseWeaponEnergy: 10, maxWeaponEnergy: 30,
    baseCargoHolds: 60, maxCargoHolds: 100,
    baseEngineEnergy: 50, maxEngineEnergy: 100,
    attackRatio: 0.3, defenseRatio: 0.5,
    rechargeDelayMs: 10000, fuelPerSector: 3, price: 25000,
    canCloak: false, canCarryPgd: false, canCarryMines: false,
    canTow: false, hasJumpDriveSlot: false, hasPlanetaryScanner: false,
    maxDrones: 0, towFuelMultiplier: 1,
  },
];
```

**Step 3: Create planet type definitions**

`server/src/config/planet-types.ts`:
```typescript
export interface PlanetTypeConfig {
  classId: string;
  name: string;
  idealPopulation: number;
  productionRates: {
    cyrillium: number;  // units per 1000 colonists per tick
    food: number;
    tech: number;
    drones: number; // drones per 1000 colonists per day
  };
  colonistGrowthRate: number; // % growth per tick when resources available
}

export const PLANET_TYPES: Record<string, PlanetTypeConfig> = {
  H: {
    classId: 'H',
    name: 'Goldilocks (Hospitable)',
    idealPopulation: 15000,
    productionRates: { cyrillium: 2, food: 8, tech: 3, drones: 0.5 },
    colonistGrowthRate: 0.003,
  },
  D: {
    classId: 'D',
    name: 'Desert',
    idealPopulation: 8000,
    productionRates: { cyrillium: 8, food: 1, tech: 2, drones: 0.3 },
    colonistGrowthRate: 0.001,
  },
  O: {
    classId: 'O',
    name: 'Ocean',
    idealPopulation: 12000,
    productionRates: { cyrillium: 1, food: 10, tech: 1, drones: 0.2 },
    colonistGrowthRate: 0.0025,
  },
  A: {
    classId: 'A',
    name: 'Alpine',
    idealPopulation: 10000,
    productionRates: { cyrillium: 3, food: 4, tech: 5, drones: 0.4 },
    colonistGrowthRate: 0.002,
  },
  F: {
    classId: 'F',
    name: 'Frozen',
    idealPopulation: 6000,
    productionRates: { cyrillium: 5, food: 1, tech: 6, drones: 0.6 },
    colonistGrowthRate: 0.001,
  },
  V: {
    classId: 'V',
    name: 'Volcanic',
    idealPopulation: 5000,
    productionRates: { cyrillium: 10, food: 0, tech: 4, drones: 0.8 },
    colonistGrowthRate: 0.0008,
  },
  G: {
    classId: 'G',
    name: 'Gaseous',
    idealPopulation: 3000,
    productionRates: { cyrillium: 12, food: 0, tech: 8, drones: 0.1 },
    colonistGrowthRate: 0.0005,
  },
  S: {
    classId: 'S',
    name: 'Seed Planet',
    idealPopulation: 50000,
    productionRates: { cyrillium: 0, food: 5, tech: 0, drones: 0 },
    colonistGrowthRate: 0.005, // fast growth - always producing colonists
  },
};

// Upgrade requirements per level
export const UPGRADE_REQUIREMENTS: Record<number, {
  colonists: number;
  cyrillium: number;
  food: number;
  tech: number;
  credits: number;
}> = {
  1: { colonists: 1000, cyrillium: 100, food: 200, tech: 100, credits: 5000 },
  2: { colonists: 3000, cyrillium: 300, food: 500, tech: 300, credits: 15000 },
  3: { colonists: 5000, cyrillium: 800, food: 800, tech: 800, credits: 40000 },
  4: { colonists: 8000, cyrillium: 1500, food: 1000, tech: 1500, credits: 80000 },
  5: { colonists: 10000, cyrillium: 3000, food: 1500, tech: 3000, credits: 150000 },
  6: { colonists: 12000, cyrillium: 5000, food: 2000, tech: 5000, credits: 250000 },
  7: { colonists: 15000, cyrillium: 10000, food: 3000, tech: 10000, credits: 500000 },
};
```

**Step 4: Commit**

```bash
git add server/src/config/
git commit -m "feat: add game configuration constants, ship types, and planet types"
```

---

## Phase 2: Game Engine Core

### Task 5: Universe Generation Engine

**Files:**
- Create: `server/src/engine/universe.ts`
- Create: `server/src/engine/__tests__/universe.test.ts`

**Step 1: Write failing test for universe generation**

`server/src/engine/__tests__/universe.test.ts`:
```typescript
import { generateUniverse, UniverseGraph } from '../universe';
import { GAME_CONFIG } from '../../config/game';

describe('Universe Generation', () => {
  let universe: UniverseGraph;

  beforeAll(() => {
    universe = generateUniverse(100, 42); // small test universe with seed
  });

  test('generates correct number of sectors', () => {
    expect(universe.sectors.size).toBe(100);
  });

  test('all sectors are connected (no isolated nodes)', () => {
    const visited = new Set<number>();
    const queue = [universe.sectors.keys().next().value!];
    while (queue.length > 0) {
      const current = queue.pop()!;
      if (visited.has(current)) continue;
      visited.add(current);
      const edges = universe.edges.get(current) || [];
      for (const edge of edges) {
        if (!visited.has(edge.to)) queue.push(edge.to);
      }
    }
    expect(visited.size).toBe(100);
  });

  test('sectors have max 12 adjacent sectors', () => {
    for (const [sectorId, edges] of universe.edges) {
      expect(edges.length).toBeLessThanOrEqual(12);
    }
  });

  test('includes star malls in protected sectors', () => {
    const starMalls = [...universe.sectors.values()].filter(s => s.hasStarMall);
    expect(starMalls.length).toBeGreaterThanOrEqual(1);
    for (const mall of starMalls) {
      expect(mall.type).toBe('protected');
    }
  });

  test('deterministic with same seed', () => {
    const universe2 = generateUniverse(100, 42);
    expect(universe2.sectors.size).toBe(universe.sectors.size);
    // Same seed should produce same graph
    const sector1 = universe.sectors.get(1);
    const sector2 = universe2.sectors.get(1);
    expect(sector1?.type).toBe(sector2?.type);
  });
});
```

**Step 2: Install test dependencies and run to verify failure**

```bash
cd /workspace/cosmic-horizon/server
npm install -D jest ts-jest @types/jest
npx ts-jest config:init
npx jest --testPathPattern=universe --verbose
# Expected: FAIL - Cannot find module '../universe'
```

**Step 3: Implement universe generation**

`server/src/engine/universe.ts`:
```typescript
import { GAME_CONFIG } from '../config/game';

export interface SectorData {
  id: number;
  type: 'standard' | 'one_way' | 'protected' | 'harmony_enforced';
  hasStarMall: boolean;
  hasSeedPlanet: boolean;
  regionId: number;
}

export interface SectorEdge {
  from: number;
  to: number;
  oneWay: boolean;
}

export interface UniverseGraph {
  sectors: Map<number, SectorData>;
  edges: Map<number, SectorEdge[]>;
}

// Seeded random number generator (mulberry32)
function createRng(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleArray<T>(arr: T[], rng: () => number): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateUniverse(
  totalSectors: number = GAME_CONFIG.TOTAL_SECTORS,
  seed: number = Date.now()
): UniverseGraph {
  const rng = createRng(seed);
  const sectors = new Map<number, SectorData>();
  const edges = new Map<number, SectorEdge[]>();

  // Initialize all sectors
  for (let i = 1; i <= totalSectors; i++) {
    sectors.set(i, {
      id: i,
      type: 'standard',
      hasStarMall: false,
      hasSeedPlanet: false,
      regionId: 0,
    });
    edges.set(i, []);
  }

  // Generate regions (clusters)
  const avgRegionSize = Math.max(5, Math.floor(totalSectors / Math.ceil(totalSectors / GAME_CONFIG.SECTORS_PER_REGION)));
  const sectorIds = shuffleArray([...Array(totalSectors)].map((_, i) => i + 1), rng);
  let regionId = 0;
  let idx = 0;

  const regions: number[][] = [];
  while (idx < sectorIds.length) {
    const regionSize = Math.max(3, Math.floor(avgRegionSize * (0.6 + rng() * 0.8)));
    const region = sectorIds.slice(idx, idx + regionSize);
    regions.push(region);
    for (const sid of region) {
      sectors.get(sid)!.regionId = regionId;
    }
    regionId++;
    idx += regionSize;
  }

  // Connect sectors within each region (create a connected subgraph)
  for (const region of regions) {
    // Create a spanning tree first (ensures connectivity)
    for (let i = 1; i < region.length; i++) {
      const connectTo = region[Math.floor(rng() * i)];
      addEdge(edges, region[i], connectTo, false);
    }
    // Add extra edges within region for richer connectivity
    const extraEdges = Math.floor(region.length * 0.5);
    for (let i = 0; i < extraEdges; i++) {
      const a = region[Math.floor(rng() * region.length)];
      const b = region[Math.floor(rng() * region.length)];
      if (a !== b && (edges.get(a)?.length || 0) < GAME_CONFIG.MAX_ADJACENT_SECTORS) {
        addEdge(edges, a, b, false);
      }
    }
  }

  // Connect regions together (inter-region edges)
  // Create a spanning tree of regions first
  for (let i = 1; i < regions.length; i++) {
    const targetRegion = regions[Math.floor(rng() * i)];
    const sourceNode = regions[i][Math.floor(rng() * regions[i].length)];
    const targetNode = targetRegion[Math.floor(rng() * targetRegion.length)];
    addEdge(edges, sourceNode, targetNode, false);
  }

  // Add a few extra inter-region connections
  const extraInterRegion = Math.floor(regions.length * 0.3);
  for (let i = 0; i < extraInterRegion; i++) {
    const rA = Math.floor(rng() * regions.length);
    const rB = Math.floor(rng() * regions.length);
    if (rA !== rB) {
      const a = regions[rA][Math.floor(rng() * regions[rA].length)];
      const b = regions[rB][Math.floor(rng() * regions[rB].length)];
      addEdge(edges, a, b, false);
    }
  }

  // Assign sector types
  const allSectorIds = [...sectors.keys()];
  const shuffledIds = shuffleArray(allSectorIds, rng);

  // Calculate counts
  const numStarMalls = Math.max(1, Math.min(GAME_CONFIG.NUM_STAR_MALLS, Math.floor(totalSectors / 500)));
  const numSeedPlanets = Math.max(1, Math.min(GAME_CONFIG.NUM_SEED_PLANETS, Math.floor(totalSectors / 300)));
  const numOneWay = Math.floor(totalSectors * GAME_CONFIG.SECTOR_TYPE_DISTRIBUTION.one_way);
  const numProtected = Math.floor(totalSectors * GAME_CONFIG.SECTOR_TYPE_DISTRIBUTION.protected);

  let assignIdx = 0;

  // Assign star malls (protected sectors)
  for (let i = 0; i < numStarMalls && assignIdx < shuffledIds.length; i++, assignIdx++) {
    const sid = shuffledIds[assignIdx];
    const sector = sectors.get(sid)!;
    sector.type = 'protected';
    sector.hasStarMall = true;
    // Mark adjacent sectors as protected too
    for (const edge of edges.get(sid) || []) {
      sectors.get(edge.to)!.type = 'protected';
    }
  }

  // Assign seed planets (in protected sectors near star malls)
  let seedsPlaced = 0;
  for (const [sid, sector] of sectors) {
    if (seedsPlaced >= numSeedPlanets) break;
    if (sector.type === 'protected' && !sector.hasStarMall && !sector.hasSeedPlanet) {
      sector.hasSeedPlanet = true;
      seedsPlaced++;
    }
  }
  // If not enough protected sectors, place remaining seed planets in fresh protected sectors
  while (seedsPlaced < numSeedPlanets && assignIdx < shuffledIds.length) {
    const sid = shuffledIds[assignIdx++];
    const sector = sectors.get(sid)!;
    if (sector.type === 'standard') {
      sector.type = 'protected';
      sector.hasSeedPlanet = true;
      seedsPlaced++;
    }
  }

  // Assign one-way sectors
  let oneWayCount = 0;
  for (; assignIdx < shuffledIds.length && oneWayCount < numOneWay; assignIdx++) {
    const sid = shuffledIds[assignIdx];
    const sector = sectors.get(sid)!;
    if (sector.type === 'standard') {
      sector.type = 'one_way';
      // Convert one random outgoing edge to one-way
      const sectorEdges = edges.get(sid) || [];
      if (sectorEdges.length > 0) {
        const edgeIdx = Math.floor(rng() * sectorEdges.length);
        const edge = sectorEdges[edgeIdx];
        edge.oneWay = true;
        // Remove the reverse edge
        const reverseEdges = edges.get(edge.to) || [];
        const revIdx = reverseEdges.findIndex(e => e.to === sid);
        if (revIdx >= 0) reverseEdges.splice(revIdx, 1);
      }
      oneWayCount++;
    }
  }

  // Mark harmony-enforced routes between star malls and seed planets
  const starMallSectors = [...sectors.values()].filter(s => s.hasStarMall);
  const seedPlanetSectors = [...sectors.values()].filter(s => s.hasSeedPlanet);

  for (const mall of starMallSectors) {
    for (const seed of seedPlanetSectors) {
      // Find shortest path and mark as harmony enforced (simplified: just mark direct neighbors)
      const path = findShortestPath(edges, mall.id, seed.id, sectors);
      if (path) {
        for (const sid of path) {
          const sector = sectors.get(sid)!;
          if (sector.type === 'standard') {
            sector.type = 'harmony_enforced';
          }
        }
      }
    }
  }

  return { sectors, edges };
}

function addEdge(
  edges: Map<number, SectorEdge[]>,
  from: number,
  to: number,
  oneWay: boolean
): void {
  const fromEdges = edges.get(from) || [];
  const toEdges = edges.get(to) || [];

  // Don't add duplicate edges
  if (fromEdges.some(e => e.to === to)) return;

  fromEdges.push({ from, to, oneWay });
  edges.set(from, fromEdges);

  if (!oneWay) {
    if (!toEdges.some(e => e.to === from)) {
      toEdges.push({ from: to, to: from, oneWay: false });
      edges.set(to, toEdges);
    }
  }
}

// BFS shortest path
function findShortestPath(
  edges: Map<number, SectorEdge[]>,
  start: number,
  end: number,
  sectors: Map<number, SectorData>,
  maxDepth: number = 20
): number[] | null {
  if (start === end) return [start];

  const visited = new Set<number>();
  const queue: Array<{ node: number; path: number[] }> = [{ node: start, path: [start] }];
  visited.add(start);

  while (queue.length > 0) {
    const { node, path } = queue.shift()!;
    if (path.length > maxDepth) continue;

    for (const edge of edges.get(node) || []) {
      if (visited.has(edge.to)) continue;
      const newPath = [...path, edge.to];
      if (edge.to === end) return newPath;
      visited.add(edge.to);
      queue.push({ node: edge.to, path: newPath });
    }
  }
  return null;
}

export { findShortestPath };
```

**Step 4: Run tests**

```bash
cd /workspace/cosmic-horizon/server
npx jest --testPathPattern=universe --verbose
# Expected: All 5 tests pass
```

**Step 5: Commit**

```bash
git add server/src/engine/universe.ts server/src/engine/__tests__/
git commit -m "feat: implement procedural universe generation with seeded RNG"
```

---

### Task 6: Energy System Engine

**Files:**
- Create: `server/src/engine/energy.ts`
- Create: `server/src/engine/__tests__/energy.test.ts`

**Step 1: Write failing test**

`server/src/engine/__tests__/energy.test.ts`:
```typescript
import { calculateEnergyRegen, canAffordAction, deductEnergy } from '../energy';
import { GAME_CONFIG } from '../../config/game';

describe('Energy System', () => {
  test('calculates standard regen correctly', () => {
    const minutesPassed = 5;
    const currentEnergy = 100;
    const result = calculateEnergyRegen(currentEnergy, GAME_CONFIG.MAX_ENERGY, minutesPassed, false);
    expect(result).toBe(105);
  });

  test('caps at max energy', () => {
    const result = calculateEnergyRegen(498, 500, 10, false);
    expect(result).toBe(500);
  });

  test('applies bonus multiplier for new players', () => {
    const result = calculateEnergyRegen(100, 500, 5, true);
    expect(result).toBe(110); // 5 * 2 = 10
  });

  test('canAffordAction checks correctly', () => {
    expect(canAffordAction(10, 'move')).toBe(true);
    expect(canAffordAction(0, 'move')).toBe(false);
    expect(canAffordAction(1, 'combat_volley')).toBe(false);
    expect(canAffordAction(2, 'combat_volley')).toBe(true);
  });

  test('deductEnergy returns correct remaining', () => {
    expect(deductEnergy(100, 'move')).toBe(99);
    expect(deductEnergy(100, 'trade')).toBe(99);
    expect(deductEnergy(100, 'combat_volley')).toBe(98);
    expect(deductEnergy(100, 'deploy')).toBe(99);
  });
});
```

**Step 2: Run test to verify failure**

```bash
npx jest --testPathPattern=energy --verbose
# Expected: FAIL
```

**Step 3: Implement energy system**

`server/src/engine/energy.ts`:
```typescript
import { GAME_CONFIG } from '../config/game';

export type ActionType = 'move' | 'trade' | 'combat_volley' | 'deploy' | 'planet_management';

const AP_COSTS: Record<ActionType, number> = {
  move: GAME_CONFIG.AP_COST_MOVE,
  trade: GAME_CONFIG.AP_COST_TRADE,
  combat_volley: GAME_CONFIG.AP_COST_COMBAT_VOLLEY,
  deploy: GAME_CONFIG.AP_COST_DEPLOY,
  planet_management: 0,
};

export function calculateEnergyRegen(
  currentEnergy: number,
  maxEnergy: number,
  minutesPassed: number,
  hasBonus: boolean
): number {
  const rate = hasBonus
    ? GAME_CONFIG.ENERGY_REGEN_RATE * GAME_CONFIG.ENERGY_REGEN_BONUS_MULTIPLIER
    : GAME_CONFIG.ENERGY_REGEN_RATE;
  return Math.min(maxEnergy, currentEnergy + rate * minutesPassed);
}

export function canAffordAction(currentEnergy: number, action: ActionType): boolean {
  return currentEnergy >= AP_COSTS[action];
}

export function deductEnergy(currentEnergy: number, action: ActionType): number {
  return currentEnergy - AP_COSTS[action];
}

export function getActionCost(action: ActionType): number {
  return AP_COSTS[action];
}
```

**Step 4: Run tests**

```bash
npx jest --testPathPattern=energy --verbose
# Expected: All pass
```

**Step 5: Commit**

```bash
git add server/src/engine/energy.ts server/src/engine/__tests__/energy.test.ts
git commit -m "feat: implement energy/action point system"
```

---

### Task 7: Trading Engine

**Files:**
- Create: `server/src/engine/trading.ts`
- Create: `server/src/engine/__tests__/trading.test.ts`

**Step 1: Write failing tests**

`server/src/engine/__tests__/trading.test.ts`:
```typescript
import { calculatePrice, executeTrade, TradeResult } from '../trading';

describe('Trading Engine', () => {
  test('price increases when stock is low', () => {
    const highStockPrice = calculatePrice('cyrillium', 8000, 10000);
    const lowStockPrice = calculatePrice('cyrillium', 2000, 10000);
    expect(lowStockPrice).toBeGreaterThan(highStockPrice);
  });

  test('price decreases when stock is high', () => {
    const normalPrice = calculatePrice('food', 5000, 10000);
    const highPrice = calculatePrice('food', 9000, 10000);
    expect(highPrice).toBeLessThan(normalPrice);
  });

  test('executeTrade buying works correctly', () => {
    const outpost = {
      cyrilliumStock: 5000, cyrilliumCapacity: 10000, cyrilliumMode: 'sell' as const,
      foodStock: 0, foodCapacity: 10000, foodMode: 'none' as const,
      techStock: 0, techCapacity: 10000, techMode: 'none' as const,
      treasury: 50000,
    };
    const result = executeTrade(outpost, 'cyrillium', 10, 'buy');
    expect(result.success).toBe(true);
    expect(result.quantity).toBe(10);
    expect(result.totalCost).toBeGreaterThan(0);
    expect(result.newStock).toBe(4990);
  });

  test('executeTrade rejects buying commodity outpost doesnt sell', () => {
    const outpost = {
      cyrilliumStock: 5000, cyrilliumCapacity: 10000, cyrilliumMode: 'buy' as const,
      foodStock: 0, foodCapacity: 10000, foodMode: 'none' as const,
      techStock: 0, techCapacity: 10000, techMode: 'none' as const,
      treasury: 50000,
    };
    const result = executeTrade(outpost, 'cyrillium', 10, 'buy');
    expect(result.success).toBe(false);
  });

  test('executeTrade selling limited by treasury', () => {
    const outpost = {
      cyrilliumStock: 1000, cyrilliumCapacity: 10000, cyrilliumMode: 'buy' as const,
      foodStock: 0, foodCapacity: 10000, foodMode: 'none' as const,
      techStock: 0, techCapacity: 10000, techMode: 'none' as const,
      treasury: 50, // very low treasury
    };
    const result = executeTrade(outpost, 'cyrillium', 100, 'sell');
    expect(result.success).toBe(true);
    expect(result.totalCost).toBeLessThanOrEqual(50);
  });
});
```

**Step 2: Run to verify failure**

```bash
npx jest --testPathPattern=trading --verbose
# Expected: FAIL
```

**Step 3: Implement trading engine**

`server/src/engine/trading.ts`:
```typescript
import { GAME_CONFIG } from '../config/game';

export type CommodityType = 'cyrillium' | 'food' | 'tech';
export type TradeMode = 'buy' | 'sell' | 'none';

export interface OutpostState {
  cyrilliumStock: number;
  cyrilliumCapacity: number;
  cyrilliumMode: TradeMode;
  foodStock: number;
  foodCapacity: number;
  foodMode: TradeMode;
  techStock: number;
  techCapacity: number;
  techMode: TradeMode;
  treasury: number;
}

export interface TradeResult {
  success: boolean;
  error?: string;
  commodity: CommodityType;
  quantity: number;
  pricePerUnit: number;
  totalCost: number;
  newStock: number;
  newTreasury: number;
}

const BASE_PRICES: Record<CommodityType, number> = {
  cyrillium: GAME_CONFIG.BASE_CYRILLIUM_PRICE,
  food: GAME_CONFIG.BASE_FOOD_PRICE,
  tech: GAME_CONFIG.BASE_TECH_PRICE,
};

export function calculatePrice(
  commodity: CommodityType,
  currentStock: number,
  capacity: number
): number {
  const basePrice = BASE_PRICES[commodity];
  const ratio = currentStock / capacity; // 0 = empty, 1 = full
  // Price is inversely proportional to stock ratio
  // Low stock = high price, high stock = low price
  const multiplier = 2.0 - ratio * 1.5; // ranges from 0.5 (full) to 2.0 (empty)
  return Math.max(1, Math.round(basePrice * multiplier));
}

export function executeTrade(
  outpost: OutpostState,
  commodity: CommodityType,
  quantity: number,
  direction: 'buy' | 'sell'
): TradeResult {
  const stockKey = `${commodity}Stock` as keyof OutpostState;
  const capacityKey = `${commodity}Capacity` as keyof OutpostState;
  const modeKey = `${commodity}Mode` as keyof OutpostState;

  const currentStock = outpost[stockKey] as number;
  const capacity = outpost[capacityKey] as number;
  const mode = outpost[modeKey] as TradeMode;

  // Validate trade direction matches outpost mode
  if (direction === 'buy' && mode !== 'sell') {
    return { success: false, error: 'Outpost does not sell this commodity', commodity, quantity: 0, pricePerUnit: 0, totalCost: 0, newStock: currentStock, newTreasury: outpost.treasury };
  }
  if (direction === 'sell' && mode !== 'buy') {
    return { success: false, error: 'Outpost does not buy this commodity', commodity, quantity: 0, pricePerUnit: 0, totalCost: 0, newStock: currentStock, newTreasury: outpost.treasury };
  }

  const pricePerUnit = calculatePrice(commodity, currentStock, capacity);

  if (direction === 'buy') {
    // Player buying from outpost
    const availableQuantity = Math.min(quantity, currentStock);
    if (availableQuantity === 0) {
      return { success: false, error: 'Outpost has no stock', commodity, quantity: 0, pricePerUnit, totalCost: 0, newStock: currentStock, newTreasury: outpost.treasury };
    }
    const totalCost = pricePerUnit * availableQuantity;
    return {
      success: true,
      commodity,
      quantity: availableQuantity,
      pricePerUnit,
      totalCost,
      newStock: currentStock - availableQuantity,
      newTreasury: outpost.treasury + totalCost,
    };
  } else {
    // Player selling to outpost
    const maxAffordable = Math.floor(outpost.treasury / pricePerUnit);
    const maxCapacity = capacity - currentStock;
    const actualQuantity = Math.min(quantity, maxAffordable, maxCapacity);
    if (actualQuantity === 0) {
      return { success: false, error: 'Outpost cannot afford or has no capacity', commodity, quantity: 0, pricePerUnit, totalCost: 0, newStock: currentStock, newTreasury: outpost.treasury };
    }
    const totalCost = pricePerUnit * actualQuantity;
    return {
      success: true,
      commodity,
      quantity: actualQuantity,
      pricePerUnit,
      totalCost,
      newStock: currentStock + actualQuantity,
      newTreasury: outpost.treasury - totalCost,
    };
  }
}
```

**Step 4: Run tests**

```bash
npx jest --testPathPattern=trading --verbose
# Expected: All pass
```

**Step 5: Commit**

```bash
git add server/src/engine/trading.ts server/src/engine/__tests__/trading.test.ts
git commit -m "feat: implement trading engine with supply/demand pricing"
```

---

### Task 8: Combat Engine

**Files:**
- Create: `server/src/engine/combat.ts`
- Create: `server/src/engine/__tests__/combat.test.ts`

**Step 1: Write failing tests**

`server/src/engine/__tests__/combat.test.ts`:
```typescript
import { calculateDamage, resolveCombatVolley, CombatState, attemptFlee } from '../combat';

describe('Combat Engine', () => {
  test('damage scales with energy and attack ratio', () => {
    const damage1 = calculateDamage(50, 1.0, 1.0);
    const damage2 = calculateDamage(50, 2.0, 1.0);
    expect(damage2).toBeGreaterThan(damage1);
  });

  test('defense ratio reduces damage', () => {
    const damage1 = calculateDamage(50, 1.0, 1.0);
    const damage2 = calculateDamage(50, 1.0, 2.0);
    expect(damage2).toBeLessThan(damage1);
  });

  test('attacker only expends energy equal to defender capacity when overkill', () => {
    const attacker: CombatState = { weaponEnergy: 100, engineEnergy: 50, attackRatio: 2.0, defenseRatio: 1.0 };
    const defender: CombatState = { weaponEnergy: 10, engineEnergy: 0, attackRatio: 1.0, defenseRatio: 1.0 };
    const result = resolveCombatVolley(attacker, defender, 100);
    // Attacker should not use all 100 energy since defender only has 10
    expect(result.attackerEnergySpent).toBeLessThan(100);
    expect(result.defenderDestroyed).toBe(true);
  });

  test('flee chance increases with more attackers', () => {
    const base = attemptFlee(1, 0.5);
    const multi = attemptFlee(3, 0.5);
    // With fixed rng (0.5), more attackers should increase flee chance
    expect(multi.fleeChance).toBeGreaterThan(base.fleeChance);
  });
});
```

**Step 2: Run to verify failure**

```bash
npx jest --testPathPattern=combat --verbose
# Expected: FAIL
```

**Step 3: Implement combat engine**

`server/src/engine/combat.ts`:
```typescript
import { GAME_CONFIG } from '../config/game';

export interface CombatState {
  weaponEnergy: number;
  engineEnergy: number;
  attackRatio: number;
  defenseRatio: number;
}

export interface CombatVolleyResult {
  damageDealt: number;
  attackerEnergySpent: number;
  defenderWeaponEnergyRemaining: number;
  defenderEngineEnergyRemaining: number;
  defenderDestroyed: boolean;
}

export interface FleeResult {
  success: boolean;
  fleeChance: number;
}

export function calculateDamage(
  energyExpended: number,
  attackRatio: number,
  defenseRatio: number
): number {
  const effectiveRatio = attackRatio / defenseRatio;
  return Math.max(1, Math.round(energyExpended * effectiveRatio));
}

export function resolveCombatVolley(
  attacker: CombatState,
  defender: CombatState,
  energyToExpend: number
): CombatVolleyResult {
  const actualExpend = Math.min(energyToExpend, attacker.weaponEnergy);
  const rawDamage = calculateDamage(actualExpend, attacker.attackRatio, defender.defenseRatio);

  // Damage first depletes weapon energy, then engine energy
  const totalDefenderHP = defender.weaponEnergy + defender.engineEnergy;
  const actualDamage = Math.min(rawDamage, totalDefenderHP);

  // Calculate how much attacker actually needed to spend
  // If overkill, attacker only spends proportional energy
  let attackerEnergySpent: number;
  if (rawDamage > totalDefenderHP && actualExpend > 0) {
    // Proportion of energy needed = totalDefenderHP / rawDamage * actualExpend
    attackerEnergySpent = Math.max(1, Math.ceil((totalDefenderHP / rawDamage) * actualExpend));
  } else {
    attackerEnergySpent = actualExpend;
  }

  let remainingDamage = actualDamage;
  let defWeapon = defender.weaponEnergy;
  let defEngine = defender.engineEnergy;

  // Shields absorb from weapons first
  if (remainingDamage <= defWeapon) {
    defWeapon -= remainingDamage;
    remainingDamage = 0;
  } else {
    remainingDamage -= defWeapon;
    defWeapon = 0;
    defEngine = Math.max(0, defEngine - remainingDamage);
  }

  const destroyed = defWeapon === 0 && defEngine === 0;

  return {
    damageDealt: actualDamage,
    attackerEnergySpent,
    defenderWeaponEnergyRemaining: defWeapon,
    defenderEngineEnergyRemaining: defEngine,
    defenderDestroyed: destroyed,
  };
}

export function attemptFlee(
  numAttackers: number,
  rngValue: number // 0-1, pass in for testability
): FleeResult {
  const fleeChance = Math.min(
    0.9,
    GAME_CONFIG.MIN_FLEE_CHANCE + (numAttackers - 1) * GAME_CONFIG.MULTI_SHIP_FLEE_BONUS
  );
  return {
    success: rngValue < fleeChance,
    fleeChance,
  };
}
```

**Step 4: Run tests**

```bash
npx jest --testPathPattern=combat --verbose
# Expected: All pass
```

**Step 5: Commit**

```bash
git add server/src/engine/combat.ts server/src/engine/__tests__/combat.test.ts
git commit -m "feat: implement combat engine with attack/defense ratios"
```

---

### Task 9: Planet Production & Decay Engine

**Files:**
- Create: `server/src/engine/planets.ts`
- Create: `server/src/engine/decay.ts`
- Create: `server/src/engine/__tests__/planets.test.ts`

**Step 1: Write failing tests**

`server/src/engine/__tests__/planets.test.ts`:
```typescript
import { calculateProduction, canUpgrade } from '../planets';
import { processDecay, DecayResult } from '../decay';
import { PLANET_TYPES, UPGRADE_REQUIREMENTS } from '../../config/planet-types';

describe('Planet Production', () => {
  test('production scales with colonist count', () => {
    const prod1 = calculateProduction('H', 1000);
    const prod2 = calculateProduction('H', 5000);
    expect(prod2.food).toBeGreaterThan(prod1.food);
  });

  test('production drops when over ideal population', () => {
    const ideal = PLANET_TYPES.H.idealPopulation;
    const atIdeal = calculateProduction('H', ideal);
    const overIdeal = calculateProduction('H', ideal * 2);
    expect(overIdeal.food).toBeLessThan(atIdeal.food);
  });

  test('desert planet produces more cyrillium than food', () => {
    const prod = calculateProduction('D', 5000);
    expect(prod.cyrillium).toBeGreaterThan(prod.food);
  });

  test('canUpgrade checks requirements correctly', () => {
    const planet = {
      upgradeLevel: 0,
      colonists: 2000,
      cyrilliumStock: 200,
      foodStock: 300,
      techStock: 200,
      ownerCredits: 10000,
    };
    expect(canUpgrade(planet)).toBe(true);

    const weakPlanet = {
      upgradeLevel: 0,
      colonists: 100, // too few
      cyrilliumStock: 200,
      foodStock: 300,
      techStock: 200,
      ownerCredits: 10000,
    };
    expect(canUpgrade(weakPlanet)).toBe(false);
  });
});

describe('Decay System', () => {
  test('inactive player planets lose colonists', () => {
    const result = processDecay({
      colonists: 10000,
      hoursInactive: 72,
      inactiveThresholdHours: 48,
    });
    expect(result.newColonists).toBeLessThan(10000);
  });

  test('active player planets dont decay', () => {
    const result = processDecay({
      colonists: 10000,
      hoursInactive: 24,
      inactiveThresholdHours: 48,
    });
    expect(result.newColonists).toBe(10000);
  });
});
```

**Step 2: Run to verify failure**

```bash
npx jest --testPathPattern=planets --verbose
# Expected: FAIL
```

**Step 3: Implement planet production**

`server/src/engine/planets.ts`:
```typescript
import { PLANET_TYPES, UPGRADE_REQUIREMENTS } from '../config/planet-types';

export interface ProductionResult {
  cyrillium: number;
  food: number;
  tech: number;
  drones: number;
}

export function calculateProduction(
  planetClass: string,
  colonists: number
): ProductionResult {
  const config = PLANET_TYPES[planetClass];
  if (!config) return { cyrillium: 0, food: 0, tech: 0, drones: 0 };

  // Efficiency drops when over ideal population
  let efficiency = 1.0;
  if (colonists > config.idealPopulation) {
    const overRatio = colonists / config.idealPopulation;
    efficiency = 1.0 / overRatio; // linear dropoff
  }

  const units = colonists / 1000;
  return {
    cyrillium: Math.floor(config.productionRates.cyrillium * units * efficiency),
    food: Math.floor(config.productionRates.food * units * efficiency),
    tech: Math.floor(config.productionRates.tech * units * efficiency),
    drones: Math.floor(config.productionRates.drones * units * efficiency * 100) / 100,
  };
}

export interface UpgradeCheck {
  upgradeLevel: number;
  colonists: number;
  cyrilliumStock: number;
  foodStock: number;
  techStock: number;
  ownerCredits: number;
}

export function canUpgrade(planet: UpgradeCheck): boolean {
  const nextLevel = planet.upgradeLevel + 1;
  const req = UPGRADE_REQUIREMENTS[nextLevel];
  if (!req) return false; // already max level

  return (
    planet.colonists >= req.colonists &&
    planet.cyrilliumStock >= req.cyrillium &&
    planet.foodStock >= req.food &&
    planet.techStock >= req.tech &&
    planet.ownerCredits >= req.credits
  );
}

export function calculateColonistGrowth(
  planetClass: string,
  currentColonists: number,
  hasFoodSupply: boolean
): number {
  const config = PLANET_TYPES[planetClass];
  if (!config || !hasFoodSupply) return currentColonists;

  const growthRate = config.colonistGrowthRate;
  const growth = Math.floor(currentColonists * growthRate);
  return currentColonists + growth;
}
```

**Step 4: Implement decay engine**

`server/src/engine/decay.ts`:
```typescript
import { GAME_CONFIG } from '../config/game';

export interface DecayInput {
  colonists: number;
  hoursInactive: number;
  inactiveThresholdHours: number;
}

export interface DecayResult {
  newColonists: number;
  decayed: boolean;
}

export function processDecay(input: DecayInput): DecayResult {
  if (input.hoursInactive < input.inactiveThresholdHours) {
    return { newColonists: input.colonists, decayed: false };
  }

  const daysInactive = (input.hoursInactive - input.inactiveThresholdHours) / 24;
  const decayFactor = 1 - (GAME_CONFIG.DECAY_COLONIST_RATE * Math.min(daysInactive, 1));
  const newColonists = Math.max(0, Math.floor(input.colonists * decayFactor));

  return {
    newColonists,
    decayed: newColonists < input.colonists,
  };
}

export function processDefenseDecay(
  currentEnergy: number,
  maxEnergy: number
): number {
  const drain = Math.ceil(maxEnergy * GAME_CONFIG.DECAY_DEFENSE_DRAIN_RATE);
  return Math.max(0, currentEnergy - drain);
}

export function isDeployableExpired(
  deployedAt: Date,
  lastMaintainedAt: Date,
  now: Date = new Date()
): boolean {
  const lifetimeMs = GAME_CONFIG.DEPLOYABLE_LIFETIME_DAYS * 24 * 60 * 60 * 1000;
  return now.getTime() - lastMaintainedAt.getTime() > lifetimeMs;
}
```

**Step 5: Run tests**

```bash
npx jest --testPathPattern=planets --verbose
# Expected: All pass
```

**Step 6: Commit**

```bash
git add server/src/engine/planets.ts server/src/engine/decay.ts server/src/engine/__tests__/planets.test.ts
git commit -m "feat: implement planet production, upgrades, and decay mechanics"
```

---

## Phase 3: Authentication & API Layer

### Task 10: Authentication System

**Files:**
- Create: `server/src/middleware/auth.ts`
- Create: `server/src/api/auth.ts`

**Step 1: Implement auth middleware and routes**

`server/src/middleware/auth.ts`:
```typescript
import { Request, Response, NextFunction } from 'express';

declare module 'express-session' {
  interface SessionData {
    playerId: string;
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session?.playerId) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  next();
}
```

`server/src/api/auth.ts`:
```typescript
import { Router } from 'express';
import bcrypt from 'bcrypt';
import db from '../db/connection';
import { GAME_CONFIG } from '../config/game';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (username.length < 3 || username.length > 32) {
      return res.status(400).json({ error: 'Username must be 3-32 characters' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Pick a random star mall sector for starting location
    const starMallSector = await db('sectors')
      .where({ has_star_mall: true })
      .orderByRaw('RANDOM()')
      .first();

    if (!starMallSector) {
      return res.status(500).json({ error: 'Universe not initialized' });
    }

    const bonusUntil = new Date(Date.now() + GAME_CONFIG.ENERGY_REGEN_BONUS_DURATION_HOURS * 60 * 60 * 1000);

    const [player] = await db('players')
      .insert({
        username,
        email,
        password_hash: passwordHash,
        current_sector_id: starMallSector.id,
        energy: GAME_CONFIG.MAX_ENERGY,
        max_energy: GAME_CONFIG.MAX_ENERGY,
        credits: GAME_CONFIG.STARTING_CREDITS,
        explored_sectors: JSON.stringify([starMallSector.id]),
        energy_regen_bonus_until: bonusUntil,
        last_login: new Date(),
      })
      .returning(['id', 'username', 'email', 'current_sector_id', 'energy', 'credits']);

    // Create starter ship
    const [ship] = await db('ships')
      .insert({
        ship_type_id: GAME_CONFIG.STARTER_SHIP_TYPE,
        owner_id: player.id,
        sector_id: starMallSector.id,
        weapon_energy: 25,
        max_weapon_energy: 25,
        engine_energy: 50,
        max_engine_energy: 50,
        cargo_holds: 10,
        max_cargo_holds: 10,
      })
      .returning('id');

    await db('players').where({ id: player.id }).update({ current_ship_id: ship.id });

    req.session.playerId = player.id;
    res.status(201).json({ player: { ...player, current_ship_id: ship.id } });
  } catch (err: any) {
    if (err.constraint === 'players_username_unique') {
      return res.status(409).json({ error: 'Username already taken' });
    }
    if (err.constraint === 'players_email_unique') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const player = await db('players').where({ username }).first();
    if (!player) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, player.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await db('players').where({ id: player.id }).update({ last_login: new Date() });

    req.session.playerId = player.id;
    res.json({
      player: {
        id: player.id,
        username: player.username,
        currentSectorId: player.current_sector_id,
        energy: player.energy,
        credits: player.credits,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.json({ success: true });
  });
});

export default router;
```

**Step 2: Wire auth into server index.ts**

Update `server/src/index.ts` to include session middleware and auth routes (import session, connect-pg-simple, mount auth router at `/api/auth`).

**Step 3: Commit**

```bash
git add server/src/middleware/ server/src/api/
git commit -m "feat: add authentication system with registration and login"
```

---

### Task 11: Core Game API Routes

**Files:**
- Create: `server/src/api/game.ts` (navigation, sector info, player status)
- Create: `server/src/api/trade.ts` (outpost trading)
- Create: `server/src/api/ships.ts` (ship management)
- Create: `server/src/api/planets.ts` (planet management)
- Create: `server/src/api/combat.ts` (combat actions)
- Create: `server/src/api/social.ts` (alliances, syndicates, bounties)

Each route file follows the same pattern:
1. Import Router from express
2. Import requireAuth middleware
3. Import relevant engine functions
4. Import db connection
5. Define routes that validate input, check AP cost, call engine, update DB, return result
6. Export router

**Key routes to implement:**

**game.ts:**
- `GET /api/game/status` - Player status (energy, credits, sector, ship)
- `POST /api/game/move/:sectorId` - Move to adjacent sector (1 AP)
- `GET /api/game/sector` - Current sector contents
- `GET /api/game/map` - Player's explored map
- `POST /api/game/scan` - Scan adjacent sectors (requires scanner)

**trade.ts:**
- `GET /api/trade/outpost/:id` - View outpost prices
- `POST /api/trade/buy` - Buy commodity from outpost (1 AP)
- `POST /api/trade/sell` - Sell commodity to outpost (1 AP)

**ships.ts:**
- `GET /api/ships/dealer` - List ships at current star mall
- `POST /api/ships/buy/:shipTypeId` - Purchase a ship
- `POST /api/ships/upgrade` - Upgrade current ship
- `POST /api/ships/switch/:shipId` - Switch active ship
- `POST /api/ships/cloak` - Toggle cloaking
- `POST /api/ships/tow/:shipId` - Begin towing
- `POST /api/ships/eject-cargo` - Jettison cargo

**planets.ts:**
- `GET /api/planets/:id` - Planet details
- `POST /api/planets/:id/claim` - Claim unclaimed planet
- `POST /api/planets/:id/colonize` - Deposit colonists
- `POST /api/planets/:id/collect-colonists` - Collect colonists from seed planet
- `POST /api/planets/:id/upgrade` - Upgrade planet
- `POST /api/planets/:id/defenses` - Configure defenses

**combat.ts:**
- `POST /api/combat/lock/:targetPlayerId` - Engage tractor beam
- `POST /api/combat/fire` - Fire volley (2 AP)
- `POST /api/combat/flee` - Attempt to flee
- `POST /api/combat/truce` - Break off attack

**social.ts:**
- `POST /api/social/alliance/:playerId` - Form/cancel alliance
- `POST /api/social/syndicate/create` - Create syndicate
- `POST /api/social/syndicate/invite/:playerId` - Invite to syndicate
- `GET /api/social/syndicate` - Syndicate info
- `POST /api/social/bounty` - Place bounty
- `GET /api/social/bounties` - View active bounties

**Implementation note:** Each endpoint should:
1. Check auth via requireAuth middleware
2. Load player from DB using req.session.playerId
3. Validate the action is possible (AP, location, resources)
4. Call engine functions for game logic
5. Update DB in a transaction
6. Emit WebSocket events for relevant players
7. Return result

**Step: Commit after each route file**

```bash
git add server/src/api/
git commit -m "feat: add core game API routes"
```

---

### Task 12: WebSocket Event Layer

**Files:**
- Create: `server/src/ws/events.ts`
- Create: `server/src/ws/handlers.ts`

**Events to implement:**

```typescript
// Server -> Client events
interface ServerEvents {
  'sector:update': { sectorId: number; contents: SectorContents };
  'player:entered': { playerId: string; username: string; sectorId: number };
  'player:left': { playerId: string; sectorId: number };
  'combat:lock': { attackerId: string; attackerName: string };
  'combat:volley': { attackerId: string; damage: number; yourEnergyRemaining: number };
  'combat:destroyed': { destroyedPlayerId: string };
  'combat:fled': { playerId: string };
  'notification': { type: string; message: string; data: any };
  'energy:update': { energy: number };
  'trade:complete': { outpostId: string; commodity: string; quantity: number; total: number };
}

// Client -> Server events
interface ClientEvents {
  'join': { token: string };
  'move': { sectorId: number };
  'chat:sector': { message: string };
}
```

**Step: Commit**

```bash
git add server/src/ws/
git commit -m "feat: add WebSocket event layer for real-time game events"
```

---

### Task 13: Game Tick System

**Files:**
- Create: `server/src/engine/game-tick.ts`

**The game tick runs every 60 seconds and handles:**

1. Energy regeneration for all online players
2. Planet production (commodities and colonists)
3. Decay (inactive player planets, defense drain, deployable expiry)
4. Outpost economy drift (treasury injection, price adjustment)
5. Seed planet colonist growth

```typescript
// Pseudocode structure
export async function gameTick(): Promise<void> {
  const now = new Date();

  // 1. Regenerate energy for all players
  await db('players')
    .where('energy', '<', db.ref('max_energy'))
    .increment('energy', GAME_CONFIG.ENERGY_REGEN_RATE);
  // Handle bonus regen separately
  await db('players')
    .where('energy', '<', db.ref('max_energy'))
    .where('energy_regen_bonus_until', '>', now)
    .increment('energy', GAME_CONFIG.ENERGY_REGEN_RATE); // extra point

  // 2. Planet production (batch update)
  // For each planet with colonists, calculate and add production

  // 3. Decay
  // Find inactive players, reduce their planet colonists
  // Drain defense energy
  // Delete expired deployables

  // 4. Outpost economy
  // Inject treasury funds
  // Drift commodity stocks slightly toward equilibrium

  // 5. Emit energy updates to connected players
}
```

**Step: Commit**

```bash
git add server/src/engine/game-tick.ts
git commit -m "feat: implement 60-second game tick for regen, production, and decay"
```

---

## Phase 4: Universe Seeding

### Task 14: Database Seed Script

**Files:**
- Create: `server/src/db/seeds/001_universe.ts`

This seed script:
1. Generates universe graph using engine/universe.ts
2. Inserts all sectors and edges into DB
3. Seeds ship_types table from config
4. Creates outposts with randomized commodity profiles
5. Creates starting planets (scattered, mostly unclaimed)
6. Creates seed planets at designated sectors

**Step: Commit**

```bash
git add server/src/db/seeds/
git commit -m "feat: add universe seed script for initial world generation"
```

---

## Phase 5: React Frontend

### Task 15: Initialize Client Project

**Files:**
- Create: `client/` (Vite + React + TypeScript project)

```bash
cd /workspace/cosmic-horizon
npm create vite@latest client -- --template react-ts
cd client
npm install socket.io-client axios
npm install -D @types/node
```

**Step: Commit**

```bash
git add client/
git commit -m "feat: initialize React client with Vite"
```

---

### Task 16: Terminal UI Component

**Files:**
- Create: `client/src/components/Terminal.tsx`
- Create: `client/src/components/Terminal.css`

The terminal component is the core of the UI:
- Scrollable text output area (green-on-dark-bg)
- Command input line at bottom
- Supports styled text (bold, colors for different entity types)
- Clickable sector numbers and entity names
- Auto-scroll to bottom on new output

**Step: Commit**

```bash
git add client/src/components/Terminal.*
git commit -m "feat: add retro terminal UI component"
```

---

### Task 17: Side Panels (Map, Status, Trade)

**Files:**
- Create: `client/src/components/MapPanel.tsx` - Visual sector map of explored space
- Create: `client/src/components/StatusBar.tsx` - Ship status, energy, credits
- Create: `client/src/components/TradeTable.tsx` - Outpost prices table
- Create: `client/src/components/CombatView.tsx` - Combat HUD

**Step: Commit**

```bash
git add client/src/components/
git commit -m "feat: add side panel components for map, status, trade, and combat"
```

---

### Task 18: Game State & WebSocket Hooks

**Files:**
- Create: `client/src/hooks/useGameState.ts`
- Create: `client/src/hooks/useSocket.ts`
- Create: `client/src/services/api.ts`

**Step: Commit**

```bash
git add client/src/hooks/ client/src/services/
git commit -m "feat: add game state management and WebSocket hooks"
```

---

### Task 19: Auth Pages & Game Layout

**Files:**
- Create: `client/src/pages/Login.tsx`
- Create: `client/src/pages/Register.tsx`
- Create: `client/src/pages/Game.tsx` (main game layout with terminal + panels)
- Modify: `client/src/App.tsx` (routing)

**Step: Commit**

```bash
git add client/src/
git commit -m "feat: add auth pages and main game layout"
```

---

## Phase 6: Integration & Polish

### Task 20: Docker Compose Full Stack

**Files:**
- Modify: `docker-compose.yml` (add server and client services)
- Create: `server/Dockerfile`
- Create: `client/Dockerfile`

**Step: Commit**

```bash
git add docker-compose.yml server/Dockerfile client/Dockerfile
git commit -m "feat: add Docker configuration for full stack deployment"
```

---

### Task 21: Command Parser & Game Flow

**Files:**
- Create: `server/src/engine/commands.ts` (parse text commands from terminal)
- Create: `client/src/services/commands.ts` (client-side command handler)

The terminal accepts text commands AND clickable UI elements. Common commands:
- `move <sector>` or `m <sector>` - Navigate
- `scan` or `s` - Scan adjacent sectors
- `dock` or `d` - Dock at outpost
- `buy <commodity> <quantity>` - Purchase goods
- `sell <commodity> <quantity>` - Sell goods
- `land <planet>` - Land on planet
- `attack <player>` - Engage combat
- `fire <energy>` - Fire volley
- `flee` - Attempt to flee
- `map` - Show explored map
- `status` or `st` - Show status
- `help` or `?` - Show commands

**Step: Commit**

```bash
git add server/src/engine/commands.ts client/src/services/commands.ts
git commit -m "feat: add text command parser for terminal input"
```

---

### Task 22: End-to-End Testing

**Files:**
- Create: `server/src/__tests__/integration/` (API integration tests)

Test the full flow:
1. Register player -> gets placed at star mall with starter ship
2. Move between sectors -> map updates, AP deducts
3. Dock at outpost -> see prices
4. Buy/sell commodities -> credits/cargo update
5. Find and claim planet
6. Combat between two players

**Step: Commit**

```bash
git add server/src/__tests__/
git commit -m "test: add end-to-end integration tests for core game flows"
```

---

## Phase 7: General Store Items & Advanced Features

### Task 23: General Store & Items

Implement all general store items:
- PGD, buoys, Rache devices, mines (halberd/barnacle), cloaking cells, probes, scanners, disruptor torpedoes, jump drives, drone packs

### Task 24: Syndicate System

Full syndicate CRUD, shared planets, governance charters, syndicate-to-syndicate alliances.

### Task 25: Justice Center (Bounties)

Bounty placement, tracking, claiming.

### Task 26: Star Mall Full Implementation

Ship dealer (inventory varies per mall), salvage yard, garage (ship storage), cantina (flavor text / secrets), refueling.

---

## Summary

| Phase | Tasks | Focus |
|:---:|:---:|:---|
| 1 | 1-4 | Project scaffolding, database, configuration |
| 2 | 5-9 | Game engine core (universe, energy, trading, combat, planets, decay) |
| 3 | 10-13 | Auth, API routes, WebSocket events, game tick |
| 4 | 14 | Universe seed data |
| 5 | 15-19 | React frontend (terminal UI, panels, hooks, pages) |
| 6 | 20-22 | Docker, command parser, integration tests |
| 7 | 23-26 | Advanced features (store items, syndicates, bounties, star malls) |

Each task follows TDD where applicable. Commit after each task. The game becomes playable after Phase 5 with core mechanics, and Phase 7 adds the remaining whitepaper features.

---

## Post-MVP: Android Companion App (React Native)

### Phase A: Lite Companion
- Ship status, location, inventory
- Planet production and colonist monitoring
- Outpost price tracking
- Push notifications (attacks, trades, milestones)
- Quick actions (defense settings, drone modes)
- Connects to the same REST/WebSocket API as the web client
- React Native with shared TypeScript types

### Phase B: Full Mobile Client
- Complete gameplay from Android
- Mobile-optimized UI (touch-friendly command input, swipeable panels)
- Offline status caching
