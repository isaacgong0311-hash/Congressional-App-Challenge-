import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { readingUnavailable } from "../../lib/reading-service";
import { READING_MODEL } from "../../lib/reading-model";
import { providerErrorSummary } from "../../lib/provider-error";

export const runtime = "nodejs";
export const maxDuration = 20;

// Translates a single text block (e.g. the English reply letter) to the
// user's chosen language so they can understand it before sending.
// Bracketed placeholders like [Your name] are preserved verbatim.

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  let body: { text?: string; language?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const text = body.text?.trim();
  const language = body.language?.trim() || "English";

  if (!text) return Response.json({ error: "No text provided." }, { status: 400 });
  if (language === "English")
    return Response.json({ translation: text }); // no-op

  if (!process.env.GROQ_API_KEY?.trim()) {
    return Response.json({ error: readingUnavailable(language) }, { status: 503 });
  }

  try {
    const { text: translation } = await generateText({
      abortSignal: AbortSignal.timeout(15_000),
      model: groq(READING_MODEL),
      providerOptions: { groq: { reasoningEffort: "none" } },
      messages: [
        {
          role: "system",
          content: [
            `Translate the following text to ${language}.`,
            "Preserve all formatting, line breaks, and punctuation.",
            "Keep every bracketed placeholder exactly as written — e.g. [Your full name], [Today's date]. Do NOT translate the text inside brackets.",
            "Output ONLY the translation — no preamble, no explanation.",
          ].join("\n"),
        },
        { role: "user", content: text.slice(0, 6000) },
      ],
    });
    return Response.json({ translation: translation.trim() });
  } catch {
    console.error("translate-field error", providerErrorSummary({ requestId, route: "/api/translate-field", kind: "provider", durationMs: Date.now() - startedAt }));
    return Response.json({ error: "Translation failed." }, { status: 502 });
  }
}
