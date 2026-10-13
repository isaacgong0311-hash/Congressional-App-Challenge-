import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

const draftCopy = /\bTODO\b|\bFIXME\b|<NAME\b|Isaac should|\bplaceholder\b|\blorem\b/;

describe("public copy", () => {
  it("keeps submission notes and draft markers out of the README", async () => {
    const readme = await readFile(new URL("../README.md", import.meta.url), "utf8");
    expect(readme).not.toMatch(draftCopy);
  });
});
