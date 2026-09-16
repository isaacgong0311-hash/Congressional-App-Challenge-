# Lantern Competition Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Lantern First Day into a production-ready, source-backed live enrollment workflow with measurable competition proof while preserving the existing general letter tool and fictional demo.

**Architecture:** Keep provider output behind a narrow Zod-validated extraction boundary, then merge only exact-quote-backed proposals into the in-memory case. Conflict detection, procedure eligibility, task state, source removal, and exports remain deterministic pure TypeScript; React components only orchestrate and present those domain results.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS 4, Zod 4, Vitest 4, Vercel AI SDK 6, Groq, Vercel

---

## Delivery map

This plan is ordered so every task leaves the application working and reviewable.

| Phase | Tasks | Reviewable result |
| --- | --- | --- |
| Production foundation | 1–2 | Privacy-safe provider errors and a maintainable First Day UI boundary |
| Trustworthy live extraction | 3–6 | Uploaded pages produce validated, source-backed facts that users can review |
| Explainable decisions | 7–9 | Real conflicts and source-checked local procedures produce deterministic live tasks |
| Portable results | 10 | Confirmed dates and plans export without losing source context |
| Competition proof | 11–12 | Held-out metrics, technical explanation, demo script, and verified production release |

## File map

- `app/lib/extract-json.ts` — shared outer-JSON extraction for provider responses.
- `app/lib/provider-error.ts` — privacy-safe provider error summaries with request IDs.
- `app/api/explain/route.ts` — preserve the general Lantern contract while removing raw-output logging.
- `app/api/first-day/extract/route.ts` — one-page First Day extraction endpoint.
- `app/features/first-day/server/extraction-schema.ts` — server-only Zod schema and prompt contract.
- `app/features/first-day/adapters/live-extraction.ts` — convert validated provider output to domain proposals.
- `app/features/first-day/domain/types.ts` — semantic keys, extraction proposals, review states, and export contracts.
- `app/features/first-day/domain/extraction.ts` — exact-quote validation and idempotent case merging.
- `app/features/first-day/domain/conflicts.ts` — compare active facts sharing one semantic key.
- `app/features/first-day/domain/procedures.ts` — procedure eligibility and staleness checks.
- `app/features/first-day/domain/planner.ts` — require eligible procedure references for live readiness.
- `app/features/first-day/content/procedures/round-rock-isd.ts` — versioned source-checked local pilot.
- `app/features/first-day/ui/use-live-case.ts` — sequential upload/extraction orchestration.
- `app/features/first-day/ui/first-day-workspace.tsx` — thin case/step composition.
- `app/features/first-day/ui/*-step.tsx` — focused Start, Documents, Facts, Plan, Blocker, and Export screens.
- `app/features/first-day/export/calendar.ts` — stable, confirmed-date ICS output.
- `app/features/first-day/export/plan-document.ts` — structured downloadable case summary.
- `app/first-day/how-it-works/page.tsx` — competition-facing technical explanation.
- `evaluation/first-day/**` — held-out packet expectations, runner, and versioned results.
- `tests/first-day/**` — pure domain and workflow coverage.

### Task 1: Remove document text from provider error logs

**Files:**
- Create: `app/lib/extract-json.ts`
- Create: `app/lib/provider-error.ts`
- Modify: `app/api/explain/route.ts`
- Create: `tests/lib/extract-json.test.ts`
- Create: `tests/lib/provider-error.test.ts`
- Modify: `docs/baseline.md`

- [ ] **Step 1: Write the failing JSON and privacy tests**

```ts
// tests/lib/extract-json.test.ts
import { describe, expect, it } from "vitest";
import { extractOuterJson } from "../../app/lib/extract-json";

describe("extractOuterJson", () => {
  it("reads a fenced object and ignores trailing prose", () => {
    expect(extractOuterJson('```json\n{"ok":true}\n``` extra')).toEqual({ ok: true });
  });

  it("returns null for malformed output", () => {
    expect(extractOuterJson("student name: Maya {not json}")).toBeNull();
  });
});

// tests/lib/provider-error.test.ts
import { describe, expect, it } from "vitest";
import { providerErrorSummary } from "../../app/lib/provider-error";

describe("providerErrorSummary", () => {
  it("does not include raw document or model output", () => {
    const result = providerErrorSummary({
      requestId: "request-123",
      route: "/api/explain",
      kind: "schema",
      durationMs: 1200,
      issueCount: 3,
    });
    expect(JSON.stringify(result)).not.toContain("Maya");
    expect(result).toEqual({
      requestId: "request-123",
      route: "/api/explain",
      kind: "schema",
      durationMs: 1200,
      issueCount: 3,
    });
  });
});
```

- [ ] **Step 2: Run the focused tests and verify module-not-found failures**

Run: `npm test -- tests/lib/extract-json.test.ts tests/lib/provider-error.test.ts`  
Expected: both suites fail because the two modules do not exist.

- [ ] **Step 3: Add the shared utilities**

