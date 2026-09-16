import { describe, expect, it } from "vitest";

import { providerErrorSummary } from "../../app/lib/provider-error";

describe("providerErrorSummary", () => {
  it("keeps only operational metadata", () => {
    const result = providerErrorSummary({
      requestId: "request-123",
      route: "/api/explain",
      kind: "schema",
      durationMs: 1200,
      issueCount: 3,
    });

    expect(result).toEqual({
      requestId: "request-123",
      route: "/api/explain",
      kind: "schema",
      durationMs: 1200,
      issueCount: 3,
    });
  });

  it("does not copy unexpected raw provider fields", () => {
    const result = providerErrorSummary({
      requestId: "request-456",
      route: "/api/explain",
      kind: "provider",
      durationMs: 800,
      rawText: "Maya Rivera enrollment letter",
    } as Parameters<typeof providerErrorSummary>[0] & { rawText: string });

    expect(JSON.stringify(result)).not.toContain("Maya Rivera");
    expect(result).not.toHaveProperty("rawText");
  });
});
