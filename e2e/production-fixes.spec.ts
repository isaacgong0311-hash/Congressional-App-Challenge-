import { expect, test } from "@playwright/test";

test("sample loading acknowledges a slow request immediately", async ({ page }) => {
  let release!: () => void;
  await page.route("**/sample-letter.png", async (route) => {
    await new Promise<void>((resolve) => { release = resolve; });
    await route.continue();
  });
  await page.goto("/explain");
  await page.getByRole("button", { name: /Try a sample/ }).click();
  await expect(page.getByRole("button", { name: "Loading sample…" })).toBeDisabled();
  await expect(page.getByRole("status")).toContainText("Preparing your sample");
  release();
  await expect(page.getByRole("button", { name: "Explain this letter" })).toBeVisible();
});

test("conflict headings use source page numbers and fact cards hide internal keys", async ({ page }) => {
  await page.goto("/first-day?demo=1");
  await page.getByRole("button", { name: "Next beat", exact: true }).click();
  await expect(page.getByText("orientation.location", { exact: false })).toHaveCount(0);
  const immunization = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: "Do you have Maya's immunization record?",
    }),
  });
  await immunization.getByRole("button", { name: "Yes", exact: true }).click();
  const interpreter = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: "Would an interpreter help your family?",
    }),
  });
  await interpreter.getByRole("button", { name: "No", exact: true }).click();
  await page.getByRole("button", { name: "Next beat", exact: true }).click();
  await expect(page.getByText("Page 3 · School follow-up message", { exact: false })).toBeVisible();
});

test("audited proof copy keeps spacing and First Day chrome translates", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByText("Measured offline across 20 synthetic held-out packets."),
  ).toBeVisible();

  await page.goto("/first-day/how-it-works");
  await expect(
    page.getByText(/The versioned evaluation reports 32\/32 exact quotes covered/),
  ).toBeVisible();

  await page.goto("/first-day?demo=1");
  await page.getByRole("button", { name: "ES", exact: true }).click();
  await expect(page.getByText("Lantern / Primer Día", { exact: true })).toBeVisible();
});
