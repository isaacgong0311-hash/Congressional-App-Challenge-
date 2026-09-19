import type {
  Fact,
  FirstDayCase,
  PlanTask,
  Procedure,
} from "./types";
import { detectConflicts } from "./conflicts";

function stableSuffix(value: string) {
  return value.replaceAll(".", "-").replace(/[^a-z0-9-]/g, "-");
}

function confirmedActiveFacts(caseData: FirstDayCase) {
  const confirmedIds = new Set(
    caseData.facts
      .filter((fact) => fact.confirmationState === "confirmed")
      .map((fact) => fact.id),
  );
  const removedDocumentIds = new Set<string>();

  for (const event of caseData.events) {
    if (event.type === "source_removed") {
      removedDocumentIds.add(event.documentId);
    }
    if (event.type === "fact_confirmed" || event.type === "fact_corrected") {
      confirmedIds.add(event.factId);
    }
    if (event.type === "fact_marked_unclear") {
      confirmedIds.delete(event.factId);
    }
    if (event.type === "school_confirmation_recorded") {
      const conflict = caseData.conflicts.find(
        (item) => item.id === event.conflictId,
      );
      for (const factId of conflict?.factIds ?? []) confirmedIds.delete(factId);
      confirmedIds.add(event.selectedFactId);
    }
  }

  const evidenceById = new Map(
    caseData.evidence.map((evidence) => [evidence.id, evidence]),
  );
  return caseData.facts.filter((fact) => {
    if (!confirmedIds.has(fact.id)) return false;
    return fact.evidenceIds.some((evidenceId) => {
      const evidence = evidenceById.get(evidenceId);
      return (
        Boolean(evidence?.procedureId) ||
        Boolean(
          evidence?.documentId &&
            !removedDocumentIds.has(evidence.documentId),
        )
      );
    });
  });
}

function allFacts(facts: Fact[]): PlanTask["dependency"] {
  return facts.length === 1
    ? { type: "fact", factId: facts[0].id }
    : {
        type: "allOf",
        items: facts.map((fact) => ({ type: "fact", factId: fact.id })),
      };
}

export function buildLiveTasks(
  caseData: FirstDayCase,
  procedures: Procedure[],
): PlanTask[] {
  if (caseData.mode !== "live") return caseData.tasks;

  const tasks: PlanTask[] = [];
  const confirmedFacts = confirmedActiveFacts(caseData);
  const requestedItems = confirmedFacts.filter(
    (fact) => fact.kind === "requested_item",
  );
  const documentsProcedure = procedures.find(
    (procedure) => procedure.id === "procedure-rrisd-documents",
  );
  const enrollmentProcedure = procedures.find(
    (procedure) => procedure.id === "procedure-rrisd-enrollment-sequence",
  );

  if (requestedItems.length > 0 && documentsProcedure) {
    tasks.push({
      id: "task-live-gather-documents",
      title: "Gather the confirmed enrollment documents",
      action: `Prepare: ${requestedItems.map((fact) => fact.label).join(", ")}.`,
      detail:
        "This checklist uses only document requests you confirmed against their sources.",
      evidenceIds: [...new Set(requestedItems.flatMap((fact) => fact.evidenceIds))],
      procedureIds: [documentsProcedure.id],
      dependency: allFacts(requestedItems),
    });
  }

  if (confirmedFacts.length > 0 && enrollmentProcedure) {
    const anchorFact = requestedItems[0] ?? confirmedFacts[0];
    tasks.push({
      id: "task-live-open-enrollment",
      title: "Open the Round Rock ISD enrollment form",
      action:
        "Create the portal account, complete the new-student form, then set up guardian access.",
      detail:
        "The sequence comes from the source-checked district enrollment page.",
      evidenceIds: anchorFact.evidenceIds,
      procedureIds: [enrollmentProcedure.id],
      dependency: { type: "fact", factId: anchorFact.id },
    });
  }

  for (const fact of confirmedFacts) {
    if (
      (fact.kind !== "date" && fact.kind !== "appointment") ||
      !fact.semanticKey
    ) {
      continue;
    }
    tasks.push({
      id: `task-live-attend-${stableSuffix(fact.semanticKey)}`,
      title: fact.label,
      action: `Plan around the confirmed date or appointment: ${fact.originalValue}.`,
      detail: "This timing comes from a fact you reviewed against its source.",
      evidenceIds: fact.evidenceIds,
      procedureIds: [],
      dependency: { type: "fact", factId: fact.id },
      targetDateFactId: fact.id,
    });
  }

  for (const conflict of caseData.conflicts) {
    tasks.push({
      id: `task-live-clarify-${stableSuffix(conflict.semanticKey)}`,
      title: `Clarify ${conflict.label.toLowerCase()}`,
      action: "Ask the school which source should guide your family, then record what they tell you.",
      detail:
        "Lantern keeps both source passages visible and does not choose a winner.",
      evidenceIds: caseData.facts
        .filter((fact) => conflict.factIds.includes(fact.id))
        .flatMap((fact) => fact.evidenceIds),
      procedureIds: [],
      dependency: {
        type: "anyOf",
        items: conflict.factIds.map((factId) => ({ type: "fact", factId })),
      },
    });
  }

  const prerequisiteIds = tasks.map((task) => task.id);
  if (prerequisiteIds.length > 0) {
    tasks.push({
      id: "task-live-review-plan",
      title: "Review the final enrollment plan",
      action: "Check each source-backed step before relying on the plan.",
      detail: "This summary waits for every earlier plan step.",
      evidenceIds: [
        ...new Set(tasks.flatMap((task) => task.evidenceIds)),
      ],
      procedureIds: [],
      dependency:
        prerequisiteIds.length === 1
          ? { type: "task", taskId: prerequisiteIds[0] }
          : {
              type: "allOf",
              items: prerequisiteIds.map((taskId) => ({
                type: "task",
                taskId,
              })),
            },
    });
  }

  return tasks;
}

export function deriveLiveCase(caseData: FirstDayCase): FirstDayCase {
  if (caseData.mode !== "live") return caseData;
  const withConflicts = {
    ...caseData,
    conflicts: detectConflicts(caseData),
  };
  const tasks = buildLiveTasks(withConflicts, withConflicts.procedures);
  const conflicts = withConflicts.conflicts.map((conflict) => ({
    ...conflict,
    relatedTaskIds: [
      `task-live-clarify-${stableSuffix(conflict.semanticKey)}`,
    ],
  }));
  return { ...withConflicts, conflicts, tasks };
}
