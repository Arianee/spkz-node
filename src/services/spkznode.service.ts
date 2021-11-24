import { SPKZJSONRPC } from '@arianee/spkz-sdk/server';
import { NetworkParameters } from '@arianee/spkz-sdk/models/jsonrpc/networkParameters';
import {
  NewMessageCount,
  ReadMessageParameters,
  ReadMessageReturn,
  RoomUser as RoomUserSDK,
  SectionUser as SectionUserSDK,
  SectionUserGet,
  WriteMessageParameters,
} from '@arianee/spkz-sdk/models/jsonrpc/writeMessageParameters';
import { Sequelize } from 'sequelize';
import { SectionUser } from '../models/sectionUser.model';
import { Message } from '../models/message.model';
import { RoomUser } from '../models/roomUser.model';
import redisService from './redis.service';
import sequelizeInstance from './bdd.service';

export class SpkzNodeService {
  private jsonRPC;

  constructor() {
    this.jsonRPC = new SPKZJSONRPC({
      chainId: process.env.CHAIN_ID || '1',
      network: process.env.NETWORK_ID || '1',
    } as NetworkParameters)
      .setMessagesMethod({
        read: async (parameters: ReadMessageParameters): Promise<ReadMessageReturn> => {
          const hardLimit = parameters.limit < 1000 ? parameters.limit : 1000;
          const limitPlusOne = hardLimit + 1;

          const query = {
            where: {
              roomId: parameters.roomId,
              sectionId: parameters.sectionId,
              network: parameters.network,
              chainId: parameters.chainId,
            } as any,
            limit: limitPlusOne,
            raw: true,
            order: null,
          };

          // typing problem. If order is in object, ts is not happy!
          query.order = [['createdAt', 'desc']];
          if (parameters.fromTimestamp) {
            query.where.fromTimestamp = {
              $gte: parameters.fromTimestamp,
            };
            query.order = [['createdAt', 'asc']];
          } else if (parameters.toTimestamp) {
            query.where.toTimestamp = {
              $lt: parameters.toTimestamp,
            };
            query.order = [['createdAt', 'desc']];
          }
          const queryResult = await Message.findAll(query);
          if (queryResult.length === 0) {
            const messageResult: ReadMessageReturn = {
              messageCount: 0,
              isMoreMessages: false,
              messages: [],
              nextTimestamp: null,
            };

            return Promise.resolve(messageResult);
          }
          const isMoreMessages = !(queryResult.length < limitPlusOne);

          const nextTimestamp = (queryResult[queryResult.length - 1].createdAt) as any;
          const messagesToReturn = isMoreMessages ? queryResult.slice(0, queryResult.length - 1) : queryResult;

          const messageResult: ReadMessageReturn = {
            messageCount: messagesToReturn.length,
            isMoreMessages,
            messages: messagesToReturn,
            nextTimestamp,
          };

          return Promise.resolve(messageResult);
        },
        newMessage: async (parameters):Promise<NewMessageCount[]> => {
          const query = `
          SELECT count("messages"."id") as "newMessagesCount", sectionId as "sectionId", MIN(lastViewed) as "lastViewed" FROM 
          (SELECT 
          "sectionUsers"."sectionId" as sectionId,
             "sectionUsers"."roomId" as roomId,
             "sectionUsers"."network" as network,
             "sectionUsers"."chainId" as chainId,
           "sectionUsers"."lastViewed" as lastViewed 
           
           FROM "sectionUsers"
          WHERE "sectionUsers"."roomId" = '${parameters.roomId}'
          AND "sectionUsers"."blockchainWallet" = '${parameters.blockchainWallet}'
          AND "sectionUsers"."network" = '${parameters.network}'
          AND "sectionUsers"."chainId" = '${parameters.chainId}') lastViewedTable
          LEFT JOIN
          "messages"
          ON
          (
          "messages"."roomId" =  lastViewedTable.roomId
          AND "messages"."sectionId" =  lastViewedTable.sectionId
          AND "messages"."network" =  lastViewedTable.network
          AND "messages"."chainId" =  lastViewedTable.chainId
          AND "messages"."createdAt" > lastViewedTable.lastViewed
          )
          GROUP BY lastViewedTable.sectionId
   `;

          const [res] = await sequelizeInstance().query(query) as any;

          return res;
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
          try {
            const [sectionUsers] = await sequelizeInstance().query(`
              SELECT "roomUsers".payload AS userProfile, "roomUsers".* FROM "sectionUsers"
              LEFT JOIN
              "roomUsers"
              ON
              "roomUsers"."blockchainWallet" = "sectionUsers"."blockchainWallet" AND
              "roomUsers"."roomId" = "sectionUsers"."roomId" AND
              "roomUsers"."network" = "sectionUsers"."network" AND
              "roomUsers"."chainId" = "sectionUsers"."chainId"
              WHERE 
              "sectionUsers"."roomId" = '${sectionUserGet.roomId}' AND
              "sectionUsers"."sectionId"= '${sectionUserGet.sectionId}' AND
              "sectionUsers"."network"= '${sectionUserGet.network}' AND
              "sectionUsers"."chainId"= '${sectionUserGet.chainId}'
              ORDER BY "roomUsers"."updatedAt" DESC
            `) as any;

            return sectionUsers;
          } catch (e) {
            console.error('e', e);
            throw new Error(e);
          }
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
        updateLastViewed: async (sectionUserSDK: SectionUserSDK) => {
          const [profileReturn, isCreated] = await SectionUser.findOrCreate({
            where: {
              blockchainWallet: sectionUserSDK.blockchainWallet,
              roomId: sectionUserSDK.roomId,
              sectionId: sectionUserSDK.sectionId,
              network: sectionUserSDK.network,
              chainId: sectionUserSDK.chainId,
            },
            defaults: {
              blockchainWallet: sectionUserSDK.blockchainWallet,
              roomId: sectionUserSDK.roomId,
              sectionId: sectionUserSDK.sectionId,
              network: sectionUserSDK.network,
              chainId: sectionUserSDK.chainId,
              lastViewed: Sequelize.fn('NOW'),
            },
          });

          if (!isCreated) {
            await profileReturn.update({ lastViewed: Sequelize.fn('NOW') });
          }

          return profileReturn;
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
