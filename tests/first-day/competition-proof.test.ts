import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../evaluation/first-day/report.json", () => ({
  default: {
    fixtureCount: 27,
    metrics: {
      quoteCoverage: { correct: 50, total: 60 },
      conflicts: { truePositives: 4, falsePositives: 1, falseNegatives: 2 },
      dateErrors: { errors: 1, total: 10 },
      readyTaskSourceCoverage: { correct: 11, total: 12 },
    },
  },
}));

import HomePage from "../../app/page";
import HowFirstDayWorksPage from "../../app/first-day/how-it-works/page";

describe("evaluation proof on public pages", () => {
  it("updates both pages when report.json changes", () => {
    const home = renderToStaticMarkup(createElement(HomePage));
    const how = renderToStaticMarkup(createElement(HowFirstDayWorksPage));

    expect(home).toContain("27 made-up school document sets");
    expect(home).toContain("50/60");
    expect(home).toContain("9/10");
    expect(how).toContain("27 synthetic held-out packets");
    expect(how).toContain("50/60 exact quotes covered");
    expect(how).toContain("9/10 dates read correctly");
  });
});
