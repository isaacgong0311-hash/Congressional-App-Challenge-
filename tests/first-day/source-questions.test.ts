import { describe, expect, it } from "vitest";

import { fictionalCase } from "../../app/features/first-day/content/fictional-case";
import { resolveConflict } from "../../app/features/first-day/domain/conflicts";
import { answerFromSources, rankSourcesLocally, sourceExcerpts } from "../../app/features/first-day/domain/source-questions";

describe("source cited questions", () => {
  it("finds both original passages when an English or Spanish question touches a conflict", () => {
    const sources = sourceExcerpts(fictionalCase);
    for (const question of ["Where is orientation?", "¿Dónde es la orientación?"]) {
      const ranked = rankSourcesLocally(question, sources);
      expect(ranked.map((source) => source.id)).toContain("evidence-orientation-cafeteria");
      const answer = answerFromSources(fictionalCase, question, ranked.map((source) => source.id));
      expect(answer.status).toBe("conflict");
      expect(answer.sources.map((source) => source.id)).toEqual(expect.arrayContaining([
        "evidence-orientation-cafeteria", "evidence-orientation-gym",
      ]));
      expect(answer.sources.every((source) => source.quote.length > 0)).toBe(true);
    }
  });

  it("keeps the recorded school answer separate from the disagreeing pages", () => {
    const resolved = resolveConflict(structuredClone(fictionalCase), {
      id: "school-answer", type: "school_confirmation_recorded", conflictId: "conflict-orientation-location",
      selectedFactId: "fact-orientation-gym", reportedValue: "Gym", timestamp: "2026-10-14T12:00:00.000Z",
    });
    const answer = answerFromSources(resolved, "Where is orientation?", ["evidence-orientation-cafeteria"]);
    expect(answer.status).toBe("found");
    expect(answer.recordedSchoolAnswer).toEqual({ value: "Gym", factId: "fact-orientation-gym" });
    expect(answer.sources).toHaveLength(2);
  });

  it("can cite the agreed orientation time without claiming the location is settled", () => {
    const sources = sourceExcerpts(fictionalCase);
    const ranked = rankSourcesLocally("When is orientation?", sources);
    expect(ranked.map((source) => source.id)).toContain("evidence-orientation-time-welcome");
    const answer = answerFromSources(fictionalCase, "When is orientation?", ranked.map((source) => source.id));
    expect(answer.status).toBe("found");
  });

  it("does not mix the orientation time into an enrollment date answer", () => {
    for (const question of ["When is enrollment?", "¿Cuándo es la inscripción?"]) {
      const ranked = rankSourcesLocally(question, sourceExcerpts(fictionalCase));
      expect(ranked.map((source) => source.id)).toEqual(["evidence-registration-date"]);
      expect(answerFromSources(fictionalCase, question, ranked.map((source) => source.id)).status).toBe("found");
    }
  });

  it("does not cite removed, missing, or unverified pages", () => {
    const changed = structuredClone(fictionalCase);
    changed.events.push({ id: "remove", type: "source_removed", documentId: "doc-follow-up-message", timestamp: "2026-10-14T12:00:00.000Z" });
    changed.evidence.find((evidence) => evidence.id === "evidence-registration-date")!.quote = "invented quote";
    const sources = sourceExcerpts(changed);
    expect(sources.map((source) => source.id)).not.toContain("evidence-orientation-gym");
    expect(sources.map((source) => source.id)).not.toContain("evidence-registration-date");
    expect(answerFromSources(changed, "Where is orientation?", ["evidence-orientation-gym", "invented-id"]).status).toBe("not_found");
  });
});
