"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";

import {
  appendFactConfirmation,
  appendFactCorrection,
  appendFactUnclear,
  appendTaskCompletion,
} from "../domain/events";
import { planCase } from "../domain/planner";
import type { FirstDayCase } from "../domain/types";
import { BlockerStep } from "./blocker-step";
import { DocumentsStep } from "./documents-step";
import { ExportStep } from "./export-step";
import { FactsStep } from "./facts-step";
import {
  STEPS,
  translated,
  type Language,
  type StepId,
} from "./first-day-copy";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  LanternIcon,
  ShieldIcon,
} from "./icons";
import { PlanStep } from "./plan-step";
import { SourcePanel } from "./source-panel";
import { StartStep } from "./start-step";
import { canEnterLiveStep, useLiveCase } from "./use-live-case";
import { useProviderCapability } from "./use-provider-capability";

export function FirstDayWorkspace({ initialCase }: { initialCase: FirstDayCase }) {
  const [caseData, setCaseData] = useState(initialCase);
  const [currentStep, setCurrentStep] = useState<StepId>("start");
  const [language, setLanguage] = useState<Language>(initialCase.language);
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const sourceTriggerRef = useRef<HTMLButtonElement | null>(null);
  const eventSequence = useRef(0);
  const providerCapability = useProviderCapability();
  const liveCase = useLiveCase({ caseData, language, setCaseData });

  const plan = useMemo(() => planCase(caseData), [caseData]);
  const activeStepIndex = STEPS.findIndex((step) => step.id === currentStep);
  const openEvidence = sourceId
    ? caseData.evidence.find((evidence) => evidence.id === sourceId)
    : undefined;
  const openDocument = openEvidence?.documentId
    ? caseData.documents.find(
        (document) => document.id === openEvidence.documentId,
      )
    : undefined;
  const openProcedure = openEvidence?.procedureId
    ? caseData.procedures.find(
        (procedure) => procedure.id === openEvidence.procedureId,
      )
    : undefined;

  function nextEventId(label: string) {
    eventSequence.current += 1;
    return `event-ui-${label}-${eventSequence.current}`;
  }

  function startLiveCase() {
    liveCase.reset();
    setCaseData({
      id: `case-live-${Date.now()}`,
      mode: "live",
      language,
      district: translated(
        language,
        "School enrollment case",
        "Caso de inscripción escolar",
      ),
      childFirstName: "",
      ruleVersion: "live-intake-v1",
      documents: [],
      evidence: [],
      facts: [],
      procedures: [],
      tasks: [],
      conflicts: [],
      events: [],
    });
    setCurrentStep("documents");
  }

  function openSampleCase() {
    liveCase.reset();
    setCaseData(initialCase);
    setCurrentStep("documents");
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

  function correctFact(factId: string, value: string) {
    setCaseData((current) =>
      appendFactCorrection(current, {
        id: nextEventId("fact-correction"),
        factId,
        value,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  function markFactUnclear(factId: string) {
    setCaseData((current) =>
      appendFactUnclear(current, {
        id: nextEventId("fact-unclear"),
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
    if (!canEnterLiveStep(caseData, next.id)) return;
    setCurrentStep(next.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    const previous = STEPS[Math.max(activeStepIndex - 1, 0)];
    setCurrentStep(previous.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const copy = {
    continue: translated(language, "Continue", "Continuar"),
    back: translated(language, "Back", "Atrás"),
  };
  const nextStep = STEPS[activeStepIndex + 1];
  const canGoForward = nextStep
    ? canEnterLiveStep(caseData, nextStep.id)
    : false;

  return (
    <div
      className="fd-app min-h-screen bg-[#f2f4ef] text-[#14241e]"
      data-fd-hc={highContrast ? "true" : "false"}
      data-fd-lt={largeText ? "true" : "false"}
    >
      <header
        aria-hidden={openEvidence ? true : undefined}
        className="fd-header print:hidden"
        inert={openEvidence ? true : undefined}
      >
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4 px-4 py-4 sm:px-7 lg:px-10">
          <div className="flex items-center gap-3">
            <Link
              aria-label={translated(
                language,
                "Back to all Lantern tools",
                "Volver a todas las herramientas de Lantern",
              )}
              className="fd-back-link"
              href="/"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span className="hidden sm:inline">
                {translated(
                  language,
                  "All Lantern tools",
                  "Todas las herramientas",
                )}
              </span>
            </Link>
            <span className="hidden h-5 w-px bg-[#ced5d0] sm:block" />
            <div className="flex items-center gap-2 font-semibold tracking-[-0.02em]">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#15251f] text-[#f9cb69] shadow-sm">
                <LanternIcon className="h-5 w-5" />
              </span>
              <span>Lantern</span>
              <span className="font-normal text-[#5f6d66]">/ First Day</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              aria-label={translated(
                language,
                "Toggle large text",
                "Cambiar texto grande",
              )}
              aria-pressed={largeText}
              className="fd-utility-button hidden sm:inline-flex"
              onClick={() => setLargeText((value) => !value)}
              type="button"
            >
              Aa
            </button>
            <button
              aria-label={translated(
                language,
                "Toggle high contrast",
                "Cambiar alto contraste",
              )}
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
        <div className="flex items-center justify-end gap-2 px-4 pb-3 sm:hidden">
          <button
            aria-label={translated(
              language,
              "Toggle large text",
              "Cambiar texto grande",
            )}
            aria-pressed={largeText}
            className="fd-utility-button inline-flex"
            onClick={() => setLargeText((value) => !value)}
            type="button"
          >
            Aa
          </button>
          <button
            aria-label={translated(
              language,
              "Toggle high contrast",
              "Cambiar alto contraste",
            )}
            aria-pressed={highContrast}
            className="fd-utility-button inline-flex"
            onClick={() => setHighContrast((value) => !value)}
            type="button"
          >
            ◐
          </button>
        </div>
      </header>

      <div
        aria-hidden={openEvidence ? true : undefined}
        className="border-y border-[#f1c76f]/50 bg-[#fff8df] px-4 py-2.5 text-center text-xs font-semibold text-[#71551c] print:border-[#999] print:bg-white print:text-black"
        inert={openEvidence ? true : undefined}
      >
        {caseData.mode === "fictional"
          ? translated(
              language,
              "Fictional demonstration · Mesa View is not a real district",
              "Demostración ficticia · Mesa View no es un distrito real",
            )
          : translated(
              language,
              "Live document intake · images are sent to Lantern’s external AI provider and are not saved as a case",
              "Carga de documentos · las imágenes se envían al proveedor externo de IA de Lantern y no se guardan como caso",
            )}
      </div>

      <div
        aria-hidden={openEvidence ? true : undefined}
        className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-8 px-4 py-6 sm:px-7 lg:grid-cols-[250px_minmax(0,1fr)] lg:px-10 lg:py-10"
        inert={openEvidence ? true : undefined}
      >
        <aside className="print:hidden lg:sticky lg:top-6 lg:self-start">
          <nav aria-label="First Day progress" className="fd-step-nav">
            <div className="mb-5 px-3">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#5f6d66]">
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
                const unavailable = !canEnterLiveStep(caseData, step.id);
                return (
                  <li className="min-w-max lg:min-w-0" key={step.id}>
                    <button
                      aria-current={active ? "step" : undefined}
                      className={`fd-step-button ${
                        active ? "is-active" : ""
                      }`}
                      disabled={unavailable}
                      onClick={() => setCurrentStep(step.id)}
                      type="button"
                    >
                      <span
                        className={`fd-step-number ${
                          visited ? "is-visited" : ""
                        }`}
                      >
                        {visited ? (
                          <CheckIcon className="h-4 w-4" />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <span>
                        {language === "Español" ? step.es : step.en}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="mt-5 hidden rounded-3xl border border-[#dce2dd] bg-white/70 p-5 text-sm leading-6 text-[#59665f] shadow-sm lg:block">
            <ShieldIcon className="mb-3 text-[#3556d4]" />
            <strong className="block text-[#1e2d27]">
              {translated(
                language,
                "Private by default",
                "Privado por defecto",
              )}
            </strong>
            {translated(
              language,
              caseData.mode === "fictional"
                ? "This demo stays in this page. No account or cloud case history."
                : "Pages are processed one at a time. Lantern does not create an account or cloud case history.",
              caseData.mode === "fictional"
                ? "Esta demo queda en esta página. Sin cuenta ni historial en la nube."
                : "Las páginas se procesan una por una. Lantern no crea una cuenta ni un historial en la nube.",
            )}
          </div>
        </aside>

        <main className="min-w-0 pb-16">
          {currentStep === "start" ? (
            <StartStep
              language={language}
              onOpenSample={openSampleCase}
              onStartLive={startLiveCase}
              providerCapability={providerCapability}
            />
          ) : null}
          {currentStep === "documents" ? (
            <DocumentsStep
              caseData={caseData}
              language={language}
              onAddFiles={liveCase.addFiles}
              onOpenSource={openSource}
              onRemove={liveCase.remove}
              onRetry={liveCase.retry}
              uploadNotice={liveCase.uploadNotice}
              uploadQueue={liveCase.uploadQueue}
            />
          ) : null}
          {currentStep === "facts" ? (
            <FactsStep
              caseData={caseData}
              language={language}
              onConfirmFact={confirmFact}
              onCorrectFact={correctFact}
              onMarkUnclear={markFactUnclear}
              onOpenSource={openSource}
            />
          ) : null}
          {currentStep === "plan" ? (
            <PlanStep
              language={language}
              onCompleteTask={completeTask}
              onResolveTask={() => setCurrentStep("blocker")}
              onShowTaskSource={showTaskSource}
              plan={plan}
            />
          ) : null}
          {currentStep === "blocker" ? (
            <BlockerStep
              language={language}
              onOpenSource={openSource}
              onResolveConflict={resolveOrientation}
            />
          ) : null}
          {currentStep === "export" ? (
            <ExportStep
              caseData={caseData}
              language={language}
              onPrint={() => window.print()}
              plan={plan}
            />
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
              {currentStep !== "export" && canGoForward ? (
                <button
                  className="fd-primary-button"
                  onClick={goForward}
                  type="button"
                >
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
          language={language}
          onClose={closeSource}
          procedure={openProcedure}
        />
      ) : null}
    </div>
  );
}
