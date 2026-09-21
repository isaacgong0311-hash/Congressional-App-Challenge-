import { describe, expect, it } from "vitest";

import { fictionalCase } from "../../app/features/first-day/content/fictional-case";
import {
  appendTaskCompletion,
  appendTaskCompletionReversal,
} from "../../app/features/first-day/domain/events";
import { createPortablePlan } from "../../app/features/first-day/export/plan-document";
import { planCase } from "../../app/features/first-day/domain/planner";

describe("portable First Day plan", () => {
  it("keeps completion and reversal history while exporting the effective task state", () => {
    const completed = appendTaskCompletion(fictionalCase, {
      id: "event-task-done",
      taskId: "task-registration",
      timestamp: "2026-09-20T12:00:00.000Z",
    });
    const reversed = appendTaskCompletionReversal(completed, {
      id: "event-task-undone",
      taskId: "task-registration",
      completionEventId: "event-task-done",
      timestamp: "2026-09-20T12:01:00.000Z",
    });
    const portable = createPortablePlan(
      reversed,
      planCase(reversed),
      "2026-09-20T12:02:00.000Z",
    );

    expect(portable.events.map((event) => event.type)).toEqual([
      "task_completed",
      "task_completion_reverted",
    ]);
    expect(
      portable.tasks.find((task) => task.id === "task-registration")?.state,
    ).toBe("ready");
  });
  it("keeps task, fact, conflict, and procedure provenance", () => {
    const portable = createPortablePlan(
      fictionalCase,
      planCase(fictionalCase),
      "2026-09-19T12:00:00.000Z",
    );

    expect(portable.schemaVersion).toBe("lantern-plan-v1");
    expect(portable.generatedAt).toBe("2026-09-19T12:00:00.000Z");
    expect(portable.tasks[0]).toEqual(
      expect.objectContaining({
        id: "task-registration",
        evidenceIds: expect.any(Array),
        procedureIds: expect.any(Array),
      }),
    );
    expect(portable.confirmedFacts).toContainEqual(
      expect.objectContaining({ id: "fact-registration-date" }),
    );
    expect(portable.unresolved).toContainEqual(
      expect.objectContaining({ id: "conflict-orientation-location" }),
    );
    expect(portable.procedures[0]).toEqual(
      expect.objectContaining({
        ruleVersion: expect.any(String),
        reviewerStatus: expect.any(String),
      }),
    );
  });

  it("applies corrections without changing source records", () => {
    const changed = structuredClone(fictionalCase);
    changed.events.push({
      id: "event-correct-date",
      type: "fact_corrected",
      factId: "fact-registration-date",
      value: "August 13, 2026",
      timestamp: "2026-09-19T12:00:00.000Z",
    });

    const portable = createPortablePlan(
      changed,
      planCase(changed),
      "2026-09-19T12:00:00.000Z",
    );

    expect(
      portable.confirmedFacts.find(
        (fact) => fact.id === "fact-registration-date",
      )?.value,
    ).toBe("August 13, 2026");
    expect(
      changed.facts.find((fact) => fact.id === "fact-registration-date")
        ?.originalValue,
    ).toBe("August 12, 2026 at 9:00 a.m.");
  });

  it("never exports extracted page text or document payloads", () => {
    const portable = createPortablePlan(
      fictionalCase,
      planCase(fictionalCase),
      "2026-09-19T12:00:00.000Z",
    );
    const serialized = JSON.stringify(portable);

    expect(serialized).not.toContain("extractedText");
    expect(serialized).not.toContain("documents");
    expect(serialized).not.toContain(
      fictionalCase.documents[0]?.extractedText,
    );
  });
});
