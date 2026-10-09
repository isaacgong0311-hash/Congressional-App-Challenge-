"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ProviderCapability =
  | "checking"
  | "available"
  | "unavailable";

export function providerCapabilityFromHealth(
  responseOk: boolean,
  payload: unknown,
): Exclude<ProviderCapability, "checking"> {
  if (!responseOk || !payload || typeof payload !== "object") {
    return "unavailable";
  }
  if (
    !("capabilities" in payload) ||
    !payload.capabilities ||
    typeof payload.capabilities !== "object"
  ) {
    return "unavailable";
  }
  return "liveDocumentReading" in payload.capabilities &&
    payload.capabilities.liveDocumentReading === true
    ? "available"
    : "unavailable";
}

export function useProviderCapability(enabled = true) {
  const [capability, setCapability] =
    useState<ProviderCapability>(enabled ? "checking" : "unavailable");
  const activeRequest = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    activeRequest.current?.abort();
    const controller = new AbortController();
    activeRequest.current = controller;
    setCapability("checking");

    try {
      const response = await fetch("/api/health", {
        signal: controller.signal,
        cache: "no-store",
      });
      const payload: unknown = await response.json().catch(() => null);
      if (!controller.signal.aborted) {
        setCapability(providerCapabilityFromHealth(response.ok, payload));
      }
    } catch {
      if (!controller.signal.aborted) setCapability("unavailable");
    } finally {
      if (activeRequest.current === controller) activeRequest.current = null;
    }
  }, [enabled]);

  useEffect(() => {
    const timer = window.setTimeout(() => void refresh(), 0);
    return () => {
      window.clearTimeout(timer);
      activeRequest.current?.abort();
    };
  }, [refresh]);

  return { capability, refresh };
}
