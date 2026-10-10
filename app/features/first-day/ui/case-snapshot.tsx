import type { FirstDayCase } from "../domain/types";
import { translated, type Language } from "./first-day-copy";
import type { CaseSnapshotView } from "./first-day-view";
import { ShieldIcon, WarningIcon } from "./icons";

export function CaseSnapshot({
  caseData,
  language,
  snapshot,
}: {
  caseData: FirstDayCase;
  language: Language;
  snapshot: CaseSnapshotView;
}) {
  const metrics = [
    [snapshot.processedDocumentCount, translated(language, "pages ready", "páginas listas")],
    [snapshot.pendingFactCount, translated(language, "facts to check", "datos por revisar")],
    [snapshot.openConflictCount, translated(language, "blockers", "bloqueos")],
    [snapshot.readyTaskCount, translated(language, "steps ready", "pasos listos")],
  ] as const;

  return (
    <section className="fd-case-snapshot" aria-label={translated(language, "Case summary", "Resumen del caso")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#1d4b3a]">
            {caseData.mode === "fictional"
              ? translated(language, "Fictional demonstration", "Demostración ficticia")
              : translated(language, "Public-source example", "Ejemplo con fuentes públicas")}
          </p>
          <p className="mt-1 text-sm font-bold text-ink">
            {caseData.mode === "fictional"
              ? caseData.district
              : translated(language, "Sample district workflow", "Ejemplo de proceso distrital")}
          </p>
        </div>
        {snapshot.openConflictCount ? (
          <WarningIcon className="h-5 w-5 text-[#9a6b12]" />
        ) : (
          <ShieldIcon className="h-5 w-5 text-confirmed" />
        )}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2">
        {metrics.map(([value, label]) => (
          <div className="rounded-xl bg-canvas px-3 py-2" key={label}>
            <dd className="text-lg font-black tracking-[-0.03em] text-ink">{value}</dd>
            <dt className="text-[11px] font-semibold leading-4 text-muted">{label}</dt>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs leading-5 text-muted">
        {translated(
          language,
          caseData.mode === "fictional"
            ? "No account or cloud case history. Mesa View is not a real district."
            : "This sample references public Round Rock ISD pages. Lantern is independent and has no district partnership or endorsement.",
          caseData.mode === "fictional"
            ? "Sin cuenta ni historial en la nube. Mesa View no es un distrito real."
            : "Este ejemplo usa páginas públicas de Round Rock ISD. Lantern es independiente y no tiene una colaboración ni el respaldo del distrito.",
        )}
      </p>
    </section>
  );
}
