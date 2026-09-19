import { describe, expect, it } from "vitest";

import { providerCapabilityFromHealth } from "../../app/features/first-day/ui/use-provider-capability";

describe("providerCapabilityFromHealth", () => {
  it("accepts an explicitly healthy Groq capability", () => {
    expect(
      providerCapabilityFromHealth(true, {
        status: "ok",
        keys: { groq: true },
      }),
    ).toBe("available");
  });

  it("treats degraded, malformed, and rejected responses as unavailable", () => {
    expect(
      providerCapabilityFromHealth(false, {
        status: "degraded",
        keys: { groq: false },
      }),
    ).toBe("unavailable");
    expect(providerCapabilityFromHealth(true, { status: "ok" })).toBe(
      "unavailable",
    );
    expect(providerCapabilityFromHealth(true, null)).toBe("unavailable");
  });
});
