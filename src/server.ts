/* eslint-disable import/first */
/* eslint-disable sort-imports */

const isProduction = process.env.NODE_ENV === 'production';
if (!isProduction) console.warn('[WARNING] Running in development mode, logs will not be sent to Cloud Trace neither to Sentry');

// Google Cloud Trace Agent SDK
require('@google-cloud/trace-agent').start({
  enabled: isProduction,
});

import * as Sentry from '@sentry/node';

// Sentry SDK
Sentry.init({
  dsn: 'https://a01095ebaaef4062a8f2ce84d245ab01@o343653.ingest.sentry.io/6011871',
  tracesSampleRate: 1.0,
  enabled: isProduction,
});

import cors from 'cors';
import morgan from 'morgan';
import { morganLogger } from './helpers/morgaLogger';
import { SpkzNodeService } from './services/spkznode.service';
import { SignService } from './services/sign.service';
import tokens from './routes/tokens.route';
import unlock from './routes/unlock.route';

const express = require('express');
const packageJSON = require('../package.json');

const port = process.env.PORT;

const app = express();

// Sentry requestHandler
app.use(Sentry.Handlers.requestHandler());

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan(morganLogger, { immediate: true }));

app.get(`${process.env.CONTEXT_PATH}/ping`, (req: any, res: any) => {
  res.send('pong');
});

app.use(`${process.env.CONTEXT_PATH}/tokens`, tokens);
app.use(`${process.env.CONTEXT_PATH}/unlock`, unlock);

app.get(`${process.env.CONTEXT_PATH}/version`, (req, res) => {
  res.send(packageJSON.version);
});

app.get(`${process.env.CONTEXT_PATH}/publicKey`, (req, res) => {
  try {
    const signService = new SignService();
    const publicKey = signService.getActivePublicKey();
    res.status(200).send(publicKey);
  } catch {
    res.status(500).send('No signer set for this node, PRIVATE_KEYS environment variable must be set');
  }
});

app.post(`${process.env.CONTEXT_PATH}/spkz/rpc`, (new SpkzNodeService().getJSONRPC()));

// Sentry errorHandler
app.use(Sentry.Handlers.errorHandler());

app.listen(port, async () => {
  console.info(`spkz-node listening at port:${port}`);
});
