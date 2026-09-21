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
  await expect(page.getByText("Utility notice", { exact: true })).toBeVisible();

  await page.evaluate(() => {
    window.speechSynthesis.speak = () => {
      document.documentElement.dataset.speechFallback = "used";
    };
  });
  await page.getByRole("button", { name: /Read aloud/ }).click();
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
