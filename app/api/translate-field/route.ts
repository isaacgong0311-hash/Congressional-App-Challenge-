import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

import { configuredGroqModel, resolveAiConfiguration } from "../../lib/ai-config";
import {
  classifyProviderFailure,
  providerDiagnostic,
  usageDiagnostic,
} from "../../lib/provider-diagnostics";

export const runtime = "nodejs";
export const maxDuration = 20;

// Translates a single text block (e.g. the English reply letter) to the
// user's chosen language so they can understand it before sending.
// Bracketed placeholders like [Your name] are preserved verbatim.

export async function POST(req: Request) {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  const configuration = resolveAiConfiguration();
  if (!configuration.apiKeyAvailable || !configuration.textModel) {
    return Response.json(
      { error: "Translation is temporarily unavailable." },
      { status: 503 },
    );
  }

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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 18_000);

  try {
    const { text: translation, usage } = await generateText({
      model: groq(configuredGroqModel("text")),
      abortSignal: controller.signal,
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
    console.info(
      "translation success",
      providerDiagnostic({
        requestId,
        route: "/api/translate-field",
        modelRole: "text",
        outcome: "success",
        durationMs: Date.now() - startedAt,
        ...usageDiagnostic(usage),
      }),
    );
    return Response.json({ translation: translation.trim() });
  } catch (error) {
    const failure = classifyProviderFailure(error, {
      timedOut: controller.signal.aborted,
    });
    console.error(
      "translation failure",
      providerDiagnostic({
        requestId,
        route: "/api/translate-field",
        modelRole: "text",
        outcome: failure.kind,
        durationMs: Date.now() - startedAt,
      }),
    );
    return Response.json(
      { error: "Translation failed.", code: failure.kind },
      { status: failure.status },
    );
  } finally {
    clearTimeout(timeout);
  }
}
