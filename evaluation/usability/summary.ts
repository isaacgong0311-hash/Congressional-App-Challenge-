import { z } from "zod";

export const USABILITY_TASK_IDS = [
  "identify_enrollment",
  "identify_preparation",
  "detect_orientation_conflict",
  "find_source",
  "explain_unresolved",
  "choose_next_action",
] as const;

export const CONFUSION_CODES = [
  "navigation",
  "source_provenance",
  "status_language",
  "conflict_resolution",
  "decision_trace",
  "export",
  "none",
] as const;

const taskResultSchema = z
  .object({
    taskId: z.enum(USABILITY_TASK_IDS),
    outcome: z.enum(["success", "partial", "not_completed"]),
    timeSeconds: z.number().int().min(1).max(1800),
  })
  .strict();

const sessionSchema = z
  .object({
    participantId: z.string().regex(/^U\d{2}$/, "Use an anonymous ID U01–U99."),
    studyVersion: z.literal("lantern-usability-v1"),
    interfaceLanguage: z.enum(["English", "Español"]),
    adultConfirmed: z.literal(true),
    consentConfirmed: z.literal(true),
    tasks: z.array(taskResultSchema).length(USABILITY_TASK_IDS.length),
    unsupportedConclusionCount: z.number().int().min(0).max(100),
    confidenceBefore: z.number().int().min(1).max(5),
    confidenceAfter: z.number().int().min(1).max(5),
    confusionCodes: z.array(z.enum(CONFUSION_CODES)).min(1),
    suggestionSummary: z.string().trim().min(1).max(240),
  })
  .strict()
  .superRefine((session, context) => {
    const taskIds = session.tasks.map((task) => task.taskId);
    if (
      new Set(taskIds).size !== USABILITY_TASK_IDS.length ||
      USABILITY_TASK_IDS.some((taskId) => !taskIds.includes(taskId))
    ) {
      context.addIssue({
        code: "custom",
        path: ["tasks"],
        message: "Each session must contain each required task exactly once.",
      });
    }
    if (
      session.confusionCodes.includes("none") &&
      session.confusionCodes.length > 1
    ) {
      context.addIssue({
        code: "custom",
        path: ["confusionCodes"],
        message: "None cannot be combined with another confusion code.",
      });
    }
    if (new Set(session.confusionCodes).size !== session.confusionCodes.length) {
      context.addIssue({
        code: "custom",
        path: ["confusionCodes"],
        message: "Confusion codes must be unique within a session.",
      });
    }
  });

const datasetSchema = z
  .object({
    studyStatus: z.enum(["not_started", "in_progress", "complete"]),
    sessions: z.array(sessionSchema).max(99),
  })
  .strict()
  .superRefine((dataset, context) => {
    if (dataset.studyStatus === "not_started" && dataset.sessions.length !== 0) {
      context.addIssue({
        code: "custom",
        path: ["sessions"],
        message: "A not-started study must contain zero sessions.",
      });
    }
    if (
      dataset.studyStatus === "in_progress" &&
      (dataset.sessions.length < 1 || dataset.sessions.length > 4)
    ) {
      context.addIssue({
        code: "custom",
        path: ["sessions"],
        message: "An in-progress study must contain 1–4 sessions.",
      });
    }
    if (dataset.studyStatus === "complete" && dataset.sessions.length < 5) {
      context.addIssue({
        code: "custom",
        path: ["sessions"],
        message: "A complete study requires at least 5 sessions.",
      });
    }
    const participantIds = dataset.sessions.map(
      (session) => session.participantId,
    );
    if (new Set(participantIds).size !== participantIds.length) {
      context.addIssue({
        code: "custom",
        path: ["sessions"],
        message: "Participant IDs must be unique.",
      });
    }
  });

export type UsabilityDataset = z.infer<typeof datasetSchema>;
export type UsabilitySession = z.infer<typeof sessionSchema>;

export function parseUsabilityDataset(input: unknown): UsabilityDataset {
  return datasetSchema.parse(input);
}

const TASK_LABELS: Record<(typeof USABILITY_TASK_IDS)[number], string> = {
  identify_enrollment: "Identify enrollment date and location",
  identify_preparation: "Identify supported preparation paths",
  detect_orientation_conflict: "Detect the orientation conflict",
  find_source: "Find original source passages",
  explain_unresolved: "Explain what remains unresolved",
  choose_next_action: "Choose and explain the next action",
};

const CONFUSION_LABELS: Record<(typeof CONFUSION_CODES)[number], string> = {
  navigation: "Navigation",
  source_provenance: "Source provenance",
  status_language: "Status language",
  conflict_resolution: "Conflict resolution",
  decision_trace: "Decision Trace",
  export: "Final plan and export",
  none: "No major confusion",
};

