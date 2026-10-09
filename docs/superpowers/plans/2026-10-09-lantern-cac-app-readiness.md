# Lantern CAC App Readiness Implementation Plan

> **For agentic workers:** Implement this plan inline in the current checkout. Steps use checkbox (`- [x]`) syntax for tracking. Preserve the already uncommitted dependency patch from the preceding app session.

**Goal:** Strengthen Lantern's functioning app, user experience, and code proof against the 2026 Congressional App Challenge criteria.

**Architecture:** Preserve the deterministic fictional judge journey and current UI. Add pure validation at the server boundary, keep independent client checks, and improve live-case recovery in existing components. Verify each layer with synthetic fixtures and the complete local release gate.

**Tech Stack:** Next.js 16.4, React 19, TypeScript, Zod, Vitest, Playwright, axe-core, Lighthouse.

**Design:** [CAC app readiness design](../specs/2026-10-09-lantern-cac-app-readiness-design.md).

---

## Criteria and existing baseline

| CAC review area | Existing evidence | Work in this plan |
| --- | --- | --- |
| Quality and originality of idea | A source-linked bilingual enrollment planner preserves contradictory instructions and exposes a deterministic Decision Trace. | Keep the narrative focused; avoid speculative district claims. |
| Functionality | The fictional six-beat journey works without provider access and exports printable, JSON, and calendar outputs. | Recheck every transition and export after changes. |
| Implementation, UX, and design | Responsive editorial UI, keyboard navigation, English and Spanish copy, reduced motion, contrast controls, axe and Lighthouse gates. | Add in-place recovery and honest empty results for the live route. |
| Coding skill | Runtime schemas, exact evidence, append-only events, dependency planner, focused tests, and an explainable server boundary. | Move quote and image integrity checks earlier into the API and test them. |
| AI transparency and rights | Existing disclosure and independent district labels. | Preserve the AI proposal versus human confirmation boundary and the independent-public-source wording. |

