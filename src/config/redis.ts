import Redis from "ioredis";

let redis: Redis | null = null;

const createRedisClient = (): Redis => {
  if (redis) return redis;

  if (process.env.REDIS_URL) {
    // Cloud / Upstash
    redis = new Redis(process.env.REDIS_URL);
  } else {
    // Self-hosted
    redis = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD || undefined,
      maxRetriesPerRequest: null,
    });
  }

  redis.on("connect", () => {
    console.log("✅ Redis connected");
  });

  redis.on("error", (err) => {
    console.error("❌ Redis error", err);
  });

  redis.on("close", () => {
    console.warn("⚠️ Redis connection closed");
  });

  return redis;
};

export const getRedis = (): Redis => createRedisClient();

export const disconnectRedis = async (): Promise<void> => {
  if (redis) {
    await redis.quit();
    redis = null;
    console.log("🛑 Redis disconnected");
  }
};
