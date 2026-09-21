"use client";

import Link from "next/link";

import { ActionDock } from "../../../components/lantern/primitives";
import type { FirstDayCase } from "../domain/types";
import { BlockerStep } from "./blocker-step";
import { CaseSnapshot } from "./case-snapshot";
import { DemoRibbon } from "./demo-ribbon";
import { DocumentsStep } from "./documents-step";
import { ExportStep } from "./export-step";
import { FactsStep } from "./facts-step";
import { translated } from "./first-day-copy";
import { FirstDayToast } from "./first-day-toast";
import { ArrowLeftIcon, ArrowRightIcon, LanternIcon } from "./icons";
import { PlanStep } from "./plan-step";
import { SourcePanel } from "./source-panel";
import { StartStep } from "./start-step";
import {
  type PresentationMode,
  useFirstDayController,
} from "./use-first-day-controller";
import { WorkspaceProgress } from "./workspace-progress";

export function FirstDayWorkspace({
  initialCase,
  initialPresentationMode = "standard",
}: {
  initialCase: FirstDayCase;
  initialPresentationMode?: PresentationMode;
}) {
  const controller = useFirstDayController({
    initialCase,
    initialPresentationMode,
  });
  const {
    activeConflictId,
    activeStepIndex,
    canGoForward,
    caseData,
    closeSource,
    completeTask,
    confirmFact,
    correctFact,
    currentStep,
    dismissDemo,
    goBack,
    goForward,
    highlightedTaskId,
    language,
    liveCase,
    markFactUnclear,
    openDocument,
    openEvidence,
    openProcedure,
    openSampleCase,
    openSource,
    openTaskConflict,
    plan,
    preferences,
    presentationMode,
    providerCapability,
    resolveCaseConflict,
    selectStep,
    setTaskFilter,
    setToast,
    showTaskSource,
    snapshot,
    startLiveCase,
    taskFilter,
    toast,
    toggleHighContrast,
    toggleLargeText,
    undoTask,
    updateLanguage,
  } = controller;

  const shellInert = openEvidence ? true : undefined;

  return (
    <div
      className="fd-app min-h-screen text-ink"
      data-presentation={presentationMode}
      data-fd-hc={preferences.highContrast ? "true" : "false"}
      data-fd-lt={preferences.largeText ? "true" : "false"}
    >
      <div aria-hidden={shellInert} inert={shellInert}>
        <header className="fd-header print:hidden">
          <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-3 px-4 py-3 sm:px-7 lg:px-10">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                aria-label={translated(
                  language,
                  "Back to Lantern home",
                  "Volver a Lantern",
                )}
                className="fd-back-link"
                href="/"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span className="hidden md:inline">
                  {translated(language, "Lantern home", "Inicio de Lantern")}
                </span>
              </Link>
              <span className="hidden h-5 w-px bg-ink/15 sm:block" />
              <div className="flex min-w-0 items-center gap-2 font-bold tracking-[-0.02em]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink text-amber shadow-sm">
                  <LanternIcon className="h-5 w-5" />
                </span>
                <span className="truncate">
                  Lantern <span className="font-medium text-muted">/ First Day</span>
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                aria-label={translated(
                  language,
                  "Toggle large text",
                  "Cambiar texto grande",
                )}
                aria-pressed={preferences.largeText}
                className="fd-utility-button hidden sm:inline-flex"
                onClick={toggleLargeText}
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
                aria-pressed={preferences.highContrast}
                className="fd-utility-button hidden sm:inline-flex"
                onClick={toggleHighContrast}
                type="button"
              >
                ◐
              </button>
              <div className="flex rounded-xl border border-ink/15 bg-white p-1 text-xs font-bold shadow-sm">
                {(["English", "Español"] as const).map((option) => (
                  <button
                    aria-pressed={language === option}
                    className={`min-h-9 rounded-lg px-3 transition-colors ${
                      language === option
                        ? "bg-ink text-white"
                        : "text-muted hover:bg-canvas"
                    }`}
                    key={option}
                    onClick={() => updateLanguage(option)}
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
              aria-label={translated(language, "Toggle large text", "Cambiar texto grande")}
              aria-pressed={preferences.largeText}
              className="fd-utility-button inline-flex"
              onClick={toggleLargeText}
              type="button"
            >
              Aa
            </button>
            <button
              aria-label={translated(language, "Toggle high contrast", "Cambiar alto contraste")}
              aria-pressed={preferences.highContrast}
              className="fd-utility-button inline-flex"
              onClick={toggleHighContrast}
              type="button"
            >
              ◐
            </button>
          </div>
        </header>

        {presentationMode === "guided_demo" ? (
          <DemoRibbon
            canGoForward={canGoForward}
            currentStep={currentStep}
            language={language}
            onDismiss={dismissDemo}
            onNext={goForward}
            onPrevious={goBack}
          />
        ) : null}

        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-6 px-4 py-5 sm:px-7 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-9 lg:px-10 lg:py-9">
          <aside className="grid gap-4 print:hidden sm:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] lg:sticky lg:top-5 lg:block lg:self-start lg:space-y-4">
            <WorkspaceProgress
              caseData={caseData}
              currentStep={currentStep}
              language={language}
              onSelectStep={selectStep}
            />
            <CaseSnapshot
              caseData={caseData}
              language={language}
              snapshot={snapshot}
            />
          </aside>

          <main className="min-w-0 pb-24 lg:pb-8">
            {currentStep === "start" ? (
              <StartStep
                allowLive={presentationMode !== "guided_demo"}
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
                caseData={caseData}
                highlightedTaskId={highlightedTaskId}
                language={language}
                onCompleteTask={completeTask}
                onResolveTask={openTaskConflict}
                onShowTaskSource={showTaskSource}
                onTaskFilterChange={setTaskFilter}
                onUndoTask={undoTask}
                plan={plan}
                taskFilter={taskFilter}
              />
            ) : null}
            {currentStep === "blocker" ? (
              <BlockerStep
                caseData={caseData}
                conflictId={activeConflictId}
                language={language}
                onOpenSource={openSource}
                onResolveConflict={resolveCaseConflict}
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
              <ActionDock className="print:hidden">
                <button
                  className="fd-secondary-button"
                  disabled={activeStepIndex === 0}
                  onClick={goBack}
                  type="button"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  {translated(language, "Back", "Atrás")}
                </button>
                {currentStep !== "export" && canGoForward ? (
                  <button className="fd-primary-button" onClick={goForward} type="button">
                    {translated(language, "Continue", "Continuar")}
                    <ArrowRightIcon className="h-5 w-5" />
                  </button>
                ) : null}
              </ActionDock>
            ) : null}
          </main>
        </div>

        <footer className="border-t border-ink/10 bg-white/70 px-5 py-7 text-center text-sm text-muted print:hidden">
          <Link
            className="font-bold text-cobalt underline decoration-cobalt/30 underline-offset-4 hover:text-cobalt-dark"
            href="/first-day/how-it-works"
          >
            {translated(
              language,
              "See how First Day turns evidence into a plan",
              "Vea cómo Primer Día convierte la evidencia en un plan",
            )}
          </Link>
        </footer>
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
      {toast ? (
        <FirstDayToast
          completionEventId={toast.completionEventId}
          language={language}
          message={toast.message}
          onDismiss={() => setToast(null)}
          onUndo={undoTask}
          taskId={toast.taskId}
        />
      ) : null}
    </div>
  );
}
