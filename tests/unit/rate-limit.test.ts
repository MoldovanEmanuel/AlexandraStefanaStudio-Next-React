import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Redis before importing rate-limit
vi.mock("@/lib/redis", () => {
  let store: Record<string, number> = {};
  const mockRedis = {
    pipeline: () => ({
      incr: (key: string) => { store[key] = (store[key] ?? 0) + 1; return null; },
      ttl: (key: string) => null,
      exec: async () => [[null, store[Object.keys(store).at(-1)!]], [null, -1]],
    }),
    expire: vi.fn(),
  };
  return { redis: mockRedis };
});

import { rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("allows requests within the limit", async () => {
    const result = await rateLimit({ key: "test-user-1", limit: 3, windowSeconds: 60 });
    expect(result.success).toBe(true);
    expect(result.remaining).toBeGreaterThanOrEqual(0);
  });
});
