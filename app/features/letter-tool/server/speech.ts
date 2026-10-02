import { z } from "zod";
import { providerErrorSummary } from "../../../lib/provider-error";
import { apiError, noStoreHeaders, readBoundedJson, requestIdFrom } from "../../../lib/server/http";

const RequestSchema = z.object({ text: z.string().trim().min(1).max(2_500), bcp47: z.string().trim().min(2).max(35).default("en") }).strict();
type SpeechInput = z.infer<typeof RequestSchema> & { languageCode: string; signal: AbortSignal };
export type SpeechDependencies = { available: () => boolean; synthesize: (input: SpeechInput) => Promise<ArrayBuffer>; timeoutMs: number };
const codes: Record<string, string> = { en: "en", es: "es", zh: "zh", vi: "vi", tl: "fil", ar: "ar", fr: "fr", ht: "fr", ko: "ko", ru: "ru" };
const decode = (text: string) => text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;|&#039;/g, "'").replace(/&nbsp;/g, " ");

export function createSpeechHandler(deps: SpeechDependencies) {
  return async (request: Request) => {
    const requestId = requestIdFrom(request.headers); const startedAt = Date.now();
    const parsed = await readBoundedJson(request, RequestSchema, 4_000);
    if (!parsed.ok) return apiError({ code: parsed.reason === "payload_too_large" ? "PAYLOAD_TOO_LARGE" : "INVALID_REQUEST", message: "Invalid speech request.", requestId, retryable: false, status: 400 });
    if (!deps.available()) return apiError({ code: "PROVIDER_UNAVAILABLE", message: "Server speech is unavailable. Browser speech is still available.", requestId, retryable: true, status: 503 });
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), deps.timeoutMs);
    try {
      const prefix = parsed.data.bcp47.split("-")[0].toLowerCase();
      const audio = await deps.synthesize({ ...parsed.data, text: decode(parsed.data.text), languageCode: codes[prefix] ?? "en", signal: controller.signal });
      return new Response(audio, { headers: { ...noStoreHeaders, "Content-Type": "audio/mpeg", "Content-Length": String(audio.byteLength) } });
    } catch {
      const timedOut = controller.signal.aborted;
      console.error("speech error", providerErrorSummary({ requestId, route: "/api/speak", kind: timedOut ? "timeout" : "provider", durationMs: Date.now() - startedAt }));
      return apiError({ code: timedOut ? "PROVIDER_TIMEOUT" : "PROVIDER_REJECTED", message: "Server speech is unavailable. Browser speech is still available.", requestId, retryable: true, status: timedOut ? 504 : 502 });
    } finally { clearTimeout(timer); }
  };
}

export async function synthesizeWithElevenLabs(input: SpeechInput) {
  const response = await fetch("https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM", { method: "POST", signal: input.signal, headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY ?? "", "Content-Type": "application/json", Accept: "audio/mpeg" }, body: JSON.stringify({ text: input.text, model_id: "eleven_multilingual_v2", language_code: input.languageCode, voice_settings: { stability: 0.38, similarity_boost: 0.82, style: 0.32, use_speaker_boost: true } }) });
  if (!response.ok) throw new Error("provider_rejected");
  return response.arrayBuffer();
}
