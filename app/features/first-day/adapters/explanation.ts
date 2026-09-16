import type { FirstDayDocument } from "../domain/types";

type ExplanationDocumentResponse = {
  documentType?: unknown;
  originalText?: unknown;
};

type ExplanationAdapterInput = {
  documentId: string;
  fallbackLabel: string;
  pageIndex: number;
  response: ExplanationDocumentResponse;
};

export function explanationToDocument({
  documentId,
  fallbackLabel,
  pageIndex,
  response,
}: ExplanationAdapterInput): FirstDayDocument {
  const extractedText =
    typeof response.originalText === "string" ? response.originalText.trim() : "";
  if (!extractedText) {
    throw new Error("The document response did not include readable source text.");
  }

  const proposedLabel =
    typeof response.documentType === "string" ? response.documentType.trim() : "";

  return {
    id: documentId,
    label: proposedLabel || fallbackLabel,
    pageIndex,
    status: "ready",
    extractedText,
    sourceVersion: "lantern-explain-v1",
  };
}
