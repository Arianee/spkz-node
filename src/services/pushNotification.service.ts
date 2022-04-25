import { utils } from '@arianee/spkz-sdk/services/utils';
import { NFTROOM } from '@arianee/spkz-sdk';
import axios from 'axios';
import redisService from './redis.service';
import { Message } from '../models/message.model';
import { SignService } from './sign.service';
import sequelizeInstance from './bdd.service';

export type PushNotificationType = 'newMessage';

export type PushNotificationNewMessagePayload = {
  message: {
    content: string;
    signature: string;
    authorizations: string[];
  };
};

export type PushNotificationPayload = PushNotificationNewMessagePayload;

export interface PushNotificationRequest {
  type: PushNotificationType;
  payload: PushNotificationPayload;
  addresses: string[];
  nodeSignature: string;
  roomId: string;
}

export class PushNotificationService {
  private signService: SignService = new SignService();

  public async init() {
    redisService.redisClient.on('message', this.redisMessageHandler);

    redisService.subscribe('spkz-message');
  }

  private redisMessageHandler = async (channel, message) => {
    switch (channel) {
      case 'spkz-message':
        await this.onSpkzMessage(message);
        break;
      default:
        break;
    }
  }

  private async onSpkzMessage(rawMessage) {
    const message: Message = JSON.parse(rawMessage);
    const { roomId, sectionId } = message;

    const pushNotificationPayload: PushNotificationPayload = {
      message: {
        content: message.payload.content,
        signature: message.payload.signature,
        authorizations: message.payload.authorizations,
      },
    };

    const pushNotificationRequest = await this.buildPushNotificationRequest(
      'newMessage',
      pushNotificationPayload,
      roomId,
      sectionId,
    );

    await this.sendToPushNotificationEndpoints(pushNotificationRequest);
  }

  private fetchPushNotificationEndpoints = async (roomId: string): Promise<string[]> => {
    const nftRoom: NFTROOM = await utils.fetchRoomService.fetchRoom(roomId);
    return nftRoom?.pushNotificationEndpoints || [];
  }

  /**
   * Build a valid PushNotificationRequest from a PushNotificationType
   * and PushNotificationPayload by adding addresses to notify and
   * signing it
   * @param type push notification type
   * @param payload push notification payload
   * @param sectionId concerned room id used to get addresses to notify
   * @param sectionId concerned section id used to get addresses to notify
   * @returns a valid PushNotificationRequest
   */
  private async buildPushNotificationRequest(
    type: PushNotificationType,
    payload: PushNotificationPayload,
    roomId: string,
    sectionId: string,
  ) {
    const addresses = await this.getAddressesToNotify(roomId, sectionId);

    const partialRequest: Omit<PushNotificationRequest, 'nodeSignature'> = {
      type,
      addresses,
      payload: {
        ...payload,
      },
      roomId,
    };

    const request: PushNotificationRequest = {
      ...partialRequest,
      nodeSignature: this.signService.sign(JSON.stringify(partialRequest)),
    };

    return request;
  }

  /**
   * Send the push notification request to all node endpointss
   * @param pushNotificationRequest the push notification request to be sent
   */
  private async sendToPushNotificationEndpoints(pushNotificationRequest: PushNotificationRequest) {
    const pushNotificationEndpoints = await this.fetchPushNotificationEndpoints(pushNotificationRequest.roomId);

    pushNotificationEndpoints.forEach(async (pushNotificationEndpoint) => {
      await this.sendToPushNotificationEndpoint(pushNotificationEndpoint, pushNotificationRequest);
    });
  }

  private sendToPushNotificationEndpoint = async (endpoint: string, pushNotificationRequest: PushNotificationRequest) => {
    await axios.post(`${endpoint}/pushNotification/${pushNotificationRequest.type}`, pushNotificationRequest);
  }

  /**
   * Get all the addresses that joined sectionId from Redis if cached,
   * fetch from database and cache in Redis otherwise
   * @param sectionId id of the section to get addresses from
   * @returns array of addresses (public key) that joined the section
   */
  private getAddressesToNotify = async (roomId: string, sectionId: string): Promise<string[]> => {
    const key = `${roomId}_${sectionId}_addresses`;

    let addressesFromCache: string[] | undefined;
    try {
      const fromRedis = await redisService.get(key);
      addressesFromCache = fromRedis ? JSON.parse(fromRedis) : undefined;
      // eslint-disable-next-line no-empty
    } catch { }

    if (!addressesFromCache) {
      const query = `
        SELECT "sectionUsers"."blockchainWallet" 
        FROM "sectionUsers"
        WHERE "sectionUsers"."roomId" = '${roomId}'
        AND "sectionUsers"."sectionId" = '${sectionId}'`;

      const [res] = await sequelizeInstance().query(query) as any;
      const addressesFromDb: string[] = res.map((obj) => obj.blockchainWallet);
      redisService.setex(key, JSON.stringify(addressesFromDb), 60);
      return addressesFromDb;
    }

    return addressesFromCache;
  }
}
