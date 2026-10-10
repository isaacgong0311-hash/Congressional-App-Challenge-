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
  await expect(interpreter.getByText("Not answered yet")).toHaveCount(0);
  await expect(interpreter.getByText("No", { exact: true })).toBeVisible();
  await expect(page.getByText("Every proposed fact has been reviewed by the family")).toBeVisible();
  await expect(page.getByText("Story beat 2 of 6", { exact: false })).toBeVisible();
  await expect(page.getByText("Step 3 · Review facts")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Welcome letter: cafeteria" })).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "Follow-up message: gym entrance" })).toHaveCount(1);
  await page.getByRole("button", { name: "Next beat", exact: true }).click();
  await expect(page.getByText("Page 3 · School follow-up message", { exact: false })).toBeVisible();
  await expect(page.getByText("1 conflict stays visible until a person decides")).toBeVisible();
});

test("a Yes answer to the interpreter question updates the card and unlocks the demo", async ({ page }) => {
  await page.goto("/first-day?demo=1");
  const guide = page.getByLabel("Guided demonstration");
  await guide.getByRole("button", { name: "Next beat" }).click();

  const immunization = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "Do you have Maya's immunization record?" }),
  });
  await immunization.getByRole("button", { name: "No", exact: true }).click();
  const interpreter = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "Would an interpreter help your family?" }),
  });
  await interpreter.getByRole("button", { name: "Yes", exact: true }).click();

  await expect(interpreter.getByText("Not answered yet")).toHaveCount(0);
  await expect(interpreter.getByText("Yes", { exact: true })).toBeVisible();
  await expect(guide.getByText("Every proposed fact has been reviewed by the family")).toBeVisible();
  await expect(guide.getByRole("button", { name: "Next beat" })).toBeEnabled();
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

test("confirmed dates download a calendar file and unresolved facts stay out of the export", async ({ page }) => {
  await page.goto("/first-day");
  await page.getByRole("button", { name: "Try the fictional case" }).click();
  const mobileProgress = page.locator(".fd-mobile-progress summary");
  if (await mobileProgress.isVisible()) await mobileProgress.click();
  await page.getByRole("button", { name: "Take it with me" }).click();
  await expect(page.getByText("Not answered yet")).toHaveCount(0);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Add dates to calendar/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("lantern-confirmed-dates.ics");
  await expect(page.getByText("Calendar file downloaded. Open it to add the confirmed dates.")).toBeVisible();
});
