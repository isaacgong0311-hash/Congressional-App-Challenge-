# Lantern: First Day — Implementation Design

Date: 2026-09-15  
Status: Approved for implementation  
Target repository: `isaacgong0311-hash/Congressional-App-Challenge-`

## Product direction

Lantern remains a general-purpose tool for explaining confusing official letters. First Day becomes its focused school-enrollment workflow: families can collect related school documents, review extracted facts against exact source passages, resolve uncertainty, and carry away a clear plan.

The new project will build from the existing `TRANSLATEtheform` application without remaining coupled to that repository. The starting source snapshot is commit `479ff86a30890c76a4ec0240406e66d9de4aa6ce` from 2026-06-18. This repository will own all subsequent First Day work.

## Initial milestone

The first reviewable milestone will:

1. Import and verify the existing Lantern application.
2. Record its actual architecture, endpoints, providers, request limits, data handling, and available checks.
3. Preserve the existing single-letter experience.
4. Add a prominent **Get ready for school** entry point.
5. Add a navigable `/first-day` workflow backed by a clearly labeled fictional case.
6. Define the First Day domain records and deterministic plan-state evaluator.
7. Show source-linked tasks grouped into Ready, Needs clarification, Waiting, Done, and Needs review.
8. Add automated tests for planner behavior and evidence/reference validation.

Live multi-page extraction, real reviewed district procedures, conflict resolution through assistant tools, and final exports will follow this foundation in the order set by the supplied build plan.

## Migration approach

Copy the source tree from the approved upstream snapshot while excluding its `.git` directory, generated files, environment files, and dependencies. Preserve this repository's Git history and remote. Replace the minimal placeholder README with project-specific setup and attribution.

The imported application currently uses:

- Next.js 16 App Router, React 19, and TypeScript
- Tailwind CSS 4
- Vercel AI SDK 6 and Zod 4
- Groq Llama 4 Scout for image explanation
- Optional ElevenLabs text-to-speech and Perplexity local-help integrations
- Browser speech APIs and in-memory React state

No database, authentication system, vector store, or paid service will be added for First Day. Optional provider-backed features must fail gracefully when their keys are absent.

## Application structure

The existing general letter experience remains available at `/`. Its APIs remain additive and backward-compatible.

First Day is isolated under these boundaries:

```text
app/first-day/                         Route and page composition
app/features/first-day/domain/         Types, validation, evidence, conflicts, planner, events
app/features/first-day/content/        Versioned procedures and fictional fixtures
app/features/first-day/ui/             Workflow shell, document review, facts, plan, blockers
app/features/first-day/adapters/       Existing explanation-response conversion
app/features/first-day/export/         Printable plans and calendar output
tests/first-day/                        Domain and workflow fixtures
docs/                                  Baseline, data lifecycle, and development log
```

Files may be split further when a unit has more than one clear responsibility. The First Day domain must not import React or provider SDKs.

## Domain model

Stable string IDs connect all records. Corrections and source removal produce events rather than destructive replacement.

- **Document:** label, page index, processing state, extracted text, and source version.
- **Evidence:** exact quote, source record, page or section, and optional verified coordinates.
- **Fact:** kind, original value, optional normalized value, evidence IDs, and confirmation state.
- **Procedure:** district, source URL, quoted section, checked date, review state, and rule version.
- **Task:** action, supporting evidence or rules, dependency expression, and optional confirmed target date.
- **Conflict:** competing facts, affected tasks, state, and resolution event.
- **User event:** timestamped confirmation, correction, completion, source removal, or school-reported update.
- **Case:** language, district, linked records, rule version, and event history.

Confirmation states are `proposed`, `confirmed`, `unclear`, `conflicted`, and `superseded`. Plan states are `ready`, `needs_clarification`, `waiting`, `done`, and `needs_review`.

## Deterministic planner

The planner accepts a validated case and procedure set, then returns derived task states and plain-language reasons. It supports explicit `allOf` and `anyOf` dependency expressions.

Rules:

