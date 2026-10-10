# Lantern: First Day — judge review and improvement plan

**Review date:** October 10, 2026

**Code reviewed:** `65103bbbd5eb2ce93b097ce8ca0c83bdeef2dc0e`

**Public app:** https://lantern-first-day.vercel.app/

**Judge entry:** https://lantern-first-day.vercel.app/first-day?demo=1

## What was verified

- Lint, production build, 159 unit tests, and the 20-packet synthetic evaluation passed.
- Playwright passed 85 browser checks across mobile and desktop Chromium; seven platform-specific checks were intentionally skipped. The suite covers the six-beat fictional case, source evidence, conflict resolution, Decision Trace, Spanish copy, keyboard access, exports, print, and controlled live-intake failures.
- Lighthouse passed its configured thresholds in six runs. Home performance scored 94–95, First Day 93–95, accessibility 100 on both routes, and cumulative layout shift was 0. Largest contentful paint was roughly 2.7–3.2 seconds in the local runs.
- The public home and judge URLs returned HTTP 200. `/api/health` reported the exact local commit, `judgeDemo: true`, and `liveDocumentReading: true`. Synthetic production requests returned valid First Day and general Explain contracts in 3,946 ms and 3,424 ms, respectively. These check availability and response shape; they do not establish real-document accuracy.
- No participant usability sessions have been recorded. The evaluation uses synthetic packets, and its perfect counts must be described as regression results rather than field accuracy.

No reproducible application defect appeared in this run. Submission records did contain stale deployment and provider-status claims; those were corrected in the checklist and manifest. A 600×800 JPEG cover image was captured from the public app at `docs/submission/cover-photo.jpg`.

## A judge's view

The [2026 rules](https://www.congressionalappchallenge.us/wp-content/uploads/2026/05/2026-CAC-Rules.pdf) name idea quality, implementation including user experience, and demonstrated coding skill as judging dimensions. The [sample rubric](https://www.congressionalappchallenge.us/wp-content/uploads/2023/11/Sample-CAC-Judging-Rubric.pdf) additionally makes the video, impact explanation, functionality, code explanation, and interface easy to inspect. Each congressional office may use a different process, so this is an appraisal rather than a predicted score.

| Dimension | Current evidence | Judge-facing risk |
| --- | --- | --- |
| Idea and need | A concrete newcomer-family enrollment problem, with source-linked facts and visible uncertainty. | Impact is plausible but not supported by participant observations yet. Say what the app enables, not what families have already achieved. |
| Function and design | The fictional case is complete, works without an account or provider key, and is polished on mobile and desktop. | The full six-beat demo contains a lot of text. A judge may see only the three-minute video, so its first 30 seconds must show the problem and result clearly. |
| Coding skill | Exact-quote validation, typed events, deterministic dependency evaluation, Decision Trace, bounded upload flow, and extensive automated checks are substantive engineering work. | The video must show and explain one specific code decision in plain language; a list of tools or test counts alone is weaker proof. |
| Credibility | The demo is explicitly fictional, and AI use, reused code, limits, and privacy boundaries are documented. | Do not imply school endorsement, real-family validation, or that synthetic 100% metrics predict live accuracy. |
| Submission | The public app works and a cover JPEG is ready. | There is no recorded public demonstration video. The rules require a public YouTube or Vimeo video lasting 1–3 minutes; this is the decisive submission gap. |

## Ranked work plan

### 1. Complete the judge package before further feature work

**Target: October 14–18.** Record the existing 2:50 script from the verified public release. Show the conflicting cafeteria/gym quotes, the human school answer, the resulting task change, and Decision Trace. Speak to the specific programming rule that causes the state change. Upload to YouTube or Vimeo as **public**, check the URL while signed out, review captions, and save the final transcript. Use the 600×800 JPEG cover image. Adapt the written answers to the official form limits and keep the AI/reused-code disclosure intact. Record the final commit, tag, deployment ID, video URL, and form confirmation in the manifest only once verified.

**Done when:** A stranger can watch the 1–3 minute video and open the app without an account; every required form field has a truthful answer and the accepted video matches the submitted code.

### 2. Get small, real usability evidence

**Target: October 18–21.** Run the prepared protocol with approximately five consenting adults using only the fictional case. Record where people hesitate, whether they understand the source quotes and blocker, and whether they can explain why a task becomes ready. Fix any repeated or severe confusion, then rerun the affected browser and accessibility checks. Keep the report's denominator and participant limits explicit.

**Done when:** The protocol has completed observations, a concise findings report, and verified fixes for any accepted high-severity problem. If sessions cannot be completed, retain the “Not started” disclosure.

### 3. Make the first minute easier to grasp

**Target: October 21–23, informed by step 2.** Prefer copy and pacing improvements to new features. Check whether the mobile first action is visible without searching, whether “fictional demo” is understood, and whether the difference between an AI-proposed fact and a human-confirmed fact is clear. Change only the two most repeated friction points, then update the demo script and screenshots if the UI changed.

**Done when:** A first-time tester can describe the problem, the source check, and the next action after a short unguided look; the existing keyboard, Spanish, print, and export journeys still pass.

### 4. Tighten performance without delaying submission

**Target: after the judge package and usability fixes.** Profile the largest contentful paint on Home and First Day. Reduce the initial image/font/CSS or client work that the profile identifies, if a change is safe. Aim for a repeatable LCP below 2.5 seconds on the same local Lighthouse setup while preserving the current zero layout shift and 95+ accessibility threshold. Avoid a broad visual redesign before the deadline.

**Done when:** Three-run median performance remains at least 90, accessibility at least 95, CLS at most 0.1, and the measured bottleneck improves. Record the actual numbers rather than an assumed speedup.

### 5. Preserve release and claim alignment

**Target: October 23–24.** Re-run lint, unit tests, evaluation, build, browser suite, and Lighthouse on the final commit. Verify the public health version and the fictional journey after deployment; run a synthetic live-provider smoke check if live reading is still advertised. Update the manifest and form text to that exact release. Do not substitute the current screenshot, tests, or video for a later changed build without rechecking them.

**Done when:** Code, deployment, video, cover image, answers, and public links all refer to one verified release, with the form submitted before the official October 26 deadline.

## Next version, after the competition

Use actual family and school-staff feedback to choose the next district procedure set. Add a documented process for reviewing source changes, evaluate live extraction on consented or carefully synthetic multilingual packets, and improve assistive-technology testing. Expand scope only where fresh sources and user evidence support it.

## Implementation started on October 10

- The First Day opening now names a fictional case on its primary action and says that suggested facts require source review and human confirmation. At 390×844, that action ends at pixel 676, leaving the disclosure visible in the first viewport.
- The global Geist Mono preload was removed because the mono face is used later in the flow. In the same local Lighthouse setup, Home performance was 96–97 and First Day 95; accessibility stayed 100 and layout shift 0. First Day LCP remained about 3.0 seconds, so the 2.5-second target is still open.
- Lint, build, 159 unit tests, and 85 browser checks passed locally after the opening change. macOS visual baselines were refreshed. The four Linux opening-screen baselines were regenerated from CI's actual captures; [CI then passed](https://github.com/isaacgong0311-hash/Congressional-App-Challenge-/actions/runs/38070837522) on commit `7ac8adbf04c9cb4c52d3b416bbde0a1cc8c4c1eb`.
- A repeatable silent screen rehearsal was recorded from the local candidate. It lasts 2:33 and follows the real six-beat app path without a provider request. Narration, captions, transcript, and public upload remain open.
