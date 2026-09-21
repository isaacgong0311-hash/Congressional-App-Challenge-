# Lantern: First Day development log

This log records reused source, libraries, implementation decisions, and AI assistance for the Congressional App Challenge disclosure trail.

## Source foundation

- New project repository: `isaacgong0311-hash/Congressional-App-Challenge-`
- Imported application: `isaacgong0311-hash/TRANSLATEtheform`
- Imported revision: `479ff86a30890c76a4ec0240406e66d9de4aa6ce`
- Import commit in this repository: `f4d4855`
- Reused behavior: general letter explanation UI, image explanation API, grounded assistant, reply translation, speech fallback, resource finder, calendar/print helpers, accessibility preferences, and curated help resources.

## Libraries and services

- Next.js 16, React 19, TypeScript, Tailwind CSS, Zod, and Vitest are open-source dependencies.
- Groq is used by the existing app for image explanation, assistant responses, and field translation when a user configures a key.
- ElevenLabs and Perplexity integrations are optional. Their features fail independently when keys are absent.
- First Day's case records, evidence checks, conflict example, and plan-state algorithm run locally without an AI request.

Provider pricing and retention terms are external and may change. The project does not claim that every provider-backed request is permanently free or that external processors retain nothing.

## 2026-09-15 — Design and baseline

- Converted the supplied Lantern: First Day build plan into a repository design and focused foundation implementation plan.
- Inspected the live source repository and pinned the exact starting revision.
- Imported the existing application without its Git metadata, preserving this repository's independent history.
- Audited routes, provider boundaries, request limits, logging, browser storage, and the lack of a database or test runner.
- Recorded the imported lint error, deprecated middleware convention, build behavior, and dependency advisories before changing behavior.

## 2026-09-15 — Deterministic domain foundation

- Added stable records for documents, evidence, facts, fictional procedures, tasks, conflicts, and user events.
- Created a clearly labeled fictional Mesa View Community Schools case. Mesa View, its documents, policies, people, dates, and confirmations are invented for demonstration.
- Added exact-quote validation that rejects absent passages and unsupported references.
- Added a deterministic planner with all-of and any-of dependencies, unknown-state preservation, task completion events, source-removal review, invalid-reference reporting, and cycle detection.
- Added immutable event helpers so corrections and completions append history rather than overwriting source records.
- Added 18 domain tests. No AI call is needed to pass them.

## 2026-09-15 — First Day interface

- Added `/first-day` as an isolated App Router route while preserving `/` as the general Lantern tool.
- Built six navigable screens: Start, Documents, Review facts, My plan, Resolve a blocker, and Take it with me.
- Added exact-source dialogs, English/Spanish interface copy, derived plan groups, fictional conflict resolution, task completion, high contrast, large text, reduced-motion-safe transitions, and printable output.
- Added a First Day entry point to the original Lantern home page.
- Corrected overbroad home-page privacy phrases from “nothing stored” to wording that distinguishes application storage from external processing.
- Fixed the imported React lint error and migrated the rate limiter from `middleware.ts` to `proxy.ts` for Next.js 16.

## 2026-09-16 — Acceptance pass

- Added a trapped, localized evidence dialog with focus restoration and removed its background content from the accessibility tree while open.
- Exposed text-size and contrast controls on mobile, labeled icon-only controls, and improved secondary-text contrast.
- Verified the workflow at desktop and mobile sizes, including Spanish copy, conflict resolution, dependent task unlocking, focus behavior, reduced-motion rendering, and a WCAG A/AA automated audit with zero violations.

## 2026-09-16 — Multi-document intake

- Added a live First Day intake path for up to five JPG/PNG pages, limited to 10 MB per page and 25 MB per in-memory case.
- Reused the existing `/api/explain` endpoint through a small adapter that retains the original extracted text and a stable document ID without changing the general Lantern response contract.
- Added a sequential client queue with per-page progress, retry, removal, request cancellation, and request-token checks so a late response cannot restore a removed page.
- Kept downstream fact review and planning disabled for live cases until source-backed fact proposals are implemented; the complete fictional case remains available for the end-to-end workflow.
- Added seven tests for selection limits, sequential processing, retry isolation, late-response handling, and explanation-response adaptation.

## 2026-09-19 — Round Rock ISD source-checked pilot

