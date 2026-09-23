import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const validResult = {
  documentType: "Utility notice",
  category: "utilities",
  confidence: 96,
  whyThisType: "The letter discusses an account balance.",
  urgency: "high",
  meaning: "A past-due balance must be addressed before the listed deadline.",
  keyDetails: {
    sender: "Fictional City Utility",
    contactPhone: "555-0100",
    accountNumber: "Ending in 2048",
    amountDue: "$146.20",
  },
  whatTheyNeed: ["Contact the utility"],
  documentChecklist: [
    { item: "This notice", why: "Use the account reference when calling" },
  ],
  responseLetter: { applicable: false, kind: "", body: "" },
  nextSteps: [
    {
      step: "Confirm the balance",
      detail: "Use a phone number from the official utility website.",
    },
  ],
  phoneScript: "I received a notice and want to confirm my options.",
  deadline: "October 15, 2026",
  deadlineISO: "2026-10-15",
  isPossibleScam: false,
  scamSigns: [],
  isCrisis: false,
  crisisMessage: "",
  scamAgencyFacts: "",
  whatHappensIfNothing: "Service may be interrupted.",
  photoQualityNote: null,
  detectedLetterLanguage: "English",
  originalText: "This fictional utility notice says a balance is due.",
};

test("Explain intake exposes semantic tabs without decorative glyph labels", async ({
  page,
}) => {
  await page.goto("/explain");
  const tablist = page.getByRole("tablist", { name: "Letter setup" });
  await expect(tablist).toBeVisible();
  await expect(
    tablist.getByRole("tab", { name: "Upload" }),
  ).toHaveAttribute("aria-selected", "true");
  await tablist.getByRole("tab", { name: "Options" }).click();
  await expect(
    tablist.getByRole("tab", { name: "Options" }),
  ).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowRight");
  await expect(
    tablist.getByRole("tab", { name: "Privacy" }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    tablist.getByRole("tab", { name: "Privacy" }),
  ).toBeFocused();
});

test("Explain intake keeps one clear primary action and stable processing status", async ({
  page,
}) => {
  let releaseResponse!: () => void;
  await page.route("**/api/explain", async (route) => {
    await new Promise<void>((resolve) => {
      releaseResponse = resolve;
    });
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(validResult),
    });
  });

  await page.goto("/explain");
  await expect(
    page.getByText("Choose a letter photo", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Try a sample/ }).click();
  await page.getByRole("button", { name: "Explain this letter" }).click();
  await expect(
    page.getByRole("status", { name: "Analyzing your letter" }),
  ).toContainText("Reading your letter");
  releaseResponse();
  await expect(
    page.getByRole("heading", { name: "Utility notice", exact: true }),
  ).toBeVisible();
});

test("no-letter help feels like a complete product path", async ({ page }) => {
  await page.goto("/explain");
  await page.getByRole("button", { name: "Find help without a letter" }).click();
  await expect(
    page.getByRole("heading", { name: "What's going on?" }),
  ).toBeVisible();
  await expect(
    page.getByRole("list", { name: "Help categories" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Utilities/ }).click();
  await expect(
    page.getByRole("heading", { name: /Utility help/ }),
  ).toBeVisible();
  await expect(page.getByText("verified by hand", { exact: false })).toBeVisible();
});

test("letter workspace recovers from malformed output and keeps speech fallback", async ({
  page,
}) => {
  let valid = false;
  await page.route("**/api/explain", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(valid ? validResult : { meaning: "Incomplete" }),
    }),
  );
  await page.route("**/api/speak", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Speech provider unavailable" }),
    }),
  );

  await page.goto("/explain");
  await expect(
    page.getByRole("heading", {
      name: "Understand the letter. See what to do next.",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Try a sample/ }).click();
  await page.getByRole("button", { name: "Explain this letter" }).click();
  await expect(page.locator('.ttf-fade-in[role="alert"]')).toContainText(
    "We couldn't safely read that response",
  );

  valid = true;
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(
    page.getByRole("heading", { name: "Utility notice", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Letter summary" }),
  ).toBeVisible();
  await expect(
    page.getByRole("tablist", { name: "Explanation sections" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Read explanation aloud" }),
  ).toBeVisible();
  await expect(
    page.getByText("Reading level · Grade 9 → 6", { exact: true }),
  ).toBeVisible();

  await page.evaluate(() => {
    window.speechSynthesis.speak = () => {
      document.documentElement.dataset.speechFallback = "used";
    };
  });
  await page
    .getByRole("button", { name: "Read explanation aloud" })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-speech-fallback", "used");

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

test("letter language updates direction and persists as a shared preference", async ({
  page,
}) => {
  await page.goto("/explain");
  await page.getByRole("tab", { name: /Options/ }).click();
  await page.getByLabel("Explain in this language").selectOption("Arabic");
  await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect
    .poll(() =>
      page.evaluate(() =>
        JSON.parse(localStorage.getItem("lantern.preferences.v1") ?? "{}"),
      ),
    )
    .toMatchObject({ preferredLanguage: "ar" });
});

test("crisis and scam guidance remain distinct while local help loads", async ({
  page,
}) => {
  const safetyResult = {
    ...validResult,
    isPossibleScam: true,
    scamSigns: ["The letter requests payment with gift cards."],
    scamAgencyFacts:
      "The real utility accepts payment through its official billing channels.",
    isCrisis: true,
    crisisMessage:
      "Contact the utility through its official website today to confirm the shutoff risk.",
  };

  await page.route("**/api/explain", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 150));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(safetyResult),
    });
  });
  await page.route("**/api/local-help", async (route) => {
    expect(await route.request().postDataJSON()).toMatchObject({
      category: "utilities",
      city: "Round Rock",
      state: "TX",
    });
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        resources: [
          {
            name: "Fictional Community Action",
            phone: "555-0134",
            address: "100 Main Street",
            url: "https://example.org/help",
            desc: "Utility-bill assistance for qualifying households.",
          },
        ],
      }),
    });
  });

  await page.goto("/explain");
  await page.getByRole("button", { name: /Try a sample/ }).click();
  await page.getByRole("button", { name: "Explain this letter" }).click();
  await expect(page.getByRole("status", { name: "Analyzing your letter" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Utility notice", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("This may be a scam — please be careful")).toBeVisible();
  await expect(page.getByText("This needs attention soon")).toBeVisible();
  await page
    .getByRole("button", { name: /Why we flagged this/ })
    .click();
  await expect(page.getByText(/official billing channels/)).toBeVisible();

  await page.getByRole("tab", { name: "Get Help" }).click();
  await page.getByPlaceholder("City (optional)").fill("Round Rock");
  await page.getByPlaceholder("State *").fill("TX");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByText("Fictional Community Action")).toBeVisible();
  await expect(page.getByRole("link", { name: "Call 555-0134" })).toBeVisible();
});

test("reading preferences carry between Explain and First Day", async ({ page }) => {
  await page.goto("/explain");
  await page.getByRole("button", { name: "Toggle large text" }).click();
  await page.getByRole("button", { name: "Toggle high contrast" }).click();
  await expect(page.locator(".letter-app")).toHaveAttribute("data-large-text", "true");
  await expect(page.locator(".letter-app")).toHaveAttribute("data-high-contrast", "true");

  await page.goto("/first-day");
  await expect(page.locator(".fd-app")).toHaveAttribute("data-large-text", "true");
  await expect(page.locator(".fd-app")).toHaveAttribute("data-high-contrast", "true");
});
