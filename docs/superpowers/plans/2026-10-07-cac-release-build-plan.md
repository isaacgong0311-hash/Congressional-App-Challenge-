# Lantern Congressional App Challenge Release Build Plan

**Goal:** Submit a working, source-backed Lantern: First Day entry by October 24, 2026, with the public app, video, written answers, and evidence all describing the same release.

**Architecture:** Keep the fictional six-beat judge path provider-free. Finish export and production checks, record bounded usability evidence, then freeze one commit for deployment and recording. The live Round Rock ISD example remains a separately labeled student pilot.

**Tech stack:** Next.js 16, React 19, TypeScript, Vitest, Playwright, Vercel, Markdown.

**Rules:** The [2026 CAC rules](https://www.congressionalappchallenge.us/wp-content/uploads/2026/05/2026-CAC-Rules.pdf) set the registration and submission deadline at **October 26, noon EDT (11 a.m. CDT)**. They require a functional app, full AI-use disclosure, and a public YouTube or Vimeo video lasting 1–3 minutes that names the participant and app, states the purpose and audience, identifies tools and languages, and shows functionality. The October 24 target is our internal buffer.

---

## Fresh scan — October 7

- Clean starting checkout: `46605a4a38a8770f9a9902845ce283d1a9a3e25d` on `codex/frontend-overhaul`.
- `npm run lint`, `npm test` (153 passing tests), `npm run evaluate:first-day` (20 synthetic packets), and the production-build `npm run test:e2e` (79 passed, 7 intentional skips) passed before this plan's focused export-test addition.
- The guided browser test already covers zero `/api/*` calls, fact review, preserved conflict, the school answer, Decision Trace, Spanish copy, and reset on mobile and desktop. Calendar download and Letter/A4 print generation are also covered.
- The release manifest still identifies an older local gate and no current Decision Trace deployment. No final tag, accepted video, captions, transcript, form confirmation, or adult usability sessions are recorded. Do not infer their existence from older deployment entries.
- The browser suite lacked inspection of the downloaded technical JSON and printed unresolved/source details. `e2e/print-export.spec.ts` now covers that gap; its focused run passed on mobile and desktop (3 passed, 1 desktop-only print check intentionally skipped on mobile).

## File map

- `e2e/first-day-fictional.spec.ts`, `e2e/print-export.spec.ts`, `e2e/public-routes.spec.ts`: judge journey, export, and public-route gates.
- `evaluation/usability/protocol.md`, `evaluation/usability/sessions.json`, `evaluation/usability/report.md`: consenting-adult study materials and honest results.
- `docs/submission/submission-manifest.md`, `checklist.md`, `demo-script.md`, `video-production-checklist.md`, `written-answers.md`, `ai-disclosure.md`: release identity and submission assets.
- `README.md`, `docs/submission/decision-trace-code-tour.md`, `backend-code-tour.md`: judge quick start and technical authorship explanation.

## Task 1 — Finish the local release gate (October 7–10)

- [x] Run `npx playwright test e2e/print-export.spec.ts`. The actual JSON download retains the open orientation conflict and source references without extracted page text; the print view shows the unresolved item and evidence IDs.
- [x] Run `npm run lint`, `npm test`, `npm run evaluate:first-day`, and `npm run test:e2e` after the export regression. Result: lint clean, 153 unit tests passed, 20 synthetic packets evaluated, 81 browser tests passed, and 7 intentional browser skips.
- [ ] Check the six-beat demo at 390 px and 1440 px with keyboard and reduced motion. Use `e2e/first-day-fictional.spec.ts` and `e2e/public-routes.spec.ts` as the repeatable gate; record any manual finding in `docs/development-log.md`.
- [ ] Update `docs/submission/submission-manifest.md` with the exact tested commit, commands, date, and browsers. Keep deployment marked unverified until the public URL is checked from a signed-out session.

## Task 2 — Collect bounded community evidence (October 8–14)

- [ ] Use `evaluation/usability/protocol.md` with approximately five consenting adults and only the fictional case. Record anonymous task outcomes in `evaluation/usability/sessions.json`; keep identifying information out of the repository.
- [ ] Run `npm run evaluate:usability` and review `evaluation/usability/report.md` for correct participant/task denominators, failures, and limits. If sessions do not happen, retain “Not started” and remove any suggestion of observed family validation from the final pitch.
- [ ] Fix only repeated or severe observed confusion. For each accepted change, name its observed cause in `docs/development-log.md`, rerun the affected browser journey, and update the script if the visible flow changes.

## Task 3 — Freeze and verify one public release (October 15–19)

- [ ] Complete the local gate again on the chosen commit. Check the AI/reused-code disclosure, fictional/district labels, exact source claims, accessibility, print, JSON, ICS, and health behavior.
- [ ] Deploy the chosen commit. From a signed-out browser, verify `/`, `/first-day?demo=1`, `/first-day/how-it-works`, `/privacy`, an unknown route, and all three export actions. Check the deployment SHA or ID against the chosen commit.
- [ ] Record the public URL, deployment ID, commit SHA, verification date, and provider capability in `docs/submission/submission-manifest.md`. Only then create an annotated submission tag for that exact commit.

## Task 4 — Produce the matched submission package (October 19–24)

- [ ] Rehearse `docs/submission/demo-script.md` on the verified public release. Record an accepted 1–3 minute take with the participant, app, purpose, audience, tools/languages, and working transitions stated clearly.
- [ ] Produce captions and transcript from the accepted take. Publish the video publicly on YouTube or Vimeo and verify playback while signed out. Record its URL, duration, and asset paths in the manifest.
- [ ] Open the official application, confirm registration/eligibility and its live answer limits, then adapt `docs/submission/written-answers.md` and `ai-disclosure.md` without changing evidence claims. Keep addresses and guardian details in the application, not the repository.
- [ ] Cross-check one commit/tag, deployed app, video, transcript, written answers, synthetic evaluation, and usability status. Submit by October 24 and record the actual confirmation only after it arrives.

## Stop conditions

Do not call the release submission-ready while the public deployment, public video, or official form confirmation is missing. Do not present synthetic evaluation as real-world accuracy or an unrun study as participant evidence. A provider outage must not block the fictional demo.
