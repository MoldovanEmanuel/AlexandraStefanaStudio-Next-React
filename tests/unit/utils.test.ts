import { describe, it, expect } from "vitest";
import { createSlug, formatDate, getClientIp } from "@/lib/utils";

describe("createSlug", () => {
  it("creates a URL-safe slug from a name", () => {
    expect(createSlug("Apartament Modern Cluj")).toBe("apartament-modern-cluj");
  });

  it("handles diacritics", () => {
    const slug = createSlug("Proiect Rezidențial");
    expect(slug).not.toContain(" ");
    expect(slug).toMatch(/^[a-z0-9-]+$/);
  });
});

describe("formatDate", () => {
  it("formats a date string in Romanian locale", () => {
    const result = formatDate("2024-03-15T00:00:00.000Z");
    expect(result).toContain("2024");
    expect(typeof result).toBe("string");
  });
});

describe("getClientIp", () => {
  it("extracts IP from X-Forwarded-For header", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const req = new Request("http://localhost", {
      headers: { "x-real-ip": "9.9.9.9" },
    });
    expect(getClientIp(req)).toBe("9.9.9.9");
  });

  it("falls back to 127.0.0.1", () => {
    const req = new Request("http://localhost");
    expect(getClientIp(req)).toBe("127.0.0.1");
  });
});
