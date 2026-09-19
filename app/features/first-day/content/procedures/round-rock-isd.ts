import type { Procedure } from "../../domain/types";

export const roundRockEnrollmentProcedures: Procedure[] = [
  {
    id: "procedure-rrisd-documents",
    district: "Round Rock ISD",
    sourceUrl: "https://www.roundrockisd.org/page/enroll",
    sourceSection: "What you'll need to begin — Student documentation",
    quote:
      "Certified birth certificate\nImmunization records\nProof of residence within Round Rock ISD boundaries\nLast report card or withdrawal form from the prior school district (if available)\nSocial Security Card (if available)",
    checkedAt: "2026-09-16",
    reviewerStatus: "source_checked",
    ruleVersion: "rrisd-enrollment-2026-09-16",
  },
  {
    id: "procedure-rrisd-enrollment-sequence",
    district: "Round Rock ISD",
    sourceUrl: "https://www.roundrockisd.org/page/enroll",
    sourceSection: "Steps to enroll",
    quote:
      "Create an account in the Round Rock ISD enrollment portal\nComplete your new student enrollment form\nSign up for a parent/guardian home access account",
    checkedAt: "2026-09-16",
    reviewerStatus: "source_checked",
    ruleVersion: "rrisd-enrollment-2026-09-16",
  },
];
