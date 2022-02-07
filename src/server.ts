import cors from 'cors';
import * as Sentry from '@sentry/node';

import morgan from 'morgan';
import { SpkzNodeService } from './services/spkznode.service';
import { morganLogger } from './helpers/morgaLogger';
import tokens from './routes/tokens.route';
import unlock from './routes/unlock.route';

const express = require('express');
const packageJSON = require('../package.json');

const app = express();
app.use(cors());
const port = process.env.PORT;
Sentry.init({ dsn: 'https://a01095ebaaef4062a8f2ce84d245ab01@o343653.ingest.sentry.io/6011871' });
app.use(Sentry.Handlers.requestHandler());

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
app.post(`${process.env.CONTEXT_PATH}/spkz/rpc`, (new SpkzNodeService().getJSONRPC()));

app.use(Sentry.Handlers.errorHandler());
app.listen(port, async () => {
  console.info(`spkz-node listening at port:${port}`);
});
