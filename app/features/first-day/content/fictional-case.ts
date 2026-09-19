import type { FirstDayCase } from "../domain/types";

export const fictionalCase: FirstDayCase = {
  id: "case-maya-rivera",
  mode: "fictional",
  language: "English",
  district: "Mesa View Community Schools (fictional)",
  childFirstName: "Maya",
  ruleVersion: "mesa-view-demo-v1",
  documents: [
    {
      id: "doc-welcome-letter",
      label: "Enrollment welcome letter",
      pageIndex: 1,
      status: "ready",
      sourceVersion: "demo-packet-v1",
      extractedText:
        "Welcome to Mesa View Community Schools. Bring Maya and this letter to the Mesa View Welcome Center, 145 Oak Street, on August 12, 2026 at 9:00 a.m. Family orientation will be held in the school cafeteria on August 14, 2026 at 5:30 p.m. Please bring a parent or guardian photo ID and proof of address.",
    },
    {
      id: "doc-health-note",
      label: "Health office note",
      pageIndex: 2,
      status: "ready",
      sourceVersion: "demo-packet-v1",
      extractedText:
        "Please bring Maya's immunization record. If the record is not available, speak with the school nurse before the first day so the nurse can review the next step with you. A nurse review is reserved for August 13, 2026 at 1:30 p.m. at the Welcome Center.",
    },
    {
      id: "doc-follow-up-message",
      label: "School follow-up message",
      pageIndex: 3,
      status: "ready",
      sourceVersion: "demo-packet-v1",
      extractedText:
        "Reminder for the Rivera family: orientation is August 14 at 5:30 p.m. Please enter through the gym entrance. Reply to this message if you need an interpreter for enrollment or orientation.",
    },
  ],
  procedures: [
    {
      id: "procedure-demo-registration",
      district: "Mesa View Community Schools (fictional)",
      sourceUrl: null,
      sourceSection: "Demo enrollment procedure",
      quote:
        "A family may complete the enrollment meeting after confirming the Welcome Center date and location.",
      checkedAt: "2026-09-15",
      reviewerStatus: "fictional",
      ruleVersion: "mesa-view-demo-v1",
    },
    {
      id: "procedure-demo-health",
      district: "Mesa View Community Schools (fictional)",
      sourceUrl: null,
      sourceSection: "Demo health-record alternative",
      quote:
        "For this fictional demonstration, either an immunization record or a confirmed nurse review can satisfy the preparation step.",
      checkedAt: "2026-09-15",
      reviewerStatus: "fictional",
      ruleVersion: "mesa-view-demo-v1",
    },
  ],
  evidence: [
    {
      id: "evidence-registration-date",
      documentId: "doc-welcome-letter",
      quote: "on August 12, 2026 at 9:00 a.m.",
      location: "Page 1, enrollment paragraph",
    },
    {
      id: "evidence-registration-location",
      documentId: "doc-welcome-letter",
      quote: "Mesa View Welcome Center, 145 Oak Street",
      location: "Page 1, enrollment paragraph",
    },
    {
      id: "evidence-immunization-request",
      documentId: "doc-health-note",
      quote: "Please bring Maya's immunization record.",
      location: "Page 2, first sentence",
    },
    {
      id: "evidence-nurse-alternative",
      documentId: "doc-health-note",
      quote:
        "If the record is not available, speak with the school nurse before the first day",
      location: "Page 2, health instructions",
    },
    {
      id: "evidence-nurse-review",
      documentId: "doc-health-note",
      quote:
        "A nurse review is reserved for August 13, 2026 at 1:30 p.m. at the Welcome Center.",
      location: "Page 2, final sentence",
    },
    {
      id: "evidence-orientation-cafeteria",
      documentId: "doc-welcome-letter",
      quote:
        "Family orientation will be held in the school cafeteria on August 14, 2026 at 5:30 p.m.",
      location: "Page 1, orientation paragraph",
    },
    {
      id: "evidence-orientation-gym",
      documentId: "doc-follow-up-message",
      quote: "Please enter through the gym entrance.",
      location: "Page 3, second sentence",
    },
    {
      id: "evidence-interpreter-offer",
      documentId: "doc-follow-up-message",
      quote:
        "Reply to this message if you need an interpreter for enrollment or orientation.",
      location: "Page 3, final sentence",
    },
    {
      id: "evidence-procedure-registration",
      procedureId: "procedure-demo-registration",
      quote:
        "A family may complete the enrollment meeting after confirming the Welcome Center date and location.",
      location: "Fictional demo rule, registration",
    },
    {
      id: "evidence-procedure-health",
      procedureId: "procedure-demo-health",
      quote:
        "For this fictional demonstration, either an immunization record or a confirmed nurse review can satisfy the preparation step.",
      location: "Fictional demo rule, health records",
    },
  ],
  facts: [
    {
      id: "fact-registration-date",
      kind: "date",
      label: "Enrollment meeting",
      originalValue: "August 12, 2026 at 9:00 a.m.",
      normalizedValue: "2026-08-12T09:00:00",
      evidenceIds: ["evidence-registration-date"],
      confirmationState: "confirmed",
    },
    {
      id: "fact-registration-location",
      kind: "location",
      label: "Enrollment location",
      originalValue: "Mesa View Welcome Center, 145 Oak Street",
      evidenceIds: ["evidence-registration-location"],
      confirmationState: "confirmed",
    },
    {
      id: "fact-immunization-record",
      kind: "requested_item",
      label: "Immunization record available",
      originalValue: "Availability not confirmed",
      evidenceIds: ["evidence-immunization-request"],
      confirmationState: "proposed",
    },
    {
      id: "fact-nurse-review",
      kind: "appointment",
      label: "Nurse review",
      originalValue: "August 13, 2026 at 1:30 p.m. at the Welcome Center",
      normalizedValue: "2026-08-13T13:30:00",
      evidenceIds: ["evidence-nurse-alternative", "evidence-nurse-review"],
      confirmationState: "confirmed",
    },
    {
      id: "fact-orientation-cafeteria",
      kind: "location",
      semanticKey: "orientation.location",
      label: "Orientation location",
      originalValue: "School cafeteria",
      evidenceIds: ["evidence-orientation-cafeteria"],
      confirmationState: "conflicted",
    },
    {
      id: "fact-orientation-gym",
      kind: "location",
      semanticKey: "orientation.location",
      label: "Orientation location",
      originalValue: "Gym entrance",
      evidenceIds: ["evidence-orientation-gym"],
      confirmationState: "conflicted",
    },
    {
      id: "fact-interpreter-preference",
      kind: "preference",
      label: "Interpreter requested",
      originalValue: "Not answered yet",
      evidenceIds: ["evidence-interpreter-offer"],
      confirmationState: "proposed",
    },
  ],
  tasks: [
    {
      id: "task-registration",
      title: "Go to the enrollment meeting",
      action: "Bring Maya and the welcome letter to the Welcome Center.",
      detail: "The date and location are confirmed in the fictional welcome letter.",
      evidenceIds: ["evidence-registration-date", "evidence-registration-location"],
      procedureIds: ["procedure-demo-registration"],
      dependency: {
        type: "allOf",
        items: [
          { type: "fact", factId: "fact-registration-date" },
          { type: "fact", factId: "fact-registration-location" },
        ],
      },
      targetDateFactId: "fact-registration-date",
    },
    {
      id: "task-health-records",
      title: "Prepare for the health-record step",
      action: "Bring the immunization record, or use the confirmed nurse review.",
      detail: "This fictional procedure explicitly allows either documented path.",
      evidenceIds: [
        "evidence-immunization-request",
        "evidence-nurse-alternative",
        "evidence-nurse-review",
      ],
      procedureIds: ["procedure-demo-health"],
      dependency: {
        type: "anyOf",
        items: [
          { type: "fact", factId: "fact-immunization-record" },
          { type: "fact", factId: "fact-nurse-review" },
        ],
      },
      targetDateFactId: "fact-nurse-review",
    },
    {
      id: "task-orientation",
      title: "Confirm where orientation begins",
      action: "Ask whether the family should use the cafeteria or gym entrance.",
      detail: "Two documents name different places for the same orientation.",
      evidenceIds: [
        "evidence-orientation-cafeteria",
        "evidence-orientation-gym",
      ],
      procedureIds: ["procedure-demo-registration"],
      dependency: {
        type: "anyOf",
        items: [
          { type: "fact", factId: "fact-orientation-cafeteria" },
          { type: "fact", factId: "fact-orientation-gym" },
        ],
      },
    },
    {
      id: "task-interpreter",
      title: "Choose whether you want an interpreter",
      action: "Reply to the school if an interpreter would help.",
      detail: "The school offers language help, but the family preference is not confirmed.",
      evidenceIds: ["evidence-interpreter-offer"],
      procedureIds: ["procedure-demo-registration"],
      dependency: {
        type: "fact",
        factId: "fact-interpreter-preference",
      },
    },
    {
      id: "task-first-day-ready",
      title: "Review the finished First Day plan",
      action: "Check the completed enrollment and health steps before school starts.",
      detail: "This summary waits until both preparation tasks are complete.",
      evidenceIds: ["evidence-registration-date", "evidence-nurse-review"],
      procedureIds: ["procedure-demo-registration", "procedure-demo-health"],
      dependency: {
        type: "allOf",
        items: [
          { type: "task", taskId: "task-registration" },
          { type: "task", taskId: "task-health-records" },
        ],
      },
    },
  ],
  conflicts: [
    {
      id: "conflict-orientation-location",
      semanticKey: "orientation.location",
      label: "Orientation location",
      factIds: ["fact-orientation-cafeteria", "fact-orientation-gym"],
      relatedTaskIds: ["task-orientation"],
      status: "open",
    },
  ],
  events: [],
};
