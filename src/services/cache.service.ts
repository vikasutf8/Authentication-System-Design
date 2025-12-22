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
 

  /* 
  
  register
  
  
  Fixed Window Rate Limite::Allow N requests per time window
  5 login attempts / 5 minutes / email + IP

  
}
  */
 async fixedWindowRateLimiterCheck(email: string, ip: string): Promise<void> {
  const key = `login:${email}:${ip}`;
  const limit = 5;
  const windowSeconds = 5 * 60;

  const count = await redis.incr(key);

  if (count === 1) {
    // first request → start window
    await redis.expire(key, windowSeconds);
  }

  if (count > limit) {
    throw new Error("Too many login attempts. Try later.");
  }
},

  // Simplee Lock/cooldoww limiter--?Only 1 attempt per 5 minutes per (email + IP)
  async check(email: string, ip: string): Promise<void> {
    const key = `${email}:register-rate-limit:${ip}`; // example: user@example.com:register-rate-limit:123.456.789.0

    const exists = await redis.get(key);
    console.log(exists,"exists");
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

 /* 
  
lgin
  
  */

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

 /* 
  
jwt token
  
  */

 async generateRefreshTokenkey(userId: string): Promise<string> {
    const key = `refresh-token:${userId}`;
    return key;
  },

  async setRefreshToken(key: string, token: string) {
    await redis.set(
      key,
      token,
      "EX", 
      7 * 24 * 60 * 60 // 7 days
    );
  },

  async getRefreshToken(userId: string): Promise<string | null> {
    return redis.get(`refresh-token:${userId}`);
  },

  async revokeRefreshToken(userId: string) {
    await redis.del(`refresh-token:${userId}`);
  },


  /**
   *  User Set
   */

  async setUserKey(userId: string) {
    return `user:${userId}`;
  },

  async revokeUserKey(userId: string) {
    await redis.del(`user:${userId}`);
  },

  /**
   * 
   * 
   * Rate Limiting
   */
  async leakyBucketLimiter(
  email: string,
  ip: string,
  capacity = 5,
  leakRate = 1 // req/sec
) {
  const key = `leaky:${email}:${ip}`;
  const now = Date.now();

  const data = await redis.get(key);
  let queueSize = 0;
  let lastLeak = now;

  if (data) {
    const parsed = JSON.parse(data);
    queueSize = parsed.queueSize;
    lastLeak = parsed.lastLeak;
  }

  const leaked = Math.floor(((now - lastLeak) / 1000) * leakRate);
  queueSize = Math.max(0, queueSize - leaked);

  if (queueSize >= capacity) {
    throw new Error("Too many requests. Try later.");
  }

  queueSize += 1;

  await redis.set(
    key,
    JSON.stringify({ queueSize, lastLeak: now }),
    "EX",
    3600
  );
}
,

  async tokenBucketLimiter(
  email: string,
  ip: string,
  capacity = 5,
  refillRate = 1 // tokens per second
) {
  const key = `token-bucket:${email}:${ip}`;
  const now = Date.now();

  const data = await redis.get(key);
  let tokens = capacity;
  let lastRefill = now;

  if (data) {
    const parsed = JSON.parse(data);
    tokens = parsed.tokens;
    lastRefill = parsed.lastRefill;
  }

  const elapsed = (now - lastRefill) / 1000;
  tokens = Math.min(capacity, tokens + elapsed * refillRate);

  if (tokens < 1) {
    throw new Error("Too many requests. Try later.");
  }

  tokens -= 1;

  await redis.set(
    key,
    JSON.stringify({ tokens, lastRefill: now }),
    "EX",
    3600
  );
}
,async slidingWindowCounterLimiter(
  email: string,
  ip: string,
  limit = 5,
  windowSeconds = 300
) {
  //how min window size-- 300 *1000 = 300000
  const now = Date.now();
  const currentWindow = Math.floor(now / (windowSeconds * 1000));
  const prevWindow = currentWindow - 1;
 console.log(now,currentWindow,prevWindow,"prevWindow");
  const currentKey = `sw-counter:${email}:${ip}:${currentWindow}`;
  const prevKey = `sw-counter:${email}:${ip}:${prevWindow}`;

  console.log(currentKey,prevKey,"currentKey");

  const currentCount = Number(await redis.get(currentKey)) || 0;
  const prevCount = Number(await redis.get(prevKey)) || 0;

  console.log(currentCount,prevCount,"currentCount");

  const elapsed =
    (now % (windowSeconds * 1000)) / (windowSeconds * 1000);

  const estimatedCount =
    prevCount * (1 - elapsed) + currentCount;
  console.log(estimatedCount,"estimatedCount");

  if (estimatedCount >= limit) {
    throw new Error("Too many requests. Try later.");
  }

  const tx = redis.multi();
  tx.incr(currentKey);
  tx.expire(currentKey, windowSeconds * 2);
  await tx.exec();
}

// 1766029706284 5886765 5886764 prevWindow
// sw-counter:vikasarya1889@gmail.com:::1:5886765 sw-counter:vikasarya1889@gmail.com:::1:5886764 currentKey
// 5 0 currentCount
// 5 estimatedCount
,
async slidingWindowLogLimiter(
  email: string,
  ip: string,
  limit = 5,
  windowSeconds = 300
) {
  const key = `sw-log:${email}:${ip}`;
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  console.log(key, now,windowStart,"windowStart");
  // sw-log:vikasarya1889@gmail.com:::1 1766029233074 1766028933074 windowStart
  // SORTED SET
  // Remove old requests
  await redis.zremrangebyscore(key, 0, windowStart);

  // Count requests in window
  const count = await redis.zcard(key);

  if (count >= limit) {
    throw new Error("Too many requests. Try later.");
  }

  // Add current request
  await redis.zadd(key, now, `${now}`);

  // Set TTL slightly more than window
  await redis.expire(key, windowSeconds);
}
,
};
