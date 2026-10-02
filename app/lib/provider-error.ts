export type ProviderErrorSummary = {
  requestId: string;
  route: string;
  kind: "schema" | "provider" | "timeout";
  durationMs: number;
  issueCount?: number;
  status?: number;
  providerStatus?: number;
};

export function providerErrorSummary({
  requestId,
  route,
  kind,
  durationMs,
  issueCount,
  status,
  providerStatus,
}: ProviderErrorSummary): ProviderErrorSummary {
  return {
    requestId,
    route,
    kind,
    durationMs,
    issueCount,
    status,
    providerStatus,
  };
}
