"use client";

import { useEffect, useState } from "react";

export type ProviderCapability =
  | "checking"
  | "available"
  | "unavailable";

export function providerCapabilityFromHealth(
  _responseOk: boolean,
  payload: unknown,
): Exclude<ProviderCapability, "checking"> {
  if (!payload || typeof payload !== "object") {
    return "unavailable";
  }
  if (
    !("capabilities" in payload) ||
    !payload.capabilities ||
    typeof payload.capabilities !== "object"
  ) {
    return "unavailable";
  }
  return "vision" in payload.capabilities && payload.capabilities.vision === true
    ? "available"
    : "unavailable";
}

export function useProviderCapability(): ProviderCapability {
  const [capability, setCapability] =
    useState<ProviderCapability>("checking");

  useEffect(() => {
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
  }, []);

  return capability;
}
