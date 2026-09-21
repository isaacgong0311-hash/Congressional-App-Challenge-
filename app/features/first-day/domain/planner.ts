import type {
  ConfirmationState,
  Dependency,
  DerivedTask,
  FirstDayCase,
  PlannerError,
  PlannerResult,
  PlanState,
} from "./types";
import { procedureEligibility } from "./procedures";

type DependencyState = "satisfied" | "clarify" | "waiting" | "review";

type EffectiveFact = {
  state: ConfirmationState;
  value: string;
};

const STATE_REASON: Record<PlanState, string> = {
  ready: "Every required fact is confirmed.",
  needs_clarification:
    "One or more instructions are unclear or conflict with another source.",
  waiting: "A required fact or earlier task is not confirmed yet.",
  done: "Marked complete in this session.",
  needs_review:
    "A supporting source changed or was removed. Review this task before relying on it.",
};

const PROCEDURE_REVIEW_REASON =
  "A supporting procedure needs review before this step can be relied on.";

export function planCase(
  caseData: FirstDayCase,
  today = new Date().toISOString().slice(0, 10),
): PlannerResult {
  const tasksById = new Map(caseData.tasks.map((task) => [task.id, task]));
  const factsById = new Map(caseData.facts.map((fact) => [fact.id, fact]));
  const evidenceById = new Map(
    caseData.evidence.map((evidence) => [evidence.id, evidence]),
  );
  const effectiveFacts = new Map<string, EffectiveFact>(
    caseData.facts.map((fact) => [
      fact.id,
      { state: fact.confirmationState, value: fact.originalValue },
    ]),
  );
  const activeCompletionByTask = new Map<string, string>();
  const removedDocuments = new Set<string>();
  const resolutionEventIndex = new Map<string, number>();

  caseData.events.forEach((event, index) => {
    if (event.type === "task_completed") {
      activeCompletionByTask.set(event.taskId, event.id);
    }
    if (
      event.type === "task_completion_reverted" &&
      activeCompletionByTask.get(event.taskId) === event.completionEventId
    ) {
      activeCompletionByTask.delete(event.taskId);
    }
    if (event.type === "source_removed") {
      removedDocuments.add(event.documentId);
    }
    if (event.type === "fact_confirmed") {
      const current = effectiveFacts.get(event.factId);
      if (current) effectiveFacts.set(event.factId, { ...current, state: "confirmed" });
    }
    if (event.type === "fact_corrected") {
      const current = effectiveFacts.get(event.factId);
      if (current) {
        effectiveFacts.set(event.factId, {
          state: "confirmed",
          value: event.value,
        });
      }
    }
    if (event.type === "fact_marked_unclear") {
      const current = effectiveFacts.get(event.factId);
      if (current) effectiveFacts.set(event.factId, { ...current, state: "unclear" });
    }
    if (event.type === "school_confirmation_recorded") {
      const conflict = caseData.conflicts.find(
        (item) => item.id === event.conflictId,
      );
      if (!conflict) return;
      for (const factId of conflict.factIds) {
        const current = effectiveFacts.get(factId);
        if (!current) continue;
        effectiveFacts.set(
          factId,
          factId === event.selectedFactId
            ? { state: "confirmed", value: event.reportedValue }
            : { ...current, state: "superseded" },
        );
      }
      resolutionEventIndex.set(event.selectedFactId, index);
    }
  });

  for (const conflict of caseData.conflicts) {
    const resolvedFact = conflict.factIds
      .filter((factId) => resolutionEventIndex.has(factId))
      .sort(
        (left, right) =>
          (resolutionEventIndex.get(right) ?? -1) -
          (resolutionEventIndex.get(left) ?? -1),
      )[0];

    if (!resolvedFact) {
      if (conflict.status === "open") {
        for (const factId of conflict.factIds) {
          const current = effectiveFacts.get(factId);
          if (current) {
            effectiveFacts.set(factId, { ...current, state: "conflicted" });
          }
        }
      }
      continue;
    }
    for (const factId of conflict.factIds) {
      const current = effectiveFacts.get(factId);
      if (!current) continue;
      effectiveFacts.set(factId, {
        ...current,
        state: factId === resolvedFact ? "confirmed" : "superseded",
      });
    }
  }

  const errors: PlannerError[] = [];
  const errorKeys = new Set<string>();
  const cache = new Map<string, DerivedTask>();

  function addError(error: PlannerError) {
    const key = `${error.code}:${error.taskId}:${error.message}`;
    if (errorKeys.has(key)) return;
    errorKeys.add(key);
    errors.push(error);
  }

  function evidenceWasRemoved(evidenceId: string): boolean {
    const evidence = evidenceById.get(evidenceId);
    return Boolean(
      evidence?.documentId && removedDocuments.has(evidence.documentId),
    );
  }

  function factNeedsReview(factId: string): boolean {
    const fact = factsById.get(factId);
    return Boolean(fact?.evidenceIds.some(evidenceWasRemoved));
  }

  function evaluateDependency(
    dependency: Dependency,
    ownerTaskId: string,
    trail: string[],
  ): DependencyState {
    if (dependency.type === "fact") {
      const fact = factsById.get(dependency.factId);
      if (!fact) {
        addError({
          code: "missing_reference",
          taskId: ownerTaskId,
          message: `Task ${ownerTaskId} refers to missing fact ${dependency.factId}.`,
        });
        return "waiting";
      }
      if (factNeedsReview(fact.id)) return "review";

      const state = effectiveFacts.get(fact.id)?.state ?? fact.confirmationState;
      if (state === "confirmed") return "satisfied";
      if (state === "unclear" || state === "conflicted") return "clarify";
      return "waiting";
    }

    if (dependency.type === "task") {
      if (!tasksById.has(dependency.taskId)) {
        addError({
          code: "missing_reference",
          taskId: ownerTaskId,
          message: `Task ${ownerTaskId} refers to missing task ${dependency.taskId}.`,
        });
        return "waiting";
      }
      const derived = deriveTask(dependency.taskId, trail);
      if (derived.state === "done") return "satisfied";
      if (derived.state === "needs_clarification") return "clarify";
      if (derived.state === "needs_review") return "review";
      return "waiting";
    }

    const states = dependency.items.map((item) =>
      evaluateDependency(item, ownerTaskId, trail),
    );

    if (dependency.type === "anyOf") {
      if (states.includes("satisfied")) return "satisfied";
      if (states.includes("review")) return "review";
      if (states.includes("clarify")) return "clarify";
      return "waiting";
    }

    if (states.includes("review")) return "review";
    if (states.includes("clarify")) return "clarify";
    if (states.every((state) => state === "satisfied")) return "satisfied";
    return "waiting";
  }

  function deriveTask(taskId: string, trail: string[]): DerivedTask {
    const cached = cache.get(taskId);
    if (cached) return cached;

    const task = tasksById.get(taskId);
    if (!task) {
      throw new Error(`Cannot derive missing task ${taskId}.`);
    }

    if (trail.includes(taskId)) {
      addError({
        code: "dependency_cycle",
        taskId,
        message: `Dependency cycle detected: ${[...trail, taskId].join(" → ")}.`,
      });
      return {
        ...task,
        state: "waiting",
        reason: "The planning rules contain a cycle and need review.",
      };
    }

    const nextTrail = [...trail, taskId];
    const directSourceRemoved = task.evidenceIds.some(evidenceWasRemoved);
    const procedureNeedsReview =
      caseData.mode === "live" &&
      task.procedureIds.some((procedureId) => {
        const procedure = caseData.procedures.find(
          (item) => item.id === procedureId,
        );
        return (
          !procedure || procedureEligibility(procedure, today) !== "eligible"
        );
      });
    let state: PlanState;
    let reason: string | undefined;

    if (directSourceRemoved) {
      state = "needs_review";
    } else if (procedureNeedsReview) {
      state = "needs_review";
      reason = PROCEDURE_REVIEW_REASON;
    } else if (activeCompletionByTask.has(taskId)) {
      state = "done";
    } else {
      const dependencyState = evaluateDependency(
        task.dependency,
        taskId,
        nextTrail,
      );
      state =
        dependencyState === "satisfied"
          ? "ready"
          : dependencyState === "clarify"
            ? "needs_clarification"
            : dependencyState === "review"
              ? "needs_review"
              : "waiting";
    }

    const derived = { ...task, state, reason: reason ?? STATE_REASON[state] };
    cache.set(taskId, derived);
    return derived;
  }

  return {
    tasks: caseData.tasks.map((task) => deriveTask(task.id, [])),
    errors,
  };
}
