import { describe, expect, it } from "vitest";

import { fictionalCase } from "../../app/features/first-day/content/fictional-case";
import { validateEvidence } from "../../app/features/first-day/domain/evidence";

describe("First Day evidence validation", () => {
  it("accepts exact quotes in the fictional fixture", () => {
    expect(validateEvidence(fictionalCase)).toEqual([]);
  });

  it("rejects a quote that is absent from its linked document", () => {
    const changed = structuredClone(fictionalCase);
    changed.evidence[0].quote = "A sentence that was never in this document.";

    expect(validateEvidence(changed)[0]?.code).toBe("quote_not_found");
  });

  it("rejects a missing document reference", () => {
    const changed = structuredClone(fictionalCase);
    changed.evidence[0].documentId = "doc-not-present";

    expect(validateEvidence(changed)[0]?.code).toBe("missing_document");
  });

  it("rejects facts that cite unknown evidence", () => {
    const changed = structuredClone(fictionalCase);
    changed.facts[0].evidenceIds = ["evidence-not-present"];

    expect(validateEvidence(changed)).toContainEqual(
      expect.objectContaining({
        code: "missing_evidence",
        evidenceId: "evidence-not-present",
      }),
    );
  });
});
