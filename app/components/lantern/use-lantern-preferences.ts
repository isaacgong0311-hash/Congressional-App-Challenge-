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
    const stored = parseLanternPreferences(
      window.localStorage.getItem(LANTERN_PREFERENCES_KEY),
    );
    const timer = window.setTimeout(() => {
      setPreferences(stored);
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(
      LANTERN_PREFERENCES_KEY,
      JSON.stringify(preferences),
    );
  }, [preferences, ready]);

  return { preferences, ready, setPreferences };
}
