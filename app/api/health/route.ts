import { resolveAiConfiguration } from "../../lib/ai-config";
import { isDistributedRateLimitingConfigured } from "../../lib/rate-limit";

export const runtime = "nodejs";

export async function GET() {
  const ai = resolveAiConfiguration();
  const vision = ai.apiKeyAvailable && ai.visionModel !== null;
  const text = ai.apiKeyAvailable && ai.textModel !== null;
  const capabilities = {
    vision,
    text,
    speech: Boolean(process.env.ELEVENLABS_API_KEY),
    localHelp: Boolean(process.env.PERPLEXITY_API_KEY),
    rateLimiting: isDistributedRateLimitingConfigured(),
  };
  const allRequired = capabilities.vision && capabilities.text && capabilities.rateLimiting;
  return Response.json(
    {
      status: allRequired ? "ok" : "degraded",
      capabilities,
      ts: new Date().toISOString(),
    },
    {
      status: allRequired ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
