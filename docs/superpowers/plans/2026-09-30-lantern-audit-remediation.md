# Lantern Audit Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Lantern’s judge-visible demo, exports, navigation, trust pages, localization, and project framing reliable and internally consistent.

**Architecture:** Preserve the existing event-sourced First Day domain and derive every judge-visible count and statement from `FirstDayCase` plus `PlannerResult`. Keep browser side effects at the UI boundary, global navigation in shared components, and new public pages as server-rendered routes using the existing design system.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Vitest, Playwright, axe-core.

---

## File Map

- Modify `app/features/first-day/ui/demo-presentation.ts`: truthful singular/plural and state-derived narrator output.
- Modify `app/features/first-day/ui/facts-step.tsx`: stable per-card fact actions and grammatical review summary.
- Modify `app/features/first-day/ui/first-day-workspace.tsx`: complete bilingual product context.
- Modify `app/features/first-day/ui/export-step.tsx`: calendar download feedback and spacing-safe copy.
- Modify `app/features/first-day/ui/start-step.tsx`, `documents-step.tsx`, and `case-snapshot.tsx`: explicit fictional/pilot boundary and non-affiliation copy.
- Modify `app/components/lantern/product-header.tsx`, `mobile-navigation.tsx`, and `site-footer.tsx`: mobile CTA and public trust navigation.
- Create `app/about/page.tsx`: student-project story and responsible-AI boundaries.
- Create `app/contact/page.tsx`: honest pilot-interest/contact route.
- Create `app/not-found.tsx`: branded recovery route.
- Create `app/styles/info-pages.css`: shared About, Contact, and 404 presentation styles.
- Modify focused Vitest and Playwright suites for state, export, routing, copy, and mobile regression coverage.

### Task 1: Lock the guided-demo state contract

**Files:**
- Modify: `tests/first-day/demo-presentation.test.ts`
- Modify: `e2e/first-day-fictional.spec.ts`
- Modify: `app/features/first-day/ui/demo-presentation.ts`
- Modify: `app/features/first-day/ui/facts-step.tsx`

- [ ] **Step 1: Add failing narrator grammar tests**

Add assertions for singular and plural output:

```ts
expect(demoOutcome("traceable_evidence", { ...snapshot, pendingFactCount: 1 }, "English"))
  .toBe("1 fact still needs family review");
expect(demoBlocker("traceable_evidence", { ...snapshot, pendingFactCount: 1 }, "English"))
  .toBe("Review 1 fact before continuing.");
expect(demoOutcome("uncertainty_preserved", { ...snapshot, openConflictCount: 1 }, "English"))
  .toBe("1 conflict stays visible until a person decides");
```

- [ ] **Step 2: Run the focused test and confirm failure**

Run: `npm test -- tests/first-day/demo-presentation.test.ts`

Expected: FAIL on the current `1 facts`/plural-only strings.

- [ ] **Step 3: Implement count-aware copy**

Add a local count helper in `demo-presentation.ts` and use it for fact, blocker, conflict, step, and completed labels. Keep the completed-state sentence reachable only when the corresponding count is zero.

- [ ] **Step 4: Make the browser flow answer the exact family-question cards**

In `e2e/first-day-fictional.spec.ts`, replace generic loops with card-scoped actions:

```ts
const immunization = page.getByRole("article").filter({
  has: page.getByRole("heading", { name: "Do you have Maya's immunization record?" }),
});
await immunization.getByRole("button", { name: "Yes", exact: true }).click();

const interpreter = page.getByRole("article").filter({
  has: page.getByRole("heading", { name: "Would an interpreter help your family?" }),
});
await interpreter.getByRole("button", { name: "No", exact: true }).click();
```

Assert each card’s chosen value and the zero-pending narrator before advancing.

- [ ] **Step 5: Run the focused unit and browser tests**

Run: `npm test -- tests/first-day/demo-presentation.test.ts && npx playwright test e2e/first-day-fictional.spec.ts --project=desktop-chromium`

Expected: PASS; the guided demo cannot advance with either family question unanswered.

### Task 2: Verify conflict selection remains consistent through plan and export

**Files:**
- Modify: `e2e/first-day-fictional.spec.ts`
- Modify if required: `app/features/first-day/ui/use-first-day-controller.ts`
- Modify if required: `app/features/first-day/export/plan-document.ts`

- [ ] **Step 1: Add a failing end-to-end assertion**

