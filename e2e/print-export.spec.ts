import { expect, test } from "@playwright/test";

test("family plan prints cleanly to Letter and A4", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium");
  await page.goto("/first-day");
  await page.getByRole("button", { name: "Open the sample case" }).click();
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
