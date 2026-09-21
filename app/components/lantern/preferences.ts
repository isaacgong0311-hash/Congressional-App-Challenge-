export type LanternPreferences = {
  preferredLanguage: string;
  largeText: boolean;
  highContrast: boolean;
};

export const LANTERN_PREFERENCES_KEY = "lantern.preferences.v1";

export const DEFAULT_LANTERN_PREFERENCES: LanternPreferences = {
  preferredLanguage: "en",
  largeText: false,
  highContrast: false,
};

export function parseLanternPreferences(value: string | null): LanternPreferences {
  if (!value) return DEFAULT_LANTERN_PREFERENCES;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") {
      return DEFAULT_LANTERN_PREFERENCES;
    }
    const candidate = parsed as Record<string, unknown>;
    if (
      typeof candidate.preferredLanguage !== "string" ||
      typeof candidate.largeText !== "boolean" ||
      typeof candidate.highContrast !== "boolean"
    ) {
      return DEFAULT_LANTERN_PREFERENCES;
    }
    return {
      preferredLanguage: candidate.preferredLanguage,
      largeText: candidate.largeText,
      highContrast: candidate.highContrast,
    };
  } catch {
    return DEFAULT_LANTERN_PREFERENCES;
  }
}
