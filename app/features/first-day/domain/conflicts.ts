import { appendSchoolConfirmation } from "./events";
import type {
  Conflict,
  Dependency,
  Fact,
  FirstDayCase,
  SchoolConfirmationEvent,
} from "./types";

function dependencyUsesFact(
  dependency: Dependency,
  factIds: Set<string>,
): boolean {
  if (dependency.type === "fact") return factIds.has(dependency.factId);
  if (dependency.type === "task") return false;
  return dependency.items.some((item) => dependencyUsesFact(item, factIds));
}

function activeFacts(caseData: FirstDayCase) {
  const removedDocumentIds = new Set(
    caseData.events
      .filter((event) => event.type === "source_removed")
      .map((event) => event.documentId),
  );
  const evidenceById = new Map(
    caseData.evidence.map((evidence) => [evidence.id, evidence]),
  );
  const documentsById = new Map(
    caseData.documents.map((document) => [document.id, document]),
  );

  return caseData.facts.filter((fact) => {
    if (!fact.semanticKey || fact.confirmationState === "superseded") {
      return false;
    }
    return fact.evidenceIds.some((evidenceId) => {
      const evidence = evidenceById.get(evidenceId);
      if (!evidence) return false;
      if (evidence.procedureId) return true;
      if (!evidence.documentId || removedDocumentIds.has(evidence.documentId)) {
        return false;
      }
      return documentsById.get(evidence.documentId)?.status !== "removed";
    });
  });
}

function comparisonValue(fact: Fact) {
  return (fact.normalizedValue ?? fact.originalValue).trim();
}

export function detectConflicts(caseData: FirstDayCase): Conflict[] {
  const groups = new Map<string, Fact[]>();
  for (const fact of activeFacts(caseData)) {
    const semanticKey = fact.semanticKey;
    if (!semanticKey) continue;
    groups.set(semanticKey, [...(groups.get(semanticKey) ?? []), fact]);
  }

  const existingById = new Map(
    caseData.conflicts.map((conflict) => [conflict.id, conflict]),
  );
  const conflicts: Conflict[] = [];

  for (const [semanticKey, facts] of groups) {
    if (new Set(facts.map(comparisonValue)).size < 2) continue;

    const id = `conflict-${semanticKey.replaceAll(".", "-")}`;
    const factIds = facts.map((fact) => fact.id).sort();
    const factIdSet = new Set(factIds);
    const relatedTaskIds = caseData.tasks
      .filter((task) => dependencyUsesFact(task.dependency, factIdSet))
      .map((task) => task.id)
      .sort();
    const existing = existingById.get(id);

    conflicts.push({
      id,
      semanticKey,
      label: facts[0]?.label ?? semanticKey,
      factIds,
      relatedTaskIds,
      status: existing?.status === "resolved" ? "resolved" : "open",
      ...(existing?.resolutionEventId
        ? { resolutionEventId: existing.resolutionEventId }
        : {}),
    });
  }

  return conflicts.sort((left, right) => left.id.localeCompare(right.id));
}

export function resolveConflict(
  caseData: FirstDayCase,
  event: SchoolConfirmationEvent,
): FirstDayCase {
  const conflict = caseData.conflicts.find(
    (item) => item.id === event.conflictId,
  );
  if (!conflict) throw new Error(`Unknown conflict ID: ${event.conflictId}`);
  if (conflict.status === "resolved") {
    throw new Error(`Conflict is already resolved: ${event.conflictId}`);
  }
  if (!conflict.factIds.includes(event.selectedFactId)) {
    throw new Error(
      `Fact ${event.selectedFactId} does not belong to ${event.conflictId}`,
    );
  }
  if (!event.reportedValue.trim()) {
    throw new Error("A school-reported value cannot be empty.");
  }

  const withEvent = appendSchoolConfirmation(caseData, {
    id: event.id,
    conflictId: event.conflictId,
    selectedFactId: event.selectedFactId,
    reportedValue: event.reportedValue.trim(),
    timestamp: event.timestamp,
  });

  return {
    ...withEvent,
    conflicts: withEvent.conflicts.map((item) =>
      item.id === event.conflictId
        ? {
            ...item,
            status: "resolved",
            resolutionEventId: event.id,
          }
        : item,
    ),
  };
}
