import { Server } from 'socket.io';
import { utils } from '@arianee/spkz-sdk/services/utils';
import { JSONRPCErrors } from '@arianee/spkz-sdk/models/JSONRPCError';
import { requiredDefined } from '@arianee/spkz-sdk/helpers/required/required';
import { createHash } from 'crypto';
import { createServer } from 'http';
import redisService from './redis.service';

export class WebsocketService {
  private port = parseInt(process.env.PORT, 10) || 3001;

  private server;

  private hashString = (data:string) => {
    const hash = createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
  }

  public openServer = () => {
    const httpServer = createServer();
    this.server = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: '*',
      },
    });
    httpServer.listen(this.port, () => {
      console.info(`Notification server is listening on port:${this.port}`);
    });

    redisService.redisClient.on('message', (channel, message) => {
      switch (channel) {
        case 'spkz-message': {
          const { roomId, sectionId } = JSON.parse(message);
          this.server.to(this.hashString(`${process.env.CHAIN_ID}/${roomId}/${sectionId}`)).emit('message', message);

          break;
        }
        default:
          break;
      }
    });
    redisService.subscribe('spkz-message');

    this.server.on('connection', (socket) => {
      socket.on('joinRoom', async (params, callback) => {
        const { authorizations, roomId, sectionId } = params;
        requiredDefined(roomId, 'roomId should be defined');
        requiredDefined(sectionId, 'sectionId should be defined');
        requiredDefined(authorizations, 'authorizations should be defined');
        const { isAuthorized, blockchainWallets } = await utils.rightService.verifyPayloadSignatures(params);

        if (isAuthorized === false) {
          return callback(new Error(JSONRPCErrors.wrongSignatureForPayload));
        }

        const firstBlockchainWallet = blockchainWallets[0];
        const hasRightToRead = await utils.rightService.canReadSection({ roomId, sectionId, address: firstBlockchainWallet });

        if (hasRightToRead.isAuthorized === false) {
          return callback(new Error(JSONRPCErrors.notHasReadRight));
        }

        return socket.join(this.hashString(`${process.env.CHAIN_ID}/${roomId}/${sectionId}`));
      });
    });

    return this.server;
  }
}
