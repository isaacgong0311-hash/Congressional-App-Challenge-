# Lantern: First Day — Competition Upgrade Design

Date: 2026-09-16  
Status: Approved for implementation
Target repository: `isaacgong0311-hash/Congressional-App-Challenge-`

## Product decision

Lantern will compete as an evidence-first school-enrollment planner, not as a general translation app or a replacement enrollment portal.

Its promise is:

> Lantern turns scattered school instructions into a source-backed plan that families can inspect, correct, and trust.

The upgraded product will optimize for the three published 2026 Congressional App Challenge judging dimensions: quality and originality of the idea, implementation and user experience, and demonstrated programming skill. It must also support a clear three-minute demonstration and full disclosure of AI assistance.

The signature interaction is a complete, explainable update loop:

1. A family adds several related school documents.
2. Lantern proposes facts with exact supporting quotations.
3. Lantern detects two incompatible values for the same event.
4. The family sees both sources and receives a prepared clarification question.
5. The family records a school-reported answer.
6. Only affected tasks change; unrelated completed work stays complete.
7. The family exports a bilingual plan with sources and unresolved items.

This interaction differentiates Lantern from products that translate forms, collect registration data, or send reminders. Translation remains useful, but verifiable coordination is the central product.

## Scope and success criteria

The competition upgrade is complete when:

- a live case can move from multi-page upload through reviewed facts, conflict handling, deterministic planning, and export;
- every actionable live task references validated document evidence or a versioned procedure;
- an absent or mismatched quotation cannot enter the planner;
- AI cannot directly confirm a fact, resolve a conflict, define district policy, or set task status;
- a failed or removed page cannot corrupt successful pages or return through a late response;
- English and Spanish users can complete the critical path on a narrow mobile screen and with a keyboard;
- the deployed competition demo works without personal documents and without relying on a live AI response;
- held-out evaluation results report extraction, evidence, conflict, date, latency, and cost outcomes with denominators;
- the repository and submission materials disclose provider use, AI assistance, limitations, and the student's technical contribution.

The build will prioritize a correct vertical slice over breadth. Accounts, cloud case storage, automated school outreach, nationwide procedure coverage, appointment booking, legal eligibility decisions, and new paid services remain out of scope.

## Pilot content decision

Round Rock ISD will be the initial local procedure pilot because it publishes current 2026–27 enrollment instructions and serves the project's local community. The app may cite official public district pages but must not claim partnership, endorsement, or school review without explicit permission.

Live procedure records will distinguish three review states:

- `source_checked`: a student reviewed a current official source and copied the relevant passage;
- `school_reviewed`: an authorized school contact confirmed the interpretation and permission to describe that review is recorded;
- `pending`: the source or interpretation needs review and cannot make a live task ready.

The first source-checked procedure set will cover the district-wide new-student flow and the official list of documents to begin enrollment. School-specific flyers and social-feed posts may be retained as documents in a test case, but they will not become general district rules.

Fictional Mesa View remains the reproducible competition demonstration. It will continue to be labeled fictional at every relevant surface. The production demo can fall back to this case if the AI provider is unavailable.

## System architecture

The application remains a Next.js 16 App Router project using React 19, TypeScript, Tailwind CSS 4, Zod, Vitest, the Vercel AI SDK, and Groq. Cases remain in browser memory by default.

The First Day feature will use four boundaries:

1. **Provider boundary** — image processing and language generation. Provider output is untrusted and must pass schema and evidence validation.
2. **Evidence boundary** — exact text, source identity, fact proposals, ambiguity, and user confirmation.
3. **Decision boundary** — versioned procedures, dependency evaluation, conflict state, and task status. This boundary is deterministic.
4. **Presentation boundary** — mobile workflow, source inspection, correction controls, plan groups, practice tools, and exports.

The current `first-day-workspace.tsx` has grown beyond one clear responsibility. The upgrade will split it without changing domain behavior:

```text
app/features/first-day/
  adapters/
    explanation.ts              Existing general response adapter
    live-extraction.ts          Validated First Day extraction conversion
  content/
    fictional-case.ts           Reproducible Mesa View demonstration
    procedures/
      round-rock-isd.ts          Versioned source-checked pilot content
  domain/
    types.ts                    Stable records and public contracts
    evidence.ts                 Exact-quote and reference validation
    extraction.ts               Proposal validation and case merging
    conflicts.ts                Cross-document event/field comparison
    planner.ts                  Deterministic dependency evaluation
    events.ts                   Immutable confirmations and corrections
    upload-queue.ts             Ordered request and cancellation state
  ui/
    first-day-workspace.tsx     Thin composition and case controller
    use-live-case.ts            Upload and extraction orchestration
    start-step.tsx              Language, district, sample, and live entry
    documents-step.tsx          Queue, extracted text, retry, and removal
    facts-step.tsx              Confirmation, correction, and source review
    plan-step.tsx               Derived task groups and reasons
    blocker-step.tsx            Conflict comparison and prepared question
    export-step.tsx             Portable plan and calendar actions
    source-panel.tsx            Accessible source dialog
  export/
    calendar.ts                 Confirmed-date ICS generation
    plan-document.ts            Downloadable structured case summary
app/api/first-day/extract/route.ts
tests/first-day/
  extraction.test.ts
  conflicts.test.ts
  live-case.test.ts
  calendar.test.ts
  evaluation.test.ts
evaluation/first-day/
  fixtures/                     Synthetic or permissioned/redacted packets
  expectations/                 Independently specified expected results
  report.md                     Versioned evaluation results
```

