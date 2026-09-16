import type { FirstDayCase, PlannerResult } from "../domain/types";
import {
  STATE_META,
  TASK_ES,
  translated,
  type Language,
} from "./first-day-copy";
import { Eyebrow } from "./first-day-shared";
import { LanternIcon, PrinterIcon } from "./icons";

export type ExportStepProps = {
  caseData: FirstDayCase;
  language: Language;
  plan: PlannerResult;
  onPrint: () => void;
};

export function ExportStep({
  caseData,
  language,
  plan,
  onPrint,
}: ExportStepProps) {
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
            "Print the plan with its sources and unresolved items. Confirmed information and fictional rules stay clearly labeled.",
            "Imprima el plan con sus fuentes y asuntos pendientes. La información confirmada y las reglas ficticias siguen claramente marcadas.",
          )}
        </p>
      </div>

      <article className="fd-print-plan mt-8 rounded-[2rem] border border-[#d9dfda] bg-white p-6 shadow-[0_20px_70px_rgba(24,46,38,.08)] sm:p-10">
        <div className="flex flex-col justify-between gap-5 border-b border-[#dfe4df] pb-7 sm:flex-row sm:items-start">
          <div>
            <div className="flex items-center gap-2 text-[#2f50c9]">
              <LanternIcon />
              <span className="text-sm font-bold">Lantern · First Day</span>
            </div>
            <h2 className="mt-5 font-serif text-4xl tracking-[-0.04em]">
              {translated(
                language,
                "Maya’s school plan",
                "Plan escolar de Maya",
              )}
            </h2>
            <p className="mt-2 text-sm text-[#68756e]">{caseData.district}</p>
          </div>
          <div className="rounded-2xl bg-[#fff5d8] px-4 py-3 text-sm font-semibold text-[#795a18]">
            {
              plan.tasks.filter(
                (task) => task.state === "needs_clarification",
              ).length
            }{" "}
            {translated(
              language,
              "unresolved item",
              "asunto pendiente",
            )}
          </div>
        </div>

        <div className="mt-7 space-y-4">
          {plan.tasks.map((task) => {
            const meta = STATE_META[task.state];
            const taskCopy =
              language === "Español" ? TASK_ES[task.id] : task;
            return (
              <div
                className="flex gap-4 rounded-2xl border border-[#e0e5e1] p-4"
                key={task.id}
              >
                <span className={`fd-print-state ${meta.className}`}>
                  {language === "Español" ? meta.es : meta.en}
                </span>
                <div>
                  <h3 className="font-semibold">{taskCopy.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#5d6963]">
                    {taskCopy.action}
                  </p>
                  <p className="mt-2 text-xs text-[#5f6d66]">
                    {translated(
                      language,
                      "Source references",
                      "Referencias",
                    )}
                    : {task.evidenceIds.join(", ")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-7 grid gap-4 border-t border-[#dfe4df] pt-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#5f6d66]">
              {translated(language, "Rule version", "Versión de reglas")}
            </p>
            <p className="mt-2 text-sm font-semibold">{caseData.ruleVersion}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#5f6d66]">
              {translated(language, "Evidence note", "Nota de evidencia")}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#5d6963]">
              {translated(
                language,
                "All school names, documents, and procedures in this printout are fictional.",
                "Todos los nombres, documentos y procedimientos de esta impresión son ficticios.",
              )}
            </p>
          </div>
        </div>
      </article>

      <button
        className="fd-primary-button mt-6 print:hidden"
        onClick={onPrint}
        type="button"
      >
        <PrinterIcon className="h-5 w-5" />
        {translated(
          language,
          "Print or save as PDF",
          "Imprimir o guardar como PDF",
        )}
      </button>
    </section>
  );
}
