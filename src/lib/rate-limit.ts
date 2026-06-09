import { redis } from "./redis";

interface RateLimitOptions {
  key: string;
  limit: number;
  windowSeconds: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

export async function rateLimit(options: RateLimitOptions): Promise<RateLimitResult> {
  const { key, limit, windowSeconds } = options;
  const redisKey = `rate:${key}`;

  try {
    const pipeline = redis.pipeline();
    pipeline.incr(redisKey);
    pipeline.ttl(redisKey);
    const results = await pipeline.exec();

    const count = (results?.[0]?.[1] as number) ?? 1;
    const ttl = (results?.[1]?.[1] as number) ?? -1;

    if (count === 1 || ttl === -1) {
      await redis.expire(redisKey, windowSeconds);
    }

    const resetAt = Date.now() + (ttl > 0 ? ttl * 1000 : windowSeconds * 1000);

    return {
      success: count <= limit,
      remaining: Math.max(0, limit - count),
      resetAt,
    };
  } catch {
    // If Redis is unavailable, allow the request (fail open)
    return { success: true, remaining: limit, resetAt: Date.now() + windowSeconds * 1000 };
  }
}

export async function contactRateLimit(ip: string): Promise<RateLimitResult> {
  return rateLimit({
    key: `contact:${ip}`,
    limit: 3,
    windowSeconds: 600, // 10 minutes
  });
}
