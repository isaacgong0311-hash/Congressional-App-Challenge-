export type ConfirmationState =
  | "proposed"
  | "confirmed"
  | "unclear"
  | "conflicted"
  | "superseded";

export type PlanState =
  | "ready"
  | "needs_clarification"
  | "waiting"
  | "done"
  | "needs_review";

export type DocumentStatus = "ready" | "processing" | "error" | "removed";

export type FactKind =
  | "date"
  | "location"
  | "requested_item"
  | "contact"
  | "preference"
  | "appointment";

export type FirstDayDocument = {
  id: string;
  label: string;
  pageIndex: number;
  status: DocumentStatus;
  extractedText: string;
  sourceVersion: string;
};

export type Evidence = {
  id: string;
  documentId?: string;
  procedureId?: string;
  quote: string;
  location: string;
};

export type Fact = {
  id: string;
  kind: FactKind;
  label: string;
  originalValue: string;
  normalizedValue?: string;
  evidenceIds: string[];
  confirmationState: ConfirmationState;
};

export type Procedure = {
  id: string;
  district: string;
  sourceUrl: string | null;
  sourceSection: string;
  quote: string;
  checkedAt: string;
  reviewerStatus: "fictional" | "reviewed" | "pending";
  ruleVersion: string;
};

export type Dependency =
  | { type: "fact"; factId: string }
  | { type: "task"; taskId: string }
  | { type: "allOf"; items: Dependency[] }
  | { type: "anyOf"; items: Dependency[] };

export type PlanTask = {
  id: string;
  title: string;
  action: string;
  detail: string;
  evidenceIds: string[];
  procedureIds: string[];
  dependency: Dependency;
  targetDateFactId?: string;
};

export type Conflict = {
  id: string;
  label: string;
  factIds: string[];
  relatedTaskIds: string[];
  status: "open" | "resolved";
  resolutionEventId?: string;
};

export type CaseEvent =
  | {
      id: string;
      type: "fact_confirmed";
      factId: string;
      timestamp: string;
    }
  | {
      id: string;
      type: "fact_corrected";
      factId: string;
      value: string;
      timestamp: string;
    }
  | {
      id: string;
      type: "task_completed";
      taskId: string;
      timestamp: string;
    }
  | {
      id: string;
      type: "source_removed";
      documentId: string;
      timestamp: string;
    };

export type FirstDayCase = {
  id: string;
  mode: "fictional" | "live";
  language: "English" | "Español";
  district: string;
  childFirstName: string;
  ruleVersion: string;
  documents: FirstDayDocument[];
  evidence: Evidence[];
  facts: Fact[];
  procedures: Procedure[];
  tasks: PlanTask[];
  conflicts: Conflict[];
  events: CaseEvent[];
};

export type DerivedTask = PlanTask & {
  state: PlanState;
  reason: string;
};

export type PlannerError = {
  code: "missing_reference" | "dependency_cycle";
  taskId: string;
  message: string;
};

export type PlannerResult = {
  tasks: DerivedTask[];
  errors: PlannerError[];
};
