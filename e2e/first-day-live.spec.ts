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
      body: JSON.stringify({
        status: "ok",
        capabilities: { liveDocumentReading: true },
      }),
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
        body: JSON.stringify({
          error: {
            code: "PROVIDER_REJECTED",
            message: "Synthetic provider interruption.",
            requestId,
            retryable: true,
          },
        }),
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
    .getByRole("button", { name: "Open the sample-page upload workspace" })
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

test("live source questions cite only supplied passages and recover from AI failure", async ({ page }) => {
  await page.route("**/api/health", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ status: "ok", capabilities: { liveDocumentReading: true } }),
  }));
  await page.route("**/api/first-day/extract", (route) => {
    const documentId = multipartField(route, "documentId");
    const requestId = multipartField(route, "requestId");
    if (!documentId || !requestId) return route.fulfill({ status: 400, body: "{}" });
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(extractionResponse(documentId, requestId, {
        label: "Synthetic requirements",
        text: "SYNTHETIC TEST PAGE\nBring a certified birth certificate.",
        clientKey: "birth-certificate",
        kind: "requested_item",
        semanticKey: "registration.birth_certificate",
        factLabel: "Certified birth certificate",
        value: "Certified birth certificate",
        quote: "Bring a certified birth certificate.",
      })),
    });
  });

  let rankingCalls = 0;
  await page.route("**/api/first-day/rank-sources", (route) => {
    rankingCalls += 1;
    const body = route.request().postDataJSON() as { question: string; sources: Array<{ id: string; quote: string }> };
    expect(body.question).toBe("What birth certificate is needed?");
    expect(body.sources.map((source) => source.quote)).toContain("Bring a certified birth certificate.");
    if (rankingCalls === 2) return route.fulfill({ status: 502, body: "{}" });
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ sourceIds: [body.sources[0].id], method: "ai-ranked" }),
    });
  });

  await page.goto("/first-day");
  await page.getByRole("button", { name: "Open the sample-page upload workspace" }).click();
  await expect(page.getByRole("region", { name: "Ask about these pages." })).toHaveCount(0);
  await page.getByLabel("School page images").setInputFiles({
    name: "requirements.png", mimeType: "image/png", buffer: Buffer.from("synthetic"),
  });
  const panel = page.getByRole("region", { name: "Ask about these pages." });
  await expect(panel).toBeVisible();
  await panel.getByRole("textbox", { name: "Question about these pages" }).fill("What birth certificate is needed?");
  await panel.getByRole("button", { name: "Find sources" }).click();
  await expect(panel).toContainText("AI matched sources");
  await expect(panel).toContainText("Bring a certified birth certificate.");
  await panel.getByRole("button", { name: "Find sources" }).click();
  await expect(panel).toContainText("Local source match · AI unavailable");
  await expect(panel).toContainText("Bring a certified birth certificate.");
  expect(rankingCalls).toBe(2);
});

test("live entry explains an unavailable provider and retries without reloading", async ({
  page,
}) => {
  let available = false;
  await page.route("**/api/health", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "ok",
        capabilities: { liveDocumentReading: available },
      }),
    }),
  );

  await page.goto("/first-day");
  const liveButton = page.getByRole("button", {
    name: "Open the sample-page upload workspace",
  });
  await expect(liveButton).toBeDisabled();
  await expect(
    page.getByText(
      "Live document reading is unavailable right now. The complete sample still works.",
    ),
  ).toBeVisible();

  available = true;
  await page.getByRole("button", { name: "Check availability again" }).click();
  await expect(liveButton).toBeEnabled();
});

