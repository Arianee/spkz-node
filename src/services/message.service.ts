import { SPKZJSONRPC } from '@arianee/spkz-sdk/server';
import { NetworkParameters } from '@arianee/spkz-sdk/models/jsonrpc/networkParameters';
import { Message } from '../models/message.model';
import redisService from './redis.service';

export class MessageService {
  private messagesJSONRPC;

  constructor() {
    this.messagesJSONRPC = new SPKZJSONRPC({ chainId: process.env.CHAIN_ID, network: process.env.NETWORK_ID } as NetworkParameters)
      .setMessagesMethod({
        read: async (parameters: { signature: string }) => {
          const { signature } = parameters;
          const message = await Message.findOne({ id: signature } as any);
          return Promise.resolve(message);
        },
        write: async (parameters) => {
          const {
            roomId,
            sectionId,
            payload,
            signature,
          } = parameters;
          const value = {
            id: signature,
            network: 'testnet',
            sectionId,
            roomId,
            chainId: 'chain test',
            payload,
            proxyWallet: 'test',
            blockchainWallet: 'test',
          };
          const message = await Message.create(value);
          redisService.publish('spkz-message', JSON.stringify(message));
          return Promise.resolve(message);
        },
      }).build();
  }

  /**
     * Create a RPC server middleware
     */
  public getMessagesJSONRPC() {
    return this.messagesJSONRPC;
  }
}
