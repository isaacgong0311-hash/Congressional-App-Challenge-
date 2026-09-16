import { describe, expect, it } from "vitest";

import { fictionalCase } from "../../app/features/first-day/content/fictional-case";

describe("fictional First Day case", () => {
  it("is explicitly fictional and uses stable unique IDs", () => {
    expect(fictionalCase.mode).toBe("fictional");

    const ids = [
      ...fictionalCase.documents.map((record) => record.id),
      ...fictionalCase.evidence.map((record) => record.id),
      ...fictionalCase.facts.map((record) => record.id),
      ...fictionalCase.procedures.map((record) => record.id),
      ...fictionalCase.tasks.map((record) => record.id),
    ];

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps every task connected to evidence or a reviewed fictional rule", () => {
    const evidenceIds = new Set(fictionalCase.evidence.map((record) => record.id));
    const procedureIds = new Set(fictionalCase.procedures.map((record) => record.id));

    for (const task of fictionalCase.tasks) {
      expect(task.evidenceIds.every((id) => evidenceIds.has(id))).toBe(true);
      expect(task.procedureIds.every((id) => procedureIds.has(id))).toBe(true);
      expect(task.evidenceIds.length + task.procedureIds.length).toBeGreaterThan(0);
    }
  });
});
