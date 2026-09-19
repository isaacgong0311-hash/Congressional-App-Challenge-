import { describe, expect, it } from "vitest";

import { roundRockEnrollmentProcedures } from "../../app/features/first-day/content/procedures/round-rock-isd";
import { detectConflicts, resolveConflict } from "../../app/features/first-day/domain/conflicts";
import { buildLiveTasks } from "../../app/features/first-day/domain/live-tasks";
import { planCase } from "../../app/features/first-day/domain/planner";
import type {
  DerivedTask,
  FirstDayCase,
  Procedure,
} from "../../app/features/first-day/domain/types";

function confirmedCase(): FirstDayCase {
  return {
    id: "case-live-plan",
    mode: "live",
    language: "English",
    district: "Round Rock ISD",
    childFirstName: "",
    ruleVersion: "first-day-extraction-v1",
    documents: [
      {
        id: "doc-registration",
        label: "Registration page",
        pageIndex: 1,
        status: "ready",
        extractedText: "Bring the child's certified birth certificate.",
        sourceVersion: "first-day-extraction-v1",
      },
    ],
    evidence: [
      {
        id: "evidence-birth-certificate",
        documentId: "doc-registration",
        quote: "Bring the child's certified birth certificate.",
        location: "Page 1",
      },
    ],
    facts: [
      {
        id: "fact-birth-certificate",
        kind: "requested_item",
        semanticKey: "registration.birth_certificate",
        label: "Certified birth certificate",
        originalValue: "Bring the child's certified birth certificate",
        evidenceIds: ["evidence-birth-certificate"],
        confirmationState: "confirmed",
      },
    ],
    procedures: structuredClone(roundRockEnrollmentProcedures),
    tasks: [],
    conflicts: [],
    events: [],
  };
}

function byId(tasks: DerivedTask[], id: string) {
  const task = tasks.find((item) => item.id === id);
  if (!task) throw new Error(`Missing task: ${id}`);
  return task;
}

function withOrientationConflict(caseData: FirstDayCase) {
  caseData.documents.push(
    {
      id: "doc-orientation-a",
      label: "Welcome letter",
      pageIndex: 2,
      status: "ready",
      extractedText: "Orientation starts in the cafeteria.",
      sourceVersion: "first-day-extraction-v1",
    },
    {
      id: "doc-orientation-b",
      label: "Follow-up",
      pageIndex: 3,
      status: "ready",
      extractedText: "Orientation starts at the gym entrance.",
      sourceVersion: "first-day-extraction-v1",
    },
  );
  caseData.evidence.push(
    {
      id: "evidence-orientation-a",
      documentId: "doc-orientation-a",
      quote: "Orientation starts in the cafeteria.",
      location: "Page 2",
    },
    {
      id: "evidence-orientation-b",
      documentId: "doc-orientation-b",
      quote: "Orientation starts at the gym entrance.",
      location: "Page 3",
    },
  );
  caseData.facts.push(
    {
      id: "fact-orientation-a",
      kind: "location",
      semanticKey: "orientation.location",
      label: "Orientation location",
      originalValue: "Cafeteria",
      evidenceIds: ["evidence-orientation-a"],
      confirmationState: "proposed",
    },
    {
      id: "fact-orientation-b",
      kind: "location",
      semanticKey: "orientation.location",
      label: "Orientation location",
      originalValue: "Gym entrance",
      evidenceIds: ["evidence-orientation-b"],
      confirmationState: "proposed",
    },
  );
  caseData.conflicts = detectConflicts(caseData);
}

describe("deterministic live task templates", () => {
  it("builds only the expected core task families", () => {
    const caseData = confirmedCase();

    expect(
      buildLiveTasks(caseData, caseData.procedures).map((task) => task.id),
    ).toEqual([
      "task-live-gather-documents",
      "task-live-open-enrollment",
      "task-live-review-plan",
    ]);
  });

  it("does not turn arbitrary informational notes into tasks", () => {
    const caseData = confirmedCase();
    caseData.facts.push({
      id: "fact-mascot",
      kind: "informational_note",
      semanticKey: "school.mascot",
      label: "School mascot",
      originalValue: "The mascot is a dragon",
      evidenceIds: ["evidence-birth-certificate"],
      confirmationState: "confirmed",
    });

    expect(
      buildLiveTasks(caseData, caseData.procedures).map((task) => task.id),
    ).toEqual([
      "task-live-gather-documents",
      "task-live-open-enrollment",
      "task-live-review-plan",
    ]);
  });

  it("sends a task with a pending supporting procedure to review", () => {
    const caseData = confirmedCase();
    const procedures: Procedure[] = caseData.procedures.map((procedure) =>
      procedure.id === "procedure-rrisd-enrollment-sequence"
        ? { ...procedure, reviewerStatus: "pending" }
        : procedure,
    );
    caseData.procedures = procedures;
    caseData.tasks = buildLiveTasks(caseData, procedures);

    const task = byId(planCase(caseData).tasks, "task-live-open-enrollment");
    expect(task.state).toBe("needs_review");
    expect(task.reason).toBe(
      "A supporting procedure needs review before this step can be relied on.",
    );
  });

  it("creates a clarification task for an open semantic conflict", () => {
    const caseData = confirmedCase();
    withOrientationConflict(caseData);
    caseData.tasks = buildLiveTasks(caseData, caseData.procedures);

    expect(
      byId(
        planCase(caseData).tasks,
        "task-live-clarify-orientation-location",
      ).state,
    ).toBe("needs_clarification");
  });

  it("keeps unrelated task state unchanged after a school report", () => {
    const caseData = confirmedCase();
    withOrientationConflict(caseData);
    caseData.tasks = buildLiveTasks(caseData, caseData.procedures);
    const before = planCase(caseData);

    const resolved = resolveConflict(caseData, {
      id: "event-school-orientation",
      type: "school_confirmation_recorded",
      conflictId: "conflict-orientation-location",
      selectedFactId: "fact-orientation-b",
      reportedValue: "Gym entrance",
      timestamp: "2026-09-19T12:00:00.000Z",
    });
    const after = planCase(resolved);

    expect(
      byId(after.tasks, "task-live-gather-documents").state,
    ).toBe(byId(before.tasks, "task-live-gather-documents").state);
    expect(
      byId(after.tasks, "task-live-clarify-orientation-location").state,
    ).toBe("ready");
  });
});
