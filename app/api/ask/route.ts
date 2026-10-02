import { createAskHandler, generateAskWithGroq } from "../../features/letter-tool/server/ask";

export const runtime = "nodejs";
export const maxDuration = 30;
export const POST = createAskHandler({ available: () => Boolean(process.env.GROQ_API_KEY?.trim()), generate: generateAskWithGroq, timeoutMs: 25_000 });
