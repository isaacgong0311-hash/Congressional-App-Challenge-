import {
  MAX_CASE_BYTES,
  MAX_DOCUMENT_BYTES,
} from "../domain/upload-queue";

export const PDF_MEDIA_TYPE = "application/pdf";
export const MAX_PDF_BYTES = MAX_CASE_BYTES;
export const PDF_RENDER_MAX_DIMENSION = 1_800;
export const PDF_RENDER_QUALITY = 0.86;

export type PdfPreparationErrorCode =
  | "pdf_too_large"
  | "pdf_too_many_pages"
  | "pdf_encrypted"
  | "pdf_malformed"
  | "pdf_page_too_large"
  | "pdf_case_too_large"
  | "pdf_render_failed";

export class PdfPreparationError extends Error {
  constructor(readonly code: PdfPreparationErrorCode) {
    super(code);
    this.name = "PdfPreparationError";
  }
}

export type PreparedPdfPage = {
  file: File;
  sourceFileName: string;
  sourcePageNumber: number;
};

export function validatePdfCandidate(file: Pick<File, "size">, remainingPages: number) {
  if (file.size <= 0 || file.size > MAX_PDF_BYTES) {
    throw new PdfPreparationError("pdf_too_large");
  }
  if (remainingPages <= 0) {
    throw new PdfPreparationError("pdf_too_many_pages");
  }
}

export function normalizePdfPreparationError(error: unknown) {
  if (error instanceof PdfPreparationError) return error;
  if (
    error &&
    typeof error === "object" &&
    "name" in error &&
    error.name === "PasswordException"
  ) {
    return new PdfPreparationError("pdf_encrypted");
  }
  return new PdfPreparationError("pdf_malformed");
}

function baseName(fileName: string) {
  const withoutExtension = fileName.replace(/\.pdf$/i, "").trim();
  return withoutExtension || "school-document";
}

function canvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new PdfPreparationError("pdf_render_failed"));
      },
      "image/jpeg",
      PDF_RENDER_QUALITY,
    );
  });
}

export async function renderPdfPages(
  file: File,
  options: {
    remainingPages: number;
    remainingBytes: number;
  },
): Promise<PreparedPdfPage[]> {
  validatePdfCandidate(file, options.remainingPages);

  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
  });

  try {
    const document = await loadingTask.promise;
    if (document.numPages > options.remainingPages) {
      throw new PdfPreparationError("pdf_too_many_pages");
    }

    const pages: PreparedPdfPage[] = [];
    let preparedBytes = 0;
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const originalViewport = page.getViewport({ scale: 1 });
      const longestSide = Math.max(
        originalViewport.width,
        originalViewport.height,
      );
      const viewport = page.getViewport({
        scale: PDF_RENDER_MAX_DIMENSION / longestSide,
      });
      const canvas = window.document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(viewport.width));
      canvas.height = Math.max(1, Math.round(viewport.height));
      const canvasContext = canvas.getContext("2d", { alpha: false });
      if (!canvasContext) {
        throw new PdfPreparationError("pdf_render_failed");
      }
      await page.render({ canvas, canvasContext, viewport }).promise;
      const blob = await canvasBlob(canvas);
      page.cleanup();

      if (blob.size > MAX_DOCUMENT_BYTES) {
        throw new PdfPreparationError("pdf_page_too_large");
      }
      preparedBytes += blob.size;
      if (preparedBytes > options.remainingBytes) {
        throw new PdfPreparationError("pdf_case_too_large");
      }

      pages.push({
        file: new File(
          [blob],
          `${baseName(file.name)}-page-${pageNumber}.jpg`,
          { type: "image/jpeg", lastModified: file.lastModified },
        ),
        sourceFileName: file.name,
        sourcePageNumber: pageNumber,
      });
    }
    await document.cleanup();
    await loadingTask.destroy();
    return pages;
  } catch (error) {
    await loadingTask.destroy();
    throw normalizePdfPreparationError(error);
  }
}
