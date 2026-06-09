import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { signJwt, verifyJwt } from "@/lib/jwt";

describe("hashPassword / verifyPassword", () => {
  it("hashes and verifies a correct password", async () => {
    const hash = await hashPassword("my-secure-password");
    expect(hash).toContain(":");
    expect(await verifyPassword("my-secure-password", hash)).toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("correct-password");
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("rejects malformed hash", async () => {
    expect(await verifyPassword("any", "no-colon-here")).toBe(false);
  });
});

describe("JWT", () => {
  const payload = { sub: "1", email: "admin@test.com", name: "Admin", role: "admin" as const };

  it("signs and verifies a token", async () => {
    const token = await signJwt(payload);
    expect(typeof token).toBe("string");
    const verified = await verifyJwt(token);
    expect(verified?.email).toBe(payload.email);
    expect(verified?.role).toBe("admin");
  });

  it("returns null for an invalid token", async () => {
    const result = await verifyJwt("not-a-valid-token");
    expect(result).toBeNull();
  });

  it("returns null for a tampered token", async () => {
    const token = await signJwt(payload);
    const tampered = token.slice(0, -5) + "XXXXX";
    expect(await verifyJwt(tampered)).toBeNull();
  });
});
