import { describe, expect, it } from "vitest";

import { fictionalCase } from "../../app/features/first-day/content/fictional-case";
import { resolveConflict } from "../../app/features/first-day/domain/conflicts";
import { planCase } from "../../app/features/first-day/domain/planner";
import { caseReadiness } from "../../app/features/first-day/domain/readiness";
import { createPortablePlan } from "../../app/features/first-day/export/plan-document";
import { localizedTaskCopy } from "../../app/features/first-day/ui/first-day-copy";
import { caseSnapshot } from "../../app/features/first-day/ui/first-day-view";

describe("case readiness", () => {
  it("counts proposed and unclear facts even after the source conflict is resolved", () => {
    const changed = structuredClone(fictionalCase);
    changed.events.push({
      id: "event-interpreter-unclear",
      type: "fact_marked_unclear",
      factId: "fact-interpreter-preference",
      timestamp: "2026-10-14T12:00:00.000Z",
    });
    const resolved = resolveConflict(changed, {
      id: "event-school-answer",
      type: "school_confirmation_recorded",
      conflictId: "conflict-orientation-location",
      selectedFactId: "fact-orientation-gym",
      reportedValue: "Gym",
      timestamp: "2026-10-14T12:01:00.000Z",
    });
    const plan = planCase(resolved);
    const readiness = caseReadiness(resolved, plan);
    const portable = createPortablePlan(resolved, plan, "2026-10-14T12:02:00.000Z");
    const snapshot = caseSnapshot(resolved, plan);

    expect(readiness.openConflictCount).toBe(0);
    expect(readiness.unclearFactCount).toBe(1);
    expect(readiness.pendingFactCount).toBe(2);
    expect(readiness.unresolvedCount).toBeGreaterThan(0);
    expect(portable.readiness).toEqual(readiness);
    expect(portable.unresolved).toEqual(readiness.unresolved);
    expect(snapshot.unresolvedCount).toBe(readiness.unresolvedCount);
    expect(portable.unresolved).toContainEqual(expect.objectContaining({ id: "fact-interpreter-preference" }));
  });

  it("keeps an unreviewed fact unresolved when its source is removed", () => {
    const changed = structuredClone(fictionalCase);
    changed.events.push({
      id: "event-source-removed",
      type: "source_removed",
      documentId: "doc-follow-up-message",
      timestamp: "2026-10-14T12:00:00.000Z",
    });
    const readiness = caseReadiness(changed, planCase(changed));
    expect(readiness.pendingFactCount).toBe(2);
    expect(readiness.unresolved).toContainEqual(expect.objectContaining({ id: "fact-interpreter-preference" }));
  });

  it.each([
    ["English", "Orientation location confirmed", "Attend orientation at the gym.", "The school confirmed: Gym."],
    ["Español", "Lugar de orientación confirmado", "Asista a la orientación en el gimnasio.", "La escuela confirmó: Gimnasio."],
  ] as const)("uses the recorded school answer in %s task copy and export", (language, title, action, detail) => {
    const resolved = resolveConflict(structuredClone(fictionalCase), {
      id: "event-school-answer",
      type: "school_confirmation_recorded",
      conflictId: "conflict-orientation-location",
      selectedFactId: "fact-orientation-gym",
      reportedValue: "Gym",
      timestamp: "2026-10-14T12:00:00.000Z",
    });
    const task = planCase(resolved).tasks.find((item) => item.id === "task-orientation")!;
    const copy = localizedTaskCopy(task, language, resolved);
    expect(copy).toMatchObject({ title, action, detail });
    expect(`${copy.title} ${copy.action} ${copy.detail}`).not.toContain("Ask whether");
    expect(createPortablePlan(resolved, planCase(resolved), "2026-10-14T12:01:00.000Z").confirmedFacts)
      .toContainEqual(expect.objectContaining({ id: "fact-orientation-gym", value: "Gym" }));
  });
});
