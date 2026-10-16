import { expect, test } from "@playwright/test";

test("the practice call runs a scripted exchange and never changes the plan", async ({ page }) => {
  await page.goto("/first-day");
  await page.getByRole("button", { name: "Try the fictional case" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  while (await page.getByRole("button", { name: "Confirm this" }).count()) {
    await page.getByRole("button", { name: "Confirm this" }).first().click();
  }
  await page.getByRole("button", { name: "Continue" }).click();
  const orientationTask = page.getByRole("article").filter({
    has: page.getByRole("heading", { name: "Confirm where orientation begins" }),
  });
  await orientationTask.getByRole("button", { name: "Resolve this" }).click();

  await page.getByText("Practice the call with the school office (simulated)").click();
  const log = page.getByRole("log", { name: "Practice conversation" });
  await expect(log).toContainText("Front office");

  // An empty reply gets visible feedback instead of doing nothing.
  await page.getByRole("button", { name: "Send practice reply" }).click();
  await expect(page.getByText("Type a reply first.")).toBeVisible();

  await page.getByRole("button", { name: "Use Lantern's question" }).click();
  await page.getByRole("button", { name: "Send practice reply" }).click();
  await expect(log).toContainText("student's name and grade");

  await page.getByLabel(/student's name and grade/).fill("Sofia Rivera, 6th grade");
  await page.getByRole("button", { name: "Send practice reply" }).click();
  await expect(log).toContainText("call you back today");
  await expect(page.getByText("Practice complete.")).toBeVisible();

  // Practice does not record a school answer.
  await expect(page.getByRole("button", { name: "The school confirmed gym" })).toBeVisible();

  await page.getByRole("button", { name: "Practice again" }).click();
  await expect(log.getByRole("listitem")).toHaveCount(1);
});

test("the start page offers the guided tour and a real favicon", async ({ page, request }) => {
  await page.goto("/first-day");
  const tour = page.getByRole("link", { name: /Take the 2-minute guided tour/ }).filter({ visible: true });
  await expect(tour).toHaveCount(1);
  await expect(tour).toHaveAttribute("href", "/first-day?demo=1");
  await expect(page.getByRole("button", { name: "Upload your own school pages" })).toBeVisible();
  await expect(page.getByText("Checking live document availability")).toHaveCount(0);

  const icon = await page.locator('link[rel="icon"][type="image/svg+xml"]').getAttribute("href");
  expect(icon).toBeTruthy();
  const svg = await request.get(icon!);
  expect(svg.ok()).toBe(true);
  expect(await svg.text()).toContain("#dca332");
  expect((await request.get("/favicon.ico")).ok()).toBe(true);
  expect((await request.get("/apple-icon.png")).ok()).toBe(true);
});

test("unsupported and oversized photos explain the problem before upload", async ({ page }) => {
  let explainCalls = 0;
  await page.route("**/api/explain", (route) => {
    explainCalls += 1;
    return route.abort();
  });
  await page.goto("/explain");
  await page.getByLabel("Take a photo or upload a picture of your letter").setInputFiles({
    name: "letter.gif",
    mimeType: "image/gif",
    buffer: Buffer.from("GIF89a"),
  });
  await expect(page.getByRole("alert").filter({ hasText: "We hit a snag" })).toContainText("Please use a JPG or PNG photo.");
  await page.getByRole("button", { name: "Choose another photo" }).click();

  await page.getByLabel("Take a photo or upload a picture of your letter").setInputFiles({
    name: "huge.jpg",
    mimeType: "image/jpeg",
    buffer: Buffer.alloc(10 * 1024 * 1024 + 1),
  });
  await expect(page.getByRole("alert").filter({ hasText: "We hit a snag" })).toContainText("over 10 MB");
  expect(explainCalls).toBe(0);
});

test("a photo with no readable text gets a specific message", async ({ page }) => {
  await page.route("**/api/explain", (route) =>
    route.fulfill({
      status: 422,
      contentType: "application/json",
      body: JSON.stringify({
        error: {
          code: "NO_TEXT_FOUND",
          message: "We couldn't find any words in this photo.",
          retryable: false,
        },
      }),
    }),
  );
  await page.goto("/explain");
  await page.getByLabel("Take a photo or upload a picture of your letter").setInputFiles("public/sample-letter.png");
  await page.getByRole("button", { name: "Explain this letter" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "We hit a snag" })).toContainText("We couldn't find any words in this photo.");
  await expect(page.getByRole("button", { name: "Choose another photo" })).toBeVisible();
});

test("the About page shows its 'What is real' card", async ({ page }) => {
  await page.goto("/about");
  const card = page.locator(".info-card-dark");
  await expect(card.getByRole("heading", { name: "A public-source example." })).toBeVisible();
  const colors = await card.evaluate((element) => ({
    background: getComputedStyle(element).backgroundColor,
    text: getComputedStyle(element.querySelector("h2")!).color,
  }));
  expect(colors.background).not.toBe(colors.text);
  expect(colors.background).toBe("rgb(22, 42, 34)");
});

test("read-aloud always shows what it is doing", async ({ page }) => {
  await page.route("**/api/speak", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: { code: "PROVIDER_UNAVAILABLE", message: "Server speech is unavailable.", retryable: true } }),
    }),
  );
  await page.goto("/explain");
  await page.getByRole("button", { name: /Try a sample/ }).click();
  await page.getByRole("button", { name: "Explain this letter" }).click();
  await page.getByRole("button", { name: "Read explanation aloud" }).click();
  const status = page.locator(".letter-speech-status");
  await expect(status).toHaveText(/Getting the audio ready|Reading aloud|isn't available in this browser/);
  await expect(status).toHaveText(/Reading aloud|Finished reading|isn't available in this browser/, { timeout: 15_000 });
});

test("read-aloud says so when the browser has no speech", async ({ page }) => {
  await page.addInitScript(() => {
    // Simulate a browser without speech synthesis.
    Object.defineProperty(window, "speechSynthesis", { value: undefined, configurable: true });
  });
  await page.route("**/api/speak", (route) => route.fulfill({ status: 503, body: "{}" }));
  await page.goto("/explain");
  await page.getByRole("button", { name: /Try a sample/ }).click();
  await page.getByRole("button", { name: "Explain this letter" }).click();
  await page.getByRole("button", { name: "Read explanation aloud" }).click();
  await expect(page.locator(".letter-speech-status")).toHaveText("Read-aloud isn't available in this browser. Try Chrome or Safari, or check that your device's sound is on.");
  await expect(page.getByRole("button", { name: "Read explanation aloud" })).toBeVisible();
});
