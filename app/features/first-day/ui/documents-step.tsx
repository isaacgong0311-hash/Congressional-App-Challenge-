import { useRef, useState } from "react";

import { MetricCard } from "../../../components/lantern/primitives";

import {
  MAX_CASE_BYTES,
  MAX_DOCUMENT_BYTES,
  MAX_DOCUMENTS,
  type UploadQueueItem,
} from "../domain/upload-queue";
import type { FirstDayCase } from "../domain/types";
import { DOCUMENT_ES, translated, type Language } from "./first-day-copy";
import {
  currentFactView,
  Eyebrow,
  SourceButton,
  type SourceOpener,
} from "./first-day-shared";
import {
  CircleCheckIcon,
  ClockIcon,
  DocumentIcon,
  WarningIcon,
} from "./icons";
import { factHasActiveSource } from "./use-live-case";

export type DocumentsStepProps = {
  caseData: FirstDayCase;
  language: Language;
  uploadQueue: UploadQueueItem[];
  uploadNotice: string | null;
  onAddFiles: (files: File[]) => void;
  onRetry: (documentId: string) => void;
  onRemove: (documentId: string) => void;
  onOpenSource: SourceOpener;
};

export function DocumentsStep({
  caseData,
  language,
  uploadQueue,
  uploadNotice,
  onAddFiles,
  onRetry,
  onRemove,
  onOpenSource,
}: DocumentsStepProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const visibleDocuments = caseData.documents.filter(
    (document) => document.status !== "removed",
  );
  const sourceLabel = translated(language, "Show source", "Ver fuente");
  const readyPages = visibleDocuments.filter(
    (document) => document.status === "ready",
  ).length;
  const failedPages = visibleDocuments.filter(
    (document) => document.status === "error",
  ).length;
  const proposedFacts = caseData.facts.filter(
    (fact) =>
      factHasActiveSource(caseData, fact) &&
      currentFactView(caseData, fact).state === "proposed",
  ).length;

  return (
    <section className="fd-enter">
      <Eyebrow>
        {translated(
          language,
          "Step 2 · Documents",
          "Paso 2 · Documentos",
        )}
      </Eyebrow>
      <h1 className="fd-page-title">
        {translated(
          language,
          "One case, every instruction.",
          "Un caso, todas las instrucciones.",
        )}
      </h1>
      <p className="fd-page-intro">
        {translated(
          language,
          "Each page keeps its own identity, extracted text, and processing status. A failed page would not erase the others.",
          "Cada página conserva su identidad, texto extraído y estado. Una página con error no borraría las demás.",
        )}
      </p>

      <div className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          [visibleDocuments.length, "Pages added", "Páginas añadidas"],
          [readyPages, "Successfully read", "Leídas correctamente"],
          [failedPages, "Need attention", "Necesitan atención"],
          [proposedFacts, "Proposed facts", "Datos propuestos"],
        ].map(([value, en, es]) => (
          <MetricCard key={String(en)} label={translated(language, String(en), String(es))} value={value} />
        ))}
      </div>

      {caseData.mode === "live" ? (
        <div
          className={`fd-upload-zone mt-8 ${isDragging ? "is-dragging" : ""}`}
          onDragEnter={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            if (event.currentTarget.contains(event.relatedTarget as Node)) return;
            setIsDragging(false);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            onAddFiles(Array.from(event.dataTransfer.files));
          }}
        >
          <input
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            aria-label={translated(
              language,
              "School page images",
              "Imágenes de páginas escolares",
            )}
            className="hidden"
            multiple
            onChange={(event) => {
              onAddFiles(Array.from(event.currentTarget.files ?? []));
              event.currentTarget.value = "";
            }}
            ref={fileInputRef}
            type="file"
          />
          <input
            accept="image/jpeg,image/png"
            aria-label={translated(language, "Take a photo of a school page", "Tomar una foto de una página escolar")}
            capture="environment"
            className="hidden"
            onChange={(event) => {
              onAddFiles(Array.from(event.currentTarget.files ?? []));
              event.currentTarget.value = "";
            }}
            ref={cameraInputRef}
            type="file"
          />
          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-lg font-semibold">
                {translated(
                  language,
                  "Add school pages",
                  "Añada páginas escolares",
                )}
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#59665f]">
                {translated(
                  language,
                  "For this pilot, use Round Rock ISD enrollment pages. Choose up to five JPG or PNG pages. Each page can be 10 MB, with a 25 MB case limit. Lantern reads one page at a time so one failure does not erase the others.",
                  "Para este piloto, use páginas de inscripción de Round Rock ISD. Elija hasta cinco páginas JPG o PNG. Cada página puede tener 10 MB, con un límite total de 25 MB. Lantern lee una página a la vez para que un error no borre las demás.",
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                className="fd-primary-button shrink-0"
                disabled={visibleDocuments.length >= MAX_DOCUMENTS}
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <DocumentIcon className="h-5 w-5" />
                {translated(language, "Choose pages", "Elegir páginas")}
              </button>
              <button
                className="fd-secondary-button shrink-0 sm:hidden"
                disabled={visibleDocuments.length >= MAX_DOCUMENTS}
                onClick={() => cameraInputRef.current?.click()}
                type="button"
              >
                {translated(language, "Take a photo", "Tomar una foto")}
              </button>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold text-[#53615a]">
            <span className="rounded-full bg-white px-3 py-1.5">
              {visibleDocuments.length} / {MAX_DOCUMENTS}{" "}
              {translated(language, "pages", "páginas")}
            </span>
            <span className="rounded-full bg-white px-3 py-1.5">
              {Math.round(MAX_DOCUMENT_BYTES / 1024 / 1024)} MB /{` `}
              {translated(language, "page", "página")}
            </span>
            <span className="rounded-full bg-white px-3 py-1.5">
              {Math.round(MAX_CASE_BYTES / 1024 / 1024)} MB{` `}
              {translated(language, "total", "en total")}
            </span>
          </div>
          {uploadNotice ? (
            <p
              aria-live="polite"
              className="mt-4 text-sm font-medium text-[#44534c]"
              role="status"
            >
              {uploadNotice}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-8 space-y-4">
        {visibleDocuments.map((document, index) => {
          const evidence = caseData.evidence.find(
            (item) => item.documentId === document.id,
          );
          const queued = uploadQueue.find(
            (item) => item.documentId === document.id,
          );
          const documentFactCount = caseData.facts.filter((fact) =>
            fact.evidenceIds.some((evidenceId) =>
              caseData.evidence.some(
                (item) =>
                  item.id === evidenceId && item.documentId === document.id,
              ),
            ),
          ).length;
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
                        ? DOCUMENT_ES[document.id] ?? document.label
                        : document.label}
                    </h2>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#5f6d66]">
                      {translated(
                        language,
                        `Page ${document.pageIndex}`,
                        `Página ${document.pageIndex}`,
                      )}{" "}
                      ·{` `}
                      {caseData.mode === "live" && queued
                        ? `${(queued.size / 1024 / 1024).toFixed(1)} MB`
                        : document.sourceVersion}
                      {typeof document.confidence === "number"
                        ? translated(
                            language,
                            ` · ${document.confidence}% confidence`,
                            ` · ${document.confidence}% de confianza`,
                          )
                        : ""}
                    </p>
                    <p className="mt-2 text-xs font-semibold text-cobalt">
                      {translated(
                        language,
                        `${documentFactCount} proposed fact${documentFactCount === 1 ? "" : "s"}`,
                        `${documentFactCount} dato${documentFactCount === 1 ? "" : "s"} propuesto${documentFactCount === 1 ? "" : "s"}`,
                      )}
                    </p>
                  </div>
                  <span
                    aria-live="polite"
                    className={`fd-ready-pill ${
                      document.status === "error" ? "is-error" : ""
                    }`}
                  >
                    {document.status === "ready" ? (
                      <CircleCheckIcon className="h-4 w-4" />
                    ) : document.status === "error" ? (
                      <WarningIcon className="h-4 w-4" />
                    ) : (
                      <ClockIcon className="h-4 w-4" />
                    )}
                    {document.status === "ready"
                      ? translated(language, "Text ready", "Texto listo")
                      : document.status === "error"
                        ? translated(language, "Needs retry", "Reintentar")
                        : queued?.status === "processing"
                          ? translated(
                              language,
                              "Reading page",
                              "Leyendo página",
                            )
                          : translated(language, "Waiting", "En espera")}
                  </span>
                </div>
                {document.extractedText ? (
                  caseData.mode === "live" ? (
                    <details className="mt-4 rounded-2xl border border-[#e0e5e1] bg-white/70 p-4">
                      <summary className="cursor-pointer text-sm font-semibold text-[#35453e]">
                        {translated(
                          language,
                          "Read extracted text",
                          "Leer el texto extraído",
                        )}
                      </summary>
                      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#5d6963]">
                        {document.extractedText}
                      </p>
                    </details>
                  ) : (
                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-[#5d6963]">
                      {document.extractedText}
                    </p>
                  )
                ) : null}
                {queued?.error ? (
                  <p
                    className="mt-4 text-sm font-medium text-[#8a3f31]"
                    role="alert"
                  >
                    {queued.error}
                  </p>
                ) : null}
                {document.photoQualityNote ? (
                  <p className="mt-4 rounded-2xl bg-[#fff1cf] p-3 text-sm font-medium text-[#6f5218]">
                    {document.photoQualityNote}
                  </p>
                ) : null}
                {evidence ? (
                  <div className="mt-4">
                    <SourceButton
                      highlight={index === 0}
                      label={sourceLabel}
                      onClick={(button) => onOpenSource(evidence.id, button)}
                    />
                  </div>
                ) : null}
                {caseData.mode === "live" ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {document.status === "error" ? (
                      <button
                        className="fd-secondary-button"
                        onClick={() => onRetry(document.id)}
                        type="button"
                      >
                        {translated(
                          language,
                          "Retry page",
                          "Reintentar página",
                        )}
                      </button>
                    ) : null}
                    <button
                      aria-describedby={`remove-note-${document.id}`}
                      className="fd-remove-button"
                      onClick={() => onRemove(document.id)}
                      type="button"
                    >
                      {translated(
                        language,
                        "Remove page",
                        "Eliminar página",
                      )}
                    </button>
                    <span className="sr-only" id={`remove-note-${document.id}`}>
                      {translated(language, "Removing this page also removes its usable facts from the plan.", "Eliminar esta página también elimina sus datos utilizables del plan.")}
                    </span>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      {caseData.mode === "live" && visibleDocuments.length === 0 ? (
        <div className="mt-5 rounded-3xl border border-dashed border-[#bfc9c2] bg-white/50 p-6 text-center">
          <p className="font-semibold">
            {translated(
              language,
              "No pages added yet",
              "Todavía no hay páginas",
            )}
          </p>
          <p className="mt-1 text-sm text-[#68756e]">
            {translated(
              language,
              "Your pages appear here with separate progress and retry controls.",
              "Sus páginas aparecerán aquí con progreso y opciones para reintentar por separado.",
            )}
          </p>
        </div>
      ) : null}

      {caseData.mode === "live" && visibleDocuments.length > 0 ? (
        <div className="mt-5 rounded-3xl border border-[#cbd6ff] bg-[#eef2ff] p-5 text-sm leading-6 text-[#34487f]">
          <p aria-live="polite" className="font-semibold">
            {translated(
              language,
              `${readyPages} pages ready · ${proposedFacts} facts to review · ${failedPages} pages need attention`,
              `${readyPages} páginas listas · ${proposedFacts} datos por revisar · ${failedPages} páginas necesitan atención`,
            )}
          </p>
          {readyPages > 0 ? (
            <p className="mt-1">
              {translated(
                language,
                "Continue to compare each proposed fact with its exact source.",
                "Continúe para comparar cada dato propuesto con su fuente exacta.",
              )}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
