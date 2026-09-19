import { describe, expect, it } from "vitest";

import { fictionalCase } from "../../app/features/first-day/content/fictional-case";
import { planCase } from "../../app/features/first-day/domain/planner";
import type {
  DerivedTask,
  FirstDayCase,
} from "../../app/features/first-day/domain/types";

function byId(result: ReturnType<typeof planCase>, id: string): DerivedTask {
  const task = result.tasks.find((item) => item.id === id);
  if (!task) throw new Error(`Missing derived task: ${id}`);
  return task;
}

function copyCase(): FirstDayCase {
  return structuredClone(fictionalCase);
}

describe("First Day deterministic planner", () => {
  it("derives ready, clarification, and waiting states", () => {
    const result = planCase(fictionalCase);

    expect(byId(result, "task-registration").state).toBe("ready");
    expect(byId(result, "task-health-records").state).toBe("ready");
    expect(byId(result, "task-orientation").state).toBe(
      "needs_clarification",
    );
    expect(byId(result, "task-interpreter").state).toBe("waiting");
    expect(byId(result, "task-first-day-ready").state).toBe("waiting");
    expect(result.errors).toEqual([]);
  });

  it("keeps an unknown fact waiting instead of treating it as false", () => {
    const changed = copyCase();
    const date = changed.facts.find(
      (fact) => fact.id === "fact-registration-date",
    );
    if (!date) throw new Error("Missing fixture fact");
    date.confirmationState = "proposed";

    expect(byId(planCase(changed), "task-registration").state).toBe(
      "waiting",
    );
  });

  it("treats an explicit unclear event as needing clarification", () => {
    const changed = copyCase();
    changed.events.push({
      id: "event-interpreter-unclear",
      type: "fact_marked_unclear",
      factId: "fact-interpreter-preference",
      timestamp: "2026-09-15T12:00:00.000Z",
    });

    expect(byId(planCase(changed), "task-interpreter").state).toBe(
      "needs_clarification",
    );
  });

  it("marks a task done only from an explicit completion event", () => {
    const changed = copyCase();
    changed.events.push({
      id: "event-registration-complete",
      type: "task_completed",
      taskId: "task-registration",
      timestamp: "2026-09-15T12:00:00.000Z",
    });

    expect(byId(planCase(changed), "task-registration").state).toBe("done");
  });

  it("sends an affected task to review when its source is removed", () => {
    const changed = copyCase();
    changed.events.push(
      {
        id: "event-registration-complete",
        type: "task_completed",
        taskId: "task-registration",
        timestamp: "2026-09-15T12:00:00.000Z",
      },
      {
        id: "event-welcome-removed",
        type: "source_removed",
        documentId: "doc-welcome-letter",
        timestamp: "2026-09-15T12:05:00.000Z",
      },
    );

    const result = planCase(changed);
    expect(byId(result, "task-registration").state).toBe("needs_review");
    expect(byId(result, "task-health-records").state).toBe("ready");
  });

  it("uses a user correction to resolve the supported conflict path", () => {
    const changed = copyCase();
    changed.events.push({
      id: "event-location-confirmed",
      type: "fact_corrected",
      factId: "fact-orientation-gym",
      value: "Gym entrance — confirmed by the school office",
      timestamp: "2026-09-15T12:00:00.000Z",
    });

    expect(byId(planCase(changed), "task-orientation").state).toBe("ready");
  });

  it("returns identical output for identical input", () => {
    expect(planCase(fictionalCase)).toEqual(planCase(fictionalCase));
  });

  it("reports an invalid fact reference without inventing a requirement", () => {
    const changed = copyCase();
    changed.tasks[0].dependency = {
      type: "fact",
      factId: "fact-not-present",
    };

    const result = planCase(changed);
    expect(result.errors).toContainEqual(
      expect.objectContaining({
        code: "missing_reference",
        taskId: "task-registration",
      }),
    );
    expect(byId(result, "task-registration").state).toBe("waiting");
  });

  it("reports dependency cycles", () => {
    const changed = copyCase();
    const registration = changed.tasks.find(
      (task) => task.id === "task-registration",
    );
    const summary = changed.tasks.find(
      (task) => task.id === "task-first-day-ready",
    );
    if (!registration || !summary) throw new Error("Missing fixture task");
    registration.dependency = { type: "task", taskId: summary.id };
    summary.dependency = { type: "task", taskId: registration.id };

    const result = planCase(changed);
    expect(result.errors).toContainEqual(
      expect.objectContaining({ code: "dependency_cycle" }),
    );
  });
});
