import { createHmac } from "node:crypto";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type Environment = Record<string, string | undefined>;

export type RateLimitRule = {
  minute: number;
  day?: number;
};

export const RATE_LIMIT_RULES: Record<string, RateLimitRule> = {
  "/api/first-day/extract": { minute: 10, day: 60 },
  "/api/explain": { minute: 5, day: 20 },
  "/api/speak": { minute: 30 },
  "/api/local-help": { minute: 10 },
  "/api/ask": { minute: 40 },
  "/api/translate-field": { minute: 20 },
};

const DEFAULT_RULE: RateLimitRule = { minute: 60 };

export type LimitResult = {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
};

export interface RateLimitBackend {
  limit(
    identifier: string,
    scope: string,
    maximum: number,
    duration: "60 s" | "24 h",
  ): Promise<LimitResult>;
}

type MemoryEntry = { count: number; reset: number };

export class MemoryRateLimitBackend implements RateLimitBackend {
  private readonly entries = new Map<string, MemoryEntry>();

  constructor(private readonly now: () => number = Date.now) {}

  async limit(
    identifier: string,
    scope: string,
    maximum: number,
    duration: "60 s" | "24 h",
  ): Promise<LimitResult> {
    const now = this.now();
    const durationMs = duration === "60 s" ? 60_000 : 86_400_000;
    const key = `${scope}:${identifier}`;
    const current = this.entries.get(key);
    const entry = !current || current.reset <= now
      ? { count: 0, reset: now + durationMs }
      : current;
    entry.count += 1;
    this.entries.set(key, entry);
    return {
      success: entry.count <= maximum,
      limit: maximum,
      remaining: Math.max(0, maximum - entry.count),
      reset: entry.reset,
    };
  }
}

class UpstashRateLimitBackend implements RateLimitBackend {
  private readonly limiters = new Map<string, Ratelimit>();

  constructor(
    private readonly redis: Redis,
    private readonly namespace: string,
  ) {}

  async limit(
    identifier: string,
    scope: string,
    maximum: number,
    duration: "60 s" | "24 h",
  ): Promise<LimitResult> {
    const key = `${scope}:${maximum}:${duration}`;
    let limiter = this.limiters.get(key);
    if (!limiter) {
      limiter = new Ratelimit({
        redis: this.redis,
        analytics: false,
        prefix: `${this.namespace}:${scope}`,
        limiter: Ratelimit.fixedWindow(maximum, duration),
      });
      this.limiters.set(key, limiter);
    }
    return limiter.limit(identifier);
  }
}

const localBackend = new MemoryRateLimitBackend();
let cachedDistributedBackend:
  | { fingerprint: string; backend: UpstashRateLimitBackend }
  | undefined;

export function isDistributedRateLimitingConfigured(
  environment: Environment = process.env,
) {
  return Boolean(
    environment.UPSTASH_REDIS_REST_URL?.trim() &&
    environment.UPSTASH_REDIS_REST_TOKEN?.trim() &&
    environment.RATE_LIMIT_SALT?.trim(),
  );
}

function distributedBackend(environment: Environment) {
  const url = environment.UPSTASH_REDIS_REST_URL?.trim();
  const token = environment.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  const namespace = environment.RATE_LIMIT_NAMESPACE?.trim() || "lantern";
  const fingerprint = `${url}:${namespace}`;
  if (cachedDistributedBackend?.fingerprint === fingerprint) {
    return cachedDistributedBackend.backend;
  }
  const backend = new UpstashRateLimitBackend(new Redis({ url, token }), namespace);
  cachedDistributedBackend = { fingerprint, backend };
  return backend;
}

function matchedRoute(pathname: string) {
  return Object.keys(RATE_LIMIT_RULES).find((route) =>
    pathname.startsWith(route),
  );
}

function anonymizedIdentifier(
  identifier: string,
  route: string,
  salt: string,
) {
  return createHmac("sha256", salt)
    .update(`${route}:${identifier}`)
    .digest("base64url");
}

export type EnforcedRateLimit =
  | { status: "unavailable" }
  | {
      status: "allowed" | "limited";
      limit: number;
      remaining: number;
      reset: number;
      retryAfterSeconds: number;
    };

export async function enforceRateLimit({
  pathname,
  identifier,
  environment = process.env,
  backend,
  now = Date.now,
}: {
  pathname: string;
  identifier: string;
  environment?: Environment;
  backend?: RateLimitBackend;
  now?: () => number;
}): Promise<EnforcedRateLimit> {
  const route = matchedRoute(pathname) ?? "api-default";
  const rule = RATE_LIMIT_RULES[route] ?? DEFAULT_RULE;
  const isVercelDeployment =
    environment.VERCEL_ENV === "preview" || environment.VERCEL_ENV === "production";
  const selectedBackend = backend ?? distributedBackend(environment);
  if (!selectedBackend && isVercelDeployment) return { status: "unavailable" };

  const effectiveBackend = selectedBackend ?? localBackend;
  const salt = environment.RATE_LIMIT_SALT?.trim() || "local-development-only";
  const key = anonymizedIdentifier(identifier, route, salt);
  const checks = [
    effectiveBackend.limit(key, `${route}:minute`, rule.minute, "60 s"),
  ];
  if (rule.day) {
    checks.push(
      effectiveBackend.limit(key, `${route}:day`, rule.day, "24 h"),
    );
  }
  const results = await Promise.all(checks);
  const blocked = results.find((result) => !result.success);
  const strictest = blocked ?? results.reduce((lowest, result) =>
    result.remaining < lowest.remaining ? result : lowest,
  );
  return {
    status: blocked ? "limited" : "allowed",
    limit: strictest.limit,
    remaining: strictest.remaining,
    reset: strictest.reset,
    retryAfterSeconds: Math.max(1, Math.ceil((strictest.reset - now()) / 1000)),
  };
}
