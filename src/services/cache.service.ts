import { getRedis } from "../config/redis";

const redis = getRedis();
const REGISTER_TTL = 60 * 5; // 5 minutes
export const CacheService = {
  async set(key: string, value: unknown, ttlSeconds: number) {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  },

  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(key);
    return data ? (JSON.parse(data) as T) : null;
  },

  async del(key: string) {
    await redis.del(key);
  },

  async clear(email: string, ip: string): Promise<void> {
    const key = `register:${email}:${ip}`;
    await redis.del(key);
  },
// rapup
  async check(email: string, ip: string): Promise<void> {
    const key = `${email}:register-rate-limit:${ip}`; // example: user@example.com:register-rate-limit:123.456.789.0

    const exists = await redis.get(key);
    if (exists) {
      throw new Error("Too many registration attempts. Try later.");
    }

    // lock registration attempt
    await redis.set(key, "1", "EX", REGISTER_TTL);
  },

  //verify 
  async verify(verifyToken: string): Promise<string> {
    const key = `verify:${verifyToken}`; // example: verify:hajfdhsatrhfdsfashfasdhfa8ort

    // const exists = await redis.get(key);
    // if (!exists) {
    //   throw new Error("Invalid verification token.");
    // }

    return key;
  },

  
};
