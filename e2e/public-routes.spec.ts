import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { fictionalPreview } from "../app/features/first-day/content/fictional-case";

const draftCopy = /\bTODO\b|\bFIXME\b|<NAME\b|Isaac should|\bplaceholder\b|\blorem\b/;

for (const route of [
  "/",
  "/explain",
  "/first-day",
  "/first-day/how-it-works",
  "/about",
  "/contact",
  "/privacy",
]) {
  test(`${route} renders with security headers and no serious axe violations`, async ({
    page,
  }) => {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    expect(await page.locator("body").innerText()).not.toMatch(draftCopy);
    expect(response?.headers()["x-content-type-options"]).toBe("nosniff");
    expect(response?.headers()["x-frame-options"]).toBe("DENY");
    expect(response?.headers()["referrer-policy"]).toBe(
      "strict-origin-when-cross-origin",
    );
    expect(response?.headers()["permissions-policy"]).toBe(
      "camera=(), microphone=(), geolocation=()",
    );

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(
      results.violations.filter(
        (violation) =>
          violation.impact === "serious" || violation.impact === "critical",
      ),
    ).toEqual([]);
  });
}

test("About credits every project partner", async ({ page }) => {
  await page.goto("/about");
  const credits = page.getByRole("list", { name: "Lantern team" });
  await expect(credits.getByRole("listitem")).toHaveCount(3);
  await expect(credits).toContainText("Isaac Gong");
  await expect(credits).toContainText("Karthik Devarasetty · Project partner");
  await expect(credits).toContainText("Vihan Santhosh · Project partner");
});

test("public examples show the same fictional source quotes as the demo", async ({ page }) => {
  await page.goto("/first-day/how-it-works");
  await expect(
    page.getByText(`Two sources · “${fictionalPreview.orientationCafeteriaQuote}” ≠ “${fictionalPreview.orientationGymQuote}”`),
  ).toBeVisible();

  await page.goto("/");
  await expect(
    page.getByText(`“${fictionalPreview.orientationCafeteriaQuote}”`),
  ).toBeVisible();
  await expect(
    page.getByText(`“${fictionalPreview.orientationGymQuote}”`),
  ).toBeVisible();
});

test("landing page explains the evidence without engineering jargon", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("header")).toContainText("School letters, made clear");
  const visibleCopy = await page.locator("body").innerText();
  expect(visibleCopy).not.toMatch(/synthetic held-out|\bprovider\b|\bdeterministic\b|regression checks|0\/8 date errors/i);
  await expect(page.getByRole("link", { name: "See the test details" })).toHaveAttribute("href", "/first-day/how-it-works");
});

test("First Day is the primary homepage action on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "School letters, one clear first day." })).toBeVisible();
  const primary = page.locator(".home-hero-actions .home-button");
  await expect(primary).toHaveAttribute("href", "/first-day?demo=1");
  await expect(primary).toBeInViewport();
  await expect(page.locator(".home-hero-actions .home-text-link")).toHaveAttribute("href", "/explain");
});

test("mobile navigation is keyboard reachable and closes on Escape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Demo", exact: true })).toBeVisible();
  const menu = page.getByRole("button", { name: "Open navigation" });
  await menu.focus();
  await page.keyboard.press("Enter");
  const navigation = page.getByRole("navigation", { name: "Mobile navigation" });
  await expect(navigation).toBeVisible();
  await expect(navigation.getByRole("link", { name: "Privacy" })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "About" })).toBeVisible();
  await expect(navigation.getByRole("link", { name: "Contact" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(navigation).toBeHidden();
  await expect(menu).toBeFocused();
  const width = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
});

test("navigation stays readable at compact desktop width", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto("/explain");
  await expect(
    page.getByRole("navigation", { name: "Main navigation" }),
  ).toBeHidden();
  const menu = page.getByRole("button", { name: "Open navigation" });
  await expect(menu).toBeVisible();
  await menu.click();
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toBeVisible();
});

test("unknown routes use the branded recovery page", async ({ page }) => {
  const response = await page.goto("/about-us");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page not found." })).toBeVisible();
  expect(await page.locator("body").innerText()).not.toMatch(draftCopy);
  await expect(page.getByRole("link", { name: "Return home" })).toHaveAttribute("href", "/");
  await expect(page.getByRole("link", { name: /Start guided demo/ })).toHaveAttribute(
    "href",
    "/first-day?demo=1",
  );
});

test("First Day clearly separates the fictional demo from the public-source example", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/first-day");
  const fictionalCase = page.getByRole("button", {
    name: "Try the fictional case",
  });
  await expect(fictionalCase).toBeVisible();
  const actionBounds = await fictionalCase.boundingBox();
  expect(actionBounds).not.toBeNull();
  expect(actionBounds!.y + actionBounds!.height).toBeLessThan(700);
  await expect(
    page.getByText("Mesa View is fictional.", { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByText("not a district pilot or partnership", {
      exact: false,
    }),
  ).toBeVisible();
});
