import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { adaptLiveExtraction } from "../../app/features/first-day/adapters/live-extraction";
import { roundRockEnrollmentProcedures } from "../../app/features/first-day/content/procedures/round-rock-isd";
import { resolveConflict } from "../../app/features/first-day/domain/conflicts";
import { mergeExtraction } from "../../app/features/first-day/domain/extraction";
import { deriveLiveCase } from "../../app/features/first-day/domain/live-tasks";
import { planCase } from "../../app/features/first-day/domain/planner";
import type {
  FirstDayCase,
  FirstDayExtractionResponse,
} from "../../app/features/first-day/domain/types";

export type EvaluationExpectation = {
  fixtureId: string;
  expectedFacts: Array<{
    semanticKey: string;
    originalValue: string;
    quote: string;
  }>;
  expectedConflicts: Array<{ semanticKey: string; values: string[] }>;
  expectedReadyTaskIds: string[];
  expectedClarificationTaskIds: string[];
  expectedDates?: Array<{
    semanticKey: string;
    originalValue: string;
    normalizedValue: string | null;
  }>;
};

export type EvaluationFixture = {
  fixtureId: string;
  scenario:
    | "straightforward_enrollment"
    | "ambiguous_dates"
    | "conflicting_locations"
    | "documented_alternatives"
    | "follow_up_corrections";
  pages: Array<{
    pageIndex: number;
    response: FirstDayExtractionResponse;
  }>;
  confirmedFactIds: string[];
  schoolResolutions?: Array<{
    conflictId: string;
    selectedFactId: string;
    reportedValue: string;
  }>;
  measurements?: { latencyMs?: number; costUsd?: number };
};

type CountMetric = { correct: number; total: number };

export type EvaluationResult = {
  fixtureCount: number;
  metrics: {
    factPrecision: CountMetric;
    factRecall: CountMetric;
    quoteCoverage: CountMetric;
    conflicts: {
      truePositives: number;
      falsePositives: number;
      falseNegatives: number;
    };
    dateErrors: { errors: number; total: number };
    readyTaskSourceCoverage: CountMetric;
    latency: { measured: number; total: number };
    cost: { measured: number; total: number };
  };
  failures: string[];
};

const EVALUATION_DATE = "2026-09-19";
const evaluationRoot = path.dirname(fileURLToPath(import.meta.url));

async function loadRecords<T>(directoryName: string): Promise<T[]> {
  const directory = path.join(evaluationRoot, directoryName);
  const names = (await readdir(directory))
    .filter((name) => name.endsWith(".json"))
    .sort();
  const records: T[] = [];
  for (const name of names) {
    const parsed = JSON.parse(
      await readFile(path.join(directory, name), "utf8"),
    ) as T | T[];
    records.push(...(Array.isArray(parsed) ? parsed : [parsed]));
  }
  return records;
}

function emptyCase(fixtureId: string): FirstDayCase {
  return {
    id: `evaluation-${fixtureId}`,
    mode: "live",
    language: "English",
    district: "Round Rock ISD",
    childFirstName: "",
    ruleVersion: "first-day-extraction-v1",
    documents: [],
    evidence: [],
    facts: [],
    procedures: structuredClone(roundRockEnrollmentProcedures),
    tasks: [],
    conflicts: [],
    events: [],
  };
}

function stable(values: string[]) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function factSignature(fact: {
  semanticKey?: string;
  originalValue: string;
  quote: string;
}) {
  return JSON.stringify([
    fact.semanticKey ?? "",
    fact.originalValue,
    fact.quote,
  ]);
}

function conflictSignature(conflict: {
  semanticKey: string;
  values: string[];
}) {
  return JSON.stringify([conflict.semanticKey, stable(conflict.values)]);
}

function sameStrings(actual: string[], expected: string[]) {
  return JSON.stringify(stable(actual)) === JSON.stringify(stable(expected));
}

function percent(metric: CountMetric) {
  if (metric.total === 0) return "not measured";
  return `${metric.correct}/${metric.total} (${((metric.correct / metric.total) * 100).toFixed(1)}%)`;
}