```ts
// app/lib/extract-json.ts
export function extractOuterJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : text).trim();
  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < candidate.length; index += 1) {
    const character = candidate[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (character === "\\" && inString) {
      escaped = true;
      continue;
    }
    if (character === '"') inString = !inString;
    if (inString) continue;
    if (character === "{") {
      if (depth === 0) start = index;
      depth += 1;
    }
    if (character === "}") {
      depth -= 1;
      if (depth === 0 && start >= 0) {
        try {
          return JSON.parse(candidate.slice(start, index + 1));
        } catch {
          start = -1;
        }
      }
    }
  }
  return null;
}

// app/lib/provider-error.ts
export type ProviderErrorSummary = {
  requestId: string;
  route: string;
  kind: "schema" | "provider" | "timeout";
  durationMs: number;
  issueCount?: number;
};

export function providerErrorSummary(input: ProviderErrorSummary) {
  const { requestId, route, kind, durationMs, issueCount } = input;
  return { requestId, route, kind, durationMs, issueCount };
}
```

- [ ] **Step 4: Replace the private parser and raw log in the general route**

In `app/api/explain/route.ts`, import both utilities, delete the local `extractJson`, create `requestId` and `startedAt` at the start of `POST`, and replace the schema-error log with:

```ts
console.error(
  "explain route schema error",
  providerErrorSummary({
    requestId,
    route: "/api/explain",
    kind: "schema",
    durationMs: Date.now() - startedAt,
    issueCount: parsed.error.issues.length,
  }),
);
```

Use `extractOuterJson(text)` in the Zod parse. For the provider catch, log the same structure with `kind: "provider"`; do not include `err`, `text`, extracted text, or image bytes.

- [ ] **Step 5: Update the lifecycle documentation and verify**

Change the logging section in `docs/baseline.md` to state that provider failures record request metadata without raw output. Run:

```bash
npm test -- tests/lib
npm run lint
npm run build
```

Expected: tests, lint, and production build pass; `rg -n 'raw:|text\.slice' app/api` returns no matches.

- [ ] **Step 6: Commit**

```bash
git add app/lib app/api/explain/route.ts tests/lib docs/baseline.md
git commit -m "fix: keep provider errors free of document text"
```

### Task 2: Split the First Day workspace without changing behavior

**Files:**
- Modify: `app/features/first-day/ui/first-day-workspace.tsx`
- Create: `app/features/first-day/ui/first-day-copy.ts`
- Create: `app/features/first-day/ui/first-day-shared.tsx`
- Create: `app/features/first-day/ui/start-step.tsx`
- Create: `app/features/first-day/ui/documents-step.tsx`
- Create: `app/features/first-day/ui/facts-step.tsx`
- Create: `app/features/first-day/ui/plan-step.tsx`
- Create: `app/features/first-day/ui/blocker-step.tsx`
- Create: `app/features/first-day/ui/export-step.tsx`

- [ ] **Step 1: Extract copy and shared component contracts**

Move `STEPS`, `STATE_META`, `TASK_ES`, `FACT_ES`, `DOCUMENT_ES`, `FACT_STATE_META`, and `translated` into `first-day-copy.ts`. Export these public contracts:

```ts
export type StepId = "start" | "documents" | "facts" | "plan" | "blocker" | "export";
export type Language = FirstDayCase["language"];
export function translated(language: Language, english: string, spanish: string) {
  return language === "Español" ? spanish : english;
}
```

Move `Eyebrow` and `SourceButton` into `first-day-shared.tsx` with:

```ts
export function SourceButton(props: {
  label: string;
  onClick: (button: HTMLButtonElement) => void;
}) {
  return (
    <button
      className="fd-source-button"
      onClick={(event) => props.onClick(event.currentTarget)}
      type="button"
    >
      <EyeIcon className="h-4 w-4" />
      {props.label}
    </button>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#52625c]">{children}</p>;
}
```

- [ ] **Step 2: Create typed step props before moving JSX**

Each step receives data and callbacks rather than owning case state. Use these interfaces:

```ts
export type SourceOpener = (evidenceId: string, trigger: HTMLButtonElement) => void;

export type StartStepProps = {
  language: Language;
  onOpenSample: () => void;
  onStartLive: () => void;
};

export type DocumentsStepProps = {
  caseData: FirstDayCase;
  language: Language;
  uploadQueue: UploadQueueItem[];
  uploadNotice: string | null;
  onAddFiles: (files: File[]) => void;
  onRetry: (documentId: string) => void;
  onRemove: (documentId: string) => void;
  onOpenSource: SourceOpener;
};

export type FactsStepProps = {
  caseData: FirstDayCase;
  language: Language;
  onConfirmFact: (factId: string) => void;
  onCorrectFact: (factId: string, value: string) => void;
  onOpenSource: SourceOpener;
};

export type PlanStepProps = {
  caseData: FirstDayCase;
  language: Language;
  plan: PlannerResult;
  onCompleteTask: (taskId: string) => void;
  onShowTaskSource: (taskId: string, trigger: HTMLButtonElement) => void;
};

export type BlockerStepProps = {
  caseData: FirstDayCase;
  language: Language;
  onOpenSource: SourceOpener;
  onResolveConflict: (conflictId: string, factId: string, value: string) => void;
};

export type ExportStepProps = {
  caseData: FirstDayCase;
  language: Language;
  plan: PlannerResult;
  onPrint: () => void;
};
```

