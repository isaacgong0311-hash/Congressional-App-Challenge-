# Lantern First Day Foundation Implementation Plan

> **For agentic workers:** Implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. The repository does not currently expose the referenced subagent execution skills, so execution remains inline in the current session.

**Goal:** Import the existing Lantern application and add a tested, evidence-linked fictional First Day enrollment workflow without breaking the general letter tool.

**Architecture:** Preserve the imported Next.js application and APIs, then add First Day as an isolated App Router route. Pure TypeScript domain functions validate evidence, apply case events, and derive plan states; client UI renders those deterministic results from an in-memory fictional fixture.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Zod 4, Vitest, Vercel AI SDK 6, Groq

---

## File map

- `app/page.tsx` — preserve the general Lantern tool and add the First Day entry point.
- `app/first-day/page.tsx` — server route wrapper and metadata boundary.
- `app/features/first-day/domain/types.ts` — stable record and dependency contracts.
- `app/features/first-day/domain/evidence.ts` — exact-quote and reference validation.
- `app/features/first-day/domain/planner.ts` — pure dependency evaluation and derived plan states.
- `app/features/first-day/domain/events.ts` — immutable confirmation and completion events.
- `app/features/first-day/content/fictional-case.ts` — labeled fictional documents, facts, rules, and tasks.
- `app/features/first-day/ui/first-day-workspace.tsx` — client workflow state and screen composition.
- `app/features/first-day/ui/source-panel.tsx` — accessible evidence/source display.
- `app/features/first-day/ui/icons.tsx` — small shared SVG icons used by the workflow.
- `app/globals.css` — First Day palette, print rules, focus states, and progressive motion.
- `tests/first-day/evidence.test.ts` — evidence reference and quote checks.
- `tests/first-day/planner.test.ts` — all-of, any-of, unknown, completion, and review behavior.
- `tests/first-day/events.test.ts` — immutable correction and completion history.
- `docs/baseline.md` — audited source map, providers, limits, storage, logging, and verification.
- `docs/development-log.md` — upstream attribution and AI-assisted work disclosure trail.

### Task 1: Import and verify the Lantern baseline

**Files:**
- Create from upstream: `app/**`, `public/**`, `eslint.config.mjs`, `middleware.ts`, `next.config.ts`, `package.json`, `package-lock.json`, `postcss.config.mjs`, `tsconfig.json`, `.gitignore`
- Modify: `README.md`
- Preserve: `docs/superpowers/**`

- [ ] **Step 1: Record the upstream revision**

Run:

```bash
git -C /private/tmp/translate-form-source rev-parse HEAD
```

Expected: `479ff86a30890c76a4ec0240406e66d9de4aa6ce`.

- [ ] **Step 2: Copy the source snapshot without Git metadata**

Copy only the listed project files and directories. Do not copy `.git`, `.claude`, `AGENTS.md`, or `CLAUDE.md`; the upstream instructions have already been inspected and global project instructions remain authoritative.

- [ ] **Step 3: Replace the placeholder README**

Write `README.md` with the Lantern: First Day purpose, upstream snapshot attribution, local setup, provider keys, verification commands, and a warning that the initial school case is fictional.

- [ ] **Step 4: Install the exact imported dependencies**

Run:

```bash
npm ci
```

Expected: dependency installation succeeds without changing `package-lock.json`.

- [ ] **Step 5: Verify the untouched baseline**

Run:

```bash
npm run lint
npm run build
```

Expected: both exit successfully. Record any upstream failure in `docs/baseline.md` before changing behavior.

- [ ] **Step 6: Commit the baseline import**

```bash
git add .gitignore README.md app public eslint.config.mjs middleware.ts next.config.ts package.json package-lock.json postcss.config.mjs tsconfig.json
git commit -m "chore: import Lantern source baseline"
```

### Task 2: Add the domain test harness and contracts

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `app/features/first-day/domain/types.ts`
- Create: `app/features/first-day/content/fictional-case.ts`
- Create: `tests/first-day/fixture.test.ts`

- [ ] **Step 1: Install Vitest and add scripts**

Run:

```bash
npm install --save-dev vitest
```

Add these scripts to `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 2: Write the failing fixture test**

Create `tests/first-day/fixture.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { fictionalCase } from "../../app/features/first-day/content/fictional-case";

