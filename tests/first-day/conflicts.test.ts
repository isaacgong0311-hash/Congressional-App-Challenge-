import { describe, expect, it } from "vitest";

import {
  detectConflicts,
  resolveConflict,
} from "../../app/features/first-day/domain/conflicts";
import { planCase } from "../../app/features/first-day/domain/planner";
import type {
  Fact,
  FirstDayCase,
  SchoolConfirmationEvent,
} from "../../app/features/first-day/domain/types";

function fact(
  id: string,
  semanticKey: string,
  originalValue: string,
  normalizedValue?: string,
): Fact {
  return {
    id,
    kind: semanticKey.endsWith("date") ? "date" : "location",
    semanticKey,
    label: semanticKey.endsWith("date") ? "Date" : "Location",
    originalValue,
    ...(normalizedValue ? { normalizedValue } : {}),
    evidenceIds: [`evidence-${id}`],
    confirmationState: "proposed",
  };
}

function caseWithFacts(facts: Fact[]): FirstDayCase {
  return {
    id: "case-conflicts",
    mode: "live",
    language: "English",
    district: "Test district",
    childFirstName: "",
    ruleVersion: "first-day-extraction-v1",
    documents: facts.map((item, index) => ({
      id: `doc-${item.id}`,
      label: `Page ${index + 1}`,
      pageIndex: index + 1,
      status: "ready",
      extractedText: item.originalValue,
      sourceVersion: "first-day-extraction-v1",
    })),
    evidence: facts.map((item) => ({
      id: `evidence-${item.id}`,
      documentId: `doc-${item.id}`,
      quote: item.originalValue,
      location: "Page 1",
    })),
    facts,
    procedures: [],
    tasks: [],
    conflicts: [],
    events: [],
  };
}

describe("deterministic cross-document conflicts", () => {
  it("detects different values sharing one semantic key", () => {
    const caseData = caseWithFacts([
      fact("fact-a", "orientation.location", "Cafeteria"),
      fact("fact-b", "orientation.location", "Gym entrance"),
    ]);

    expect(detectConflicts(caseData)).toEqual([
      expect.objectContaining({
        id: "conflict-orientation-location",
        semanticKey: "orientation.location",
        factIds: ["fact-a", "fact-b"],
        status: "open",
      }),
    ]);
  });

  it("does not compare unrelated dates", () => {
    const caseData = caseWithFacts([
      fact("fact-registration", "registration.date", "August 14"),
      fact("fact-letter", "letter.date", "August 10"),
    ]);

    expect(detectConflicts(caseData)).toEqual([]);
  });

  it("does not conflict when normalized values match", () => {
    const caseData = caseWithFacts([
      fact(
        "fact-a",
        "registration.date",
        "August 14, 2026",
        "2026-08-14",
      ),
      fact("fact-b", "registration.date", "8/14/26", "2026-08-14"),
    ]);

    expect(detectConflicts(caseData)).toEqual([]);
  });

  it("ignores a fact whose source was removed", () => {
    const caseData = caseWithFacts([
      fact("fact-a", "orientation.location", "Cafeteria"),
      fact("fact-b", "orientation.location", "Gym entrance"),
    ]);
    caseData.events.push({
      id: "event-remove-b",
      type: "source_removed",
      documentId: "doc-fact-b",
      timestamp: "2026-09-19T12:00:00.000Z",
    });

    expect(detectConflicts(caseData)).toEqual([]);
  });

  it("preserves an existing resolution during recomputation", () => {
    const caseData = caseWithFacts([
      fact("fact-a", "orientation.location", "Cafeteria"),
      fact("fact-b", "orientation.location", "Gym entrance"),
    ]);
    caseData.conflicts = [
      {
        id: "conflict-orientation-location",
        semanticKey: "orientation.location",
        label: "Location",
        factIds: ["fact-a", "fact-b"],
        relatedTaskIds: [],
        status: "resolved",
        resolutionEventId: "event-school-report",
      },
    ];

    expect(detectConflicts(caseData)[0]).toEqual(
      expect.objectContaining({
        status: "resolved",
        resolutionEventId: "event-school-report",
      }),
    );
  });

  it("records a school report without rewriting facts or evidence", () => {
    const caseData = caseWithFacts([
      fact("fact-a", "orientation.location", "Cafeteria"),
      fact("fact-b", "orientation.location", "Gym entrance"),
    ]);
    caseData.conflicts = detectConflicts(caseData);
    const originalFacts = structuredClone(caseData.facts);
    const originalEvidence = structuredClone(caseData.evidence);
    const schoolReportEvent: SchoolConfirmationEvent = {
      id: "event-school-report",
      type: "school_confirmation_recorded",
      conflictId: "conflict-orientation-location",
      selectedFactId: "fact-b",
      reportedValue: "Gym entrance",
      timestamp: "2026-09-19T12:00:00.000Z",
    };

    const resolved = resolveConflict(caseData, schoolReportEvent);

    expect(resolved.events.at(-1)?.type).toBe(
      "school_confirmation_recorded",
    );
    expect(resolved.conflicts[0]).toEqual(
      expect.objectContaining({
        status: "resolved",
        resolutionEventId: "event-school-report",
      }),
    );
    expect(resolved.facts).toEqual(originalFacts);
    expect(resolved.evidence).toEqual(originalEvidence);
  });

  it("makes the selected fact ready and its competitor superseded in planning", () => {
    const caseData = caseWithFacts([
      fact("fact-a", "orientation.location", "Cafeteria"),
      fact("fact-b", "orientation.location", "Gym entrance"),
    ]);
    caseData.conflicts = detectConflicts(caseData);
    caseData.tasks = [
      {
        id: "task-a",
        title: "Use cafeteria",
        action: "Go to the cafeteria.",
        detail: "",
        evidenceIds: ["evidence-fact-a"],
        procedureIds: [],
        dependency: { type: "fact", factId: "fact-a" },
      },
      {
        id: "task-b",
        title: "Use gym entrance",
        action: "Go to the gym entrance.",
        detail: "",
        evidenceIds: ["evidence-fact-b"],
        procedureIds: [],
        dependency: { type: "fact", factId: "fact-b" },
      },
    ];

    const resolved = resolveConflict(caseData, {
      id: "event-school-report",
      type: "school_confirmation_recorded",
      conflictId: "conflict-orientation-location",
      selectedFactId: "fact-b",
      reportedValue: "Gym entrance",
      timestamp: "2026-09-19T12:00:00.000Z",
    });
    const plan = planCase(resolved);

    expect(plan.tasks.find((task) => task.id === "task-b")?.state).toBe(
      "ready",
    );
    expect(plan.tasks.find((task) => task.id === "task-a")?.state).toBe(
      "waiting",
    );
  });
});
