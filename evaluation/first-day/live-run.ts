import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { chromium } from "@playwright/test";

import { adaptLiveExtraction } from "../../app/features/first-day/adapters/live-extraction";
import { runGroqExtraction } from "../../app/features/first-day/server/extract-page";
import { FirstDayExtractionSchema } from "../../app/features/first-day/server/extraction-schema";
import { resolveAiConfiguration } from "../../app/lib/ai-config";
import { liveExpectations } from "./live/expectations";
import { liveFixtures } from "./live/fixtures";

const VISION_PRICING: Record<string, { input: number; output: number }> = {
  "qwen/qwen3.8-27b": { input: 0.8, output: 4 },
};

function percentile(values: number[], percentileValue: number) {
  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil((percentileValue / 100) * sorted.length) - 1),
  );
  return sorted[index] ?? 0;
}

function containsValue(actual: string, expected: string) {
  return actual.toLocaleLowerCase().includes(expected.toLocaleLowerCase());
}

async function run() {
  const configuration = resolveAiConfiguration();
  if (!configuration.apiKeyAvailable || !configuration.visionModel) {
    throw new Error("A valid GROQ_API_KEY and vision model are required.");
  }

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 1600 } });
  const expectationById = new Map(
    liveExpectations.map((expectation) => [expectation.fixtureId, expectation]),
  );
  let completed = 0;
  let truePositive = 0;
  let falsePositive = 0;
  let falseNegative = 0;
  let acceptedFacts = 0;
  let exactQuoteFacts = 0;
  let confirmedFacts = 0;
  let inputTokens = 0;
  let outputTokens = 0;
  const durations: number[] = [];

  try {
    for (const [index, fixture] of liveFixtures.entries()) {
      await page.setContent(`<!doctype html>
        <html><body style="margin:0;background:#e8e5dc;padding:64px;font-family:Arial,sans-serif">
          <main style="box-sizing:border-box;width:1072px;min-height:1472px;padding:88px;background:#fff;color:#151b18;transform:${fixture.quality === "degraded" ? "rotate(-0.7deg)" : "none"};filter:${fixture.quality === "degraded" ? "contrast(.86) blur(.28px)" : "none"}">
            <p style="font-size:20px;letter-spacing:.12em;text-transform:uppercase">Synthetic test document · ${fixture.sourceFormat}</p>
            <h1 style="margin-top:72px;font-size:52px">${fixture.heading}</h1>
            <p style="margin-top:64px;font-size:36px;line-height:1.55">${fixture.body}</p>
          </main>
        </body></html>`);
      const image = await page.screenshot({ type: "png" });
      const requestId = `live-eval-${fixture.id}`;
      const startedAt = Date.now();

      try {
        const generated = await runGroqExtraction({
          bytes: new Uint8Array(image),
          mediaType: "image/png",
          language: fixture.language,
          documentId: `doc-${fixture.id}`,
          requestId,
          signal: new AbortController().signal,
        });
        durations.push(Date.now() - startedAt);
        inputTokens += generated.usage.inputTokens ?? 0;
        outputTokens += generated.usage.outputTokens ?? 0;
        const parsed = FirstDayExtractionSchema.parse(generated.value);
        const adapted = adaptLiveExtraction(parsed, index + 1);
        completed += 1;
        acceptedFacts += adapted.facts.length;
        exactQuoteFacts += adapted.facts.length;
        confirmedFacts += adapted.facts.filter(
          (fact) => fact.confirmationState === "confirmed",
        ).length;

        const expected = expectationById.get(fixture.id)?.facts ?? [];
        const matchedPredictions = new Set<number>();
        for (const expectedFact of expected) {
          const predictionIndex = adapted.facts.findIndex(
            (fact, candidateIndex) =>
              !matchedPredictions.has(candidateIndex) &&
              fact.kind === expectedFact.kind &&
              containsValue(fact.originalValue, expectedFact.valueFragment),
          );
          if (predictionIndex >= 0) {
            matchedPredictions.add(predictionIndex);
            truePositive += 1;
          } else {
            falseNegative += 1;
          }
        }
        falsePositive += adapted.facts.length - matchedPredictions.size;
      } catch {
        durations.push(Date.now() - startedAt);
        falseNegative += expectationById.get(fixture.id)?.facts.length ?? 0;
      }
    }
  } finally {
    await browser.close();
  }

  const precision = truePositive / Math.max(1, truePositive + falsePositive);
  const recall = truePositive / Math.max(1, truePositive + falseNegative);
  const pricing = VISION_PRICING[configuration.visionModel];
  const totalCost = pricing
    ? (inputTokens * pricing.input + outputTokens * pricing.output) / 1_000_000
    : null;
  const estimatedFivePageCost = totalCost === null
    ? null
    : (totalCost / liveFixtures.length) * 5;
  const metrics = {
    model: configuration.visionModel,
    runAt: new Date().toISOString(),
    pages: liveFixtures.length,
    completed,
    precision,
    recall,
    acceptedFacts,
    exactQuoteFacts,
    confirmedFacts,
    medianMs: percentile(durations, 50),
    p95Ms: percentile(durations, 95),
    inputTokens,
    outputTokens,
    estimatedFivePageCost,
  };
  const passed =
    completed >= 19 &&
    precision >= 0.9 &&
    recall >= 0.9 &&
    exactQuoteFacts === acceptedFacts &&
    confirmedFacts === 0 &&
    metrics.medianMs < 12_000 &&
    metrics.p95Ms < 30_000 &&
    (estimatedFivePageCost === null || estimatedFivePageCost < 0.1);

  const report = `# First Day live-provider benchmark\n\n` +
    `- Status: **${passed ? "PASS" : "FAIL"}**\n` +
    `- Run: ${metrics.runAt}\n` +
    `- Vision model: \`${metrics.model}\`\n` +
    `- Pages completed without manual retry: ${completed}/${metrics.pages}\n` +
    `- Fact precision: ${(precision * 100).toFixed(1)}%\n` +
    `- Fact recall: ${(recall * 100).toFixed(1)}%\n` +
    `- Exact-quote accepted facts: ${exactQuoteFacts}/${acceptedFacts}\n` +
    `- Automatically confirmed facts: ${confirmedFacts}\n` +
    `- Median / p95 provider time: ${metrics.medianMs} ms / ${metrics.p95Ms} ms\n` +
    `- Input / output tokens: ${inputTokens} / ${outputTokens}\n` +
    `- Estimated five-page cost: ${estimatedFivePageCost === null ? "unavailable for configured model" : `$${estimatedFivePageCost.toFixed(4)}`}\n\n` +
    `This report contains aggregate measurements only. Synthetic page images, extracted text, and raw provider output are not written to disk.\n`;
  await writeFile(
    resolve(process.cwd(), "evaluation/first-day/live-report.md"),
    report,
    "utf8",
  );
  process.stdout.write(`${JSON.stringify({ ...metrics, passed }, null, 2)}\n`);
  if (!passed) process.exitCode = 1;
}

run().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Live evaluation failed.";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