export async function runEvaluation(): Promise<EvaluationResult> {
  const fixtures = await loadRecords<EvaluationFixture>("fixtures");
  const expectations = await loadRecords<EvaluationExpectation>("expectations");
  const expectationById = new Map(
    expectations.map((expectation) => [expectation.fixtureId, expectation]),
  );
  const failures: string[] = [];
  const result: EvaluationResult = {
    fixtureCount: fixtures.length,
    metrics: {
      factPrecision: { correct: 0, total: 0 },
      factRecall: { correct: 0, total: 0 },
      quoteCoverage: { correct: 0, total: 0 },
      conflicts: {
        truePositives: 0,
        falsePositives: 0,
        falseNegatives: 0,
      },
      dateErrors: { errors: 0, total: 0 },
      readyTaskSourceCoverage: { correct: 0, total: 0 },
      latency: { measured: 0, total: fixtures.length },
      cost: { measured: 0, total: fixtures.length },
    },
    failures,
  };

  for (const fixture of fixtures) {
    const expectation = expectationById.get(fixture.fixtureId);
    if (!expectation) {
      failures.push(`${fixture.fixtureId}: missing expectation`);
      continue;
    }

    let caseData = emptyCase(fixture.fixtureId);
    for (const page of fixture.pages) {
      caseData = mergeExtraction(
        caseData,
        adaptLiveExtraction(page.response, page.pageIndex),
      );
    }
    caseData.events = fixture.confirmedFactIds.map((factId, index) => ({
      id: `evaluation-confirm-${fixture.fixtureId}-${index + 1}`,
      type: "fact_confirmed" as const,
      factId,
      timestamp: `2026-09-19T12:${String(index).padStart(2, "0")}:00.000Z`,
    }));
    caseData = deriveLiveCase(caseData);
    for (const [index, resolution] of (
      fixture.schoolResolutions ?? []
    ).entries()) {
      caseData = resolveConflict(caseData, {
        id: `evaluation-resolution-${fixture.fixtureId}-${index + 1}`,
        type: "school_confirmation_recorded",
        conflictId: resolution.conflictId,
        selectedFactId: resolution.selectedFactId,
        reportedValue: resolution.reportedValue,
        timestamp: `2026-09-19T13:${String(index).padStart(2, "0")}:00.000Z`,
      });
      caseData = deriveLiveCase(caseData);
    }
    const plan = planCase(caseData, EVALUATION_DATE);

    const evidenceById = new Map(
      caseData.evidence.map((evidence) => [evidence.id, evidence]),
    );
    const documentById = new Map(
      caseData.documents.map((document) => [document.id, document]),
    );
    const actualFacts = caseData.facts.map((fact) => {
      const evidence = evidenceById.get(fact.evidenceIds[0] ?? "");
      return {
        semanticKey: fact.semanticKey,
        originalValue: fact.originalValue,
        quote: evidence?.quote ?? "",
      };
    });
    const actualFactSignatures = new Set(actualFacts.map(factSignature));
    const expectedFactSignatures = new Set(
      expectation.expectedFacts.map(factSignature),
    );
    const matchingFacts = [...actualFactSignatures].filter((signature) =>
      expectedFactSignatures.has(signature),
    ).length;
    result.metrics.factPrecision.correct += matchingFacts;
    result.metrics.factPrecision.total += actualFactSignatures.size;
    result.metrics.factRecall.correct += matchingFacts;
    result.metrics.factRecall.total += expectedFactSignatures.size;

    for (const fact of caseData.facts) {
      result.metrics.quoteCoverage.total += 1;
      const grounded = fact.evidenceIds.every((evidenceId) => {
        const evidence = evidenceById.get(evidenceId);
        const document = evidence?.documentId
          ? documentById.get(evidence.documentId)
          : undefined;
        return Boolean(
          evidence?.quote && document?.extractedText.includes(evidence.quote),
        );
      });
      if (grounded) result.metrics.quoteCoverage.correct += 1;
    }

    const actualConflicts = caseData.conflicts.map((conflict) => ({
      semanticKey: conflict.semanticKey,
      values: conflict.factIds.map(
        (factId) =>
          caseData.facts.find((fact) => fact.id === factId)?.originalValue ??
          "",
      ),
    }));
    const actualConflictSignatures = new Set(
      actualConflicts.map(conflictSignature),
    );
    const expectedConflictSignatures = new Set(
      expectation.expectedConflicts.map(conflictSignature),
    );
    const trueConflicts = [...actualConflictSignatures].filter((signature) =>
      expectedConflictSignatures.has(signature),
    ).length;
    result.metrics.conflicts.truePositives += trueConflicts;
    result.metrics.conflicts.falsePositives +=
      actualConflictSignatures.size - trueConflicts;
    result.metrics.conflicts.falseNegatives +=
      expectedConflictSignatures.size - trueConflicts;

    const actualDates = caseData.facts.filter((fact) => fact.kind === "date");
    result.metrics.dateErrors.total += actualDates.length;
    for (const fact of actualDates) {
      const expected = expectation.expectedDates?.find(
        (date) =>
          date.semanticKey === fact.semanticKey &&
          date.originalValue === fact.originalValue,
      );
      if (!expected || (fact.normalizedValue ?? null) !== expected.normalizedValue) {
        result.metrics.dateErrors.errors += 1;
      }
    }

    const readyTasks = plan.tasks.filter((task) => task.state === "ready");
    const readyTaskIds = readyTasks.map((task) => task.id);
    const clarificationTaskIds = plan.tasks
      .filter((task) => task.state === "needs_clarification")
      .map((task) => task.id);
    for (const task of readyTasks) {
      result.metrics.readyTaskSourceCoverage.total += 1;
      const evidenceCovered =
        task.evidenceIds.length > 0 &&
        task.evidenceIds.every((id) => evidenceById.has(id));
      const proceduresCovered = task.procedureIds.every((id) =>
        caseData.procedures.some((procedure) => procedure.id === id),
      );
      if (evidenceCovered && proceduresCovered) {
        result.metrics.readyTaskSourceCoverage.correct += 1;
      }
    }

    if (matchingFacts !== actualFactSignatures.size) {
      failures.push(`${fixture.fixtureId}: unexpected extracted fact`);
    }
    if (matchingFacts !== expectedFactSignatures.size) {
      failures.push(`${fixture.fixtureId}: missing expected fact`);
    }
    if (
      actualConflictSignatures.size !== trueConflicts ||
      expectedConflictSignatures.size !== trueConflicts
    ) {
      failures.push(`${fixture.fixtureId}: conflict mismatch`);
    }
    if (!sameStrings(readyTaskIds, expectation.expectedReadyTaskIds)) {
      failures.push(`${fixture.fixtureId}: ready task mismatch`);
    }
    if (
      !sameStrings(
        clarificationTaskIds,
        expectation.expectedClarificationTaskIds,
      )
    ) {
      failures.push(`${fixture.fixtureId}: clarification task mismatch`);
    }

    if (fixture.measurements?.latencyMs !== undefined) {
      result.metrics.latency.measured += 1;
    }
    if (fixture.measurements?.costUsd !== undefined) {
      result.metrics.cost.measured += 1;
    }
  }

  if (expectations.length !== fixtures.length) {
    failures.push(
      `dataset: ${fixtures.length} fixtures but ${expectations.length} expectations`,
    );
  }

  return result;
}