The official [2026 CAC rulebook](https://www.congressionalappchallenge.us/wp-content/uploads/2026/05/2026-CAC-Rules.pdf) identifies idea quality, implementation/UX, and coding excellence as judging criteria. Product work here cannot replace the required student registration, video, or submission steps.

## App inventory and acceptance map

This inventory records what the build must preserve, so a change that passes a small unit test but damages the product is still treated as a failure.

| Surface | User job | Existing implementation | Acceptance evidence |
| --- | --- | --- | --- |
| `/` | Understand the problem, the source-backed method, and how to open a working demo. | Server-rendered editorial landing page and fictional plan specimen. | Public-route axe scan, four-width visual screenshots, Lighthouse. |
| `/first-day?demo=1` | Move through six story beats without an account or API key. | Fictional case, family questions, conflict, school-reported answer, Decision Trace, export. | Zero `/api/*` browser assertion and full mobile/desktop guided journey. |
| `/first-day` Start | Choose the fictional sample or optional public-source route with accurate provider availability. | Health capability check, independent-example label, bilingual controls. | New retry-without-reload test and existing unavailable-state test. |
| `/first-day` Documents | Add at most five bounded pages; see independent success and errors. | Sequential queue, per-page retry/removal, status cards. | Partial-success browser journey, empty-file test, zero-fact browser journey. |
| `/first-day` Facts | Compare proposals with the exact quote and decide what to confirm. | Evidence IDs, source sheet, append-only events. | Fact-review and keyboard tests; route quote rejection. |
| `/first-day` Plan | See ready, waiting, review, and blocked states. | Pure dependency planner and versioned procedures. | Unit tests plus guided and mocked-live journeys. |
| `/first-day` Resolve | Preserve contradictory source statements and record a reported answer. | Conflict state and school-confirmation event. | Guided journey and Decision Trace tests. |
| `/first-day` Export | Carry a readable plan with accurate evidence and dates. | Print/PDF, technical JSON, ICS. | Download content, print-layout, and calendar browser tests. |
| `/explain` | Understand an unrelated official letter safely. | Provider-backed reading with retry and error handling. | Mocked provider errors, Spanish actions, and public-route checks. |
| `/privacy` and `/first-day/how-it-works` | Understand data handling and who decides what. | Public server-rendered explanations. | Public-route checks and copy review. |

### Non-negotiable product invariants

1. The fictional case sends no provider request and remains complete when no key exists.
2. Model output cannot directly create plan tasks, decide a conflict, confirm a fact, or bypass exact-source evidence.
3. A failed or removed live page cannot erase another page's successful extraction.
4. Uploaded content, extracted text, facts, and events stay out of browser persistence and server logs.
5. The local Round Rock ISD example is never described as a district partnership, reviewed pilot, or district-endorsed policy.
6. Dates enter calendar output only when complete, unambiguous, and confirmed.
7. Interactive content and status text remain usable without animation; keyboard and reduced-motion paths still work.
8. Synthetic evaluation denominators remain labeled synthetic, and provider latency and cost remain unmeasured in the offline replay.

### Contract examples for the new behavior

The server-side evidence check uses the same whitespace normalization as the client-side evidence check. It accepts the first pair and rejects the second:

```ts
quoteAppearsInSource(
  "Bring a birth certificate\n  to the school office.",
  "Bring a birth certificate to the school office.",
); // true
quoteAppearsInSource("Bring a birth certificate.", "Bring a passport."); // false
```

The route checks the signature against the declared MIME type before the provider receives bytes:

```ts
const jpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xd9]);
matchesImageSignature(jpeg, "image/jpeg"); // true
matchesImageSignature(jpeg, "image/png"); // false
```

The live Start view exposes the existing health capability as three states. `checking` disables live entry and gives a status; `unavailable` leaves the fictional sample usable and offers **Check availability again**; `available` enables live entry. An older aborted response cannot overwrite a newer check.

For a valid extraction with `facts: []`, the page is **Text ready** because extraction succeeded. The Documents view explains that there is nothing to review yet, and navigation to Facts stays locked. This distinction matters: a page with no actionable facts is different from a provider failure and should not consume a retry loop automatically.

### Review of alternatives and tradeoffs

- A broad UI renovation could make the screenshots look different but would put the well-tested six-beat flow, mobile controls, and accessibility at risk. The current editorial pass already meets its local visual and Lighthouse gates.
- Adding PDF or HEIC intake would require a new conversion and privacy boundary. JPG/PNG remain an intentional, clear input contract for this release.
- Adding accounts or case persistence could help returning families but would introduce sensitive document storage. The current in-memory case and portable export support the competition demo without that risk.
- Letting the provider infer plan tasks would create more apparent functionality while weakening the project's distinctive, testable boundary. Tasks remain deterministic and source-gated.

### Failure and recovery matrix

| Condition | Expected app response | Proof |
| --- | --- | --- |
| Missing live provider key or temporary health failure | Explain unavailable state; allow fictional sample and in-place recheck. | Start browser test. |
| Empty uploaded image | Reject before creating a page; keep the page slot free. | Upload-selection unit test. |
| MIME/header mismatch | Return a safe `UNSUPPORTED_MEDIA` response before provider use. | Extraction-route unit test. |
| Provider schema error | Return `INVALID_PROVIDER_RESPONSE` without raw output. | Existing route test. |
| Well-shaped but unsupported quote | Return `INVALID_PROVIDER_RESPONSE`; do not expose it as evidence. | New pure and route tests. |
| Duplicate proposal key | Reject the page; prevent two facts sharing one generated evidence ID. | New pure test. |
| One page fails while others succeed | Keep successful pages, allow retry/removal of the failed page. | Existing live browser journey. |
| Valid page has zero facts | Show success plus an explanatory next step; keep Facts locked. | New bilingual browser journey. |
| School sources conflict | Show both quotes until a reported answer is recorded. | Guided browser journey. |
| Date is ambiguous or not confirmed | Omit it from ICS. | Calendar unit/browser tests. |

## Workstream 1 — Source integrity at the backend boundary

### Task 1: Reject mismatched image data before provider use

**Files:** `app/api/first-day/extract/route.ts`; `tests/first-day/extraction-route.test.ts`.

- [x] Add a failing route test: a JPEG-labeled file with arbitrary bytes returns `UNSUPPORTED_MEDIA` and does not call `extractPage`.
- [x] Add a failing route test: PNG-labeled JPEG bytes are rejected, while valid JPEG and PNG signatures reach the mocked provider.
- [x] Implement a small signature check for JPEG `FF D8 FF` and PNG `89 50 4E 47 0D 0A 1A 0A`. Run it before the provider call; keep size and declared MIME checks.
- [x] Run `npx vitest run tests/first-day/extraction-route.test.ts`; expect all route cases to pass.

### Task 2: Reject unsupported provider facts on the server

**Files:** `app/features/first-day/domain/evidence.ts`; create `app/features/first-day/server/validate-page.ts`; `app/api/first-day/extract/route.ts`; `tests/first-day/extraction-route.test.ts`; create `tests/first-day/validate-page.test.ts`.

- [x] Extract the existing whitespace-tolerant exact-quote predicate from `validateEvidence` so server and browser use the same rule.
- [x] Add pure tests that reject a quote absent from `originalText`, reject duplicate `clientKey` values, and accept line-wrap whitespace in an otherwise exact quote.
- [x] In the route, validate parsed provider proposals before `apiJson`; return `INVALID_PROVIDER_RESPONSE` and metadata-only issue codes for a rejection.
- [x] Add a route test confirming unsupported quotes never reach a successful API response and no document text appears in logs.
- [x] Run the focused tests; expected result: no failed cases.

## Workstream 2 — Live workflow clarity and recovery

### Task 3: Reject an empty selected file immediately

**Files:** `app/features/first-day/domain/upload-queue.ts`; `app/features/first-day/ui/use-live-case.ts`; `tests/first-day/upload-queue.test.ts`.

- [x] Add a failing selection test for a zero-byte JPEG and confirm the next valid page can still be accepted.
- [x] Add an `empty_file` rejection code and a bilingual, plain-language message.
- [x] Run `npx vitest run tests/first-day/upload-queue.test.ts`; expect the selection and queue tests to pass.

### Task 4: Explain successful pages with no proposed facts

**Files:** `app/features/first-day/ui/documents-step.tsx`; `app/features/first-day/ui/workspace-progress.tsx`; `e2e/first-day-live.spec.ts`.

- [x] Add a browser journey with a structurally valid, zero-fact extraction result. Verify the page reads successfully and the Documents screen explains that there is no fact to review yet.
- [x] Show a bilingual message when at least one page is ready but no active proposed fact exists. The message should invite a clearer sample page and explain why Continue is not offered yet.
- [x] Keep the mobile progress summary honest when the next step is locked because no fact exists.
- [x] Run the focused live browser spec; expect the zero-fact explanation and the existing partial-success journey to pass.

### Task 5: Retry availability in place

**Files:** `app/features/first-day/ui/use-provider-capability.ts`; `use-first-day-controller.ts`; `first-day-workspace.tsx`; `start-step.tsx`; `e2e/first-day-live.spec.ts`.

- [x] Add a browser journey where health initially reports unavailable and subsequently reports available after a user action. Verify the live entry button becomes enabled without a page reload.
- [x] Return a `refresh` action from the capability hook, abort superseded checks, and expose a checking state during retry.
- [x] Add a bilingual Retry availability button beside the unavailable explanation on Start. Keep the fictional sample prominent and usable during the check.
- [x] Run the focused live browser spec; expect recovery and the existing unavailable-state case to pass.

## Workstream 3 — CAC readiness and regressions

### Task 6: Preserve the judge journey and public claims

**Files:** existing `e2e/first-day-fictional.spec.ts`, `e2e/print-export.spec.ts`, `e2e/public-routes.spec.ts`, `e2e/visual-regression.spec.ts`.

- [x] Confirm the six-beat journey still performs zero `/api/*` calls and shows both conflicting sources before the school-reported answer.
- [x] Confirm the answer changes the dependent task and opens Decision Trace; reset returns to the untouched case.
- [x] Confirm Spanish plan copy, JSON source references and unresolved items, complete confirmed calendar dates, and Letter/A4 print output.
- [x] Confirm the fictional and Round Rock ISD independent-example labels still appear on public routes.

### Task 7: Verify frontend quality and backend safety

**Files:** test outputs only; this plan records results.

- [x] Run `npm run lint`, `npm test`, `npm run evaluate:first-day`, and `npm run build`; expect clean lint, passing unit tests, a report for 20 synthetic packets, and a successful production build.
- [x] Run `npm run test:e2e`; expect mobile/desktop routes, accessibility, responsive layouts, visual baselines, live mocks, and exports to pass. Investigate any unintentional skip.
- [x] Run local Lighthouse collect/assert for `/` and `/first-day`; expect median performance at least 90, accessibility at least 95, and CLS no higher than 0.1.
- [x] Run `npm audit --omit=dev --audit-level=moderate` and `git diff --check`; expect zero production advisories and no whitespace errors.

### Task 8: Review and handoff

**Files:** this plan; `docs/development-log.md`; optionally `README.md` only if app behavior changed enough to require instructions.

- [x] Review the diff for privacy leaks, unsupported partnership or accuracy claims, and accidental changes to the fictional route.
- [x] Record exact test results and any unresolved app risk here and in the development log. Distinguish synthetic verification from real participant findings.
- [x] Show the changed app files and plan in Codex for review.

## Explicit boundaries

This plan implements app code and app-facing verification. Real adult usability sessions, student eligibility, video creation, deployment promotion, and submitting the official form require separate human actions and evidence. Their absence does not justify claiming the app has been submitted or observed with families.

## Completed local result — October 9

- Backend: declared JPG/PNG uploads now require matching file signatures. Structurally valid provider output is also rejected if a fact quote is absent from the page or a proposal key repeats. The API returns the established safe error envelope, and logs contain issue codes rather than document text.
- Frontend: zero-byte files are rejected before queueing; live availability can be rechecked without reloading; zero-fact pages explain the next action in English and Spanish; locked mobile progress gives a truthful instruction.
- Existing competition path: the fictional demo, exact sources, conflict resolution, Decision Trace, Spanish copy, exports, public labels, responsive screenshots, and accessibility checks passed in the browser suite.
- Verification: lint passed; 159 unit tests passed; 20 synthetic evaluation packets completed without failure; production build passed; 85 browser tests passed with 7 intentional device skips; production audit found zero vulnerabilities; `git diff --check` passed.
- Local Lighthouse: Home performance 96/96/96; First Day 94/94/94; accessibility 100 on all six runs; cumulative layout shift 0 on all six runs. The local score is not a claim about the public deployment.
- Remaining dependency limitation: the full audit reports a development-only chain through `braces` 3.0.3. npm does not offer a compatible patch; its suggested forced fix would install a Next.js 14 ESLint config in this Next.js 16 app.
