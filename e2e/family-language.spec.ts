import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
}

test("a new Spanish reader can find Explain, review sharing, and try a sample", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let explainCalls = 0;
  await page.route("**/api/explain", (route) => {
    explainCalls += 1;
    return route.abort();
  });

  await page.goto("/");
  await expect(page.getByRole("button", { name: "Español" })).toBeVisible();
  await page.getByRole("button", { name: "Español" }).click();
  await expect(page.getByRole("heading", { name: /Entienda la carta/ })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expectNoHorizontalOverflow(page);
  await expect(page.locator(".home-hero-actions").getByRole("link", { name: "Explicar una carta" })).toHaveAttribute("href", "/explain?lang=es");
  await page.locator(".home-hero-actions").getByRole("link", { name: "Explicar una carta" }).click();

  await expect(page.getByRole("heading", { name: "Entienda la carta. Sepa qué hacer después." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Español" })).toHaveAttribute("aria-pressed", "true");
  const sharing = page.getByLabel("Antes de compartir una foto");
  await expect(sharing).toContainText("números de Seguro Social");
  await expect(sharing).toContainText("números A");
  await expect(sharing).toContainText("Groq");
  await expectNoHorizontalOverflow(page);
  await sharing.getByRole("button", { name: "Leer cómo se comparte la imagen" }).click();
  await expect(page.getByText("Cómo trata Lantern su documento")).toBeVisible();
  await page.getByRole("tab", { name: "Subir" }).click();

  await page.getByRole("button", { name: "¿No tiene una carta? Pruebe un ejemplo" }).click();
  await page.getByRole("button", { name: "Explicar esta carta" }).click();
  await expect(page.getByRole("heading", { name: "Aviso ficticio de denegación de Medicaid" })).toBeVisible();
  expect(explainCalls).toBe(0);
});

test("Spanish links open their destination in Spanish on a fresh visit", async ({ page }) => {
  await page.goto("/explain?lang=es");
  await expect(page.getByRole("heading", { name: "Entienda la carta. Sepa qué hacer después." })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await page.getByRole("button", { name: "English" }).click();
  await expect(page.getByRole("heading", { name: "Understand the letter. See what to do next." })).toBeVisible();

  await page.goto("/first-day?demo=1&lang=es");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
  await expect(page.getByRole("button", { name: "ES", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("heading", { name: "Cartas escolares, un plan claro." })).toBeVisible();
});

test("Spanish help without a letter stays readable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/explain");
  await page.getByRole("button", { name: "Español" }).click();
  await page.getByRole("button", { name: "Buscar ayuda sin una carta" }).click();
  await expect(page.getByRole("heading", { name: "¿Qué está pasando?" })).toBeVisible();
  await page.getByRole("button", { name: /Inmigración/ }).click();
  await expect(page.getByRole("heading", { name: "Ayuda con inmigración" })).toBeVisible();
  await expect(page.getByText("Ayuda oficial con casos, avisos y citas de inmigración.")).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
