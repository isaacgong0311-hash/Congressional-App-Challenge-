import { readFile } from "node:fs/promises";

import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { fictionalCase } from "../app/features/first-day/content/fictional-case";

async function expectNoSeriousAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  const violations = results.violations.filter((violation) =>
    violation.impact === "serious" || violation.impact === "critical",
  );
  expect(violations).toEqual([]);
}

async function answerFamilyQuestions(page: Page) {
  const immunization = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: "Do you have Maya's immunization record?",
    }),
  });
  await immunization.getByRole("button", { name: "Yes", exact: true }).click();
  await expect(immunization.getByText("Yes", { exact: true })).toBeVisible();

  const interpreter = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: "Would an interpreter help your family?",
    }),
  });
  await interpreter.getByRole("button", { name: "No", exact: true }).click();
  await expect(interpreter.getByText("No", { exact: true })).toBeVisible();
}

test("fictional case completes all six screens with sources and Spanish output", async ({
  page,
}) => {
  await page.goto("/first-day");
  await expect(
    page.getByRole("heading", {
      name: "School letters, one clear plan.",
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
  await page.getByRole("button", { name: "Try the fictional case" }).click();
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
  await answerFamilyQuestions(page);

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
  await expect(page.getByRole("button", { name: "Descargar JSON técnico" })).toBeVisible();
  await expectNoSeriousAxeViolations(page);
});

test("fictional entry and evidence review are keyboard reachable", async ({
  page,
}) => {
  await page.goto("/first-day");
  await page.getByRole("button", { name: "Try the fictional case" }).focus();
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

test("public demo starts at step one without presenter scaffolding or API calls", async ({ page }) => {
  const apiRequests: string[] = [];
  const requestUrls: string[] = [];
  page.on("request", (request) => {
    requestUrls.push(request.url());
    if (new URL(request.url()).pathname.startsWith("/api/")) apiRequests.push(request.url());
  });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/first-day?demo=1");
  const demo = page.getByLabel("Fictional demo");
  await expect(demo).toBeVisible();
  await expect(page.getByRole("heading", { name: "School letters, one clear plan." })).toBeVisible();
  await expect(page.locator('.fd-step-nav [aria-current="step"]')).toContainText("Start");
  await expect(page.getByText(/Story beat|0:20–0:45|Community need/)).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Next beat" })).toHaveCount(0);

  await page.getByRole("button", { name: "Try the fictional case" }).click();
  await expect(page.locator('.fd-step-nav [aria-current="step"]')).toContainText("Documents");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.locator('.fd-step-nav [aria-current="step"]')).toContainText("Review facts");
  await page.getByRole("button", { name: "ES", exact: true }).click();
  await expect(page.getByLabel("Demo ficticia")).toBeVisible();
  await expect(page.getByRole("button", { name: "Reiniciar demo" })).toBeVisible();
  expect(apiRequests).toEqual([]);
  expect(
    requestUrls.filter((url) => new URL(url).origin !== new URL(page.url()).origin),
  ).toEqual([]);
});

test("clean demo presents one usable first action on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/first-day?demo=1");
  const start = page.getByRole("button", { name: "Try the fictional case" });
  const bounds = await start.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.y + bounds!.height).toBeLessThan(844);
  await expect(page.getByRole("button", { name: "Try the public-source example" })).toHaveCount(0);
  await expect(page.getByText("Fictional documents. No account or upload required.")).toBeVisible();

  await page.getByRole("button", { name: "ES", exact: true }).click();
  await expect(page.getByText("Documentos ficticios. No necesita una cuenta ni subir archivos.")).toBeVisible();
});

test("mobile progress closes after choosing a demo step", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/first-day?demo=1");
  await page.getByRole("button", { name: "Try the fictional case" }).click();
  const progress = page.locator(".fd-mobile-progress");
  await progress.locator("summary").click();
  await expect(progress).toHaveAttribute("open", "");
  await progress.getByRole("button", { name: /My plan/ }).click();
  await expect(progress).not.toHaveAttribute("open", "");
  await expect(page.getByRole("heading", { name: "What to do next, and why." })).toBeVisible();
});

