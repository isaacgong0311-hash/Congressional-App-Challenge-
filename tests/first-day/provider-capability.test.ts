import { describe, expect, it } from "vitest";

import { providerCapabilityFromHealth } from "../../app/features/first-day/ui/use-provider-capability";

describe("providerCapabilityFromHealth", () => {
  it("accepts an explicitly available live-reading capability", () => {
    expect(
      providerCapabilityFromHealth(true, {
        status: "ok",
        capabilities: { liveDocumentReading: true },
      }),
    ).toBe("available");
  });

  it("treats unavailable, malformed, and rejected responses as unavailable", () => {
    expect(
      providerCapabilityFromHealth(false, {
        status: "ok",
        capabilities: { liveDocumentReading: false },
      }),
    ).toBe("unavailable");
    expect(
      providerCapabilityFromHealth(true, {
        status: "ok",
        capabilities: { liveDocumentReading: false },
      }),
    ).toBe("unavailable");
    expect(providerCapabilityFromHealth(true, { status: "ok" })).toBe(
      "unavailable",
    );
    expect(providerCapabilityFromHealth(true, null)).toBe("unavailable");
  });
});
