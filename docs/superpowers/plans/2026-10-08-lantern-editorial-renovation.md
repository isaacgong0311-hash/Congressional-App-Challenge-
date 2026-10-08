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

- [x] Read `node_modules/next/dist/docs/01-app/01-getting-started/11-css.md` and relevant component code before editing.
- [x] In `app/globals.css`, refine existing canvas/surface/ink/accent tokens, text selection, focus treatment, and shared CTA motion. Keep base text and controls visible without animations.
- [x] In `app/components/lantern/primitives.tsx` and the product header, align border, radius, hover, focus, and disabled states. Preserve button semantics and 44 px touch targets.
- [x] Run `npm run lint` and `npx playwright test e2e/public-routes.spec.ts` after the shared pass. Both passed, with no serious/critical axe findings.

## Task 2 — Home

- [x] Retain `app/page.tsx`'s existing semantic reading order, fictional preview, and links; no markup change was needed.
- [x] In `app/styles/home.css`, strengthen hero contrast and specimen hierarchy, reduce low-contrast metadata, and add restrained editorial depth to the hero, conflict, and closing sections. The demo action remains prominent at 390 px.
- [x] Inspect Home at 390, 768, 1024, and 1440 px. The full visual regression suite passed locally after reviewing and refreshing macOS screenshots.

## Task 3 — First Day

- [x] Refine First Day surfaces in `app/styles/first-day.css`; replace an internal document version label with plain-language page metadata in `documents-step.tsx`. State labels, notices, callbacks, and exports remain intact.
- [x] Check both source statements remain peers before school confirmation, and the focused update and trace remain legible afterward in the refreshed screenshots and browser journey.
- [x] Run the focused First Day and export Playwright tests. Provider-free demo, Spanish output, keyboard, reset, JSON, calendar, and print checks passed.

## Task 4 — Explain

- [x] In `app/styles/letter-tool.css` and the intake component, sharpen the three-stage result hierarchy and warm the upload surface. The original document remains adjacent on desktop and reachable on mobile.
- [x] Preserve distinct crisis/scam and provider-error states, language switching, and speech fallback. Translate the existing header privacy badge for Spanish.
- [x] Run the focused Explain Playwright tests. Existing routes and recoveries passed.

## Task 5 — Visual and release verification

- [x] Run `npm run lint`, `npm test`, `npm run evaluate:first-day`, a production build, and `npm run test:e2e`. Result: lint clean, 153 unit tests passed, 20 synthetic packets evaluated, 81 browser tests passed, 7 intentional skips. The added 1024 px navigation test passed separately on both browser projects.
- [x] Review changed 390/768/1024/1440 screenshots and refresh macOS and Linux baselines. The Linux baseline generation run passed; representative desktop and mobile screenshots were inspected.
- [x] Run local Lighthouse collect/assert without publishing reports. Home performance was 95–98, First Day was 92 in all three runs, accessibility was 100 for both, and CLS was 0. Print and reduced-motion browser checks passed.
- [x] Record changed files, checks, and remaining release work in `docs/development-log.md`, the submission manifest, and the CAC release plan. The renovation is committed without a deployment claim.
