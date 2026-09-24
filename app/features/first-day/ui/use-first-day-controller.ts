"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useLanternPreferences } from "../../../components/lantern/use-lantern-preferences";
import { roundRockEnrollmentProcedures } from "../content/procedures/round-rock-isd";
import { resolveConflict as recordConflictResolution } from "../domain/conflicts";
import {
  appendFactConfirmation,
  appendFactCorrection,
  appendFactUnclear,
  appendTaskCompletion,
  appendTaskCompletionReversal,
} from "../domain/events";
import { deriveLiveCase } from "../domain/live-tasks";
import { planCase } from "../domain/planner";
import type { FirstDayCase } from "../domain/types";
import {
  DEMO_BEATS,
  demoBeatForStep,
  demoBeatIndex,
  type DemoBeatId,
} from "./demo-presentation";
import { STEPS, type Language, type StepId } from "./first-day-copy";
import {
  activeTaskCompletionEvent,
  caseSnapshot,
  type PresentationMode,
  type TaskFilter,
} from "./first-day-view";
import { canEnterLiveStep, useLiveCase } from "./use-live-case";
import { useProviderCapability } from "./use-provider-capability";

export type { PresentationMode } from "./first-day-view";

type ToastState = {
  message: string;
  taskId?: string;
  completionEventId?: string;
} | null;

