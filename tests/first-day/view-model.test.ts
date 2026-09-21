import { describe, expect, it } from "vitest";

import { fictionalCase } from "../../app/features/first-day/content/fictional-case";
import { planCase } from "../../app/features/first-day/domain/planner";
import {
  activeTaskCompletionEvent,
  caseSnapshot,
  filterPlanTasks,
  presentationModeFromDemoParam,
  prioritizedPlanTasks,
} from "../../app/features/first-day/ui/first-day-view";

describe("First Day presentation view", () => {
  it("summarizes the current case without changing domain state", () => {
    const snapshot = caseSnapshot(fictionalCase, planCase(fictionalCase));

    expect(snapshot).toEqual({
      documentCount: 3,
      processedDocumentCount: 3,
      pendingFactCount: 2,
      openConflictCount: 1,
      readyTaskCount: 2,
      waitingTaskCount: 2,
      completedTaskCount: 0,
    });
  });

  it("removes reviewed facts from the pending summary", () => {
    const changed = structuredClone(fictionalCase);
    changed.events.push({
      id: "event-confirm-fact",
      type: "fact_confirmed",
      factId: "fact-immunization-record",
      timestamp: "2026-09-20T12:00:00.000Z",
    });

    expect(caseSnapshot(changed, planCase(changed)).pendingFactCount).toBe(1);
  });

  it("prioritizes clarification before ready, review, waiting, and done", () => {
    const tasks = prioritizedPlanTasks(planCase(fictionalCase).tasks);
    expect(tasks.map((task) => task.state)).toEqual([
      "needs_clarification",
      "ready",
      "ready",
      "waiting",
      "waiting",
    ]);
  });

  it("filters attention, ready, and done tasks", () => {
    const plan = planCase(fictionalCase);
    expect(filterPlanTasks(plan.tasks, "attention")).toHaveLength(1);
    expect(filterPlanTasks(plan.tasks, "ready")).toHaveLength(2);
    expect(filterPlanTasks(plan.tasks, "done")).toHaveLength(0);
    expect(filterPlanTasks(plan.tasks, "all")).toHaveLength(5);
  });

  it("enables guided demo mode only for the explicit demo flag", () => {
    expect(presentationModeFromDemoParam("1")).toBe("guided_demo");
    expect(presentationModeFromDemoParam("0")).toBe("standard");
    expect(presentationModeFromDemoParam(["1"])).toBe("standard");
    expect(presentationModeFromDemoParam(undefined)).toBe("standard");
  });

  it("returns only the latest effective completion event", () => {
    const changed = structuredClone(fictionalCase);
    changed.events.push(
      {
        id: "event-one",
        type: "task_completed",
        taskId: "task-registration",
        timestamp: "2026-09-20T12:00:00.000Z",
      },
      {
        id: "event-one-reverted",
        type: "task_completion_reverted",
        taskId: "task-registration",
        completionEventId: "event-one",
        timestamp: "2026-09-20T12:01:00.000Z",
      },
      {
        id: "event-two",
        type: "task_completed",
        taskId: "task-registration",
        timestamp: "2026-09-20T12:02:00.000Z",
      },
    );

    expect(activeTaskCompletionEvent(changed, "task-registration")?.id).toBe(
      "event-two",
    );
  });
});
