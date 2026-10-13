import { describe, expect, it } from "vitest";

import { runEvaluation } from "../../evaluation/first-day/run";
import report from "../../evaluation/first-day/report.json";

describe("First Day held-out evaluation", () => {
  it("keeps source grounding and conflict behavior deterministic", async () => {
    const result = await runEvaluation();

    expect(result.fixtureCount).toBe(28);
    expect(result.metrics.quoteCoverage).toEqual({ correct: 46, total: 46 });
    expect(result.metrics.readyTaskSourceCoverage.correct).toBe(
      result.metrics.readyTaskSourceCoverage.total,
    );
    expect(result.metrics.conflicts.falsePositives).toBe(1);
    expect(result.metrics.crossLanguage).toEqual({
      truePositives: 4,
      falsePositives: 0,
      falseNegatives: 0,
    });
    expect(result.metrics.spanishOnlyQuoteCoverage).toEqual({ correct: 2, total: 2 });
    expect(result.metrics.falsePositiveTraps).toEqual({
      passed: 1,
      total: 2,
      falsePositives: 1,
    });
    expect(result.metrics.dateErrors).toEqual({ errors: 0, total: 9 });
    expect(result.findings).toEqual([
      "false-positive-trap-02: expected 0 conflict(s), observed 1.",
    ]);
    expect(result.failures).toEqual([]);
    expect(result).toEqual(report);
  });
});
