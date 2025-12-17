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

  // login

  async loginRateLimiterCheck(email: string, ip: string): Promise<void> {
    const key = `${email}:login-rate-limit:${ip}`; // example: user@example.com:register-rate-limit:123.456.789.0

    const exists = await redis.get(key);
    if (exists) {
      throw new Error("Too many login attempts. Try later.");
    }

    // lock registration attempt
    await redis.set(key, "1", "EX", REGISTER_TTL);
  },

  async verifyOTP(otp: string, email: string): Promise<string> {
    const key = `: ${email}:OTP:${otp}`; // example: verify:hajfdhsatrhfdsfashfasdhfa8ort

    return key;
  },

  /// jwt token
  async setRefreshToken(userId: string, token: string) {
    await redis.set(
      `refresh-token:${userId}`,
      token,
      "EX", 
      7 * 24 * 60 * 60 // 7 days
    );
  },

  async getRefreshToken(userId: string): Promise<string | null> {
    return redis.get(`refresh:${userId}`);
  },

  async revokeRefreshToken(userId: string) {
    await redis.del(`refresh:${userId}`);
  },
};
