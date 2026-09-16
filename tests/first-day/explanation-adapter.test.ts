import { describe, expect, it } from "vitest";

import { explanationToDocument } from "../../app/features/first-day/adapters/explanation";

describe("existing explanation response adapter", () => {
  it("keeps extracted text and source identity", () => {
    expect(
      explanationToDocument({
        documentId: "doc-upload-1",
        fallbackLabel: "school-letter.jpg",
        pageIndex: 2,
        response: {
          documentType: "School enrollment letter",
          originalText: "Bring this letter to the welcome center.",
        },
      }),
    ).toEqual({
      id: "doc-upload-1",
      label: "School enrollment letter",
      pageIndex: 2,
      status: "ready",
      extractedText: "Bring this letter to the welcome center.",
      sourceVersion: "lantern-explain-v1",
    });
  });

  it("rejects malformed responses instead of creating an empty document", () => {
    expect(() =>
      explanationToDocument({
        documentId: "doc-upload-1",
        fallbackLabel: "school-letter.jpg",
        pageIndex: 1,
        response: { documentType: "School enrollment letter" },
      }),
    ).toThrow("The document response did not include readable source text.");
  });
});
