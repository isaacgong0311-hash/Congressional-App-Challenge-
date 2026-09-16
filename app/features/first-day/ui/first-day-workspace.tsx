"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";

import { explanationToDocument } from "../adapters/explanation";
import {
  appendFactConfirmation,
  appendFactCorrection,
  appendSourceRemoval,
  appendTaskCompletion,
} from "../domain/events";
import { planCase } from "../domain/planner";
import {
  reduceUploadQueue,
  validateUploadSelection,
  type UploadRejectionCode,
} from "../domain/upload-queue";
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

export function FirstDayWorkspace({ initialCase }: { initialCase: FirstDayCase }) {
  const [caseData, setCaseData] = useState(initialCase);
  const [currentStep, setCurrentStep] = useState<StepId>("start");
  const [language, setLanguage] = useState<Language>(initialCase.language);
  const [largeText, setLargeText] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [uploadQueue, dispatchUpload] = useReducer(reduceUploadQueue, []);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const sourceTriggerRef = useRef<HTMLButtonElement | null>(null);
  const uploadFilesRef = useRef(new Map<string, File>());
  const requestTokensRef = useRef(new Map<string, string>());
  const abortControllersRef = useRef(new Map<string, AbortController>());
  const processingDocumentRef = useRef<string | null>(null);
  const uploadSequence = useRef(0);
  const eventSequence = useRef(0);

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

  useEffect(() => {
    if (caseData.mode !== "live" || processingDocumentRef.current) return;
    const next = uploadQueue.find((item) => item.status === "queued");
    if (!next) return;
    const queuedPage = next;

    const file = uploadFilesRef.current.get(queuedPage.documentId);
    if (!file) return;
    const selectedFile = file;

    const requestId = `${queuedPage.documentId}-request-${Date.now()}`;
    const controller = new AbortController();
    processingDocumentRef.current = queuedPage.documentId;
    requestTokensRef.current.set(queuedPage.documentId, requestId);
    abortControllersRef.current.set(queuedPage.documentId, controller);
    dispatchUpload({
      type: "start",
      documentId: queuedPage.documentId,
      requestId,
    });

    async function processPage() {
      try {
        const form = new FormData();
        form.append("image", selectedFile);
        form.append("language", language === "Español" ? "Spanish" : "English");
        form.append("readingLevel", "normal");

        const response = await fetch("/api/explain", {
          method: "POST",
          body: form,
          signal: controller.signal,
        });
        const payload: unknown = await response.json();
        if (!response.ok) {
          const message =
            payload &&
            typeof payload === "object" &&
            "error" in payload &&
            typeof payload.error === "string"
              ? payload.error
              : "Could not read this page.";
          throw new Error(message);
        }
        if (!payload || typeof payload !== "object") {
          throw new Error("The document service returned an invalid response.");
        }

        const currentPage = caseData.documents.find(
          (document) => document.id === queuedPage.documentId,
        );
        const readyDocument = explanationToDocument({
          documentId: queuedPage.documentId,
          fallbackLabel: queuedPage.fileName,
          pageIndex: currentPage?.pageIndex ?? 1,
          response: payload,
        });

        if (
          requestTokensRef.current.get(queuedPage.documentId) !== requestId
        ) {
          return;
        }
        setCaseData((current) => ({
          ...current,
          documents: current.documents.map((document) =>
            document.id === queuedPage.documentId &&
            document.status !== "removed"
              ? readyDocument
              : document,
          ),
        }));
        dispatchUpload({
          type: "succeed",
          documentId: queuedPage.documentId,
          requestId,
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        const message =
          error instanceof Error ? error.message : "Could not read this page.";
        if (
          requestTokensRef.current.get(queuedPage.documentId) !== requestId
        ) {
          return;
        }
        setCaseData((current) => ({
          ...current,
          documents: current.documents.map((document) =>
            document.id === queuedPage.documentId &&
            document.status !== "removed"
              ? { ...document, status: "error" }
              : document,
          ),
        }));
        dispatchUpload({
          type: "fail",
          documentId: queuedPage.documentId,
          requestId,
          error: message,
        });
      } finally {
        abortControllersRef.current.delete(queuedPage.documentId);
        if (processingDocumentRef.current === queuedPage.documentId) {
          processingDocumentRef.current = null;
        }
      }
    }

    void processPage();
  }, [caseData.documents, caseData.mode, language, uploadQueue]);

  useEffect(
    () => () => {
      for (const controller of abortControllersRef.current.values()) {
        controller.abort();
      }
    },
    [],
  );

  function nextEventId(label: string) {
    eventSequence.current += 1;
    return `event-ui-${label}-${eventSequence.current}`;
  }

  function startLiveCase() {
    for (const controller of abortControllersRef.current.values()) {
      controller.abort();
    }
    uploadFilesRef.current.clear();
    requestTokensRef.current.clear();
    abortControllersRef.current.clear();
    processingDocumentRef.current = null;
    dispatchUpload({ type: "reset" });
    setUploadNotice(null);
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
    for (const controller of abortControllersRef.current.values()) {
      controller.abort();
    }
    uploadFilesRef.current.clear();
    requestTokensRef.current.clear();
    abortControllersRef.current.clear();
    processingDocumentRef.current = null;
    dispatchUpload({ type: "reset" });
    setUploadNotice(null);
    setCaseData(initialCase);
    setCurrentStep("documents");
  }

  function rejectionMessage(code: UploadRejectionCode) {
    const messages: Record<UploadRejectionCode, [string, string]> = {
      unsupported_type: [
        "Use a JPG or PNG image.",
        "Use una imagen JPG o PNG.",
      ],
      file_too_large: [
        "Each page must be 10 MB or smaller.",
        "Cada página debe tener 10 MB o menos.",
      ],
      case_too_large: [
        "This case can contain up to 25 MB total.",
        "Este caso puede contener hasta 25 MB en total.",
      ],
      too_many: [
        "A case can contain up to five pages.",
        "Un caso puede contener hasta cinco páginas.",
      ],
    };
    const [english, spanish] = messages[code];
    return translated(language, english, spanish);
  }

  function addUploadFiles(files: File[]) {
    const { accepted, rejected } = validateUploadSelection(uploadQueue, files);
    if (rejected.length) {
      setUploadNotice(
        rejected
          .map((item) => `${item.fileName}: ${rejectionMessage(item.code)}`)
          .join(" "),
      );
    } else {
      setUploadNotice(
        accepted.length
          ? translated(
              language,
              `${accepted.length} page${
                accepted.length === 1 ? "" : "s"
              } added. Lantern will read them one at a time.`,
              `${accepted.length} página${
                accepted.length === 1 ? "" : "s"
              } añadida${
                accepted.length === 1 ? "" : "s"
              }. Lantern las leerá una por una.`,
            )
          : null,
      );
    }
    if (!accepted.length) return;

    const pageStart =
      caseData.documents.filter((document) => document.status !== "removed")
        .length + 1;
    const queueItems = accepted.map((file, index) => {
      uploadSequence.current += 1;
      const documentId = `doc-live-${Date.now()}-${uploadSequence.current}`;
      uploadFilesRef.current.set(documentId, file);
      return {
        documentId,
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
        status: "queued" as const,
        pageIndex: pageStart + index,
      };
    });

    dispatchUpload({
      type: "enqueue",
      items: queueItems.map((item) => ({
        documentId: item.documentId,
        fileName: item.fileName,
        mimeType: item.mimeType,
        size: item.size,
        status: item.status,
      })),
    });
    setCaseData((current) => ({
      ...current,
      documents: [
        ...current.documents,
        ...queueItems.map((item) => ({
          id: item.documentId,
          label: item.fileName,
          pageIndex: item.pageIndex,
          status: "processing" as const,
          extractedText: "",
          sourceVersion: "waiting-for-extraction",
        })),
      ],
    }));
  }

  function retryUpload(documentId: string) {
    requestTokensRef.current.delete(documentId);
    setCaseData((current) => ({
      ...current,
      documents: current.documents.map((document) =>
        document.id === documentId
          ? {
              ...document,
              status: "processing",
              extractedText: "",
              sourceVersion: "waiting-for-extraction",
            }
          : document,
      ),
    }));
    dispatchUpload({ type: "retry", documentId });
  }

  function removeUpload(documentId: string) {
    abortControllersRef.current.get(documentId)?.abort();
    abortControllersRef.current.delete(documentId);
    requestTokensRef.current.delete(documentId);
    uploadFilesRef.current.delete(documentId);
    if (processingDocumentRef.current === documentId) {
      processingDocumentRef.current = null;
    }
    dispatchUpload({ type: "remove", documentId });
    const removalEvent = {
      id: nextEventId("source"),
      documentId,
      timestamp: new Date().toISOString(),
    };
    setCaseData((current) => {
      const withRemoval = appendSourceRemoval(current, removalEvent);
      return {
        ...withRemoval,
        documents: withRemoval.documents.map((document) =>
          document.id === documentId
            ? { ...document, status: "removed" }
            : document,
        ),
      };
    });
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
    continue: translated(language, "Continue", "Continuar"),
    back: translated(language, "Back", "Atrás"),
  };

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
                const unavailable = caseData.mode === "live" && index > 1;
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
            />
          ) : null}
          {currentStep === "documents" ? (
            <DocumentsStep
              caseData={caseData}
              language={language}
              onAddFiles={addUploadFiles}
              onOpenSource={openSource}
              onRemove={removeUpload}
              onRetry={retryUpload}
              uploadNotice={uploadNotice}
              uploadQueue={uploadQueue}
            />
          ) : null}
          {currentStep === "facts" ? (
            <FactsStep
              caseData={caseData}
              language={language}
              onConfirmFact={confirmFact}
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
              {currentStep !== "export" &&
              !(caseData.mode === "live" && currentStep === "documents") ? (
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
