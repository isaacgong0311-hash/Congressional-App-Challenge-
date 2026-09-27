import { describe, expect, it } from "vitest";

import {
  enforceRateLimit,
  MemoryRateLimitBackend,
  type RateLimitBackend,
} from "../../app/lib/rate-limit";

describe("distributed rate-limit policy", () => {
  it("enforces the First Day minute limit", async () => {
    let now = 1_000;
    const backend = new MemoryRateLimitBackend(() => now);
    const request = () =>
      enforceRateLimit({
        pathname: "/api/first-day/extract",
        identifier: "203.0.113.1",
        environment: { RATE_LIMIT_SALT: "test-salt" },
        backend,
        now: () => now,
      });

    for (let index = 0; index < 10; index += 1) {
      await expect(request()).resolves.toEqual(
        expect.objectContaining({ status: "allowed" }),
      );
    }
    await expect(request()).resolves.toEqual(
      expect.objectContaining({ status: "limited", limit: 10 }),
    );

    now += 60_001;
    await expect(request()).resolves.toEqual(
      expect.objectContaining({ status: "allowed" }),
    );
  });

  it("enforces the First Day 60-request daily limit across minute windows", async () => {
    let now = 1_000;
    const backend = new MemoryRateLimitBackend(() => now);
    const request = () =>
      enforceRateLimit({
        pathname: "/api/first-day/extract",
        identifier: "203.0.113.3",
        environment: { RATE_LIMIT_SALT: "test-salt" },
        backend,
        now: () => now,
      });

    for (let window = 0; window < 6; window += 1) {
      for (let index = 0; index < 10; index += 1) {
        await expect(request()).resolves.toEqual(
          expect.objectContaining({ status: "allowed" }),
        );
      }
      now += 60_001;
    }
    await expect(request()).resolves.toEqual(
      expect.objectContaining({ status: "limited", limit: 60 }),
    );
  });

  it("applies the stricter general-letter minute and daily policy", async () => {
    let now = 1_000;
    const backend = new MemoryRateLimitBackend(() => now);
    const request = () =>
      enforceRateLimit({
        pathname: "/api/explain",
        identifier: "203.0.113.4",
        environment: { RATE_LIMIT_SALT: "test-salt" },
        backend,
        now: () => now,
      });

    for (let window = 0; window < 4; window += 1) {
      for (let index = 0; index < 5; index += 1) {
        await expect(request()).resolves.toEqual(
          expect.objectContaining({ status: "allowed" }),
        );
      }
      now += 60_001;
    }
    await expect(request()).resolves.toEqual(
      expect.objectContaining({ status: "limited", limit: 20 }),
    );
  });

  it("fails closed on Vercel when Redis protection is not configured", async () => {
    await expect(
      enforceRateLimit({
        pathname: "/api/explain",
        identifier: "203.0.113.2",
        environment: { VERCEL_ENV: "production" },
      }),
    ).resolves.toEqual({ status: "unavailable" });
  });

  it("allows local development to use the in-memory fallback", async () => {
    await expect(
      enforceRateLimit({
        pathname: "/api/ask",
        identifier: "local",
        environment: {},
      }),
    ).resolves.toEqual(expect.objectContaining({ status: "allowed" }));
  });

  it("passes only an anonymized identifier to the backing store", async () => {
    const identifiers: string[] = [];
    const backend: RateLimitBackend = {
      async limit(identifier, _scope, maximum) {
        identifiers.push(identifier);
        return {
          success: true,
          limit: maximum,
          remaining: maximum - 1,
          reset: Date.now() + 60_000,
        };
      },
    };

    await enforceRateLimit({
      pathname: "/api/first-day/extract",
      identifier: "203.0.113.99",
      environment: { RATE_LIMIT_SALT: "private-test-salt" },
      backend,
    });

    expect(identifiers).toHaveLength(2);
    expect(identifiers.every((value) => !value.includes("203.0.113.99"))).toBe(
      true,
    );
  });
});
