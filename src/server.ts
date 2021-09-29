import cors from 'cors';
import { SpkzNodeService } from './services/spkznode.service';

const express = require('express');

const app = express();
app.use(cors());
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get(`${process.env.CONTEXT_PATH}/ping`, (req: any, res: any) => {
  res.send('pong');
});

app.post(`${process.env.CONTEXT_PATH}/spkz/rpc`, (new SpkzNodeService().getJSONRPC()));

app.listen(port, async () => {
  console.info(`spkz-node listening at port:${port}`);
});
