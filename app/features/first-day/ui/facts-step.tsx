import type { FirstDayCase } from "../domain/types";
import {
  FACT_ES,
  FACT_STATE_META,
  translated,
  type Language,
} from "./first-day-copy";
import {
  currentFactView,
  Eyebrow,
  SourceButton,
  type SourceOpener,
} from "./first-day-shared";
import { CheckIcon } from "./icons";

export type FactsStepProps = {
  caseData: FirstDayCase;
  language: Language;
  onConfirmFact: (factId: string) => void;
  onOpenSource: SourceOpener;
};

export function FactsStep({
  caseData,
  language,
  onConfirmFact,
  onOpenSource,
}: FactsStepProps) {
  const sourceLabel = translated(language, "Show source", "Ver fuente");

  return (
    <section className="fd-enter">
      <Eyebrow>
        {translated(
          language,
          "Step 3 · Review facts",
          "Paso 3 · Revisar datos",
        )}
      </Eyebrow>
      <h1 className="fd-page-title">
        {translated(
          language,
          "Check the facts that shape the plan.",
          "Revise los datos que forman el plan.",
        )}
      </h1>
      <p className="fd-page-intro">
        {translated(
          language,
          "Lantern keeps the original wording. Confirming a fact adds a record; it never erases what the document said.",
          "Lantern conserva las palabras originales. Confirmar añade un registro; nunca borra lo que dijo el documento.",
        )}
      </p>

      <div className="mt-8 grid gap-4 xl:grid-cols-2">
        {caseData.facts.map((fact) => {
          const view = currentFactView(caseData, fact);
          const meta = FACT_STATE_META[view.state];
          return (
            <article className="fd-fact-card" key={fact.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#5f6d66]">
                    {fact.kind.replace("_", " ")}
                  </p>
                  <h2 className="mt-2 text-base font-semibold">
                    {language === "Español" ? FACT_ES[fact.id] : fact.label}
                  </h2>
                </div>
                <span className={`fd-fact-state ${meta.className}`}>
                  {language === "Español" ? meta.es : meta.en}
                </span>
              </div>
              <p className="mt-5 font-serif text-xl leading-7 text-[#203029]">
                {view.value}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <SourceButton
                  label={sourceLabel}
                  onClick={(button) =>
                    onOpenSource(fact.evidenceIds[0], button)
                  }
                />
                {view.state === "proposed" ? (
                  <button
                    className="fd-confirm-button"
                    onClick={() => onConfirmFact(fact.id)}
                    type="button"
                  >
                    <CheckIcon className="h-4 w-4" />
                    {translated(language, "Confirm this", "Confirmar")}
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
