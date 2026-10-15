import { afterEach, describe, expect, it, vi } from "vitest";

import { createSourceRankingHandler } from "../../app/features/first-day/server/rank-sources";

const source = { id: "evidence-orientation-gym", label: "Follow-up message", quote: "La orientación será en el gimnasio.", topics: "location Orientation" };
function request(body: unknown, origin?: string) {
  return new Request("https://lantern.test/api/first-day/rank-sources", {
    method: "POST",
    headers: { "Content-Type": "application/json", host: "lantern.test", ...(origin ? { origin } : {}) },
    body: JSON.stringify(body),
  });
}

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); });

describe("AI source ranking route", () => {
  it("returns only validated IDs from the supplied exact quotes", async () => {
    const rank = vi.fn(async (input: unknown) => {
      expect(input).toMatchObject({ sources: [source] });
      return '{"sourceIds":["evidence-orientation-gym"]}';
    });
    const handler = createSourceRankingHandler({ available: () => true, rank, timeoutMs: 100 });
    const response = await handler(request({ question: "Where is orientation?", language: "English", sources: [source] }));
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual({ sourceIds: [source.id], method: "ai-ranked" });
    expect(rank).toHaveBeenCalledOnce();
  });

  it("rejects invented citations and malformed or duplicate input", async () => {
    const rank = vi.fn(async () => '{"sourceIds":["made-up"]}');
    const handler = createSourceRankingHandler({ available: () => true, rank, timeoutMs: 100 });
    expect((await handler(request({ question: "Where?", language: "English", sources: [source] }))).status).toBe(502);
    expect((await handler(request({ question: "Where?", language: "English", sources: [source, source] }))).status).toBe(400);
    expect((await handler(request({ question: "x", language: "English", sources: [source] }))).status).toBe(400);
    expect(rank).toHaveBeenCalledOnce();
  });

  it("keeps provider failures private and rejects a foreign production origin", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const handler = createSourceRankingHandler({ available: () => true, rank: async () => { throw new Error("private quote"); }, timeoutMs: 100 });
    const response = await handler(request({ question: "Where?", language: "English", sources: [source] }));
    expect(response.status).toBe(502);
    expect(JSON.stringify(await response.json())).not.toContain("private quote");

    vi.stubEnv("NODE_ENV", "production");
    expect((await handler(request({ question: "Where?", language: "English", sources: [source] }, "https://elsewhere.test"))).status).toBe(403);
  });
});
