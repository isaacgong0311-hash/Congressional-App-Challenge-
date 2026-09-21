import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function expectNoSeriousAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  const violations = results.violations.filter((violation) =>
    violation.impact === "serious" || violation.impact === "critical",
  );
  expect(violations).toEqual([]);
}

test("fictional case completes all six screens with sources and Spanish output", async ({
  page,
}) => {
  await page.goto("/first-day");
  await expect(
    page.getByRole("heading", {
      name: "School instructions, turned into a plan you can trust.",
    }),
  ).toBeVisible();
  await expectNoSeriousAxeViolations(page);

  const largeText = page.getByRole("button", { name: "Toggle large text" });
  const highContrast = page.getByRole("button", {
    name: "Toggle high contrast",
  });
  await largeText.click();
  await highContrast.click();
  await expect(largeText).toHaveAttribute("aria-pressed", "true");
  await expect(highContrast).toHaveAttribute("aria-pressed", "true");

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Open the sample case" }).click();
  await expect(
    page.getByRole("heading", { name: "One case, every instruction." }),
  ).toBeVisible();
  const animationDuration = await page.locator(".fd-enter").evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).animationDuration),
  );
  expect(animationDuration).toBeLessThanOrEqual(0.01);
  await expectNoSeriousAxeViolations(page);

  const sourceTrigger = page.getByRole("button", { name: "Show source" }).first();
  await sourceTrigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("button", { name: "Close source" })).toBeFocused();
  await expectNoSeriousAxeViolations(page);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(sourceTrigger).toBeFocused();

  await page.getByRole("button", { name: "Continue" }).click();
  await expect(
    page.getByRole("heading", { name: "Check the facts that shape the plan." }),
  ).toBeVisible();
  await expectNoSeriousAxeViolations(page);
  while (await page.getByRole("button", { name: "Confirm this" }).count()) {
    await page.getByRole("button", { name: "Confirm this" }).first().click();
  }

  await page.getByRole("button", { name: "Continue" }).click();
  await expect(
    page.getByRole("heading", { name: "What to do next, and why." }),
  ).toBeVisible();
  await expectNoSeriousAxeViolations(page);

  const orientationTask = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: "Confirm where orientation begins",
    }),
  });
  await orientationTask.getByRole("button", { name: "Resolve this" }).click();
  await expect(
    page.getByRole("heading", {
      name: "Two documents. One unanswered question.",
    }),
  ).toBeVisible();
  await expectNoSeriousAxeViolations(page);

  await page
    .getByRole("button", { name: "Record what the school told me" })
    .last()
    .click();
  await expect(
    page.getByRole("heading", { name: "What to do next, and why." }),
  ).toBeVisible();
  await expect(page.getByText("Reported confirmed by school")).toBeHidden();

  await page.getByRole("button", { name: "ES", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Qué hacer ahora y por qué." }),
  ).toBeVisible();
  const compactProgress = page.locator(".fd-mobile-progress summary");
  if (await compactProgress.isVisible()) await compactProgress.click();
  await page.getByRole("button", { name: /Llevar conmigo/ }).click();
  await expect(
    page.getByRole("heading", {
      name: "Un plan que la familia puede llevar.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Descargar plan JSON" })).toBeVisible();
  await expectNoSeriousAxeViolations(page);
});

test("fictional entry and evidence review are keyboard reachable", async ({
  page,
}) => {
  await page.goto("/first-day");
  await page.getByRole("button", { name: "Open the sample case" }).focus();
  await page.keyboard.press("Enter");
  const source = page.getByRole("button", { name: "Show source" }).first();
  await source.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByText("Read extracted page text")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Close source" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(source).toBeFocused();
});

test("guided demo stays fictional and can be dismissed", async ({ page }) => {
  await page.goto("/first-day?demo=1");
  await expect(page.getByLabel("Guided demo cue")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Add Round Rock ISD documents" }),
  ).toBeDisabled();
  await expect(page.getByText(/uses fictional data only/i)).toBeVisible();
  await page.getByRole("button", { name: "Open the sample case" }).click();
  await expect(page.getByText(/Demo cue 2 of 6/)).toBeVisible();
  await page.getByRole("button", { name: "Exit demo mode" }).click();
  await expect(page.getByLabel("Guided demo cue")).toBeHidden();
});

test("task completion can be undone without deleting history", async ({ page }) => {
  await page.goto("/first-day");
  await page.getByRole("button", { name: "Open the sample case" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  while (await page.getByRole("button", { name: "Confirm this" }).count()) {
    await page.getByRole("button", { name: "Confirm this" }).first().click();
  }
  await page.getByRole("button", { name: "Continue" }).click();

  const registrationTask = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "Go to the enrollment meeting" }),
  });
  await registrationTask.getByRole("button", { name: "Mark done" }).click();
  await expect(page.getByText("Step marked done.")).toBeVisible();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByText("Step returned to the plan.")).toBeVisible();
  await expect(
    registrationTask.getByRole("button", { name: "Mark done" }),
  ).toBeVisible();
});

test("only harmless Lantern preferences persist locally", async ({ page }) => {
  await page.goto("/first-day");
  await page.getByRole("button", { name: "Toggle large text" }).first().click();
  await page.getByRole("button", { name: "Open the sample case" }).click();
  const storage = await page.evaluate(() =>
    Object.fromEntries(
      Array.from({ length: localStorage.length }, (_, index) => {
        const key = localStorage.key(index) ?? "";
        return [key, localStorage.getItem(key)];
      }),
    ),
  );
  expect(Object.keys(storage)).toEqual(["lantern.preferences.v1"]);
  expect(JSON.stringify(storage)).not.toContain("Maya");
  expect(JSON.stringify(storage)).not.toContain("Welcome Center");
  expect(JSON.stringify(storage)).not.toContain("fact-");
});
