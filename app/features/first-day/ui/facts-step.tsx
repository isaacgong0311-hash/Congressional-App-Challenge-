import { useState } from "react";

import type { Fact, FirstDayCase } from "../domain/types";
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
import { factHasActiveSource } from "./use-live-case";

export type FactsStepProps = {
  caseData: FirstDayCase;
  language: Language;
  onConfirmFact: (factId: string) => void;
  onCorrectFact: (factId: string, value: string) => void;
  onMarkUnclear: (factId: string) => void;
  onOpenSource: SourceOpener;
};

type FactReviewCardProps = Omit<FactsStepProps, "caseData"> & {
  caseData: FirstDayCase;
  fact: Fact;
};

function FactReviewCard({
  caseData,
  fact,
  language,
  onConfirmFact,
  onCorrectFact,
  onMarkUnclear,
  onOpenSource,
}: FactReviewCardProps) {
  const view = currentFactView(caseData, fact);
  const meta = FACT_STATE_META[view.state];
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [correctedValue, setCorrectedValue] = useState(fact.originalValue);
  const sourceId = fact.evidenceIds[0];
  const factLabel =
    language === "Español" ? FACT_ES[fact.id] ?? fact.label : fact.label;

  function saveCorrection() {
    const value = correctedValue.trim();
    if (!value) return;
    onCorrectFact(fact.id, value);
    setIsCorrecting(false);
  }

  return (
    <article className="fd-fact-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#5f6d66]">
            {fact.kind.replace("_", " ")}
          </p>
          <h2 className="mt-2 text-base font-semibold">{factLabel}</h2>
          {fact.semanticKey || typeof fact.confidence === "number" ? (
            <p className="mt-2 text-xs text-[#68756e]">
              {[fact.semanticKey, fact.confidence === undefined
                ? null
                : translated(
                    language,
                    `${fact.confidence}% extraction confidence`,
                    `${fact.confidence}% de confianza de extracción`,
                  )]
                .filter(Boolean)
                .join(" · ")}
            </p>
          ) : null}
        </div>
        <span className={`fd-fact-state ${meta.className}`}>
          {language === "Español" ? meta.es : meta.en}
        </span>
      </div>
      <p className="mt-5 font-serif text-xl leading-7 text-[#203029]">
        {view.value}
      </p>

      {isCorrecting ? (
        <div className="mt-5 rounded-2xl border border-[#d9dfda] bg-white p-4">
          <label
            className="text-sm font-semibold text-[#293a33]"
            htmlFor={`correct-${fact.id}`}
          >
            {translated(
              language,
              `Correct value for ${fact.label}`,
              `Valor correcto para ${factLabel}`,
            )}
          </label>
          <input
            className="mt-2 w-full rounded-xl border border-[#cfd7d1] bg-white px-3 py-2 text-sm outline-none focus:border-[#3556d4] focus:ring-2 focus:ring-[#3556d4]/20"
            id={`correct-${fact.id}`}
            onChange={(event) => setCorrectedValue(event.currentTarget.value)}
            value={correctedValue}
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="fd-confirm-button"
              disabled={!correctedValue.trim()}
              onClick={saveCorrection}
              type="button"
            >
              {translated(language, "Save correction", "Guardar corrección")}
            </button>
            <button
              className="fd-secondary-button"
              onClick={() => {
                setCorrectedValue(fact.originalValue);
                setIsCorrecting(false);
              }}
              type="button"
            >
              {translated(language, "Cancel", "Cancelar")}
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {sourceId ? (
          <SourceButton
            label={translated(language, "Show source", "Ver fuente")}
            onClick={(button) => onOpenSource(sourceId, button)}
          />
        ) : null}
        {view.state === "proposed" ? (
          <>
            <button
              className="fd-confirm-button"
              onClick={() => onConfirmFact(fact.id)}
              type="button"
            >
              <CheckIcon className="h-4 w-4" />
              {translated(language, "Confirm this", "Confirmar")}
            </button>
            <button
              className="fd-secondary-button"
              onClick={() => setIsCorrecting(true)}
              type="button"
            >
              {translated(language, "Correct", "Corregir")}
            </button>
            <button
              className="fd-remove-button"
              onClick={() => onMarkUnclear(fact.id)}
              type="button"
            >
              {translated(language, "Not clear", "No está claro")}
            </button>
          </>
        ) : null}
      </div>
    </article>
  );
}

export function FactsStep(props: FactsStepProps) {
  const { caseData, language } = props;

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
        {caseData.facts
          .filter((fact) => factHasActiveSource(caseData, fact))
          .map((fact) => (
            <FactReviewCard {...props} fact={fact} key={fact.id} />
          ))}
      </div>
    </section>
  );
}