- [ ] **Step 3: Move each existing screen into its file**

Copy each `currentStep === ...` section unchanged into the matching component, replace closed-over variables with props, then replace the workspace blocks with:

```tsx
{currentStep === "start" ? (
  <StartStep language={language} onOpenSample={openSampleCase} onStartLive={startLiveCase} />
) : null}
{currentStep === "documents" ? (
  <DocumentsStep
    caseData={caseData}
    language={language}
    uploadQueue={uploadQueue}
    uploadNotice={uploadNotice}
    onAddFiles={addUploadFiles}
    onRetry={retryUpload}
    onRemove={removeUpload}
    onOpenSource={openSource}
  />
) : null}
```

Use the same composition pattern for Facts, Plan, Blocker, and Export. Do not change labels, state transitions, or CSS classes in this task.

- [ ] **Step 4: Run static and browser regression checks**

Run:

```bash
npm run lint
npm test
npm run build
```

Then verify `/first-day` at 390×844 and 1440×900: open sample, visit all six steps, open/close a source dialog, resolve the fictional conflict, mark a task done, switch Spanish, and open print preview. Expected: behavior and visible copy match the pre-split deployment.

- [ ] **Step 5: Commit**

```bash
git add app/features/first-day/ui
git commit -m "refactor: split First Day workflow screens"
```

### Task 3: Define the source-backed extraction contract

**Files:**
- Modify: `app/features/first-day/domain/types.ts`
- Create: `app/features/first-day/server/extraction-schema.ts`
- Create: `app/features/first-day/adapters/live-extraction.ts`
- Create: `tests/first-day/live-extraction.test.ts`

- [ ] **Step 1: Write failing schema-adapter tests**

```ts
import { describe, expect, it } from "vitest";
import { adaptLiveExtraction } from "../../app/features/first-day/adapters/live-extraction";

const response = {
  schemaVersion: "first-day-extraction-v1" as const,
  requestId: "request-1",
  documentId: "doc-1",
  document: {
    label: "Enrollment reminder",
    confidence: 96,
    originalText: "Orientation begins in the cafeteria on August 14, 2026 at 5:30 p.m.",
    photoQualityNote: null,
  },
  facts: [{
    clientKey: "orientation-location",
    kind: "location" as const,
    semanticKey: "orientation.location",
    label: "Orientation location",
    originalValue: "cafeteria",
    normalizedValue: null,
    quote: "Orientation begins in the cafeteria",
    location: "Page 1",
    confidence: 94,
  }],
};

describe("adaptLiveExtraction", () => {
  it("creates stable evidence and proposed facts", () => {
    const result = adaptLiveExtraction(response, 1);
    expect(result.document.id).toBe("doc-1");
    expect(result.evidence[0]?.id).toBe("evidence-doc-1-orientation-location");
    expect(result.facts[0]).toEqual(expect.objectContaining({
      id: "fact-doc-1-orientation-location",
      semanticKey: "orientation.location",
      confirmationState: "proposed",
    }));
  });

  it("rejects a quotation absent from the correct document", () => {
    const malformed = structuredClone(response);
    malformed.facts[0].quote = "Meet in the gym";
    expect(() => adaptLiveExtraction(malformed, 1)).toThrow("quote_not_found");
  });
});
```

- [ ] **Step 2: Run the test and verify failure**

Run: `npm test -- tests/first-day/live-extraction.test.ts`  
Expected: failure because `live-extraction.ts` does not exist.

- [ ] **Step 3: Add domain types**

Add to `types.ts`:

```ts
export type ProcedureReviewState =
  | "fictional"
  | "source_checked"
  | "school_reviewed"
  | "pending";

export type ExtractedFactProposal = {
  clientKey: string;
  kind: FactKind;
  semanticKey: string;
  label: string;
  originalValue: string;
  normalizedValue: string | null;
  quote: string;
  location: string;
  confidence: number;
};

export type FirstDayExtractionResponse = {
  schemaVersion: "first-day-extraction-v1";
  requestId: string;
  documentId: string;
  document: {
    label: string;
    confidence: number;
    originalText: string;
    photoQualityNote: string | null;
  };
  facts: ExtractedFactProposal[];
};
```

Add `"informational_note"` to `FactKind`. Add `semanticKey?: string` and `confidence?: number` to `Fact`. Change `Procedure.reviewerStatus` to `ProcedureReviewState`.

- [ ] **Step 4: Add the server Zod schema**

```ts
// app/features/first-day/server/extraction-schema.ts
import { z } from "zod";

export const FirstDayExtractionSchema = z.object({
  schemaVersion: z.literal("first-day-extraction-v1"),
  requestId: z.string().min(1).max(120),
  documentId: z.string().min(1).max(120),
  document: z.object({
    label: z.string().min(1).max(120),
    confidence: z.number().min(0).max(100),
    originalText: z.string().min(1).max(40_000),
    photoQualityNote: z.string().max(500).nullable(),
  }),
  facts: z.array(z.object({
    clientKey: z.string().regex(/^[a-z0-9-]+$/).max(80),
    kind: z.enum(["date", "location", "requested_item", "contact", "appointment", "informational_note"]),
    semanticKey: z.string().regex(/^[a-z0-9_]+\.[a-z0-9_]+$/).max(100),
    label: z.string().min(1).max(120),
    originalValue: z.string().min(1).max(500),
    normalizedValue: z.string().max(500).nullable(),
    quote: z.string().min(1).max(1_500),
    location: z.string().min(1).max(120),
    confidence: z.number().min(0).max(100),
  })).max(30),
});
```

