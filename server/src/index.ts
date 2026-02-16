import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import path from 'path';

import authRouter from './api/auth';
import gameRouter from './api/game';
import tradeRouter from './api/trade';
import shipsRouter from './api/ships';
import planetsRouter from './api/planets';
import combatRouter from './api/combat';
import socialRouter from './api/social';
import deployablesRouter from './api/deployables';
import storeRouter from './api/store';
import starmallRouter from './api/starmall';
import tutorialRouter from './api/tutorial';
import { setupWebSocket } from './ws/handlers';
import { startGameTick } from './engine/game-tick';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }
});

const corsOptions = { origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true };
app.use(cors(corsOptions));
app.use(express.json());

// Session middleware
// In production, use connect-pg-simple with PostgreSQL
const BetterSqlite3 = require('better-sqlite3');
const SqliteStore = require('better-sqlite3-session-store')(session);
const sessionDb = new BetterSqlite3(path.join(__dirname, '..', 'data', 'sessions.sqlite'));

const sessionMiddleware = session({
  store: new SqliteStore({
    client: sessionDb,
    expired: { clear: true, intervalMs: 900000 },
  }),
  secret: process.env.SESSION_SECRET || 'cosmic-horizon-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
});

app.use(sessionMiddleware);

// Share session with Socket.io
io.engine.use(sessionMiddleware);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', game: 'Cosmic Horizon' });
});

// API routes
app.use('/api/auth', authRouter);
app.use('/api/game', gameRouter);
app.use('/api/trade', tradeRouter);
app.use('/api/ships', shipsRouter);
app.use('/api/planets', planetsRouter);
app.use('/api/combat', combatRouter);
app.use('/api/social', socialRouter);
app.use('/api/deployables', deployablesRouter);
app.use('/api/store', storeRouter);
app.use('/api/starmall', starmallRouter);
app.use('/api/tutorial', tutorialRouter);

// WebSocket
setupWebSocket(io);

// Game tick
startGameTick(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Cosmic Horizon server running on port ${PORT}`);
});

export { app, server, io };
