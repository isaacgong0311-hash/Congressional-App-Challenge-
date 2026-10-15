import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { proxy } from "../../proxy";

describe("provider API rate limit", () => {
  it("limits costly routes by IP and returns a bilingual 429 envelope", async () => {
    const ip = "198.51.100.77";
    const request = (path: string, language = "en") =>
      new NextRequest(`https://lantern.test${path}`, {
        method: "POST",
        headers: { "x-forwarded-for": ip, "accept-language": language },
      });

    for (let index = 0; index < 10; index += 1) {
      expect(proxy(request("/api/explain")).status).toBe(200);
    }
    const limited = proxy(request("/api/explain", "es"));
    expect(limited.status).toBe(429);
    expect(limited.headers.get("retry-after")).toBe("60");
    expect(limited.headers.get("cache-control")).toBe("no-store");
    await expect(limited.json()).resolves.toMatchObject({
      error: { code: "RATE_LIMITED", retryable: false, message: expect.stringContaining("Espere un minuto") },
    });
    expect(proxy(request("/api/speak")).status).toBe(200);
    expect(proxy(request("/api/health")).status).toBe(200);
  });

  it("covers every provider-backed API route", () => {
    const limits = {
      "/api/first-day/extract": 10,
      "/api/first-day/rank-sources": 20,
      "/api/ask": 40,
      "/api/translate-field": 20,
      "/api/speak": 30,
      "/api/local-help": 10,
    };
    for (const [path, limit] of Object.entries(limits)) {
      const headers = { "x-forwarded-for": `203.0.113.${limit}` };
      for (let index = 0; index < limit; index += 1) {
        expect(proxy(new NextRequest(`https://lantern.test${path}`, { method: "POST", headers })).status).toBe(200);
      }
      expect(proxy(new NextRequest(`https://lantern.test${path}`, { method: "POST", headers })).status).toBe(429);
    }
  });
});
