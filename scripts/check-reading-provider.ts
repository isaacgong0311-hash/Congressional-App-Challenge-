import { readFile } from "node:fs/promises";
import { POST } from "../app/api/explain/route";

// One real request per production build, using only the bundled fictional letter.
// This catches invalid keys, unavailable models and schema failures, not just key presence.
async function main() {
  if (process.env.VERCEL_ENV !== "production") return;
  const form = new FormData();
  form.set("image", new File([await readFile("public/sample-letter.png")], "sample-letter.png", { type: "image/png" }));
  form.set("language", "English");
  const response = await POST(new Request("http://localhost/api/explain", { method: "POST", body: form }));
  if (!response.ok) throw new Error("Reading preflight failed");
  const result = await response.json();
  if (!result.meaning?.trim() || !result.originalText?.trim()) throw new Error("Empty reading response");
  console.log("Production reading preflight passed: fictional image returned a validated explanation.");
}

main().catch(() => {
  console.error("Production build blocked: the reading service did not pass its live image check. Check provider configuration and availability.");
  process.exit(1);
});
