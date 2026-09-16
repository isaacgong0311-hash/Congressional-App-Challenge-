import type { PlannerResult } from "../domain/types";
import {
  STATE_META,
  TASK_ES,
  translated,
  type Language,
} from "./first-day-copy";
import { Eyebrow, SourceButton } from "./first-day-shared";
import { CheckIcon, MessageIcon } from "./icons";

export type PlanStepProps = {
  language: Language;
  plan: PlannerResult;
  onCompleteTask: (taskId: string) => void;
  onShowTaskSource: (taskId: string, trigger: HTMLButtonElement) => void;
  onResolveTask: () => void;
};

export function PlanStep({
  language,
  plan,
  onCompleteTask,
  onShowTaskSource,
  onResolveTask,
}: PlanStepProps) {
  const sourceLabel = translated(language, "Show source", "Ver fuente");

  return (
    <section className="fd-enter">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <Eyebrow>
            {translated(
              language,
              "Step 4 · My plan",
              "Paso 4 · Mi plan",
            )}
          </Eyebrow>
          <h1 className="fd-page-title">
            {translated(
              language,
              "What to do next, and why.",
              "Qué hacer ahora y por qué.",
            )}
          </h1>
        </div>
        <div className="rounded-2xl border border-[#dce2dd] bg-white px-4 py-3 text-sm text-[#52605a] shadow-sm">
          <strong className="text-[#1f3028]">{plan.tasks.length}</strong>{" "}
          {translated(
            language,
            "steps · updated instantly",
            "pasos · actualizados al instante",
          )}
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {(Object.keys(STATE_META) as Array<keyof typeof STATE_META>).map(
          (state) => {
            const tasks = plan.tasks.filter((task) => task.state === state);
            if (tasks.length === 0) return null;
            const meta = STATE_META[state];
            const StateIcon = meta.icon;
            return (
              <section key={state}>
                <div className="mb-3 flex items-center gap-2">
                  <StateIcon className="h-5 w-5 text-[#40534a]" />
                  <h2 className="text-sm font-bold uppercase tracking-[0.16em] text-[#40534a]">
                    {language === "Español" ? meta.es : meta.en}
                  </h2>
                  <span className="rounded-full bg-[#e4e8e4] px-2 py-0.5 text-xs font-bold text-[#66726c]">
                    {tasks.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {tasks.map((task) => {
                    const taskCopy =
                      language === "Español" ? TASK_ES[task.id] : task;
                    return (
                      <article
                        className={`fd-task-card ${meta.className}`}
                        key={task.id}
                      >
                        <div className="flex min-w-0 flex-1 gap-4">
                          <span className="fd-task-icon">
                            <StateIcon className="h-5 w-5" />
                          </span>
                          <div className="min-w-0">
                            <h3 className="text-lg font-semibold tracking-[-0.02em]">
                              {taskCopy.title}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-[#52615a]">
                              {taskCopy.action}
                            </p>
                            <p className="mt-2 text-xs font-medium leading-5 text-[#5f6d66]">
                              {language === "Español"
                                ? taskCopy.detail
                                : `${task.detail} ${task.reason}`}
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <SourceButton
                                label={sourceLabel}
                                onClick={(button) =>
                                  onShowTaskSource(task.id, button)
                                }
                              />
                              {task.state === "ready" ? (
                                <button
                                  className="fd-confirm-button"
                                  onClick={() => onCompleteTask(task.id)}
                                  type="button"
                                >
                                  <CheckIcon className="h-4 w-4" />
                                  {translated(
                                    language,
                                    "Mark done",
                                    "Marcar terminado",
                                  )}
                                </button>
                              ) : null}
                              {task.state === "needs_clarification" ? (
                                <button
                                  className="fd-clarify-button"
                                  onClick={onResolveTask}
                                  type="button"
                                >
                                  <MessageIcon className="h-4 w-4" />
                                  {translated(
                                    language,
                                    "Resolve this",
                                    "Resolver",
                                  )}
                                </button>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          },
        )}
      </div>
    </section>
  );
}
