import { describe, expect, it } from "vitest";

import { fictionalCase } from "../../app/features/first-day/content/fictional-case";
import { validateEvidence } from "../../app/features/first-day/domain/evidence";
import { DOCUMENT_ES, FACT_ES, TASK_ES } from "../../app/features/first-day/ui/first-day-copy";

describe("fictional packet languages", () => {
  it("preserves exact Spanish source quotes for the follow-up page and conflict", () => {
    const followUp = fictionalCase.documents.find((item) => item.id === "doc-follow-up-message");
    expect(followUp?.extractedText).toContain("Por favor, entre por la entrada del gimnasio.");
    expect(followUp?.extractedText).toContain("Responda a este mensaje si necesita un intérprete");
    expect(validateEvidence(fictionalCase)).toEqual([]);
    const gym = fictionalCase.evidence.find((item) => item.id === "evidence-orientation-gym");
    expect(gym?.documentId).toBe(followUp?.id);
    expect(gym?.quote).toContain("entrada del gimnasio");
  });

  it("provides a Spanish label for every fictional document, fact, and task", () => {
    expect(fictionalCase.documents.map((item) => item.id).filter((id) => !DOCUMENT_ES[id])).toEqual([]);
    expect(fictionalCase.facts.map((item) => item.id).filter((id) => !FACT_ES[id])).toEqual([]);
    expect(fictionalCase.tasks.map((item) => item.id).filter((id) => !TASK_ES[id])).toEqual([]);
  });
});
