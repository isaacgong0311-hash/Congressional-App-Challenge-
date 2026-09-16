"use client";

import Link from "next/link";
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  appendFactConfirmation,
  appendFactCorrection,
  appendTaskCompletion,
} from "../domain/events";
import { planCase } from "../domain/planner";
import type {
  CaseEvent,
  ConfirmationState,
  Fact,
  FirstDayCase,
  PlanState,
} from "../domain/types";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  CircleCheckIcon,
  ClockIcon,
  DocumentIcon,
  EyeIcon,
  LanternIcon,
  MessageIcon,
  PrinterIcon,
  ShieldIcon,
  SparkIcon,
  WarningIcon,
} from "./icons";
import { SourcePanel } from "./source-panel";

type StepId = "start" | "documents" | "facts" | "plan" | "blocker" | "export";
type Language = FirstDayCase["language"];

const STEPS: { id: StepId; en: string; es: string }[] = [
  { id: "start", en: "Start", es: "Inicio" },
  { id: "documents", en: "Documents", es: "Documentos" },
  { id: "facts", en: "Review facts", es: "Revisar datos" },
  { id: "plan", en: "My plan", es: "Mi plan" },
  { id: "blocker", en: "Resolve", es: "Resolver" },
  { id: "export", en: "Take it with me", es: "Llevar conmigo" },
];

const STATE_META: Record<
  PlanState,
  { en: string; es: string; icon: typeof CircleCheckIcon; className: string }
> = {
  ready: {
    en: "Ready",
    es: "Listo",
    icon: SparkIcon,
    className: "fd-state-ready",
  },
  needs_clarification: {
    en: "Needs clarification",
    es: "Necesita aclaración",
    icon: WarningIcon,
    className: "fd-state-clarify",
  },
  waiting: {
    en: "Waiting",
    es: "En espera",
    icon: ClockIcon,
    className: "fd-state-waiting",
  },
  done: {
    en: "Done",
    es: "Terminado",
    icon: CircleCheckIcon,
    className: "fd-state-done",
  },
  needs_review: {
    en: "Needs review",
    es: "Necesita revisión",
    icon: EyeIcon,
    className: "fd-state-review",
  },
};

const TASK_ES: Record<string, { title: string; action: string; detail: string }> = {
  "task-registration": {
    title: "Ir a la reunión de inscripción",
    action: "Lleve a Maya y la carta de bienvenida al Centro de Bienvenida.",
    detail: "La fecha y el lugar están confirmados en la carta ficticia.",
  },
  "task-health-records": {
    title: "Prepararse para el paso de salud",
    action: "Lleve el registro de vacunas o use la cita confirmada con la enfermera.",
    detail: "Este procedimiento ficticio permite cualquiera de las dos opciones.",
  },
  "task-orientation": {
    title: "Confirmar dónde empieza la orientación",
    action: "Pregunte si la familia debe entrar por la cafetería o el gimnasio.",
    detail: "Dos documentos indican lugares diferentes para la misma orientación.",
  },
  "task-interpreter": {
    title: "Decidir si quiere un intérprete",
    action: "Responda a la escuela si un intérprete sería útil.",
    detail: "La escuela ofrece ayuda de idioma, pero falta confirmar la preferencia.",
  },
  "task-first-day-ready": {
    title: "Revisar el plan final",
    action: "Revise los pasos de inscripción y salud antes del primer día.",
    detail: "Este resumen espera hasta que se terminen los dos pasos anteriores.",
  },
};

const FACT_ES: Record<string, string> = {
  "fact-registration-date": "Reunión de inscripción",
  "fact-registration-location": "Lugar de inscripción",
  "fact-immunization-record": "Registro de vacunas disponible",
  "fact-nurse-review": "Revisión con la enfermera",
  "fact-orientation-cafeteria": "Lugar de orientación",
  "fact-orientation-gym": "Lugar de orientación",
  "fact-interpreter-preference": "Intérprete solicitado",
};

const DOCUMENT_ES: Record<string, string> = {
  "doc-welcome-letter": "Carta de bienvenida para inscripción",
  "doc-health-note": "Nota de la oficina de salud",
  "doc-follow-up-message": "Mensaje de seguimiento de la escuela",
};

const FACT_STATE_META: Record<
  ConfirmationState,
  { en: string; es: string; className: string }
