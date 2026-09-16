import { describe, expect, it } from "vitest";

import { extractOuterJson } from "../../app/lib/extract-json";

describe("extractOuterJson", () => {
  it("reads a fenced object and ignores trailing prose", () => {
    expect(extractOuterJson('```json\n{"ok":true}\n``` extra')).toEqual({
      ok: true,
    });
  });

  it("keeps braces inside JSON strings from ending the object", () => {
    expect(extractOuterJson('{"message":"bring {this} page"} trailing')).toEqual({
      message: "bring {this} page",
    });
  });

  it("returns null for malformed output", () => {
    expect(extractOuterJson("student name: Maya {not json}")).toBeNull();
  });
});
