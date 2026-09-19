"use client";

import {
  useEffect,
  useReducer,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import { adaptLiveExtraction } from "../adapters/live-extraction";
import { appendSourceRemoval } from "../domain/events";
import { mergeExtraction } from "../domain/extraction";
import { deriveLiveCase } from "../domain/live-tasks";
import {
  reduceUploadQueue,
  validateUploadSelection,
  type UploadQueueItem,
  type UploadRejectionCode,
} from "../domain/upload-queue";
import type {
  Fact,
  FirstDayCase,
  FirstDayExtractionResponse,
} from "../domain/types";
import { FirstDayExtractionSchema } from "../server/extraction-schema";
import { translated, type StepId } from "./first-day-copy";

export function factHasActiveSource(caseData: FirstDayCase, fact: Fact) {
  const removedDocumentIds = new Set(
    caseData.events
      .filter((event) => event.type === "source_removed")
      .map((event) => event.documentId),
  );

  return fact.evidenceIds.some((evidenceId) => {
    const evidence = caseData.evidence.find((item) => item.id === evidenceId);
    if (!evidence) return false;
    if (evidence.procedureId) return true;
    if (!evidence.documentId || removedDocumentIds.has(evidence.documentId)) {
      return false;
    }
    return caseData.documents.some(
      (document) =>
        document.id === evidence.documentId && document.status !== "removed",
    );
  });
}

export function canEnterLiveStep(caseData: FirstDayCase, step: StepId) {
  if (caseData.mode !== "live") return true;
  if (step === "start" || step === "documents") return true;
  const activeFacts = caseData.facts.filter((fact) =>
    factHasActiveSource(caseData, fact),
  );
  if (step === "facts") return activeFacts.length > 0;

  const confirmedFactIds = new Set(
    activeFacts
      .filter((fact) => fact.confirmationState === "confirmed")
      .map((fact) => fact.id),
  );
  for (const event of caseData.events) {
    if (
      (event.type === "fact_confirmed" || event.type === "fact_corrected") &&
      activeFacts.some((fact) => fact.id === event.factId)
    ) {
      confirmedFactIds.add(event.factId);
    }
    if (event.type === "fact_marked_unclear") {
      confirmedFactIds.delete(event.factId);
    }
  }
  return confirmedFactIds.size > 0;
}

export type LiveCaseController = {
  uploadQueue: UploadQueueItem[];
  uploadNotice: string | null;
  addFiles: (files: File[]) => void;
  retry: (documentId: string) => void;
  remove: (documentId: string) => void;
  reset: () => void;
  hasReadyFacts: boolean;
};

export function useLiveCase({
  caseData,
  language,
  setCaseData,
}: {
  caseData: FirstDayCase;
  language: FirstDayCase["language"];
  setCaseData: Dispatch<SetStateAction<FirstDayCase>>;
}): LiveCaseController {
  const [uploadQueue, dispatchUpload] = useReducer(reduceUploadQueue, []);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const uploadFilesRef = useRef(new Map<string, File>());
  const requestTokensRef = useRef(new Map<string, string>());
  const abortControllersRef = useRef(new Map<string, AbortController>());
  const processingDocumentRef = useRef<string | null>(null);
  const uploadSequence = useRef(0);
  const eventSequence = useRef(0);

  useEffect(() => {
    if (caseData.mode !== "live" || processingDocumentRef.current) return;
    const queuedPage = uploadQueue.find((item) => item.status === "queued");
    if (!queuedPage) return;
    const documentId = queuedPage.documentId;

    const selectedFile = uploadFilesRef.current.get(documentId);
    const currentPage = caseData.documents.find(
      (document) => document.id === documentId,
    );
    if (!selectedFile || !currentPage) return;
    const pageFile: File = selectedFile;
    const pageIndex = currentPage.pageIndex;

    const requestId = `${documentId}-request-${Date.now()}`;
    const controller = new AbortController();
    processingDocumentRef.current = documentId;
    requestTokensRef.current.set(documentId, requestId);
    abortControllersRef.current.set(documentId, controller);
    dispatchUpload({
      type: "start",
      documentId,
      requestId,
    });

    async function processPage() {
      try {
        const form = new FormData();
        form.append("image", pageFile);
        form.append("language", language === "Español" ? "Spanish" : "English");
        form.append("documentId", documentId);
        form.append("requestId", requestId);

        const response = await fetch("/api/first-day/extract", {
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

        const parsed = FirstDayExtractionSchema.safeParse(payload);
        if (!parsed.success) {
          throw new Error("The document service returned an invalid response.");
        }
        const extraction = adaptLiveExtraction(
          parsed.data as FirstDayExtractionResponse,
          pageIndex,
        );

        if (
          requestTokensRef.current.get(documentId) !== requestId
        ) {
          return;
        }
        setCaseData((current) => {
          try {
            return deriveLiveCase(mergeExtraction(current, extraction));
          } catch {
            return current;
          }
        });
        dispatchUpload({
          type: "succeed",
          documentId,
          requestId,
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        const message =
          error instanceof Error ? error.message : "Could not read this page.";
        if (
          requestTokensRef.current.get(documentId) !== requestId
        ) {
          return;
        }
        setCaseData((current) => ({
          ...current,
          documents: current.documents.map((document) =>
            document.id === documentId &&
            document.status !== "removed"
              ? { ...document, status: "error" }
              : document,
          ),
        }));
        dispatchUpload({
          type: "fail",
          documentId,
          requestId,
          error: message,
        });
      } finally {
        abortControllersRef.current.delete(documentId);
        if (processingDocumentRef.current === documentId) {
          processingDocumentRef.current = null;
        }
      }
    }

    void processPage();
  }, [caseData.documents, caseData.mode, language, setCaseData, uploadQueue]);

  useEffect(() => {
    const controllers = abortControllersRef.current;
    return () => {
      for (const controller of controllers.values()) controller.abort();
    };
  }, []);

  function reset() {
    for (const controller of abortControllersRef.current.values()) {
      controller.abort();
    }
    uploadFilesRef.current.clear();
    requestTokensRef.current.clear();
    abortControllersRef.current.clear();
    processingDocumentRef.current = null;
    dispatchUpload({ type: "reset" });
    setUploadNotice(null);
  }

  function rejectionMessage(code: UploadRejectionCode) {
    const messages: Record<UploadRejectionCode, [string, string]> = {
      unsupported_type: ["Use a JPG or PNG image.", "Use una imagen JPG o PNG."],
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
    return translated(language, ...messages[code]);
  }

  function addFiles(files: File[]) {
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
              `${accepted.length} page${accepted.length === 1 ? "" : "s"} added. Lantern will read them one at a time.`,
              `${accepted.length} página${accepted.length === 1 ? "" : "s"} añadida${accepted.length === 1 ? "" : "s"}. Lantern las leerá una por una.`,
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

  function retry(documentId: string) {
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

  function remove(documentId: string) {
    abortControllersRef.current.get(documentId)?.abort();
    abortControllersRef.current.delete(documentId);
    requestTokensRef.current.delete(documentId);
    uploadFilesRef.current.delete(documentId);
    if (processingDocumentRef.current === documentId) {
      processingDocumentRef.current = null;
    }
    dispatchUpload({ type: "remove", documentId });
    eventSequence.current += 1;
    setCaseData((current) => {
      const withRemoval = appendSourceRemoval(current, {
        id: `event-live-source-${eventSequence.current}`,
        documentId,
        timestamp: new Date().toISOString(),
      });
      return deriveLiveCase({
        ...withRemoval,
        documents: withRemoval.documents.map((document) =>
          document.id === documentId
            ? { ...document, status: "removed" }
            : document,
        ),
      });
    });
  }

  return {
    uploadQueue,
    uploadNotice,
    addFiles,
    retry,
    remove,
    reset,
    hasReadyFacts: caseData.facts.some((fact) =>
      factHasActiveSource(caseData, fact),
    ),
  };
}
