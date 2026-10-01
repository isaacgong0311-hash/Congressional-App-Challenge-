import type {
  ConfirmationState,
  Dependency,
  FirstDayCase,
  PlannerResult,
  PlanState,
  SchoolConfirmationEvent,
} from "./types";

export type DecisionTraceNodeKind =
  | "task"
  | "dependency"
  | "decision"
  | "fact"
  | "evidence"
  | "document"
  | "procedure"
  | "warning";

export type DecisionTraceNode = {
  id: string;
  kind: DecisionTraceNodeKind;
  label: string;
  detail: string;
  state?: ConfirmationState | PlanState;
  sourceId?: string;
};

export type DecisionTraceEdge = {
  id: string;
  from: string;
  to: string;
  relation:
    | "evaluates"
    | "contains"
    | "depends_on"
    | "decides"
    | "supports"
    | "quoted_from"
    | "governed_by"
    | "warns";
};

export type DecisionTrace = {
  taskId: string;
  title: string;
  state: PlanState;
  reason: string;
  nodes: DecisionTraceNode[];
  edges: DecisionTraceEdge[];
  warnings: string[];
};

type EffectiveFact = {
  state: ConfirmationState;
  value: string;
};

function effectiveFacts(caseData: FirstDayCase) {
  const facts = new Map<string, EffectiveFact>(
    caseData.facts.map((fact) => [
      fact.id,
      { state: fact.confirmationState, value: fact.originalValue },
    ]),
  );
  const resolvedFactIndex = new Map<string, number>();

  caseData.events.forEach((event, index) => {
    const current =
      "factId" in event ? facts.get(event.factId) : undefined;
    if (event.type === "fact_confirmed" && current) {
      facts.set(event.factId, { ...current, state: "confirmed" });
    }
    if (event.type === "fact_corrected" && current) {
      facts.set(event.factId, { state: "confirmed", value: event.value });
    }
    if (event.type === "fact_marked_unclear" && current) {
      facts.set(event.factId, { ...current, state: "unclear" });
    }
    if (event.type === "school_confirmation_recorded") {
      const conflict = caseData.conflicts.find(
        (item) => item.id === event.conflictId,
      );
      if (!conflict) return;
      for (const factId of conflict.factIds) {
        const fact = facts.get(factId);
        if (!fact) continue;
        facts.set(
          factId,
          factId === event.selectedFactId
            ? { state: "confirmed", value: event.reportedValue }
            : { ...fact, state: "superseded" },
        );
      }
      resolvedFactIndex.set(event.selectedFactId, index);
    }
  });

  for (const conflict of caseData.conflicts) {
    const selectedFactId = conflict.factIds
      .filter((factId) => resolvedFactIndex.has(factId))
      .sort(
        (left, right) =>
          (resolvedFactIndex.get(right) ?? -1) -
          (resolvedFactIndex.get(left) ?? -1),
      )[0];
    for (const factId of conflict.factIds) {
      const fact = facts.get(factId);
      if (!fact) continue;
      if (selectedFactId) {
        facts.set(factId, {
          ...fact,
          state: factId === selectedFactId ? "confirmed" : "superseded",
        });
      } else if (conflict.status === "open") {
        facts.set(factId, { ...fact, state: "conflicted" });
      }
    }
  }

  return facts;
}

function latestTaskDecision(
  caseData: FirstDayCase,
  taskId: string,
): SchoolConfirmationEvent | undefined {
  const conflictIds = new Set(
    caseData.conflicts
      .filter((conflict) => conflict.relatedTaskIds.includes(taskId))
      .map((conflict) => conflict.id),
  );
  return [...caseData.events]
    .reverse()
    .find(
      (event): event is SchoolConfirmationEvent =>
        event.type === "school_confirmation_recorded" &&
        conflictIds.has(event.conflictId),
    );
}

