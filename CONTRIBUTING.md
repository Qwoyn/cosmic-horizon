# Contributing to Cosmic Horizon

Thanks for your interest in contributing to Cosmic Horizon. This guide covers everything you need to get started.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/cosmic-horizon.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Install dependencies:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
5. Set up the database:
   ```bash
   cd server
   cp ../.env.example .env
   npx knex migrate:latest --knexfile knexfile.ts
   npx knex seed:run --knexfile knexfile.ts
   ```
6. Run the tests: `cd server && npx jest`

## Development Workflow

### Branch Naming

- `feature/description` — new features
- `fix/description` — bug fixes
- `docs/description` — documentation changes
- `refactor/description` — code improvements without behavior changes

### Making Changes

1. Write or update tests first when touching game engine logic
2. Run the full test suite before committing: `cd server && npx jest`
3. Build the client to check for errors: `cd client && npx vite build`
4. Keep commits focused — one logical change per commit

### Commit Messages

Use clear, imperative commit messages:

```
feat: add jump drive navigation endpoint
fix: correct trade price calculation for low-stock outposts
docs: add planet upgrade requirements to manual
test: add integration tests for syndicate treasury
refactor: extract mine detonation logic to engine module
```

### Pull Requests

- Fill out the PR template completely
- Reference any related issues
- Include test results
- Keep PRs focused on a single feature or fix
- Add screenshots for UI changes

## Project Architecture

### Server (`server/src/`)

| Directory | Purpose |
|-----------|---------|
| `engine/` | Pure game logic. No database or HTTP dependencies. All functions take data in, return results. This is where game mechanics live. |
| `config/` | Constants and type definitions. Ship stats, store items, planet types, game tuning values. |
| `api/` | Express route handlers. Thin layer that reads from DB, calls engine functions, writes results back. |
| `db/` | Knex migrations and seed scripts. |
| `ws/` | Socket.io event handlers for real-time features. |
| `middleware/` | Express middleware (auth). |

### Client (`client/src/`)

| Directory | Purpose |
|-----------|---------|
| `components/` | React components for the terminal UI. |
| `hooks/` | Game state management and WebSocket connection. |
| `services/` | API client functions and terminal command parser. |
| `pages/` | Top-level route components (Login, Register, Game). |

### Key Design Principles

- **Engine logic is pure.** Functions in `engine/` take plain objects and return plain objects. No database calls, no HTTP, no side effects. This makes them easy to test.
- **API routes are thin.** They fetch data, call engine functions, persist results. Business logic belongs in the engine.
- **SQLite for dev, PostgreSQL for production.** Use `useNullAsDefault: true` and `crypto.randomUUID()` instead of `.returning()` for SQLite compatibility.
- **Don't over-engineer.** No premature abstractions. Three similar lines are better than a helper used once.

## Testing

### Running Tests

```bash
cd server
npx jest              # all tests
npx jest --watch      # watch mode
npx jest energy       # run tests matching "energy"
```

### Writing Tests

- Engine tests go in `server/src/engine/__tests__/`
- Integration tests go in `server/src/__tests__/integration/`
- Engine tests should test pure functions with no mocking
- Integration tests use a separate SQLite database (see `gameFlow.test.ts` for the pattern)

### What Needs Tests

- All engine functions (combat calculations, trade pricing, planet production)
- API endpoints that involve complex logic
- Edge cases (zero values, overflow, missing data)

## Areas Where Help Is Needed

### High Priority
- More integration test coverage for Phase 7 features (store, garage, salvage, syndicates)
- UI polish on the terminal and sidebar components
- Game balance tuning (commodity prices, ship stats, energy costs)

### Features on the Roadmap
- Android companion app (React Native)
- Frontier expansion (new sectors via wormholes)
- Terraforming with ecocredit integration
- Advanced sector scanning UI
- Mobile-responsive terminal layout

### Always Welcome
- Bug reports with reproduction steps
- Documentation improvements
- Accessibility improvements
- Performance optimizations

## Code Style

- TypeScript strict mode
- No `any` types in new code where avoidable
- Use `interface` over `type` for object shapes
- Prefer `const` over `let`
- No default exports for utility modules (named exports preferred)
- Route handlers can use default export (Express convention)

## Questions?

Open a [discussion](https://github.com/Qwoyn/cosmic-horizon/discussions) or file an issue. We're happy to help you find a good first contribution.
