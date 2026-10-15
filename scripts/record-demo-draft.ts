import { copyFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

import { chromium, type Locator, type Page } from "@playwright/test";

// Silent rehearsal footage. The accepted submission still needs the student's
// narration, reviewed captions, a public upload, and release alignment.
const baseUrl = process.env.LANTERN_BASE_URL ?? "http://127.0.0.1:3100";
const output = resolve("tmp/judge-demo-draft.webm");
const speed = Number(process.env.LANTERN_DEMO_SPEED ?? "1");

if (!Number.isFinite(speed) || speed <= 0 || speed > 1) {
  throw new Error("LANTERN_DEMO_SPEED must be greater than 0 and at most 1.");
}

async function pause(seconds: number) {
  await new Promise((done) => setTimeout(done, Math.round(seconds * 1000 * speed)));
}

async function show(page: Page, target: Locator, seconds: number) {
  await target.scrollIntoViewIfNeeded();
  await pause(seconds);
}

async function main() {
  await mkdir(resolve("tmp"), { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    recordVideo: { dir: resolve("tmp"), size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  const providerRequests: string[] = [];
  page.on("request", (request) => {
    if (new URL(request.url()).pathname.startsWith("/api/")) {
      providerRequests.push(request.url());
    }
  });

  try {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await pause(7);
    await page.goto(new URL("/first-day?demo=1&present=1", baseUrl).toString());
    const guide = page.getByLabel("Guided demonstration");
    await guide.waitFor();

    // 0:20–0:45: The fictional pages and a question with two original answers.
    await pause(8);
    await show(page, page.getByRole("heading", { name: "One case, every instruction." }), 4);
    const sourceFinder = page.getByRole("region", { name: "Ask about these pages." });
    await sourceFinder.getByRole("button", { name: "Where is orientation?" }).click();
    await show(page, sourceFinder.getByText("These pages disagree.", { exact: false }), 5);
    await sourceFinder.getByText("La orientación será en el gimnasio.", { exact: false }).evaluate((element) => {
      element.scrollIntoView({ block: "center", behavior: "instant" });
    });
    await pause(5);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    await pause(2);

    // 0:45–1:10: Exact source text and family confirmation.
    await guide.getByRole("button", { name: "Next beat" }).click();
    await pause(5);
    await page.getByRole("button", { name: "More source context" }).first().click();
    await show(page, page.getByRole("dialog"), 6);
    await page.getByRole("button", { name: "Close source" }).click();
    const nurseReview = page.getByRole("article").filter({
      has: page.getByRole("heading", { name: "Nurse review" }),
    });
    await nurseReview.getByRole("button", { name: "Confirm this" }).click();
    await pause(2);
    const immunization = page.getByRole("article").filter({
      has: page.getByRole("heading", {
        name: "Do you have Maya's immunization record?",
      }),
    });
    await immunization.getByRole("button", { name: "Yes", exact: true }).click();
    await pause(4);
    const interpreter = page.getByRole("article").filter({
      has: page.getByRole("heading", {
        name: "Would an interpreter help your family?",
      }),
    });
    await interpreter.getByRole("button", { name: "No", exact: true }).click();
    await pause(6);

    // 1:10–1:40: Leave the two conflicting locations visible before resolving.
    await guide.getByRole("button", { name: "Next beat" }).click();
    await pause(6);
    await show(page, page.getByRole("heading", { name: "Two documents. One unanswered question." }), 7);
    await page.getByRole("button", { name: "The school confirmed gym" }).click();
    await pause(2);
    await page.getByRole("button", { name: "Confirm school answer" }).click();

    // 1:40–2:00: Show the real Decision Trace opened by that case event.
    const trace = page.getByLabel("Decision trace: Orientation location confirmed");
    await trace.waitFor();
    await pause(7);
    await show(page, trace.getByText("School confirmation recorded"), 5);
    await show(page, trace.getByText("Any requirement"), 6);
    await show(page, trace.getByText("Ready", { exact: true }).last(), 6);
    await trace.getByRole("button", { name: "Close decision trace" }).click();
    const dismissMessage = page.getByRole("button", { name: "Dismiss message" });
    if (await dismissMessage.isVisible()) await dismissMessage.click();
    await pause(4);

    // 2:00–2:25: The bilingual family plan.
    await guide.getByRole("button", { name: "Next beat" }).click();
    await page.getByRole("button", { name: "ES", exact: true }).click();
    await pause(9);
    await show(page, page.getByRole("heading", { name: "Un plan que la familia puede llevar." }), 7);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
    await pause(4);

    // 2:25–2:50: Engineering evidence and honest limits.
    const spanishGuide = page.getByLabel("Demostración guiada");
    await spanishGuide.getByRole("button", { name: "Siguiente momento" }).click();
    const proof = page.locator("[data-demo-proof='true']");
    await show(page, proof, 8);
    await show(page, proof.getByText("46/46", { exact: true }), 8);
    await pause(4);

    if (providerRequests.length > 0) {
      throw new Error("The fictional recording made a provider request.");
    }
  } finally {
    await context.close();
    await browser.close();
  }

  const video = page.video();
  if (!video) throw new Error("Playwright did not produce a video.");
  await copyFile(await video.path(), output);
  console.log(`Silent draft saved to ${output}`);
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
