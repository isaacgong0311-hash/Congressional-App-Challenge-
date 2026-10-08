# Lantern Editorial Renovation Implementation Plan

**Goal:** Renovate Home, First Day, and Explain into one warmer, more legible editorial product without changing case logic or the judge demo contract.

**Architecture:** Change shared presentation tokens first, then each surface in place. Keep existing component boundaries and route contracts. Use CSS transitions only after content is visible and preserve reduced-motion, high-contrast, large-text, print, and responsive modes.

**Tech stack:** Next.js 16 App Router, React 19, Tailwind CSS 4, CSS, Playwright, Vitest.

**Design:** [Approved renovation spec](../specs/2026-10-08-lantern-editorial-renovation-design.md)

---

## File map

- `app/globals.css`, `app/components/lantern/primitives.tsx`, `app/components/lantern/product-header.tsx`: shared color, type, controls, and shell.
- `app/page.tsx`, `app/styles/home.css`: landing-page hierarchy and fictional plan specimen.
- `app/features/first-day/ui/`, `app/styles/first-day.css`: guided journey, evidence, conflict, trace, and export presentation.
- `app/features/letter-tool/`, `app/styles/letter-tool.css`: intake and results hierarchy.
- `e2e/visual-regression.spec.ts`, `e2e/first-day-fictional.spec.ts`, `e2e/letter-tool.spec.ts`, `e2e/public-routes.spec.ts`: visual, keyboard, functional, and accessibility gates.

## Task 1 — Shared editorial system

- [ ] Read `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` and relevant component code before editing.
- [ ] In `app/globals.css`, refine existing canvas/surface/ink/accent tokens, text selection, focus treatment, and shared CTA motion. Keep base text and controls visible without animations.
- [ ] In `app/components/lantern/primitives.tsx` and the product header, align border, radius, hover, focus, and disabled states. Preserve button semantics and 44 px touch targets.
- [ ] Run `npm run lint` and `npx playwright test e2e/public-routes.spec.ts` after the shared pass. Expect no failures and no serious/critical axe findings.

## Task 2 — Home

- [ ] Refine `app/page.tsx` only where semantic grouping improves the reading order; retain the fictional preview and existing links.
- [ ] In `app/styles/home.css`, strengthen hero contrast and specimen hierarchy, reduce low-contrast metadata, and add restrained editorial depth to the hero, conflict, and closing sections. Keep the demo action prominent at 390 px.
- [ ] Inspect Home at 390, 768, 1024, and 1440 px. Run `npx playwright test e2e/visual-regression.spec.ts --grep 'public routes'` and review changed screenshots before accepting new baselines.

## Task 3 — First Day

- [ ] In `app/styles/first-day.css` and focused `app/features/first-day/ui/` components, clarify active step, primary action, source/evidence cards, conflict comparison, Decision Trace stages, and export actions. Preserve state labels, fictional notices, and all domain callbacks.
- [ ] Check both source statements remain peers before school confirmation, and the focused update and trace remain legible afterward.
- [ ] Run `npx playwright test e2e/first-day-fictional.spec.ts e2e/print-export.spec.ts e2e/production-fixes.spec.ts`. Expect provider-free demo, Spanish output, keyboard, reset, JSON, calendar, and print checks to pass.

## Task 4 — Explain

- [ ] In `app/styles/letter-tool.css` and focused `app/features/letter-tool/` components, make intake, meaning, urgency, and next action easier to scan. Keep the original document adjacent on desktop and reachable on mobile.
- [ ] Preserve distinct crisis/scam and provider-error states, language switching, and speech fallback.
- [ ] Run `npx playwright test e2e/letter-tool.spec.ts`. Expect all existing routes and recoveries to pass.

## Task 5 — Visual and release verification

- [ ] Run `npm run lint`, `npm test`, `npm run evaluate:first-day`, `npm run build`, and `npm run test:e2e` on the completed tree.
- [ ] Review all changed 390/768/1024/1440 screenshots, then update baselines with `npx playwright test e2e/visual-regression.spec.ts --update-snapshots` and rerun the suite. Accept only intended pixel changes; preserve no-overflow assertions.
- [ ] Run `npm run test:lighthouse` and verify the recorded Home/First Day budgets. Inspect print and reduced-motion output.
- [ ] Record changed files, checks, and any remaining risk in `docs/development-log.md` and update the CAC release plan. Commit the verified renovation without a deployment claim.
