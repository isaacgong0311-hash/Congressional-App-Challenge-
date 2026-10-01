import { describe, expect, it } from "vitest";

import {
  parseUsabilityDataset,
  summarizeUsabilityStudy,
  USABILITY_TASK_IDS,
  type UsabilitySession,
} from "../../evaluation/usability/summary";

function validSession(
  participantId: string,
  seconds = 30,
  confidenceBefore = 2,
  confidenceAfter = 4,
): UsabilitySession {
  return {
    participantId,
    studyVersion: "lantern-usability-v1" as const,
    interfaceLanguage: "English" as const,
    adultConfirmed: true as const,
    consentConfirmed: true as const,
    tasks: USABILITY_TASK_IDS.map((taskId) => ({
      taskId,
      outcome: "success" as const,
      timeSeconds: seconds,
    })),
    unsupportedConclusionCount: 0,
    confidenceBefore,
    confidenceAfter,
    confusionCodes: ["none" as const],
    suggestionSummary: "Make the next action even easier to scan.",
  };
}

describe("usability observation validation", () => {
  it("accepts an explicitly unstarted dataset", () => {
    expect(() =>
      parseUsabilityDataset({ studyStatus: "not_started", sessions: [] }),
    ).not.toThrow();
  });

  it("requires five sessions before a study can be called complete", () => {
    expect(() =>
      parseUsabilityDataset({
        studyStatus: "complete",
        sessions: [validSession("U01")],
      }),
    ).toThrow(/at least 5/i);
  });

  it("rejects duplicate participants and incomplete task sets", () => {
    const duplicate = validSession("U01");
    expect(() =>
      parseUsabilityDataset({
        studyStatus: "in_progress",
        sessions: [duplicate, duplicate],
      }),
    ).toThrow(/participant IDs must be unique/i);

    const incomplete = validSession("U02");
    incomplete.tasks.pop();
    expect(() =>
      parseUsabilityDataset({
        studyStatus: "in_progress",
        sessions: [incomplete],
      }),
    ).toThrow(/each required task exactly once/i);
  });

  it("rejects missing consent and out-of-range measurements", () => {
    expect(() =>
      parseUsabilityDataset({
        studyStatus: "in_progress",
        sessions: [{ ...validSession("U01"), consentConfirmed: false }],
      }),
    ).toThrow();

    const invalid = validSession("U02");
    invalid.confidenceAfter = 6;
    invalid.tasks[0].timeSeconds = 0;
    expect(() =>
      parseUsabilityDataset({
        studyStatus: "in_progress",
        sessions: [invalid],
      }),
    ).toThrow();
  });

  it("rejects unknown or contradictory confusion codes and long suggestions", () => {
    expect(() =>
      parseUsabilityDataset({
        studyStatus: "in_progress",
        sessions: [
          {
            ...validSession("U01"),
            confusionCodes: ["none", "navigation"],
          },
        ],
      }),
    ).toThrow(/none cannot be combined/i);

    expect(() =>
      parseUsabilityDataset({
        studyStatus: "in_progress",
        sessions: [
          {
            ...validSession("U02"),
            confusionCodes: ["unknown"],
            suggestionSummary: "x".repeat(241),
          },
        ],
      }),
    ).toThrow();
  });
});

describe("usability report summary", () => {
  it("does not turn an empty protocol into study findings", () => {
    const report = summarizeUsabilityStudy({
      studyStatus: "not_started",
      sessions: [],
    });

    expect(report).toContain("**Status: Not started**");
    expect(report).toContain("No participant sessions have been recorded.");
    expect(report).toContain(
      "This protocol must not be described as a completed user study.",
    );
    expect(report).not.toContain("0% success");
  });

  it("uses exact denominators and transparent arithmetic", () => {
    const sessions = [
      validSession("U01", 10, 2, 4),
      validSession("U02", 20, 3, 4),
      validSession("U03", 30, 2, 3),
      validSession("U04", 40, 4, 5),
      validSession("U05", 50, 1, 4),
    ];
    sessions[1].unsupportedConclusionCount = 1;
    sessions[4].unsupportedConclusionCount = 2;
    sessions[1].confusionCodes = ["navigation"];
    sessions[2].confusionCodes = ["source_provenance"];
    sessions[3].confusionCodes = ["conflict_resolution"];
    sessions[4].confusionCodes = ["decision_trace"];
    const conflictTask = sessions[3].tasks.find(
      (task) => task.taskId === "detect_orientation_conflict",
    );
    const sourceTask = sessions[4].tasks.find(
      (task) => task.taskId === "find_source",
    );
    if (!conflictTask || !sourceTask) throw new Error("Missing test task");
    conflictTask.outcome = "partial";
    sourceTask.outcome = "not_completed";

    const report = summarizeUsabilityStudy({
      studyStatus: "complete",
      sessions,
    });

    expect(report).toContain("**Status: Complete — 5 sessions**");
    expect(report).toContain("Successful task attempts | 28/30 (93.3%)");
    expect(report).toContain("Detect the orientation conflict | 4/5 (80.0%)");
    expect(report).toContain("Find original source passages | 4/5 (80.0%)");
    expect(report).toContain("Unsupported conclusions | 3 total");
    expect(report).toContain("Mean total session time | 180.0 seconds");
    expect(report).toContain("Mean confidence before | 2.4/5");
    expect(report).toContain("Mean confidence after | 4.0/5");
    expect(report).toContain("Mean confidence change | +1.6 points");
    expect(report).toContain("Observed behavior does not establish impact");
  });

  it("labels fewer than five sessions as preliminary", () => {
    const report = summarizeUsabilityStudy({
      studyStatus: "in_progress",
      sessions: [validSession("U01")],
    });

    expect(report).toContain(
      "**Status: Preliminary — study in progress (1 session)**",
    );
  });
});
