"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { answerFromSources, rankSourcesLocally, sourceExcerpts } from "../domain/source-questions";
import type { FirstDayCase } from "../domain/types";
import { factDisplayValue, sourceLocation, sourceTitle, translated, type Language } from "./first-day-copy";
import type { SourceOpener } from "./first-day-shared";
import { ArrowRightIcon, EyeIcon, SparkIcon } from "./icons";
import type { ProviderCapability } from "./use-provider-capability";

type MatchMethod = "local" | "ai" | "fallback";

export function SourceQuestionPanel({
  caseData,
  language,
  onOpenSource,
  providerCapability,
}: {
  caseData: FirstDayCase;
  language: Language;
  onOpenSource: SourceOpener;
  providerCapability: ProviderCapability;
}) {
  const [question, setQuestion] = useState("");
  const [askedQuestion, setAskedQuestion] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [method, setMethod] = useState<MatchMethod>("local");
  const [loading, setLoading] = useState(false);
  const activeRequest = useRef<AbortController | null>(null);
  const sources = useMemo(() => sourceExcerpts(caseData), [caseData]);
  const result = askedQuestion ? answerFromSources(caseData, askedQuestion, selectedIds) : null;
  const isSpanish = language === "Español";
  const prompts = caseData.mode === "fictional"
    ? isSpanish
      ? ["¿Dónde es la orientación?", "¿Cuándo es la inscripción?", "¿Hay ayuda con intérprete?"]
      : ["Where is orientation?", "When is enrollment?", "Is interpreter help offered?"]
    : isSpanish
      ? ["¿Qué fechas aparecen?", "¿Qué documentos se piden?"]
      : ["What dates are listed?", "Which documents are requested?"];

  useEffect(() => () => activeRequest.current?.abort(), []);

  async function ask(value: string) {
    const clean = value.trim().slice(0, 240);
    if (clean.length < 3 || sources.length === 0) return;
    activeRequest.current?.abort();
    setQuestion(clean);
    setAskedQuestion(clean);
    const local = rankSourcesLocally(clean, sources);
    setSelectedIds(local.map((source) => source.id));
    setMethod("local");

    if (caseData.mode === "fictional" || providerCapability !== "available") {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    activeRequest.current = controller;
    setLoading(true);
    const ranked = rankSourcesLocally(clean, sources, sources.length);
    const rankedIds = new Set(ranked.map((source) => source.id));
    const candidates = [...ranked, ...sources.filter((source) => !rankedIds.has(source.id))].slice(0, 24);
    try {
      const response = await fetch("/api/first-day/rank-sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: clean,
          language,
          sources: candidates.map(({ id, label, quote, topics }) => ({ id, label: label.slice(0, 160), quote: quote.slice(0, 1_000), topics: topics.slice(0, 300) })),
        }),
        cache: "no-store",
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Source matching unavailable");
      const data: unknown = await response.json();
      if (!data || typeof data !== "object" || !("sourceIds" in data) || !Array.isArray(data.sourceIds) || !data.sourceIds.every((id) => typeof id === "string")) {
        throw new Error("Invalid source match");
      }
      if (!controller.signal.aborted) {
        setSelectedIds(data.sourceIds);
        setMethod("ai");
      }
    } catch {
      if (!controller.signal.aborted) setMethod("fallback");
    } finally {
      if (activeRequest.current === controller) {
        activeRequest.current = null;
        setLoading(false);
      }
    }
  }

  return (
    <section aria-labelledby="source-question-title" className="mt-8 overflow-hidden rounded-[1.75rem] border border-[#cad5cf] bg-white shadow-[0_20px_60px_rgba(24,46,38,.08)]">
      <div className="bg-[radial-gradient(circle_at_90%_0%,rgba(245,205,124,.26),transparent_44%),linear-gradient(120deg,#f2f6ee,#eef2ff)] p-5 sm:p-7">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#355143]">
          <SparkIcon className="h-4 w-4" />
          {translated(language, "Source finder", "Buscador de fuentes")}
        </div>
        <h2 className="mt-3 font-serif text-3xl tracking-[-0.035em] text-[#172b22]" id="source-question-title">
          {translated(language, "Ask about these pages.", "Pregunte sobre estas páginas.")}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#4e6255]">
          {translated(language,
            "Lantern finds the original passages that may help. It keeps disagreements visible and does not decide what the school meant.",
            "Lantern encuentra los pasajes originales que pueden ayudar. Muestra los desacuerdos y no decide qué quiso decir la escuela.")}
        </p>
        <form className="mt-5 flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); void ask(question); }}>
          <input
            aria-label={translated(language, "Question about these pages", "Pregunta sobre estas páginas")}
            className="min-h-12 min-w-0 flex-1 rounded-xl border border-[#bfcfc4] bg-white px-4 text-sm text-[#172b22] outline-none focus-visible:ring-2 focus-visible:ring-[#304fc4]"
            maxLength={240}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder={translated(language, "Where is orientation?", "¿Dónde es la orientación?")}
            type="text"
            value={question}
          />
          <button className="fd-primary-button justify-center" disabled={sources.length === 0 || loading} type="submit">
            {loading ? translated(language, "Checking…", "Buscando…") : translated(language, "Find sources", "Buscar fuentes")}
            {!loading ? <ArrowRightIcon className="h-4 w-4" /> : null}
          </button>
        </form>
        {sources.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2" aria-label={translated(language, "Suggested questions", "Preguntas sugeridas")}>
            {prompts.map((prompt) => (
              <button className="min-h-9 rounded-full border border-[#c8d6c9] bg-white/80 px-3 text-xs font-semibold text-[#355143] transition-colors hover:bg-white" key={prompt} onClick={() => void ask(prompt)} type="button">
                {prompt}
              </button>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-[#59695f]">{translated(language, "Add a readable page to ask a question.", "Añada una página legible para hacer una pregunta.")}</p>
        )}
        <p className="mt-4 text-xs leading-5 text-[#56695c]">
          {caseData.mode === "fictional"
            ? translated(language, "This fictional lookup runs in your browser. It makes no AI request.", "Esta búsqueda ficticia funciona en su navegador. No envía solicitudes a la IA.")
            : providerCapability === "available"
              ? translated(language, "When you ask, your question, page and fact labels, and short source quotes go to the configured AI provider for matching. The answer shown here uses the original quotes.", "Al preguntar, se envían al proveedor de IA su pregunta, los títulos de las páginas y los datos, y citas breves para buscar coincidencias. La respuesta que aparece aquí usa las citas originales.")
              : translated(language, "AI matching is unavailable; source lookup runs in your browser.", "La búsqueda con IA no está disponible; la búsqueda de fuentes funciona en su navegador.")}
        </p>
      </div>

      {askedQuestion ? (
        <div aria-live="polite" className="border-t border-[#dce4db] p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-lg font-bold text-[#172b22]">{translated(language, "What the pages show", "Lo que muestran las páginas")}</h3>
            <span className="rounded-full bg-[#edf2ff] px-3 py-1 text-xs font-bold text-[#304fc4]">
              {method === "ai"
                ? translated(language, "AI matched sources", "Fuentes seleccionadas con IA")
                : method === "fallback"
                  ? translated(language, "Local source match · AI unavailable", "Búsqueda local · IA no disponible")
                  : translated(language, "Local source match", "Búsqueda local de fuentes")}
            </span>
          </div>
          {loading ? <p className="mt-2 text-sm text-[#53665a]" role="status">{translated(language, "Checking which passages fit your question…", "Buscando los pasajes relacionados con su pregunta…")}</p> : null}
          {result?.status === "not_found" ? (
            <p className="mt-4 rounded-xl border border-[#ead4a3] bg-[#fff8e8] p-4 text-sm leading-6 text-[#665021]">
              {translated(language, "Lantern did not find a matching checked passage. Read the original pages or ask the school rather than guessing.", "Lantern no encontró un pasaje comprobado que coincida. Lea las páginas originales o pregunte a la escuela en vez de adivinar.")}
            </p>
          ) : (
            <>
              <p className={`mt-4 rounded-xl border p-4 text-sm leading-6 ${result?.status === "conflict" ? "border-[#e8cd85] bg-[#fff7df] text-[#684e18]" : "border-[#c8d9cb] bg-[#f2f7ef] text-[#355143]"}`}>
                {result?.status === "conflict"
                  ? translated(language, "These pages disagree. Ask the school which location to follow, then record its answer in the plan.", "Estas páginas no coinciden. Pregunte a la escuela qué lugar debe seguir y registre su respuesta en el plan.")
                  : translated(language, "These passages may help. Check the exact wording before you act.", "Estos pasajes pueden ayudar. Revise las palabras exactas antes de actuar.")}
              </p>
              {result?.recordedSchoolAnswer ? (
                <p className="mt-3 rounded-xl bg-[#edf2ff] p-4 text-sm font-semibold text-[#304579]">
                  {translated(language, "School answer you recorded:", "Respuesta de la escuela que registró:")} {factDisplayValue(result.recordedSchoolAnswer.factId, result.recordedSchoolAnswer.value, language)}
                </p>
              ) : null}
              <div className="mt-4 grid gap-3">
                {result?.sources.map((source) => (
                  <article className="rounded-2xl border border-[#dce4db] bg-[#fcfdfa] p-4" key={source.id}>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#5b6b5f]">
                      {sourceTitle(source.documentId, source.label, language)} · {sourceLocation(source.location, language)}
                    </p>
                    <blockquote className="mt-3 border-l-2 border-[#b5892e] pl-3 font-serif text-lg leading-7 text-[#172b22]">“{source.quote}”</blockquote>
                    <button className="fd-source-button mt-3" onClick={(event) => onOpenSource(source.id, event.currentTarget)} type="button">
                      <EyeIcon className="h-4 w-4" />
                      {translated(language, "Open source", "Abrir fuente")}
                    </button>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      ) : null}
    </section>
  );
}
