import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { summarizeUsabilityStudy } from "./summary";
import { buildPublicUsabilityReport } from "./public-report";

const evaluationRoot = path.dirname(fileURLToPath(import.meta.url));

export async function runUsabilityEvaluation() {
  const source = await readFile(
    path.join(evaluationRoot, "sessions.json"),
    "utf8",
  );
  const findingsSource = await readFile(
    path.join(evaluationRoot, "findings.json"),
    "utf8",
  );
  const dataset = JSON.parse(source) as unknown;
  const report = summarizeUsabilityStudy(dataset);
  const publicReport = buildPublicUsabilityReport(
    dataset,
    JSON.parse(findingsSource) as unknown,
  );
  await writeFile(path.join(evaluationRoot, "report.md"), report);
  await writeFile(
    path.join(evaluationRoot, "report.json"),
    `${JSON.stringify(publicReport, null, 2)}\n`,
  );
  return report;
}

async function main() {
  const report = await runUsabilityEvaluation();
  process.stdout.write(report);
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  void main();
}
