import type {
  Evidence,
  Fact,
  FirstDayCase,
  FirstDayDocument,
} from "./types";

export type AdaptedExtraction = {
  document: FirstDayDocument;
  evidence: Evidence[];
  facts: Fact[];
};

export function mergeExtraction(
  caseData: FirstDayCase,
  extraction: AdaptedExtraction,
): FirstDayCase {
  const documentId = extraction.document.id;
  const existing = caseData.documents.find((item) => item.id === documentId);
  const wasRemoved = caseData.events.some(
    (event) =>
      event.type === "source_removed" && event.documentId === documentId,
  );
  if (existing?.status === "removed" || wasRemoved) {
    throw new Error("document_removed");
  }

  const oldEvidenceIds = new Set(
    caseData.evidence
      .filter((item) => item.documentId === documentId)
      .map((item) => item.id),
  );
  const incomingEvidenceIds = new Set(
    extraction.evidence.map((item) => item.id),
  );
  const incomingFactIds = new Set(extraction.facts.map((item) => item.id));

  const document = {
    ...extraction.document,
    pageIndex: existing?.pageIndex ?? extraction.document.pageIndex,
  };
  const documents = [
    ...caseData.documents.filter((item) => item.id !== documentId),
    document,
  ].sort(
    (left, right) =>
      left.pageIndex - right.pageIndex || left.id.localeCompare(right.id),
  );

  return {
    ...caseData,
    documents,
    evidence: [
      ...caseData.evidence.filter(
        (item) =>
          item.documentId !== documentId && !incomingEvidenceIds.has(item.id),
      ),
      ...extraction.evidence,
    ],
    facts: [
      ...caseData.facts.filter(
        (fact) =>
          !incomingFactIds.has(fact.id) &&
          !fact.evidenceIds.some((evidenceId) =>
            oldEvidenceIds.has(evidenceId),
          ),
      ),
      ...extraction.facts,
    ],
  };
}
