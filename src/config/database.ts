import { Options } from 'sequelize';

const database: Options = {
  database: process.env.DB_NAME || 'spkz-node',
  username: process.env.DB_USER || 'spkz',
  password: process.env.DB_PASSWORD || 'spkz',
  host: process.env.DB_HOST || 'postgres',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  // @ts-ignore
  logging: process.env.DB_LOGGING === 'true' || process.env.DB_LOGGING === true,
  dialect: 'postgres',
  define: {
    schema: process.env.DB_SCHEMA ? `"${process.env.DB_SCHEMA}"` : '"public"',
  },
};
export = database;
