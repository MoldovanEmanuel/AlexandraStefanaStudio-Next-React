import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

function createRedis(): Redis {
  const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    enableReadyCheck: false,
  });

  redis.on("error", (err) => {
    if (process.env.NODE_ENV !== "test") {
      console.error("[Redis] connection error:", err.message);
    }
  });

  return redis;
}

export const redis = globalForRedis.redis ?? createRedis();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}

// ── Cache helpers ─────────────────────────────────────────────────────────────

const DEFAULT_TTL = 300; // 5 minutes

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttl: number = DEFAULT_TTL,
): Promise<void> {
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttl);
  } catch {
    // Non-fatal: cache miss is acceptable
  }
}

export async function cacheDel(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch {
    // Non-fatal
  }
}

export const CACHE_KEYS = {
  projects: "as-studio:projects:*",
  projectsList: "as-studio:projects:list",
  projectsHome: "as-studio:projects:home",
  projectSlug: (slug: string) => `as-studio:projects:slug:${slug}`,
  news: "as-studio:news:*",
  newsList: "as-studio:news:list",
  newsHome: "as-studio:news:home",
  heroSlides: "as-studio:hero:slides",
  renders: "as-studio:renders:list",
} as const;
