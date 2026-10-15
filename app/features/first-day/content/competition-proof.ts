import report from "../../../../evaluation/first-day/report.json";
import type { EvaluationResult } from "../../../../evaluation/first-day/run";

export type CompetitionProofMetric = {
  id: "quotes" | "conflicts" | "dates" | "tasks";
  value: string;
  label: string;
  detail: string;
};

export type CompetitionProof = {
  packetCount: number;
  conflictFalsePositives: number;
  stack: readonly string[];
  metrics: readonly CompetitionProofMetric[];
  aiBoundary: string;
  codeBoundary: string;
  familyBoundary: string;
  limitation: string;
};

export function createCompetitionProof(
  result: Pick<EvaluationResult, "fixtureCount" | "metrics">,
): CompetitionProof {
  const { metrics } = result;
  const conflictTotal =
    metrics.conflicts.truePositives + metrics.conflicts.falseNegatives;
  return {
    packetCount: result.fixtureCount,
    conflictFalsePositives: metrics.conflicts.falsePositives,
    stack: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Zod",
      "Vitest",
      "Playwright",
    ],
    metrics: [
      {
        id: "quotes",
        value: `${metrics.quoteCoverage.correct}/${metrics.quoteCoverage.total}`,
        label: "exact quotes covered",
        detail: "Accepted proposals are checked against exact source evidence.",
      },
      {
        id: "conflicts",
        value: `${metrics.conflicts.truePositives}/${conflictTotal}`,
        label: "intended conflicts found",
        detail: `${metrics.conflicts.falsePositives} false positive${metrics.conflicts.falsePositives === 1 ? "" : "s"} in the synthetic set.`,
      },
      {
        id: "dates",
        value: `${metrics.dateErrors.total - metrics.dateErrors.errors}/${metrics.dateErrors.total}`,
        label: "dates read correctly",
        detail: `${metrics.dateErrors.errors} date normalization errors in the synthetic set.`,
      },
      {
        id: "tasks",
        value: `${metrics.readyTaskSourceCoverage.correct}/${metrics.readyTaskSourceCoverage.total}`,
        label: "ready tasks sourced",
        detail: "Ready tasks are checked for eligible source coverage.",
      },
    ],
    aiBoundary:
      "AI may read a page and propose structured facts with supporting quotes.",
    codeBoundary:
      "Typed code validates exact quotes, preserves conflicts, and derives task states from explicit dependencies.",
    familyBoundary:
      "A person confirms facts and records what the school said before the plan changes.",
    limitation:
      "These are synthetic regression checks that replay recorded extractions through the checking and planning code, so they do not measure the live model or real-world accuracy. No real-family document study has been completed. Provider latency and cost were not measured in the offline run.",
  };
}

export const competitionProof = createCompetitionProof(report);
