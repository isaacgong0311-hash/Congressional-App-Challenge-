import { quoteAppearsInSource } from "../domain/evidence";
import type { FirstDayExtractionResponse } from "../domain/types";
import { valueSupportedByQuote } from "../domain/value-normalization";

export type PageProposalIssue =
  | "duplicate_client_key"
  | "quote_not_found"
  | "value_not_in_quote";

export type DroppedProposal = {
  clientKey: string;
  issue: PageProposalIssue;
};

function proposalIssue(
  page: FirstDayExtractionResponse,
  fact: FirstDayExtractionResponse["facts"][number],
  seenKeys: Set<string>,
): PageProposalIssue | null {
  if (seenKeys.has(fact.clientKey)) return "duplicate_client_key";
  if (!quoteAppearsInSource(page.document.originalText, fact.quote)) {
    return "quote_not_found";
  }
  // A real quote is not enough: the proposed value must be what it says.
  if (!valueSupportedByQuote(fact.originalValue, fact.quote)) {
    return "value_not_in_quote";
  }
  return null;
}

export function validatePageProposals(
  page: FirstDayExtractionResponse,
): PageProposalIssue[] {
  const issues: PageProposalIssue[] = [];
  const seenKeys = new Set<string>();

  for (const fact of page.facts) {
    const issue = proposalIssue(page, fact, seenKeys);
    if (issue) issues.push(issue);
    seenKeys.add(fact.clientKey);
  }

  return issues;
}

// Keeps every proposal that passes and reports the rest, so one unsupported
// fact does not discard a page of otherwise verified facts.
export function filterPageProposals(page: FirstDayExtractionResponse): {
  page: FirstDayExtractionResponse;
  dropped: DroppedProposal[];
} {
  const seenKeys = new Set<string>();
  const kept: FirstDayExtractionResponse["facts"] = [];
  const dropped: DroppedProposal[] = [];

  for (const fact of page.facts) {
    const issue = proposalIssue(page, fact, seenKeys);
    if (issue) {
      dropped.push({ clientKey: fact.clientKey, issue });
    } else {
      kept.push(fact);
      seenKeys.add(fact.clientKey);
    }
  }

  return { page: { ...page, facts: kept }, dropped };
}
