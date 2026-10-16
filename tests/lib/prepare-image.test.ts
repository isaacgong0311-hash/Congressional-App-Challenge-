import { describe, expect, it } from "vitest";

import { prepareImageForUpload, readJsonResponse } from "../../app/lib/prepare-image";

describe("prepareImageForUpload", () => {
  it("returns small files untouched", async () => {
    const file = new File([new Uint8Array(1024)], "page.png", { type: "image/png" });
    expect(await prepareImageForUpload(file)).toBe(file);
  });

  it("falls back to the original when the browser cannot decode", async () => {
    const file = new File([new Uint8Array(4 * 1024 * 1024)], "big.jpg", { type: "image/jpeg" });
    expect(await prepareImageForUpload(file)).toBe(file);
  });
});

describe("readJsonResponse", () => {
  it("parses JSON bodies", async () => {
    expect(await readJsonResponse(Response.json({ ok: 1 }))).toEqual({ ok: 1 });
  });

  it("maps a plain-text 413 to PAYLOAD_TOO_LARGE", async () => {
    const payload = await readJsonResponse(new Response("Request Entity Too Large", { status: 413 }));
    expect(payload).toMatchObject({ error: { code: "PAYLOAD_TOO_LARGE" } });
  });

  it("maps other non-JSON bodies to a retryable internal error", async () => {
    const payload = await readJsonResponse(new Response("<html>", { status: 502 }));
    expect(payload).toMatchObject({ error: { code: "INTERNAL_ERROR", retryable: true } });
  });
});
