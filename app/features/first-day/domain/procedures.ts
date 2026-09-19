import type { Procedure } from "./types";

const DAY_MS = 86_400_000;
const MAX_SOURCE_AGE_DAYS = 180;

export type ProcedureEligibility = "eligible" | "pending" | "stale";

function parseDateOnly(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return Number.NaN;
  return Date.parse(`${value}T00:00:00.000Z`);
}

export function procedureEligibility(
  procedure: Procedure,
  today: string,
): ProcedureEligibility {
  if (procedure.reviewerStatus === "pending") return "pending";
  if (procedure.reviewerStatus === "fictional") return "eligible";

  const checkedAt = parseDateOnly(procedure.checkedAt);
  const currentDate = parseDateOnly(today);
  if (!Number.isFinite(checkedAt) || !Number.isFinite(currentDate)) {
    return "stale";
  }

  return currentDate - checkedAt > MAX_SOURCE_AGE_DAYS * DAY_MS
    ? "stale"
    : "eligible";
}

export function validateProcedureQuote(procedure: Procedure) {
  if (!procedure.quote.trim()) return false;
  if (procedure.reviewerStatus === "pending") return false;
  if (!Number.isFinite(parseDateOnly(procedure.checkedAt))) return false;
  if (!procedure.sourceUrl) return false;

  try {
    const source = new URL(procedure.sourceUrl);
    return (
      source.protocol === "https:" &&
      (source.hostname === "roundrockisd.org" ||
        source.hostname.endsWith(".roundrockisd.org"))
    );
  } catch {
    return false;
  }
}
