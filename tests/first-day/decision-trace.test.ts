import { describe, expect, it } from "vitest";

import { fictionalCase } from "../../app/features/first-day/content/fictional-case";
import { resolveConflict } from "../../app/features/first-day/domain/conflicts";
import { buildDecisionTrace } from "../../app/features/first-day/domain/decision-trace";
import { planCase } from "../../app/features/first-day/domain/planner";
import type { FirstDayCase } from "../../app/features/first-day/domain/types";

function copyCase(): FirstDayCase {
  return structuredClone(fictionalCase);
}

describe("Decision Trace projection", () => {
  it("traces the confirmed nurse review back to its exact source", () => {
    const changed = copyCase();
    changed.events.push({
      id: "event-confirm-nurse-review",
      type: "fact_confirmed",
      factId: "fact-nurse-review",
      timestamp: "2026-10-12T12:00:00.000Z",
    });
    const trace = buildDecisionTrace(changed, planCase(changed), "task-health-records");
    expect(trace.state).toBe("ready");
    expect(trace.nodes).toContainEqual(expect.objectContaining({
      kind: "fact",
      detail: "August 13, 2027 at 1:30 p.m. at the Welcome Center",
      state: "confirmed",
    }));
    expect(trace.nodes).toContainEqual(expect.objectContaining({
      kind: "evidence",
      detail: "A nurse review is reserved for August 13, 2027 at 1:30 p.m. at the Welcome Center.",
    }));
  });

  it("explains an unresolved conflict from both source documents", () => {
    const trace = buildDecisionTrace(
      fictionalCase,
      planCase(fictionalCase),
      "task-orientation",
    );

    expect(trace.state).toBe("needs_clarification");
    expect(trace.reason).toContain("conflict");
    expect(
      trace.nodes.filter((node) => node.kind === "decision"),
    ).toEqual([]);
    expect(
      trace.nodes
        .filter((node) => node.kind === "fact")
        .map((node) => [node.detail, node.state]),
    ).toEqual([
      ["School cafeteria", "conflicted"],
      ["Gym", "conflicted"],
    ]);
    expect(
      trace.nodes
        .filter((node) => node.kind === "evidence")
        .map((node) => node.detail),
    ).toEqual([
      "Family orientation will be held in the school cafeteria on August 14, 2027 at 5:30 p.m.",
      "La orientación será en el gimnasio.",
    ]);
    expect(
      trace.nodes
        .filter((node) => node.kind === "document")
        .map((node) => node.label),
    ).toEqual(["Enrollment welcome letter", "School follow-up message"]);
  });

  it("shows the human decision and effective fact states after resolution", () => {
    const resolved = resolveConflict(copyCase(), {
      id: "event-location-confirmed",
      type: "school_confirmation_recorded",
      conflictId: "conflict-orientation-location",
      selectedFactId: "fact-orientation-gym",
      reportedValue: "Gym",
      timestamp: "2026-09-30T16:00:00.000Z",
    });
    const trace = buildDecisionTrace(
      resolved,
      planCase(resolved),
      "task-orientation",
    );

    expect(trace.state).toBe("ready");
    expect(trace.reason).toBe("Every required fact is confirmed.");
    expect(
      trace.nodes.find((node) => node.kind === "decision"),
    ).toEqual(
      expect.objectContaining({
        label: "School confirmation recorded",
        detail: "Gym",
        sourceId: "event-location-confirmed",
      }),
    );
    expect(
      trace.nodes
        .filter((node) => node.kind === "fact")
        .map((node) => [node.detail, node.state]),
    ).toEqual([
      ["School cafeteria", "superseded"],
      ["Gym", "confirmed"],
    ]);
  });

  it("retains nested dependency groups in stable traversal order", () => {
    const trace = buildDecisionTrace(
      fictionalCase,
      planCase(fictionalCase),
      "task-first-day-ready",
    );

    const dependencyNodes = trace.nodes.filter(
      (node) => node.kind === "dependency",
    );
    expect(dependencyNodes.map((node) => node.sourceId)).toEqual([
      "root",
      "root.0",
      "root.1",
    ]);
    expect(dependencyNodes.map((node) => node.label)).toEqual([
      "All requirements",
      "Task requirement",
      "Task requirement",
    ]);
  });

  it("surfaces missing references as warnings instead of throwing", () => {
    const changed = copyCase();
    const task = changed.tasks[0];
    task.dependency = { type: "fact", factId: "fact-missing" };
    task.evidenceIds.push("evidence-missing");
    task.procedureIds.push("procedure-missing");
    changed.evidence[0].documentId = "document-missing";

    const trace = buildDecisionTrace(
      changed,
      planCase(changed),
      task.id,
    );

    expect(trace.warnings).toEqual([
      "Missing fact: fact-missing",
      "Missing document: document-missing",
      "Missing evidence: evidence-missing",
      "Missing procedure: procedure-missing",
    ]);
    expect(
      trace.nodes.filter((node) => node.kind === "warning"),
    ).toHaveLength(4);
  });

  it("rejects an unknown task requested by the caller", () => {
    expect(() =>
      buildDecisionTrace(
        fictionalCase,
        planCase(fictionalCase),
        "task-not-present",
      ),
    ).toThrowError("Cannot build a decision trace for missing task task-not-present.");
  });
});
