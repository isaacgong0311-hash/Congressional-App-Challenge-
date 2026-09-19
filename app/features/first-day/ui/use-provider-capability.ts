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
  if (!("keys" in payload) || !payload.keys || typeof payload.keys !== "object") {
    return "unavailable";
  }
  return "groq" in payload.keys && payload.keys.groq === true
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
