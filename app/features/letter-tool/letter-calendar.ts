function calendarDate(iso: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) return null;
  return date;
}

export function validReminderDate(iso: string | null): boolean {
  return iso !== null && calendarDate(iso) !== null;
}

function escapeCalendarText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
}

export function buildLetterReminderCalendar(dateISO: string, summary: string): string | null {
  const start = calendarDate(dateISO);
  if (!start) return null;
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  const dateValue = (date: Date) => date.toISOString().slice(0, 10).replaceAll("-", "");
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const hash = [...summary].reduce((value, char) => ((value * 31 + char.codePointAt(0)!) >>> 0), 0);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Lantern//EN",
    "BEGIN:VEVENT",
    `UID:letter-${dateValue(start)}-${hash.toString(16)}@lantern`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${dateValue(start)}`,
    `DTEND;VALUE=DATE:${dateValue(end)}`,
    `SUMMARY:${escapeCalendarText(summary)}`,
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Reminder",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}
