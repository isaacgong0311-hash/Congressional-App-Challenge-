import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

import { aboutHeroCopy, renderTeamReadme, team } from "../content/team";

const extendedTeam = [
  ...team,
  { name: "Alex Rivera", role: "Testing lead" },
];

describe("team credits", () => {
  it("uses singular copy for one creator and names everyone when the team grows", () => {
    expect(aboutHeroCopy([team[0]])).toContain("I'm Isaac Gong");
    expect(aboutHeroCopy(team)).toContain("We're Isaac Gong, Karthik Devarasetty, and Vihan Santhosh");
    expect(aboutHeroCopy(team, "es")).toContain("Somos Isaac Gong, Karthik Devarasetty y Vihan Santhosh");
    expect(aboutHeroCopy(extendedTeam)).toContain("Isaac Gong, Karthik Devarasetty, Vihan Santhosh, and Alex Rivera");
    expect(renderTeamReadme(extendedTeam)).toContain("- Alex Rivera — Testing lead");
  });

  it("keeps README credits in sync with the source file", async () => {
    const readme = (await readFile(new URL("../README.md", import.meta.url), "utf8")).replace(/\r\n/g, "\n");
    const start = readme.indexOf("## Team\n");
    const end = readme.indexOf("\n## ", start);
    expect(start).toBeGreaterThanOrEqual(0);
    expect(end).toBeGreaterThan(start);
    expect(readme.slice(start, end).trim()).toBe(renderTeamReadme(team).trim());
  });
});
