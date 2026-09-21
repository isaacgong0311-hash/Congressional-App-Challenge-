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
  | "appointment"
  | "informational_note";

export type ProcedureReviewState =
  | "fictional"
  | "source_checked"
  | "school_reviewed"
  | "pending";

export type FirstDayDocument = {
  id: string;
  label: string;
  pageIndex: number;
  status: DocumentStatus;
  extractedText: string;
  sourceVersion: string;
  confidence?: number;
  photoQualityNote?: string;
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
  semanticKey?: string;
  label: string;
  originalValue: string;
  normalizedValue?: string;
  confidence?: number;
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
  reviewerStatus: ProcedureReviewState;
  ruleVersion: string;
};

export type ExtractedFactProposal = {
  clientKey: string;
  kind: Exclude<FactKind, "preference">;
  semanticKey: string;
  label: string;
  originalValue: string;
  normalizedValue: string | null;
  quote: string;
  location: string;
  confidence: number;
};

export type FirstDayExtractionResponse = {
  schemaVersion: "first-day-extraction-v1";
  requestId: string;
  documentId: string;
  document: {
    label: string;
    confidence: number;
    originalText: string;
    photoQualityNote: string | null;
  };
  facts: ExtractedFactProposal[];
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
  semanticKey: string;
  label: string;
  factIds: string[];
  relatedTaskIds: string[];
  status: "open" | "resolved";
  resolutionEventId?: string;
};

export type SchoolConfirmationEvent = {
  id: string;
  type: "school_confirmation_recorded";
  conflictId: string;
  selectedFactId: string;
  reportedValue: string;
  timestamp: string;
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
      type: "fact_marked_unclear";
      factId: string;
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
      type: "task_completion_reverted";
      taskId: string;
      completionEventId: string;
      timestamp: string;
    }
  | {
      id: string;
      type: "source_removed";
      documentId: string;
      timestamp: string;
    }
  | SchoolConfirmationEvent;

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