test("clean demo carries a sourced plan through English and Spanish", async ({ page }) => {
  const unexpectedRequests: string[] = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin !== "http://127.0.0.1:3100" || url.pathname.startsWith("/api/")) {
      unexpectedRequests.push(request.url());
    }
  });

  for (const language of ["English", "Español"] as const) {
    await test.step(language, async () => {
      await page.goto("/first-day?demo=1");
      if (language === "Español") {
        await page.getByRole("button", { name: "ES", exact: true }).click();
      }
      const es = language === "Español";
      await page.getByRole("button", { name: es ? "Probar el caso ficticio" : "Try the fictional case" }).click();
      await expect(page.locator('.fd-step-nav [aria-current="step"]')).toContainText(es ? "Documentos" : "Documents");
      for (const quote of fictionalCase.evidence.slice(0, 2)) {
        await expect(page.getByText(quote.quote, { exact: false }).first()).toBeVisible();
      }
      await expect(page.getByText("Por favor, entre por la entrada del gimnasio.", { exact: false }).first()).toBeVisible();
      await page.getByRole("button", { name: es ? "Continuar" : "Continue" }).click();
      await expect(page.locator('.fd-step-nav [aria-current="step"]')).toContainText(es ? "Revisar datos" : "Review facts");

      const immunization = page.getByRole("article").filter({
        has: page.getByRole("heading", { name: es ? "¿Tiene el registro de vacunas de Maya?" : "Do you have Maya's immunization record?" }),
      });
      await immunization.getByRole("button", { name: es ? "Sí" : "Yes", exact: true }).click();
      const interpreter = page.getByRole("article").filter({
        has: page.getByRole("heading", { name: es ? "¿Necesita un intérprete?" : "Would an interpreter help your family?" }),
      });
      await interpreter.getByRole("button", { name: es ? "Aún no sé" : "Not sure yet" }).click();
      await expect(interpreter.getByText(es ? "No está claro" : "Unclear", { exact: true })).toBeVisible();
      await page.getByRole("button", { name: es ? "Continuar" : "Continue" }).click();
      await expect(page.locator('.fd-step-nav [aria-current="step"]')).toContainText(es ? "Mi plan" : "My plan");

      const orientation = page.getByRole("article").filter({
        has: page.getByRole("heading", { name: es ? "Confirmar dónde empieza la orientación" : "Confirm where orientation begins" }),
      });
      await orientation.getByRole("button", { name: es ? "Resolver" : "Resolve this" }).click();
      await expect(page.locator('.fd-step-nav [aria-current="step"]')).toContainText(es ? "Resolver" : "Resolve");
      const conflict = page.locator(".fd-conflict-card");
      await expect(conflict).toHaveCount(2);
      await expect(conflict.nth(0)).toContainText(fictionalCase.evidence.find((item) => item.id === "evidence-orientation-cafeteria")!.quote);
      await expect(conflict.nth(1)).toContainText(fictionalCase.evidence.find((item) => item.id === "evidence-orientation-gym")!.quote);
      await expect(page.getByText(es ? "Pregunta preparada" : "Prepared question")).toBeVisible();
      await conflict.last().getByRole("button", { name: es ? "Registrar lo que me dijo la escuela" : "Record what the school told me" }).click();

      const progress = page.locator(".fd-mobile-progress summary");
      if (await progress.isVisible()) await progress.click();
      await page.getByRole("button", { name: es ? /Llevar conmigo/ : /Take it with me/ }).click();
      const printPlan = page.locator(".fd-print-plan");
      await expect(printPlan).toBeVisible();
      await expect(printPlan.getByText(es ? "Fuentes:" : "Sources:").first()).toBeVisible();

      await page.getByText(es ? "Más formas de guardar" : "More ways to save").click();
      const downloadPromise = page.waitForEvent("download");
      await page.getByRole("button", { name: es ? "Descargar datos del plan (JSON)" : "Download plan data (JSON)" }).click();
      const download = await downloadPromise;
      const portable = JSON.parse(await readFile((await download.path())!, "utf8"));
      const readyTasks = portable.tasks.filter((task: { state: string }) => task.state === "ready");
      expect(readyTasks.length).toBeGreaterThan(0);
      for (const task of readyTasks as Array<{ id: string; evidenceIds: string[] }>) {
        expect(task.evidenceIds.length, `${task.id} must retain a source`).toBeGreaterThan(0);
        const source = fictionalCase.evidence.find((item) => item.id === task.evidenceIds[0]);
        expect(source, `${task.id} must cite case evidence`).toBeDefined();
        await expect(printPlan).toContainText(source!.location);
      }
    });
  }
  expect(unexpectedRequests).toEqual([]);
});

