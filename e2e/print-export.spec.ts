import { readFile } from "node:fs/promises";

import { expect, test } from "@playwright/test";

test("family plan prints cleanly to Letter and A4", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium");
  await page.goto("/first-day");
  await page.getByRole("button", { name: "Try the fictional case" }).click();
  await page.getByRole("button", { name: "Take it with me" }).click();
  await page.emulateMedia({ media: "print" });

  await expect(page.locator(".fd-print-plan")).toBeVisible();
  await expect(page.locator(".fd-action-dock")).toBeHidden();
  await expect(page.locator(".fd-demo-ribbon")).toBeHidden();
  await expect(page.locator(".fd-technical-print")).toBeVisible();

  const letter = await page.pdf({ format: "Letter", printBackground: true });
  const a4 = await page.pdf({ format: "A4", printBackground: true });
  expect(letter.byteLength).toBeGreaterThan(20_000);
  expect(a4.byteLength).toBeGreaterThan(20_000);
});

test("technical download and print keep unresolved items and source references", async ({ page }) => {
  await page.goto("/first-day");
  await page.getByRole("button", { name: "Try the fictional case" }).click();
  const compactProgress = page.locator(".fd-mobile-progress summary");
  if (await compactProgress.isVisible()) await compactProgress.click();
  await page.getByRole("button", { name: "Take it with me" }).click();

  const dataExport = page.getByText("More ways to save");
  await expect(dataExport).toBeVisible();
  await expect(page.getByRole("button", { name: "Download plan data (JSON)" })).toBeHidden();
  await dataExport.click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download plan data (JSON)" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("lantern-first-day-plan.json");
  const contents = await readFile((await download.path())!, "utf8");
  const plan = JSON.parse(contents);
  expect(plan.schemaVersion).toBe("lantern-plan-v1");
  expect(plan.unresolved).toContainEqual(
    expect.objectContaining({ id: "conflict-orientation-location" }),
  );
  expect(
    plan.tasks.some(
      (task: { evidenceIds: string[] }) => task.evidenceIds.length > 0,
    ),
  ).toBe(true);
  expect(contents).not.toContain("extractedText");

  await page.emulateMedia({ media: "print" });
  const printPlan = page.locator(".fd-print-plan");
  await expect(printPlan.getByText("1 unresolved item")).toBeVisible();
  await expect(
    printPlan.getByText("Resolve before relying on this plan"),
  ).toBeVisible();
  await expect(printPlan.locator(".fd-technical-print")).toContainText(
    "Evidence IDs",
  );
});

test("family plan shows each source passage once", async ({ page }) => {
  await page.goto("/first-day?demo=1");
  await page.getByRole("button", { name: "Try the fictional case" }).click();
  const mobileProgress = page.locator(".fd-mobile-progress summary");
  if (await mobileProgress.isVisible()) await mobileProgress.click();
  await page.getByRole("button", { name: "Resolve", exact: false }).first().click();
  await page.getByRole("button", { name: "Record what the school told me" }).last().click();
  if (await mobileProgress.isVisible()) await mobileProgress.click();
  await page.getByRole("button", { name: "Take it with me" }).click();

  const bestNext = page.getByRole("heading", { name: "Best next step" }).locator("..");
  const citation = "Enrollment welcome letter · Page 1, enrollment paragraph";
  const text = await bestNext.textContent();
  expect(text?.split(citation).length).toBe(2);
});
