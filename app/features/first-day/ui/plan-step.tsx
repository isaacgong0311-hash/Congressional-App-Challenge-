import type { FirstDayCase, PlannerResult } from "../domain/types";
import {
  STATE_META,
  localizedTaskCopy,
  translated,
  type Language,
} from "./first-day-copy";
import {
  filterPlanTasks,
  prioritizedPlanTasks,
  type PresentationMode,
  type TaskFilter,
} from "./first-day-view";
import { currentFactView, Eyebrow, SourceButton } from "./first-day-shared";
import { CheckIcon, MessageIcon } from "./icons";

export type PlanStepProps = {
  caseData: FirstDayCase;
  language: Language;
  plan: PlannerResult;
  taskFilter: TaskFilter;
  highlightedTaskId: string | null;
  presentationMode: PresentationMode;
  onTaskFilterChange: (filter: TaskFilter) => void;
  onCompleteTask: (taskId: string) => void;
  onUndoTask: (taskId: string) => void;
  onShowTaskSource: (taskId: string, trigger: HTMLButtonElement) => void;
  onResolveTask: (taskId: string) => void;
};

const FILTERS: Array<{ id: TaskFilter; en: string; es: string }> = [
  { id: "all", en: "All", es: "Todos" },
  { id: "attention", en: "Attention", es: "Atención" },
  { id: "ready", en: "Ready", es: "Listos" },
  { id: "done", en: "Done", es: "Terminados" },
];

