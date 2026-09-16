import type { FirstDayCase } from "./types";

export type EvidenceIssue = {
  code: "missing_document" | "quote_not_found" | "missing_evidence";
  evidenceId: string;
  message: string;
};

function normalizeSourceText(value: string): string {
  return value
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t\n]+/g, " ")
    .trim();
}

export function validateEvidence(caseData: FirstDayCase): EvidenceIssue[] {
  const issues: EvidenceIssue[] = [];
  const documents = new Map(
    caseData.documents.map((document) => [document.id, document]),
  );
  const procedures = new Map(
    caseData.procedures.map((procedure) => [procedure.id, procedure]),
  );
  const evidenceIds = new Set(caseData.evidence.map((evidence) => evidence.id));

  for (const evidence of caseData.evidence) {
    let sourceText: string | undefined;

    if (evidence.documentId) {
      const document = documents.get(evidence.documentId);
      if (!document) {
        issues.push({
          code: "missing_document",
          evidenceId: evidence.id,
          message: `Evidence ${evidence.id} refers to missing document ${evidence.documentId}.`,
        });
        continue;
      }
      sourceText = document.extractedText;
    } else if (evidence.procedureId) {
      const procedure = procedures.get(evidence.procedureId);
      if (!procedure) {
        issues.push({
          code: "missing_evidence",
          evidenceId: evidence.id,
          message: `Evidence ${evidence.id} refers to missing procedure ${evidence.procedureId}.`,
        });
        continue;
      }
      sourceText = procedure.quote;
    } else {
      issues.push({
        code: "missing_evidence",
        evidenceId: evidence.id,
        message: `Evidence ${evidence.id} has no document or procedure source.`,
      });
      continue;
    }

    if (
      !normalizeSourceText(sourceText).includes(
        normalizeSourceText(evidence.quote),
      )
    ) {
      issues.push({
        code: "quote_not_found",
        evidenceId: evidence.id,
        message: `The quote for ${evidence.id} does not appear in its linked source.`,
      });
    }
  }

  const references = [
    ...caseData.facts.flatMap((fact) =>
      fact.evidenceIds.map((evidenceId) => ({
        evidenceId,
        owner: `fact ${fact.id}`,
      })),
    ),
    ...caseData.tasks.flatMap((task) =>
      task.evidenceIds.map((evidenceId) => ({
        evidenceId,
        owner: `task ${task.id}`,
      })),
    ),
  ];

  for (const reference of references) {
    if (!evidenceIds.has(reference.evidenceId)) {
      issues.push({
        code: "missing_evidence",
        evidenceId: reference.evidenceId,
        message: `${reference.owner} refers to missing evidence ${reference.evidenceId}.`,
      });
    }
  }

  return issues;
}