test("source-backed facts can be confirmed, corrected, or marked unclear in EN and ES", async ({ page }) => {
  await page.route("**/api/health", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ status: "ok", capabilities: { liveDocumentReading: true } }),
  }));
  await page.route("**/api/first-day/extract", (route) => {
    const documentId = multipartField(route, "documentId");
    const requestId = multipartField(route, "requestId");
    const text = "SYNTHETIC TEST PAGE\nBring a birth certificate.\nGo to the West Welcome Office.\nBring a parent photo ID.";
    const facts = [
      ["birth-certificate", "registration.birth_certificate", "Birth certificate", "Birth certificate", "Bring a birth certificate."],
      ["welcome-office", "registration.welcome_office", "Welcome office", "West Welcome Office", "Go to the West Welcome Office."],
      ["parent-id", "registration.parent_id", "Parent photo ID", "Parent photo ID", "Bring a parent photo ID."],
    ].map(([clientKey, semanticKey, label, originalValue, quote]) => ({
      clientKey, semanticKey, label, originalValue, quote,
      kind: "requested_item", normalizedValue: null, location: "Synthetic page", confidence: 99,
    }));
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        schemaVersion: "first-day-extraction-v1", documentId, requestId,
        document: { label: "Synthetic enrollment note", confidence: 99, originalText: text, photoQualityNote: null },
        facts,
      }),
    });
  });

  for (const spanish of [false, true]) {
    await page.goto("/first-day");
    if (spanish) await page.getByRole("button", { name: "ES", exact: true }).click();
    await page.getByRole("button", { name: spanish ? "Abrir espacio para subir páginas de ejemplo" : "Open the sample-page upload workspace" }).click();
    await page.getByLabel(spanish ? "Imágenes de páginas escolares" : "School page images").setInputFiles({
      name: "synthetic.png", mimeType: "image/png", buffer: Buffer.from("synthetic-test-page"),
    });
    await expect(page.getByText("Synthetic enrollment note")).toBeVisible();
    await page.getByRole("button", { name: spanish ? "Continuar" : "Continue" }).click();

    const birth = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Birth certificate" }) });
    await birth.getByRole("button", { name: spanish ? "Confirmar" : "Confirm this" }).click();
    await expect(birth.getByText(spanish ? "Confirmado" : "Confirmed", { exact: true })).toBeVisible();

    const office = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Welcome office" }) });
    await office.getByRole("button", { name: spanish ? "Corregir" : "Correct" }).click();
    await office.getByRole("textbox").fill("North Welcome Office");
    await office.getByRole("button", { name: spanish ? "Guardar corrección" : "Save correction" }).click();
    await expect(office.getByText("North Welcome Office")).toBeVisible();
    await expect(office.getByText("Go to the West Welcome Office.", { exact: false })).toBeVisible();

    const parentId = page.getByRole("article").filter({ has: page.getByRole("heading", { name: "Parent photo ID" }) });
    await parentId.getByRole("button", { name: spanish ? "No está claro" : "Not clear" }).click();
    await expect(parentId.getByText(spanish ? "No está claro" : "Unclear", { exact: true })).toBeVisible();
  }
});

test("a successfully read page with no facts explains the next action", async ({ page }, testInfo) => {
  await page.route("**/api/health", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        status: "ok",
        capabilities: { liveDocumentReading: true },
      }),
    }),
  );
  await page.route("**/api/first-day/extract", (route) => {
    const documentId = multipartField(route, "documentId");
    const requestId = multipartField(route, "requestId");
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        schemaVersion: "first-day-extraction-v1",
        documentId,
        requestId,
        document: {
          label: "Unclear sample page",
          confidence: 40,
          originalText: "The page has no actionable enrollment information.",
          photoQualityNote: "The lower edge is blurry.",
        },
        facts: [],
      }),
    });
  });

  await page.goto("/first-day");
  await page.getByRole("button", { name: "Open the sample-page upload workspace" }).click();
  await page.getByLabel("School page images").setInputFiles({
    name: "unclear.png",
    mimeType: "image/png",
    buffer: Buffer.from("synthetic-page"),
  });
  await expect(page.getByRole("article").filter({ hasText: "Unclear sample page" }).getByText("Text ready")).toBeVisible();
  await expect(page.getByText("No facts were found in the pages read so far.", { exact: false })).toBeVisible();
  await expect(page.getByRole("region", { name: "Ask about these pages." })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Continue" })).toHaveCount(0);
  if (testInfo.project.name === "mobile-chromium") {
    await expect(page.getByText("Add a page with a fact")).toBeVisible();
  }
  await page.getByRole("button", { name: "ES", exact: true }).click();
  await expect(page.getByText("No se encontraron datos en las páginas leídas hasta ahora.", { exact: false })).toBeVisible();
});
