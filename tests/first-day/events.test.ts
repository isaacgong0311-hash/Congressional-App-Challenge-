import { describe, expect, it } from "vitest";

import { fictionalCase } from "../../app/features/first-day/content/fictional-case";
import {
  appendFactConfirmation,
  appendFactCorrection,
  appendFactUnclear,
  appendSourceRemoval,
  appendTaskCompletion,
} from "../../app/features/first-day/domain/events";

describe("First Day case events", () => {
  it("appends a correction without changing the source fact", () => {
    const original = structuredClone(fictionalCase);
    const next = appendFactCorrection(original, {
      id: "event-correct-location",
      factId: "fact-orientation-gym",
      value: "Gym entrance — confirmed by the school office",
      timestamp: "2026-09-15T12:00:00.000Z",
    });

    expect(original.events).toHaveLength(0);
    expect(next.events).toHaveLength(1);
    expect(
      next.facts.find((fact) => fact.id === "fact-orientation-gym")
        ?.originalValue,
    ).toBe("Gym entrance");
  });

  it("appends confirmations, task completions, and source removals", () => {
    const confirmed = appendFactConfirmation(fictionalCase, {
      id: "event-language-confirmed",
      factId: "fact-interpreter-preference",
      timestamp: "2026-09-15T12:00:00.000Z",
    });
    const completed = appendTaskCompletion(confirmed, {
      id: "event-registration-complete",
      taskId: "task-registration",
      timestamp: "2026-09-15T12:01:00.000Z",
    });
    const removed = appendSourceRemoval(completed, {
      id: "event-source-removed",
      documentId: "doc-follow-up-message",
      timestamp: "2026-09-15T12:02:00.000Z",
    });

    expect(removed.events.map((event) => event.type)).toEqual([
      "fact_confirmed",
      "task_completed",
      "source_removed",
    ]);
  });

  it("records an unclear review without changing the source fact", () => {
    const next = appendFactUnclear(fictionalCase, {
      id: "event-fact-unclear",
      factId: "fact-interpreter-preference",
      timestamp: "2026-09-15T12:03:00.000Z",
    });

    expect(next.events.at(-1)?.type).toBe("fact_marked_unclear");
    expect(
      next.facts.find((fact) => fact.id === "fact-interpreter-preference")
        ?.confirmationState,
    ).toBe("proposed");
  });

  it("rejects unknown record IDs", () => {
    expect(() =>
      appendTaskCompletion(fictionalCase, {
        id: "event-invalid",
        taskId: "task-not-present",
        timestamp: "2026-09-15T12:00:00.000Z",
      }),
    ).toThrow("Unknown task ID: task-not-present");
  });

  it("rejects duplicate event IDs", () => {
    const once = appendFactConfirmation(fictionalCase, {
      id: "event-one",
      factId: "fact-interpreter-preference",
      timestamp: "2026-09-15T12:00:00.000Z",
    });

    expect(() =>
      appendFactConfirmation(once, {
        id: "event-one",
        factId: "fact-interpreter-preference",
        timestamp: "2026-09-15T12:01:00.000Z",
      }),
    ).toThrow("Duplicate event ID: event-one");
  });
});
