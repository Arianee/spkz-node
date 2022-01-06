import { Server } from 'socket.io';
import { utils } from '@arianee/spkz-sdk/services/utils';
import { requiredDefined } from '@arianee/spkz-sdk/helpers/required/required';
import { createHash } from 'crypto';
import { createServer } from 'http';
import * as Sentry from '@sentry/node';
import redisService from './redis.service';

Sentry.init({ dsn: 'https://a01095ebaaef4062a8f2ce84d245ab01@o343653.ingest.sentry.io/6011871' });

export class WebsocketService {
  private port = parseInt(process.env.PORT, 10) || 3001;

  private server;

  private hashString = (data: string) => {
    const hash = createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
  };

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
      try {
        switch (channel) {
          case 'spkz-message': {
            const {
              roomId,
              sectionId,
            } = JSON.parse(message);
            this.server.to(this.hashString(`${process.env.CHAIN_ID}/${roomId}/${sectionId}`)).emit('message', message);

            break;
          }
          case 'userJoinSection': {
            const {
              roomId,
              sectionId,
            } = JSON.parse(message);
            this.server.to(this.hashString(`${process.env.CHAIN_ID}/${roomId}/${sectionId}`)).emit('userJoinSection', message);
            break;
          }
          default:
            break;
        }
      } catch (e) {
        console.error(e);
        Sentry.captureException(e);
      }
    });

    redisService.subscribe('spkz-message');
    redisService.subscribe('userJoinSection');

    this.server.on('connection', (socket) => {
      socket.on('joinRoom', async (params) => {
        try {
          const {
            authorizations,
            roomId,
            sectionId,
          } = params;
          requiredDefined(roomId, 'roomId should be defined');
          requiredDefined(sectionId, 'sectionId should be defined');
          requiredDefined(authorizations, 'authorizations should be defined');
          const {
            isAuthorized,
            blockchainWallets,
          } = await utils.rightService.verifyPayloadSignatures(params);

          if (isAuthorized === false) {
            return 0;
          }

          const firstBlockchainWallet = blockchainWallets[0];
          const hasRightToRead = await utils.rightService.canReadSection({
            roomId,
            sectionId,
            address: firstBlockchainWallet,
          });

          if (hasRightToRead.isAuthorized === false) {
            return 0;
          }

          return socket.join(this.hashString(`${process.env.CHAIN_ID}/${roomId}/${sectionId}`));
        } catch (e) {
          console.error(e);
          Sentry.captureException(e);
          return e;
        }
      });
    });

    return this.server;
  };
}
