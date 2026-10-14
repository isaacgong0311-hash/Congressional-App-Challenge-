import { expect, test, type Page } from "@playwright/test";

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
}

test("Spanish demo localizes source context, answers, dates, and control names", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: testInfo.project.name === "mobile-chromium" ? 390 : 1280, height: 844 });
  await page.goto("/first-day?demo=1");
  await page.getByRole("button", { name: "ES", exact: true }).click();

  const largeText = page.getByRole("button", { name: "Alternar texto grande" }).first();
  const highContrast = page.getByRole("button", { name: "Alternar contraste alto" }).first();
  await largeText.click();
  await highContrast.click();
  await expect(page.locator(".fd-app")).toHaveAttribute("data-large-text", "true");
  await expect(page.locator(".fd-app")).toHaveAttribute("data-high-contrast", "true");

  await page.getByRole("button", { name: "Probar el caso ficticio" }).click();
  await expect(page.locator(testInfo.project.name === "mobile-chromium" ? ".fd-mobile-progress summary" : '.fd-step-nav [aria-current="step"]')).toContainText("Documentos");
  await expectNoHorizontalOverflow(page);
  const sourceButton = page.getByRole("button", { name: "Ver fuente" }).first();
  await sourceButton.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "Carta de bienvenida para inscripción" })).toBeVisible();
  await expect(dialog.getByText("Página 1, párrafo de inscripción")).toBeVisible();
  await page.getByRole("button", { name: "Cerrar fuente" }).click();

  await page.getByRole("button", { name: "Continuar" }).click();
  const immunization = page.locator("#fact-fact-immunization-record");
  await immunization.getByRole("button", { name: "Sí", exact: true }).click();
  await expect(immunization.getByText("Sí", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(immunization.getByText("Yes", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "ES", exact: true }).click();
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByText("12 de agosto de 2027, 9:00 a. m.").first()).toBeVisible();
  await expectNoHorizontalOverflow(page);

  const mobileProgress = page.locator(".fd-mobile-progress summary");
  if (await mobileProgress.isVisible()) await mobileProgress.click();
  await page.getByRole("button", { name: "Llevar conmigo" }).first().click();
  await expect(page.getByText("Reunión de inscripción · 12 de agosto de 2027", { exact: false })).toBeVisible();
  await expect(page.locator(".fd-print-plan").getByText("Sí", { exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "Reiniciar demo" }).click();
  await expect(page.getByRole("heading", { name: "Cartas escolares, un plan claro." })).toBeVisible();
});
