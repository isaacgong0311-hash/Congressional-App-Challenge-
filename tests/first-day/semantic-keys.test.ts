import { describe, expect, it } from "vitest";

import {
  PREFERRED_SEMANTIC_KEYS,
  canonicalizeSemanticKey,
} from "../../app/features/first-day/domain/semantic-keys";

describe("semantic key canonicalization", () => {
  it("collapses equivalent event and field names", () => {
    expect(canonicalizeSemanticKey("enrollment.place")).toBe("registration.location");
    expect(canonicalizeSemanticKey("Orientation.Venue")).toBe("orientation.location");
    expect(canonicalizeSemanticKey("orientacion.lugar")).toBe("orientation.location");
    expect(canonicalizeSemanticKey("health_form.due_date")).toBe("health_forms.deadline");
  });

  it("leaves distinct fields alone", () => {
    expect(canonicalizeSemanticKey("registration.meeting_location")).toBe("registration.meeting_location");
    expect(canonicalizeSemanticKey("arrival.entrance")).toBe("arrival.entrance");
  });

  it("is stable for every preferred key", () => {
    for (const key of PREFERRED_SEMANTIC_KEYS) {
      expect(canonicalizeSemanticKey(key)).toBe(key);
    }
  });
});
