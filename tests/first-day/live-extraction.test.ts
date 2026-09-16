import { describe, expect, it } from "vitest";

import { adaptLiveExtraction } from "../../app/features/first-day/adapters/live-extraction";
import { FirstDayExtractionSchema } from "../../app/features/first-day/server/extraction-schema";

const response = {
  schemaVersion: "first-day-extraction-v1" as const,
  requestId: "request-1",
  documentId: "doc-1",
  document: {
    label: "Enrollment reminder",
    confidence: 96,
    originalText:
      "Orientation begins in the cafeteria on August 14, 2026 at 5:30 p.m.",
    photoQualityNote: null,
  },
  facts: [
    {
      clientKey: "orientation-location",
      kind: "location" as const,
      semanticKey: "orientation.location",
      label: "Orientation location",
      originalValue: "cafeteria",
      normalizedValue: null,
      quote: "Orientation begins in the cafeteria",
      location: "Page 1",
      confidence: 94,
    },
  ],
};

describe("First Day live extraction", () => {
  it("accepts the narrow provider contract", () => {
    expect(FirstDayExtractionSchema.parse(response)).toEqual(response);
  });

  it("rejects provider-created tasks and requirements", () => {
    expect(
      FirstDayExtractionSchema.safeParse({
        ...response,
        tasks: [{ title: "Bring proof of residency" }],
      }).success,
    ).toBe(false);
  });

  it("creates stable evidence and proposed facts", () => {
    const result = adaptLiveExtraction(response, 1);

    expect(result.document).toEqual(
      expect.objectContaining({
        id: "doc-1",
        status: "ready",
        sourceVersion: "first-day-extraction-v1",
      }),
    );
    expect(result.evidence[0]?.id).toBe(
      "evidence-doc-1-orientation-location",
    );
    expect(result.facts[0]).toEqual(
      expect.objectContaining({
        id: "fact-doc-1-orientation-location",
        semanticKey: "orientation.location",
        confirmationState: "proposed",
      }),
    );
    expect(result.facts[0]).not.toHaveProperty("normalizedValue");
  });

  it("retains a photo warning without inventing a fact", () => {
    const result = adaptLiveExtraction(
      {
        ...response,
        document: {
          ...response.document,
          photoQualityNote: "The bottom edge is cropped.",
        },
        facts: [],
      },
      2,
    );

    expect(result.document.photoQualityNote).toBe(
      "The bottom edge is cropped.",
    );
    expect(result.facts).toEqual([]);
  });

  it("rejects a quotation absent from the correct document", () => {
    const malformed = structuredClone(response);
    malformed.facts[0].quote = "Meet in the gym";

    expect(() => adaptLiveExtraction(malformed, 1)).toThrow("quote_not_found");
  });
});
