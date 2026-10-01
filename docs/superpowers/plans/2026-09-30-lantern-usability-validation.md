# Lantern Usability Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a privacy-safe, repeatable five-adult usability study package and a deterministic report generator that clearly distinguishes an unrun protocol from observed results.

**Architecture:** Store the study protocol and anonymous structured observations under `evaluation/usability/`. Validate observations with Zod before computing any claim. A pure summary module produces metrics and Markdown; a small runner writes the versioned report. Empty data must generate an explicit “not yet run” report, never zero-valued research claims.

**Tech Stack:** TypeScript, Zod, Vitest, tsx, Markdown, JSON.

---

## File map

- `evaluation/usability/README.md` — operator instructions, privacy boundary, and study status.
- `evaluation/usability/protocol.md` — recruitment, consent, setup, moderator rules, six tasks, measures, and stop conditions.
- `evaluation/usability/session-sheet.md` — printable session worksheet that uses anonymous IDs only.
- `evaluation/usability/sessions.json` — versioned structured observations; begins empty.
- `evaluation/usability/summary.ts` — schemas, validation, aggregation, and Markdown generation.
- `evaluation/usability/run.ts` — reads `sessions.json` and writes `report.md`.
- `evaluation/usability/report.md` — generated status/results report.
- `tests/first-day/usability-summary.test.ts` — protects denominators, privacy-safe status language, and invalid-data rejection.
- `package.json` — adds `evaluate:usability`.

## Task 1: Create the research protocol

**Files:**

- Create: `evaluation/usability/README.md`
- Create: `evaluation/usability/protocol.md`
- Create: `evaluation/usability/session-sheet.md`

- [ ] **Step 1: Write the operating boundary**

State all of the following directly:

- adults only;
- approximately five sessions;
- fictional Mesa View documents only;
- no names, contact details, real school documents, student records, immigration details, health details, audio, video, or screen recording;
- participation is voluntary and can stop at any time;
- no compensation is promised;
- the moderator may help only after a task is marked incomplete;
- an unrun protocol is not a user study.

- [ ] **Step 2: Define the six tasks and success rules**

Use these stable task IDs:

```text
identify_enrollment
identify_preparation
detect_orientation_conflict
find_source
explain_unresolved
choose_next_action
```

Each task must have observable success, partial, and not-completed criteria. Start at `/first-day`, use “Open the sample case,” and do not use guided demo mode because its prompts would bias discovery.

- [ ] **Step 3: Define the moderator script**

Include a neutral introduction, consent confirmation, pre-task confidence question, think-aloud reminder, prompts that do not reveal controls, post-task confidence question, one improvement question, and a debrief explaining that the district and case are fictional.

- [ ] **Step 4: Create the anonymous session sheet**

The sheet must record only participant ID `U01`–`U99`, interface language, task outcomes, elapsed seconds, unsupported-conclusion count, coded confusion categories, confidence before/after, and one paraphrased suggestion. Include a “do not write identifying information” warning at the top.

- [ ] **Step 5: Review for unsupported claims**

Run:

```bash
rg -n "validated|proved|users found|families said|impact" evaluation/usability
```

Expected: no sentence implies sessions occurred.

- [ ] **Step 6: Commit the protocol**

```bash
git add evaluation/usability/README.md evaluation/usability/protocol.md evaluation/usability/session-sheet.md
git commit -m "docs: add privacy-safe Lantern usability protocol"
```

## Task 2: Build the validated observation model

**Files:**

- Create: `evaluation/usability/summary.ts`
- Create: `tests/first-day/usability-summary.test.ts`

- [ ] **Step 1: Write failing validation tests**

Test that `parseUsabilityDataset`:

```ts
expect(() => parseUsabilityDataset({ studyStatus: "not_started", sessions: [] }))
  .not.toThrow();

expect(() => parseUsabilityDataset({
  studyStatus: "complete",
  sessions: [validSession("U01")],
})).toThrow(/at least 5/);
```

Also reject duplicate participant IDs, duplicate or missing task IDs, non-adult/unconfirmed consent, confidence outside 1–5, non-positive time, unknown confusion codes, and suggestion summaries longer than 240 characters.

- [ ] **Step 2: Run the focused test and verify failure**

```bash
npm test -- tests/first-day/usability-summary.test.ts
```

Expected: FAIL because `evaluation/usability/summary.ts` does not exist.

- [ ] **Step 3: Implement Zod schemas**

Export:

