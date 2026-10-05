import { afterEach, describe, expect, it, vi } from "vitest";

import { POST } from "../../app/api/explain/route";
import { generateText } from "ai";

vi.mock("ai", () => ({
  generateText: vi.fn().mockResolvedValue({
    text: "",
    finishReason: "stop",
    usage: { outputTokens: 0 },
  }),
}));

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("letter reading recovery", () => {
  it("retries a malformed provider response once before reporting a safe error", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-only");
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const form = new FormData();
    form.set("image", new File(["sample"], "sample.png", { type: "image/png" }));
    const response = await POST(
      new Request("http://localhost/api/explain", { method: "POST", body: form }),
    );

    expect(generateText).toHaveBeenCalledTimes(2);
    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "INVALID_PROVIDER_RESPONSE", retryable: true },
    });
  });

  it("returns a valid reading after one malformed response", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-only");
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const result = {
      documentType: "Sample notice",
      category: "other",
      confidence: 90,
      whyThisType: "The title says notice.",
      urgency: "low",
      meaning: "A sample notice.",
      keyDetails: { sender: null, contactPhone: null, accountNumber: null, amountDue: null },
      whatTheyNeed: [],
      documentChecklist: [],
      responseLetter: { applicable: false, kind: "", body: "" },
      nextSteps: [],
      phoneScript: "",
      deadline: null,
      deadlineISO: null,
      isPossibleScam: false,
      scamSigns: [],
      isCrisis: false,
      crisisMessage: "",
      scamAgencyFacts: "",
      whatHappensIfNothing: "",
      photoQualityNote: null,
      detectedLetterLanguage: "English",
      originalText: "Sample notice",
    };
    vi.mocked(generateText)
      .mockReset()
      .mockResolvedValueOnce({
        text: "",
        finishReason: "stop",
        usage: { outputTokens: 0 },
      } as never)
      .mockResolvedValueOnce({
        text: JSON.stringify(result),
        finishReason: "stop",
        usage: { outputTokens: 100 },
      } as never);
    const form = new FormData();
    form.set("image", new File(["sample"], "sample.png", { type: "image/png" }));
    const response = await POST(
      new Request("http://localhost/api/explain", { method: "POST", body: form }),
    );

    expect(generateText).toHaveBeenCalledTimes(2);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      documentType: "Sample notice",
    });
  });
});
