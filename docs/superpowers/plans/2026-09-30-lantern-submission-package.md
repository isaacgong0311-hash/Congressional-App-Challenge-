# Lantern Submission Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a truthful, judge-ready written and video submission package aligned with the working Decision Trace release.

**Architecture:** Keep submission artifacts as versioned Markdown beside the existing AI disclosure and release checklist. The demo script follows the exact provider-free six-beat product path. A manifest records the precise status of code, deployment, video, captions, transcript, and submission answers without using blank placeholders or claiming unfinished work is complete.

**Tech Stack:** Markdown, Git, the existing Next.js judge demo, word-count and repository verification commands.

---

## Task 1: Rewrite the 2:50 demonstration around Decision Trace

**Files:**

- Modify: `docs/submission/demo-script.md`

- [ ] **Step 1: Preserve every required element**

The spoken script must state:

- participant name: Isaac Gong;
- app name: Lantern: First Day;
- purpose in one sentence;
- target audience: newcomer families navigating school enrollment;
- working functionality;
- tools/languages: Next.js, React, TypeScript, Zod, Vitest, and Playwright;
- runtime AI boundary and development-assistance disclosure direction.

- [ ] **Step 2: Align narration to the six real beats**

Use these timing windows:

```text
0:00–0:20 identity, audience, purpose
0:20–0:45 scattered fictional documents
0:45–1:10 exact-source review
1:10–1:38 preserved conflict
1:38–2:08 focused update and Decision Trace
2:08–2:30 Spanish family output
2:30–2:50 engineering proof and close
```

The Decision Trace segment must name the five visible stages: source evidence, proposed facts, human decision, dependency logic, and plan result. It must say that the same immutable event powers the normal planner and trace.

- [ ] **Step 3: Remove unsupported or distracting claims**

Do not claim family validation, district partnership, provider benchmarks, real-world impact, or independent accuracy. Describe the held-out metrics as synthetic offline regression results.

- [ ] **Step 4: Add exact on-screen actions**

For every spoken section, include a short `On screen:` instruction using controls that exist in the current release. Include reset rehearsal, readable zoom, Spanish switch, proof panel, and final return to the app name.

- [ ] **Step 5: Check spoken length**

```bash
sed -n '/^> /s/^> //p' docs/submission/demo-script.md | wc -w
```

Expected: approximately 330–390 spoken words, suitable for a deliberate 2:45–2:55 delivery after rehearsal.

## Task 2: Draft concise written application answers

**Files:**

- Create: `docs/submission/written-answers.md`

- [ ] **Step 1: Write final-answer sections**

Include:

- app title;
- one-sentence purpose;
- inspiration/problem;
- target audience;
- how the app works;
- technical challenge and solution;
- tools and languages;
- what was learned;
- responsible future direction;
- accessibility and privacy;
- AI and reused-code disclosure summary.

- [ ] **Step 2: Ground technical ownership**

The technical answer must explain exact-quote validation, immutable events, conflict-aware dependencies, deterministic planning, Decision Trace as a read-only projection, and provider-free judge mode in plain language Isaac can defend.

- [ ] **Step 3: Bound every evidence claim**

Use exact denominators for synthetic evaluation. State that the human usability protocol is prepared but has no sessions yet. State that Round Rock ISD is a source-checked independent pilot with no affiliation, review, or endorsement.

- [ ] **Step 4: Add source-of-truth links**

Link to the code tour, evaluation report, usability report, AI disclosure, and README. Avoid external marketing claims.

## Task 3: Create the recording and release checklist

**Files:**

- Create: `docs/submission/video-production-checklist.md`
- Create: `docs/submission/submission-manifest.md`
- Modify: `docs/submission/checklist.md`

- [ ] **Step 1: Define pre-recording checks**

Cover clean browser profile, notification suppression, no secrets or personal data, release URL health, provider-free request monitoring, reset, English and Spanish paths, 1440×900 or larger capture, cursor visibility, microphone test, and final script rehearsal.

- [ ] **Step 2: Define recording acceptance**

Require 1–3 minute duration, readable text, clean audio, captions, transcript, public unlisted/public link, exact required spoken fields, fictional/non-affiliation labels, and no edits that misrepresent state transitions.

- [ ] **Step 3: Create a status manifest without blanks**

Record current truthful values:

```text
code status: implemented and locally verified
deployment status: current production predates this Decision Trace release
video status: not recorded
captions status: not created
transcript status: draft script only
written answers status: drafted, awaiting form-length adaptation
usability status: protocol ready, zero sessions
submission status: not submitted
```

Explain which fields must be changed only after evidence exists.

- [ ] **Step 4: Update the main checklist**

Add unchecked Decision Trace deployment, five-person study, video, caption, transcript, manifest, final tag, and submission confirmation gates. Do not alter previously recorded historical deployment identities.

## Task 4: Verify and commit the package

**Files:**

- Modify: all files from Tasks 1–3

- [ ] **Step 1: Scan for accidental claims and placeholders**

```bash
rg -n "TBD|TODO|coming soon|validated by families|partnered with|endorsed by" docs/submission
```

Expected: no unsupported positive claim and no blank placeholder language.

- [ ] **Step 2: Verify repository references**

```bash
test -f docs/submission/decision-trace-code-tour.md
test -f evaluation/first-day/report.md
test -f evaluation/usability/report.md
test -f docs/submission/ai-disclosure.md
git diff --check
```

Expected: exit 0.

- [ ] **Step 3: Commit**

```bash
git add docs/submission docs/superpowers/plans/2026-09-30-lantern-submission-package.md
git commit -m "docs: prepare Lantern competition submission package"
```

## Human-only completion gate

Do not publish a video link, mark captions complete, claim usability findings, create the final submission tag, or mark the Congressional App Challenge submission complete until the corresponding artifact or confirmation actually exists. Recording, public upload, form submission, and participant sessions require human action outside this repository.
