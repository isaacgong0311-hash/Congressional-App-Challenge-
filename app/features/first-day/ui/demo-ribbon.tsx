import {
  DEMO_BEATS,
  demoBlocker,
  demoOutcome,
  localizedDemoText,
  type DemoBeat,
} from "./demo-presentation";
import { translated, type Language } from "./first-day-copy";
import type { CaseSnapshotView } from "./first-day-view";

export function DemoRibbon({
  beat,
  canGoForward,
  language,
  onDismiss,
  onNext,
  onPrevious,
  snapshot,
}: {
  beat: DemoBeat;
  canGoForward: boolean;
  language: Language;
  onDismiss: () => void;
  onNext: () => void;
  onPrevious: () => void;
  snapshot: CaseSnapshotView;
}) {
  const index = DEMO_BEATS.findIndex((item) => item.id === beat.id);
  const blocker = demoBlocker(beat.id, snapshot, language);

  return (
    <aside
      aria-label={translated(language, "Guided demonstration", "Demostración guiada")}
      className="fd-demo-rail print:hidden"
    >
      <details open>
        <summary>
          <span aria-hidden="true" className="fd-demo-index">
            {index + 1}
          </span>
          <span className="min-w-0 flex-1">
            <span className="fd-demo-kicker">
              {translated(
                language,
                `Fictional demo · Beat ${index + 1} of ${DEMO_BEATS.length}`,
                `Demo ficticia · Momento ${index + 1} de ${DEMO_BEATS.length}`,
              )}
            </span>
            <span className="fd-demo-title">
              {localizedDemoText(beat.title, language)}
            </span>
          </span>
          <span className="fd-demo-time">{beat.time}</span>
        </summary>

        <div className="fd-demo-body">
          <div className="min-w-0">
            <p aria-live="polite" className="fd-demo-outcome">
              {demoOutcome(beat.id, snapshot, language)}
            </p>
            <p className="fd-demo-cue">
              {localizedDemoText(beat.cue, language)}
            </p>
            <span className="fd-demo-proof">
              {localizedDemoText(beat.proofLabel, language)}
            </span>
          </div>

          <div className="fd-demo-actions">
            {blocker && !canGoForward ? (
              <p className="fd-demo-blocker" role="status">
                {blocker}
              </p>
            ) : null}
            <div className="flex flex-wrap justify-end gap-2">
              <button
                className="fd-demo-button"
                disabled={index === 0}
                onClick={onPrevious}
                type="button"
              >
                {translated(language, "Previous beat", "Momento anterior")}
              </button>
              <button
                className="fd-demo-button is-primary"
                disabled={!canGoForward}
                onClick={onNext}
                type="button"
              >
                {index === DEMO_BEATS.length - 1
                  ? translated(language, "Demo complete", "Demo terminada")
                  : translated(language, "Next beat", "Siguiente momento")}
              </button>
              <button
                className="fd-demo-dismiss"
                onClick={onDismiss}
                type="button"
              >
                {translated(language, "Exit demo", "Salir de la demo")}
              </button>
            </div>
          </div>
        </div>
      </details>
    </aside>
  );
}
