import { factHasActiveSource } from "./evidence";
import type { FirstDayCase, PlannerResult } from "./types";

export type UnresolvedItem = {
  id: string;
  kind: "conflict" | "fact" | "task";
  label: string;
  factIds: string[];
  taskIds: string[];
};

export type CaseReadiness = {
  unresolved: UnresolvedItem[];
  unresolvedCount: number;
  pendingFactCount: number;
  unclearFactCount: number;
  openConflictCount: number;
  attentionTaskCount: number;
  waitingTaskCount: number;
  isComplete: boolean;
};

export function caseReadiness(caseData: FirstDayCase, plan: PlannerResult): CaseReadiness {
  const conflicts = caseData.conflicts.filter((conflict) => conflict.status === "open");
  const conflictedFactIds = new Set(conflicts.flatMap((conflict) => conflict.factIds));
  const facts = caseData.facts.flatMap((fact) => {
    if (conflictedFactIds.has(fact.id)) return [];
    let state = fact.confirmationState;
    for (const event of caseData.events) {
      if (event.type === "school_confirmation_recorded") {
        const conflict = caseData.conflicts.find((item) => item.id === event.conflictId);
        if (conflict?.factIds.includes(fact.id)) {
          state = event.selectedFactId === fact.id ? "confirmed" : "superseded";
        }
      } else if (
        (event.type === "fact_marked_unclear" || event.type === "fact_confirmed" || event.type === "fact_corrected") &&
        event.factId === fact.id
      ) {
        state = event.type === "fact_marked_unclear" ? "unclear" : "confirmed";
      }
    }
    return state === "proposed" || state === "unclear"
      ? [{ fact, state, hasActiveSource: factHasActiveSource(caseData, fact) }]
      : [];
  });
  const attentionTasks = plan.tasks.filter(
    (task) => task.state === "needs_clarification" || task.state === "needs_review",
  );
  const unresolved: UnresolvedItem[] = [
    ...conflicts.map((conflict) => ({
      id: conflict.id,
      kind: "conflict" as const,
      label: conflict.label,
      factIds: [...conflict.factIds],
      taskIds: [...conflict.relatedTaskIds],
    })),
    ...facts.map(({ fact }) => ({
      id: fact.id,
      kind: "fact" as const,
      label: fact.label,
      factIds: [fact.id],
      taskIds: [],
    })),
    ...attentionTasks.map((task) => ({
      id: task.id,
      kind: "task" as const,
      label: task.title,
      factIds: [],
      taskIds: [task.id],
    })),
  ];
  return {
    unresolved,
    unresolvedCount: unresolved.length,
    pendingFactCount: facts.filter(({ state, hasActiveSource }) => state === "proposed" && hasActiveSource).length,
    unclearFactCount: facts.filter(({ state }) => state === "unclear").length,
    openConflictCount: conflicts.length,
    attentionTaskCount: attentionTasks.length,
    waitingTaskCount: plan.tasks.filter((task) => task.state === "waiting").length,
    isComplete: unresolved.length === 0 && !plan.tasks.some((task) => task.state === "waiting"),
  };
}