export function useFirstDayController({
  initialCase,
  initialPresentationMode,
}: {
  initialCase: FirstDayCase;
  initialPresentationMode: PresentationMode;
}) {
  const [caseData, setCaseData] = useState(initialCase);
  const [currentStep, setCurrentStep] = useState<StepId>(
    initialPresentationMode === "guided_demo" ? "documents" : "start",
  );
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [activeConflictId, setActiveConflictId] = useState<string | null>(null);
  const [taskFilter, setTaskFilter] = useState<TaskFilter>("all");
  const [toast, setToast] = useState<ToastState>(null);
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const [presentationMode, setPresentationMode] = useState<PresentationMode>(
    initialPresentationMode,
  );
  const [demoBeatId, setDemoBeatId] = useState<DemoBeatId>("before_lantern");
  const [isDemoSession] = useState(initialPresentationMode === "guided_demo");
  const sourceTriggerRef = useRef<HTMLButtonElement | null>(null);
  const eventSequence = useRef(0);
  const preferenceAppliedRef = useRef(false);
  const { preferences, ready: preferencesReady, setPreferences } =
    useLanternPreferences();
  const language: Language = caseData.language;
  const providerCapability = useProviderCapability();
  const liveCase = useLiveCase({ caseData, language, setCaseData });
  const plan = useMemo(() => planCase(caseData), [caseData]);
  const snapshot = useMemo(() => caseSnapshot(caseData, plan), [caseData, plan]);
  const demoBeat = DEMO_BEATS[demoBeatIndex(demoBeatId)] ?? DEMO_BEATS[0];
  const canAdvanceDemo =
    demoBeatId === "engineering_proof"
      ? false
      : demoBeatId === "traceable_evidence"
        ? snapshot.pendingFactCount === 0
        : demoBeatId === "uncertainty_preserved"
          ? snapshot.openConflictCount === 0
          : true;
  const activeStepIndex = STEPS.findIndex((step) => step.id === currentStep);
  const nextStep = STEPS[activeStepIndex + 1];
  const canGoForward = nextStep
    ? canEnterLiveStep(caseData, nextStep.id)
    : false;

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
    document.documentElement.lang = language === "Español" ? "es" : "en";
    document.documentElement.dir = "ltr";
  }, [language]);

  useEffect(() => {
    if (!preferencesReady || preferenceAppliedRef.current) return;
    preferenceAppliedRef.current = true;
    const preferredLanguage =
      preferences.preferredLanguage === "es" ? "Español" : "English";
    const timer = window.setTimeout(
      () =>
        setCaseData((current) => ({
          ...current,
          language: preferredLanguage,
        })),
      0,
    );
    return () => window.clearTimeout(timer);
  }, [preferences.preferredLanguage, preferencesReady]);

  function nextEventId(label: string) {
    eventSequence.current += 1;
    return `event-ui-${label}-${eventSequence.current}`;
  }

  function updateLanguage(nextLanguage: Language) {
    setCaseData((current) => ({ ...current, language: nextLanguage }));
    setPreferences((current) => ({
      ...current,
      preferredLanguage: nextLanguage === "Español" ? "es" : "en",
    }));
  }

  function toggleLargeText() {
    setPreferences((current) => ({ ...current, largeText: !current.largeText }));
  }

  function toggleHighContrast() {
    setPreferences((current) => ({
      ...current,
      highContrast: !current.highContrast,
    }));
  }

  function startLiveCase() {
    if (presentationMode === "guided_demo") return;
    liveCase.reset();
    setCaseData({
      id: `case-live-${Date.now()}`,
      mode: "live",
      language,
      district: "Round Rock ISD",
      childFirstName: "",
      ruleVersion: "live-intake-v1",
      documents: [],
      evidence: [],
      facts: [],
      procedures: structuredClone(roundRockEnrollmentProcedures),
      tasks: [],
      conflicts: [],
      events: [],
    });
    setActiveConflictId(null);
    setCurrentStep("documents");
  }

  function openSampleCase() {
    liveCase.reset();
    setCaseData({ ...structuredClone(initialCase), language });
    setActiveConflictId(null);
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
      deriveLiveCase(
        appendFactConfirmation(current, {
          id: nextEventId("fact"),
          factId,
          timestamp: new Date().toISOString(),
        }),
      ),
    );
  }

  function correctFact(factId: string, value: string) {
    setCaseData((current) =>
      deriveLiveCase(
        appendFactCorrection(current, {
          id: nextEventId("fact-correction"),
          factId,
          value,
          timestamp: new Date().toISOString(),
        }),
      ),
    );
  }

  function markFactUnclear(factId: string) {
    setCaseData((current) =>
      deriveLiveCase(
        appendFactUnclear(current, {
          id: nextEventId("fact-unclear"),
          factId,
          timestamp: new Date().toISOString(),
        }),
      ),
    );
  }

  function completeTask(taskId: string) {
    const completionEventId = nextEventId("task");
    setCaseData((current) =>
      appendTaskCompletion(current, {
        id: completionEventId,
        taskId,
        timestamp: new Date().toISOString(),
      }),
    );
    setHighlightedTaskId(taskId);
    setToast({
      message: language === "Español" ? "Paso marcado como terminado." : "Step marked done.",
      taskId,
      completionEventId,
    });
  }

  function undoTask(taskId: string, completionEventId?: string) {
    const completion = completionEventId
      ? caseData.events.find(
          (event) =>
            event.type === "task_completed" && event.id === completionEventId,
        )
      : activeTaskCompletionEvent(caseData, taskId);
    if (!completion || completion.type !== "task_completed") return;
    setCaseData((current) =>
      appendTaskCompletionReversal(current, {
        id: nextEventId("task-reverted"),
        taskId,
        completionEventId: completion.id,
        timestamp: new Date().toISOString(),
      }),
    );
    setToast({
      message: language === "Español" ? "El paso volvió al plan." : "Step returned to the plan.",
    });
  }

  function resolveCaseConflict(
    conflictId: string,
    selectedFactId: string,
    reportedValue: string,
  ) {
    const relatedTaskId = caseData.conflicts.find(
      (conflict) => conflict.id === conflictId,
    )?.relatedTaskIds[0];
    setCaseData((current) =>
      deriveLiveCase(
        recordConflictResolution(current, {
          id: nextEventId("school-confirmation"),
          type: "school_confirmation_recorded",
          conflictId,
          selectedFactId,
          reportedValue,
          timestamp: new Date().toISOString(),
        }),
      ),
    );
    setHighlightedTaskId(relatedTaskId ?? null);
    setToast({
      message:
        language === "Español"
          ? "El plan se actualizó solo donde dependía de esta respuesta."
          : "Only the plan steps that depended on this answer were updated.",
    });
    setCurrentStep("plan");
    if (presentationMode === "guided_demo") {
      setDemoBeatId("focused_update");
    }
  }

  function openTaskConflict(taskId: string) {
    const conflict =
      caseData.conflicts.find((item) => item.relatedTaskIds.includes(taskId)) ??
      caseData.conflicts.find((item) => item.status === "open");
    setActiveConflictId(conflict?.id ?? null);
    setCurrentStep("blocker");
    if (presentationMode === "guided_demo") {
      setDemoBeatId("uncertainty_preserved");
    }
  }

  function showTaskSource(taskId: string, trigger: HTMLButtonElement) {
    const task = caseData.tasks.find((item) => item.id === taskId);
    const evidenceId = task?.evidenceIds[0];
    if (evidenceId) openSource(evidenceId, trigger);
  }

  function selectStep(stepId: StepId) {
    if (!canEnterLiveStep(caseData, stepId)) return;
    setCurrentStep(stepId);
    if (presentationMode === "guided_demo") {
      setDemoBeatId(demoBeatForStep(stepId, snapshot, demoBeatId));
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goForward() {
    if (presentationMode === "guided_demo") {
      if (!canAdvanceDemo) return;
      if (demoBeatId === "before_lantern") {
        setDemoBeatId("traceable_evidence");
        setCurrentStep("facts");
      } else if (demoBeatId === "traceable_evidence") {
        const conflict = caseData.conflicts.find((item) => item.status === "open");
        setActiveConflictId(conflict?.id ?? null);
        setDemoBeatId("uncertainty_preserved");
        setCurrentStep("blocker");
      } else if (demoBeatId === "focused_update") {
        setDemoBeatId("family_outcome");
        setCurrentStep("export");
      } else if (demoBeatId === "uncertainty_preserved") {
        setDemoBeatId("focused_update");
        setCurrentStep("plan");
      } else if (demoBeatId === "family_outcome") {
        setDemoBeatId("engineering_proof");
        setCurrentStep("export");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const next = STEPS[Math.min(activeStepIndex + 1, STEPS.length - 1)];
    if (!next) return;
    selectStep(next.id);
  }

  function goBack() {
    if (presentationMode === "guided_demo") {
      if (demoBeatId === "traceable_evidence") {
        setDemoBeatId("before_lantern");
        setCurrentStep("documents");
      } else if (demoBeatId === "uncertainty_preserved") {
        setDemoBeatId("traceable_evidence");
        setCurrentStep("facts");
      } else if (demoBeatId === "focused_update") {
        setDemoBeatId("uncertainty_preserved");
        setCurrentStep("blocker");
      } else if (demoBeatId === "family_outcome") {
        setDemoBeatId("focused_update");
        setCurrentStep("plan");
      } else if (demoBeatId === "engineering_proof") {
        setDemoBeatId("family_outcome");
        setCurrentStep("export");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const previous = STEPS[Math.max(activeStepIndex - 1, 0)];
    if (!previous) return;
    selectStep(previous.id);
  }

  function dismissDemo() {
    setPresentationMode("standard");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resumeDemo() {
    setDemoBeatId(demoBeatForStep(currentStep, snapshot, demoBeatId));
    setPresentationMode("guided_demo");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return {
    activeConflictId,
    activeStepIndex,
    canGoForward:
      presentationMode === "guided_demo" ? canAdvanceDemo : canGoForward,
    canAdvanceDemo,
    canResumeDemo: isDemoSession && presentationMode === "standard",
    caseData,
    closeSource,
    completeTask,
    confirmFact,
    correctFact,
    currentStep,
    demoBeat,
    demoBeatId,
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
    resumeDemo,
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
  };
}