After selecting “Gym entrance,” assert the focused plan task and confirmed export fact both show “Gym entrance,” do not show “School cafeteria” as the effective answer, and report zero unresolved items.

- [ ] **Step 2: Run the guided test**

Run: `npx playwright test e2e/first-day-fictional.spec.ts --project=desktop-chromium -g "guided demo"`

Expected: FAIL if any surface still reads the original conflicting fact rather than the resolution event.

- [ ] **Step 3: Use the existing conflict-resolution event as the sole effective value**

If the test fails, update the controller/export adapter to read the latest `school_confirmation_recorded` event for the conflict and selected fact. Do not mutate or delete the original source fact.

- [ ] **Step 4: Re-run unit and browser coverage**

Run: `npm test -- tests/first-day/conflicts.test.ts tests/first-day/plan-document.test.ts && npx playwright test e2e/first-day-fictional.spec.ts --project=desktop-chromium -g "guided demo"`

Expected: PASS with source history preserved.

### Task 3: Make calendar export observably functional

**Files:**
- Modify: `app/features/first-day/ui/export-step.tsx`
- Modify: `e2e/first-day-fictional.spec.ts`
- Modify: `tests/first-day/calendar.test.ts`

- [ ] **Step 1: Add download assertions**

Use Playwright’s download event:

```ts
const downloadPromise = page.waitForEvent("download");
await page.getByRole("button", { name: /Add dates to calendar/ }).click();
const download = await downloadPromise;
expect(download.suggestedFilename()).toBe("lantern-confirmed-dates.ics");
```

Read the saved file and assert `BEGIN:VCALENDAR`, a stable UID, and at least one `DTSTART;VALUE=DATE` line.

- [ ] **Step 2: Run the browser assertion and confirm current behavior**

Run: `npx playwright test e2e/first-day-fictional.spec.ts --project=desktop-chromium -g "calendar"`

Expected: FAIL if the click does not produce a browser-visible download or completion state.

- [ ] **Step 3: Add inline download feedback and guarded failure handling**

Track `calendarStatus` as `idle | success | error`, wrap object URL creation/click in `try/catch`, and render an `aria-live="polite"` message. Preserve the disabled explanation when `dates.length === 0`.

- [ ] **Step 4: Run calendar tests**

Run: `npm test -- tests/first-day/calendar.test.ts && npx playwright test e2e/first-day-fictional.spec.ts --project=desktop-chromium -g "calendar"`

Expected: PASS and downloaded `.ics` content is valid.

### Task 4: Repair audited copy, spacing, and Spanish coverage

**Files:**
- Modify: `app/features/first-day/ui/first-day-workspace.tsx`
- Modify: `app/features/first-day/ui/export-step.tsx`
- Modify: `app/features/first-day/ui/documents-step.tsx`
- Modify: `app/features/letter-tool/letter-results.tsx`
- Modify: `app/page.tsx`
- Modify: `app/first-day/how-it-works/page.tsx`
- Modify: `e2e/production-fixes.spec.ts`

- [ ] **Step 1: Add browser assertions for audited strings**

Assert complete text with spaces for proof metrics, upload totals, readiness counts, safety sentences, and `0 unresolved items`. Switch First Day to Spanish and assert “Lantern / Primer Día” and the translated evidence tagline.

- [ ] **Step 2: Run the production-fixes suite**

Run: `npx playwright test e2e/production-fixes.spec.ts --project=desktop-chromium`

Expected: FAIL on remaining joined text or untranslated labels.

- [ ] **Step 3: Replace adjacent inline JSX fragments with complete strings**

Prefer interpolation inside one text node:

```tsx
<p>{`Measured offline across ${competitionProof.packetCount} synthetic held-out packets.`}</p>
```

Use explicit `{" "}` only where semantic markup requires separate nodes. Add count-aware singular/plural for every audited count.

- [ ] **Step 4: Translate product chrome, not source evidence**

Use `translated(language, "Lantern / First Day", "Lantern / Primer Día")` and translate safety/tagline labels. Preserve school quotes, family answers, and source excerpts verbatim.

- [ ] **Step 5: Re-run the browser suite**

Run: `npx playwright test e2e/production-fixes.spec.ts --project=desktop-chromium`

Expected: PASS with no audited joined string found.

### Task 5: Clarify fictional demo versus source-checked local pilot

**Files:**
- Modify: `app/features/first-day/ui/start-step.tsx`
- Modify: `app/features/first-day/ui/documents-step.tsx`
- Modify: `app/features/first-day/ui/case-snapshot.tsx`
- Modify: `app/privacy/page.tsx`
- Modify: `e2e/public-routes.spec.ts`

