import { quoteAppearsInSource } from "../domain/evidence";
import type { FirstDayExtractionResponse } from "../domain/types";

export type PageProposalIssue = "duplicate_client_key" | "quote_not_found";

export function validatePageProposals(
  page: FirstDayExtractionResponse,
): PageProposalIssue[] {
  const issues: PageProposalIssue[] = [];
  const clientKeys = new Set<string>();

  for (const fact of page.facts) {
    if (clientKeys.has(fact.clientKey)) issues.push("duplicate_client_key");
    clientKeys.add(fact.clientKey);
    if (!quoteAppearsInSource(page.document.originalText, fact.quote)) {
      issues.push("quote_not_found");
    }
  }

  return issues;
}
