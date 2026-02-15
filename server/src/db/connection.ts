import knex, { Knex } from 'knex';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const config: Knex.Config = process.env.NODE_ENV === 'production'
  ? {
      client: 'pg',
      connection: process.env.DATABASE_URL || {
        host: 'localhost',
        port: 5432,
        user: 'coho',
        password: 'coho',
        database: 'cosmic_horizon',
      },
    }
  : {
      client: 'better-sqlite3',
      connection: {
        filename: path.join(__dirname, '..', '..', 'data', 'cosmic_horizon.sqlite'),
      },
      useNullAsDefault: true,
    };

const db = knex(config);

export default db;