export function PlanStep({
  caseData,
  highlightedTaskId,
  language,
  onCompleteTask,
  onResolveTask,
  onShowTaskSource,
  onTaskFilterChange,
  onUndoTask,
  plan,
  presentationMode,
  taskFilter,
}: PlanStepProps) {
  const sourceLabel = translated(language, "Show source", "Ver fuente");
  const ordered = prioritizedPlanTasks(plan.tasks);
  const visibleTasks = filterPlanTasks(plan.tasks, taskFilter);
  const bestNext = ordered.find((task) => task.state !== "done");
  const highlightedTask = highlightedTaskId
    ? plan.tasks.find((task) => task.id === highlightedTaskId)
    : undefined;
  const summary = {
    attention: plan.tasks.filter(
      (task) =>
        task.state === "needs_clarification" || task.state === "needs_review",
    ).length,
    ready: plan.tasks.filter((task) => task.state === "ready").length,
    waiting: plan.tasks.filter((task) => task.state === "waiting").length,
    done: plan.tasks.filter((task) => task.state === "done").length,
  };

  return (
    <section className="fd-enter">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <Eyebrow>
            {translated(language, "Step 4 · My plan", "Paso 4 · Mi plan")}
          </Eyebrow>
          <h1 className="fd-page-title">
            {translated(
              language,
              "What to do next, and why.",
              "Qué hacer ahora y por qué.",
            )}
          </h1>
        </div>
        <p className="max-w-xs text-sm leading-6 text-muted">
          {translated(
            language,
            "Task states come from confirmed facts, explicit dependencies, and reviewed procedures.",
            "Los estados usan datos confirmados, dependencias explícitas y procedimientos revisados.",
          )}
        </p>
      </div>

      {presentationMode === "guided_demo" && highlightedTask ? (
        <aside
          aria-live="polite"
          className="fd-focused-update mt-7"
          data-demo-target="true"
        >
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-cobalt">
              {translated(language, "One answer · one focused update", "Una respuesta · una actualización precisa")}
            </p>
            <h2 className="mt-2 text-xl font-bold tracking-[-0.025em]">
              {localizedTaskCopy(highlightedTask, language).title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {translated(
                language,
                "The school-reported answer changed this dependent task. Unrelated work kept its previous state.",
                "La respuesta informada por la escuela cambió este paso dependiente. El trabajo no relacionado conservó su estado anterior.",
              )}
            </p>
          </div>
          <div className="fd-focused-transition" aria-label={translated(language, "Task status changed", "El estado del paso cambió")}>
            <span>{translated(language, "Needs clarification", "Necesita aclaración")}</span>
            <b aria-hidden="true">→</b>
            <span className="is-current">
              {language === "Español"
                ? STATE_META[highlightedTask.state].es
                : STATE_META[highlightedTask.state].en}
            </span>
          </div>
        </aside>
      ) : null}

      <dl className="mt-8 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          [summary.attention, "Needs attention", "Necesita atención", "text-[#704c0e] bg-[#fff3d5]"],
          [summary.ready, "Ready now", "Listo ahora", "text-cobalt bg-[#eaf0ff]"],
          [summary.waiting, "Waiting", "En espera", "text-[#4c5952] bg-[#edf0ed]"],
          [summary.done, "Done", "Terminado", "text-[#24633a] bg-[#e3f4e8]"],
        ].map(([value, en, es, style]) => (
          <div
            className={`rounded-card p-4 ${style} ${
              highlightedTask && en === "Ready now" ? "fd-count-updated" : ""
            }`}
            key={String(en)}
          >
            <dd className="text-3xl font-black tracking-[-0.04em]">{value}</dd>
            <dt className="mt-1 text-xs font-bold uppercase tracking-[0.12em]">
              {translated(language, String(en), String(es))}
            </dt>
          </div>
        ))}
      </dl>

      {bestNext ? (
        <div className="mt-5 rounded-feature border border-cobalt/20 bg-[#eef2ff] p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-cobalt">
              {translated(language, "Best next step", "Mejor paso siguiente")}
            </p>
            <p className="mt-2 text-xl font-bold tracking-[-0.025em] text-ink">
              {localizedTaskCopy(bestNext, language).title}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#53628b]">
              {localizedTaskCopy(bestNext, language).action}
            </p>
          </div>
          {bestNext.state === "needs_clarification" ? (
            <button className="fd-clarify-button mt-4 shrink-0 sm:mt-0" data-demo-target="true" onClick={() => onResolveTask(bestNext.id)} type="button">
              <MessageIcon className="h-4 w-4" />
              {translated(language, "Resolve this", "Resolver")}
            </button>
          ) : bestNext.state === "ready" ? (
            <button className="fd-confirm-button mt-4 shrink-0 sm:mt-0" data-demo-target="true" onClick={() => onCompleteTask(bestNext.id)} type="button">
              <CheckIcon className="h-4 w-4" />
              {translated(language, "Mark done", "Marcar terminado")}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 flex gap-2 overflow-x-auto pb-1" role="group" aria-label={translated(language, "Filter plan steps", "Filtrar pasos del plan")}>
        {FILTERS.map((filter) => (
          <button
            aria-pressed={taskFilter === filter.id}
            className={`min-h-11 shrink-0 rounded-xl px-4 text-sm font-bold transition ${
              taskFilter === filter.id
                ? "bg-ink text-white"
                : "border border-ink/10 bg-white text-muted hover:text-ink"
            }`}
            key={filter.id}
            onClick={() => onTaskFilterChange(filter.id)}
            type="button"
          >
            {language === "Español" ? filter.es : filter.en}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-8">
        {(["needs_clarification", "ready", "needs_review", "waiting", "done"] as Array<keyof typeof STATE_META>).map(
          (state) => {
            const tasks = visibleTasks.filter((task) => task.state === state);
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
                    const taskCopy = localizedTaskCopy(task, language);
                    const supportCount = task.evidenceIds.length + task.procedureIds.length;
                    const supportingDocument = task.evidenceIds
                      .map((evidenceId) => caseData.evidence.find((evidence) => evidence.id === evidenceId))
                      .map((evidence) => caseData.documents.find((document) => document.id === evidence?.documentId)?.label)
                      .find(Boolean);
                    const primaryEvidence = caseData.evidence.find(
                      (evidence) => evidence.id === task.evidenceIds[0],
                    );
                    const dateFact = task.targetDateFactId
                      ? caseData.facts.find((fact) => fact.id === task.targetDateFactId)
                      : undefined;
                    const confirmedDate = dateFact && currentFactView(caseData, dateFact).state === "confirmed"
                      ? currentFactView(caseData, dateFact).value
                      : undefined;
                    return (
                      <article
                        className={`fd-task-card ${meta.className} ${highlightedTaskId === task.id ? "fd-task-highlight" : ""}`}
                        key={task.id}
                      >
                        <div className="flex min-w-0 flex-1 gap-4">
                          <span className="fd-task-icon">
                            <StateIcon className="h-5 w-5" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                              <h3 className="text-lg font-semibold tracking-[-0.02em]">{taskCopy.title}</h3>
                              <span className={`fd-fact-state ${meta.className}`}>{language === "Español" ? meta.es : meta.en}</span>
                            </div>
                            <p className="mt-2 text-sm leading-6 text-[#52615a]">{taskCopy.action}</p>
                            {confirmedDate ? (
                              <p className="mt-2 text-sm font-bold text-confirmed">
                                {translated(language, "Confirmed date", "Fecha confirmada")}: {confirmedDate}
                              </p>
                            ) : null}
                            <details
                              className="fd-task-reason mt-4 rounded-xl border border-ink/10 bg-canvas/70 px-4"
                              open={presentationMode === "guided_demo" && highlightedTaskId === task.id ? true : undefined}
                            >
                              <summary className="min-h-11 cursor-pointer py-3 text-sm font-bold text-ink">
                                {translated(language, "Why this status?", "¿Por qué este estado?")}
                              </summary>
                              <div className="border-t border-ink/10 pb-4 pt-3">
                                <p className="text-xs font-medium leading-5 text-[#5f6d66]">
                                  {language === "Español" ? taskCopy.detail : `${task.detail} ${task.reason}`}
                                </p>
                                <p className="mt-3 text-xs font-semibold text-muted">
                                  {translated(language, "Supported by", "Respaldado por")}: {supportingDocument ?? translated(language, `${supportCount} source record${supportCount === 1 ? "" : "s"}`, `${supportCount} registro${supportCount === 1 ? "" : "s"} de fuente`)}
                                </p>
                                {primaryEvidence ? (
                                  <blockquote className="mt-3 rounded-xl border border-ink/10 bg-white px-4 py-3 text-sm leading-6 text-[#445249]">
                                    “{primaryEvidence.quote}”
                                  </blockquote>
                                ) : null}
                              </div>
                            </details>
                            <div className="mt-4 flex flex-wrap gap-2">
                              <SourceButton label={sourceLabel} onClick={(button) => onShowTaskSource(task.id, button)} />
                              {task.state === "ready" ? (
                                <button className="fd-confirm-button" onClick={() => onCompleteTask(task.id)} type="button">
                                  <CheckIcon className="h-4 w-4" />
                                  {translated(language, "Mark done", "Marcar terminado")}
                                </button>
                              ) : null}
                              {task.state === "needs_clarification" ? (
                                <button className="fd-clarify-button" onClick={() => onResolveTask(task.id)} type="button">
                                  <MessageIcon className="h-4 w-4" />
                                  {translated(language, "Resolve this", "Resolver")}
                                </button>
                              ) : null}
                              {task.state === "done" ? (
                                <button className="fd-secondary-button" onClick={() => onUndoTask(task.id)} type="button">
                                  {translated(language, "Return to plan", "Devolver al plan")}
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
        {visibleTasks.length === 0 ? (
          <div className="rounded-feature border border-dashed border-ink/20 bg-white/60 p-8 text-center">
            <p className="font-bold">{translated(language, "No steps in this view.", "No hay pasos en esta vista.")}</p>
            <p className="mt-2 text-sm text-muted">{translated(language, "Choose another filter to see the complete plan.", "Elija otro filtro para ver el plan completo.")}</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
