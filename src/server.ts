import { SPKZ } from '@arianee/spkz-sdk';
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
  const spkz = SPKZ.fromPrivateKey('0xc88c2ebe8243c838b54fcafebef2ae909556c8f96becfbbe4a2d49a9417c4161'); // 0x1462B397bf8845f6448a6C0e6F521ed2458F68D0
  await spkz.wallets.addWalletFromPrivateKey('0x555a72847a70a73911029412fb98a0d347bbc7785128fc38e184c8607b6bec07'); // 0x0EfBf243b5105c2fe8F14943EB3EEE5f3D9D2A48
  await spkz.room.canJoin({ roomId: '0' });

  await spkz.room.sendMessage({
    roomId: '0',
    sectionId: 'chat',
    messageContent: {
      title: 'hello world',
    },
  });
});
