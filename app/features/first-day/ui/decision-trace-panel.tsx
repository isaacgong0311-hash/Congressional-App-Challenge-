import type {
  DecisionTrace,
  DecisionTraceNode,
} from "../domain/decision-trace";
import {
  DOCUMENT_ES,
  FACT_ES,
  FACT_STATE_META,
  STATE_META,
  translated,
  type Language,
} from "./first-day-copy";
import { XIcon } from "./icons";

function readableState(state: NonNullable<DecisionTraceNode["state"]>) {
  return state.replaceAll("_", " ");
}

const REASON_ES: Record<string, string> = {
  "Every required fact is confirmed.":
    "Todos los datos necesarios están confirmados.",
  "One or more instructions are unclear or conflict with another source.":
    "Una o más instrucciones no están claras o contradicen otra fuente.",
  "A required fact or earlier task is not confirmed yet.":
    "Todavía falta confirmar un dato necesario o un paso anterior.",
  "Marked complete in this session.": "Marcado como terminado en esta sesión.",
  "A supporting source changed or was removed. Review this task before relying on it.":
    "Una fuente de apoyo cambió o fue eliminada. Revise este paso antes de usarlo.",
};

function localizedReason(reason: string, language: Language) {
  return language === "Español" ? REASON_ES[reason] ?? reason : reason;
}

function StatePill({
  language,
  node,
}: {
  language: Language;
  node: DecisionTraceNode;
}) {
  if (!node.state) return null;
  const taskState = STATE_META[node.state as keyof typeof STATE_META];
  const factState = FACT_STATE_META[node.state as keyof typeof FACT_STATE_META];
  const label = taskState
    ? language === "Español"
      ? taskState.es
      : taskState.en
    : factState
      ? language === "Español"
        ? factState.es
        : factState.en
      : readableState(node.state);
  return (
    <span className={`fd-trace-state ${factState?.className ?? ""}`}>
      {label}
    </span>
  );
}

function Stage({
  children,
  index,
  title,
}: {
  children: React.ReactNode;
  index: number;
  title: string;
}) {
  return (
    <li className="fd-trace-stage">
      <span aria-hidden="true" className="fd-trace-index">
        {index}
      </span>
      <div className="min-w-0 flex-1">
        <h5 className="fd-trace-stage-title">{title}</h5>
        <div className="fd-trace-stage-body">{children}</div>
      </div>
    </li>
  );
}

