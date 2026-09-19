import type {
  FirstDayCase,
  SchoolConfirmationEvent,
} from "../domain/types";
import { translated, type Language } from "./first-day-copy";
import { Eyebrow, SourceButton, type SourceOpener } from "./first-day-shared";
import { CheckIcon, MessageIcon, WarningIcon } from "./icons";

export type BlockerStepProps = {
  caseData: FirstDayCase;
  conflictId: string | null;
  language: Language;
  onOpenSource: SourceOpener;
  onResolveConflict: (
    conflictId: string,
    factId: string,
    reportedValue: string,
  ) => void;
};

export function BlockerStep({
  caseData,
  conflictId,
  language,
  onOpenSource,
  onResolveConflict,
}: BlockerStepProps) {
  const conflict =
    caseData.conflicts.find((item) => item.id === conflictId) ??
    caseData.conflicts.find((item) => item.status === "open") ??
    caseData.conflicts[0];
  const resolution = conflict
    ? [...caseData.events]
        .reverse()
        .find(
          (event): event is SchoolConfirmationEvent =>
            event.type === "school_confirmation_recorded" &&
            event.conflictId === conflict.id,
        )
    : undefined;

  if (!conflict) {
    return (
      <section className="fd-enter">
        <Eyebrow>
          {translated(
            language,
            "Step 5 · Resolve a blocker",
            "Paso 5 · Resolver un bloqueo",
          )}
        </Eyebrow>
        <h1 className="fd-page-title">
          {translated(
            language,
            "No conflicting instructions found.",
            "No se encontraron instrucciones contradictorias.",
          )}
        </h1>
        <p className="fd-page-intro">
          {translated(
            language,
            "Lantern will keep checking as more source-backed facts are added.",
            "Lantern seguirá revisando a medida que se añadan datos con fuentes.",
          )}
        </p>
      </section>
    );
  }

  const options = conflict.factIds.flatMap((factId) => {
    const fact = caseData.facts.find((item) => item.id === factId);
    if (!fact) return [];
    const evidenceId = fact.evidenceIds[0];
    const evidence = caseData.evidence.find((item) => item.id === evidenceId);
    const document = evidence?.documentId
      ? caseData.documents.find((item) => item.id === evidence.documentId)
      : undefined;
    return [
      {
        factId: fact.id,
        title: document?.label ?? fact.label,
        value: fact.originalValue,
        evidenceId,
      },
    ];
  });

  const comparedValues = options.map((option) => `“${option.value}”`);
  const preparedQuestion = translated(
    language,
    `I found different instructions for ${conflict.label.toLowerCase()}: ${comparedValues.join(" and ")}. Which should our family follow?`,
    `Encontré instrucciones diferentes para ${conflict.label.toLowerCase()}: ${comparedValues.join(" y ")}. ¿Cuál debe seguir nuestra familia?`,
  );

  return (
    <section className="fd-enter">
      <Eyebrow>
        {translated(
          language,
          "Step 5 · Resolve a blocker",
          "Paso 5 · Resolver un bloqueo",
        )}
      </Eyebrow>
      <h1 className="fd-page-title">
        {translated(
          language,
          "Two documents. One unanswered question.",
          "Dos documentos. Una pregunta sin respuesta.",
        )}
      </h1>
      <p className="fd-page-intro">
        {translated(
          language,
          "Lantern does not assume the newest page is correct. Both passages stay visible until the family records what the school said.",
          "Lantern no supone que la página más reciente sea correcta. Ambas fuentes siguen visibles hasta que la familia registre lo que dijo la escuela.",
        )}
      </p>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {options.map((option) => {
          const selected = resolution?.selectedFactId === option.factId;
          return (
            <article className="fd-conflict-card" key={option.factId}>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#8a6721]">
                <WarningIcon className="h-4 w-4" />
                {option.title}
              </div>
              <p className="mt-5 font-serif text-3xl tracking-[-0.03em]">
                {option.value}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {option.evidenceId ? (
                  <SourceButton
                    label={translated(language, "Show source", "Ver fuente")}
                    onClick={(button) =>
                      onOpenSource(option.evidenceId, button)
                    }
                  />
                ) : null}
                {!resolution ? (
                  <button
                    className="fd-confirm-button"
                    onClick={() =>
                      onResolveConflict(
                        conflict.id,
                        option.factId,
                        option.value,
                      )
                    }
                    type="button"
                  >
                    <CheckIcon className="h-4 w-4" />
                    {translated(
                      language,
                      "Record what the school told me",
                      "Registrar lo que me dijo la escuela",
                    )}
                  </button>
                ) : selected ? (
                  <span className="fd-ready-pill">
                    <CheckIcon className="h-4 w-4" />
                    {translated(
                      language,
                      "Reported confirmed by school",
                      "Confirmado según la escuela",
                    )}
                  </span>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-6 rounded-[2rem] border border-[#ccd6ff] bg-[#eef2ff] p-6 sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#3556d4] text-white">
            <MessageIcon />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5369bd]">
              {translated(
                language,
                "Prepared question",
                "Pregunta preparada",
              )}
            </p>
            <p className="mt-3 text-lg font-semibold leading-7 text-[#26386f]">
              {preparedQuestion}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