- [ ] **Step 5: Implement the adapter using existing evidence normalization**

`adaptLiveExtraction(response, pageIndex)` must construct the ready document, evidence IDs, and proposed facts. Before returning, call `validateEvidence` on a temporary case containing the new records and throw `new Error(issue.code)` for its first issue. Keep normalized values only when non-null.

- [ ] **Step 6: Verify and commit**

Run `npm test -- tests/first-day/live-extraction.test.ts tests/first-day/evidence.test.ts && npm run lint`. Expected: all pass.

```bash
git add app/features/first-day/domain/types.ts app/features/first-day/server app/features/first-day/adapters tests/first-day/live-extraction.test.ts
git commit -m "feat: define source-backed extraction contract"
```

### Task 4: Add the First Day extraction API

**Files:**
- Create: `app/api/first-day/extract/route.ts`
- Modify: `proxy.ts`
- Create: `tests/first-day/extraction-request.test.ts`
- Modify: `.env.local.example`

- [ ] **Step 1: Write request-validation tests against an exported parser**

```ts
import { describe, expect, it } from "vitest";
import { parseExtractionMetadata } from "../../app/api/first-day/extract/route";

describe("First Day extraction metadata", () => {
  it("accepts stable document and request IDs", () => {
    expect(parseExtractionMetadata({ documentId: "doc-1", requestId: "request-1" }))
      .toEqual({ documentId: "doc-1", requestId: "request-1" });
  });

  it("rejects missing or unsafe IDs", () => {
    expect(() => parseExtractionMetadata({ documentId: "../secret", requestId: "" }))
      .toThrow("Invalid extraction metadata");
  });
});
```

- [ ] **Step 2: Implement metadata validation and request limits**

Export this pure helper from the route:

```ts
const MetadataSchema = z.object({
  documentId: z.string().regex(/^[a-zA-Z0-9-]{1,120}$/),
  requestId: z.string().regex(/^[a-zA-Z0-9-]{1,120}$/),
});

export function parseExtractionMetadata(input: unknown) {
  const parsed = MetadataSchema.safeParse(input);
  if (!parsed.success) throw new Error("Invalid extraction metadata");
  return parsed.data;
}
```

In `POST`, accept multipart fields `image`, `language`, `documentId`, and `requestId`; allow only JPEG/PNG and 10 MB. Return 400 for invalid metadata/file, 500 for missing `GROQ_API_KEY`, 502 for schema/provider failure, and 504 for an aborted timeout.

- [ ] **Step 3: Add the extraction prompt and validated response**

Use Groq `meta-llama/llama-4-scout-17b-16e-instruct`, the shared `extractOuterJson`, and `FirstDayExtractionSchema`. The prompt must state:

```text
Return verbatim document text and proposed facts only.
Every fact quote must appear exactly in originalText.
Use semantic keys in event.field form.
Do not produce tasks, eligibility decisions, district rules, conflict resolutions, or inferred requirements.
Leave normalizedValue null for ambiguous or relative dates.
Copy names, dates, locations, and contact details exactly as printed.
```

Overwrite the parsed response's `documentId` and `requestId` with the validated request values before returning so model output cannot redirect records.

- [ ] **Step 4: Add route-specific rate limiting**

In `proxy.ts`, add `/api/first-day/extract` to the matcher and use the existing explain-route limit. Do not create a second in-memory limiter implementation.

- [ ] **Step 5: Verify missing-key and malformed-file behavior**

Run the test suite and dev server. Submit a text file: expect 400. Submit `public/sample-letter.png` without a key: expect 500 with a user-safe message and no document text in terminal output.

- [ ] **Step 6: Commit**

```bash
git add app/api/first-day proxy.ts tests/first-day/extraction-request.test.ts .env.local.example
git commit -m "feat: add First Day extraction endpoint"
```

### Task 5: Merge extraction results idempotently

**Files:**
- Create: `app/features/first-day/domain/extraction.ts`
- Create: `tests/first-day/extraction.test.ts`

- [ ] **Step 1: Write failing merge tests**

Test these exact behaviors with a small live case and adapted response:

```ts
expect(mergeExtraction(caseData, extraction).documents).toHaveLength(1);
expect(mergeExtraction(mergeExtraction(caseData, extraction), extraction).documents).toHaveLength(1);
expect(mergeExtraction(caseData, extraction).facts[0]?.confirmationState).toBe("proposed");
expect(() => mergeExtraction(removedCase, extraction)).toThrow("document_removed");
expect(mergeExtraction(caseWithOtherPage, extraction).documents).toHaveLength(2);
```

- [ ] **Step 2: Implement a stable replacement merge**

