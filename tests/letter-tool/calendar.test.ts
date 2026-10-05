import { describe, expect, it } from "vitest";
import { buildLetterReminderCalendar, validReminderDate } from "../../app/features/letter-tool/letter-calendar";

describe("letter reminders", () => {
  it("rejects impossible and malformed AI dates", () => {
    for (const date of ["2026-02-29", "2026-13-01", "2026-4-05", "tomorrow", "2026-01-01\nLOCATION:fake"]) {
      expect(validReminderDate(date)).toBe(false);
      expect(buildLetterReminderCalendar(date, "Notice")).toBeNull();
    }
  });

  it("rolls over months and years with a one-day event", () => {
    const calendar = buildLetterReminderCalendar("2026-12-31", "Deadline: Notice");
    expect(calendar).toContain("DTSTART;VALUE=DATE:20261231\r\nDTEND;VALUE=DATE:20270101");
    expect(calendar).toContain("TRIGGER:-P1D");
  });

  it("escapes generated text and keeps an event identity across downloads", () => {
    const first = buildLetterReminderCalendar("2028-02-29", "Notice; pay, now\nLOCATION:fake\\value")!;
    const second = buildLetterReminderCalendar("2028-02-29", "Notice; pay, now\nLOCATION:fake\\value")!;
    expect(first).toContain("SUMMARY:Notice\\; pay\\, now\\nLOCATION:fake\\\\value");
    expect(first.match(/^UID:.*$/m)?.[0]).toBe(second.match(/^UID:.*$/m)?.[0]);
    expect(first).toContain("DTEND;VALUE=DATE:20280301");
  });
});
