"use client";

import { useEffect, useState } from "react";

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

export function useProviderCapability(enabled = true): ProviderCapability {
  const [capability, setCapability] =
    useState<ProviderCapability>(enabled ? "checking" : "unavailable");

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const controller = new AbortController();

    async function checkHealth() {
      try {
        const response = await fetch("/api/health", {
          signal: controller.signal,
        });
        const payload: unknown = await response.json().catch(() => null);
        if (!controller.signal.aborted) {
          setCapability(providerCapabilityFromHealth(response.ok, payload));
        }
      } catch {
        if (!controller.signal.aborted) setCapability("unavailable");
      }
    }

    void checkHealth();
    return () => controller.abort();
  }, [enabled]);

  return capability;
}