> = {
  proposed: { en: "Check this", es: "Revisar", className: "fd-fact-proposed" },
  confirmed: { en: "Confirmed", es: "Confirmado", className: "fd-fact-confirmed" },
  unclear: { en: "Unclear", es: "No está claro", className: "fd-fact-unclear" },
  conflicted: { en: "Conflicting", es: "En conflicto", className: "fd-fact-conflicted" },
  superseded: { en: "Not selected", es: "No seleccionado", className: "fd-fact-superseded" },
};

function translated(language: Language, english: string, spanish: string) {
  return language === "Español" ? spanish : english;
}

function isFactChangeEvent(
  event: CaseEvent,
): event is Extract<
  CaseEvent,
  { type: "fact_confirmed" | "fact_corrected" }
> {
  return event.type === "fact_confirmed" || event.type === "fact_corrected";
}

function currentFactView(caseData: FirstDayCase, fact: Fact) {
  let value = fact.originalValue;
  let state = fact.confirmationState;

  for (const event of caseData.events) {
    if (event.type === "fact_confirmed" && event.factId === fact.id) {
      state = "confirmed";
    }
    if (event.type === "fact_corrected" && event.factId === fact.id) {
      state = "confirmed";
      value = event.value;
    }
  }

  const conflict = caseData.conflicts.find((item) => item.factIds.includes(fact.id));
  if (conflict) {
    const selected = [...caseData.events]
      .reverse()
      .filter(isFactChangeEvent)
      .find((event) => conflict.factIds.includes(event.factId));
    if (selected && selected.factId !== fact.id) state = "superseded";
  }

  return { state, value };
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#52625c]">
      {children}
    </p>
  );
}

function SourceButton({
  label,
  onClick,
}: {
  label: string;
  onClick: (button: HTMLButtonElement) => void;
}) {
  return (
    <button
      className="fd-source-button"
      onClick={(event) => onClick(event.currentTarget)}
      type="button"
    >
      <EyeIcon className="h-4 w-4" />
      {label}
    </button>
  );
}