describe("fictional First Day case", () => {
  it("is explicitly fictional and uses stable unique IDs", () => {
    expect(fictionalCase.mode).toBe("fictional");
    const ids = [
      ...fictionalCase.documents.map((record) => record.id),
      ...fictionalCase.evidence.map((record) => record.id),
      ...fictionalCase.facts.map((record) => record.id),
      ...fictionalCase.tasks.map((record) => record.id),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });
});
```

- [ ] **Step 3: Run the fixture test and verify it fails**

Run:

```bash
npm test -- tests/first-day/fixture.test.ts
```

Expected: failure because the domain modules do not exist.

- [ ] **Step 4: Define focused domain contracts**

Create `types.ts` with these public types:

```ts
export type ConfirmationState = "proposed" | "confirmed" | "unclear" | "conflicted" | "superseded";
export type PlanState = "ready" | "needs_clarification" | "waiting" | "done" | "needs_review";
export type Dependency =
  | { type: "fact"; factId: string }
  | { type: "task"; taskId: string }
  | { type: "allOf"; items: Dependency[] }
  | { type: "anyOf"; items: Dependency[] };
export type CaseEvent =
  | { id: string; type: "fact_confirmed"; factId: string; timestamp: string }
  | { id: string; type: "fact_corrected"; factId: string; value: string; timestamp: string }
  | { id: string; type: "task_completed"; taskId: string; timestamp: string }
  | { id: string; type: "source_removed"; documentId: string; timestamp: string };
```

Also define `FirstDayDocument`, `Evidence`, `Fact`, `Procedure`, `PlanTask`, `FirstDayCase`, `DerivedTask`, and `PlannerResult` using the fields in the approved design. `FirstDayCase.mode` must be `"fictional" | "live"`.

- [ ] **Step 5: Add the fictional case**

Create a three-document case for fictional Mesa View School:

- Enrollment welcome letter: registration at the Welcome Center, August 12 at 9:00 AM.
- Immunization note: records or a nurse conversation are accepted alternatives.
- Follow-up message: orientation location is unclear and conflicts with the welcome letter.

Every task must cite an evidence or fictional procedure ID. The exported constant must satisfy `FirstDayCase`.

- [ ] **Step 6: Run the fixture test**

Run `npm test -- tests/first-day/fixture.test.ts`.

Expected: one passing test.

- [ ] **Step 7: Commit the contracts and fixture**

```bash
git add package.json package-lock.json app/features/first-day tests/first-day/fixture.test.ts
git commit -m "feat: define First Day case records"
```

### Task 3: Validate evidence and derive deterministic plan states

**Files:**
- Create: `app/features/first-day/domain/evidence.ts`
- Create: `app/features/first-day/domain/planner.ts`
- Create: `tests/first-day/evidence.test.ts`
- Create: `tests/first-day/planner.test.ts`

- [ ] **Step 1: Write failing evidence tests**

Test that `validateEvidence(caseData)` returns no issues for the fictional fixture, rejects a quote absent from its linked document, and rejects a missing document reference.

```ts
expect(validateEvidence(fictionalCase)).toEqual([]);
expect(validateEvidence(withFabricatedQuote)[0]?.code).toBe("quote_not_found");
expect(validateEvidence(withMissingDocument)[0]?.code).toBe("missing_document");
```

- [ ] **Step 2: Write failing planner tests**

Cover these exact cases:

```ts
expect(byId(result, "task-registration").state).toBe("ready");
expect(byId(result, "task-health-records").state).toBe("ready"); // anyOf alternative confirmed
expect(byId(result, "task-orientation").state).toBe("needs_clarification");
expect(byId(withUnknownFact, "task-registration").state).toBe("waiting");
expect(byId(withCompletion, "task-registration").state).toBe("done");
expect(byId(withRemovedSource, "task-registration").state).toBe("needs_review");
expect(planCase(fictionalCase)).toEqual(planCase(fictionalCase));
```

Also assert that missing task/fact references and cycles appear in `PlannerResult.errors`.

- [ ] **Step 3: Run the focused tests and verify failure**

Run:

```bash
npm test -- tests/first-day/evidence.test.ts tests/first-day/planner.test.ts
```

Expected: module-not-found failures.

- [ ] **Step 4: Implement evidence validation**

Export:

```ts
export type EvidenceIssue = {
  code: "missing_document" | "quote_not_found" | "missing_evidence";
  evidenceId: string;
  message: string;
};

export function validateEvidence(caseData: FirstDayCase): EvidenceIssue[];
```

Normalize only line endings and repeated whitespace before exact substring comparison. Do not lowercase or translate quotes.

- [ ] **Step 5: Implement deterministic planning**

Export:

```ts
export function planCase(caseData: FirstDayCase): PlannerResult;
```

Evaluate facts from their base state plus events, task completion from events, removed sources from events, and dependencies recursively. Track the current task path to detect cycles. Derive a plain-language reason for every task. Sort results by the order of `caseData.tasks`, never by state.

- [ ] **Step 6: Run focused and full tests**

Run:

```bash
npm test -- tests/first-day/evidence.test.ts tests/first-day/planner.test.ts
npm test
```

Expected: all tests pass.

- [ ] **Step 7: Commit the planner**

```bash
git add app/features/first-day/domain tests/first-day
git commit -m "feat: add evidence validation and deterministic planner"
```

### Task 4: Add immutable case events

**Files:**
- Create: `app/features/first-day/domain/events.ts`
- Create: `tests/first-day/events.test.ts`

- [ ] **Step 1: Write failing event tests**

Verify that confirming, correcting, and completing records append events without mutating the input. Verify that a correction retains the original fact value and that event IDs are accepted as arguments rather than generated randomly inside domain functions.

```ts
const next = appendFactCorrection(fictionalCase, {
  id: "event-correct-location",
  factId: "fact-orientation-location-a",
  value: "Main office",
  timestamp: "2026-09-15T12:00:00.000Z",
});
expect(fictionalCase.events).toHaveLength(0);
expect(next.events).toHaveLength(1);
expect(next.facts[0]?.originalValue).toBe(fictionalCase.facts[0]?.originalValue);
```

- [ ] **Step 2: Run the event test and verify failure**

Run `npm test -- tests/first-day/events.test.ts`.

Expected: module-not-found failure.

- [ ] **Step 3: Implement event appenders**

Export `appendFactConfirmation`, `appendFactCorrection`, `appendTaskCompletion`, and `appendSourceRemoval`. Each validates the referenced record, returns a new case object, and throws a descriptive error for an unknown ID.

- [ ] **Step 4: Run all tests**

Run `npm test`.

Expected: all tests pass.

- [ ] **Step 5: Commit events**

```bash
git add app/features/first-day/domain/events.ts tests/first-day/events.test.ts
git commit -m "feat: preserve First Day case history with events"
```

### Task 5: Build the fictional First Day workspace

**Files:**
- Create: `app/first-day/page.tsx`
- Create: `app/features/first-day/ui/first-day-workspace.tsx`
- Create: `app/features/first-day/ui/source-panel.tsx`
- Create: `app/features/first-day/ui/icons.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Create the route wrapper**

`app/first-day/page.tsx` remains a Server Component and exports metadata:

```ts
export const metadata = {
  title: "First Day | Lantern",
  description: "Turn school enrollment instructions into a plan you can check and complete.",
};
```

Render `<FirstDayWorkspace initialCase={fictionalCase} />`.

- [ ] **Step 2: Create the client workspace shell**

Use `"use client"` only in `first-day-workspace.tsx`. Store the current case, current step, open source ID, language (`English` or `Español`), and accessibility settings in component state. Derive the plan with `useMemo(() => planCase(caseData), [caseData])`.

The persistent shell contains:

- Lantern wordmark and back link
- fictional-demo badge
- language toggle
- text-size and contrast controls
- six-step progress navigation
- main content and a compact privacy/data note

- [ ] **Step 3: Implement the six workflow screens**

Each screen must be real content, not a placeholder:

- Start: concise value proposition, selected fictional district, sample-case button, and disabled live-upload card labeled as the next milestone.
- Documents: three document cards with source type, page, extracted-text excerpt, and status.
- Review facts: fact cards showing original value, state, source button, and confirmation action.
- My plan: groups derived tasks under every non-empty `PlanState`, with reason and source actions.
- Resolve a blocker: show both fictional orientation passages and a prepared clarification question; recording the fictional confirmation appends a correction/confirmation event.
- Take it with me: printable summary with unresolved-item count, source labels, and `window.print()` action.

- [ ] **Step 4: Implement the evidence source panel**

`SourcePanel` accepts `evidence`, `document`, and `onClose`. Use a native dialog-style region with `role="dialog"`, `aria-modal="true"`, a descriptive heading, exact quote in `<blockquote>`, document/page metadata, and a close button. Move focus to the close button on open and restore it to the source trigger on close.

- [ ] **Step 5: Add progressive styling**

Extend `globals.css` with First Day CSS variables, a soft radial background, visible `:focus-visible` rings, print rules that retain sources, and motion guarded by `prefers-reduced-motion`. No content may start at opacity zero unless the non-animated rule renders it visible.

- [ ] **Step 6: Run checks**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all pass; `/first-day` appears in the production route list.

- [ ] **Step 7: Commit the workflow**

```bash
git add app/first-day app/features/first-day/ui app/globals.css
git commit -m "feat: add fictional First Day planning workflow"
```

### Task 6: Connect the existing Lantern home page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Add the First Day entry point**

Import `Link` from `next/link`. Add a visually prominent card near the existing hero actions with:

```tsx
<Link href="/first-day">
  <span>New · First Day</span>
  <strong>Get ready for school</strong>
  <span>Turn enrollment letters into a source-backed plan.</span>
</Link>
```

Keep the existing upload, sample letter, help finder, reply drafting, assistant, calendar, and print paths unchanged.

- [ ] **Step 2: Verify home-page regression checks**

Run `npm run lint` and `npm run build`.

Expected: both pass, and `/` plus `/first-day` are present.

- [ ] **Step 3: Commit the entry point**

```bash
git add app/page.tsx
git commit -m "feat: link Lantern to First Day"
```

### Task 7: Document the real baseline and data lifecycle

**Files:**
- Create: `docs/baseline.md`
- Create: `docs/development-log.md`
- Modify: `README.md`

- [ ] **Step 1: Write the baseline report**

Record exact routes and providers:

- `/api/explain`: Groq Llama 4 Scout, 10 MB image limit, 60-second max duration, Zod validation.
- `/api/ask`: Groq-grounded chat/practice, 30-second max duration.
- `/api/speak`: ElevenLabs optional speech, 30-second max duration.
- `/api/translate-field`: provider-backed field translation, 20-second max duration.
- `/api/local-help`: Perplexity optional lookup, 30-second max duration.
- Middleware rate limits are per-process memory and not globally coordinated.
- Browser preferences use `localStorage`; cases remain React memory only.
- Uploaded images reach the configured external AI provider and are not written by application code.
- API errors currently write error metadata and truncated raw model text for schema failures to server logs; uploaded image bytes are not intentionally logged.

Mark manual provider-backed actions unavailable unless valid local keys are present.

- [ ] **Step 2: Add the development log**

List the original upstream commit, reused libraries, imported components, AI-assisted planning/code work, and student review responsibilities. State that the Mesa View case and district are fictional.

- [ ] **Step 3: Finish README commands and privacy wording**

Document `npm run dev`, `npm test`, `npm run lint`, and `npm run build`. Explain that Groq is free-tier capable but subject to its current terms and limits; ElevenLabs and Perplexity are optional and may not be free.

- [ ] **Step 4: Run the complete verification suite**

Run:

```bash
npm test
npm run lint
npm run build
git diff --check
```

Expected: every command succeeds.

- [ ] **Step 5: Commit documentation**

```bash
git add README.md docs/baseline.md docs/development-log.md
git commit -m "docs: record Lantern baseline and data lifecycle"
```

### Task 8: Browser-level acceptance pass

**Files:**
- Modify only files implicated by verified defects.

- [ ] **Step 1: Start the development server**

Run `npm run dev` and open `/` plus `/first-day`.

- [ ] **Step 2: Verify the core story**

Confirm:

1. `/` still exposes the original letter tool and the First Day entry point.
2. `/first-day` clearly labels all policy and documents as fictional.
3. Every workflow step is reachable with keyboard controls.
4. Source actions expose the correct document and exact quote.
5. Confirming a fact changes only affected tasks.
6. Resolving the location blocker updates orientation while preserving unrelated completion.
7. Print preview includes sources and unresolved items.
8. Large text, high contrast, reduced motion, and 200% zoom remain usable at 390px width.

- [ ] **Step 3: Fix only reproduced defects and rerun checks**

Run `npm test`, `npm run lint`, and `npm run build` after any fix.

- [ ] **Step 4: Commit acceptance fixes if needed**

```bash
git status --short
# Stage only the files changed to correct reproduced acceptance defects.
git add app/first-day app/features/first-day app/globals.css app/page.tsx
git commit -m "fix: address First Day acceptance findings"
```

If no fixes are required, do not create an empty commit.