test("presenter mode follows the six-beat story and can exit and resume", async ({
  page,
}) => {
  const providerRequests: string[] = [];
  page.on("request", (request) => {
    const path = new URL(request.url()).pathname;
    if (path.startsWith("/api/") && path !== "/api/health") {
      providerRequests.push(request.url());
    }
  });

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/first-day?demo=1&present=1");
  await page.emulateMedia({ reducedMotion: "reduce" });
  const guide = page.getByLabel("Guided demonstration");
  await expect(guide).toBeVisible();
  await expectNoSeriousAxeViolations(page);
  await expect(guide.getByText("Fictional demo · Story beat 1 of 6")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "One case, every instruction." }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Three pages. Two languages. One family trying not to miss a step.",
    }),
  ).toBeVisible();

  await guide.getByRole("button", { name: "Next beat" }).click();
  await expect(guide.getByText("Fictional demo · Story beat 2 of 6")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Check the facts that shape the plan.",
    }),
  ).toBeVisible();
  await expect(
    guide.getByRole("button", { name: "Next beat" }),
  ).toBeDisabled();
  await expect(guide.getByText("Review 2 facts before continuing.")).toBeVisible();

  await guide.getByRole("button", { name: "Previous beat" }).click();
  await expect(guide.getByText("Fictional demo · Story beat 1 of 6")).toBeVisible();
  await guide.getByRole("button", { name: "Next beat" }).click();

  const immunization = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: "Do you have Maya's immunization record?",
    }),
  });
  await immunization.getByRole("button", { name: "Yes", exact: true }).click();
  await expect(guide.getByText("Review 1 fact before continuing.")).toBeVisible();
  await expect(guide.getByRole("button", { name: "Next beat" })).toBeDisabled();

  const interpreter = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: "Would an interpreter help your family?",
    }),
  });
  await interpreter.getByRole("button", { name: "No", exact: true }).click();
  await expect(
    guide.getByText("Every proposed fact has been reviewed by the family"),
  ).toBeVisible();
  await expect(guide.getByRole("button", { name: "Next beat" })).toBeEnabled();
  await guide.getByRole("button", { name: "Next beat" }).click();
  await expect(guide.getByText("Fictional demo · Story beat 3 of 6")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Two documents. One unanswered question.",
    }),
  ).toBeVisible();
  await expectNoSeriousAxeViolations(page);
  await expect(guide.getByText("Record what the school told the family.")).toBeVisible();

  await page
    .getByRole("button", { name: "Record what the school told me" })
    .last()
    .click();
  await expect(guide.getByText("Fictional demo · Story beat 4 of 6")).toBeVisible();
  await expect(page.getByText("One answer · one focused update")).toBeVisible();
  await expect(page.getByText("Only the plan steps that depended on this answer were updated.")).toBeVisible();
  await expect(page.getByText("School answer: Gym entrance")).toBeVisible();
  const trace = page.getByLabel(
    "Decision trace: Confirm where orientation begins",
  );
  await expect(trace).toBeVisible();
  await expect(trace.getByText("School confirmation recorded")).toBeVisible();
  await expect(trace.getByText("Gym entrance", { exact: true })).toHaveCount(2);
  await expect(trace.getByText("Confirmed", { exact: true })).toBeVisible();
  await expect(trace.getByText("Not selected", { exact: true })).toBeVisible();
  await expect(
    trace.getByText("Por favor, entre por la entrada del gimnasio.", {
      exact: false,
    }),
  ).toBeVisible();
  await trace.getByRole("button", { name: "Close decision trace" }).click();
  await expect(trace).toBeHidden();
  const orientationTask = page.getByRole("article").filter({
    has: page.getByRole("heading", {
      name: "Confirm where orientation begins",
    }),
  });
  const traceButton = orientationTask.getByRole("button", {
    name: "Trace this decision",
  });
  await traceButton.focus();
  await page.keyboard.press("Enter");
  await expect(trace).toBeVisible();
  const focusedAnimation = await page
    .locator(".fd-task-highlight")
    .evaluate((element) => Number.parseFloat(getComputedStyle(element).animationDuration));
  expect(focusedAnimation).toBeLessThanOrEqual(0.01);

  await guide.getByRole("button", { name: "Exit demo" }).click();
  await expect(guide).toBeHidden();
  await expect(
    page.getByRole("heading", { name: "What to do next, and why." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Resume guided demo" }).click();
  await expect(guide.getByText("Fictional demo · Story beat 4 of 6")).toBeVisible();

  await guide.getByRole("button", { name: "Next beat" }).click();
  await expect(guide.getByText("Fictional demo · Story beat 5 of 6")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "A plan the family can carry." }),
  ).toBeVisible();
  await expect(page.getByText("0 unresolved items")).toBeVisible();
  const confirmedFacts = page.getByRole("heading", { name: "Confirmed facts" }).locator("..");
  await expect(confirmedFacts.getByText("Gym entrance", { exact: true })).toBeVisible();

  await guide.getByRole("button", { name: "Next beat" }).click();
  await expect(guide.getByText("Fictional demo · Story beat 6 of 6")).toBeVisible();
  const proof = page.locator("[data-demo-proof='true']");
  await expect(proof).toHaveAttribute("open", "");
  await expect(
    proof.getByRole("heading", {
      name: "AI reads. Evidence constrains. Families decide. Code plans.",
    }),
  ).toBeVisible();
  await expect(proof.getByText("32/32")).toBeVisible();
  await expect(guide.getByRole("button", { name: "Demo complete" })).toBeDisabled();
  await expectNoSeriousAxeViolations(page);
  await page.getByRole("button", { name: "ES", exact: true }).click();
  await expect(proof.getByText("citas exactas cubiertas")).toBeVisible();
  await expect(
    proof.getByText("No se ha completado un estudio con documentos de familias reales.", {
      exact: false,
    }),
  ).toBeVisible();
  expect(providerRequests).toEqual([]);

  const spanishGuide = page.getByLabel("Demostración guiada");
  await spanishGuide.getByRole("button", { name: "Reiniciar demo" }).click();
  await expect(
    spanishGuide.getByText("Demo ficticia · Momento narrativo 1 de 6"),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Un caso, todas las instrucciones." }),
  ).toBeVisible();
  await expect(page.getByLabel(/Rastro de decisión:/)).toHaveCount(0);
  const blockerMetric = page
    .getByRole("region", { name: "Resumen del caso" })
    .getByText("bloqueos", { exact: true })
    .locator("..");
  await expect(blockerMetric.getByText("1", { exact: true })).toBeVisible();
  await expect(
    spanishGuide.getByRole("button", { name: "Siguiente momento" }),
  ).toBeEnabled();
});

