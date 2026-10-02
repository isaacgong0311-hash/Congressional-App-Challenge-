import { readFile } from "node:fs/promises";

const baseUrl = process.env.LANTERN_BASE_URL ?? "http://127.0.0.1:3000";

if (process.env.LANTERN_ALLOW_PROVIDER_SMOKE !== "1") {
  console.error("Provider smoke checks are disabled. Set LANTERN_ALLOW_PROVIDER_SMOKE=1 to use synthetic content.");
  process.exit(1);
}

type Capabilities = {
  liveDocumentReading: boolean;
  serverSpeech: boolean;
  localHelpSearch: boolean;
};

async function timed(label: string, run: () => Promise<boolean>) {
  const started = Date.now();
  let passed = false;
  try { passed = await run(); } catch { passed = false; }
  console.log(`${label} status=${passed ? "pass" : "fail"} durationMs=${Date.now() - started} schemaValid=${passed}`);
  if (!passed) process.exitCode = 1;
}

async function main() {
  const healthStarted = Date.now();
  const health = await fetch(`${baseUrl}/api/health`, { cache: "no-store" });
  const healthBody = await health.json() as { capabilities?: Partial<Capabilities> };
  const capabilities: Capabilities = {
  liveDocumentReading: healthBody.capabilities?.liveDocumentReading === true,
  serverSpeech: healthBody.capabilities?.serverSpeech === true,
  localHelpSearch: healthBody.capabilities?.localHelpSearch === true,
  };

  console.log(`health status=${health.ok ? "pass" : "fail"} durationMs=${Date.now() - healthStarted} schemaValid=${Boolean(healthBody.capabilities)}`);
  if (!health.ok || !healthBody.capabilities) process.exit(1);

  if (capabilities.liveDocumentReading) {
    await timed("first-day-extract", async () => {
      const image = await readFile(new URL("../public/sample-letter.png", import.meta.url));
      const form = new FormData();
      form.set("image", new File([image], "sample-letter.png", { type: "image/png" }));
      form.set("language", "English");
      form.set("documentId", "smoke-document-1");
      form.set("requestId", "smoke-request-1");
      const response = await fetch(`${baseUrl}/api/first-day/extract`, { method: "POST", body: form });
      const body: unknown = await response.json();
      return response.ok && body !== null && typeof body === "object" &&
        "schemaVersion" in body && "document" in body && "facts" in body;
    });
    if (process.env.LANTERN_SMOKE_GENERAL_EXPLAIN === "1") {
      await new Promise((resolve) => setTimeout(resolve, 60_000));
      await timed("explain", async () => {
        const image = await readFile(new URL("../public/sample-letter.png", import.meta.url));
        const form = new FormData();
        form.set("image", new File([image], "sample-letter.png", { type: "image/png" }));
        form.set("language", "English");
        form.set("readingLevel", "standard");
        const response = await fetch(`${baseUrl}/api/explain`, { method: "POST", body: form });
        const body: unknown = await response.json();
        return response.ok && body !== null && typeof body === "object" && "documentType" in body;
      });
    } else console.log("explain status=skipped durationMs=0 schemaValid=false");
  } else {
    console.log("first-day-extract status=skipped durationMs=0 schemaValid=false");
    console.log("explain status=skipped durationMs=0 schemaValid=false");
  }

  if (capabilities.serverSpeech) {
    await timed("speech", async () => {
    const response = await fetch(`${baseUrl}/api/speak`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: "This is a synthetic Lantern test.", bcp47: "en-US" }) });
    return response.ok && response.headers.get("content-type") === "audio/mpeg";
    });
  } else console.log("speech status=skipped durationMs=0 schemaValid=false");

  if (capabilities.localHelpSearch) {
    await timed("local-help", async () => {
    const response = await fetch(`${baseUrl}/api/local-help`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ category: "school", city: "Round Rock", state: "TX", language: "English" }) });
    const body: unknown = await response.json();
    return response.ok && body !== null && typeof body === "object" && "resources" in body && Array.isArray(body.resources);
    });
  } else console.log("local-help status=skipped durationMs=0 schemaValid=false");
}

void main().catch(() => {
  console.error("provider-smoke status=fail");
  process.exitCode = 1;
});
