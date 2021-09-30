import { Options } from 'sequelize';

let host = process.env.DB_HOST || 'postgres-spkz-sdk';
if (process.env.CLOUD_SQL_CONNECTION_NAME) {
  const dbSocketPath = process.env.DB_SOCKET_PATH || '/cloudsql';
  host = `${dbSocketPath}/${process.env.CLOUD_SQL_CONNECTION_NAME}`;
}

const database: Options = {
  database: process.env.DB_NAME || 'spkz-node',
  username: process.env.DB_USER || 'spkz',
  password: process.env.DB_PASS || 'spkz',
  host,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  // @ts-ignore
  logging: process.env.DB_LOGGING === 'true' || process.env.DB_LOGGING === true,
  dialect: 'postgres',
  define: {
    schema: process.env.DB_SCHEMA ? `"${process.env.DB_SCHEMA}"` : '"public"',
  },
};
export = database;
