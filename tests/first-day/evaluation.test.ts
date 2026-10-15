import { describe, expect, it } from "vitest";

import { runEvaluation } from "../../evaluation/first-day/run";
import report from "../../evaluation/first-day/report.json";

describe("First Day held-out evaluation", () => {
  it("keeps source grounding and conflict behavior deterministic", async () => {
    const result = await runEvaluation();

    expect(result.fixtureCount).toBe(32);
    expect(result.metrics.quoteCoverage).toEqual({ correct: 54, total: 54 });
    expect(result.metrics.readyTaskSourceCoverage.correct).toBe(
      result.metrics.readyTaskSourceCoverage.total,
    );
    expect(result.metrics.conflicts.falsePositives).toBe(0);
    expect(result.metrics.crossLanguage).toEqual({
      truePositives: 4,
      falsePositives: 0,
      falseNegatives: 0,
    });
    expect(result.metrics.spanishOnlyQuoteCoverage).toEqual({ correct: 2, total: 2 });
    expect(result.metrics.falsePositiveTraps).toEqual({
      passed: 4,
      total: 4,
      falsePositives: 0,
    });
    expect(result.metrics.dateErrors).toEqual({ errors: 0, total: 13 });
    expect(result.findings).toEqual([]);
    expect(result.failures).toEqual([]);
    expect(result).toEqual(report);
  });
});