```ts
export type AdaptedExtraction = {
  document: FirstDayDocument;
  evidence: Evidence[];
  facts: Fact[];
};

export function mergeExtraction(
  caseData: FirstDayCase,
  extraction: AdaptedExtraction,
): FirstDayCase {
  const existing = caseData.documents.find((item) => item.id === extraction.document.id);
  if (existing?.status === "removed") throw new Error("document_removed");
  const documentIds = new Set([extraction.document.id]);
  const evidenceIds = new Set(extraction.evidence.map((item) => item.id));
  const factIds = new Set(extraction.facts.map((item) => item.id));
  return {
    ...caseData,
    documents: [...caseData.documents.filter((item) => !documentIds.has(item.id)), extraction.document],
    evidence: [...caseData.evidence.filter((item) => !evidenceIds.has(item.id)), ...extraction.evidence],
    facts: [...caseData.facts.filter((item) => !factIds.has(item.id)), ...extraction.facts],
  };
}
```

Preserve the original page index from the queued document when replacing it. Sort documents by page index; do not sort facts across documents.

- [ ] **Step 3: Verify and commit**

Run `npm test -- tests/first-day/extraction.test.ts tests/first-day/upload-queue.test.ts`. Expected: all pass.

```bash
git add app/features/first-day/domain/extraction.ts tests/first-day/extraction.test.ts
git commit -m "feat: merge live extraction records safely"
```

### Task 6: Connect live uploads to fact review

**Files:**
- Create: `app/features/first-day/ui/use-live-case.ts`
- Modify: `app/features/first-day/ui/first-day-workspace.tsx`
- Modify: `app/features/first-day/ui/documents-step.tsx`
- Modify: `app/features/first-day/ui/facts-step.tsx`
- Create: `tests/first-day/live-case.test.ts`

- [ ] **Step 1: Move upload orchestration into a hook**

The hook owns queue state, file references, abort controllers, request tokens, and notices:

```ts
export type LiveCaseController = {
  uploadQueue: UploadQueueItem[];
  uploadNotice: string | null;
  addFiles(files: File[]): void;
  retry(documentId: string): void;
  remove(documentId: string): void;
  hasReadyFacts: boolean;
};

export function useLiveCase(input: {
  caseData: FirstDayCase;
  language: FirstDayCase["language"];
  setCaseData: React.Dispatch<React.SetStateAction<FirstDayCase>>;
}): LiveCaseController;
```

Use `/api/first-day/extract`, include request/document IDs, parse the JSON as `FirstDayExtractionResponse`, call `adaptLiveExtraction`, then `mergeExtraction`. Keep the existing abort and token guards.

- [ ] **Step 2: Add a pure navigation gate and tests**

```ts
export function canEnterLiveStep(caseData: FirstDayCase, step: StepId) {
  if (caseData.mode !== "live") return true;
  if (step === "start" || step === "documents") return true;
  if (step === "facts") return caseData.facts.length > 0;
  return caseData.facts.some((fact) => fact.confirmationState === "confirmed");
}
```

Test that a new live case stops at Documents, a case with proposed facts opens Facts, and a case with one confirmed fact can open Plan but not bypass an unresolved invalid extraction error.

- [ ] **Step 3: Render live facts with existing event helpers**

FactsStep must use every fact's `semanticKey`, confidence, original value, and first evidence reference. For proposed facts show Confirm, Correct, and Not clear. Add an immutable `fact_marked_unclear` event to `CaseEvent` and `events.ts`; the planner treats it like base `unclear`.

Correction UI uses a labeled text input initialized from `originalValue` and calls `appendFactCorrection`. It must not mutate the Fact object.

- [ ] **Step 4: Update the live documents screen**

Replace the “next build step” message with counts:

```tsx
<p aria-live="polite">
  {readyPages} pages ready · {proposedFacts} facts to review · {failedPages} pages need attention
</p>
```

Continue becomes enabled when at least one validated fact exists. A failed page never disables review for successful pages.

- [ ] **Step 5: Browser acceptance**

With a configured development key, upload two synthetic pages. Verify sequential network requests, separate extracted text, proposed facts, fact confirmation, correction history, source dialog focus, removal, retry, and navigation. Without a key, verify the fictional case remains complete and the live error is recoverable.

- [ ] **Step 6: Commit**

```bash
git add app/features/first-day/ui app/features/first-day/domain tests/first-day/live-case.test.ts
git commit -m "feat: review source-backed facts from live pages"
```

### Task 7: Detect cross-document conflicts deterministically

**Files:**
- Create: `app/features/first-day/domain/conflicts.ts`
- Modify: `app/features/first-day/domain/types.ts`
- Modify: `app/features/first-day/domain/events.ts`
- Create: `tests/first-day/conflicts.test.ts`

- [ ] **Step 1: Write failing conflict tests**

Cover:

```ts
expect(detectConflicts(twoOrientationLocations)).toEqual([
  expect.objectContaining({ semanticKey: "orientation.location", factIds: ["fact-a", "fact-b"] }),
]);
expect(detectConflicts(registrationDateAndLetterDate)).toEqual([]);
expect(detectConflicts(sameNormalizedDate)).toEqual([]);
expect(resolveConflict(caseData, schoolReportEvent).events.at(-1)?.type)
  .toBe("school_confirmation_recorded");
```

