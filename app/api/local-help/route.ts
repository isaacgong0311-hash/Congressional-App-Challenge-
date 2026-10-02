import { createLocalHelpHandler, searchWithPerplexity } from "../../features/letter-tool/server/local-help";
export const runtime = "nodejs";
export const maxDuration = 30;
export const POST = createLocalHelpHandler({ available: () => Boolean(process.env.PERPLEXITY_API_KEY?.trim()), search: searchWithPerplexity, timeoutMs: 25_000 });