test("presenter mode keeps its mobile controls in the first viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/first-day?demo=1&present=1");
  const nextBeat = page.getByRole("button", { name: "Next beat" });
  await expect(nextBeat).toBeVisible();
  const box = await nextBeat.boundingBox();
  expect(box?.y).toBeLessThan(844);
  const width = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
});

test("confirmed dates download as a real calendar file", async ({ page }) => {
  await page.goto("/first-day");
  await page.getByRole("button", { name: "Try the fictional case" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await answerFamilyQuestions(page);
  await page.getByRole("button", { name: "Continue" }).click();
  const compactProgress = page.locator(".fd-mobile-progress summary");
  if (await compactProgress.isVisible()) await compactProgress.click();
  await page.getByRole("button", { name: /Take it with me/ }).click();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /Add dates to calendar/ }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("lantern-confirmed-dates.ics");
  const path = await download.path();
  expect(path).not.toBeNull();
  const contents = await readFile(path!, "utf8");
  expect(contents).toContain("BEGIN:VCALENDAR");
  expect(contents).toContain("UID:lantern-fact-registration-date");
  expect(contents).toContain("DTSTART:20270812T090000");
  await expect(page.getByText("Calendar file downloaded.", { exact: false })).toBeVisible();
});

test("task completion can be undone without deleting history", async ({ page }) => {
  await page.goto("/first-day");
  await page.getByRole("button", { name: "Try the fictional case" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await answerFamilyQuestions(page);
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
  await page.getByRole("button", { name: "Try the fictional case" }).click();
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

test("reading controls keep working when browser storage is denied", async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException("Storage blocked", "SecurityError"); };
    Storage.prototype.setItem = () => { throw new DOMException("Storage blocked", "SecurityError"); };
  });
  await page.goto("/first-day?demo=1");
  const largeText = page.getByRole("button", { name: "Toggle large text" });
  const highContrast = page.getByRole("button", { name: "Toggle high contrast" });
  await largeText.click();
  await highContrast.click();
  await expect(largeText).toHaveAttribute("aria-pressed", "true");
  await expect(highContrast).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Try the fictional case" }).click();
  await expect(page.getByRole("heading", { name: "One case, every instruction." })).toBeVisible();
});

test("clean demo has no horizontal overflow at 375px and 200 percent zoom", async ({ page }) => {
  for (const width of [375, 188]) {
    await page.setViewportSize({ width, height: 812 });
    await page.goto("/first-day?demo=1");
    await page.getByRole("button", { name: "Try the fictional case" }).click();
    for (const step of ["documents", "facts", "plan", "export"] as const) {
      const progress = page.locator(".fd-mobile-progress summary");
      if (step !== "documents") {
        const label = { facts: /Review facts/, plan: /My plan/, export: /Take it with me/ }[step];
        const target = page.getByRole("button", { name: label });
        if (!(await target.isVisible()) && await progress.isVisible()) await progress.click();
        await target.click();
      }
      const dimensions = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth,
      }));
      expect(dimensions.scroll, `${step} at ${width}px`).toBeLessThanOrEqual(dimensions.client + 1);
    }
  }
});
