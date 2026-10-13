import { readFile, writeFile } from "node:fs/promises";

import { renderTeamReadme } from "../content/team";

const readmePath = new URL("../README.md", import.meta.url);

async function main() {
  const readme = await readFile(readmePath, "utf8");
  const start = readme.indexOf("## Team\n");
  const end = readme.indexOf("\n## ", start);
  if (start < 0 || end < 0) {
    throw new Error("README.md needs a Team section before the next heading.");
  }

  await writeFile(
    readmePath,
    `${readme.slice(0, start)}${renderTeamReadme()}\n${readme.slice(end + 1)}`,
  );
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
