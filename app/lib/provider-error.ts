export type ProviderErrorSummary = {
  requestId: string;
  route: string;
  kind: "schema" | "provider" | "timeout";
  durationMs: number;
  issueCount?: number;
};

export function providerErrorSummary({
  requestId,
  route,
  kind,
  durationMs,
  issueCount,
}: ProviderErrorSummary): ProviderErrorSummary {
  return { requestId, route, kind, durationMs, issueCount };
}
