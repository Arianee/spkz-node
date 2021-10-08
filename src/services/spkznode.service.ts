import { SPKZJSONRPC } from '@arianee/spkz-sdk/server';
import { NetworkParameters } from '@arianee/spkz-sdk/models/jsonrpc/networkParameters';
import {
  SectionUser as SectionUserSDK, RoomUser as RoomUserSDK, SectionUserGet, ReadMessageParameters, WriteMessageParameters,
} from '@arianee/spkz-sdk/models/jsonrpc/writeMessageParameters';
import { SectionUser } from '../models/sectionUser.model';
import { Message } from '../models/message.model';
import { RoomUser } from '../models/roomUser.model';
import redisService from './redis.service';

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
            ...parameters,
          };

          const message = await Message.create(value);
          redisService.publish('spkz-message', JSON.stringify(message));
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
            order: [['updatedAt', 'desc']],
            raw: false,
          });
          const users: SectionUser[] = await Promise.all(sectionUsers.map(async (su: SectionUser) => {
            const roomUser: RoomUser = await RoomUser.findOne({
              where: {
                blockchainWallet: su.blockchainWallet,
                roomId: sectionUserGet.roomId,
                network: sectionUserGet.network,
                chainId: sectionUserGet.chainId,
              },
            });
            const sectionUser: SectionUser = su.toJSON() as SectionUser;
            sectionUser.userProfile = { payload: roomUser.payload };
            return sectionUser;
          }));
          return users;
        },
        createOrUpdateProfile: async (roomUserSDK: RoomUserSDK) => {
          const [profileReturn, isCreated] = await RoomUser.findOrCreate({
            where: {
              blockchainWallet: roomUserSDK.blockchainWallet,
              roomId: roomUserSDK.roomId,
              network: roomUserSDK.network,
              chainId: roomUserSDK.chainId,
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
        joinSection: async (sectionUserSDK: SectionUserSDK) => {
          const [sectionUser] = await SectionUser.findOrCreate({
            where: {
              blockchainWallet: sectionUserSDK.blockchainWallet,
              roomId: sectionUserSDK.roomId,
              sectionId: sectionUserSDK.sectionId,
              network: sectionUserSDK.network,
              chainId: sectionUserSDK.chainId,
            },
            defaults: {
              roomId: sectionUserSDK.roomId,
              sectionId: sectionUserSDK.sectionId,
              network: sectionUserSDK.network,
              chainId: sectionUserSDK.chainId,
              payload: sectionUserSDK.payload,
              blockchainWallet: sectionUserSDK.blockchainWallet,
            },

          });
          const roomUser: RoomUser = await RoomUser.findOne({
            where: {
              blockchainWallet: sectionUserSDK.blockchainWallet,
              roomId: sectionUserSDK.roomId,
              network: sectionUserSDK.network,
              chainId: sectionUserSDK.chainId,
            },
          });
          const user: SectionUser = sectionUser.toJSON() as SectionUser;
          user.userProfile = { payload: roomUser.payload };
          return user;
        },
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
