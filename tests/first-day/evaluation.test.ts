import { describe, expect, it } from "vitest";

import { runEvaluation } from "../../evaluation/first-day/run";

describe("First Day held-out evaluation", () => {
  it("keeps source grounding and conflict behavior deterministic", async () => {
    const result = await runEvaluation();

    expect(result.fixtureCount).toBe(20);
    expect(result.metrics.quoteCoverage).toEqual({ correct: 32, total: 32 });
    expect(result.metrics.readyTaskSourceCoverage.correct).toBe(
      result.metrics.readyTaskSourceCoverage.total,
    );
    expect(result.metrics.conflicts.falsePositives).toBe(0);
    expect(result.metrics.dateErrors).toEqual({ errors: 0, total: 8 });
    expect(result.failures).toEqual([]);
  });
});
