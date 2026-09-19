import { describe, expect, it } from "vitest";

import {
  calendarEvents,
  createCalendarFile,
} from "../../app/features/first-day/export/calendar";
import type { FirstDayCase } from "../../app/features/first-day/domain/types";

function caseWithDate(
  confirmationState: "confirmed" | "proposed" = "confirmed",
  normalizedValue: string | null = "2026-08-12",
): FirstDayCase {
  return {
    id: "case-calendar",
    mode: "live",
    language: "English",
    district: "Round Rock ISD",
    childFirstName: "",
    ruleVersion: "first-day-extraction-v1",
    documents: [
      {
        id: "doc-date",
        label: "Enrollment letter",
        pageIndex: 1,
        status: "ready",
        extractedText: "Registration is August 12, 2026.",
        sourceVersion: "first-day-extraction-v1",
      },
    ],
    evidence: [
      {
        id: "evidence-date",
        documentId: "doc-date",
        quote: "Registration is August 12, 2026.",
        location: "Page 1",
      },
    ],
    facts: [
      {
        id: "fact-registration-date",
        kind: "date",
        semanticKey: "registration.date",
        label: "Registration date",
        originalValue: "August 12, 2026",
        ...(normalizedValue ? { normalizedValue } : {}),
        evidenceIds: ["evidence-date"],
        confirmationState,
      },
    ],
    procedures: [],
    tasks: [],
    conflicts: [],
    events: [],
  };
}

describe("confirmed date calendar export", () => {
  it("includes one confirmed unambiguous date", () => {
    expect(calendarEvents(caseWithDate())).toHaveLength(1);
  });

  it("excludes proposed and ambiguous dates", () => {
    expect(calendarEvents(caseWithDate("proposed"))).toEqual([]);
    expect(calendarEvents(caseWithDate("confirmed", null))).toEqual([]);
  });

  it("keeps a stable UID while applying an ISO correction", () => {
    const caseData = caseWithDate();
    caseData.events.push({
      id: "event-correct-date",
      type: "fact_corrected",
      factId: "fact-registration-date",
      value: "2026-08-13",
      timestamp: "2026-09-19T12:00:00.000Z",
    });

    expect(calendarEvents(caseData)[0]).toEqual(
      expect.objectContaining({
        uid: "lantern-fact-registration-date",
        date: "2026-08-13",
      }),
    );
  });

  it("writes an all-day ICS date without timezone conversion", () => {
    const ics = createCalendarFile(calendarEvents(caseWithDate()));

    expect(ics).toContain("DTSTART;VALUE=DATE:20260812");
    expect(ics).not.toContain("T00:00");
  });

  it("excludes a confirmed date after its source is removed", () => {
    const caseData = caseWithDate();
    caseData.events.push({
      id: "event-remove-source",
      type: "source_removed",
      documentId: "doc-date",
      timestamp: "2026-09-19T12:00:00.000Z",
    });

    expect(calendarEvents(caseData)).toEqual([]);
  });
});
