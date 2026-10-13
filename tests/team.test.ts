import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { aboutHeroCopy, renderTeamReadme, team } from "../content/team";

const twoMembers = [
  ...team,
  { name: "Alex Rivera", role: "Testing lead" },
];

describe("team credits", () => {
  it("uses singular copy for one creator and names everyone when the team grows", () => {
    expect(aboutHeroCopy(team)).toContain("I'm Isaac Gong");
    expect(aboutHeroCopy(twoMembers)).toContain("We're Isaac Gong and Alex Rivera");
    expect(aboutHeroCopy(twoMembers, "es")).toContain("Somos Isaac Gong y Alex Rivera");
    expect(renderTeamReadme(twoMembers)).toContain("- Alex Rivera — Testing lead");
  });

  it("keeps README credits in sync with the source file", async () => {
    const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
    const start = readme.indexOf("## Team\n");
    const end = readme.indexOf("\n## ", start);
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    expect(readme.slice(start, end).trim()).toBe(renderTeamReadme(team).trim());
  });
});
