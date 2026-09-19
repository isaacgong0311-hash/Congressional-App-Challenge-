import type { CaseEvent, FirstDayCase } from "./types";

type EventInput<TType extends CaseEvent["type"]> = Omit<
  Extract<CaseEvent, { type: TType }>,
  "type"
>;

function assertUniqueEventId(caseData: FirstDayCase, eventId: string) {
  if (caseData.events.some((event) => event.id === eventId)) {
    throw new Error(`Duplicate event ID: ${eventId}`);
  }
}

function appendEvent(caseData: FirstDayCase, event: CaseEvent): FirstDayCase {
  assertUniqueEventId(caseData, event.id);
  return { ...caseData, events: [...caseData.events, event] };
}

export function appendFactConfirmation(
  caseData: FirstDayCase,
  input: EventInput<"fact_confirmed">,
): FirstDayCase {
  if (!caseData.facts.some((fact) => fact.id === input.factId)) {
    throw new Error(`Unknown fact ID: ${input.factId}`);
  }
  return appendEvent(caseData, { ...input, type: "fact_confirmed" });
}

export function appendFactCorrection(
  caseData: FirstDayCase,
  input: EventInput<"fact_corrected">,
): FirstDayCase {
  if (!caseData.facts.some((fact) => fact.id === input.factId)) {
    throw new Error(`Unknown fact ID: ${input.factId}`);
  }
  if (!input.value.trim()) {
    throw new Error("A corrected fact value cannot be empty.");
  }
  return appendEvent(caseData, { ...input, type: "fact_corrected" });
}

export function appendFactUnclear(
  caseData: FirstDayCase,
  input: EventInput<"fact_marked_unclear">,
): FirstDayCase {
  if (!caseData.facts.some((fact) => fact.id === input.factId)) {
    throw new Error(`Unknown fact ID: ${input.factId}`);
  }
  return appendEvent(caseData, { ...input, type: "fact_marked_unclear" });
}

export function appendTaskCompletion(
  caseData: FirstDayCase,
  input: EventInput<"task_completed">,
): FirstDayCase {
  if (!caseData.tasks.some((task) => task.id === input.taskId)) {
    throw new Error(`Unknown task ID: ${input.taskId}`);
  }
  return appendEvent(caseData, { ...input, type: "task_completed" });
}

export function appendSourceRemoval(
  caseData: FirstDayCase,
  input: EventInput<"source_removed">,
): FirstDayCase {
  if (!caseData.documents.some((document) => document.id === input.documentId)) {
    throw new Error(`Unknown document ID: ${input.documentId}`);
  }
  return appendEvent(caseData, { ...input, type: "source_removed" });
}