- [ ] **Step 2: Extend conflict and event contracts**

```ts
export type Conflict = {
  id: string;
  semanticKey: string;
  label: string;
  factIds: string[];
  relatedTaskIds: string[];
  status: "open" | "resolved";
  resolutionEventId?: string;
};

export type SchoolConfirmationEvent = {
  id: string;
  type: "school_confirmation_recorded";
  conflictId: string;
  selectedFactId: string;
  reportedValue: string;
  timestamp: string;
};
```

Add `SchoolConfirmationEvent` to `CaseEvent`.

- [ ] **Step 3: Implement comparison and stable conflict IDs**

Group active, non-superseded facts by `semanticKey`. Compare trimmed `normalizedValue ?? originalValue` values. Create a conflict only when a group has at least two distinct values. Use `conflict-${semanticKey.replaceAll(".", "-")}` as its stable ID and preserve an existing resolved conflict when recomputing unrelated facts.

- [ ] **Step 4: Apply explicit resolutions**

`resolveConflict` must validate the conflict and selected fact, append the school-confirmation event, mark the selected fact effectively confirmed, and treat competing facts as superseded during planning. It must not rewrite evidence or fact records.

- [ ] **Step 5: Verify and commit**

Run `npm test -- tests/first-day/conflicts.test.ts tests/first-day/planner.test.ts tests/first-day/events.test.ts`.

```bash
git add app/features/first-day/domain tests/first-day/conflicts.test.ts
git commit -m "feat: detect and resolve cross-document conflicts"
```

### Task 8: Add the Round Rock ISD source-checked pilot

**Files:**
- Create: `app/features/first-day/content/procedures/round-rock-isd.ts`
- Create: `app/features/first-day/domain/procedures.ts`
- Create: `tests/first-day/procedures.test.ts`
- Modify: `docs/development-log.md`

- [ ] **Step 1: Write procedure eligibility tests**

```ts
expect(procedureEligibility(sourceChecked, "2026-09-16")).toBe("eligible");
expect(procedureEligibility(pending, "2026-09-16")).toBe("pending");
expect(procedureEligibility(oneYearOld, "2026-09-16")).toBe("stale");
expect(validateProcedureQuote(roundRockProcedure)).toBe(true);
```

- [ ] **Step 2: Add the pilot records using official quotations**

Create records for the new-student sequence and document list from:

- `https://www.roundrockisd.org/page/enroll`
- `https://www.roundrockisd.org/page/how-to-register`

Each record uses `reviewerStatus: "source_checked"`, `checkedAt: "2026-09-16"`, `ruleVersion: "rrisd-enrollment-2026-09-16"`, a direct URL, exact copied quote, and one narrow rule. Do not encode school-specific flyer text as district-wide policy. Do not use `school_reviewed` without written confirmation.

Use this initial exact content map from the official enrollment page, then verify each quote still appears before committing:

```ts
export const roundRockEnrollmentProcedures: Procedure[] = [
  {
    id: "procedure-rrisd-documents",
    district: "Round Rock ISD",
    sourceUrl: "https://www.roundrockisd.org/page/enroll",
    sourceSection: "What you'll need to begin — Student documentation",
    quote: "Certified birth certificate\nImmunization records\nProof of residence within Round Rock ISD boundaries\nLast report card or withdrawal form from the prior school district (if available)\nSocial Security Card (if available)",
    checkedAt: "2026-09-16",
    reviewerStatus: "source_checked",
    ruleVersion: "rrisd-enrollment-2026-09-16",
  },
  {
    id: "procedure-rrisd-enrollment-sequence",
    district: "Round Rock ISD",
    sourceUrl: "https://www.roundrockisd.org/page/enroll",
    sourceSection: "Steps to enroll",
    quote: "Create an account in the Round Rock ISD enrollment portal\nComplete your new student enrollment form\nSign up for a parent/guardian home access account",
    checkedAt: "2026-09-16",
    reviewerStatus: "source_checked",
    ruleVersion: "rrisd-enrollment-2026-09-16",
  },
];
```

- [ ] **Step 3: Implement eligibility**

```ts
export type ProcedureEligibility = "eligible" | "pending" | "stale";

export function procedureEligibility(procedure: Procedure, today: string): ProcedureEligibility {
  if (procedure.reviewerStatus === "pending") return "pending";
  if (procedure.reviewerStatus === "fictional") return "eligible";
  const age = Date.parse(today) - Date.parse(procedure.checkedAt);
  return age > 180 * 86_400_000 ? "stale" : "eligible";
}
```

`validateProcedureQuote` requires a non-empty exact quote, HTTPS official URL, checked date, and non-pending review state.

- [ ] **Step 4: Document attribution and verify**

Add source URLs, checked date, interpretation limits, and no-endorsement statement to `docs/development-log.md`. Run procedure and fixture tests.

- [ ] **Step 5: Commit**

```bash
git add app/features/first-day/content/procedures app/features/first-day/domain/procedures.ts tests/first-day/procedures.test.ts docs/development-log.md
git commit -m "feat: add source-checked Round Rock enrollment pilot"
```

### Task 9: Generate deterministic live tasks and blocker resolution

