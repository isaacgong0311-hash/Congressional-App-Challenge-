"use client";

import { useEffect, useRef } from "react";

import type {
  Evidence,
  FirstDayDocument,
  Procedure,
} from "../domain/types";
import { DocumentIcon, ShieldIcon, XIcon } from "./icons";

type SourcePanelProps = {
  evidence: Evidence;
  document?: FirstDayDocument;
  procedure?: Procedure;
  onClose: () => void;
};

export function SourcePanel({
  evidence,
  document,
  procedure,
  onClose,
}: SourcePanelProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const isProcedure = Boolean(procedure);
  const label = document?.label ?? procedure?.sourceSection ?? "Source";

  return (
    <div className="fd-source-backdrop fixed inset-0 z-50 flex items-end justify-center bg-[#0d1b17]/45 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <section
        aria-labelledby="source-panel-title"
        aria-modal="true"
        className="fd-source-panel max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] border border-white/60 bg-[#fffefb] shadow-[0_30px_100px_rgba(13,27,23,.28)] sm:rounded-[2rem]"
        role="dialog"
      >
        <div className="flex items-start justify-between border-b border-[#dfe4df] px-6 py-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8edff] text-[#3556d4]">
              {isProcedure ? <ShieldIcon /> : <DocumentIcon />}
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#68746f]">
                {isProcedure ? "Fictional procedure" : "Document evidence"}
              </p>
              <h2
                className="mt-1 text-lg font-semibold text-[#13221d]"
                id="source-panel-title"
              >
                {label}
              </h2>
            </div>
          </div>
          <button
            aria-label="Close source"
            className="fd-icon-button"
            onClick={onClose}
            ref={closeRef}
            type="button"
          >
            <XIcon />
          </button>
        </div>

        <div className="space-y-6 px-6 py-7 sm:px-8">
          <div>
            <p className="text-sm font-medium text-[#68746f]">Where this appears</p>
            <p className="mt-1 text-sm font-semibold text-[#24342e]">
              {evidence.location}
            </p>
          </div>

          <blockquote className="relative rounded-3xl border border-[#d9dfda] bg-[#f5f6f2] p-6 font-serif text-xl leading-8 text-[#1a2a24] before:absolute before:left-5 before:top-2 before:text-4xl before:text-[#9ba7a1] before:content-['“']">
            <span className="relative z-10">{evidence.quote}</span>
          </blockquote>

          <div className="rounded-2xl bg-[#edf2ff] p-4 text-sm leading-6 text-[#334577]">
            {isProcedure
              ? "This rule is fictional and exists only for the demo. It is not a real district requirement."
              : "Lantern keeps the exact wording visible so you can check the plan against the original document."}
          </div>

          {document ? (
            <details className="rounded-2xl border border-[#dfe4df] bg-white p-4">
              <summary className="cursor-pointer text-sm font-semibold text-[#24342e]">
                Read extracted page text
              </summary>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#56625d]">
                {document.extractedText}
              </p>
            </details>
          ) : null}
        </div>
      </section>
    </div>
  );
}
