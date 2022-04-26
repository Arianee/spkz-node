import { get } from 'lodash';
import Web3 from 'web3';

export interface RotatingPrivateKey {
  privateKey: string;
  startUsingTimestamp: number;
}

export type PrivateKeysEnv = RotatingPrivateKey[]

/**
 * This service is used to sign messages using ETH private keys, it uses a key rotation mechanism :
 *
 * Each private key used has a `startUsingTimestamp` associated to it which
 * defines from which unix timestamp in seconds the key should be used to sign messages, discarding any
 * key whose unix timestamp is less or equal to this unix timestamp.
 *
 * The key in use at any given time is the key whose startUsingTimestamp is the closer to (less than) the
 * current timestamp.
 *
 * If the last key is reached (the key whose startUsingTimestamp is the highest), it will be used indefinitely until
 * a new key with a greater startUsingTimestamp is added.
 *
 *
 * Private keys must be defined in the environment variable PRIVATE_KEYS
 * Example value:
 * [
 *  {
 *    "privateKey": "b2223df7142830659005ccb7f25a9c4b55aaa6d85521c82b19817c80b755099e",
 *    "startUsingTimestamp": 0
 *  },
 *  {
 *    "privateKey": "ed0a881ef0d1a4a41bf03c1441e384d09f5d76a380c12c5893b470ed9ba750ea",
 *    "startUsingTimestamp": 1903333791
 *  }
 * ]
 *
 * In this example, the first private key will be used until the startUsingTimestamp of the second one
 * is reached (1903333791, which is Thu Apr 25 2030 07:49:51 GMT+0000)
 */
export class SignService {
  private web3 = new Web3();

  /**
   * Sign data using the active private key
   * @param data data to sign
   * @returns signature of data using the active private key
   */
  public sign = (data: string): string => {
    try {
      const activePrivateKey = this.getActivePrivateKey();
      const account = this.web3.eth.accounts.privateKeyToAccount(activePrivateKey);
      return account.sign(data).signature;
    } catch {
      throw new Error('sign require a private key to be active');
    }
  }

  /**
   * Returns the public key corresponding to the private
   * key actually used by this node
   */
  public getActivePublicKey = (): string => {
    try {
      const activePrivateKey = this.getActivePrivateKey();
      return this.web3.eth.accounts.privateKeyToAccount(activePrivateKey).address.toLowerCase();
    } catch {
      throw new Error('no active public key');
    }
  }

  /**
   * Returns the private key  actually used by this node
   */
  private getActivePrivateKey = (): string => {
    const rotatingPrivateKeys: PrivateKeysEnv = this.getRotatingPrivateKeys();

    // Get seconds since epoch time (timezone independent)
    const currentUtcTimestamp = Math.floor(new Date(new Date().toUTCString()).getTime() / 1000);

    /* Sort by startUsingTimestamp desc and filter by startUsingTimestamp already passed
    * The first index is the startUsingTimestamp that is the nearest from the current timestamp */
    const sortedRotatingKeysCandidates: RotatingPrivateKey[] = rotatingPrivateKeys
      .sort((a, b) => b.startUsingTimestamp - a.startUsingTimestamp)
      .filter((rotatingPrivateKey) => rotatingPrivateKey.startUsingTimestamp <= currentUtcTimestamp);

    const activePrivateKey: string | undefined = get(sortedRotatingKeysCandidates[0], 'privateKey', undefined);
    if (!activePrivateKey) throw new Error('no active private key');

    return activePrivateKey;
  }

  /**
   * Returns the rotating private keys used by this node
   */
  private getRotatingPrivateKeys = (): PrivateKeysEnv => {
    try {
      const stringifiedPrivateKeysEnv: string = process.env.PRIVATE_KEYS;
      const privateKeysEnv: PrivateKeysEnv = JSON.parse(stringifiedPrivateKeysEnv);

      return privateKeysEnv;
    } catch {
      return [];
    }
  }
}
