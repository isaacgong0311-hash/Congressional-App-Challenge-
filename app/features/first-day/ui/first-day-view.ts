import type {
  CaseEvent,
  DerivedTask,
  FirstDayCase,
  PlannerResult,
} from "../domain/types";
import { caseReadiness } from "../domain/readiness";

export type TaskFilter = "all" | "attention" | "ready" | "done";
export type PresentationMode = "standard" | "guided_demo";

export function presentationModeFromDemoParam(
  demo: string | string[] | undefined,
  present: string | string[] | undefined,
): PresentationMode {
  return demo === "1" && present === "1" ? "guided_demo" : "standard";
}

export type CaseSnapshotView = {
  documentCount: number;
  processedDocumentCount: number;
  pendingFactCount: number;
  unclearFactCount: number;
  openConflictCount: number;
  unresolvedCount: number;
  attentionTaskCount: number;
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
  const readiness = caseReadiness(caseData, plan);
  return {
    documentCount: activeDocuments.length,
    processedDocumentCount: activeDocuments.filter(
      (document) => document.status === "ready",
    ).length,
    pendingFactCount: readiness.pendingFactCount,
    unclearFactCount: readiness.unclearFactCount,
    openConflictCount: readiness.openConflictCount,
    unresolvedCount: readiness.unresolvedCount,
    attentionTaskCount: readiness.attentionTaskCount,
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
