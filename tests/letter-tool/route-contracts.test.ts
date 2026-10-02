import { afterEach, describe, expect, it, vi } from "vitest";

import { createAskHandler } from "../../app/features/letter-tool/server/ask";
import { createLocalHelpHandler } from "../../app/features/letter-tool/server/local-help";
import { createSpeechHandler } from "../../app/features/letter-tool/server/speech";
import { createTranslateHandler } from "../../app/features/letter-tool/server/translate";

function jsonRequest(path: string, body: unknown) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("grounded assistant route contract", () => {
  it("rejects oversized messages before calling the provider", async () => {
    const generate = vi.fn(async () => "unused");
    const handler = createAskHandler({
      available: () => true,
      generate,
      timeoutMs: 100,
    });

    const response = await handler(
      jsonRequest("/api/ask", {
        language: "English",
        context: {},
        messages: [{ role: "user", content: "x".repeat(2_001) }],
      }),
    );

    expect(response.status).toBe(400);
    expect(generate).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "INVALID_REQUEST", retryable: false },
    });
  });

  it("returns a grounded reply through an injected provider", async () => {
    const generate = vi.fn(async () => "Call the office listed on the letter.");
    const handler = createAskHandler({
      available: () => true,
      generate,
      timeoutMs: 100,
    });

    const response = await handler(
      jsonRequest("/api/ask", {
        language: "English",
        simplify: false,
        mode: "ask",
        context: { documentType: "School letter", meaning: "Registration reminder" },
        messages: [{ role: "user", content: "What should I do?" }],
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      reply: "Call the office listed on the letter.",
    });
    expect(generate).toHaveBeenCalledOnce();
  });

  it("returns safe unavailable and provider-failure errors", async () => {
    const unavailable = createAskHandler({
      available: () => false,
      generate: vi.fn(async () => "unused"),
      timeoutMs: 100,
    });
    expect(
      (await unavailable(jsonRequest("/api/ask", { context: {} }))).status,
    ).toBe(503);

    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const failing = createAskHandler({
      available: () => true,
      generate: async () => {
        throw new Error("private-letter-content");
      },
      timeoutMs: 100,
    });
    const response = await failing(jsonRequest("/api/ask", { context: {} }));
    expect(response.status).toBe(502);
    expect(JSON.stringify(await response.json())).not.toContain("private-letter-content");
  });
});

describe("translation route contract", () => {
  it("rejects oversized text before calling the provider", async () => {
    const translate = vi.fn(async () => "unused");
    const handler = createTranslateHandler({
      available: () => true,
      translate,
      timeoutMs: 100,
    });
    const response = await handler(
      jsonRequest("/api/translate-field", {
        text: "x".repeat(6_001),
        language: "Spanish",
      }),
    );
    expect(response.status).toBe(400);
    expect(translate).not.toHaveBeenCalled();
  });

  it("returns English without a provider call", async () => {
    const translate = vi.fn(async () => "unused");
    const handler = createTranslateHandler({
      available: () => false,
      translate,
      timeoutMs: 100,
    });
    const response = await handler(
      jsonRequest("/api/translate-field", {
        text: "Keep [Your name] here.",
        language: "English",
      }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      translation: "Keep [Your name] here.",
    });
    expect(translate).not.toHaveBeenCalled();
  });

  it("returns a validated translation through an injected provider", async () => {
    const handler = createTranslateHandler({
      available: () => true,
      translate: async () => "Guarde [Your name] aquí.",
      timeoutMs: 100,
    });
    const response = await handler(
      jsonRequest("/api/translate-field", {
        text: "Keep [Your name] here.",
        language: "Spanish",
      }),
    );
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      translation: "Guarde [Your name] aquí.",
    });
  });
});

describe("optional support service contracts", () => {
  it("validates and bounds local-help results", async () => {
    const search = vi.fn(async () => [
      { name: "Library", phone: null, address: null, url: "https://example.org", desc: "Local help" },
      { name: "Unsafe", phone: null, address: null, url: "javascript:alert(1)", desc: "Bad URL" },
    ]);
    const handler = createLocalHelpHandler({ available: () => true, search, timeoutMs: 100 });
    const response = await handler(jsonRequest("/api/local-help", { category: "school", city: "Round Rock", state: "TX", language: "English" }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ resources: [
      { name: "Library", phone: null, address: null, url: "https://example.org", desc: "Local help" },
    ] });
  });

  it("returns 503 before optional local search is called", async () => {
    const search = vi.fn(async () => []);
    const handler = createLocalHelpHandler({ available: () => false, search, timeoutMs: 100 });
    const response = await handler(jsonRequest("/api/local-help", { category: "school", city: "", state: "TX" }));
    expect(response.status).toBe(503);
    expect(search).not.toHaveBeenCalled();
  });

  it("rejects oversized speech and returns bounded audio", async () => {
    const synthesize = vi.fn(async () => new Uint8Array([1, 2, 3]).buffer);
    const handler = createSpeechHandler({ available: () => true, synthesize, timeoutMs: 100 });
    expect((await handler(jsonRequest("/api/speak", { text: "x".repeat(2_501), bcp47: "en-US" }))).status).toBe(400);
    expect(synthesize).not.toHaveBeenCalled();
    const response = await handler(jsonRequest("/api/speak", { text: "Read this", bcp47: "es-MX" }));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("audio/mpeg");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
