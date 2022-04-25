/* eslint-disable */
/* Mocks must be before imports */

const mockPrivateKeyToAccount = jest.fn();
const mockSign = jest.fn();
jest.mock('web3', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
        eth: {
            accounts: {
                privateKeyToAccount: mockPrivateKeyToAccount,
                sign: mockSign
            }
        }
    })),
}));

import { SignService, PrivateKeysEnv } from './sign.service';

/* eslint-enable */

let signService: SignService;

beforeEach(() => {
  jest.clearAllMocks();
  signService = new SignService();
});

describe('sign', () => {
  it('should throw if there is no active private key', () => {
    // @ts-ignore
    jest.spyOn(signService, 'getActivePrivateKey').mockImplementation(() => { throw new Error('an error'); });

    expect(signService.sign).toThrowError('sign require a private key to be active');
  });

  it('should sign data using the active private key', () => {
    const dataToSign = 'abcdef';
    // @ts-ignore
    jest.spyOn(signService, 'getActivePrivateKey').mockReturnValue('91101d37ff7c0d02229ec31faf77ad91acf7ddaea65d6d7bf8ff40367f5f4434');
    mockPrivateKeyToAccount.mockReturnValue({ sign: mockSign, address: '0x8590fd7d8e0be9a57b1919144a9f89f3def4372d' });
    mockSign.mockReturnValue({ signature: 'signature' });

    expect(signService.sign(dataToSign)).toEqual('signature');
    expect(mockSign).toHaveBeenCalledWith('abcdef');
    expect(mockPrivateKeyToAccount).toHaveBeenCalledWith('91101d37ff7c0d02229ec31faf77ad91acf7ddaea65d6d7bf8ff40367f5f4434');
  });
});

describe('getActivePublicKey', () => {
  it('should throw if there is no active private key', () => {
    // @ts-ignore
    jest.spyOn(signService, 'getActivePrivateKey').mockImplementation(() => { throw new Error('an error'); });

    expect(signService.getActivePublicKey).toThrowError('no active public key');
  });

  it('should return the lowercased public key corresponding to the active private key', () => {
    // @ts-ignore
    jest.spyOn(signService, 'getActivePrivateKey').mockReturnValue('91101d37ff7c0d02229ec31faf77ad91acf7ddaea65d6d7bf8ff40367f5f4434');
    mockPrivateKeyToAccount.mockReturnValue({ address: '0x8590fd7d8e0be9a57b1919144a9f89f3def4372d' });

    expect(signService.getActivePublicKey()).toEqual('0x8590fd7d8e0be9a57b1919144a9f89f3def4372d');
  });
});

describe('getActivePrivateKey', () => {
  it('should throw if there is no active private key', () => {
    // @ts-ignore
    jest.spyOn<PrivateKeysEnv>(signService, 'getRotatingPrivateKeys').mockReturnValue([]);

    // @ts-ignore
    expect(signService.getActivePrivateKey).toThrowError('no active private key');
  });

  it('should return the active private key', () => {
    const rotatingPrivateKeys: PrivateKeysEnv = [
      {
        privateKey: 'b2223df7142830659005ccb7f25a9c4b55aaa6d85521c82b19817c80b755099e',
        startUsingTimestamp: 0,
      },
      {
        privateKey: '91101d37ff7c0d02229ec31faf77ad91acf7ddaea65d6d7bf8ff40367f5f4434', // 0x8590fd7d8e0be9a57b1919144a9f89f3def4372d
        startUsingTimestamp: 1650874399, // Mon Apr 25 2022 08:13:19 GMT+0000
      },
      {
        privateKey: 'ed0a881ef0d1a4a41bf03c1441e384d09f5d76a380c12c5893b470ed9ba750ea',
        startUsingTimestamp: 1903333791, // Thu Apr 25 2030 07:49:51 GMT+0000
      },
    ];

    // @ts-ignore
    jest.spyOn<PrivateKeysEnv>(signService, 'getRotatingPrivateKeys').mockReturnValue(rotatingPrivateKeys);

    // @ts-ignore
    expect(signService.getActivePrivateKey()).toEqual('91101d37ff7c0d02229ec31faf77ad91acf7ddaea65d6d7bf8ff40367f5f4434');
  });
});

describe('getRotatingPrivateKeys', () => {
  it('should return an empty array if json parsing of private keys failed', () => {
    process.env.PRIVATE_KEYS = 'gaklG\\invalid json';

    // @ts-ignore
    expect(signService.getRotatingPrivateKeys()).toEqual([]);

    delete process.env.PRIVATE_KEYS;
  });

  it('should return an array of rotating private keys used by this node', () => {
    process.env.PRIVATE_KEYS = JSON.stringify([
      {
        privateKey: 'b2223df7142830659005ccb7f25a9c4b55aaa6d85521c82b19817c80b755099e',
        startUsingTimestamp: 0,
      },
      {
        privateKey: 'ed0a881ef0d1a4a41bf03c1441e384d09f5d76a380c12c5893b470ed9ba750ea',
        startUsingTimestamp: 1650880191,
      },
    ]);

    // @ts-ignore
    expect(signService.getRotatingPrivateKeys()).toEqual([
      {
        privateKey: 'b2223df7142830659005ccb7f25a9c4b55aaa6d85521c82b19817c80b755099e',
        startUsingTimestamp: 0,
      },
      {
        privateKey: 'ed0a881ef0d1a4a41bf03c1441e384d09f5d76a380c12c5893b470ed9ba750ea',
        startUsingTimestamp: 1650880191,
      },
    ]);

    delete process.env.PRIVATE_KEYS;
  });
});
