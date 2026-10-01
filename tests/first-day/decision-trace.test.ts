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
      ["Gym entrance", "conflicted"],
    ]);
    expect(
      trace.nodes
        .filter((node) => node.kind === "evidence")
        .map((node) => node.detail),
    ).toEqual([
      "Family orientation will be held in the school cafeteria on August 14, 2027 at 5:30 p.m.",
      "Please enter through the gym entrance.",
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
      reportedValue: "Gym entrance",
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
        detail: "Gym entrance",
        sourceId: "event-location-confirmed",
      }),
    );
    expect(
      trace.nodes
        .filter((node) => node.kind === "fact")
        .map((node) => [node.detail, node.state]),
    ).toEqual([
      ["School cafeteria", "superseded"],
      ["Gym entrance", "confirmed"],
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
