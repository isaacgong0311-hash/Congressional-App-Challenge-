import { afterEach, describe, expect, it, vi } from "vitest";
import { POST as explain } from "../../app/api/explain/route";
import { POST as ask } from "../../app/api/ask/route";
import { POST as translate } from "../../app/api/translate-field/route";

vi.mock("ai", () => ({ generateText: vi.fn().mockRejectedValue(new Error("private-provider-payload")) }));
afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });

function imageRequest(language = "English") {
  const form = new FormData();
  form.set("image", new File(["test"], "test.png", { type: "image/png" }));
  form.set("language", language);
  return new Request("http://localhost/api/explain", { method: "POST", body: form });
}
function jsonRequest(body: object) {
  return new Request("http://localhost/api/test", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });
}
describe("public reading errors", () => {
  it("returns safe 503s on all reading routes when configuration is missing", async () => {
    vi.stubEnv("GROQ_API_KEY", "");
    for (const response of await Promise.all([
      explain(imageRequest()), ask(jsonRequest({ context: {} })), translate(jsonRequest({ text: "Hello", language: "Spanish" })),
    ])) {
      expect(response.status).toBe(503);
      const body = await response.text();
      expect(body).not.toMatch(/GROQ|API_KEY|env.local|README/);
    }
  });
  it("localizes missing-service feedback for Spanish", async () => {
    vi.stubEnv("GROQ_API_KEY", "");
    expect((await (await explain(imageRequest("Spanish"))).json()).error.message).toContain("no está disponible");
  });
  it("does not leak provider errors or blame the photo on an outage", async () => {
    vi.stubEnv("GROQ_API_KEY", "test-only");
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await explain(imageRequest());
    expect(response.status).toBe(502);
    expect((await response.json()).error.message).toContain("service is unavailable");
    expect(JSON.stringify(log.mock.calls)).not.toContain("private-provider-payload");
  });
});
