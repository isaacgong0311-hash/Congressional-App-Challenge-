import { describe, expect, it } from "vitest";

import {
  DEFAULT_GROQ_TEXT_MODEL,
  DEFAULT_GROQ_VISION_MODEL,
  resolveAiConfiguration,
} from "../../app/lib/ai-config";

describe("AI provider configuration", () => {
  it("uses allowlisted defaults without exposing a key", () => {
    expect(resolveAiConfiguration({ GROQ_API_KEY: "test-key" })).toEqual({
      apiKeyAvailable: true,
      visionModel: DEFAULT_GROQ_VISION_MODEL,
      textModel: DEFAULT_GROQ_TEXT_MODEL,
      errors: [],
    });
  });

  it("rejects retired or unknown model overrides", () => {
    const result = resolveAiConfiguration({
      GROQ_API_KEY: "test-key",
      GROQ_VISION_MODEL: "qwen/qwen3.6-27b",
      GROQ_TEXT_MODEL: "unknown/text-model",
    });

    expect(result.visionModel).toBeNull();
    expect(result.textModel).toBeNull();
    expect(result.errors).toHaveLength(2);
  });
});
