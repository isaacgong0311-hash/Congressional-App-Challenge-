import { createSpeechHandler, synthesizeWithElevenLabs } from "../../features/letter-tool/server/speech";
export const runtime = "nodejs";
export const maxDuration = 30;
export const POST = createSpeechHandler({ available: () => Boolean(process.env.ELEVENLABS_API_KEY?.trim()), synthesize: synthesizeWithElevenLabs, timeoutMs: 25_000 });
