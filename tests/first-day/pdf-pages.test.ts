import { describe, expect, it } from "vitest";

import {
  MAX_PDF_BYTES,
  normalizePdfPreparationError,
  PdfPreparationError,
  validatePdfCandidate,
} from "../../app/features/first-day/client/pdf-pages";

describe("PDF preparation boundaries", () => {
  it("accepts a non-empty PDF candidate within the case size", () => {
    expect(() => validatePdfCandidate({ size: 1024 }, 5)).not.toThrow();
  });

  it("rejects empty and oversized PDF candidates", () => {
    for (const size of [0, MAX_PDF_BYTES + 1]) {
      expect(() => validatePdfCandidate({ size }, 5)).toThrowError(
        new PdfPreparationError("pdf_too_large"),
      );
    }
  });

  it("rejects a PDF when the case has no page capacity", () => {
    expect(() => validatePdfCandidate({ size: 1024 }, 0)).toThrowError(
      new PdfPreparationError("pdf_too_many_pages"),
    );
  });

  it("distinguishes encrypted PDFs from malformed PDFs", () => {
    expect(normalizePdfPreparationError({ name: "PasswordException" }).code).toBe(
      "pdf_encrypted",
    );
    expect(normalizePdfPreparationError(new Error("broken xref")).code).toBe(
      "pdf_malformed",
    );
  });
});
