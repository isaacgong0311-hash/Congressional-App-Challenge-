"use client";

import { useEffect, useState } from "react";

import {
  DEFAULT_LANTERN_PREFERENCES,
  LANTERN_PREFERENCES_KEY,
  parseLanternPreferences,
  type LanternPreferences,
} from "./preferences";

export function useLanternPreferences() {
  const [preferences, setPreferences] = useState<LanternPreferences>(
    DEFAULT_LANTERN_PREFERENCES,
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stored = DEFAULT_LANTERN_PREFERENCES;
    try {
      stored = parseLanternPreferences(
        window.localStorage.getItem(LANTERN_PREFERENCES_KEY),
      );
    } catch {
      // Private browsing and embedded browsers can deny storage access.
    }
    const timer = window.setTimeout(() => {
      setPreferences(stored);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(
        LANTERN_PREFERENCES_KEY,
        JSON.stringify(preferences),
      );
    } catch {
      // Keep the controls usable for this visit when storage is unavailable.
    }
  }, [preferences, ready]);

  return { preferences, ready, setPreferences };
}
