import { describe, expect, it } from "vitest";

import { parseExtractionMetadata } from "../../app/api/first-day/extract/route";

describe("First Day extraction metadata", () => {
  it("accepts stable document and request IDs", () => {
    expect(
      parseExtractionMetadata({
        documentId: "doc-1",
        requestId: "request-1",
      }),
    ).toEqual({ documentId: "doc-1", requestId: "request-1" });
  });

  it("rejects missing or unsafe IDs", () => {
    expect(() =>
      parseExtractionMetadata({ documentId: "../secret", requestId: "" }),
    ).toThrow("Invalid extraction metadata");
  });
});
