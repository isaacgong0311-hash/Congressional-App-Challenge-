import { describe, expect, it } from "vitest";

import {
  DEFAULT_LANTERN_PREFERENCES,
  parseLanternPreferences,
} from "../../app/components/lantern/preferences";

describe("Lantern preferences", () => {
  it("accepts only harmless UI preferences", () => {
    expect(
      parseLanternPreferences(
        JSON.stringify({
          preferredLanguage: "es",
          largeText: true,
          highContrast: false,
          extractedText: "must not survive",
        }),
      ),
    ).toEqual({
      preferredLanguage: "es",
      largeText: true,
      highContrast: false,
    });
  });

  it("falls back safely for invalid storage", () => {
    expect(parseLanternPreferences("not-json")).toEqual(
      DEFAULT_LANTERN_PREFERENCES,
    );
    expect(parseLanternPreferences(JSON.stringify({ largeText: "yes" }))).toEqual(
      DEFAULT_LANTERN_PREFERENCES,
    );
  });
});
