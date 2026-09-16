import { validateEvidence } from "../domain/evidence";
import type {
  Evidence,
  Fact,
  FirstDayCase,
  FirstDayDocument,
  FirstDayExtractionResponse,
} from "../domain/types";

export type AdaptedLiveExtraction = {
  document: FirstDayDocument;
  evidence: Evidence[];
  facts: Fact[];
};

export function adaptLiveExtraction(
  response: FirstDayExtractionResponse,
  pageIndex: number,
): AdaptedLiveExtraction {
  const clientKeys = new Set<string>();
  const document: FirstDayDocument = {
    id: response.documentId,
    label: response.document.label,
    pageIndex,
    status: "ready",
    extractedText: response.document.originalText,
    sourceVersion: response.schemaVersion,
    confidence: response.document.confidence,
    ...(response.document.photoQualityNote
      ? { photoQualityNote: response.document.photoQualityNote }
      : {}),
  };

  const evidence: Evidence[] = [];
  const facts: Fact[] = [];

  for (const proposal of response.facts) {
    if (clientKeys.has(proposal.clientKey)) {
      throw new Error("duplicate_client_key");
    }
    clientKeys.add(proposal.clientKey);

    const evidenceId = `evidence-${response.documentId}-${proposal.clientKey}`;
    evidence.push({
      id: evidenceId,
      documentId: response.documentId,
      quote: proposal.quote,
      location: proposal.location,
    });
    facts.push({
      id: `fact-${response.documentId}-${proposal.clientKey}`,
      kind: proposal.kind,
      semanticKey: proposal.semanticKey,
      label: proposal.label,
      originalValue: proposal.originalValue,
      ...(proposal.normalizedValue
        ? { normalizedValue: proposal.normalizedValue }
        : {}),
      confidence: proposal.confidence,
      evidenceIds: [evidenceId],
      confirmationState: "proposed",
    });
  }

  const validationCase: FirstDayCase = {
    id: `validation-${response.requestId}`,
    mode: "live",
    language: "English",
    district: "",
    childFirstName: "",
    ruleVersion: response.schemaVersion,
    documents: [document],
    evidence,
    facts,
    procedures: [],
    tasks: [],
    conflicts: [],
    events: [],
  };
  const issue = validateEvidence(validationCase)[0];
  if (issue) throw new Error(issue.code);

  return { document, evidence, facts };
}
