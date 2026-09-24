import { describe, expect, it } from "vitest";

import { competitionProof } from "../../app/features/first-day/content/competition-proof";
import {
  DEMO_BEATS,
  demoBeatForStep,
  demoBlocker,
} from "../../app/features/first-day/ui/demo-presentation";
import type { CaseSnapshotView } from "../../app/features/first-day/ui/first-day-view";

const snapshot: CaseSnapshotView = {
  documentCount: 3,
  processedDocumentCount: 3,
  pendingFactCount: 2,
  openConflictCount: 1,
  readyTaskCount: 2,
  waitingTaskCount: 2,
  completedTaskCount: 0,
};

describe("guided competition presentation", () => {
  it("defines six unique beats independently from workflow step numbers", () => {
    expect(DEMO_BEATS).toHaveLength(6);
    expect(new Set(DEMO_BEATS.map((beat) => beat.id)).size).toBe(6);
    expect(DEMO_BEATS[0]).toMatchObject({
      id: "before_lantern",
      step: "documents",
      time: "0:20–0:45",
    });
    expect(DEMO_BEATS.at(-1)).toMatchObject({
      id: "engineering_proof",
      step: "export",
      time: "2:25–2:50",
    });
  });

  it("realigns manual workflow navigation to the closest valid beat", () => {
    expect(demoBeatForStep("documents", snapshot)).toBe("before_lantern");
    expect(demoBeatForStep("facts", snapshot)).toBe("traceable_evidence");
    expect(demoBeatForStep("plan", snapshot)).toBe("uncertainty_preserved");
    expect(
      demoBeatForStep("plan", { ...snapshot, openConflictCount: 0 }),
    ).toBe("focused_update");
    expect(
      demoBeatForStep(
        "export",
        { ...snapshot, openConflictCount: 0 },
        "engineering_proof",
      ),
    ).toBe("engineering_proof");
  });

  it("explains the human actions required before advancing", () => {
    expect(demoBlocker("traceable_evidence", snapshot, "English")).toBe(
      "Review 2 facts before continuing.",
    );
    expect(demoBlocker("uncertainty_preserved", snapshot, "English")).toBe(
      "Record what the school told the family.",
    );
    expect(
      demoBlocker(
        "traceable_evidence",
        { ...snapshot, pendingFactCount: 0 },
        "English",
      ),
    ).toBeNull();
  });

  it("uses the versioned evaluation proof expected by every frontend surface", () => {
    expect(competitionProof.packetCount).toBe(20);
    expect(
      Object.fromEntries(
        competitionProof.metrics.map((metric) => [metric.id, metric.value]),
      ),
    ).toEqual({
      quotes: "32/32",
      conflicts: "8/8",
      dates: "0/8",
      tasks: "34/34",
    });
  });
});
