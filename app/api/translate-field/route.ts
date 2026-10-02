import { createTranslateHandler, translateWithGroq } from "../../features/letter-tool/server/translate";

export const runtime = "nodejs";
export const maxDuration = 20;
export const POST = createTranslateHandler({ available: () => Boolean(process.env.GROQ_API_KEY?.trim()), translate: translateWithGroq, timeoutMs: 15_000 });
