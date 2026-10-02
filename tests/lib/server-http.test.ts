import { describe, expect, it } from "vitest";
import { z } from "zod";

import { publicApiError } from "../../app/lib/api-error";
import { apiError, readBoundedJson, requestIdFrom } from "../../app/lib/server/http";
import { isTrustedMutationRequest } from "../../app/lib/server/origin";

describe("server HTTP boundary", () => {
  it("accepts only a bounded safe request id", () => {
    expect(requestIdFrom(new Headers({ "x-request-id": "case-17" }))).toBe(
      "case-17",
    );
    expect(
      requestIdFrom(new Headers({ "x-request-id": "../private" })),
    ).toMatch(/^[a-f0-9-]{36}$/);
  });

  it("returns a stable no-store error envelope", async () => {
    const response = apiError({
      code: "PROVIDER_UNAVAILABLE",
      message: "Live reading is temporarily unavailable.",
      requestId: "request-1",
      retryable: true,
      status: 503,
    });

    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      error: {
        code: "PROVIDER_UNAVAILABLE",
        message: "Live reading is temporarily unavailable.",
        requestId: "request-1",
        retryable: true,
      },
    });
  });

  it("rejects malformed, oversized, and schema-invalid JSON", async () => {
    const schema = z.object({ text: z.string().max(8) }).strict();

    await expect(
      readBoundedJson(
        new Request("http://lantern.test/api", {
          method: "POST",
          body: "not-json",
        }),
        schema,
        32,
      ),
    ).resolves.toEqual({ ok: false, reason: "invalid_json" });

    await expect(
      readBoundedJson(
        new Request("http://lantern.test/api", {
          method: "POST",
          body: JSON.stringify({ text: "123456789" }),
        }),
        schema,
        32,
      ),
    ).resolves.toEqual({ ok: false, reason: "invalid_body" });

    await expect(
      readBoundedJson(
        new Request("http://lantern.test/api", {
          method: "POST",
          body: JSON.stringify({ text: "safe", padding: "x".repeat(50) }),
        }),
        schema,
        32,
      ),
    ).resolves.toEqual({ ok: false, reason: "payload_too_large" });
  });

  it("rejects a mismatched production browser origin", () => {
    const request = new Request("https://lantern.test/api/ask", {
      method: "POST",
      headers: {
        origin: "https://attacker.test",
        host: "lantern.test",
      },
    });

    expect(isTrustedMutationRequest(request, true)).toBe(false);
    expect(isTrustedMutationRequest(request, false)).toBe(true);
  });

  it("parses the new envelope and a temporary legacy error", () => {
    expect(
      publicApiError(
        {
          error: {
            code: "PROVIDER_TIMEOUT",
            message: "Try again.",
            requestId: "r1",
            retryable: true,
          },
        },
        "Fallback",
      ),
    ).toEqual({
      code: "PROVIDER_TIMEOUT",
      message: "Try again.",
      requestId: "r1",
      retryable: true,
    });
    expect(
      publicApiError({ error: "Legacy message" }, "Fallback").message,
    ).toBe("Legacy message");
  });
});