export function buildDecisionTrace(
  caseData: FirstDayCase,
  plan: PlannerResult,
  taskId: string,
): DecisionTrace {
  const task = caseData.tasks.find((item) => item.id === taskId);
  const derived = plan.tasks.find((item) => item.id === taskId);
  if (!task || !derived) {
    throw new Error(
      `Cannot build a decision trace for missing task ${taskId}.`,
    );
  }

  const nodes: DecisionTraceNode[] = [];
  const edges: DecisionTraceEdge[] = [];
  const warnings: string[] = [];
  const nodeIds = new Set<string>();
  const edgeIds = new Set<string>();
  const factsById = new Map(caseData.facts.map((fact) => [fact.id, fact]));
  const evidenceById = new Map(
    caseData.evidence.map((evidence) => [evidence.id, evidence]),
  );
  const documentsById = new Map(
    caseData.documents.map((document) => [document.id, document]),
  );
  const proceduresById = new Map(
    caseData.procedures.map((procedure) => [procedure.id, procedure]),
  );
  const tasksById = new Map(caseData.tasks.map((item) => [item.id, item]));
  const factViews = effectiveFacts(caseData);
  const taskNodeId = `task:${task.id}`;

  function addNode(node: DecisionTraceNode) {
    if (nodeIds.has(node.id)) return;
    nodeIds.add(node.id);
    nodes.push(node);
  }

  function addEdge(
    from: string,
    relation: DecisionTraceEdge["relation"],
    to: string,
  ) {
    const id = `${from}:${relation}:${to}`;
    if (edgeIds.has(id)) return;
    edgeIds.add(id);
    edges.push({ id, from, to, relation });
  }

  function addWarning(message: string, ownerId = taskNodeId) {
    if (warnings.includes(message)) return;
    warnings.push(message);
    const id = `warning:${message}`;
    addNode({ id, kind: "warning", label: "Missing reference", detail: message });
    addEdge(id, "warns", ownerId);
  }

  function addDocument(documentId: string, evidenceNodeId: string) {
    const document = documentsById.get(documentId);
    if (!document) {
      addWarning(`Missing document: ${documentId}`, evidenceNodeId);
      return;
    }
    const id = `document:${document.id}`;
    addNode({
      id,
      kind: "document",
      label: document.label,
      detail: `Page ${document.pageIndex} · ${document.sourceVersion}`,
      sourceId: document.id,
    });
    addEdge(evidenceNodeId, "quoted_from", id);
  }

  function addProcedure(procedureId: string, ownerId: string) {
    const procedure = proceduresById.get(procedureId);
    if (!procedure) {
      addWarning(`Missing procedure: ${procedureId}`, ownerId);
      return;
    }
    const id = `procedure:${procedure.id}`;
    addNode({
      id,
      kind: "procedure",
      label: procedure.sourceSection,
      detail: procedure.quote,
      sourceId: procedure.id,
    });
    addEdge(ownerId, "governed_by", id);
  }

  function addEvidence(evidenceId: string, ownerId: string) {
    const evidence = evidenceById.get(evidenceId);
    if (!evidence) {
      addWarning(`Missing evidence: ${evidenceId}`, ownerId);
      return;
    }
    const id = `evidence:${evidence.id}`;
    addNode({
      id,
      kind: "evidence",
      label: evidence.location,
      detail: evidence.quote,
      sourceId: evidence.id,
    });
    addEdge(ownerId, "supports", id);
    if (evidence.documentId) addDocument(evidence.documentId, id);
    if (evidence.procedureId) addProcedure(evidence.procedureId, id);
  }

  function addFact(factId: string, dependencyNodeId: string) {
    const fact = factsById.get(factId);
    if (!fact) {
      addWarning(`Missing fact: ${factId}`, dependencyNodeId);
      return;
    }
    const id = `fact:${fact.id}`;
    const view = factViews.get(fact.id) ?? {
      state: fact.confirmationState,
      value: fact.originalValue,
    };
    addNode({
      id,
      kind: "fact",
      label: fact.label,
      detail: view.value,
      state: view.state,
      sourceId: fact.id,
    });
    addEdge(dependencyNodeId, "depends_on", id);
    for (const evidenceId of fact.evidenceIds) addEvidence(evidenceId, id);
  }

  function addDependency(
    dependency: Dependency,
    path: string,
    parentId: string,
  ) {
    const id = `dependency:${task.id}:${path}`;
    const label =
      dependency.type === "allOf"
        ? "All requirements"
        : dependency.type === "anyOf"
          ? "Any requirement"
          : dependency.type === "fact"
            ? "Fact requirement"
            : "Task requirement";
    const detail =
      dependency.type === "allOf"
        ? "Every child requirement must be satisfied."
        : dependency.type === "anyOf"
          ? "At least one child requirement must be satisfied."
          : dependency.type === "fact"
            ? dependency.factId
            : dependency.taskId;
    addNode({ id, kind: "dependency", label, detail, sourceId: path });
    addEdge(parentId, path === "root" ? "evaluates" : "contains", id);

    if (dependency.type === "fact") {
      addFact(dependency.factId, id);
      return;
    }
    if (dependency.type === "task") {
      const requiredTask = tasksById.get(dependency.taskId);
      if (!requiredTask) {
        addWarning(`Missing task: ${dependency.taskId}`, id);
        return;
      }
      const requiredId = `task:${requiredTask.id}`;
      const requiredDerived = plan.tasks.find(
        (item) => item.id === requiredTask.id,
      );
      addNode({
        id: requiredId,
        kind: "task",
        label: requiredTask.title,
        detail: requiredDerived?.reason ?? requiredTask.detail,
        state: requiredDerived?.state,
        sourceId: requiredTask.id,
      });
      addEdge(id, "depends_on", requiredId);
      return;
    }
    dependency.items.forEach((item, index) =>
      addDependency(item, `${path}.${index}`, id),
    );
  }

  addNode({
    id: taskNodeId,
    kind: "task",
    label: task.title,
    detail: derived.reason,
    state: derived.state,
    sourceId: task.id,
  });

  const decision = latestTaskDecision(caseData, task.id);
  if (decision) {
    const id = `decision:${decision.id}`;
    addNode({
      id,
      kind: "decision",
      label: "School confirmation recorded",
      detail: decision.reportedValue,
      sourceId: decision.id,
    });
    addEdge(id, "decides", `fact:${decision.selectedFactId}`);
  }

  addDependency(task.dependency, "root", taskNodeId);
  for (const evidenceId of task.evidenceIds) addEvidence(evidenceId, taskNodeId);
  for (const procedureId of task.procedureIds) {
    addProcedure(procedureId, taskNodeId);
  }

  return {
    taskId: task.id,
    title: task.title,
    state: derived.state,
    reason: derived.reason,
    nodes,
    edges,
    warnings,
  };
}