- Only confirmed facts and reviewed live procedures can make a live task ready.
- Fictional procedures remain visibly labeled and cannot be presented as district policy.
- Unknown values stay unknown; they never become false or missing automatically.
- Any-of succeeds when one supported alternative is confirmed.
- All-of succeeds only when every required dependency is confirmed.
- Invalid references and dependency cycles are reported as rule errors.
- Task completion is stored as an event, not embedded as mutable planner output.
- A changed or removed supporting source sends a completed task to `needs_review` while preserving its completion history.
- Identical inputs produce identical output and stable task IDs.

AI may propose facts and explanations. It cannot define procedure requirements, resolve conflicts, or directly set task state.

## First Day user experience

The workflow is mobile-first and remains usable without animation:

1. **Start:** choose language and district, load the fictional sample, or begin adding documents.
2. **Documents:** review an ordered queue with per-page processing, retry, removal, and extracted text.
3. **Review facts:** confirm or correct dates, places, requests, and their exact source passages.
4. **My plan:** read tasks grouped by derived state; each task exposes its reason and source.
5. **Resolve a blocker:** compare uncertain or conflicting information and prepare a question for the school.
6. **Take it with me:** print or download the plan, with unresolved items and source types clearly distinguished.

The initial milestone implements this journey with a fictional case so its planner behavior is demonstrable without representing model output or unreviewed rules as authoritative.

The visual direction extends Lantern's calm editorial style with a premium school-planning workspace: warm light, restrained blue and amber accents, crisp cards, strong information hierarchy, subtle gradients, and small progressive transitions. Keyboard access, 200% zoom, high contrast, large text, reduced motion, and typed fallbacks remain required.

## Data flow

For the fictional demo, reviewed fixture records load directly into in-memory client state. User events recompute the plan locally through pure domain functions.

For later live document processing:

1. The client validates type, per-image size, page count, and total payload before submission.
2. Pages are sent sequentially to the existing explanation endpoint.
3. An adapter converts each successful response into proposed facts and evidence tied to its document ID.
4. Quotes are accepted only when they match that document's extracted text.
5. Important facts require confirmation before they affect definitive instructions or calendar output.
6. Removing a page invalidates dependent evidence and triggers affected-task review.
7. Request IDs prevent late responses from restoring removed or replaced documents.

Cases remain in memory by default. Uploads are processed by external AI providers when that feature is used, so privacy copy must say this plainly even though the application does not persist images itself.

## Error handling

- A failed page retains successful pages and offers retry or removal.
- Malformed AI output becomes a recoverable document error and cannot enter the planner.
- Missing provider keys disable only their associated optional feature.
- Unsupported files and oversized cases fail before provider calls.
- Ambiguous dates preserve their original strings and require confirmation.
- Missing or fabricated quotes become unresolved evidence errors.
- Conflicting values remain visible together until the user selects supported evidence or records an explicit school confirmation.
- Planner reference errors and cycles surface as configuration errors, never as family-facing requirements.
- Speech failures always retain typed interaction.

## Verification strategy

The imported baseline must pass its existing lint and production build before First Day changes are evaluated. Because the upstream project has no test runner, the implementation plan will select a small TypeScript-compatible runner and record that addition.

Initial automated coverage includes:

- all-of, any-of, unknown, and completed-task planner cases
- stable output for identical input
- invalid dependency references and cycle detection
- exact-quote validation and mismatched-document rejection
- source removal causing only affected tasks to need review
- user correction preserving the original value
- fictional fixture validation

Manual verification includes the current sample-letter flow, narrow mobile layout, keyboard navigation, high contrast, large text, reduced motion, missing API keys, and the complete fictional First Day journey.

## Deferred scope

Accounts, cloud storage, school-system integrations, automated outreach, appointment booking, legal eligibility decisions, nationwide district coverage, vector search, route optimization, and new paid services remain outside the first version. An interactive dependency graph is optional and cannot replace the accessible plan list.

## Success criteria

The milestone is complete when the existing Lantern flow still builds, the new First Day route works from start through an evidence-linked fictional plan, planner fixtures pass without an AI request, uncertainties are never presented as settled requirements, and the repository documents its real provider and data lifecycle.
