import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { z } from "zod";
import { providerErrorSummary } from "../../../lib/provider-error";
import { readingUnavailable } from "../../../lib/reading-service";
import { READING_MODEL } from "../../../lib/reading-model";
import { apiError, apiJson, readBoundedJson, requestIdFrom } from "../../../lib/server/http";

const Body = z.object({ text: z.string().trim().min(1).max(6_000), language: z.string().trim().min(2).max(40) }).strict();
type Input = z.infer<typeof Body> & { signal: AbortSignal };
export type TranslateDependencies = { available: () => boolean; translate: (input: Input) => Promise<string>; timeoutMs: number };

export function createTranslateHandler(deps: TranslateDependencies) {
  return async (request: Request) => {
    const requestId = requestIdFrom(request.headers); const startedAt = Date.now();
    const parsed = await readBoundedJson(request, Body, 8_000);
    if (!parsed.ok) return apiError({ code: parsed.reason === "payload_too_large" ? "PAYLOAD_TOO_LARGE" : "INVALID_REQUEST", message: "Invalid translation request.", requestId, retryable: false, status: 400 });
    if (parsed.data.language.toLowerCase() === "english") return apiJson({ translation: parsed.data.text });
    if (!deps.available()) return apiError({ code: "PROVIDER_UNAVAILABLE", message: readingUnavailable(parsed.data.language), requestId, retryable: true, status: 503 });
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), deps.timeoutMs);
    try { return apiJson({ translation: (await deps.translate({ ...parsed.data, signal: controller.signal })).trim() }); }
    catch { const timedOut = controller.signal.aborted; console.error("translate-field error", providerErrorSummary({ requestId, route: "/api/translate-field", kind: timedOut ? "timeout" : "provider", durationMs: Date.now() - startedAt })); return apiError({ code: timedOut ? "PROVIDER_TIMEOUT" : "PROVIDER_REJECTED", message: timedOut ? "Translation took too long. Please try again." : "Translation failed.", requestId, retryable: true, status: timedOut ? 504 : 502 }); }
    finally { clearTimeout(timer); }
  };
}

export async function translateWithGroq(input: Input) {
  const result = await generateText({ abortSignal: input.signal, model: groq(READING_MODEL), providerOptions: { groq: { reasoningEffort: "none" } }, messages: [{ role: "system", content: `Translate to ${input.language}. Preserve formatting and every bracketed placeholder exactly. Output only the translation.` }, { role: "user", content: input.text }] });
  return result.text;
}
