import type { CaseSnapshotView } from "./first-day-view";
import type { Language, StepId } from "./first-day-copy";

type LocalizedText = {
  en: string;
  es: string;
};

export type DemoBeatId =
  | "before_lantern"
  | "traceable_evidence"
  | "uncertainty_preserved"
  | "focused_update"
  | "family_outcome"
  | "engineering_proof";

export type DemoBeat = {
  id: DemoBeatId;
  step: StepId;
  time: string;
  title: LocalizedText;
  cue: LocalizedText;
  proofLabel: LocalizedText;
};

export const DEMO_BEATS: readonly DemoBeat[] = [
  {
    id: "before_lantern",
    step: "documents",
    time: "0:20–0:45",
    title: { en: "Before Lantern", es: "Antes de Lantern" },
    cue: {
      en: "Show three scattered pages, two facts to check, and the contradiction the family still has to resolve.",
      es: "Muestre tres páginas dispersas, dos datos por revisar y la contradicción que la familia aún debe resolver.",
    },
    proofLabel: { en: "Community need", es: "Necesidad comunitaria" },
  },
  {
    id: "traceable_evidence",
    step: "facts",
    time: "0:45–1:10",
    title: { en: "Traceable evidence", es: "Evidencia rastreable" },
    cue: {
      en: "Open one source passage, then confirm the two proposed facts. The original words never disappear.",
      es: "Abra un fragmento de la fuente y confirme los dos datos propuestos. Las palabras originales nunca desaparecen.",
    },
    proofLabel: { en: "Evidence integrity", es: "Integridad de evidencia" },
  },
  {
    id: "uncertainty_preserved",
    step: "blocker",
    time: "1:10–1:40",
    title: { en: "Uncertainty preserved", es: "Incertidumbre preservada" },
    cue: {
      en: "Compare both exact quotes. Lantern refuses to guess which entrance is correct.",
      es: "Compare ambas citas exactas. Lantern se niega a adivinar qué entrada es correcta.",
    },
    proofLabel: { en: "Responsible AI", es: "IA responsable" },
  },
  {
    id: "focused_update",
    step: "plan",
    time: "1:40–2:00",
    title: { en: "One focused update", es: "Una actualización precisa" },
    cue: {
      en: "Show that the school-reported answer changed only the task that depended on it.",
      es: "Muestre que la respuesta informada por la escuela cambió solo el paso que dependía de ella.",
    },
    proofLabel: { en: "Deterministic logic", es: "Lógica determinista" },
  },
  {
    id: "family_outcome",
    step: "export",
    time: "2:00–2:25",
    title: { en: "A plan the family can carry", es: "Un plan que la familia puede llevar" },
    cue: {
      en: "Switch to Spanish and show the printable plan, confirmed dates, sources, and unresolved-item count.",
      es: "Cambie a español y muestre el plan imprimible, las fechas confirmadas, las fuentes y los asuntos pendientes.",
    },
    proofLabel: { en: "Bilingual access", es: "Acceso bilingüe" },
  },
  {
    id: "engineering_proof",
    step: "export",
    time: "2:25–2:50",
    title: { en: "How the trust is built", es: "Cómo se construye la confianza" },
    cue: {
      en: "Close with the stack, deterministic boundaries, evaluation results, and the exact role AI is allowed to play.",
      es: "Cierre con las herramientas, los límites deterministas, la evaluación y el papel exacto permitido para la IA.",
    },
    proofLabel: { en: "Technical sophistication", es: "Sofisticación técnica" },
  },
] as const;

export function localizedDemoText(text: LocalizedText, language: Language) {
  return language === "Español" ? text.es : text.en;
}

export function demoBeatIndex(id: DemoBeatId) {
  return DEMO_BEATS.findIndex((beat) => beat.id === id);
}

export function demoBeatForStep(
  step: StepId,
  snapshot: CaseSnapshotView,
  currentBeatId?: DemoBeatId,
): DemoBeatId {
  if (step === "documents" || step === "start") return "before_lantern";
  if (step === "facts") return "traceable_evidence";
  if (step === "blocker") return "uncertainty_preserved";
  if (step === "plan") {
    return snapshot.openConflictCount > 0
      ? "uncertainty_preserved"
      : "focused_update";
  }
  if (step === "export" && currentBeatId === "engineering_proof") {
    return "engineering_proof";
  }
  return "family_outcome";
}

export function demoOutcome(
  beatId: DemoBeatId,
  snapshot: CaseSnapshotView,
  language: Language,
) {
  const es = language === "Español";
  switch (beatId) {
    case "before_lantern":
      return es
        ? `${snapshot.processedDocumentCount} páginas separadas · ${snapshot.pendingFactCount} datos por revisar · ${snapshot.openConflictCount} bloqueo`
        : `${snapshot.processedDocumentCount} separate pages · ${snapshot.pendingFactCount} facts to check · ${snapshot.openConflictCount} blocker`;
    case "traceable_evidence":
      return snapshot.pendingFactCount > 0
        ? es
          ? `${snapshot.pendingFactCount} datos aún necesitan revisión familiar`
          : `${snapshot.pendingFactCount} facts still need family review`
        : es
          ? "Todos los datos propuestos fueron revisados por la familia"
          : "Every proposed fact has been reviewed by the family";
    case "uncertainty_preserved":
      return es
        ? `${snapshot.openConflictCount} conflicto permanece visible hasta que una persona decida`
        : `${snapshot.openConflictCount} conflict stays visible until a person decides`;
    case "focused_update":
      return es
        ? `${snapshot.readyTaskCount} pasos listos · ${snapshot.openConflictCount} bloqueos abiertos`
        : `${snapshot.readyTaskCount} steps ready · ${snapshot.openConflictCount} open blockers`;
    case "family_outcome":
      return es
        ? `${snapshot.readyTaskCount} pasos listos · ${snapshot.completedTaskCount} terminados`
        : `${snapshot.readyTaskCount} steps ready · ${snapshot.completedTaskCount} completed`;
    case "engineering_proof":
      return es
        ? "20 paquetes de prueba · límites de IA y código visibles"
        : "20 held-out packets · AI and code boundaries made visible";
  }
}

export function demoBlocker(
  beatId: DemoBeatId,
  snapshot: CaseSnapshotView,
  language: Language,
) {
  const es = language === "Español";
  if (beatId === "traceable_evidence" && snapshot.pendingFactCount > 0) {
    return es
      ? `Revise ${snapshot.pendingFactCount} datos antes de continuar.`
      : `Review ${snapshot.pendingFactCount} facts before continuing.`;
  }
  if (beatId === "uncertainty_preserved" && snapshot.openConflictCount > 0) {
    return es
      ? "Registre lo que la escuela le dijo a la familia."
      : "Record what the school told the family.";
  }
  if (beatId === "engineering_proof") {
    return es ? "Último momento de la demostración." : "Final demonstration beat.";
  }
  return null;
}
