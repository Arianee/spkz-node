import { SPKZJSONRPC } from '@arianee/spkz-sdk/server';
import { NetworkParameters } from '@arianee/spkz-sdk/models/jsonrpc/networkParameters';
import {
  SectionUser as SectionUserSDK, RoomUser as RoomUserSDK, SectionUserGet, ReadMessageParameters, WriteMessageParameters,
} from '@arianee/spkz-sdk/models/jsonrpc/writeMessageParameters';
import { SectionUser } from '../models/sectionUser.model';
import { Message } from '../models/message.model';
import { RoomUser } from '../models/roomUser.model';

export class SpkzNodeService {
  private jsonRPC;

  constructor() {
    this.jsonRPC = new SPKZJSONRPC({ chainId: process.env.CHAIN_ID || '1', network: process.env.NETWORK_ID || '1' } as NetworkParameters)
      .setMessagesMethod({
        read: async (parameters: ReadMessageParameters) => {
          const message = await Message.findAll({
            where: {
              roomId: parameters.roomId,
              sectionId: parameters.sectionId,
              network: parameters.network,
              chainId: parameters.chainId,
            } as any,
            limit: 100,
            order: [['createdAt', 'desc']],
            raw: true,
          });
          return Promise.resolve(message);
        },
        write: async (parameters: WriteMessageParameters) => {
          const value = {
            id: parameters.signature,
            ...parameters,
          };
          const message = await Message.create(value);
          return Promise.resolve(message);
        },
      }).setUsersMethod({
        getUsers: async (sectionUserGet: SectionUserGet) => {
          const sectionUsers = await SectionUser.findAll({
            where: {
              sectionId: sectionUserGet.sectionId,
              roomId: sectionUserGet.roomId,
              network: sectionUserGet.network,
              chainId: sectionUserGet.chainId,

            },
            raw: true,
          });

          return sectionUsers;
        },
        createOrUpdateProfile: async (roomUserSDK: RoomUserSDK) => {
          const [profileReturn, isCreated] = await RoomUser.findOrCreate({
            where: {
              blockchainWallet: roomUserSDK.blockchainWallet,
            },
            defaults: {
              roomId: roomUserSDK.roomId,
              network: roomUserSDK.network,
              chainId: roomUserSDK.chainId,
              payload: roomUserSDK.payload,
              blockchainWallet: roomUserSDK.blockchainWallet,

            },
          });

          if (!isCreated) {
            profileReturn.update(roomUserSDK);
          }

          return profileReturn;
        },
        joinSection: async (sectionUserSDK: SectionUserSDK) => SectionUser.findOrCreate({
          where: {
            blockchainWallet: sectionUserSDK.blockchainWallet,
          },
          defaults: {
            roomId: sectionUserSDK.roomId,
            sectionId: sectionUserSDK.sectionId,
            network: sectionUserSDK.network,
            chainId: sectionUserSDK.chainId,
            payload: sectionUserSDK.payload,
            blockchainWallet: sectionUserSDK.blockchainWallet,
          },

        }),
      })

      .build();
  }

  /**
     * Create a RPC server middleware
     */
  public getJSONRPC() {
    return this.jsonRPC;
  }
}
