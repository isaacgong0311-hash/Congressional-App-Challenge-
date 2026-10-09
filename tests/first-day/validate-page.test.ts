import { describe, expect, it } from "vitest";

import { validatePageProposals } from "../../app/features/first-day/server/validate-page";
import { FirstDayExtractionSchema } from "../../app/features/first-day/server/extraction-schema";

const page = FirstDayExtractionSchema.parse({
  schemaVersion: "first-day-extraction-v1",
  requestId: "request-1",
  documentId: "doc-1",
  document: {
    label: "Enrollment letter",
    confidence: 90,
    originalText: "Bring a birth certificate\n  to the school office.",
    photoQualityNote: null,
  },
  facts: [{
    clientKey: "birth-certificate",
    kind: "requested_item",
    semanticKey: "enrollment.birth_certificate",
    label: "Birth certificate",
    originalValue: "Birth certificate",
    normalizedValue: null,
    quote: "Bring a birth certificate to the school office.",
    location: "Page 1",
    confidence: 90,
  }],
});

describe("provider page proposal validation", () => {
  it("accepts an exact passage across source line breaks", () => {
    expect(validatePageProposals(page)).toEqual([]);
  });

  it("rejects a quote not present on the page", () => {
    expect(validatePageProposals({
      ...page,
      facts: [{ ...page.facts[0], quote: "Bring a passport." }],
    })).toEqual(["quote_not_found"]);
  });

  it("rejects repeated client keys", () => {
    expect(validatePageProposals({
      ...page,
      facts: [page.facts[0], { ...page.facts[0] }],
    })).toContain("duplicate_client_key");
  });
});
