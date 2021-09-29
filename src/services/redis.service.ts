import redis, { RedisClient } from 'redis';

class RedisService {
  public redisClient:RedisClient;

  constructor() {
    if (process.env.REDIS_URL) {
      const redisurl = process.env.REDIS_URL;
      this.redisClient = redis.createClient(redisurl);
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
}

const redisService = new RedisService();
export default redisService;
