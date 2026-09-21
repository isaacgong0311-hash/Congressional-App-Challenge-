import type {
  CaseEvent,
  DerivedTask,
  FirstDayCase,
  PlannerResult,
} from "../domain/types";

export type TaskFilter = "all" | "attention" | "ready" | "done";
export type PresentationMode = "standard" | "guided_demo";

export function presentationModeFromDemoParam(
  value: string | string[] | undefined,
): PresentationMode {
  return value === "1" ? "guided_demo" : "standard";
}

export type CaseSnapshotView = {
  documentCount: number;
  processedDocumentCount: number;
  pendingFactCount: number;
  openConflictCount: number;
  readyTaskCount: number;
  waitingTaskCount: number;
  completedTaskCount: number;
};

const TASK_PRIORITY: Record<DerivedTask["state"], number> = {
  needs_clarification: 0,
  ready: 1,
  needs_review: 2,
  waiting: 3,
  done: 4,
};

export function prioritizedPlanTasks(tasks: DerivedTask[]): DerivedTask[] {
  return [...tasks].sort(
    (left, right) => TASK_PRIORITY[left.state] - TASK_PRIORITY[right.state],
  );
}

export function filterPlanTasks(
  tasks: DerivedTask[],
  filter: TaskFilter,
): DerivedTask[] {
  const ordered = prioritizedPlanTasks(tasks);
  if (filter === "all") return ordered;
  if (filter === "attention") {
    return ordered.filter(
      (task) =>
        task.state === "needs_clarification" || task.state === "needs_review",
    );
  }
  return ordered.filter((task) => task.state === filter);
}

export function caseSnapshot(
  caseData: FirstDayCase,
  plan: PlannerResult,
): CaseSnapshotView {
  const activeDocuments = caseData.documents.filter(
    (document) => document.status !== "removed",
  );
  return {
    documentCount: activeDocuments.length,
    processedDocumentCount: activeDocuments.filter(
      (document) => document.status === "ready",
    ).length,
    pendingFactCount: caseData.facts.filter((fact) => {
      if (fact.confirmationState !== "proposed") return false;
      return !caseData.events.some(
        (event) =>
          (event.type === "fact_confirmed" ||
            event.type === "fact_corrected" ||
            event.type === "fact_marked_unclear") &&
          event.factId === fact.id,
      );
    }).length,
    openConflictCount: caseData.conflicts.filter(
      (conflict) => conflict.status === "open",
    ).length,
    readyTaskCount: plan.tasks.filter((task) => task.state === "ready").length,
    waitingTaskCount: plan.tasks.filter((task) => task.state === "waiting")
      .length,
    completedTaskCount: plan.tasks.filter((task) => task.state === "done").length,
  };
}

export function activeTaskCompletionEvent(
  caseData: FirstDayCase,
  taskId: string,
): Extract<CaseEvent, { type: "task_completed" }> | undefined {
  let active: Extract<CaseEvent, { type: "task_completed" }> | undefined;
  for (const event of caseData.events) {
    if (event.type === "task_completed" && event.taskId === taskId) {
      active = event;
    }
    if (
      event.type === "task_completion_reverted" &&
      event.taskId === taskId &&
      active?.id === event.completionEventId
    ) {
      active = undefined;
    }
  }
  return active;
}