export function FirstDayWorkspace({ initialCase }: { initialCase: FirstDayCase }) {
  const [caseData, setCaseData] = useState(initialCase);
  const [currentStep, setCurrentStep] = useState<StepId>("start");
  const [language, setLanguage] = useState<Language>(initialCase.language);
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const sourceTriggerRef = useRef<HTMLButtonElement | null>(null);
  const eventSequence = useRef(0);

  const plan = useMemo(() => planCase(caseData), [caseData]);
  const activeStepIndex = STEPS.findIndex((step) => step.id === currentStep);
  const openEvidence = sourceId
    ? caseData.evidence.find((evidence) => evidence.id === sourceId)
    : undefined;
  const openDocument = openEvidence?.documentId
    ? caseData.documents.find((document) => document.id === openEvidence.documentId)
    : undefined;
  const openProcedure = openEvidence?.procedureId
    ? caseData.procedures.find((procedure) => procedure.id === openEvidence.procedureId)
    : undefined;

  function nextEventId(label: string) {
    eventSequence.current += 1;
    return `event-ui-${label}-${eventSequence.current}`;
  }

  function openSource(evidenceId: string, trigger: HTMLButtonElement) {
    sourceTriggerRef.current = trigger;
    setSourceId(evidenceId);
  }

  const closeSource = useCallback(() => {
    setSourceId(null);
    window.requestAnimationFrame(() => sourceTriggerRef.current?.focus());
  }, []);

  function confirmFact(factId: string) {
    setCaseData((current) =>
      appendFactConfirmation(current, {
        id: nextEventId("fact"),
        factId,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  function completeTask(taskId: string) {
    setCaseData((current) =>
      appendTaskCompletion(current, {
        id: nextEventId("task"),
        taskId,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  function resolveOrientation() {
    setCaseData((current) =>
      appendFactCorrection(current, {
        id: nextEventId("orientation"),
        factId: "fact-orientation-gym",
        value:
          language === "Español"
            ? "Entrada del gimnasio — confirmada por la oficina escolar"
            : "Gym entrance — confirmed by the school office",
        timestamp: new Date().toISOString(),
      }),
    );
    setCurrentStep("plan");
  }

  function showTaskSource(taskId: string, trigger: HTMLButtonElement) {
    const task = caseData.tasks.find((item) => item.id === taskId);
    const evidenceId = task?.evidenceIds[0];
    if (evidenceId) openSource(evidenceId, trigger);
  }

  function goForward() {
    const next = STEPS[Math.min(activeStepIndex + 1, STEPS.length - 1)];
    setCurrentStep(next.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    const previous = STEPS[Math.max(activeStepIndex - 1, 0)];
    setCurrentStep(previous.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const copy = {
    source: translated(language, "Show source", "Ver fuente"),
    continue: translated(language, "Continue", "Continuar"),
    back: translated(language, "Back", "Atrás"),
  };

  return (
    <div
      className="fd-app min-h-screen bg-[#f2f4ef] text-[#14241e]"
      data-fd-hc={highContrast ? "true" : "false"}
      data-fd-lt={largeText ? "true" : "false"}
    >
      <header className="fd-header print:hidden">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-4 py-4 sm:px-7 lg:px-10">
          <div className="flex items-center gap-3">
            <Link className="fd-back-link" href="/">
              <ArrowLeftIcon className="h-4 w-4" />
              <span className="hidden sm:inline">
                {translated(language, "All Lantern tools", "Todas las herramientas")}
              </span>
            </Link>
            <span className="hidden h-5 w-px bg-[#ced5d0] sm:block" />
            <div className="flex items-center gap-2 font-semibold tracking-[-0.02em]">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#15251f] text-[#f9cb69] shadow-sm">
                <LanternIcon className="h-5 w-5" />
              </span>
              <span>Lantern</span>
              <span className="font-normal text-[#7a857f]">/ First Day</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-pressed={largeText}
              className="fd-utility-button hidden sm:inline-flex"
              onClick={() => setLargeText((value) => !value)}
              type="button"
            >
              Aa
            </button>
            <button
              aria-pressed={highContrast}
              className="fd-utility-button hidden sm:inline-flex"
              onClick={() => setHighContrast((value) => !value)}
              type="button"
            >
              ◐
            </button>
            <div className="flex rounded-xl border border-[#d8deda] bg-white p-1 text-xs font-semibold shadow-sm">
              {(["English", "Español"] as const).map((option) => (
                <button
                  aria-pressed={language === option}
                  className={`rounded-lg px-3 py-2 transition-colors ${
                    language === option
                      ? "bg-[#15251f] text-white"
                      : "text-[#637069] hover:bg-[#f1f3ef]"
                  }`}
                  key={option}
                  onClick={() => setLanguage(option)}
                  type="button"
                >
                  {option === "English" ? "EN" : "ES"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className="border-y border-[#f1c76f]/50 bg-[#fff8df] px-4 py-2.5 text-center text-xs font-semibold text-[#71551c] print:border-[#999] print:bg-white print:text-black">
        {translated(
          language,
          "Fictional demonstration · Mesa View is not a real district",
          "Demostración ficticia · Mesa View no es un distrito real",
        )}
      </div>

      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-8 px-4 py-6 sm:px-7 lg:grid-cols-[250px_minmax(0,1fr)] lg:px-10 lg:py-10">
        <aside className="print:hidden lg:sticky lg:top-6 lg:self-start">
          <nav aria-label="First Day progress" className="fd-step-nav">
            <div className="mb-5 px-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7a857f]">
                {translated(language, "Your path", "Su camino")}
              </p>
              <p className="mt-2 text-sm leading-6 text-[#55625c]">
                {translated(
                  language,
                  "Nothing changes the plan until you confirm it.",
                  "Nada cambia el plan hasta que usted lo confirme.",
                )}
              </p>
            </div>
            <ol className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
              {STEPS.map((step, index) => {
                const active = step.id === currentStep;
                const visited = index < activeStepIndex;
                return (
                  <li className="min-w-max lg:min-w-0" key={step.id}>
                    <button
                      aria-current={active ? "step" : undefined}
                      className={`fd-step-button ${active ? "is-active" : ""}`}
                      onClick={() => setCurrentStep(step.id)}
                      type="button"
                    >
                      <span
                        className={`fd-step-number ${visited ? "is-visited" : ""}`}
                      >
                        {visited ? <CheckIcon className="h-4 w-4" /> : index + 1}
                      </span>
                      <span>{language === "Español" ? step.es : step.en}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="mt-5 hidden rounded-3xl border border-[#dce2dd] bg-white/70 p-5 text-sm leading-6 text-[#59665f] shadow-sm lg:block">
            <ShieldIcon className="mb-3 text-[#3556d4]" />
            <strong className="block text-[#1e2d27]">
              {translated(language, "Private by default", "Privado por defecto")}
            </strong>
            {translated(
              language,
              "This demo stays in this page. No account or cloud case history.",
              "Esta demo queda en esta página. Sin cuenta ni historial en la nube.",
            )}
          </div>
        </aside>

        <main className="min-w-0 pb-16">
          {currentStep === "start" ? (
            <section className="fd-enter">
              <div className="fd-hero overflow-hidden rounded-[2rem] border border-[#dce2dc] bg-[#fbfcf8] shadow-[0_24px_80px_rgba(24,46,38,.08)]">
                <div className="grid lg:grid-cols-[1.08fr_.92fr]">
                  <div className="p-7 sm:p-10 lg:p-14">
                    <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#cad6ff] bg-[#edf1ff] px-3 py-1.5 text-xs font-bold text-[#3556d4]">
                      <SparkIcon className="h-4 w-4" />
                      {translated(language, "A calmer first day", "Un primer día más tranquilo")}
                    </div>
                    <Eyebrow>
                      {translated(language, "Lantern · First Day", "Lantern · Primer Día")}
                    </Eyebrow>
                    <h1 className="max-w-2xl text-balance font-serif text-5xl leading-[1.03] tracking-[-0.04em] text-[#12221c] sm:text-6xl">
                      {translated(
                        language,
                        "School instructions, turned into a plan you can trust.",
                        "Instrucciones escolares convertidas en un plan confiable.",
                      )}
                    </h1>
                    <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-[#59665f] sm:text-lg sm:leading-8">
                      {translated(
                        language,
                        "Bring related letters together, check every important fact against its source, and see what is ready, waiting, or unclear.",
                        "Reúna cartas relacionadas, revise cada dato importante con su fuente y vea qué está listo, en espera o no está claro.",
                      )}
                    </p>
                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <button
                        className="fd-primary-button"
                        onClick={() => setCurrentStep("documents")}
                        type="button"
                      >
                        {translated(language, "Open the sample case", "Abrir el caso de ejemplo")}
                        <ArrowRightIcon className="h-5 w-5" />
                      </button>
                      <span className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d9dfda] bg-white px-5 py-3.5 text-sm font-semibold text-[#68746e]">
                        <ShieldIcon className="h-4 w-4" />
                        {translated(language, "No account needed", "No necesita una cuenta")}
                      </span>
                    </div>
                  </div>

                  <div className="fd-hero-visual relative min-h-[390px] overflow-hidden border-t border-[#dce2dc] bg-[#182c24] p-7 text-white lg:border-l lg:border-t-0 lg:p-10">
                    <div className="fd-orbit fd-orbit-one" />
                    <div className="fd-orbit fd-orbit-two" />
                    <div className="relative z-10 mx-auto max-w-md space-y-4 pt-4 lg:pt-10">
                      <div className="ml-8 rounded-3xl border border-white/15 bg-white/10 p-5 shadow-xl backdrop-blur-md">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f7c864] text-[#14241e]">
                            <DocumentIcon />
                          </span>
                          <div>
                            <p className="text-xs uppercase tracking-[0.16em] text-white/55">
                              {translated(language, "Source", "Fuente")}
                            </p>
                            <p className="font-semibold">
                              {translated(language, "Welcome letter", "Carta de bienvenida")}
                            </p>
                          </div>
                        </div>
                        <p className="mt-4 font-serif text-lg leading-7 text-white/90">
                          “Mesa View Welcome Center, 145 Oak Street…”
                        </p>
                      </div>
                      <div className="mr-7 rounded-3xl bg-white p-5 text-[#1b2d26] shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#708078]">
                              {translated(language, "Your next step", "Su próximo paso")}
                            </p>
                            <p className="mt-2 text-lg font-semibold">
                              {translated(language, "Go to enrollment", "Ir a la inscripción")}
                            </p>
                          </div>
                          <span className="rounded-full bg-[#dff3e5] px-3 py-1 text-xs font-bold text-[#23673a]">
                            {translated(language, "Ready", "Listo")}
                          </span>
                        </div>
                      </div>
                      <div className="ml-14 flex items-center gap-3 rounded-3xl border border-[#ffd778]/30 bg-[#ffc95d]/15 p-4 text-[#ffe7ad] backdrop-blur-md">
                        <WarningIcon />
                        <p className="text-sm font-semibold">
                          {translated(language, "Two locations need checking", "Hay que revisar dos lugares")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  [DocumentIcon, "3", "related documents", "documentos relacionados"],
                  [EyeIcon, "10", "source passages", "fragmentos de fuentes"],
                  [WarningIcon, "1", "conflict to resolve", "conflicto por resolver"],
                ].map(([Icon, value, en, es]) => (
                  <div className="fd-stat-card" key={String(en)}>
                    <Icon className="h-5 w-5 text-[#3556d4]" />
                    <span className="text-2xl font-bold tracking-[-0.03em]">{String(value)}</span>
                    <span className="text-sm text-[#65716b]">
                      {translated(language, String(en), String(es))}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {currentStep === "documents" ? (
            <section className="fd-enter">
              <Eyebrow>{translated(language, "Step 2 · Documents", "Paso 2 · Documentos")}</Eyebrow>
              <h1 className="fd-page-title">
                {translated(language, "One case, every instruction.", "Un caso, todas las instrucciones.")}
              </h1>
              <p className="fd-page-intro">
                {translated(
                  language,
                  "Each page keeps its own identity, extracted text, and processing status. A failed page would not erase the others.",
                  "Cada página conserva su identidad, texto extraído y estado. Una página con error no borraría las demás.",
                )}
              </p>

              <div className="mt-8 space-y-4">
                {caseData.documents.map((document, index) => {
                  const evidence = caseData.evidence.find(
                    (item) => item.documentId === document.id,
                  );
                  return (
                    <article className="fd-document-card" key={document.id}>
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e9edff] font-semibold text-[#3556d4]">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h2 className="text-lg font-semibold tracking-[-0.02em]">
                              {language === "Español"
                                ? DOCUMENT_ES[document.id]
                                : document.label}
                            </h2>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#7b8781]">
                              {translated(language, `Page ${document.pageIndex}`, `Página ${document.pageIndex}`)} · {document.sourceVersion}
                            </p>
                          </div>
                          <span className="fd-ready-pill">
                            <CircleCheckIcon className="h-4 w-4" />
                            {translated(language, "Text ready", "Texto listo")}
                          </span>
                        </div>
                        <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#5d6963]">
                          {document.extractedText}
                        </p>
                        {evidence ? (
                          <div className="mt-4">
                            <SourceButton
                              label={copy.source}
                              onClick={(button) => openSource(evidence.id, button)}
                            />
                          </div>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="mt-5 rounded-3xl border border-dashed border-[#bfc9c2] bg-white/50 p-6 text-center">
                <p className="font-semibold">
                  {translated(language, "Live uploads are the next milestone", "Las cargas reales son el próximo objetivo")}
                </p>
                <p className="mt-1 text-sm text-[#68756e]">
                  {translated(
                    language,
                    "This first build proves the evidence and planning flow with safe fictional documents.",
                    "Esta primera versión prueba el flujo con documentos ficticios seguros.",
                  )}
                </p>
              </div>
            </section>
          ) : null}

          {currentStep === "facts" ? (
            <section className="fd-enter">
              <Eyebrow>{translated(language, "Step 3 · Review facts", "Paso 3 · Revisar datos")}</Eyebrow>
              <h1 className="fd-page-title">
                {translated(language, "Check the facts that shape the plan.", "Revise los datos que forman el plan.")}
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
                          <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7a867f]">
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
                          label={copy.source}
                          onClick={(button) => openSource(fact.evidenceIds[0], button)}
                        />
                        {view.state === "proposed" ? (
                          <button
                            className="fd-confirm-button"
                            onClick={() => confirmFact(fact.id)}
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
          ) : null}

          {currentStep === "plan" ? (
            <section className="fd-enter">
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <Eyebrow>{translated(language, "Step 4 · My plan", "Paso 4 · Mi plan")}</Eyebrow>
                  <h1 className="fd-page-title">
                    {translated(language, "What to do next, and why.", "Qué hacer ahora y por qué.")}
                  </h1>
                </div>
                <div className="rounded-2xl border border-[#dce2dd] bg-white px-4 py-3 text-sm text-[#52605a] shadow-sm">
                  <strong className="text-[#1f3028]">{plan.tasks.length}</strong>{" "}
                  {translated(language, "steps · updated instantly", "pasos · actualizados al instante")}
                </div>
              </div>

              <div className="mt-8 space-y-8">
                {(Object.keys(STATE_META) as PlanState[]).map((state) => {
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
                          const taskCopy = language === "Español" ? TASK_ES[task.id] : task;
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
                                  <p className="mt-2 text-xs font-medium leading-5 text-[#7b8781]">
                                    {language === "Español"
                                      ? taskCopy.detail
                                      : `${task.detail} ${task.reason}`}
                                  </p>
                                  <div className="mt-4 flex flex-wrap gap-2">
                                    <SourceButton
                                      label={copy.source}
                                      onClick={(button) => showTaskSource(task.id, button)}
                                    />
                                    {task.state === "ready" ? (
                                      <button
                                        className="fd-confirm-button"
                                        onClick={() => completeTask(task.id)}
                                        type="button"
                                      >
                                        <CheckIcon className="h-4 w-4" />
                                        {translated(language, "Mark done", "Marcar terminado")}
                                      </button>
                                    ) : null}
                                    {task.state === "needs_clarification" ? (
                                      <button
                                        className="fd-clarify-button"
                                        onClick={() => setCurrentStep("blocker")}
                                        type="button"
                                      >
                                        <MessageIcon className="h-4 w-4" />
                                        {translated(language, "Resolve this", "Resolver")}
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
                })}
              </div>
            </section>
          ) : null}

          {currentStep === "blocker" ? (
            <section className="fd-enter">
              <Eyebrow>{translated(language, "Step 5 · Resolve a blocker", "Paso 5 · Resolver un bloqueo")}</Eyebrow>
              <h1 className="fd-page-title">
                {translated(language, "Two documents. One unanswered question.", "Dos documentos. Una pregunta sin respuesta.")}
              </h1>
              <p className="fd-page-intro">
                {translated(
                  language,
                  "Lantern does not assume the newest page is correct. Both passages stay visible until the family records a real confirmation.",
                  "Lantern no supone que la página más reciente sea correcta. Ambas fuentes siguen visibles hasta registrar una confirmación real.",
                )}
              </p>

              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                {[
                  {
                    title: translated(language, "Welcome letter", "Carta de bienvenida"),
                    value: translated(language, "School cafeteria", "Cafetería escolar"),
                    evidence: "evidence-orientation-cafeteria",
                  },
                  {
                    title: translated(language, "Follow-up message", "Mensaje de seguimiento"),
                    value: translated(language, "Gym entrance", "Entrada del gimnasio"),
                    evidence: "evidence-orientation-gym",
                  },
                ].map((option) => (
                  <article className="fd-conflict-card" key={option.evidence}>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#8a6721]">
                      <WarningIcon className="h-4 w-4" />
                      {option.title}
                    </div>
                    <p className="mt-5 font-serif text-3xl tracking-[-0.03em]">
                      {option.value}
                    </p>
                    <div className="mt-5">
                      <SourceButton
                        label={copy.source}
                        onClick={(button) => openSource(option.evidence, button)}
                      />
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-6 rounded-[2rem] border border-[#ccd6ff] bg-[#eef2ff] p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#3556d4] text-white">
                    <MessageIcon />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5369bd]">
                      {translated(language, "Prepared question", "Pregunta preparada")}
                    </p>
                    <p className="mt-3 text-lg font-semibold leading-7 text-[#26386f]">
                      {translated(
                        language,
                        "Hello, Maya’s welcome letter says orientation is in the cafeteria, but the follow-up says to use the gym entrance. Where should our family go first?",
                        "Hola. La carta de Maya dice que la orientación es en la cafetería, pero el mensaje dice que usemos la entrada del gimnasio. ¿A dónde debemos ir primero?",
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-[#dce2dd] bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold">
                  {translated(language, "Demo resolution", "Resolución de demostración")}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#66736c]">
                  {translated(
                    language,
                    "For this fictional story, imagine the school office confirms the gym entrance. Recording that confirmation updates only the affected task.",
                    "En esta historia ficticia, imagine que la oficina confirma la entrada del gimnasio. Registrar esa confirmación actualiza solo el paso afectado.",
                  )}
                </p>
                <button
                  className="fd-primary-button mt-5"
                  onClick={resolveOrientation}
                  type="button"
                >
                  <CheckIcon className="h-5 w-5" />
                  {translated(language, "Record fictional confirmation", "Registrar confirmación ficticia")}
                </button>
              </div>
            </section>
          ) : null}

          {currentStep === "export" ? (
            <section className="fd-enter">
              <div className="print:hidden">
                <Eyebrow>{translated(language, "Step 6 · Take it with me", "Paso 6 · Llevar conmigo")}</Eyebrow>
                <h1 className="fd-page-title">
                  {translated(language, "A plan the family can carry.", "Un plan que la familia puede llevar.")}
                </h1>
                <p className="fd-page-intro">
                  {translated(
                    language,
                    "Print the plan with its sources and unresolved items. Confirmed information and fictional rules stay clearly labeled.",
                    "Imprima el plan con sus fuentes y asuntos pendientes. La información confirmada y las reglas ficticias siguen claramente marcadas.",
                  )}
                </p>
              </div>

              <article className="fd-print-plan mt-8 rounded-[2rem] border border-[#d9dfda] bg-white p-6 shadow-[0_20px_70px_rgba(24,46,38,.08)] sm:p-10">
                <div className="flex flex-col justify-between gap-5 border-b border-[#dfe4df] pb-7 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex items-center gap-2 text-[#2f50c9]">
                      <LanternIcon />
                      <span className="text-sm font-bold">Lantern · First Day</span>
                    </div>
                    <h2 className="mt-5 font-serif text-4xl tracking-[-0.04em]">
                      {translated(language, "Maya’s school plan", "Plan escolar de Maya")}
                    </h2>
                    <p className="mt-2 text-sm text-[#68756e]">{caseData.district}</p>
                  </div>
                  <div className="rounded-2xl bg-[#fff5d8] px-4 py-3 text-sm font-semibold text-[#795a18]">
                    {plan.tasks.filter((task) => task.state === "needs_clarification").length}{" "}
                    {translated(language, "unresolved item", "asunto pendiente")}
                  </div>
                </div>

                <div className="mt-7 space-y-4">
                  {plan.tasks.map((task) => {
                    const meta = STATE_META[task.state];
                    const taskCopy = language === "Español" ? TASK_ES[task.id] : task;
                    return (
                      <div className="flex gap-4 rounded-2xl border border-[#e0e5e1] p-4" key={task.id}>
                        <span className={`fd-print-state ${meta.className}`}>
                          {language === "Español" ? meta.es : meta.en}
                        </span>
                        <div>
                          <h3 className="font-semibold">{taskCopy.title}</h3>
                          <p className="mt-1 text-sm leading-6 text-[#5d6963]">
                            {taskCopy.action}
                          </p>
                          <p className="mt-2 text-xs text-[#7b8781]">
                            {translated(language, "Source references", "Referencias")}: {task.evidenceIds.join(", ")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-7 grid gap-4 border-t border-[#dfe4df] pt-6 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7b8781]">
                      {translated(language, "Rule version", "Versión de reglas")}
                    </p>
                    <p className="mt-2 text-sm font-semibold">{caseData.ruleVersion}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#7b8781]">
                      {translated(language, "Evidence note", "Nota de evidencia")}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[#5d6963]">
                      {translated(
                        language,
                        "All school names, documents, and procedures in this printout are fictional.",
                        "Todos los nombres, documentos y procedimientos de esta impresión son ficticios.",
                      )}
                    </p>
                  </div>
                </div>
              </article>

              <button
                className="fd-primary-button mt-6 print:hidden"
                onClick={() => window.print()}
                type="button"
              >
                <PrinterIcon className="h-5 w-5" />
                {translated(language, "Print or save as PDF", "Imprimir o guardar como PDF")}
              </button>
            </section>
          ) : null}

          {currentStep !== "start" ? (
            <div className="mt-10 flex items-center justify-between border-t border-[#d9dfda] pt-6 print:hidden">
              <button
                className="fd-secondary-button"
                disabled={activeStepIndex === 0}
                onClick={goBack}
                type="button"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                {copy.back}
              </button>
              {currentStep !== "export" ? (
                <button className="fd-primary-button" onClick={goForward} type="button">
                  {copy.continue}
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              ) : null}
            </div>
          ) : null}
        </main>
      </div>

      {openEvidence ? (
        <SourcePanel
          document={openDocument}
          evidence={openEvidence}
          onClose={closeSource}
          procedure={openProcedure}
        />
      ) : null}
    </div>
  );
}