**Files:**
- Create: `app/features/first-day/domain/live-tasks.ts`
- Modify: `app/features/first-day/domain/planner.ts`
- Modify: `app/features/first-day/ui/plan-step.tsx`
- Modify: `app/features/first-day/ui/blocker-step.tsx`
- Create: `tests/first-day/live-tasks.test.ts`

- [ ] **Step 1: Write live planning tests**

Assert that:

```ts
expect(buildLiveTasks(confirmedCase, procedures).map((task) => task.id))
  .toEqual(["task-live-gather-documents", "task-live-open-enrollment", "task-live-review-plan"]);
expect(byId(planCase(caseWithPendingProcedure), "task-live-open-enrollment").state)
  .toBe("needs_review");
expect(byId(planCase(caseWithOpenConflict), "task-live-clarify-orientation-location").state)
  .toBe("needs_clarification");
expect(unrelatedTaskAfterResolution.state).toBe(unrelatedTaskBeforeResolution.state);
```

- [ ] **Step 2: Build tasks from explicit templates only**

`buildLiveTasks` may create only the five task families named in the design. Use stable IDs and dependencies that reference existing confirmed facts. A requested-item task uses `anyOf` only when an eligible procedure explicitly names an alternative. Do not turn arbitrary model next steps into tasks.

- [ ] **Step 3: Enforce live procedure eligibility in the planner**

Before dependency evaluation, inspect each live task's `procedureIds`. A missing, pending, or stale procedure produces `needs_review` with reason `A supporting procedure needs review before this step can be relied on.` Fictional cases keep their current behavior.

- [ ] **Step 4: Render live states and resolution**

PlanStep groups the derived tasks into Ready, Needs clarification, Waiting, Done, and Needs review. BlockerStep reads actual conflicts, shows both source quotes, and records `school_confirmation_recorded`. Label the action `Record what the school told me`; display `Reported confirmed by school` afterward.

Practice calls and drafted replies receive confirmed context and the prepared question, but their results have no callback capable of changing case facts or events.

- [ ] **Step 5: Verify and commit**

Run all First Day tests and browser-test that resolving one live conflict changes only its related task.

```bash
git add app/features/first-day/domain app/features/first-day/ui tests/first-day/live-tasks.test.ts
git commit -m "feat: derive explainable plans for live cases"
```

### Task 10: Export source-aware plans and confirmed dates

**Files:**
- Create: `app/features/first-day/export/calendar.ts`
- Create: `app/features/first-day/export/plan-document.ts`
- Modify: `app/features/first-day/ui/export-step.tsx`
- Create: `tests/first-day/calendar.test.ts`
- Create: `tests/first-day/plan-document.test.ts`

- [ ] **Step 1: Write failing calendar tests**

```ts
expect(calendarEvents(caseWithConfirmedDate)).toHaveLength(1);
expect(calendarEvents(caseWithProposedDate)).toEqual([]);
expect(calendarEvents(caseWithAmbiguousDate)).toEqual([]);
expect(calendarEvents(caseWithCorrectedDate)[0]?.uid).toBe("lantern-fact-registration-date");
expect(calendarEvents(caseWithCorrectedDate)[0]?.date).toBe("2026-08-13");
```

- [ ] **Step 2: Implement stable calendar generation**

Only include effective confirmed date facts whose normalized value begins with `YYYY-MM-DD`. Use `lantern-${fact.id}` as UID so a corrected date updates the same calendar event. Generate an all-day event without passing the date through the local JavaScript timezone.

- [ ] **Step 3: Write and implement the structured plan document**

Return:

```ts
export type PortablePlan = {
  schemaVersion: "lantern-plan-v1";
  generatedAt: string;
  caseMode: FirstDayCase["mode"];
  district: string;
  language: FirstDayCase["language"];
  tasks: Array<{ id: string; title: string; state: PlanState; reason: string; evidenceIds: string[]; procedureIds: string[] }>;
  confirmedFacts: Array<{ id: string; label: string; value: string; evidenceIds: string[] }>;
  unresolved: Array<{ id: string; label: string; factIds: string[] }>;
  procedures: Array<{ id: string; ruleVersion: string; reviewerStatus: ProcedureReviewState; checkedAt: string }>;
};
```

The JSON download excludes extracted page text and document images; it keeps IDs and human-readable confirmed values.

- [ ] **Step 4: Update export UI and print order**

Show unresolved items before ready tasks, then confirmed facts and procedure review metadata. Add Download plan JSON and Add confirmed dates to calendar. Keep Print/save PDF. Disable calendar when no eligible date exists and explain why.

- [ ] **Step 5: Verify and commit**

Run export tests. Browser-check print preview at Letter and A4 sizes for clipped quotes or controls.

```bash
git add app/features/first-day/export app/features/first-day/ui/export-step.tsx tests/first-day/calendar.test.ts tests/first-day/plan-document.test.ts
git commit -m "feat: export source-aware First Day plans"
```

### Task 11: Build the held-out evaluation harness

**Files:**
- Create: `evaluation/first-day/README.md`
- Create: `evaluation/first-day/fixtures/*.json`
- Create: `evaluation/first-day/expectations/*.json`
- Create: `evaluation/first-day/run.ts`
- Create: `evaluation/first-day/report.md`
- Create: `tests/first-day/evaluation.test.ts`
- Modify: `package.json`

