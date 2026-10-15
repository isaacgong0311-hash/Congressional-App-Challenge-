import { quoteAppearsInSource } from "./evidence";
import type { FirstDayCase } from "./types";

export type SourceExcerpt = {
  id: string;
  documentId: string;
  label: string;
  location: string;
  quote: string;
  topics: string;
};

export type SourceQuestionResult = {
  status: "found" | "conflict" | "not_found";
  sources: SourceExcerpt[];
  recordedSchoolAnswer?: { value: string; factId: string };
};

const STOP_WORDS = new Set([
  "a", "about", "an", "and", "are", "can", "do", "does", "for", "from", "i", "in", "is", "it", "my", "of", "on", "our", "the", "there", "to", "we", "what", "which", "who", "will", "with",
  "al", "de", "del", "el", "en", "es", "la", "las", "lo", "los", "me", "mi", "para", "por", "que", "se", "un", "una", "y",
]);

const CANONICAL: Record<string, string> = {
  cuando: "date", when: "date", fecha: "date", time: "date", hora: "date",
  appointment: "date", cita: "date",
  donde: "location", where: "location", lugar: "location", ubicacion: "location",
  orientacion: "orientation", orientation: "orientation",
  inscripcion: "enrollment", enrollment: "enrollment", registration: "enrollment", registro: "enrollment",
  interprete: "interpreter", interpreter: "interpreter", idioma: "interpreter", language: "interpreter",
  gimnasio: "gym", gym: "gym", cafeteria: "cafeteria",
  documentos: "document", documento: "document", documents: "document", document: "document",
  vacunas: "immunization", vacuna: "immunization", immunization: "immunization",
};

function tokens(value: string) {
  return new Set(
    value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .split(/[^\p{L}\p{N}]+/u)
      .filter((word) => word.length > 1 && !STOP_WORDS.has(word))
      .map((word) => CANONICAL[word] ?? word),
  );
}

export function sourceExcerpts(caseData: FirstDayCase): SourceExcerpt[] {
  const removedIds = new Set(caseData.events.filter((event) => event.type === "source_removed").map((event) => event.documentId));
  const activeDocuments = new Map(caseData.documents
    .filter((document) => document.status === "ready" && !removedIds.has(document.id))
    .map((document) => [document.id, document]));
  return caseData.evidence.flatMap((evidence) => {
    if (!evidence.documentId) return [];
    const document = activeDocuments.get(evidence.documentId);
    if (!document || !quoteAppearsInSource(document.extractedText, evidence.quote)) return [];
    const topics = caseData.facts
      .filter((fact) => fact.evidenceIds.includes(evidence.id))
      .map((fact) => `${fact.kind} ${fact.label}`)
      .join(" · ");
    return [{
      id: evidence.id,
      documentId: document.id,
      label: document.label,
      location: evidence.location,
      quote: evidence.quote,
      topics,
    }];
  });
}

export function rankSourcesLocally(question: string, sources: readonly SourceExcerpt[], limit = 3) {
  const query = tokens(question);
  if (query.size === 0) return [];
  const score = (text: string, weight: number) => {
    const words = tokens(text);
    return [...query].reduce((total, word) => total + (words.has(word) ? weight : 0), 0);
  };
  const ranked = sources.map((source, index) => {
    const coreWords = tokens(`${source.quote} ${source.topics}`);
    return {
      source,
      index,
      coreMatches: [...query].filter((word) => coreWords.has(word)).length,
      score: score(source.quote, 4) + score(source.topics, 5) + score(source.label, 1) + score(source.location, 1),
    };
  });
  const bestCoverage = Math.max(...ranked.map((item) => item.coreMatches));
  return ranked
    .filter((item) => item.score > 0 && (bestCoverage === 0 || item.coreMatches === bestCoverage))
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, limit)
    .map((item) => item.source);
}

export function answerFromSources(caseData: FirstDayCase, question: string, selectedIds: readonly string[]): SourceQuestionResult {
  const sources = sourceExcerpts(caseData);
  const byId = new Map(sources.map((source) => [source.id, source]));
  const selected = new Set(selectedIds.filter((id) => byId.has(id)));
  if (selected.size === 0) return { status: "not_found", sources: [] };

  const query = tokens(question);
  const relatedConflicts = caseData.conflicts.filter((conflict) =>
    !(conflict.semanticKey.endsWith(".location") && query.has("date") && !query.has("location")) &&
    conflict.factIds.some((factId) => caseData.facts.some((fact) =>
      fact.id === factId && fact.evidenceIds.some((evidenceId) => selected.has(evidenceId)),
    )),
  );
  const conflictEvidenceIds = new Set(caseData.facts
    .filter((fact) => relatedConflicts.some((conflict) => conflict.factIds.includes(fact.id)))
    .flatMap((fact) => fact.evidenceIds));
  if (relatedConflicts.length > 0) {
    for (const id of selected) if (!conflictEvidenceIds.has(id)) selected.delete(id);
  }
  for (const conflict of relatedConflicts) {
    for (const fact of caseData.facts) {
      if (!conflict.factIds.includes(fact.id)) continue;
      for (const evidenceId of fact.evidenceIds) if (byId.has(evidenceId)) selected.add(evidenceId);
    }
  }

  const recorded = [...caseData.events].reverse().find((event) =>
    event.type === "school_confirmation_recorded" && relatedConflicts.some((conflict) => conflict.id === event.conflictId),
  );
  return {
    status: relatedConflicts.some((conflict) => conflict.status === "open") ? "conflict" : "found",
    sources: [...selected].map((id) => byId.get(id)!),
    ...(recorded?.type === "school_confirmation_recorded" ? { recordedSchoolAnswer: { value: recorded.reportedValue, factId: recorded.selectedFactId } } : {}),
  };
}
