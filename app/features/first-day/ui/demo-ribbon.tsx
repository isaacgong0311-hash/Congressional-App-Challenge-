import { STEPS, translated, type Language, type StepId } from "./first-day-copy";

const cues: Record<StepId, { en: string; es: string }> = {
  start: {
    en: "Introduce the family problem, then open the fictional case.",
    es: "Presente el problema familiar y abra el caso ficticio.",
  },
  documents: {
    en: "Show that every instruction keeps its page identity and source.",
    es: "Muestre que cada instrucción conserva su página y fuente.",
  },
  facts: {
    en: "Open one source, then confirm the two proposed facts.",
    es: "Abra una fuente y confirme los dos datos propuestos.",
  },
  plan: {
    en: "Point out the best next step and open the orientation blocker.",
    es: "Señale el mejor paso siguiente y abra el bloqueo de orientación.",
  },
  blocker: {
    en: "Compare both exact quotes and record the fictional school response.",
    es: "Compare las dos citas y registre la respuesta ficticia de la escuela.",
  },
  export: {
    en: "Switch languages and show the family-ready plan and exports.",
    es: "Cambie de idioma y muestre el plan familiar y las exportaciones.",
  },
};

export function DemoRibbon({
  canGoForward,
  currentStep,
  language,
  onDismiss,
  onNext,
  onPrevious,
}: {
  canGoForward: boolean;
  currentStep: StepId;
  language: Language;
  onDismiss: () => void;
  onNext: () => void;
  onPrevious: () => void;
}) {
  const index = STEPS.findIndex((step) => step.id === currentStep);
  const cue = cues[currentStep];
  return (
    <aside className="fd-demo-ribbon print:hidden" aria-label={translated(language, "Guided demo cue", "Guía de demostración")}>
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-amber">
          {translated(language, `Demo cue ${index + 1} of ${STEPS.length}`, `Guía ${index + 1} de ${STEPS.length}`)}
        </p>
        <p className="mt-1 text-sm font-semibold text-white">{language === "Español" ? cue.es : cue.en}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="fd-demo-button" disabled={index === 0} onClick={onPrevious} type="button">
          {translated(language, "Previous cue", "Guía anterior")}
        </button>
        <button className="fd-demo-button" disabled={!canGoForward} onClick={onNext} type="button">
          {translated(language, "Next cue", "Siguiente guía")}
        </button>
        <button className="fd-demo-dismiss" onClick={onDismiss} type="button">
          {translated(language, "Exit demo mode", "Salir de la demo")}
        </button>
      </div>
    </aside>
  );
}
