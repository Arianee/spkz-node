/* eslint-disable */
/* Mocks must be before imports */

const mockGet = jest.fn();
const mockSetex = jest.fn();
jest.mock('./redis.service', () => ({
  publish: jest.fn(),
  subscribe: jest.fn(),
  redisClient: {
    on: jest.fn(),
  },
  get: mockGet,
  setex: mockSetex,
}));

jest.mock('./sign.service', () => ({
  SignService: jest.fn().mockImplementation(() => ({
    sign: jest.fn(),
  })),
}));

const mockFetchRoom = jest.fn();
jest.mock('@arianee/spkz-sdk/services/utils', () => ({
  __esModule: true,
  utils: {
    fetchRoomService: {
      fetchRoom: mockFetchRoom,
    },
  },
}));

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
  },
}));

const mockSequelizeQuery = jest.fn();
jest.mock('./bdd.service', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    query: mockSequelizeQuery
  }))
}));

import { utils } from '@arianee/spkz-sdk/services/utils';
import axios from 'axios';
import {
  PushNotificationNewMessagePayload,
  PushNotificationPayload,
  PushNotificationRequest,
  PushNotificationService,
} from './pushNotification.service';
import redisService from './redis.service';
import { Message } from '../models/message.model';

/* eslint-enable */

describe('PushNotificationService', () => {
  let pushNotificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    pushNotificationService = new PushNotificationService();
  });

  describe('init', () => {
    it('should listen to redis messages with redisMessageHandler and subscribe to spkz-message channel', async () => {
      const redisMessageHandlerSpy = jest.spyOn(pushNotificationService, 'redisMessageHandler').mockImplementation(() => {});
      await pushNotificationService.init();
      expect(redisService.redisClient.on).toHaveBeenCalledTimes(1);
      expect(redisService.redisClient.on).toHaveBeenCalledWith('message', redisMessageHandlerSpy);
      expect(redisService.subscribe).toHaveBeenCalledTimes(1);
      expect(redisService.subscribe).toHaveBeenCalledWith('spkz-message');
    });
  });

  describe('redisMessageHandler', () => {
    it('should call onSpkzMessage if channel is spkz-message', async () => {
      const onSpkzMessageSpy = jest.spyOn(pushNotificationService, 'onSpkzMessage').mockImplementation(() => {});
      await pushNotificationService.redisMessageHandler('spkz-message', 'abcee');
      expect(onSpkzMessageSpy).toHaveBeenCalledTimes(1);
      expect(onSpkzMessageSpy).toHaveBeenCalledWith('abcee');
    });
    it('should do nothing if channel is not spkz-message', async () => {
      const onSpkzMessageSpy = jest.spyOn(pushNotificationService, 'onSpkzMessage').mockImplementation(() => {});
      await pushNotificationService.redisMessageHandler('unhandled channel', 'abceeaaa');
      expect(onSpkzMessageSpy).toHaveBeenCalledTimes(0);
    });
  });

  describe('fetchPushNotificationEndpoints', () => {
    it('should return an empty array if pushNotificationEndpoints is not set', async () => {
      mockFetchRoom.mockResolvedValue(undefined);

      await expect(pushNotificationService.fetchPushNotificationEndpoints('1')).resolves.toEqual([]);
      expect(utils.fetchRoomService.fetchRoom).toHaveBeenCalledTimes(1);
      expect(utils.fetchRoomService.fetchRoom).toHaveBeenCalledWith('1');
    });

    it('should return the NFTROOM json', async () => {
      mockFetchRoom.mockResolvedValue({ pushNotificationEndpoints: ['https://bouncer.com'] });

      await expect(pushNotificationService.fetchPushNotificationEndpoints('1')).resolves.toEqual([
        'https://bouncer.com',
      ]);

      expect(utils.fetchRoomService.fetchRoom).toHaveBeenCalledTimes(1);
      expect(utils.fetchRoomService.fetchRoom).toHaveBeenCalledWith('1');
    });
  });

  describe('onSpkzMessage', () => {
    it('should call buildPushNotificationRequest and sendToPushNotificationEndpoints with correct values', async () => {
      const message: Message = {
        roomId: '123',
        sectionId: 'testSection',
        payload: {
          content: 'a message',
          signature: 'a signature',
          authorizations: ['authorizations here'],
        },
        createdAt: null,
        updatedAt: null,
        id: 1,
        chainId: '1',
        network: '1',
        blockchainWallet: '0xabcdefgh',
      } as Message;

      const mockPushNotificationPayload: PushNotificationPayload = {
        message: {
          content: 'a message',
          signature: 'a signature',
          authorizations: ['authorizations here'],
        },
      };

      const mockPushNotificationRequest: PushNotificationRequest = {
        type: 'newMessage',
        payload: mockPushNotificationPayload,
        addresses: ['0xa'],
        nodeSignature: 'signature',
        roomId: '123',
      };

      const buildPushNotificationRequestSpy = jest
        .spyOn(pushNotificationService, 'buildPushNotificationRequest')
        .mockResolvedValue(mockPushNotificationRequest);

      const sendToPushNotificationEndpointsSpy = jest
        .spyOn(pushNotificationService, 'sendToPushNotificationEndpoints')
        .mockImplementation(() => {});

      await pushNotificationService.onSpkzMessage(JSON.stringify(message));
      expect(buildPushNotificationRequestSpy).toHaveBeenCalledWith(
        'newMessage',
        mockPushNotificationPayload,
        '123',
        'testSection',
      );
      expect(buildPushNotificationRequestSpy).toHaveBeenCalledTimes(1);
      expect(sendToPushNotificationEndpointsSpy).toHaveBeenCalledWith(mockPushNotificationRequest);
      expect(sendToPushNotificationEndpointsSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('buildPushNotificationRequest', () => {
    it('should get addresses to notify and return a valid pushnotificationrequest', async () => {
      const payload: PushNotificationNewMessagePayload = {
        message: {
          content: 'test',
          signature: 'abcdef',
          authorizations: ['aaa'],
        },
      };

      const getAddressesToNotifySpy = jest
        .spyOn(pushNotificationService, 'getAddressesToNotify')
        .mockResolvedValue(['0xa', '0xb', '0xc']);

      const signSpy = jest
        .spyOn(pushNotificationService.signService, 'sign')
        .mockReturnValue('signature');

      const request = await pushNotificationService.buildPushNotificationRequest(
        'newMessage',
        payload,
        '1',
        'testSection',
      );

      expect(getAddressesToNotifySpy).toHaveBeenCalledWith('1', 'testSection');
      expect(getAddressesToNotifySpy).toHaveBeenCalledTimes(1);
      expect(signSpy).toHaveBeenCalledWith(JSON.stringify({
        type: 'newMessage',
        addresses: ['0xa', '0xb', '0xc'],
        payload: {
          ...payload,
        },
        roomId: '1',
      }));

      expect(request).toMatchObject({
        type: 'newMessage',
        addresses: ['0xa', '0xb', '0xc'],
        payload: {
          ...payload,
        },
        nodeSignature: 'signature',
        roomId: '1',
      });
    });
  });

  describe('sendToPushNotificationEndpoints', () => {
    it('should fetch pushNotificationEndpoints and call sendToPushNotificationEndpoint for each endpoint', async () => {
      const endpoints = ['https://bouncer1.com', 'https://bouncer2.com'];

      const fetchPushNotificationEndpointsSpy = jest
        .spyOn(pushNotificationService, 'fetchPushNotificationEndpoints')
        .mockResolvedValue(endpoints);

      const sendToPushNotificationEndpointSpy = jest
        .spyOn(pushNotificationService, 'sendToPushNotificationEndpoint')
        .mockImplementation(() => {});

      const pushNotificationRequest = { test: 'abc', roomId: '1264315' };

      await pushNotificationService.sendToPushNotificationEndpoints(pushNotificationRequest);

      expect(fetchPushNotificationEndpointsSpy).toHaveBeenCalledTimes(1);
      expect(fetchPushNotificationEndpointsSpy).toHaveBeenCalledWith('1264315');

      expect(sendToPushNotificationEndpointSpy).toHaveBeenCalledTimes(2);
      expect(sendToPushNotificationEndpointSpy).toHaveBeenNthCalledWith(
        1,
        endpoints[0],
        pushNotificationRequest,
      );
      expect(sendToPushNotificationEndpointSpy).toHaveBeenNthCalledWith(
        2,
        endpoints[1],
        pushNotificationRequest,
      );
    });
  });

  describe('sendToPushNotificationEndpoint', () => {
    it('should call axios.post', async () => {
      const endpoint = 'https://google.com';
      const request = { type: 'newMessage' };

      await pushNotificationService.sendToPushNotificationEndpoint(endpoint, request);

      expect(axios.post).toHaveBeenCalledWith(`${endpoint}/pushNotification/${request.type}`, request);
    });
  });

  describe('getAddressesToNotify', () => {
    it('should fetch addresses from cache', async () => {
      mockGet.mockResolvedValue(JSON.stringify(['abc', 'def']));

      const addresses = await pushNotificationService.getAddressesToNotify('1', 'test');

      expect(mockGet).toHaveBeenCalledWith('1_test_addresses');
      expect(addresses).toEqual(['abc', 'def']);
    });

    it('should fetch addresses from db if cache is empty and update cache', async () => {
      mockGet.mockResolvedValue(null);
      const dbResolvedValue = [[{ blockchainWallet: 'abcdef' }, { blockchainWallet: 'abcdef2' }]];
      const expectedAddresses = ['abcdef', 'abcdef2'];
      mockSequelizeQuery.mockResolvedValue(dbResolvedValue);

      const addresses = await pushNotificationService.getAddressesToNotify('264', 'test');

      expect(mockGet).toHaveBeenCalledWith('264_test_addresses');
      expect(mockSequelizeQuery).toHaveBeenCalledTimes(1);
      expect(mockSetex).toHaveBeenCalledWith('264_test_addresses', JSON.stringify(expectedAddresses), 60);
      expect(addresses).toEqual(expectedAddresses);
    });
  });
});
