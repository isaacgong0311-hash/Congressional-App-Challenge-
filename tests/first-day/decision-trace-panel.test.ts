import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { fictionalCase } from "../../app/features/first-day/content/fictional-case";
import { resolveConflict } from "../../app/features/first-day/domain/conflicts";
import { buildDecisionTrace } from "../../app/features/first-day/domain/decision-trace";
import { planCase } from "../../app/features/first-day/domain/planner";
import { DecisionTracePanel } from "../../app/features/first-day/ui/decision-trace-panel";

describe("DecisionTracePanel", () => {
  it("renders an accessible, ordered explanation with source provenance", () => {
    const resolved = resolveConflict(structuredClone(fictionalCase), {
      id: "event-location-confirmed",
      type: "school_confirmation_recorded",
      conflictId: "conflict-orientation-location",
      selectedFactId: "fact-orientation-gym",
      reportedValue: "Gym entrance",
      timestamp: "2026-09-30T16:00:00.000Z",
    });
    const trace = buildDecisionTrace(
      resolved,
      planCase(resolved),
      "task-orientation",
    );
    const html = renderToStaticMarkup(
      createElement(DecisionTracePanel, {
        language: "English",
        onClose: () => undefined,
        trace,
      }),
    );

    expect(html).toContain(
      'aria-label="Decision trace: Confirm where orientation begins"',
    );
    expect(html).toContain('aria-label="Close decision trace"');
    expect(html).toContain("Every required fact is confirmed.");
    expect(html).toContain("School confirmation recorded");
    expect(html).toContain("Gym entrance");
    expect(html).toContain("confirmed");
    expect(html).toContain("superseded");
    expect(html).toContain("<blockquote");
    expect(html).toContain("Enrollment welcome letter");
    expect(html).toContain("School follow-up message");

    const source = html.indexOf("Source evidence");
    const facts = html.indexOf("Proposed facts");
    const decision = html.indexOf("Human decision");
    const dependency = html.indexOf("Dependency logic");
    const result = html.indexOf("Plan result");
    expect(source).toBeGreaterThan(-1);
    expect(source).toBeLessThan(facts);
    expect(facts).toBeLessThan(decision);
    expect(decision).toBeLessThan(dependency);
    expect(dependency).toBeLessThan(result);
  });

  it("states when no human decision has been recorded", () => {
    const trace = buildDecisionTrace(
      fictionalCase,
      planCase(fictionalCase),
      "task-orientation",
    );
    const html = renderToStaticMarkup(
      createElement(DecisionTracePanel, {
        language: "English",
        onClose: () => undefined,
        trace,
      }),
    );

    expect(html).toContain("No human confirmation has been recorded yet.");
    expect(html).toContain("Needs clarification");
  });
});
