import { z } from "zod";

import { runGroqExtraction } from "../../../features/first-day/server/extract-page";
import { FirstDayExtractionSchema } from "../../../features/first-day/server/extraction-schema";
import { providerErrorSummary } from "../../../lib/provider-error";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const SUPPORTED_MEDIA_TYPES = new Set(["image/jpeg", "image/png"]);

const MetadataSchema = z
  .object({
    documentId: z.string().regex(/^[a-zA-Z0-9-]{1,120}$/),
    requestId: z.string().regex(/^[a-zA-Z0-9-]{1,120}$/),
  })
  .strict();

const LanguageSchema = z.enum(["English", "Spanish"]);

type ExtractionInput = {
  bytes: Uint8Array;
  mediaType: "image/jpeg" | "image/png";
  language: string;
  documentId: string;
  requestId: string;
  signal: AbortSignal;
};

export type ExtractionDependencies = {
  providerAvailable: () => boolean;
  extractPage: (input: ExtractionInput) => Promise<unknown>;
  timeoutMs: number;
};

export function parseExtractionMetadata(input: unknown) {
  const parsed = MetadataSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid extraction metadata");
  return parsed.data;
}

function errorResponse(error: string, status: number) {
  return Response.json({ error }, { status });
}

export function createExtractionHandler(dependencies: ExtractionDependencies) {
  return async function handleExtraction(request: Request): Promise<Response> {
    const startedAt = Date.now();
    let logRequestId = crypto.randomUUID();
    let form: FormData;

    try {
      form = await request.formData();
    } catch {
      return errorResponse("Invalid form data.", 400);
    }

    const image = form.get("image");
    if (!(image instanceof File)) {
      return errorResponse("No image was uploaded.", 400);
    }
    if (!SUPPORTED_MEDIA_TYPES.has(image.type)) {
      return errorResponse("Use a JPG or PNG image.", 400);
    }
    if (image.size <= 0 || image.size > MAX_IMAGE_BYTES) {
      return errorResponse("Image must be between 1 byte and 10 MB.", 400);
    }

    let metadata: ReturnType<typeof parseExtractionMetadata>;
    try {
      metadata = parseExtractionMetadata({
        documentId: form.get("documentId"),
        requestId: form.get("requestId"),
      });
    } catch {
      return errorResponse("Invalid extraction metadata.", 400);
    }
    logRequestId = metadata.requestId;

    const language = LanguageSchema.safeParse(form.get("language"));
    if (!language.success) {
      return errorResponse("Language must be English or Spanish.", 400);
    }
    if (!dependencies.providerAvailable()) {
      return errorResponse("Live document reading is temporarily unavailable.", 500);
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), dependencies.timeoutMs);

    try {
      const providerValue = await dependencies.extractPage({
        bytes: new Uint8Array(await image.arrayBuffer()),
        mediaType: image.type as "image/jpeg" | "image/png",
        language: language.data,
        documentId: metadata.documentId,
        requestId: metadata.requestId,
        signal: controller.signal,
      });
      const controlledValue =
        providerValue && typeof providerValue === "object"
          ? {
              ...providerValue,
              documentId: metadata.documentId,
              requestId: metadata.requestId,
            }
          : providerValue;
      const parsed = FirstDayExtractionSchema.safeParse(controlledValue);
      if (!parsed.success) {
        console.error(
          "first-day extraction schema error",
          providerErrorSummary({
            requestId: logRequestId,
            route: "/api/first-day/extract",
            kind: "schema",
            durationMs: Date.now() - startedAt,
            issueCount: parsed.error.issues.length,
          }),
        );
        return errorResponse(
          "Could not read this page. Try a clearer, well-lit photo.",
          502,
        );
      }

      return Response.json(parsed.data);
    } catch {
      const timedOut = controller.signal.aborted;
      console.error(
        timedOut
          ? "first-day extraction timeout"
          : "first-day extraction provider error",
        providerErrorSummary({
          requestId: logRequestId,
          route: "/api/first-day/extract",
          kind: timedOut ? "timeout" : "provider",
          durationMs: Date.now() - startedAt,
        }),
      );
      return errorResponse(
        timedOut
          ? "Reading this page took too long. Try again."
          : "Could not read this page. Try a clearer, well-lit photo.",
        timedOut ? 504 : 502,
      );
    } finally {
      clearTimeout(timeout);
    }
  };
}

export const POST = createExtractionHandler({
  providerAvailable: () => Boolean(process.env.GROQ_API_KEY),
  extractPage: runGroqExtraction,
  timeoutMs: 55_000,
});
