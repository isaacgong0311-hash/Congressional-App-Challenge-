import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { UsabilitySection, aboutLimitsCopy } from "../../app/about/usability-section";
import findings from "../../evaluation/usability/findings.json";
import {
  buildPublicUsabilityReport,
  parsePublicUsabilityReport,
} from "../../evaluation/usability/public-report";
import reportJson from "../../evaluation/usability/report.json";
import sessions from "../../evaluation/usability/sessions.json";

const exampleFinding = {
  participantRole: "Adult family member",
  date: "2026-10-18",
  finding: "The source quote was hard to find.",
  changeMade: "Moved the source link beside the fact.",
};

describe("public usability reporting", () => {
  it("keeps the generated status aligned with recorded sessions and findings", () => {
    expect(reportJson).toEqual(buildPublicUsabilityReport(sessions, findings));
    expect(() =>
      buildPublicUsabilityReport(sessions, [exampleFinding]),
    ).toThrow(/recorded participant sessions/i);
  });

  it("hides the testing section until sessions are recorded", () => {
    const report = parsePublicUsabilityReport(reportJson);
    expect(renderToStaticMarkup(createElement(UsabilitySection, { report }))).toBe("");
    expect(aboutLimitsCopy(report)).toContain("not a completed real-family study");
  });

  it("renders real findings and changes from a fixture report", () => {
    const report = parsePublicUsabilityReport({
      status: "Preliminary",
      entries: [exampleFinding],
    });
    const html = renderToStaticMarkup(createElement(UsabilitySection, { report }));
    expect(html).toContain("What we learned from testing");
    expect(html).toContain("Adult family member");
    expect(html).toContain("The source quote was hard to find.");
    expect(html).toContain("Moved the source link beside the fact.");
    expect(aboutLimitsCopy(report)).toContain("sessions with consenting adults");
  });
});