export function renderReport(result: EvaluationResult) {
  const conflictTotal =
    result.metrics.conflicts.truePositives +
    result.metrics.conflicts.falseNegatives;
  return `# First Day held-out evaluation

This report is generated from synthetic, versioned packets. It does not call an AI provider or contain personal records.

## Dataset

- Fixtures: ${result.fixtureCount}
- Scenarios: 5 (4 fixtures each)
- Provider latency: ${result.metrics.latency.measured === 0 ? "not measured" : `${result.metrics.latency.measured}/${result.metrics.latency.total} fixtures`}
- Provider cost: ${result.metrics.cost.measured === 0 ? "not measured" : `${result.metrics.cost.measured}/${result.metrics.cost.total} fixtures`}

## Results

| Metric | Result |
| --- | --- |
| Fact precision | ${percent(result.metrics.factPrecision)} |
| Fact recall | ${percent(result.metrics.factRecall)} |
| Exact-quote coverage | ${percent(result.metrics.quoteCoverage)} |
| Conflict recall | ${result.metrics.conflicts.truePositives}/${conflictTotal} |
| Conflict false positives | ${result.metrics.conflicts.falsePositives} |
| Date normalization errors | ${result.metrics.dateErrors.errors}/${result.metrics.dateErrors.total} |
| Ready-task source coverage | ${percent(result.metrics.readyTaskSourceCoverage)} |

## Failures

${result.failures.length === 0 ? "None." : result.failures.map((failure) => `- ${failure}`).join("\n")}
`;
}

async function main() {
  const result = await runEvaluation();
  await writeFile(path.join(evaluationRoot, "report.md"), renderReport(result));
  process.stdout.write(renderReport(result));
  if (result.failures.length > 0) process.exitCode = 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  void main();
}
