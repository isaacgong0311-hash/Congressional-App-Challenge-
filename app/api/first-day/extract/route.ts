import { z } from "zod";

import { runGroqExtraction } from "../../../features/first-day/server/extract-page";
import { FirstDayExtractionSchema } from "../../../features/first-day/server/extraction-schema";
import { providerErrorSummary } from "../../../lib/provider-error";
import {
  apiError,
  apiJson,
  requestIdFrom,
  type ApiErrorCode,
} from "../../../lib/server/http";
import { isTrustedMutationRequest } from "../../../lib/server/origin";

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

export function createExtractionHandler(dependencies: ExtractionDependencies) {
  return async function handleExtraction(request: Request): Promise<Response> {
    const startedAt = Date.now();
    let logRequestId = requestIdFrom(request.headers);
    const errorResponse = (
      code: ApiErrorCode,
      message: string,
      status: number,
      retryable: boolean,
    ) =>
      apiError({
        code,
        message,
        requestId: logRequestId,
        retryable,
        status,
      });

    if (
      !isTrustedMutationRequest(
        request,
        process.env.NODE_ENV === "production",
      )
    ) {
      return errorResponse(
        "INVALID_REQUEST",
        "This request is not allowed.",
        403,
        false,
      );
    }

    let form: FormData;

    try {
      form = await request.formData();
    } catch {
      return errorResponse(
        "INVALID_REQUEST",
        "Invalid form data.",
        400,
        false,
      );
    }

    const image = form.get("image");
    if (!(image instanceof File)) {
      return errorResponse(
        "INVALID_REQUEST",
        "No image was uploaded.",
        400,
        false,
      );
    }
    if (!SUPPORTED_MEDIA_TYPES.has(image.type)) {
      return errorResponse(
        "UNSUPPORTED_MEDIA",
        "Use a JPG or PNG image.",
        400,
        false,
      );
    }
    if (image.size <= 0 || image.size > MAX_IMAGE_BYTES) {
      return errorResponse(
        "PAYLOAD_TOO_LARGE",
        "Image must be between 1 byte and 10 MB.",
        400,
        false,
      );
    }

    let metadata: ReturnType<typeof parseExtractionMetadata>;
    try {
      metadata = parseExtractionMetadata({
        documentId: form.get("documentId"),
        requestId: form.get("requestId"),
      });
    } catch {
      return errorResponse(
        "INVALID_REQUEST",
        "Invalid extraction metadata.",
        400,
        false,
      );
    }
    logRequestId = metadata.requestId;

    const language = LanguageSchema.safeParse(form.get("language"));
    if (!language.success) {
      return errorResponse(
        "INVALID_REQUEST",
        "Language must be English or Spanish.",
        400,
        false,
      );
    }
    if (!dependencies.providerAvailable()) {
      return errorResponse(
        "PROVIDER_UNAVAILABLE",
        "Live document reading is temporarily unavailable.",
        503,
        true,
      );
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
            issuePaths: parsed.error.issues.map((issue) => issue.path.join(".")),
            issueCodes: parsed.error.issues.map((issue) => issue.code),
          }),
        );
        return errorResponse(
          "INVALID_PROVIDER_RESPONSE",
          "Could not read this page. Try a clearer, well-lit photo.",
          502,
          true,
        );
      }

      return apiJson(parsed.data);
    } catch (error) {
      const timedOut = controller.signal.aborted;
      const providerStatus =
        error && typeof error === "object" && "statusCode" in error &&
        typeof error.statusCode === "number"
          ? error.statusCode
          : undefined;
      console.error(
        timedOut
          ? "first-day extraction timeout"
          : "first-day extraction provider error",
        providerErrorSummary({
          requestId: logRequestId,
          route: "/api/first-day/extract",
          kind: timedOut ? "timeout" : "provider",
          durationMs: Date.now() - startedAt,
          providerStatus,
        }),
      );
      return timedOut
        ? errorResponse(
            "PROVIDER_TIMEOUT",
            "Reading this page took too long. Try again.",
            504,
            true,
          )
        : providerStatus === 429
          ? errorResponse(
              "PROVIDER_UNAVAILABLE",
              "Live document reading is busy right now. Please try again shortly.",
              503,
              true,
            )
          : errorResponse(
              "PROVIDER_REJECTED",
              "Could not read this page right now. Please try again.",
              502,
              true,
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
