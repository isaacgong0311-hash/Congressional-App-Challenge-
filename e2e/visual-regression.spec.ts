import { expect, test, type Page } from "@playwright/test";

const viewports = [
  { name: "mobile-390", width: 390, height: 844 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "desktop-1024", width: 1024, height: 900 },
  { name: "wide-1440", width: 1440, height: 1000 },
] as const;

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

async function capture(page: Page, name: string) {
  await expectNoHorizontalOverflow(page);
  await expect(page).toHaveScreenshot(`${name}.png`, {
    animations: "disabled",
    maxDiffPixelRatio: 0.01,
    timeout: 10_000,
  });
}

test.describe("visual regression and responsive layout", () => {
  for (const viewport of viewports) {
    test(`${viewport.name} public routes and First Day stages`, async ({
      page,
    }, testInfo) => {
      test.skip(
        testInfo.project.name !== "desktop-chromium",
        "A single browser project owns deterministic multi-viewport baselines.",
      );
      await page.setViewportSize(viewport);

      await page.goto("/");
      await capture(page, `home-${viewport.name}`);

      await page.goto("/explain");
      await capture(page, `explain-intro-${viewport.name}`);
      await page.route("**/api/explain", (route) =>
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            documentType: "Utility notice",
            category: "utilities",
            confidence: 96,
            whyThisType: "The letter discusses an account balance and possible service interruption.",
            urgency: "high",
            meaning: "The utility says a past-due balance must be addressed before the listed deadline to avoid service interruption.",
            keyDetails: {
              sender: "Fictional City Utility",
              contactPhone: "555-0100",
              accountNumber: "Ending in 2048",
              amountDue: "$146.20",
            },
            whatTheyNeed: ["Contact the utility", "Ask about a payment plan"],
            documentChecklist: [
              { item: "This notice", why: "Use the account reference when calling" },
            ],
            responseLetter: { applicable: false, kind: "", body: "" },
            nextSteps: [
              { step: "Call the number on the official utility website", detail: "Confirm the balance and deadline before paying." },
              { step: "Ask about assistance", detail: "Request payment-plan and hardship options." },
            ],
            phoneScript: "I received a notice and want to confirm my balance and options.",
            deadline: "October 15, 2026",
            deadlineISO: "2026-10-15",
            isPossibleScam: false,
            scamSigns: [],
            isCrisis: false,
            crisisMessage: "",
            scamAgencyFacts: "",
            whatHappensIfNothing: "Service may be interrupted after the deadline.",
            photoQualityNote: null,
            detectedLetterLanguage: "English",
            originalText: "This fictional utility notice says a balance is due before October 15, 2026.",
          }),
        }),
      );
      await page.getByRole("button", { name: /Try a sample/ }).click();
      await page.getByRole("button", { name: "Explain this letter" }).click();
      await expect(
        page.getByRole("heading", { name: "Utility notice", exact: true }),
      ).toBeVisible();
      await capture(page, `explain-result-${viewport.name}`);

      await page.goto("/first-day");
      await capture(page, `first-day-start-${viewport.name}`);

      await page.goto("/first-day?demo=1");
      await expect(page.getByLabel("Guided demonstration")).toBeVisible();
      await expect(
        page.getByRole("heading", {
          name: "Three pages. Two languages. One family trying not to miss a step.",
        }),
      ).toBeVisible();
      await expectNoHorizontalOverflow(page);

      await page.goto("/first-day");
      await page.getByRole("button", { name: "Open the sample case" }).click();
      await capture(page, `first-day-documents-${viewport.name}`);

      await page.getByRole("button", { name: "Continue" }).click();
      await capture(page, `first-day-facts-${viewport.name}`);
      while (await page.getByRole("button", { name: "Confirm this" }).count()) {
        await page.getByRole("button", { name: "Confirm this" }).first().click();
      }

      await page.getByRole("button", { name: "Continue" }).click();
      await capture(page, `first-day-plan-${viewport.name}`);
      const orientationTask = page.getByRole("article").filter({
        has: page.getByRole("heading", {
          name: "Confirm where orientation begins",
        }),
      });
      await orientationTask.getByRole("button", { name: "Resolve this" }).click();
      await capture(page, `first-day-blocker-${viewport.name}`);

      await page
        .getByRole("button", { name: "Record what the school told me" })
        .last()
        .click();
      const compactProgress = page.locator(".fd-mobile-progress summary");
      if (await compactProgress.isVisible()) await compactProgress.click();
      await page.getByRole("button", { name: /Take it with me/ }).click();
      await capture(page, `first-day-export-${viewport.name}`);

      await page.goto("/first-day/how-it-works");
      await capture(page, `how-it-works-${viewport.name}`);
    });
  }
});
