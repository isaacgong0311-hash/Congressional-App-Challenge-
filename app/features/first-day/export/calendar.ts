import type { FirstDayCase } from "../domain/types";
import { effectiveConfirmedFacts } from "./plan-document";

export type CalendarEvent = {
  uid: string;
  date: string;
  title: string;
  evidenceIds: string[];
};

function validDateOnly(value: string) {
  const date = value.slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
    ? date
    : null;
}

export function calendarEvents(caseData: FirstDayCase): CalendarEvent[] {
  return effectiveConfirmedFacts(caseData).flatMap(
    ({ fact, normalizedValue }) => {
      if (fact.kind !== "date" || !normalizedValue) return [];
      const date = validDateOnly(normalizedValue);
      if (!date) return [];
      return [
        {
          uid: `lantern-${fact.id}`,
          date,
          title: fact.label,
          evidenceIds: [...fact.evidenceIds],
        },
      ];
    },
  );
}

function escapeIcs(value: string) {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll("\n", "\\n");
}

export function createCalendarFile(events: CalendarEvent[]) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Lantern//First Day//EN",
    "CALSCALE:GREGORIAN",
  ];

  for (const event of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${escapeIcs(event.uid)}`,
      `DTSTART;VALUE=DATE:${event.date.replaceAll("-", "")}`,
      `SUMMARY:${escapeIcs(event.title)}`,
      `DESCRIPTION:${escapeIcs(`Source references: ${event.evidenceIds.join(", ")}`)}`,
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR", "");
  return lines.join("\r\n");
}
