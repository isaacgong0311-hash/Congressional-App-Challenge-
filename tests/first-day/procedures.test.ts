import { describe, expect, it } from "vitest";

import { roundRockEnrollmentProcedures } from "../../app/features/first-day/content/procedures/round-rock-isd";
import {
  procedureEligibility,
  validateProcedureQuote,
} from "../../app/features/first-day/domain/procedures";
import type { Procedure } from "../../app/features/first-day/domain/types";

const sourceChecked: Procedure = {
  id: "procedure-current",
  district: "Round Rock ISD",
  sourceUrl: "https://www.roundrockisd.org/page/enroll",
  sourceSection: "Steps to enroll",
  quote: "Complete your new student enrollment form",
  checkedAt: "2026-09-16",
  reviewerStatus: "source_checked",
  ruleVersion: "rrisd-enrollment-2026-09-16",
};

describe("procedure eligibility", () => {
  it("accepts a recently source-checked procedure", () => {
    expect(procedureEligibility(sourceChecked, "2026-09-19")).toBe(
      "eligible",
    );
  });

  it("keeps pending procedures pending", () => {
    expect(
      procedureEligibility(
        { ...sourceChecked, reviewerStatus: "pending" },
        "2026-09-19",
      ),
    ).toBe("pending");
  });

  it("marks a one-year-old source check stale", () => {
    expect(
      procedureEligibility(
        { ...sourceChecked, checkedAt: "2025-09-19" },
        "2026-09-19",
      ),
    ).toBe("stale");
  });

  it("keeps explicitly fictional demo procedures eligible", () => {
    expect(
      procedureEligibility(
        {
          ...sourceChecked,
          sourceUrl: null,
          checkedAt: "2020-01-01",
          reviewerStatus: "fictional",
        },
        "2026-09-19",
      ),
    ).toBe("eligible");
  });
});

describe("source-checked Round Rock ISD procedures", () => {
  it("keeps the narrow official source records valid", () => {
    expect(roundRockEnrollmentProcedures).toHaveLength(2);
    expect(roundRockEnrollmentProcedures.every(validateProcedureQuote)).toBe(
      true,
    );
    expect(
      roundRockEnrollmentProcedures.every(
        (procedure) =>
          procedure.checkedAt === "2026-09-16" &&
          procedure.reviewerStatus === "source_checked" &&
          procedure.ruleVersion === "rrisd-enrollment-2026-09-16",
      ),
    ).toBe(true);
  });

  it("rejects missing quotes, non-official URLs, invalid dates, and pending reviews", () => {
    expect(validateProcedureQuote({ ...sourceChecked, quote: " " })).toBe(
      false,
    );
    expect(
      validateProcedureQuote({
        ...sourceChecked,
        sourceUrl: "https://roundrockisd.example.com/page/enroll",
      }),
    ).toBe(false);
    expect(
      validateProcedureQuote({ ...sourceChecked, checkedAt: "not-a-date" }),
    ).toBe(false);
    expect(
      validateProcedureQuote({
        ...sourceChecked,
        reviewerStatus: "pending",
      }),
    ).toBe(false);
  });
});