- [ ] **Step 1: Define a non-provider evaluation record**

```ts
export type EvaluationExpectation = {
  fixtureId: string;
  expectedFacts: Array<{ semanticKey: string; originalValue: string; quote: string }>;
  expectedConflicts: Array<{ semanticKey: string; values: string[] }>;
  expectedReadyTaskIds: string[];
  expectedClarificationTaskIds: string[];
};
```

Fixtures contain synthetic extracted text and stored provider-shaped responses, never personal documents. Expectations are authored before running the domain pipeline.

- [ ] **Step 2: Add 20 held-out packets across five scenarios**

Create four fixtures each for straightforward enrollment, ambiguous dates, conflicting locations, documented alternatives, and follow-up corrections. Each fixture uses invented names, addresses, identifiers, and dates and begins with `SYNTHETIC TEST DOCUMENT`.

- [ ] **Step 3: Implement metric calculations**

`run.ts` computes fact precision/recall, quote coverage, conflict true/false positives and negatives, date errors, ready-task source coverage, and per-fixture failures. Accept optional latency/cost inputs but never fabricate them; report `not measured` when absent.

- [ ] **Step 4: Add a deterministic regression test and script**

Add `"evaluate:first-day": "tsx evaluation/first-day/run.ts"` and `tsx` as a dev dependency. The test asserts 100% valid quote coverage and task source coverage on stored responses, plus zero false conflicts in the expected no-conflict fixtures.

- [ ] **Step 5: Generate the initial report and commit**

Run `npm run evaluate:first-day`, write exact denominators and failures to `report.md`, then:

```bash
git add evaluation tests/first-day/evaluation.test.ts package.json package-lock.json
git commit -m "test: add held-out First Day evaluation"
```

### Task 12: Finish the competition package and production release

**Files:**
- Create: `app/first-day/how-it-works/page.tsx`
- Create: `docs/submission/demo-script.md`
- Create: `docs/submission/ai-disclosure.md`
- Create: `docs/submission/checklist.md`
- Modify: `README.md`
- Modify: `docs/development-log.md`

- [ ] **Step 1: Add the technical explanation page**

Render a static, accessible five-stage explanation:

```text
Document → Exact evidence → Confirmed fact → Explicit dependency → Derived task state
```

Use one fictional record at each stage. Explain that AI proposes the first two stages while validation, confirmation, dependencies, and task status are deterministic. Link to this page from the First Day footer, not the critical family path.

- [ ] **Step 2: Write the exact three-minute script**

Use the timing in the approved design. The script names tools and coding languages, demonstrates functionality, states the target audience and one-sentence purpose, explains one technical challenge, and keeps every factual claim within measured results.

- [ ] **Step 3: Complete AI and contribution disclosure**

List provider-backed runtime features separately from development assistance. Identify student-authored architecture decisions, domain rules, tests, source review, evaluation, and presentation work. Include the upstream `TRANSLATEtheform` revision and all material libraries.

- [ ] **Step 4: Run the full release gate**

```bash
npm run lint
npm test
npm run evaluate:first-day
npm run build
git diff --check
```

Browser acceptance: `/`, `/first-day`, and `/first-day/how-it-works`; 390×844 and 1440×900; keyboard-only; English/Spanish; high contrast; large text; reduced motion; source dialog trap/restore; live missing-key recovery; fictional full flow; print preview; zero axe WCAG A/AA violations.

- [ ] **Step 5: Configure and verify production safely**

Add `GROQ_API_KEY` directly through Vercel's encrypted environment UI or authenticated CLI stdin; never place the value in shell history, Git, logs, or chat. Redeploy production and verify:

```text
GET /                      200
GET /first-day             200
GET /first-day/how-it-works 200
GET /api/health            200 with groq: true
```

Run one synthetic upload and the complete fictional flow. Inspect build/runtime errors without reading or retaining document content.

- [ ] **Step 6: Commit documentation and tag the candidate**

```bash
git add app/first-day/how-it-works README.md docs/development-log.md docs/submission
git commit -m "docs: prepare Lantern competition submission"
git tag competition-candidate-v1
git push origin main competition-candidate-v1
```

Deploy the tagged commit and record its URL and deployment ID in `docs/submission/checklist.md` only after the deployment reaches READY.

## Final acceptance checklist

- [ ] General Lantern remains backward compatible.
- [ ] Fictional First Day works without provider access.
- [ ] Live pages process sequentially and independently.
- [ ] Every proposed fact has a quote from the correct source.
- [ ] Corrections preserve originals and append history.
- [ ] Conflict resolution changes affected tasks only.
- [ ] Pending or stale procedures cannot make a live task ready.
- [ ] Practice outputs cannot confirm facts.
- [ ] Calendar output contains confirmed unambiguous dates only.
- [ ] Print and JSON output expose unresolved items and rule versions.
- [ ] Logs contain no raw image or extracted document text.
- [ ] Evaluation reports denominators, failures, latency, and cost honestly.
- [ ] The deployed demo and repository match submission claims.
- [ ] AI use and student contribution are fully disclosed.
