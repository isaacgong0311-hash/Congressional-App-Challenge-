import { apiJson } from "../../lib/server/http";

export const runtime = "nodejs";

export async function GET() {
  const release =
    process.env.VERCEL_GIT_COMMIT_SHA?.trim() ||
    process.env.npm_package_version?.trim() ||
    "development";

  return apiJson({
    status: "ok",
    version: release.slice(0, 64),
    capabilities: {
      judgeDemo: true,
      liveDocumentReading: Boolean(process.env.GROQ_API_KEY?.trim()),
      serverSpeech: Boolean(process.env.ELEVENLABS_API_KEY?.trim()),
      localHelpSearch: Boolean(process.env.PERPLEXITY_API_KEY?.trim()),
    },
  });
}
