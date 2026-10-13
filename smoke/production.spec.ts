import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

const readme = readFileSync("README.md", "utf8");
const routeTable = readme.match(/## Routes\n([\s\S]*?)(?=\n## )/)?.[1];
if (!routeTable) throw new Error("README route table is missing.");
const routes = [...routeTable.matchAll(/^\| `([^`]+)` \|/gm)].map((match) => match[1]);
if (routes.length === 0) throw new Error("README route table has no routes.");

for (const route of routes) {
  test(`${route} serves successfully`, async ({ page }) => {
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);
    await expect(page.locator("main")).toBeVisible();
  });
}

test("unknown route shows the Lantern 404", async ({ page }) => {
  const response = await page.goto("/lantern-smoke-unknown-route");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page not found." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Return home" })).toHaveAttribute("href", "/");
});

test("the fictional demo stays on its own origin and avoids provider routes", async ({ page, baseURL }) => {
  const unexpectedRequests: string[] = [];
  const origin = new URL(baseURL!).origin;
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin !== origin || url.pathname.startsWith("/api/")) {
      unexpectedRequests.push(request.url());
    }
  });

  await page.goto("/first-day?demo=1");
  await expect(page.getByLabel("Fictional demo")).toBeVisible();
  await page.getByRole("button", { name: "Try the fictional case" }).click();
  await expect(page.locator('.fd-step-nav [aria-current="step"]')).toContainText("Documents");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator('.fd-step-nav [aria-current="step"]')).toContainText("Review facts");
  expect(unexpectedRequests).toEqual([]);
});

test("the Explain sample completes without a provider request", async ({ page, baseURL }) => {
  const unexpectedRequests: string[] = [];
  const origin = new URL(baseURL!).origin;
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin !== origin || url.pathname.startsWith("/api/")) {
      unexpectedRequests.push(request.url());
    }
  });

  await page.goto("/explain");
  await page.getByRole("button", { name: /Try a sample/ }).click();
  await page.getByRole("button", { name: "Explain this letter" }).click();
  await expect(page.getByRole("heading", { name: "Fictional Medicaid denial notice" })).toBeVisible();
  expect(unexpectedRequests).toEqual([]);
});

test("Contact offers a usable email route", async ({ page }) => {
  await page.goto("/contact");
  const emailLink = page.getByRole("link", { name: "Or email Isaac directly" });
  const href = await emailLink.getAttribute("href");
  expect(href).toMatch(/^mailto:[^@\s?]+@[^@\s?]+\.[^@\s?]+\?subject=/);
});
