import { APICallError } from "ai";
import { describe, expect, it } from "vitest";

import {
  classifyProviderFailure,
  providerDiagnostic,
} from "../../app/lib/provider-diagnostics";

function apiError(statusCode: number, responseHeaders?: Record<string, string>) {
  return new APICallError({
    message: "private provider detail",
    url: "https://api.groq.com/test",
    requestBodyValues: {},
    statusCode,
    responseHeaders,
    responseBody: "private provider response",
    isRetryable: statusCode >= 429,
  });
}

describe("provider diagnostics", () => {
  it("classifies throttling and retains a numeric retry delay", () => {
    expect(
      classifyProviderFailure(apiError(429, { "retry-after": "7" })),
    ).toEqual({ kind: "throttled", status: 429, retryAfterSeconds: 7 });
  });

  it("classifies unavailable models and provider capacity", () => {
    expect(classifyProviderFailure(apiError(404))).toEqual({
      kind: "unavailable",
      status: 503,
    });
    expect(classifyProviderFailure(apiError(503))).toEqual({
      kind: "capacity",
      status: 503,
    });
  });

  it("creates content-free structured diagnostics", () => {
    expect(
      providerDiagnostic({
        requestId: "request-1",
        route: "/api/first-day/extract",
        modelRole: "vision",
        outcome: "success",
        durationMs: 125,
        inputTokens: 10,
        outputTokens: 4,
      }),
    ).toEqual({
      requestId: "request-1",
      route: "/api/first-day/extract",
      modelRole: "vision",
      outcome: "success",
      durationMs: 125,
      inputTokens: 10,
      outputTokens: 4,
    });
  });
});
