import redis, { RedisClient } from 'redis';

class RedisService {
  public redisClient:RedisClient;

  // Once a redis client is used for pubsub, it can't be used for cache so we need another one
  private redisClientForCache:RedisClient;

  constructor() {
    if (process.env.REDIS_URL) {
      const redisurl = process.env.REDIS_URL;
      this.redisClient = redis.createClient(redisurl);
      this.redisClientForCache = redis.createClient(redisurl);
    }
  }

  public publish = (channel:string, message:string) => {
    if (this.redisClient) {
      this.redisClient.publish(channel, message);
    }
  }

  public subscribe = (channel) => {
    if (this.redisClient) {
      this.redisClient.subscribe(channel);
    }
  }

  public async get(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.redisClientForCache.get(key, async (err, reply) => {
        if (err) return reject(err);
        return resolve(reply);
      });
    });
  }

  public setex(key: string, value: string, expiration: number) {
    this.redisClientForCache.setex(key, expiration, value);
  }
}

const redisService = new RedisService();
export default redisService;