- [ ] **Step 1: Add boundary-copy assertions**

Assert that the sample says Mesa View is fictional and the live intake says Round Rock ISD public sources are used without partnership, review, or endorsement.

- [ ] **Step 2: Add the minimum clear copy**

Use this English meaning consistently: “Round Rock ISD is the source-checked local pilot. Lantern is an independent student project and is not affiliated with or endorsed by the district.” Add equivalent Spanish copy in First Day surfaces.

- [ ] **Step 3: Run route and fictional-flow tests**

Run: `npx playwright test e2e/public-routes.spec.ts e2e/first-day-fictional.spec.ts --project=desktop-chromium`

Expected: PASS without changing the underlying procedure sources.

### Task 6: Add About, Contact, and branded 404 routes

**Files:**
- Create: `app/about/page.tsx`
- Create: `app/contact/page.tsx`
- Create: `app/not-found.tsx`
- Create: `app/styles/info-pages.css`
- Modify: `app/globals.css`
- Modify: `app/components/lantern/product-header.tsx`
- Modify: `app/components/lantern/mobile-navigation.tsx`
- Modify: `app/components/lantern/site-footer.tsx`
- Modify: `e2e/public-routes.spec.ts`

- [ ] **Step 1: Extend public-route tests before creating pages**

Add `/about` and `/contact` to the 200/security/axe loop. Add a missing-path test that expects Lantern branding, “Page not found,” a Home link, and a guided-demo link.

- [ ] **Step 2: Run the route tests and confirm failure**

Run: `npx playwright test e2e/public-routes.spec.ts --project=desktop-chromium`

Expected: FAIL because About/Contact do not exist and the default 404 lacks recovery links.

- [ ] **Step 3: Build shared premium information-page styling**

Create `info-pages.css` with an editorial hero, responsive card grid, subtle amber/cobalt gradients, visible focus states, and reduced-motion-safe enhancement. Import it from `globals.css`.

- [ ] **Step 4: Build the About page**

Include Isaac’s builder identity, Congressional App Challenge context, the family problem, how evidence/event logic works, the fictional/source-checked boundary, limitations, and links to demo/source. Do not add fabricated outcomes.

- [ ] **Step 5: Build the Contact page**

Provide family, educator, and district inquiry paths. Use a readable direct contact method plus the existing GitHub repository as fallback. State that the page does not store form submissions. If no verified email exists in the repository, use the public GitHub profile/repository issue path instead of inventing an address.

- [ ] **Step 6: Build branded `not-found.tsx`**

Reuse `ProductHeader`, `SiteFooter`, and the information-page styles. Include Home and guided-demo links.

- [ ] **Step 7: Add navigation links and keep mobile CTA visible**

Add About and Contact to desktop/mobile navigation and footer. Replace the header CTA’s `hidden sm:inline-flex` behavior with a compact icon/text treatment that remains visible at 390 px without horizontal overflow.

- [ ] **Step 8: Run route, mobile navigation, and axe coverage**

Run: `npx playwright test e2e/public-routes.spec.ts --project=desktop-chromium`

Expected: PASS for all routes, 404 recovery, keyboard navigation, CTA visibility, and serious/critical axe checks.

### Task 7: Full regression and production validation

**Files:**
- Modify only files required by failures attributable to this remediation pass.

- [ ] **Step 1: Run lint and unit tests**

Run: `npm run lint && npm test`

Expected: both commands exit 0.

- [ ] **Step 2: Run targeted browser suites**

Run: `npx playwright test e2e/public-routes.spec.ts e2e/first-day-fictional.spec.ts e2e/production-fixes.spec.ts e2e/print-export.spec.ts --project=desktop-chromium`

Expected: all targeted tests pass.

- [ ] **Step 3: Run the production build**

Run: `npm run build`

Expected: production build exits 0 and lists `/about`, `/contact`, and the not-found route.

- [ ] **Step 4: Review the final diff and preserve unrelated work**

Run: `git diff --check && git status --short && git diff --stat`

Expected: no whitespace errors; pre-existing production-hardening changes remain present and un-reverted.

- [ ] **Step 5: Update this plan’s checkboxes and report verification**

Mark only completed steps. Report commands run, any pre-existing failures, and every route/file added. Do not claim that pricing, traction, or real-user validation was completed.

