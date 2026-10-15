// Comparison helpers shared by conflict detection and proposal validation.
// They make equivalent wording compare equal (case, accents, word order,
// English/Spanish names for the same place or month) so a translated or
// re-worded restatement is not reported as a disagreement. They never decide
// which of two genuinely different values is right.

const LEADING_FILLER = new Set([
  "the", "a", "an", "in", "at", "on", "to",
  "el", "la", "los", "las", "un", "una", "en", "al",
]);

// Words that carry no distinguishing meaning inside a place name.
const DROPPED_WORDS = new Set(["de", "del", "school", "escuela", "escolar"]);

// Token-level synonyms. Keys are accent-stripped lowercase.
const SYNONYMS: Record<string, string> = {
  gymnasium: "gym",
  gimnasio: "gym",
  comedor: "cafeteria",
  biblioteca: "library",
  auditorio: "auditorium",
  oficina: "office",
  principal: "main",
  enero: "january",
  febrero: "february",
  marzo: "march",
  abril: "april",
  mayo: "may",
  junio: "june",
  julio: "july",
  agosto: "august",
  septiembre: "september",
  setiembre: "september",
  octubre: "october",
  noviembre: "november",
  diciembre: "december",
};

const MONTH_NUMBER: Record<string, string> = {
  january: "01",
  february: "02",
  march: "03",
  april: "04",
  may: "05",
  june: "06",
  july: "07",
  august: "08",
  september: "09",
  october: "10",
  november: "11",
  december: "12",
};

function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\b([ap])\.?\s?m\b\.?/g, "$1m")
    .replace(/(\d):(\d)/g, "$1$2");
}

export function comparableTokens(value: string): string[] {
  const rawTokens = fold(value)
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

  let start = 0;
  while (start < rawTokens.length - 1 && LEADING_FILLER.has(rawTokens[start])) {
    start += 1;
  }

  const tokens = rawTokens
    .slice(start)
    .map((token) => SYNONYMS[token] ?? token);
  const meaningful = tokens.filter((token) => !DROPPED_WORDS.has(token));
  return meaningful.length > 0 ? meaningful : tokens;
}

export function normalizeComparable(value: string): string {
  return comparableTokens(value).sort().join(" ");
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Returns YYYY-MM-DD when the text names one complete calendar date.
export function isoDateFromText(value: string): string | null {
  const tokens = comparableTokens(value);
  const month = tokens.find((token) => MONTH_NUMBER[token]);
  const year = tokens.find((token) => /^(19|20)\d{2}$/.test(token));
  const day = tokens.find(
    (token) => /^\d{1,2}$/.test(token) && Number(token) >= 1 && Number(token) <= 31,
  );
  if (!month || !year || !day) return null;
  return `${year}-${MONTH_NUMBER[month]}-${day.padStart(2, "0")}`;
}

type Comparable = { originalValue: string; normalizedValue?: string | null };

// A time of day as "HH:MM" in 24-hour form, or "" when the text names none.
function timeOfDay(value: string): string {
  const text = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b([ap])\.?\s?m\b\.?/g, "$1m");
  const match = text.match(/\b(\d{1,2})(?::(\d{2}))?\s?(am|pm)\b|\b(\d{1,2}):(\d{2})\b/);
  if (!match) return "";
  const hour = Number(match[1] ?? match[4]);
  const minute = match[2] ?? match[5] ?? "00";
  const meridiem = match[3];
  let hour24 = hour;
  if (meridiem === "pm" && hour < 12) hour24 += 12;
  if (meridiem === "am" && hour === 12) hour24 = 0;
  return `${String(hour24).padStart(2, "0")}:${minute}`;
}

export function valuesEquivalent(left: Comparable, right: Comparable): boolean {
  if (
    normalizeComparable(left.originalValue) ===
    normalizeComparable(right.originalValue)
  ) {
    return true;
  }

  // One side carries an ISO date and the other names the same date in words,
  // or both carry the same ISO date.
  const leftIso = ISO_DATE.test(left.normalizedValue ?? "")
    ? left.normalizedValue
    : isoDateFromText(left.originalValue);
  const rightIso = ISO_DATE.test(right.normalizedValue ?? "")
    ? right.normalizedValue
    : isoDateFromText(right.originalValue);
  if (leftIso && rightIso && leftIso === rightIso) {
    // Same day: a different time of day is still a disagreement.
    return timeOfDay(left.originalValue) === timeOfDay(right.originalValue);
  }

  if (
    left.normalizedValue &&
    right.normalizedValue &&
    !ISO_DATE.test(left.normalizedValue) &&
    normalizeComparable(left.normalizedValue) ===
      normalizeComparable(right.normalizedValue)
  ) {
    return true;
  }
  return false;
}

// True when the proposed value is visibly backed by its quote.
export function valueSupportedByQuote(value: string, quote: string): boolean {
  const valueTokens = comparableTokens(value);
  if (valueTokens.length === 0) return false;
  const quoteTokens = new Set(comparableTokens(quote));

  const numeric = valueTokens.filter((token) => /\d/.test(token));
  if (numeric.some((token) => !quoteTokens.has(token))) return false;

  const covered = valueTokens.filter((token) => quoteTokens.has(token)).length;
  return covered / valueTokens.length >= 0.6;
}
