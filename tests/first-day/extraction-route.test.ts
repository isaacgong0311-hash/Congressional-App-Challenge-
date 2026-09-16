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

function extractionRequest(
  overrides: {
    documentId?: string;
    requestId?: string;
    type?: string;
  } = {},
) {
  const form = new FormData();
  form.append(
    "image",
    new File([new Uint8Array([1, 2, 3])], "page.jpg", {
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
    await expect(response.json()).resolves.toEqual({
      ...providerResponse,
      documentId: "doc-browser-1",
      requestId: "request-browser-1",
    });
  });

  it("rejects unsupported files and unsafe IDs", async () => {
    const handler = createExtractionHandler({
      providerAvailable: () => true,
      extractPage: async () => providerResponse,
      timeoutMs: 100,
    });

    expect((await handler(extractionRequest({ type: "text/plain" }))).status).toBe(
      400,
    );
    expect(
      (
        await handler(
          extractionRequest({ documentId: "../private", requestId: "" }),
        )
      ).status,
    ).toBe(400);
  });

  it("reports an unavailable provider without calling it", async () => {
    const extractPage = vi.fn(async () => providerResponse);
    const handler = createExtractionHandler({
      providerAvailable: () => false,
      extractPage,
      timeoutMs: 100,
    });

    expect((await handler(extractionRequest())).status).toBe(500);
    expect(extractPage).not.toHaveBeenCalled();
  });

  it("returns 502 for malformed provider output", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const handler = createExtractionHandler({
      providerAvailable: () => true,
      extractPage: async () => ({ tasks: [{ title: "Invented task" }] }),
      timeoutMs: 100,
    });

    expect((await handler(extractionRequest())).status).toBe(502);
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

    expect((await handler(extractionRequest())).status).toBe(504);
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