- Added two narrow enrollment procedures using the official Round Rock ISD [enrollment overview](https://www.roundrockisd.org/page/enroll) and cross-checked the district's [How to Register](https://www.roundrockisd.org/page/how-to-register) page.
- The stored records cover only the district-wide document list and the three-step online enrollment sequence. They do not treat campus flyers, inferred requirements, or model output as district policy.
- The quotations and links were checked against the official pages on 2026-09-19; the versioned procedure snapshot remains `rrisd-enrollment-2026-09-16` as specified in the approved implementation plan.
- `source_checked` means the text matched the published district page. It does not mean Round Rock ISD reviewed, approved, endorsed, or partnered with Lantern.
- Procedure checks expire after 180 days in the deterministic planner layer. Pending or stale procedures cannot independently make a live task ready.

## 2026-09-19 — Grounded live planning and portable results

- Added a dedicated `/api/first-day/extract` contract that returns provider proposals only after strict schema validation. Exact quotes must appear in the correct extracted page text before facts enter the case.
- Added fact-by-fact family review, append-only confirmations/corrections, cross-document conflict detection, school-reported resolution events, and five explicit live task families.
- Added structured JSON downloads that exclude images and extracted page text, plus stable all-day calendar events for confirmed, complete dates only.
- Verified Letter and A4 print layouts, responsive export behavior, and automated WCAG A/AA scans. A contrast issue found during the export scan was corrected before commit.

## 2026-09-20 — Competition proof and release preparation

- Added 20 synthetic held-out packets and separately authored expectations across straightforward enrollment, ambiguous dates, conflicting locations, documented alternatives, and follow-up corrections.
- The initial deterministic report records 32/32 fact precision and recall, 32/32 exact-quote coverage, 8/8 intended conflicts with zero false positives, 0/8 date-normalization errors, and 34/34 ready tasks with source coverage. Provider latency and cost are explicitly not measured.
- Added Playwright mobile and desktop journeys for the complete fictional case and a mocked live path covering partial success, retry, source removal, late-response rejection, and missing-provider recovery without exposing a provider key.
- Added a public technical explanation, free GitHub Actions CI, and browser security headers on all routes. The headers reduce browser attack surface but do not replace input validation, evidence checks, or provider privacy controls.
- Applied Next.js App Router guidance to keep the explanation page static and server-rendered, and React review guidance to keep shared task localization outside the export and plan components.

## 2026-09-20 — Cohesive flagship frontend overhaul

- Made First Day the server-rendered flagship homepage, moved the original letter workflow to `/explain`, and added shared product navigation, a dedicated privacy page, and a cohesive editorial civic visual system.
- Rebuilt the First Day shell around a typed controller, desktop progress rail, compact tablet summary, mobile progress disclosure, persistent case snapshot, safe-area action dock, and source sheet with trapped focus and trigger restoration.
- Added guided fictional-demo cues, deterministic task presentation priority and filters, exact evidence beside each fact and plan step, comparison-focused conflict resolution, family-readable exports, and append-only task-completion reversal.
- Kept task undo fully derived: a reversal appends history, only the latest effective completion may be reversed, and the portable JSON retains both events while presenting the task's current effective state.
- Consolidated persisted settings into `lantern.preferences.v1`. Only language, large-text, and high-contrast preferences are stored; documents, images, extracted text, facts, tasks, and event history remain memory-only.
- Added runtime guarding for malformed letter-tool responses, a recoverable retry state, browser speech fallback coverage, RTL direction updates, and deferred loading for the optional practice assistant.
- Added visual regression baselines for 10 critical states at 390, 768, 1024, and 1440 pixels with a 1% threshold, plus horizontal-overflow checks, Letter/A4 PDF checks, accessibility scans, layout-shift/transfer gates, and privacy-storage coverage.

## AI assistance disclosure

OpenAI Codex assisted with:

- repository inspection and source mapping;
- design and implementation-plan drafting;
- TypeScript domain and test implementation;
- React component and CSS implementation;
- debugging compiler, lint, and dependency-version issues;
- documentation drafting.

Runtime AI behavior is separate from development assistance. Groq is used only when a configured runtime feature sends a request; the fictional workflow, planner, exports, evaluation, and automated browser journeys do not require a provider call.

The student is responsible for reviewing, understanding, testing, adapting, and presenting the submitted work. Before submission, the student should be able to explain the evidence model, why unknown does not equal false, how all-of/any-of dependencies work, how a source removal affects completed tasks, and why simulated call responses cannot confirm real facts.