function mean(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function oneDecimal(value: number) {
  return value.toFixed(1);
}

function ratio(numerator: number, denominator: number) {
  return `${numerator}/${denominator} (${oneDecimal((numerator / denominator) * 100)}%)`;
}

function statusLine(dataset: UsabilityDataset) {
  if (dataset.studyStatus === "not_started") return "**Status: Not started**";
  if (dataset.studyStatus === "in_progress") {
    const count = dataset.sessions.length;
    return `**Status: Preliminary — study in progress (${count} session${count === 1 ? "" : "s"})**`;
  }
  return `**Status: Complete — ${dataset.sessions.length} sessions**`;
}

export function summarizeUsabilityStudy(input: unknown): string {
  const dataset = parseUsabilityDataset(input);
  const lines = [
    "# Lantern usability validation",
    "",
    statusLine(dataset),
    "",
    "This report is generated from anonymous structured observations collected with the fictional Mesa View case. No real school documents or personal records belong in this dataset.",
    "",
  ];

  if (dataset.sessions.length === 0) {
    lines.push(
      "No participant sessions have been recorded.",
      "",
      "This protocol must not be described as a completed user study.",
      "",
      "See `protocol.md` for the adult-only consent process, moderator script, six task definitions, scoring rules, and privacy boundary.",
      "",
      "## Limitations",
      "",
      "There are no observed usability findings yet. The prepared protocol does not establish comprehension, confidence, accessibility, or real-world impact.",
      "",
    );
    return lines.join("\n");
  }

  const sessions = dataset.sessions;
  const totalAttempts = sessions.length * USABILITY_TASK_IDS.length;
  const successfulAttempts = sessions.flatMap((session) => session.tasks).filter(
    (task) => task.outcome === "success",
  ).length;
  const unsupportedConclusions = sessions.reduce(
    (sum, session) => sum + session.unsupportedConclusionCount,
    0,
  );
  const totalTimes = sessions.map((session) =>
    session.tasks.reduce((sum, task) => sum + task.timeSeconds, 0),
  );
  const confidenceBefore = mean(
    sessions.map((session) => session.confidenceBefore),
  );
  const confidenceAfter = mean(
    sessions.map((session) => session.confidenceAfter),
  );
  const confidenceChange = confidenceAfter - confidenceBefore;

  lines.push(
    "## Method",
    "",
    `- Participants: ${sessions.length} consenting adult${sessions.length === 1 ? "" : "s"}`,
    "- Material: fictional Mesa View documents only",
    "- Tasks per participant: 6",
    `- Total task attempts: ${totalAttempts}`,
    "- Guided demo: not used",
    "",
    "## Task results",
    "",
    "| Measure | Result |",
    "| --- | --- |",
    `| Successful task attempts | ${ratio(successfulAttempts, totalAttempts)} |`,
  );

  for (const taskId of USABILITY_TASK_IDS) {
    const successes = sessions.filter(
      (session) =>
        session.tasks.find((task) => task.taskId === taskId)?.outcome ===
        "success",
    ).length;
    lines.push(`| ${TASK_LABELS[taskId]} | ${ratio(successes, sessions.length)} |`);
  }

  lines.push(
    "",
    "## Safety and confidence",
    "",
    "| Measure | Result |",
    "| --- | --- |",
    `| Unsupported conclusions | ${unsupportedConclusions} total |`,
    `| Mean total session time | ${oneDecimal(mean(totalTimes))} seconds |`,
    `| Mean confidence before | ${oneDecimal(confidenceBefore)}/5 |`,
    `| Mean confidence after | ${oneDecimal(confidenceAfter)}/5 |`,
    `| Mean confidence change | ${confidenceChange >= 0 ? "+" : ""}${oneDecimal(confidenceChange)} points |`,
    "",
    "## Coded confusion",
    "",
    "| Code | Sessions |",
    "| --- | ---: |",
  );

  for (const code of CONFUSION_CODES) {
    const count = sessions.filter((session) =>
      session.confusionCodes.includes(code),
    ).length;
    lines.push(`| ${CONFUSION_LABELS[code]} | ${count}/${sessions.length} |`);
  }

  lines.push("", "## Anonymous improvement suggestions", "");
  for (const session of sessions) {
    lines.push(`- ${session.participantId}: ${session.suggestionSummary}`);
  }

  const partialCount = sessions.flatMap((session) => session.tasks).filter(
    (task) => task.outcome === "partial",
  ).length;
  const incompleteCount = sessions.flatMap((session) => session.tasks).filter(
    (task) => task.outcome === "not_completed",
  ).length;

  lines.push(
    "",
    "## Failures and limitations",
    "",
    `- Partial task outcomes: ${partialCount}/${totalAttempts}`,
    `- Not-completed task outcomes: ${incompleteCount}/${totalAttempts}`,
    "- This small convenience sample used fictional documents and a single product scenario.",
    "- Confidence ratings are self-reported and do not measure actual enrollment success.",
    "- Observed behavior does not establish impact on real enrollment outcomes.",
    "- This protocol does not replace evaluation with real accessibility-tool users or affected communities.",
    "",
  );

  return lines.join("\n");
}
