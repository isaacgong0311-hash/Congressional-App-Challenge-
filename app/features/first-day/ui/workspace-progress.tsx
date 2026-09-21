import type { FirstDayCase } from "../domain/types";
import { STEPS, translated, type Language, type StepId } from "./first-day-copy";
import { CheckIcon } from "./icons";
import { canEnterLiveStep } from "./use-live-case";

type WorkspaceProgressProps = {
  caseData: FirstDayCase;
  currentStep: StepId;
  language: Language;
  onSelectStep: (step: StepId) => void;
};

function StepList({
  activeStepIndex,
  caseData,
  currentStep,
  language,
  onSelectStep,
}: WorkspaceProgressProps & { activeStepIndex: number }) {
  return (
    <ol className="space-y-1">
      {STEPS.map((step, index) => {
        const active = step.id === currentStep;
        const visited = index < activeStepIndex;
        return (
          <li key={step.id}>
            <button
              aria-current={active ? "step" : undefined}
              className={`fd-step-button ${active ? "is-active" : ""}`}
              disabled={!canEnterLiveStep(caseData, step.id)}
              onClick={() => onSelectStep(step.id)}
              type="button"
            >
              <span className={`fd-step-number ${visited ? "is-visited" : ""}`}>
                {visited ? <CheckIcon className="h-4 w-4" /> : index + 1}
              </span>
              <span>{language === "Español" ? step.es : step.en}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export function WorkspaceProgress(props: WorkspaceProgressProps) {
  const activeStepIndex = STEPS.findIndex((step) => step.id === props.currentStep);
  const current = STEPS[activeStepIndex];
  const next = STEPS[activeStepIndex + 1];

  return (
    <>
      <details className="fd-mobile-progress print:hidden lg:hidden">
        <summary>
          <span>
            <span className="block text-[11px] font-extrabold uppercase tracking-[0.16em] text-cobalt">
              {translated(props.language, `Step ${activeStepIndex + 1} of ${STEPS.length}`, `Paso ${activeStepIndex + 1} de ${STEPS.length}`)}
            </span>
            <span className="mt-1 block font-bold text-ink">
              {props.language === "Español" ? current?.es : current?.en}
            </span>
          </span>
          <span className="text-right text-xs font-semibold text-muted">
            {next
              ? translated(
                  props.language,
                  `Next: ${next.en}`,
                  `Siguiente: ${next.es}`,
                )
              : translated(props.language, "Final step", "Paso final")}
          </span>
        </summary>
        <div className="border-t border-ink/10 px-3 pb-3 pt-2">
          <StepList {...props} activeStepIndex={activeStepIndex} />
        </div>
      </details>

      <nav aria-label="First Day progress" className="fd-step-nav hidden lg:block">
        <div className="mb-5 px-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">
            {translated(props.language, "Your path", "Su camino")}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted">
            {translated(
              props.language,
              "Nothing changes the plan until you confirm it.",
              "Nada cambia el plan hasta que usted lo confirme.",
            )}
          </p>
        </div>
        <StepList {...props} activeStepIndex={activeStepIndex} />
      </nav>
    </>
  );
}