```ts
export const USABILITY_TASK_IDS = [
  "identify_enrollment",
  "identify_preparation",
  "detect_orientation_conflict",
  "find_source",
  "explain_unresolved",
  "choose_next_action",
] as const;

export const CONFUSION_CODES = [
  "navigation",
  "source_provenance",
  "status_language",
  "conflict_resolution",
  "decision_trace",
  "export",
  "none",
] as const;

export function parseUsabilityDataset(input: unknown): UsabilityDataset;
```

Dataset refinements:

- `not_started` requires zero sessions;
- `in_progress` requires one to four sessions;
- `complete` requires at least five sessions;
- participant IDs are unique;
- each session has each required task exactly once;
- consent must be the literal value `true` and the participant must confirm they are an adult;
- text fields are trimmed and bounded.

- [ ] **Step 4: Run validation tests**

```bash
npm test -- tests/first-day/usability-summary.test.ts
```

Expected: validation tests PASS.

- [ ] **Step 5: Commit the observation model**

```bash
git add evaluation/usability/summary.ts tests/first-day/usability-summary.test.ts
git commit -m "feat: validate anonymous usability observations"
```

## Task 3: Generate honest study metrics

**Files:**

- Modify: `evaluation/usability/summary.ts`
- Modify: `tests/first-day/usability-summary.test.ts`

- [ ] **Step 1: Write failing summary tests**

For an empty dataset, assert that `summarizeUsabilityStudy` returns Markdown containing:

```text
Status: Not started
No participant sessions have been recorded.
This protocol must not be described as a completed user study.
```

For five valid sessions, assert exact denominators for:

- participants;
- successful task attempts out of 30;
- each task's successes out of five;
- conflict-detection success;
- source-finding success;
- unsupported conclusions;
- mean total session time;
- mean confidence before, after, and change.

Use a fixture where the expected arithmetic can be calculated by inspection. Do not round counts; round averages to one decimal place.

- [ ] **Step 2: Run the focused test and verify failure**

```bash
npm test -- tests/first-day/usability-summary.test.ts
```

Expected: FAIL because the summary function is missing.

- [ ] **Step 3: Implement the pure summary**

Export:

```ts
export function summarizeUsabilityStudy(input: unknown): string;
```

The Markdown must include:

- generated-data status;
- methodology and synthetic-data boundary;
- dataset size;
- task results with numerator and denominator;
- safety/error results;
- confidence results;
- coded confusion counts;
- anonymous paraphrased suggestions when present;
- failures and limitations;
- an explicit sentence that observed behavior does not establish impact on real enrollment outcomes.

When fewer than five sessions exist, label results `Preliminary — study in progress` and keep the actual denominator.

- [ ] **Step 4: Run focused and full unit tests**

```bash
npm test -- tests/first-day/usability-summary.test.ts
npm test
```

Expected: all tests PASS.

- [ ] **Step 5: Commit the summarizer**

```bash
git add evaluation/usability/summary.ts tests/first-day/usability-summary.test.ts
git commit -m "feat: generate denominator-safe usability report"
```

## Task 4: Add the versioned runner and empty status report

**Files:**

- Create: `evaluation/usability/sessions.json`
- Create: `evaluation/usability/run.ts`
- Create: `evaluation/usability/report.md`
- Modify: `package.json`
- Modify: `README.md`

- [ ] **Step 1: Create the empty source dataset**

```json
{
  "studyStatus": "not_started",
  "sessions": []
}
```

- [ ] **Step 2: Implement the runner**

The runner reads `sessions.json`, calls `summarizeUsabilityStudy`, writes `report.md`, and prints the same report. It must exit non-zero on validation failure.

- [ ] **Step 3: Add the command**

Add:

```json
"evaluate:usability": "tsx evaluation/usability/run.ts"
```

- [ ] **Step 4: Generate the initial report**

```bash
npm run evaluate:usability
```

Expected: exit 0 and a report headed `Lantern usability validation` with `Status: Not started`.

- [ ] **Step 5: Update repository instructions**

Link the protocol and report from `README.md`. Say plainly that the protocol is prepared but no participant sessions have been recorded.

- [ ] **Step 6: Run the release checks**

```bash
npm run lint
npm test
npm run evaluate:usability
npm run build
git diff --check
```

Expected: all commands PASS and the generated report remains unchanged on a second run.

- [ ] **Step 7: Commit the runnable study package**

```bash
git add evaluation/usability package.json README.md
git commit -m "docs: make Lantern usability study runnable"
```

## Human-only execution gate

Do not mark the study complete in code or documentation until at least five eligible adults have voluntarily completed the protocol and their anonymous structured observations have been reviewed for accuracy. Do not fabricate sessions, infer missing task outcomes, or convert moderator expectations into participant findings. Product changes should be based on repeated or severe observed problems and documented separately.
