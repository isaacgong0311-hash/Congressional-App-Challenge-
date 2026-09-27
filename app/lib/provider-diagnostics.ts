import { APICallError, type LanguageModelUsage } from "ai";

import type { AiModelRole } from "./ai-config";

export type ProviderRole = AiModelRole | "speech" | "localHelp";

export type ProviderFailureKind =
  | "unavailable"
  | "throttled"
  | "capacity"
  | "timeout"
  | "malformed_output"
  | "provider";

export type ProviderFailure = {
  kind: ProviderFailureKind;
  status: number;
  retryAfterSeconds?: number;
};

function retryAfterSeconds(headers: Record<string, string> | undefined) {
  const value = headers?.["retry-after"];
  if (!value) return undefined;
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds >= 0 ? Math.ceil(seconds) : undefined;
}

export function classifyProviderFailure(
  error: unknown,
  options: { timedOut?: boolean } = {},
): ProviderFailure {
  if (options.timedOut) return { kind: "timeout", status: 504 };

  if (APICallError.isInstance(error)) {
    const statusCode = error.statusCode;
    if (statusCode === 429) {
      return {
        kind: "throttled",
        status: 429,
        retryAfterSeconds: retryAfterSeconds(error.responseHeaders),
      };
    }
    if (statusCode === 408 || statusCode === 504) {
      return { kind: "timeout", status: 504 };
    }
    if (statusCode === 498 || statusCode === 503) {
      return { kind: "capacity", status: 503 };
    }
    if (
      statusCode === 400 ||
      statusCode === 401 ||
      statusCode === 403 ||
      statusCode === 404
    ) {
      return { kind: "unavailable", status: 503 };
    }
  }

  return { kind: "provider", status: 502 };
}

export type ProviderDiagnostic = {
  requestId: string;
  route: string;
  modelRole: ProviderRole;
  outcome: "success" | ProviderFailureKind;
  durationMs: number;
  inputTokens?: number;
  outputTokens?: number;
  issueCount?: number;
};

export function providerDiagnostic(input: ProviderDiagnostic) {
  return input;
}

export function usageDiagnostic(usage: LanguageModelUsage) {
  return {
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
  };
}

export function providerFailureMessage(failure: ProviderFailure) {
  switch (failure.kind) {
    case "throttled":
      return "The document service is busy. Wait a moment and try again.";
    case "capacity":
      return "The document service has no capacity right now. Try again shortly.";
    case "timeout":
      return "Reading this page took too long. Try again.";
    case "unavailable":
      return "Live document reading is temporarily unavailable.";
    default:
      return "Could not read this page. Try a clearer, well-lit photo.";
  }
}
