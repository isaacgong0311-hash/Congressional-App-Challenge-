import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page, type Route } from "@playwright/test";

function multipartField(route: Route, field: string) {
  const body = route.request().postDataBuffer()?.toString("utf8") ?? "";
  return new RegExp(`name="${field}"\\r\\n\\r\\n([^\\r\\n]+)`).exec(body)?.[1];
}

function extractionResponse(
  documentId: string,
  requestId: string,
  options: {
    label: string;
    text: string;
    clientKey: string;
    kind: "requested_item" | "location";
    semanticKey: string;
    factLabel: string;
    value: string;
    quote: string;
  },
) {
  return {
    schemaVersion: "first-day-extraction-v1",
    requestId,
    documentId,
    document: {
      label: options.label,
      confidence: 99,
      originalText: options.text,
      photoQualityNote: null,
    },
    facts: [
      {
        clientKey: options.clientKey,
        kind: options.kind,
        semanticKey: options.semanticKey,
        label: options.factLabel,
        originalValue: options.value,
        normalizedValue: null,
        quote: options.quote,
        location: "Line 2",
        confidence: 99,
      },
    ],
  };
}

async function expectNoSeriousAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  expect(
    results.violations.filter(
      (violation) =>
        violation.impact === "serious" || violation.impact === "critical",
    ),
  ).toEqual([]);
}

test("live intake preserves partial success, retry, removal, and late-response rejection", async ({
  page,
}) => {
  await page.route("**/api/health", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ status: "ok", keys: { groq: true } }),
    }),
  );

  let extractionCall = 0;
  let releaseLateResponse: (() => void) | undefined;
  let markLateStarted: (() => void) | undefined;
  const lateStarted = new Promise<void>((resolve) => {
    markLateStarted = resolve;
  });
  const lateRelease = new Promise<void>((resolve) => {
    releaseLateResponse = resolve;
  });

  await page.route("**/api/first-day/extract", async (route) => {
    extractionCall += 1;
    const documentId = multipartField(route, "documentId");
    const requestId = multipartField(route, "requestId");
    if (!documentId || !requestId) {
      await route.fulfill({ status: 400, body: "{}" });
      return;
    }
    if (extractionCall === 2) {
      await route.fulfill({
        status: 502,
        contentType: "application/json",
        body: JSON.stringify({ error: "Synthetic provider interruption." }),
      });
      return;
    }
    if (extractionCall === 3) {
      markLateStarted?.();
      await lateRelease;
      try {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(
            extractionResponse(documentId, requestId, {
              label: "Synthetic late page",
              text: "SYNTHETIC TEST DOCUMENT\nGo to the north office.",
              clientKey: "late-location",
              kind: "location",
              semanticKey: "registration.office_location",
              factLabel: "Late office location",
              value: "North office",
              quote: "Go to the north office.",
            }),
          ),
        });
      } catch {
        // Removing the source aborts its request; either browser outcome is safe.
      }
      return;
    }

    const isRetry = extractionCall === 4;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(
        extractionResponse(documentId, requestId, isRetry
          ? {
              label: "Synthetic retry page",
              text: "SYNTHETIC TEST DOCUMENT\nUpload proof of residence.",
              clientKey: "proof-residence",
              kind: "requested_item",
              semanticKey: "registration.proof_of_residence",
              factLabel: "Proof of residence",
              value: "Proof of residence",
              quote: "Upload proof of residence.",
            }
          : {
              label: "Synthetic successful page",
              text: "SYNTHETIC TEST DOCUMENT\nBring a certified birth certificate.",
              clientKey: "birth-certificate",
              kind: "requested_item",
              semanticKey: "registration.birth_certificate",
              factLabel: "Certified birth certificate",
              value: "Certified birth certificate",
              quote: "Bring a certified birth certificate.",
            }),
      ),
    });
  });

  await page.goto("/first-day");
  await page
    .getByRole("button", { name: "Add Round Rock ISD documents" })
    .click();
  await page.getByLabel("School page images").setInputFiles([
    { name: "success.png", mimeType: "image/png", buffer: Buffer.from("synthetic-one") },
    { name: "retry.png", mimeType: "image/png", buffer: Buffer.from("synthetic-two") },
    { name: "late.png", mimeType: "image/png", buffer: Buffer.from("synthetic-three") },
  ]);

  const successCard = page.getByRole("article").filter({ hasText: "Synthetic successful page" });
  const retryCard = page.getByRole("article").filter({ hasText: "retry.png" });
  const lateCard = page.getByRole("article").filter({ hasText: "late.png" });
  await expect(successCard.getByText("Text ready")).toBeVisible();
  await expect(retryCard.getByText("Needs retry")).toBeVisible();
  await lateStarted;
  await expect(lateCard.getByText("Reading page")).toBeVisible();
  await expectNoSeriousAxeViolations(page);

  await lateCard.getByRole("button", { name: "Remove page" }).click();
  releaseLateResponse?.();
  await expect(lateCard).toBeHidden();
  await expect(page.getByText("Late office location")).toHaveCount(0);

  await retryCard.getByRole("button", { name: "Retry page" }).click();
  const retriedCard = page
    .getByRole("article")
    .filter({ hasText: "Synthetic retry page" });
  await expect(retriedCard.getByText("Text ready")).toBeVisible();
  await successCard.getByRole("button", { name: "Remove page" }).click();
  await expect(successCard).toBeHidden();

  await page.getByRole("button", { name: "Continue" }).click();
  await expect(
    page.getByRole("heading", { name: "Proof of residence", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Certified birth certificate", { exact: true })).toHaveCount(0);
  await expectNoSeriousAxeViolations(page);
  await page.getByRole("button", { name: "Confirm this" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(
    page.getByRole("heading", { name: "Gather the confirmed enrollment documents" }),
  ).toBeVisible();
  await expectNoSeriousAxeViolations(page);
});

test("live entry explains a missing key and recovers after capability returns", async ({
  page,
}) => {
  let available = false;
  await page.route("**/api/health", (route) =>
    route.fulfill({
      status: available ? 200 : 503,
      contentType: "application/json",
      body: JSON.stringify({
        status: available ? "ok" : "degraded",
        keys: { groq: available },
      }),
    }),
  );

  await page.goto("/first-day");
  const liveButton = page.getByRole("button", {
    name: "Add Round Rock ISD documents",
  });
  await expect(liveButton).toBeDisabled();
  await expect(
    page.getByText(
      "Live document reading is unavailable right now. The complete sample still works.",
    ),
  ).toBeVisible();

  available = true;
  await page.reload();
  await expect(liveButton).toBeEnabled();
});
