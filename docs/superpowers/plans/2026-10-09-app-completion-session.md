# Lantern App Completion Session Plan

**Goal:** Leave the app locally verified with no known production dependency advisories and no reproduced user-flow failures.

**Scope:** App code, dependencies, automated checks, and app-facing documentation. Submission writing, participant research, video, deployment, and form work are outside this session.

**Starting point:** `825b7fc` on `codex/frontend-overhaul`; the checkout was clean. Lint, 153 unit tests, 20 synthetic evaluation packets, the production build, and 83 browser tests passed. Seven browser tests were intentionally skipped by device configuration. The production dependency audit found advisories in Next.js, sharp, and source-map-js.

## Work plan

- [x] Inspect the current app, instructions, recent work, and test configuration.
- [x] Establish a baseline with lint, unit tests, synthetic evaluation, production build, and browser journeys.
- [x] Update the vulnerable production dependencies using compatible patched versions; inspect the lockfile diff and run the production audit again.
- [x] Rerun lint, unit tests, synthetic evaluation, production build, and browser journeys after the dependency change. No regression was found.
- [x] Review the final diff and record the exact app verification results and any remaining app limitations here.

## Verification commands

```bash
npm audit --omit=dev --audit-level=moderate
npm run lint
npm test
npm run evaluate:first-day
npm run build
npm run test:e2e
git diff --check
```

The audit should report zero production advisories, and each check should exit successfully. Browser skips are acceptable only where the test explicitly excludes a device configuration.

## Result — October 9

- Updated the minimum compatible versions of `next` and `eslint-config-next` to 16.4.0. The lockfile now resolves `sharp` 0.35.5 and `source-map-js` 1.2.2.
- `npm audit --omit=dev --audit-level=moderate`: zero vulnerabilities.
- `npm run lint`: passed. `npm test`: 153/153 passed. `npm run evaluate:first-day`: 20 synthetic packets, with no failures.
- `npm run build`: passed with Next.js 16.4.0. `npm run test:e2e`: 83 passed and 7 intentional device skips, including the fictional demo, mocked live intake, exports, accessibility, responsive layout, and visual regression.
- Local Lighthouse collect/assert: passed on all six runs. Home performance scores were 95, 91, and 93; First Day scores were 92, 90, and 92. Accessibility was 100 and cumulative layout shift was zero in every run.
- `git diff --check`: passed.

The full audit still reports five high-severity entries along one development-only chain from `eslint-config-next` through `braces` 3.0.3. That is the latest published `braces` 3.x version. npm offers a forced downgrade to ESLint config 14.x, which is incompatible with this Next.js 16 app, so the development-tool finding remains open. The production audit is clean.
