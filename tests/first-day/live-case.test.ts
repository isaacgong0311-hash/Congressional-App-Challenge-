import { describe, expect, it } from "vitest";

import { canEnterLiveStep } from "../../app/features/first-day/ui/use-live-case";
import type { FirstDayCase } from "../../app/features/first-day/domain/types";

function liveCase(): FirstDayCase {
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

function addProposedFact(caseData: FirstDayCase) {
  caseData.documents.push({
    id: "doc-1",
    label: "Enrollment letter",
    pageIndex: 1,
    status: "ready",
    extractedText: "Registration is August 14, 2026.",
    sourceVersion: "first-day-extraction-v1",
  });
  caseData.evidence.push({
    id: "evidence-doc-1-date",
    documentId: "doc-1",
    quote: "Registration is August 14, 2026.",
    location: "Page 1",
  });
  caseData.facts.push({
    id: "fact-doc-1-date",
    kind: "date",
    semanticKey: "registration.date",
    label: "Registration date",
    originalValue: "August 14, 2026",
    evidenceIds: ["evidence-doc-1-date"],
    confirmationState: "proposed",
  });
}

describe("live case navigation", () => {
  it("keeps a new case on Start or Documents", () => {
    const caseData = liveCase();

    expect(canEnterLiveStep(caseData, "start")).toBe(true);
    expect(canEnterLiveStep(caseData, "documents")).toBe(true);
    expect(canEnterLiveStep(caseData, "facts")).toBe(false);
    expect(canEnterLiveStep(caseData, "plan")).toBe(false);
  });

  it("opens Facts after a validated proposal exists", () => {
    const caseData = liveCase();
    addProposedFact(caseData);

    expect(canEnterLiveStep(caseData, "facts")).toBe(true);
    expect(canEnterLiveStep(caseData, "plan")).toBe(false);
  });

  it("opens planning after a confirmation event without mutating the fact", () => {
    const caseData = liveCase();
    addProposedFact(caseData);
    caseData.events.push({
      id: "event-confirm-date",
      type: "fact_confirmed",
      factId: "fact-doc-1-date",
      timestamp: "2026-09-16T12:00:00.000Z",
    });

    expect(caseData.facts[0]?.confirmationState).toBe("proposed");
    expect(canEnterLiveStep(caseData, "plan")).toBe(true);
    expect(canEnterLiveStep(caseData, "export")).toBe(true);
  });

  it("does not let a failed page erase progress from a successful page", () => {
    const caseData = liveCase();
    addProposedFact(caseData);
    caseData.documents.push({
      id: "doc-failed",
      label: "Blurry page",
      pageIndex: 2,
      status: "error",
      extractedText: "",
      sourceVersion: "waiting-for-extraction",
    });

    expect(canEnterLiveStep(caseData, "facts")).toBe(true);
  });

  it("does not let a removed source unlock review or planning", () => {
    const caseData = liveCase();
    addProposedFact(caseData);
    caseData.events.push(
      {
        id: "event-confirm-date",
        type: "fact_confirmed",
        factId: "fact-doc-1-date",
        timestamp: "2026-09-16T12:00:00.000Z",
      },
      {
        id: "event-remove-doc",
        type: "source_removed",
        documentId: "doc-1",
        timestamp: "2026-09-16T12:01:00.000Z",
      },
    );
    caseData.documents[0].status = "removed";

    expect(canEnterLiveStep(caseData, "facts")).toBe(false);
    expect(canEnterLiveStep(caseData, "plan")).toBe(false);
  });
});