Pure domain modules will not import React, browser APIs, or provider SDKs.

## Live extraction contract

The existing `/api/explain` contract remains unchanged for the general Lantern tool. First Day receives an additive `POST /api/first-day/extract` route with a narrower schema.

Each request processes one image page and returns:

- document type and page-level reading confidence;
- verbatim extracted text;
- optional photo-quality warning;
- proposed facts containing kind, label, original value, optional normalized value, exact quote, and text location;
- a request ID and extraction schema version.

Allowed fact kinds are date, location, requested item, contact, appointment, and informational note. The model may not return tasks, district requirements, completion states, or conflict resolutions.

The server validates shape with Zod. The domain adapter then verifies every proposed quotation against that page's extracted text using line-ending and whitespace normalization only. A quotation that does not match becomes an evidence issue and its fact remains unavailable to planning.

Date normalization is accepted only for complete, unambiguous calendar dates. Strings such as `10/11`, `next Friday`, or `within ten days` remain original text with an unclear confirmation state unless sufficient context exists in the same source.

## Live case data flow

1. The browser validates JPG/PNG type, five-page count, 10 MB per-page size, and 25 MB case total.
2. The upload reducer assigns stable document IDs and processes one page at a time.
3. Each request carries a document ID and unique request ID.
4. A successful response passes server schema validation, then client/domain evidence validation.
5. The case merge function appends the document, evidence, and proposed facts without duplicating stable records.
6. Conflict detection compares only facts with matching semantic keys, such as `orientation.location`; it does not compare unrelated dates or locations.
7. The user confirms or corrects important facts. Corrections append events and preserve original document values.
8. The planner combines confirmed facts with eligible procedures and recomputes task states.
9. Removing a source appends a source-removal event and sends affected tasks to `needs_review` while preserving history.
10. Export includes confirmed facts, task states, source references, unresolved questions, and procedure versions.

The client ignores a response when its request ID is no longer current or its document has been removed. Duplicate successful responses cannot create duplicate evidence, facts, or tasks.

## Procedure and task model

Round Rock ISD procedure content will be hand-authored from exact official quotations and versioned independently of model output. A procedure includes its URL, quoted text, checked date, review state, rule version, and explicit dependency template.

Only `source_checked` or `school_reviewed` procedures may participate in live planning. The interface will display the review state and last-checked date. A stale or pending procedure produces a review warning rather than a requirement.

Task templates will remain small and explicit. The initial live templates are:

- gather the source-backed documents needed to begin enrollment;
- open or continue the official enrollment form;
- clarify a conflicting date or location;
- contact the listed office when a required instruction remains unclear;
- review the final plan before the relevant date.

The planner continues to support all-of and any-of dependencies. A task becomes ready only when its required facts are confirmed and its procedure references are eligible. Missing information never becomes a claim that a child cannot enroll.

## Conflict handling

Every comparable fact receives a semantic key composed of the event and field, such as `enrollment_meeting.date` or `orientation.location`.

A conflict exists only when:

- two active facts share a semantic key;
- their normalized or original values differ materially; and
- neither fact is already superseded.

The blocker screen shows both values, their document labels, exact quotations, and page locations. It offers two authoritative resolution paths:

- select one supported source; or
- record that the family reports the school confirmed a value.

The second path must visibly say `Reported confirmed by school` rather than `Verified by Lantern`. A simulated practice call, generated reply, or chatbot answer cannot resolve a conflict.

## User experience design

The visual system will preserve the current calm editorial direction while making the workflow more concise and demonstrable.

### Start

Present two explicit paths: `Try the fictional demo` and `Use my documents`. Explain external image processing before the first file picker. Language selection stays persistent throughout the case.

### Documents

Use compact page cards with thumbnail or document icon, filename, status, confidence, retry, removal, and expandable source text. Show one overall case-progress line without blocking interaction with completed pages.

### Review facts

Use a two-pane desktop layout and a stacked mobile layout: proposed fact on one side, exact source passage on the other. Provide Confirm, Correct, and Not clear actions. Important unreviewed facts remain visually prominent.

### My plan

Lead with a small case summary: ready steps, blockers, waiting steps, and completed steps. Keep the readable list primary. Each task exposes why it has its status and which source or procedure supports it.

