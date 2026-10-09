import { afterEach, describe, expect, it, vi } from "vitest";

import { createExtractionHandler } from "../../app/api/first-day/extract/route";

const providerResponse = {
  schemaVersion: "first-day-extraction-v1",
  requestId: "model-request",
  documentId: "model-document",
  document: {
    label: "Enrollment reminder",
    confidence: 95,
    originalText: "Maya should arrive at the welcome center on August 14, 2026.",
    photoQualityNote: null,
  },
  facts: [
    {
      clientKey: "registration-date",
      kind: "date",
      semanticKey: "registration.date",
      label: "Registration date",
      originalValue: "August 14, 2026",
      normalizedValue: "2026-08-14",
      quote: "August 14, 2026",
      location: "Page 1",
      confidence: 94,
    },
  ],
};

const JPEG_BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
const PNG_BYTES = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

function extractionRequest(
  overrides: {
    documentId?: string;
    requestId?: string;
    type?: string;
    bytes?: Uint8Array;
  } = {},
) {
  const bytes = overrides.bytes ?? JPEG_BYTES;
  const imageBuffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;
  const form = new FormData();
  form.append(
    "image",
    new File([imageBuffer], "page.jpg", {
      type: overrides.type ?? "image/jpeg",
    }),
  );
  form.append("language", "English");
  form.append("documentId", overrides.documentId ?? "doc-browser-1");
  form.append("requestId", overrides.requestId ?? "request-browser-1");
  return new Request("http://localhost/api/first-day/extract", {
    method: "POST",
    body: form,
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("First Day extraction route", () => {
  it("returns a validated response with server-controlled IDs", async () => {
    const handler = createExtractionHandler({
      providerAvailable: () => true,
      extractPage: async () => providerResponse,
      timeoutMs: 100,
    });

    const response = await handler(extractionRequest());

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({
      ...providerResponse,
      documentId: "doc-browser-1",
      requestId: "request-browser-1",
    });
  });

  it("rejects unsupported files, oversized files, and unsafe IDs", async () => {
    const handler = createExtractionHandler({
      providerAvailable: () => true,
      extractPage: async () => providerResponse,
      timeoutMs: 100,
    });

    const unsupported = await handler(extractionRequest({ type: "text/plain" }));
    expect(unsupported.status).toBe(400);
    await expect(unsupported.json()).resolves.toMatchObject({
      error: { code: "UNSUPPORTED_MEDIA", retryable: false },
    });

    const oversized = await handler(
      extractionRequest({ bytes: new Uint8Array(10 * 1024 * 1024 + 1) }),
    );
    expect(oversized.status).toBe(400);
    await expect(oversized.json()).resolves.toMatchObject({
      error: { code: "PAYLOAD_TOO_LARGE", retryable: false },
    });

    const unsafe = await handler(
      extractionRequest({ documentId: "../private", requestId: "" }),
    );
    expect(unsafe.status).toBe(400);
    await expect(unsafe.json()).resolves.toMatchObject({
      error: { code: "INVALID_REQUEST", retryable: false },
    });
  });

  it("rejects spoofed or mismatched image bytes before calling the provider", async () => {
    const extractPage = vi.fn(async () => providerResponse);
    const handler = createExtractionHandler({
      providerAvailable: () => true,
      extractPage,
      timeoutMs: 100,
    });

    for (const request of [
      extractionRequest({ bytes: new Uint8Array([1, 2, 3]) }),
      extractionRequest({ type: "image/png", bytes: JPEG_BYTES }),
    ]) {
      const response = await handler(request);
      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toMatchObject({
        error: { code: "UNSUPPORTED_MEDIA", retryable: false },
      });
    }
    expect(extractPage).not.toHaveBeenCalled();

    expect((await handler(extractionRequest({ type: "image/png", bytes: PNG_BYTES }))).status).toBe(200);
    expect(extractPage).toHaveBeenCalledTimes(1);
  });

  it("reports an unavailable provider without calling it", async () => {
    const extractPage = vi.fn(async () => providerResponse);
    const handler = createExtractionHandler({
      providerAvailable: () => false,
      extractPage,
      timeoutMs: 100,
    });

    const response = await handler(extractionRequest());
    expect(response.status).toBe(503);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "PROVIDER_UNAVAILABLE",
        requestId: "request-browser-1",
        retryable: true,
      },
    });
    expect(extractPage).not.toHaveBeenCalled();
  });

  it("returns 502 for malformed provider output", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const handler = createExtractionHandler({
      providerAvailable: () => true,
      extractPage: async () => ({ tasks: [{ title: "Invented task" }] }),
      timeoutMs: 100,
    });

    const response = await handler(extractionRequest());
    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "INVALID_PROVIDER_RESPONSE",
        requestId: "request-browser-1",
        retryable: true,
      },
    });
  });

  it("rejects a well-shaped fact whose quote is absent from the page", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const handler = createExtractionHandler({
      providerAvailable: () => true,
      extractPage: async () => ({
        ...providerResponse,
        facts: [{ ...providerResponse.facts[0], quote: "Bring a passport." }],
      }),
      timeoutMs: 100,
    });

    const response = await handler(extractionRequest());
    expect(response.status).toBe(502);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: "INVALID_PROVIDER_RESPONSE", retryable: true },
    });
    expect(JSON.stringify(log.mock.calls)).not.toContain("Maya should arrive");
    expect(JSON.stringify(log.mock.calls)).not.toContain("Bring a passport");
  });

  it("aborts and returns 504 when extraction exceeds its budget", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const handler = createExtractionHandler({
      providerAvailable: () => true,
      extractPage: ({ signal }) =>
        new Promise((_, reject) => {
          signal.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        }),
      timeoutMs: 5,
    });

    const response = await handler(extractionRequest());
    expect(response.status).toBe(504);
    await expect(response.json()).resolves.toMatchObject({
      error: {
        code: "PROVIDER_TIMEOUT",
        requestId: "request-browser-1",
        retryable: true,
      },
    });
  });

  it("logs metadata without document text or provider errors", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    const handler = createExtractionHandler({
      providerAvailable: () => true,
      extractPage: async () => {
        throw new Error("Maya should arrive at the welcome center.");
      },
      timeoutMs: 100,
    });

    expect((await handler(extractionRequest())).status).toBe(502);
    const logged = JSON.stringify(log.mock.calls);
    expect(logged).not.toContain("Maya");
    expect(logged).not.toContain("welcome center");
    expect(logged).toContain("request-browser-1");
  });
});
