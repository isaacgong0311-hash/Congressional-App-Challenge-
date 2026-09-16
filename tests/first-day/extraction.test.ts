import { describe, expect, it } from "vitest";

import type { AdaptedExtraction } from "../../app/features/first-day/domain/extraction";
import { mergeExtraction } from "../../app/features/first-day/domain/extraction";
import type { FirstDayCase } from "../../app/features/first-day/domain/types";

function emptyLiveCase(): FirstDayCase {
  return {
    id: "case-live",
    mode: "live",
    language: "English",
    district: "Test district",
    childFirstName: "",
    ruleVersion: "first-day-extraction-v1",
    documents: [],
    evidence: [],
    facts: [],
    procedures: [],
    tasks: [],
    conflicts: [],
    events: [],
  };
}

function extraction(documentId = "doc-1"): AdaptedExtraction {
  return {
    document: {
      id: documentId,
      label: "Enrollment letter",
      pageIndex: 1,
      status: "ready",
      extractedText: "Bring the enrollment letter on August 14, 2026.",
      sourceVersion: "first-day-extraction-v1",
    },
    evidence: [
      {
        id: `evidence-${documentId}-date`,
        documentId,
        quote: "August 14, 2026",
        location: "Page 1",
      },
    ],
    facts: [
      {
        id: `fact-${documentId}-date`,
        kind: "date",
        semanticKey: "registration.date",
        label: "Registration date",
        originalValue: "August 14, 2026",
        normalizedValue: "2026-08-14",
        evidenceIds: [`evidence-${documentId}-date`],
        confirmationState: "proposed",
      },
    ],
  };
}

describe("mergeExtraction", () => {
  it("adds a validated extraction once", () => {
    const result = mergeExtraction(emptyLiveCase(), extraction());

    expect(result.documents).toHaveLength(1);
    expect(result.evidence).toHaveLength(1);
    expect(result.facts[0]?.confirmationState).toBe("proposed");
  });

  it("is idempotent for a duplicate successful response", () => {
    const first = mergeExtraction(emptyLiveCase(), extraction());
    const second = mergeExtraction(first, extraction());

    expect(second.documents).toHaveLength(1);
    expect(second.evidence).toHaveLength(1);
    expect(second.facts).toHaveLength(1);
  });

  it("replaces stale records from a retried page", () => {
    const first = mergeExtraction(emptyLiveCase(), extraction());
    const replacement = extraction();
    replacement.document.label = "Updated enrollment letter";
    replacement.evidence = [];
    replacement.facts = [];

    const result = mergeExtraction(first, replacement);

    expect(result.documents[0]?.label).toBe("Updated enrollment letter");
    expect(result.evidence).toEqual([]);
    expect(result.facts).toEqual([]);
  });

  it("preserves the queued page index when replacing a page", () => {
    const queued = emptyLiveCase();
    queued.documents.push({
      ...extraction().document,
      pageIndex: 4,
      status: "processing",
    });

    expect(mergeExtraction(queued, extraction()).documents[0]?.pageIndex).toBe(
      4,
    );
  });

  it("rejects a response for a removed document", () => {
    const removed = emptyLiveCase();
    removed.documents.push({
      ...extraction().document,
      status: "removed",
    });

    expect(() => mergeExtraction(removed, extraction())).toThrow(
      "document_removed",
    );
  });

  it("keeps records from other pages", () => {
    const first = mergeExtraction(emptyLiveCase(), extraction("doc-1"));
    const second = mergeExtraction(first, extraction("doc-2"));

    expect(second.documents.map((document) => document.id)).toEqual([
      "doc-1",
      "doc-2",
    ]);
    expect(second.facts).toHaveLength(2);
  });
});
