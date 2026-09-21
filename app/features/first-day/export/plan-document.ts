import type {
  CaseEvent,
  ConfirmationState,
  Fact,
  FirstDayCase,
  PlannerResult,
  PlanState,
  ProcedureReviewState,
} from "../domain/types";

export type PortablePlan = {
  schemaVersion: "lantern-plan-v1";
  generatedAt: string;
  caseMode: FirstDayCase["mode"];
  district: string;
  language: FirstDayCase["language"];
  events: CaseEvent[];
  tasks: Array<{
    id: string;
    title: string;
    state: PlanState;
    reason: string;
    evidenceIds: string[];
    procedureIds: string[];
  }>;
  confirmedFacts: Array<{
    id: string;
    label: string;
    value: string;
    evidenceIds: string[];
  }>;
  unresolved: Array<{ id: string; label: string; factIds: string[] }>;
  procedures: Array<{
    id: string;
    ruleVersion: string;
    reviewerStatus: ProcedureReviewState;
    checkedAt: string;
  }>;
};

export type EffectiveConfirmedFact = {
  fact: Fact;
  value: string;
  normalizedValue?: string;
};

type EffectiveFactState = {
  state: ConfirmationState;
  value: string;
  normalizedValue?: string;
};

function correctionDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}(?:$|T)/.test(value) ? value : undefined;
}

export function effectiveConfirmedFacts(
  caseData: FirstDayCase,
): EffectiveConfirmedFact[] {
  const effective = new Map<string, EffectiveFactState>(
    caseData.facts.map((fact) => [
      fact.id,
      {
        state: fact.confirmationState,
        value: fact.originalValue,
        ...(fact.normalizedValue
          ? { normalizedValue: fact.normalizedValue }
          : {}),
      },
    ]),
  );
  const removedDocumentIds = new Set<string>();

  for (const event of caseData.events) {
    if (event.type === "source_removed") {
      removedDocumentIds.add(event.documentId);
    }
    if (event.type === "fact_confirmed") {
      const current = effective.get(event.factId);
      if (current) effective.set(event.factId, { ...current, state: "confirmed" });
    }
    if (event.type === "fact_corrected") {
      const current = effective.get(event.factId);
      if (current) {
        const normalizedValue = correctionDate(event.value);
        effective.set(event.factId, {
          state: "confirmed",
          value: event.value,
          ...(normalizedValue ? { normalizedValue } : {}),
        });
      }
    }
    if (event.type === "fact_marked_unclear") {
      const current = effective.get(event.factId);
      if (current) effective.set(event.factId, { ...current, state: "unclear" });
    }
    if (event.type === "school_confirmation_recorded") {
      const conflict = caseData.conflicts.find(
        (item) => item.id === event.conflictId,
      );
      for (const factId of conflict?.factIds ?? []) {
        const current = effective.get(factId);
        if (!current) continue;
        if (factId === event.selectedFactId) {
          const normalizedValue = correctionDate(event.reportedValue);
          effective.set(factId, {
            state: "confirmed",
            value: event.reportedValue,
            ...(normalizedValue ? { normalizedValue } : {}),
          });
        } else {
          effective.set(factId, { ...current, state: "superseded" });
        }
      }
    }
  }

  for (const conflict of caseData.conflicts) {
    if (conflict.status !== "open") continue;
    for (const factId of conflict.factIds) {
      const current = effective.get(factId);
      if (current) effective.set(factId, { ...current, state: "conflicted" });
    }
  }

  const evidenceById = new Map(
    caseData.evidence.map((evidence) => [evidence.id, evidence]),
  );
  return caseData.facts.flatMap((fact) => {
    const current = effective.get(fact.id);
    if (current?.state !== "confirmed") return [];
    const hasActiveEvidence = fact.evidenceIds.some((evidenceId) => {
      const evidence = evidenceById.get(evidenceId);
      return (
        Boolean(evidence?.procedureId) ||
        Boolean(
          evidence?.documentId &&
            !removedDocumentIds.has(evidence.documentId),
        )
      );
    });
    if (!hasActiveEvidence) return [];
    return [
      {
        fact,
        value: current.value,
        ...(current.normalizedValue
          ? { normalizedValue: current.normalizedValue }
          : {}),
      },
    ];
  });
}

export function createPortablePlan(
  caseData: FirstDayCase,
  plan: PlannerResult,
  generatedAt: string,
): PortablePlan {
  return {
    schemaVersion: "lantern-plan-v1",
    generatedAt,
    caseMode: caseData.mode,
    district: caseData.district,
    language: caseData.language,
    events: structuredClone(caseData.events),
    tasks: plan.tasks.map((task) => ({
      id: task.id,
      title: task.title,
      state: task.state,
      reason: task.reason,
      evidenceIds: [...task.evidenceIds],
      procedureIds: [...task.procedureIds],
    })),
    confirmedFacts: effectiveConfirmedFacts(caseData).map(({ fact, value }) => ({
      id: fact.id,
      label: fact.label,
      value,
      evidenceIds: [...fact.evidenceIds],
    })),
    unresolved: caseData.conflicts
      .filter((conflict) => conflict.status === "open")
      .map((conflict) => ({
        id: conflict.id,
        label: conflict.label,
        factIds: [...conflict.factIds],
      })),
    procedures: caseData.procedures.map((procedure) => ({
      id: procedure.id,
      ruleVersion: procedure.ruleVersion,
      reviewerStatus: procedure.reviewerStatus,
      checkedAt: procedure.checkedAt,
    })),
  };
}
