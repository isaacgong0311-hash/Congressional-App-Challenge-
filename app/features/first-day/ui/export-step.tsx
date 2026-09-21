import type { FirstDayCase, PlannerResult } from "../domain/types";
import {
  calendarEvents,
  createCalendarFile,
} from "../export/calendar";
import {
  createPortablePlan,
  effectiveConfirmedFacts,
} from "../export/plan-document";
import {
  localizedTaskCopy,
  STATE_META,
  translated,
  type Language,
} from "./first-day-copy";
import { Eyebrow } from "./first-day-shared";
import {
  ClockIcon,
  DocumentIcon,
  LanternIcon,
  PrinterIcon,
  WarningIcon,
} from "./icons";

export type ExportStepProps = {
  caseData: FirstDayCase;
  language: Language;
  plan: PlannerResult;
  onPrint: () => void;
};

const TASK_ORDER = {
  needs_clarification: 0,
  ready: 1,
  needs_review: 2,
  waiting: 3,
  done: 4,
} as const;

function downloadFile(contents: string, type: string, fileName: string) {
  const url = URL.createObjectURL(new Blob([contents], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function ExportStep({
  caseData,
  language,
  plan,
  onPrint,
}: ExportStepProps) {
  const confirmedFacts = effectiveConfirmedFacts(caseData);
  const dates = calendarEvents(caseData);
  const unresolved = caseData.conflicts.filter(
    (conflict) => conflict.status === "open",
  );
  const orderedTasks = [...plan.tasks].sort(
    (left, right) => TASK_ORDER[left.state] - TASK_ORDER[right.state],
  );
  const bestNext = orderedTasks.find((task) => task.state !== "done");
  const remainingTasks = orderedTasks.filter((task) => task.id !== bestNext?.id);
  const planTitle = caseData.childFirstName
    ? translated(
        language,
        `${caseData.childFirstName}’s school plan`,
        `Plan escolar de ${caseData.childFirstName}`,
      )
    : translated(
        language,
        "School enrollment plan",
        "Plan de inscripción escolar",
      );

  function downloadPlan() {
    const portable = createPortablePlan(
      { ...caseData, language },
      plan,
      new Date().toISOString(),
    );
    downloadFile(
      `${JSON.stringify(portable, null, 2)}\n`,
      "application/json",
      "lantern-first-day-plan.json",
    );
  }

  function downloadCalendar() {
    if (dates.length === 0) return;
    downloadFile(
      createCalendarFile(dates),
      "text/calendar;charset=utf-8",
      "lantern-confirmed-dates.ics",
    );
  }

  return (
    <section className="fd-enter">
      <div className="print:hidden">
        <Eyebrow>
          {translated(
            language,
            "Step 6 · Take it with me",
            "Paso 6 · Llevar conmigo",
          )}
        </Eyebrow>
        <h1 className="fd-page-title">
          {translated(
            language,
            "A plan the family can carry.",
            "Un plan que la familia puede llevar.",
          )}
        </h1>
        <p className="fd-page-intro">
          {translated(
            language,
            "Print or download the plan with source references, unresolved items, and only dates you confirmed.",
            "Imprima o descargue el plan con referencias, asuntos pendientes y solo las fechas que confirmó.",
          )}
        </p>
      </div>

      <div className="mt-6 grid gap-3 print:hidden md:grid-cols-3">
        <button className="fd-export-action" data-demo-target="true" onClick={onPrint} type="button">
          <PrinterIcon className="h-6 w-6 text-cobalt" />
          <span><strong>{translated(language, "Print or save as PDF", "Imprimir o guardar como PDF")}</strong><small>{translated(language, "A family-readable copy", "Una copia fácil de leer")}</small></span>
        </button>
        <button className="fd-export-action" onClick={downloadPlan} type="button">
          <DocumentIcon className="h-6 w-6 text-cobalt" />
          <span><strong>{translated(language, "Download plan JSON", "Descargar plan JSON")}</strong><small>{translated(language, "Portable, complete event history", "Historial completo y portátil de eventos")}</small></span>
        </button>
        <button aria-describedby="fd-calendar-note" className="fd-export-action" disabled={dates.length === 0} onClick={downloadCalendar} type="button">
          <ClockIcon className="h-6 w-6 text-cobalt" />
          <span><strong>{translated(language, "Add dates to calendar", "Añadir fechas al calendario")}</strong><small>{translated(language, "Confirmed dates only", "Solo fechas confirmadas")}</small></span>
        </button>
      </div>
      <p className="mt-3 text-sm text-muted print:hidden" id="fd-calendar-note">
        {dates.length > 0
          ? translated(language, `${dates.length} confirmed date${dates.length === 1 ? "" : "s"} will be included.`, `Se incluirá${dates.length === 1 ? "" : "n"} ${dates.length} fecha${dates.length === 1 ? "" : "s"} confirmada${dates.length === 1 ? "" : "s"}.`)
          : translated(language, "Calendar export is available after you confirm a complete, unambiguous date.", "La exportación al calendario estará disponible después de confirmar una fecha completa y sin ambigüedad.")}
      </p>

      <article className="fd-print-plan mt-8 rounded-[2rem] border border-[#d9dfda] bg-white p-6 shadow-[0_20px_70px_rgba(24,46,38,.08)] sm:p-10">
        <div className="flex flex-col justify-between gap-5 border-b border-[#dfe4df] pb-7 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-2 text-[#2f50c9]">
              <LanternIcon />
              <span className="text-sm font-bold">Lantern · First Day</span>
            </div>
            <h2 className="mt-5 font-serif text-4xl tracking-[-0.04em]">
              {planTitle}
            </h2>
            <p className="mt-2 text-sm text-[#68756e]">{caseData.district}</p>
          </div>
          <div className="rounded-2xl bg-[#fff5d8] px-4 py-3 text-sm font-semibold text-[#795a18]">
            {unresolved.length}{" "}
            {translated(
              language,
              unresolved.length === 1 ? "unresolved item" : "unresolved items",
              unresolved.length === 1
                ? "asunto pendiente"
                : "asuntos pendientes",
            )}
          </div>
        </div>

        {unresolved.length > 0 ? (
          <section className="mt-7 break-inside-avoid">
            <div className="mb-3 flex items-center gap-2">
              <WarningIcon className="h-5 w-5 text-[#8a6721]" />
              <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-[#684e18]">
                {translated(
                  language,
                  "Resolve before relying on this plan",
                  "Resuelva antes de confiar en este plan",
                )}
              </h3>
            </div>
            <div className="space-y-3">
              {unresolved.map((conflict) => {
                const values = caseData.facts
                  .filter((fact) => conflict.factIds.includes(fact.id))
                  .map((fact) => fact.originalValue);
                return (
                  <div
                    className="rounded-2xl border border-[#efd69b] bg-[#fff9e9] p-4"
                    key={conflict.id}
                  >
                    <p className="font-semibold">{conflict.label}</p>
                    <p className="mt-1 text-sm leading-6 text-[#66572f]">
                      {values.join(" · ")}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>
        ) : null}

        {bestNext ? (
          <section className="mt-7 break-inside-avoid rounded-2xl border border-[#ccd6ff] bg-[#eef2ff] p-5">
            <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-cobalt">
              {translated(language, "Best next step", "Mejor paso siguiente")}
            </h3>
            <p className="mt-3 text-lg font-bold text-ink">{localizedTaskCopy(bestNext, language).title}</p>
            <p className="mt-1 text-sm leading-6 text-[#53628b]">{localizedTaskCopy(bestNext, language).action}</p>
          </section>
        ) : null}

        <section className="mt-7">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.15em] text-[#40534a]">
            {translated(language, "Plan steps", "Pasos del plan")}
          </h3>
          <div className="space-y-4">
            {remainingTasks.map((task) => {
              const meta = STATE_META[task.state];
              const taskCopy = localizedTaskCopy(task, language);
              return (
                <div
                  className="flex break-inside-avoid gap-4 rounded-2xl border border-[#e0e5e1] p-4"
                  key={task.id}
                >
                  <span className={`fd-print-state ${meta.className}`}>
                    {language === "Español" ? meta.es : meta.en}
                  </span>
                  <div>
                    <h4 className="font-semibold">{taskCopy.title}</h4>
                    <p className="mt-1 text-sm leading-6 text-[#5d6963]">
                      {taskCopy.action}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-7 break-inside-avoid border-t border-[#dfe4df] pt-6">
          <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-[#40534a]">
            {translated(language, "Confirmed calendar dates", "Fechas confirmadas del calendario")}
          </h3>
          {dates.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {dates.map((date) => (
                <li className="rounded-2xl bg-[#f4f6f2] p-4 text-sm font-semibold" key={`${date.title}-${date.date}`}>
                  {date.title} · {date.date}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">{translated(language, "No complete confirmed dates yet.", "Todavía no hay fechas completas confirmadas.")}</p>
          )}
        </section>

        <section className="mt-7 break-inside-avoid border-t border-[#dfe4df] pt-6">
          <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-[#40534a]">
            {translated(language, "Confirmed facts", "Datos confirmados")}
          </h3>
          {confirmedFacts.length > 0 ? (
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {confirmedFacts.map(({ fact, value }) => (
                <div className="rounded-2xl bg-[#f4f6f2] p-4" key={fact.id}>
                  <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#536159]">
                    {fact.label}
                  </dt>
                  <dd className="mt-2 font-semibold text-[#23342d]">{value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-3 text-sm text-[#66736c]">
              {translated(
                language,
                "No confirmed facts yet.",
                "Todavía no hay datos confirmados.",
              )}
            </p>
          )}
        </section>

        <details className="fd-technical-details mt-7 break-inside-avoid border-t border-[#dfe4df] pt-6">
          <summary className="min-h-11 cursor-pointer py-3 text-sm font-bold uppercase tracking-[0.15em] text-[#40534a]">
            {translated(language, "Sources and technical details", "Fuentes y detalles técnicos")}
          </summary>
          <div className="mt-3 space-y-3">
            {caseData.procedures.map((procedure) => (
              <div
                className="rounded-2xl border border-[#e0e5e1] p-4 text-sm"
                key={procedure.id}
              >
                <p className="font-semibold">{procedure.sourceSection}</p>
                <p className="mt-1 text-[#627069]">
                  {procedure.reviewerStatus} · {procedure.checkedAt} ·{` `}
                  {procedure.ruleVersion}
                </p>
              </div>
            ))}
            <div className="rounded-2xl border border-[#e0e5e1] p-4 text-sm">
              <p className="font-semibold">{translated(language, "Rule version", "Versión de reglas")}: {caseData.ruleVersion}</p>
              <p className="mt-2 break-words font-mono text-xs text-muted">
                {translated(language, "Evidence IDs", "IDs de evidencia")}: {caseData.evidence.map((item) => item.id).join(", ")}
              </p>
            </div>
          </div>
        </details>

        <div className="mt-7 break-inside-avoid border-t border-[#dfe4df] pt-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#5f6d66]">
              {translated(language, "Evidence note", "Nota de evidencia")}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#5d6963]">
              {caseData.mode === "fictional"
                ? translated(
                    language,
                    "All school names, documents, and procedures in this printout are fictional.",
                    "Todos los nombres, documentos y procedimientos de esta impresión son ficticios.",
                  )
                : translated(
                    language,
                    "Family-reviewed facts remain linked to document sources. Source-checked district procedures are not an endorsement by the district.",
                    "Los datos revisados por la familia siguen vinculados a sus fuentes. Los procedimientos distritales revisados no implican respaldo del distrito.",
                  )}
            </p>
          </div>
        </div>
      </article>
    </section>
  );
}
