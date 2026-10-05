# Lantern CAC Final Sprint Implementation Plan

> **For agentic workers:** Execute this plan task by task in the current checkout. Steps use checkbox (`- [ ]`) syntax for tracking; mark a step complete only after its stated evidence exists.

**Goal:** Submit a trustworthy, working Lantern: First Day entry to the 2026 Congressional App Challenge by the internal October 24 target, ahead of the official October 26, 12:00 p.m. EDT deadline.

**Architecture:** Freeze new product features for the competition path. Stabilize the provider-free fictional journey and its exports, record honest validation, then align one tested commit, public deployment, video, captions, transcript, written answers, and submission confirmation. Keep live document reading secondary; a provider outage must never block the judge demo.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Vitest, Playwright, Vercel, Markdown.

**Rules:** [2026 official rules](https://www.congressionalappchallenge.us/wp-content/uploads/2026/05/2026-CAC-Rules.pdf) require a functional app and a **public** YouTube or Vimeo demonstration lasting 1–3 minutes. The video must name the participant and app, explain purpose and audience, identify tools and languages, and show functionality. Registration and submission close October 26, 2026 at 12:00 p.m. EDT.

---

## File map

- `app/features/first-day/domain/`, `app/features/first-day/ui/`, and `app/features/first-day/export/`: factual state, judge narration, controls, and downloads.
- `app/features/letter-tool/` and `app/api/explain/route.ts`: secondary letter reading and its recoverable output paths.
- `tests/first-day/`, `tests/letter-tool/`, `e2e/`: repeatable correctness and browser gates.
- `evaluation/usability/`: fictional adult-study protocol, anonymous observations, and denominator-safe report.
- `docs/submission/checklist.md`, `submission-manifest.md`, `demo-script.md`, `video-production-checklist.md`, and `written-answers.md`: release and submission records.

## Task 1: Lock the judge path and audited UI

**Files:** `app/features/first-day/`, `app/features/letter-tool/`, `e2e/production-fixes.spec.ts`, `e2e/letter-tool.spec.ts`, `tests/first-day/`, `tests/letter-tool/`.

- [x] Repair fact-review state, narrator counts, duplicate headings, spacing, mobile navigation, branded 404, three export actions, Spanish chrome, and independent public-source labeling. The current checkout contains these fixes; verification and commit are still required.
- [x] Add a browser regression for both answers to the fictional interpreter question. After choosing Yes or No, the card must no longer say “Not answered yet,” the pending count must be zero after both family questions, and the next beat must unlock. `e2e/production-fixes.spec.ts` covers both branches.
- [x] Run `npm run lint`, `npm test`, `npm run evaluate:first-day`, `npm run build`, `npm run test:e2e`, and `git diff --check`. The 2026-10-04 gate passed: 153 unit tests, 79 browser tests, 7 intentional browser skips, and the 20-packet synthetic evaluation; details are in `docs/development-log.md`.
- [x] Commit the verified audit changes and this plan. Exclude `.env.local`, generated output, secrets, and real family documents.

## Task 2: Validate the real judge rehearsal

**Files:** `e2e/first-day-fictional.spec.ts`, `e2e/production-fixes.spec.ts`, `docs/submission/checklist.md`, `docs/submission/submission-manifest.md`.

- [ ] Run the six-beat journey on the production build at mobile and desktop sizes. Assert zero `/api/*` calls during the fictional journey, accurate beat and step labels, preserved orientation conflict, one-task focused update, Decision Trace, Spanish export, and reset.
- [ ] Open the print layout, JSON download, and ICS download in browsers. Check actual files for unresolved items, source references, confirmed dates only, and valid calendar structure.
- [ ] Record the tested commit, commands, browsers, and any remaining failures in the manifest. Never reuse a prior deployment identity as evidence for this commit.

## Task 3: Gather honest community evidence

**Files:** `evaluation/usability/protocol.md`, `evaluation/usability/report.md`, `docs/submission/checklist.md`, `docs/submission/written-answers.md`.

- [ ] Recruit approximately five consenting adults and use fictional documents only. Follow the prepared protocol; record anonymous task outcomes, conflict and source-finding success, elapsed time, confidence, and confusion.
- [ ] Generate the report with explicit participant and task denominators. Describe failures and limits. If sessions cannot be completed, retain the “Not started” state and do not claim family validation.
- [ ] Fix only repeated or severe observed usability problems; rerun the relevant browser path after each fix.

## Task 4: Select and verify one release

**Files:** `docs/submission/checklist.md`, `docs/submission/submission-manifest.md`, `docs/development-log.md`.

- [ ] Build and test the intended release commit. Check accessibility on judge-critical screens, keyboard navigation, responsive layouts, and the provider-free path.
- [ ] Deploy that exact commit to the public URL. Verify `/`, `/first-day?demo=1`, `/first-day/how-it-works`, `/privacy`, the 404 recovery route, exports, and health reporting from a signed-out browser.
- [ ] Record the commit SHA and deployment ID. After verification, create an annotated submission tag pointing to that exact commit; keep the manifest aligned.

## Task 5: Produce and submit the CAC package

**Files:** `docs/submission/demo-script.md`, `video-production-checklist.md`, `written-answers.md`, `submission-manifest.md`, `checklist.md`.

- [ ] Rehearse the 2:45–2:55 script against the verified deployment. The accepted video must show real state transitions and include every official required field.
- [ ] Record and publish the accepted take as a **public** YouTube or Vimeo video. Verify the link signed out, then prepare accurate captions and a transcript from that take.
- [ ] Check official form field limits in the live application and adapt the drafted written answers without inflating evaluation or partnership claims.
- [ ] Submit before the internal October 24 target and save the official confirmation. Update the manifest with exact video, caption, transcript, tag, deployment, and confirmation evidence only after each exists.

## First execution checkpoint

This run begins Task 1: add the two-answer fact-review regression, correct the video visibility instruction, run the local gates, and commit the verified workspace. Human study sessions, recording, publication, and final form submission remain later gates with their own evidence.
