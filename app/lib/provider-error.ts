export type ProviderErrorSummary = {
  requestId: string;
  route: string;
  kind: "schema" | "provider" | "timeout";
  durationMs: number;
  issueCount?: number;
  status?: number;
  providerStatus?: number;
  issuePaths?: string[];
  issueCodes?: string[];
};

export function providerErrorSummary({
  requestId,
  route,
  kind,
  durationMs,
  issueCount,
  status,
  providerStatus,
  issuePaths,
  issueCodes,
}: ProviderErrorSummary): ProviderErrorSummary {
  return {
    requestId,
    route,
    kind,
    durationMs,
    issueCount,
    status,
    providerStatus,
    issuePaths,
    issueCodes,
  };
}
