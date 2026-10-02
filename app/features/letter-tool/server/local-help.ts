import { z } from "zod";
import { providerErrorSummary } from "../../../lib/provider-error";
import { apiError, apiJson, readBoundedJson, requestIdFrom } from "../../../lib/server/http";

const RequestSchema = z.object({ category: z.string().trim().min(1).max(60), city: z.string().trim().max(60).default(""), state: z.string().trim().min(2).max(60), language: z.string().trim().min(2).max(40).default("English") }).strict();
const ResourceSchema = z.object({ name: z.string().trim().min(1).max(160), phone: z.string().trim().max(80).nullable(), address: z.string().trim().max(240).nullable(), url: z.string().url().refine((value) => /^https?:/i.test(value)).nullable(), desc: z.string().trim().min(1).max(500) }).strict();
type SearchInput = z.infer<typeof RequestSchema> & { signal: AbortSignal };
export type LocalHelpDependencies = { available: () => boolean; search: (input: SearchInput) => Promise<unknown>; timeoutMs: number };

export function createLocalHelpHandler(deps: LocalHelpDependencies) {
  return async (request: Request) => {
    const requestId = requestIdFrom(request.headers); const startedAt = Date.now();
    const parsed = await readBoundedJson(request, RequestSchema, 2_000);
    if (!parsed.ok) return apiError({ code: parsed.reason === "payload_too_large" ? "PAYLOAD_TOO_LARGE" : "INVALID_REQUEST", message: "Invalid search request.", requestId, retryable: false, status: 400 });
    if (!deps.available()) return apiError({ code: "PROVIDER_UNAVAILABLE", message: "Local search is unavailable. Use the verified directory below.", requestId, retryable: true, status: 503 });
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), deps.timeoutMs);
    try {
      const value = await deps.search({ ...parsed.data, signal: controller.signal });
      const list = Array.isArray(value) ? value : [];
      const resources = list.slice(0, 5).flatMap((item) => { const result = ResourceSchema.safeParse(item); return result.success ? [result.data] : []; });
      return apiJson({ resources });
    } catch {
      const timedOut = controller.signal.aborted;
      console.error("local-help error", providerErrorSummary({ requestId, route: "/api/local-help", kind: timedOut ? "timeout" : "provider", durationMs: Date.now() - startedAt }));
      return apiError({ code: timedOut ? "PROVIDER_TIMEOUT" : "PROVIDER_REJECTED", message: timedOut ? "Search took too long. Please try again." : "Search failed. Try again.", requestId, retryable: true, status: timedOut ? 504 : 502 });
    } finally { clearTimeout(timer); }
  };
}

export async function searchWithPerplexity(input: SearchInput) {
  const location = input.city ? `${input.city}, ${input.state}` : input.state;
  const response = await fetch("https://api.perplexity.ai/chat/completions", { method: "POST", signal: input.signal, headers: { Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "sonar", messages: [{ role: "system", content: "Return only a JSON array of up to five real local programs. Each item has name, phone, address, url, and desc. Use null when uncertain." }, { role: "user", content: `Find ${input.category} assistance programs for low-income residents in ${location}.` }], search_recency_filter: "month", return_citations: false }) });
  if (!response.ok) throw new Error("provider_rejected");
  const data = await response.json() as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content ?? "[]";
  const match = content.match(/\[[\s\S]*\]/);
  return match ? JSON.parse(match[0]) as unknown : [];
}