export function DecisionTracePanel({
  language,
  onClose,
  trace,
  title,
}: {
  language: Language;
  onClose: () => void;
  trace: DecisionTrace;
  title?: string;
}) {
  const displayTitle = title ?? trace.title;
  const facts = trace.nodes.filter((node) => node.kind === "fact");
  const evidence = trace.nodes.filter((node) => node.kind === "evidence");
  const documents = trace.nodes.filter((node) => node.kind === "document");
  const decisions = trace.nodes.filter((node) => node.kind === "decision");
  const dependencies = trace.nodes.filter(
    (node) => node.kind === "dependency",
  );
  const procedures = trace.nodes.filter((node) => node.kind === "procedure");
  const result = trace.nodes.find(
    (node) => node.kind === "task" && node.sourceId === trace.taskId,
  );

  function documentFor(evidenceNode: DecisionTraceNode) {
    const edge = trace.edges.find(
      (item) =>
        item.from === evidenceNode.id && item.relation === "quoted_from",
    );
    return documents.find((document) => document.id === edge?.to);
  }

  return (
    <aside
      aria-label={translated(
        language,
        `Decision trace: ${displayTitle}`,
        `Rastro de decisión: ${displayTitle}`,
      )}
      className="fd-trace-panel"
    >
      <header className="fd-trace-header">
        <div>
          <p className="fd-trace-kicker">
            {translated(
              language,
              "Decision provenance",
              "Procedencia de la decisión",
            )}
          </p>
          <h4>{displayTitle}</h4>
          <p>{localizedReason(trace.reason, language)}</p>
        </div>
        <button
          aria-label={translated(
            language,
            "Close decision trace",
            "Cerrar rastro de decisión",
          )}
          className="fd-trace-close"
          onClick={onClose}
          type="button"
        >
          <XIcon className="h-4 w-4" />
        </button>
      </header>

      <ol className="fd-trace-flow">
        <Stage
          index={1}
          title={translated(language, "Source evidence", "Evidencia original")}
        >
          <div className="fd-trace-grid">
            {evidence.map((node) => {
              const document = documentFor(node);
              return (
                <article className="fd-trace-node" key={node.id}>
                  <p className="fd-trace-node-label">
                    {(language === "Español" && document?.sourceId
                      ? DOCUMENT_ES[document.sourceId]
                      : document?.label) ??
                      translated(language, "Procedure record", "Registro del procedimiento")}
                  </p>
                  <blockquote>“{node.detail}”</blockquote>
                  <p className="fd-trace-provenance">{node.label}</p>
                </article>
              );
            })}
          </div>
          {procedures.length > 0 ? (
            <details className="fd-trace-rules">
              <summary>
                {translated(
                  language,
                  `${procedures.length} supporting rule${procedures.length === 1 ? "" : "s"}`,
                  `${procedures.length} regla${procedures.length === 1 ? "" : "s"} de apoyo`,
                )}
              </summary>
              {procedures.map((node) => (
                <p key={node.id}>
                  <b>{node.label}:</b> {node.detail}
                </p>
              ))}
            </details>
          ) : null}
        </Stage>

        <Stage
          index={2}
          title={translated(language, "Proposed facts", "Datos propuestos")}
        >
          <div className="fd-trace-grid">
            {facts.map((node) => (
              <article className="fd-trace-node" key={node.id}>
                <div className="fd-trace-node-heading">
                  <p className="fd-trace-node-label">
                    {language === "Español" && node.sourceId
                      ? FACT_ES[node.sourceId] ?? node.label
                      : node.label}
                  </p>
                  <StatePill language={language} node={node} />
                </div>
                <p className="fd-trace-value">{node.detail}</p>
              </article>
            ))}
          </div>
        </Stage>

        <Stage
          index={3}
          title={translated(language, "Human decision", "Decisión humana")}
        >
          {decisions.length > 0 ? (
            decisions.map((node) => (
              <article className="fd-trace-node is-decision" key={node.id}>
                <p className="fd-trace-node-label">
                  {translated(
                    language,
                    node.label,
                    "Confirmación de la escuela registrada",
                  )}
                </p>
                <p className="fd-trace-value">{node.detail}</p>
                <p className="fd-trace-provenance">
                  {translated(
                    language,
                    "Recorded as an immutable case event",
                    "Registrada como un evento inmutable del caso",
                  )}
                </p>
              </article>
            ))
          ) : (
            <p className="fd-trace-empty">
              {translated(
                language,
                "No human confirmation has been recorded yet.",
                "Todavía no se ha registrado una confirmación humana.",
              )}
            </p>
          )}
        </Stage>

        <Stage
          index={4}
          title={translated(language, "Dependency logic", "Lógica de dependencia")}
        >
          <ul className="fd-trace-dependencies">
            {dependencies.map((node) => (
              <li key={node.id}>
                <b>{node.label}</b>
                <span>{node.detail}</span>
              </li>
            ))}
          </ul>
        </Stage>

        <Stage
          index={5}
          title={translated(language, "Plan result", "Resultado del plan")}
        >
          <article className="fd-trace-node is-result">
            <div className="fd-trace-node-heading">
              <p className="fd-trace-node-label">{displayTitle}</p>
              {result ? <StatePill language={language} node={result} /> : null}
            </div>
            <p className="fd-trace-value">
              {localizedReason(trace.reason, language)}
            </p>
          </article>
          {trace.warnings.length > 0 ? (
            <div className="fd-trace-warnings" role="status">
              <b>{translated(language, "Trace warnings", "Avisos del rastro")}</b>
              <ul>
                {trace.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </Stage>
      </ol>
    </aside>
  );
}
