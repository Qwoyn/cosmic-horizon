import type { Knex } from 'knex';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const config: Record<string, Knex.Config> = {
  development: {
    client: 'better-sqlite3',
    connection: {
      filename: path.join(__dirname, 'data', 'cosmic_horizon.sqlite'),
    },
    useNullAsDefault: true,
    migrations: {
      directory: './src/db/migrations',
      extension: 'ts',
    },
    seeds: {
      directory: './src/db/seeds',
      extension: 'ts',
    },
  },
  production: {
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