### Resolve a blocker

Place competing instructions side by side, followed by a prepared school question and optional reply/call-practice tools. Clearly label practice as simulated.

### Take it with me

Export a print-friendly plan and a structured JSON case summary. Calendar export appears only for confirmed, unambiguous dates and uses stable event IDs. The print view names unresolved items before ready tasks.

All critical content must render without animation. Keyboard focus, 200% zoom, reduced motion, high contrast, large text, and typed fallbacks remain acceptance requirements.

## Production reliability and privacy

The production project currently lacks `GROQ_API_KEY`; provider-backed features therefore report a recoverable unavailable state. The build sequence will configure and verify required deployment variables before presenting live upload as complete.

No uploaded family documents will be included in fixtures, screenshots, analytics, or source control. Synthetic and permissioned/redacted materials are the only acceptable evaluation inputs.

The server will stop logging raw model output that may contain document text. Errors will record a request ID, route, provider status, schema issue summary, and timing without recording extracted text or image bytes.

The interface will distinguish:

- browser memory retained during the open page;
- application persistence, which remains absent for cases;
- external provider processing;
- downloaded or printed output explicitly created by the user.

Provider outages, timeouts, malformed output, and missing keys must leave the fictional demo and previously processed pages usable.

## Evaluation design

The project will maintain at least 20 held-out synthetic or permissioned/redacted document packets that are separate from development fixtures. Expectations are written before each packet is run.

The evaluation will report:

- important-fact precision and recall;
- exact-source quotation coverage;
- false and missed conflicts;
- ambiguous-date and normalized-date errors;
- percentage of actionable tasks with valid source coverage;
- median and p95 processing latency;
- provider failures and recoveries;
- estimated provider cost per complete case.

Source coverage for actionable tasks is enforced by construction: a task without eligible evidence or procedure references cannot enter a ready state. This does not imply that OCR, extraction, or translation is perfect.

Usability evaluation will involve approximately five consenting adults using synthetic packets. Participants complete a small set of enrollment-preparation questions first from the original documents and then with Lantern, with order varied when practical. Record correct-step completion, time, points of confusion, and qualitative trust. Do not collect sensitive family records.

## Competition presentation

The deployed demo will include a competition-safe demonstration case that never depends on live AI. A small `How Lantern decided` view will expose the pipeline from document to evidence to confirmed fact to dependency to task state.

The three-minute video will allocate time as follows:

- 0:00–0:20 — local family problem and one-sentence purpose;
- 0:20–0:50 — add three documents and select Spanish;
- 0:50–1:20 — inspect an exact quotation behind a proposed fact;
- 1:20–1:50 — reveal two conflicting instructions and prepare a question;
- 1:50–2:15 — record a fictional school confirmation and show the targeted plan update;
- 2:15–2:40 — explain deterministic planning, stable history, and AI boundaries;
- 2:40–3:00 — show evaluation results, limitations, and the exported plan.

Submission documentation will identify libraries, provider APIs, generated assistance, student-authored decisions, tests, evaluation work, and limitations. The student must be able to explain the extraction schema, quotation validation, conflict key, event history, dependency evaluator, and late-response protection from source code.

## Delivery sequence

The upgrade will be implemented as six independently reviewable milestones:

1. **Production and component foundation** — provider configuration, privacy-safe logging, workspace split, and unchanged fictional behavior.
2. **Source-backed live extraction** — First Day API, exact quotes, ambiguity, idempotent case merge, and fact review.
3. **Local procedure pilot and conflict engine** — Round Rock source records, semantic keys, conflict detection, and authoritative resolution events.
4. **Complete live plan and exports** — live task templates, planner integration, source-aware print/JSON/calendar output, bilingual completion.
5. **Evaluation and hardening** — held-out fixtures, metrics, failure recovery, accessibility, latency, cost, and dependency audit.
6. **Competition package** — demo mode, how-it-works view, three-minute script, AI disclosure, and submission checklist.

Each milestone must pass lint, all tests, production build, browser acceptance checks, and a clean Git diff before deployment. The existing general Lantern route and fictional First Day flow remain working throughout.

## Research basis

- 2026 Congressional App Challenge rules: <https://www.congressionalappchallenge.us/wp-content/uploads/2026/05/2026-CAC-Rules.pdf>
- 2025 Top Apps: <https://www.congressionalappchallenge.us/meet-the-2025-cac-top-apps-winners-presented-by-thecoderschool/>
- 2025 TX-10 winner: <https://www.congressionalappchallenge.us/25-tx10/>
- 2025 GlobaLingo local-impact example: <https://www.congressionalappchallenge.us/25-tx20/>
- Round Rock ISD enrollment source: <https://www.roundrockisd.org/page/enroll>
- Round Rock ISD registration source: <https://www.roundrockisd.org/page/how-to-register>
- SchoolMint enrollment feature comparison: <https://schoolmint.com/student-registration/>
