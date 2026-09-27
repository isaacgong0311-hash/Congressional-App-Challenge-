import { groq } from "@ai-sdk/groq";
import { generateText } from "ai";

import {
  configuredGroqModel,
  resolveAiConfiguration,
} from "../app/lib/ai-config";

const ONE_PIXEL_PNG = Uint8Array.from(
  Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z4GQAAAAASUVORK5CYII=",
    "base64",
  ),
);

async function smoke() {
  const configuration = resolveAiConfiguration();
  if (
    !configuration.apiKeyAvailable ||
    !configuration.visionModel ||
    !configuration.textModel
  ) {
    throw new Error(
      configuration.errors.join(" ") ||
        "GROQ_API_KEY and valid model configuration are required.",
    );
  }

  const visionStartedAt = Date.now();
  const vision = await generateText({
    model: groq(configuredGroqModel("vision")),
    maxOutputTokens: 12,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Reply with the single word READY." },
          { type: "image", image: ONE_PIXEL_PNG, mediaType: "image/png" },
        ],
      },
    ],
  });

  const textStartedAt = Date.now();
  const textResult = await generateText({
    model: groq(configuredGroqModel("text")),
    maxOutputTokens: 12,
    prompt: "Reply with the single word READY.",
  });

  process.stdout.write(
    `${JSON.stringify(
      {
        status: "ok",
        vision: {
          model: configuration.visionModel,
          durationMs: textStartedAt - visionStartedAt,
          outputTokens: vision.usage.outputTokens,
        },
        text: {
          model: configuration.textModel,
          durationMs: Date.now() - textStartedAt,
          outputTokens: textResult.usage.outputTokens,
        },
      },
      null,
      2,
    )}\n`,
  );
}

smoke().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Provider smoke failed.";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
