import IORedis from "ioredis";
import config from "./index";

let redisConnection: IORedis | null = null;

export const getRedisConnection = (): IORedis => {
  if (!redisConnection) {
    if (!config.redisUrl) {
      throw new Error("REDIS_URL is not defined in environment variables");
    }
    redisConnection = new IORedis(config.redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      retryStrategy: (times: number) => {
        if (times > 3) {
          console.error("❌ Redis connection failed after 3 retries");
          return null;
        }
        return Math.min(times * 200, 2000);
      },
    });

    redisConnection.on("connect", () => {
      console.log("✅ Redis connected");
    });

    redisConnection.on("error", (err: Error) => {
      console.error(`❌ Redis error: ${err.message}`);
    });
  }

  return redisConnection;
};

export default getRedisConnection;
