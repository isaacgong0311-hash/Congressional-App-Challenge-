import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { z } from "zod";
import { providerErrorSummary } from "../../../lib/provider-error";
import { readingUnavailable } from "../../../lib/reading-service";
import { READING_MODEL } from "../../../lib/reading-model";
import { apiError, apiJson, readBoundedJson, requestIdFrom } from "../../../lib/server/http";

const Message = z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(2_000) }).strict();
const Context = z.object({
  documentType: z.string().max(120).optional(), category: z.string().max(80).optional(), meaning: z.string().max(4_000).optional(),
  deadline: z.string().max(120).nullable().optional(), whatTheyNeed: z.array(z.string().max(500)).max(20).optional(),
  keyDetails: z.object({ sender: z.string().max(200).nullable().optional(), contactPhone: z.string().max(80).nullable().optional(), accountNumber: z.string().max(120).nullable().optional(), amountDue: z.string().max(120).nullable().optional() }).strict().optional(),
}).strict();
const Body = z.object({ language: z.string().trim().min(2).max(40).default("English"), simplify: z.boolean().default(false), mode: z.enum(["ask", "practice"]).default("ask"), context: Context, messages: z.array(Message).max(12).default([]) }).strict();
type AskBody = z.infer<typeof Body>;
type Input = { system: string; messages: AskBody["messages"]; signal: AbortSignal };
export type AskDependencies = { available: () => boolean; generate: (input: Input) => Promise<string>; timeoutMs: number };

function prompt(body: AskBody) {
  const d = body.context.keyDetails ?? {};
  const facts = [`Document type: ${body.context.documentType ?? "unknown"}`, `Topic area: ${body.context.category ?? "unknown"}`, body.context.meaning ?? "", d.sender ? `Sender: ${d.sender}` : "", d.contactPhone ? `Phone: ${d.contactPhone}` : "", body.context.deadline ? `Deadline: ${body.context.deadline}` : "", body.context.whatTheyNeed?.join("; ") ?? ""].filter(Boolean).join("\n");
  return [`Reply only in ${body.language}.`, "Use only the supplied letter facts. Never invent specifics or eligibility outcomes.", "If the facts do not answer the question, say so and suggest confirming with the listed office.", body.mode === "practice" ? "Act as a calm clerk and ask one thing at a time." : "Be concise, calm, and practical.", "LETTER FACTS:", facts].join("\n");
}

export function createAskHandler(deps: AskDependencies) {
  return async (request: Request) => {
    const requestId = requestIdFrom(request.headers); const startedAt = Date.now();
    const parsed = await readBoundedJson(request, Body, 32_000);
    if (!parsed.ok) return apiError({ code: parsed.reason === "payload_too_large" ? "PAYLOAD_TOO_LARGE" : "INVALID_REQUEST", message: "Invalid request.", requestId, retryable: false, status: 400 });
    if (!deps.available()) return apiError({ code: "PROVIDER_UNAVAILABLE", message: readingUnavailable(parsed.data.language), requestId, retryable: true, status: 503 });
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), deps.timeoutMs);
    try { return apiJson({ reply: (await deps.generate({ system: prompt(parsed.data), messages: parsed.data.messages, signal: controller.signal })).trim() }); }
    catch { const timedOut = controller.signal.aborted; console.error("ask route error", providerErrorSummary({ requestId, route: "/api/ask", kind: timedOut ? "timeout" : "provider", durationMs: Date.now() - startedAt })); return apiError({ code: timedOut ? "PROVIDER_TIMEOUT" : "PROVIDER_REJECTED", message: timedOut ? "The reading service took too long. Please try again." : "Sorry, I couldn't answer just now. Please try again.", requestId, retryable: true, status: timedOut ? 504 : 502 }); }
    finally { clearTimeout(timer); }
  };
}

export async function generateAskWithGroq(input: Input) {
  const result = await generateText({ abortSignal: input.signal, model: groq(READING_MODEL), providerOptions: { groq: { reasoningEffort: "none" } }, messages: [{ role: "system", content: input.system }, ...input.messages] });
  return result.text;
}
