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
import type {
  PdfPreparationErrorCode,
  PreparedPdfPage,
} from "../client/pdf-pages";
import { appendSourceRemoval } from "../domain/events";
import { mergeExtraction } from "../domain/extraction";
import { deriveLiveCase } from "../domain/live-tasks";
import {
  MAX_CASE_BYTES,
  MAX_DOCUMENTS,
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
  preparation: { status: "idle" | "preparing"; fileName?: string };
  consentGranted: boolean;
  setConsentGranted: (granted: boolean) => void;
  addFiles: (files: File[]) => Promise<void>;
  retry: (documentId: string) => void;
  remove: (documentId: string) => void;
  reset: () => void;
  hasReadyFacts: boolean;
};

type ExtractionErrorCode =
  | "rate_limited"
  | "throttled"
  | "capacity"
  | "timeout"
  | "malformed_output"
  | "unavailable"
  | "provider";

function localizedExtractionError(
  language: FirstDayCase["language"],
  code: ExtractionErrorCode | undefined,
  fallback: string,
) {
  const messages: Partial<Record<ExtractionErrorCode, [string, string]>> = {
    rate_limited: [
      "Too many pages were sent. Wait for the retry time, then try again.",
      "Se enviaron demasiadas páginas. Espere el tiempo indicado y vuelva a intentarlo.",
    ],
    throttled: [
      "The reading service is busy. Wait a moment and try again.",
      "El servicio de lectura está ocupado. Espere un momento y vuelva a intentarlo.",
    ],
    capacity: [
      "The reading service has no capacity right now. Try again shortly.",
      "El servicio de lectura no tiene capacidad ahora. Inténtelo de nuevo en breve.",
    ],
    timeout: [
      "Reading this page took too long. Try the page again.",
      "La lectura tardó demasiado. Vuelva a intentar esta página.",
    ],
    malformed_output: [
      "Lantern could not verify the reading result. Try a clearer image.",
      "Lantern no pudo verificar el resultado. Pruebe con una imagen más clara.",
    ],
    unavailable: [
      "Live document reading is temporarily unavailable.",
      "La lectura de documentos no está disponible temporalmente.",
    ],
  };
  const message = code ? messages[code] : undefined;
  return message ? translated(language, ...message) : fallback;
}

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
  const [preparation, setPreparation] = useState<{
    status: "idle" | "preparing";
    fileName?: string;
  }>({ status: "idle" });
  const [consentGranted, setConsentGranted] = useState(false);
  const uploadFilesRef = useRef(new Map<string, File>());
  const requestTokensRef = useRef(new Map<string, string>());
  const abortControllersRef = useRef(new Map<string, AbortController>());
  const processingDocumentRef = useRef<string | null>(null);
  const uploadSequence = useRef(0);
  const eventSequence = useRef(0);
  const preparationTokenRef = useRef(0);
  const preparingRef = useRef(false);

  useEffect(() => {
    if (caseData.mode !== "live" || processingDocumentRef.current) return;
    const queuedPage = uploadQueue.find(
      (item) => item.status === "queued" || item.status === "retrying",
    );
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
      startedAt: Date.now(),
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
          const fallback =
            payload &&
            typeof payload === "object" &&
            "error" in payload &&
            typeof payload.error === "string"
              ? payload.error
              : "Could not read this page.";
          const code =
            payload &&
            typeof payload === "object" &&
            "code" in payload &&
            typeof payload.code === "string"
              ? (payload.code as ExtractionErrorCode)
              : response.status === 429
                ? "rate_limited"
                : undefined;
          throw new Error(localizedExtractionError(language, code, fallback));
        }

        const parsed = FirstDayExtractionSchema.safeParse(payload);
        if (!parsed.success) {
          throw new Error(
            localizedExtractionError(
              language,
              "malformed_output",
              "The document service returned an invalid response.",
            ),
          );
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
          factCount: parsed.data.facts.length,
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
    preparationTokenRef.current += 1;
    preparingRef.current = false;
    for (const controller of abortControllersRef.current.values()) {
      controller.abort();
    }
    uploadFilesRef.current.clear();
    requestTokensRef.current.clear();
    abortControllersRef.current.clear();
    processingDocumentRef.current = null;
    dispatchUpload({ type: "reset" });
    setUploadNotice(null);
    setPreparation({ status: "idle" });
  }

  function rejectionMessage(code: UploadRejectionCode) {
    const messages: Record<UploadRejectionCode, [string, string]> = {
      unsupported_type: [
        "Use a JPG, PNG, or PDF file.",
        "Use un archivo JPG, PNG o PDF.",
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
    return translated(language, ...messages[code]);
  }

  function pdfErrorMessage(code: PdfPreparationErrorCode) {
    const messages: Record<PdfPreparationErrorCode, [string, string]> = {
      pdf_too_large: [
        "The PDF must be between 1 byte and 25 MB.",
        "El PDF debe tener entre 1 byte y 25 MB.",
      ],
      pdf_too_many_pages: [
        "The whole PDF must fit within the five-page case limit. Split it and try again.",
        "El PDF completo debe caber en el límite de cinco páginas. Divídalo y vuelva a intentarlo.",
      ],
      pdf_encrypted: [
        "Password-protected PDFs cannot be opened. Save an unlocked copy and try again.",
        "No se pueden abrir PDFs protegidos con contraseña. Guarde una copia desbloqueada e inténtelo de nuevo.",
      ],
      pdf_malformed: [
        "This PDF could not be opened. Try downloading or scanning it again.",
        "No se pudo abrir este PDF. Intente descargarlo o escanearlo de nuevo.",
      ],
      pdf_page_too_large: [
        "A rendered PDF page exceeded the 10 MB page limit.",
        "Una página del PDF superó el límite de 10 MB.",
      ],
      pdf_case_too_large: [
        "The rendered PDF would exceed the 25 MB case limit.",
        "El PDF procesado superaría el límite de 25 MB del caso.",
      ],
      pdf_render_failed: [
        "A PDF page could not be prepared. Try a different copy.",
        "No se pudo preparar una página del PDF. Pruebe con otra copia.",
      ],
    };
    return translated(language, ...messages[code]);
  }

  type PreparedSelection = {
    file: File;
    sourceFileName: string;
    sourceType: "image" | "pdf";
    sourcePageNumber?: number;
  };

  function enqueuePreparedFiles(prepared: PreparedSelection[]) {
    if (!prepared.length) return;

    const pageStart =
      caseData.documents.filter((document) => document.status !== "removed")
        .length + 1;
    const queueItems = prepared.map((selection, index) => {
      uploadSequence.current += 1;
      const documentId = `doc-live-${Date.now()}-${uploadSequence.current}`;
      uploadFilesRef.current.set(documentId, selection.file);
      return {
        documentId,
        fileName: selection.file.name,
        mimeType: selection.file.type,
        size: selection.file.size,
        sourceFileName: selection.sourceFileName,
        sourceType: selection.sourceType,
        sourcePageNumber: selection.sourcePageNumber,
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
        sourceFileName: item.sourceFileName,
        sourceType: item.sourceType,
        sourcePageNumber: item.sourcePageNumber,
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

  async function addFiles(files: File[]) {
    if (!consentGranted) {
      setUploadNotice(
        translated(
          language,
          "Confirm the privacy notice before adding documents.",
          "Confirme el aviso de privacidad antes de añadir documentos.",
        ),
      );
      return;
    }
    if (!files.length || preparingRef.current) return;

    preparingRef.current = true;
    preparationTokenRef.current += 1;
    const token = preparationTokenRef.current;
    const accepted: PreparedSelection[] = [];
    const rejectionMessages: string[] = [];
    const workingQueue = uploadQueue.filter((item) => item.status !== "removed");

    try {
      for (const file of files) {
        const isPdf =
          file.type === "application/pdf" || /\.pdf$/i.test(file.name);
        if (!isPdf) {
          const validation = validateUploadSelection(workingQueue, [file]);
          const rejection = validation.rejected[0];
          if (rejection) {
            rejectionMessages.push(
              `${rejection.fileName}: ${rejectionMessage(rejection.code)}`,
            );
            continue;
          }
          accepted.push({
            file,
            sourceFileName: file.name,
            sourceType: "image",
          });
          workingQueue.push({
            documentId: `pending-${workingQueue.length}`,
            fileName: file.name,
            mimeType: file.type,
            size: file.size,
            status: "queued",
          });
          continue;
        }

        setPreparation({ status: "preparing", fileName: file.name });
        try {
          const { PdfPreparationError, renderPdfPages } = await import(
            "../client/pdf-pages"
          );
          const activeBytes = workingQueue.reduce(
            (total, item) => total + item.size,
            0,
          );
          const pages = await renderPdfPages(file, {
            remainingPages: MAX_DOCUMENTS - workingQueue.length,
            remainingBytes: MAX_CASE_BYTES - activeBytes,
          });
          const validation = validateUploadSelection(
            workingQueue,
            pages.map((page) => page.file),
          );
          if (validation.rejected.length) {
            throw new PdfPreparationError(
              validation.rejected[0]?.code === "case_too_large"
                ? "pdf_case_too_large"
                : validation.rejected[0]?.code === "file_too_large"
                  ? "pdf_page_too_large"
                  : "pdf_too_many_pages",
            );
          }
          for (const page of pages as PreparedPdfPage[]) {
            accepted.push({
              file: page.file,
              sourceFileName: page.sourceFileName,
              sourceType: "pdf",
              sourcePageNumber: page.sourcePageNumber,
            });
            workingQueue.push({
              documentId: `pending-${workingQueue.length}`,
              fileName: page.file.name,
              mimeType: page.file.type,
              size: page.file.size,
              status: "queued",
            });
          }
        } catch (error) {
          const code =
            error &&
            typeof error === "object" &&
            "code" in error &&
            typeof error.code === "string"
              ? (error.code as PdfPreparationErrorCode)
              : "pdf_malformed";
          rejectionMessages.push(`${file.name}: ${pdfErrorMessage(code)}`);
        }
      }
    } finally {
      preparingRef.current = false;
      if (token === preparationTokenRef.current) {
        setPreparation({ status: "idle" });
      }
    }

    if (token !== preparationTokenRef.current) return;
    enqueuePreparedFiles(accepted);
    const successMessage = accepted.length
      ? translated(
          language,
          `${accepted.length} page${accepted.length === 1 ? "" : "s"} added. Lantern will read them one at a time.`,
          `${accepted.length} página${accepted.length === 1 ? "" : "s"} añadida${accepted.length === 1 ? "" : "s"}. Lantern las leerá una por una.`,
        )
      : "";
    setUploadNotice(
      [successMessage, ...rejectionMessages].filter(Boolean).join(" ") || null,
    );
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
    preparation,
    consentGranted,
    setConsentGranted,
    addFiles,
    retry,
    remove,
    reset,
    hasReadyFacts: caseData.facts.some((fact) =>
      factHasActiveSource(caseData, fact),
    ),
  };
}
