# Frontend overhaul release record

This record tracks the cohesive Lantern frontend release on branch `codex/frontend-overhaul`.

## Product contract

- `/` leads with First Day and uses only static fictional evidence in its specimen.
- `/explain` owns the general letter workflow and retains the existing provider request/response contract.
- `/first-day` remains the six-stage evidence-first workspace.
- `/first-day?demo=1` uses only the fictional case and never enables live upload or confirms a fact automatically.
- `/first-day/how-it-works` explains AI versus deterministic ownership.
- `/privacy` explains external processing, in-memory case handling, and the single harmless preference record.

## Privacy contract

The only permitted browser persistence key is `lantern.preferences.v1`, containing:

- preferred language;
- large-text choice;
- high-contrast choice.

Do not persist document images, extracted text, evidence, facts, conflicts, task state, event history, or portable case data in local storage, session storage, or IndexedDB.

## Automated release gates

- TypeScript production build.
- ESLint.
- Unit and evaluation suites.
- Playwright fictional and mocked-live workflows on mobile and desktop Chromium.
- General-letter malformed response, retry, RTL preference, and speech fallback checks.
- WCAG A/AA axe scans on public routes and critical workflow states.
- Forty visual baselines covering 10 critical screens at 390, 768, 1024, and 1440 pixels with a 1% maximum pixel-difference threshold.
- Horizontal-overflow checks at all four widths.
- Letter and A4 PDF rendering with interactive controls removed and technical source details retained.
- Layout shift, load time, and transferred-resource budget checks on `/` and `/first-day`.
- Three-run Lighthouse CI medians of at least 90 performance and 95 accessibility on `/` and `/first-day`.
- Production dependency audit with zero known findings.

The local release run recorded a 96 performance median for `/`, a 93 performance median for `/first-day`, 100 accessibility for both routes, and zero measured cumulative layout shift across all six Lighthouse runs.

## Manual checks required before production promotion

- Complete the preview flow in English and Spanish.
- Confirm the live-provider unavailable state is accurate for the target environment.
- Inspect Safari and Chromium on physical devices.
- Run five synthetic usability sessions covering demo discovery, source inspection, fact review, blocker explanation/resolution, and export.
- Record preview and production deployment URLs and IDs in `docs/submission/checklist.md`.
