import { MessageService } from './services/message.service';

const express = require('express');

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get(`${process.env.CONTEXT_PATH}/ping`, (req: any, res: any) => {
  res.send('pong');
});

app.post(`${process.env.CONTEXT_PATH}/spkz/rpc`, (new MessageService().getMessagesJSONRPC()));

app.listen(port, async () => {
  console.info(`spkz-node listening at port:${port}`);
});
