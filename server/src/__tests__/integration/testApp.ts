import express from 'express';
import session from 'express-session';
import authRouter from '../../api/auth';
import gameRouter from '../../api/game';
import tradeRouter from '../../api/trade';
import shipsRouter from '../../api/ships';
import planetsRouter from '../../api/planets';
import combatRouter from '../../api/combat';
import socialRouter from '../../api/social';
import deployablesRouter from '../../api/deployables';
import storeRouter from '../../api/store';
import starmallRouter from '../../api/starmall';

export function createTestApp() {
  const app = express();
  app.use(express.json());

  app.use(session({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false,
  }));

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

  return app;
}
