import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { summarizeUsabilityStudy } from "./summary";

const evaluationRoot = path.dirname(fileURLToPath(import.meta.url));

export async function runUsabilityEvaluation() {
  const source = await readFile(
    path.join(evaluationRoot, "sessions.json"),
    "utf8",
  );
  const report = summarizeUsabilityStudy(JSON.parse(source) as unknown);
  await writeFile(path.join(evaluationRoot, "report.md"), report);
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
