# Lantern 2026 Congressional App Challenge Winning Submission Design

**Date:** 2026-09-30  
**Target deadline:** 2026-10-26 at 12:00 p.m. EDT  
**Internal submission target:** 2026-10-24  
**Status:** Approved design  
**Project:** Lantern: First Day

## 1. Objective

Produce the strongest possible 2026 Congressional App Challenge submission from the existing Lantern codebase without diluting the product, inventing traction, or hiding the role of AI-assisted development.

The submission must make three things obvious within three minutes:

1. Lantern addresses a specific, consequential community problem for newcomer families.
2. The working experience is unusually thoughtful, trustworthy, and polished for a student project.
3. Isaac understands and owns the important technical decisions, including the boundary between AI proposals and deterministic planning code.

The national rules allow any topic and platform, require a functional app, permit disclosed AI assistance, and identify idea quality, implementation/UX, and coding skill as the main judging criteria. The required public demonstration video must be one to three minutes and include the participant name, app name, purpose, target audience, tools/languages, and working functionality.

Official sources:

- 2026 rules: <https://www.congressionalappchallenge.us/wp-content/uploads/2026/05/2026-CAC-Rules.pdf>
- Student rules and dates: <https://www.congressionalappchallenge.us/students/rules/>
- CAC Top Apps criteria: <https://www.congressionalappchallenge.us/cac-top-apps-presented-by-thecoderschool/>

## 2. Strategic Choice

The project will follow a competition-first evidence strategy.

Before submission, Lantern will not add accounts, payments, pricing, broad district coverage, or persistent document storage. Those features consume time, add privacy risk, and weaken the competition story. The work will instead deepen one coherent experience, expose its technical sophistication, validate it honestly, and make the submission package exceptional.

The competition product is **Lantern: First Day**. The general letter explainer remains available but is secondary in the homepage hierarchy, demonstration, written answers, and code tour.

The submission north star is:

> In under three minutes, a judge understands the human problem, sees a trustworthy working solution, and can tell that Isaac understands and authored the important technical decisions.

## 3. Product Story

Lantern helps newcomer families turn scattered school-enrollment instructions into a source-linked plan they can inspect, question, and carry.

The story has six beats:

1. A fictional family begins with three scattered pages.
2. AI proposes facts, each constrained by an exact source quotation.
3. The family reviews questions that the documents cannot answer for them.
4. Lantern preserves two conflicting orientation locations instead of guessing.
5. A school-reported answer changes only the dependent task.
6. The family leaves with a bilingual printable plan and confirmed calendar dates.

The fictional Mesa View case remains the primary judge journey because it is complete, deterministic, safe, fast, and independent of provider availability. The live Round Rock ISD workflow remains a secondary proof that the architecture can process real document images using source-checked local procedures. It must always be labeled as an independent student pilot without district affiliation, review, or endorsement.

## 4. Technical Signature: Decision Trace

### 4.1 Purpose

The most sophisticated part of Lantern is currently hidden inside domain code. Decision Trace will make that work visible and understandable.

For any plan task, a trace will show:

```text
source passage
  → extracted fact
  → family or school-reported decision
  → dependency evaluation
  → current task state
```

For the orientation conflict, the trace must show both source passages, the open conflict, the recorded school answer, and the single task transition from needs clarification to ready. Original facts and evidence remain visible after resolution.

### 4.2 Domain boundary

A new pure domain module will construct trace data from:

- `FirstDayCase.documents`
- `FirstDayCase.evidence`
- `FirstDayCase.facts`
- `FirstDayCase.conflicts`
- `FirstDayCase.procedures`
- `FirstDayCase.events`
- the deterministic `PlannerResult`

The module will return typed nodes, typed edges, a current task state, a human-readable reason, and source identifiers. It will perform no React rendering, browser access, network calls, or model calls.

The initial trace node kinds will be:

- document;
- evidence passage;
- proposed or effective fact;
- family decision;
- school-reported conflict resolution;
- procedure;
- dependency rule;
- derived task state.

The module must be deterministic: the same case and event sequence always produce the same trace. Events remain append-only. A trace may explain a result but may not change case state.

### 4.3 UI boundary

The trace UI will render the domain model as a responsive vertical flow on small screens and a compact connected flow on larger screens. It will use semantic lists and text relationships first; connector lines and motion are progressive enhancements.

Each task card will expose a “Trace this decision” action. Judge mode will automatically open the orientation trace during the focused-update beat. The trace must remain legible with animation disabled, support keyboard navigation, and provide equivalent text for screen readers.

The UI will never describe model output as verified. Labels will distinguish:

- source text;
- AI proposal;
- family-confirmed fact;
- school-reported answer;
- deterministic rule result.

### 4.4 Replay

Judge mode will include a focused replay for the orientation task:

1. show both conflicting source facts;
2. show the task blocked by the open conflict;
3. apply the already-recorded fictional school answer;
4. show the dependent task becoming ready;
5. show unrelated task states remaining unchanged.

Replay is a presentation of pre-existing fictional state transitions, not a second state engine. It must use the same event and planner functions as the normal product.

## 5. Judge Mode

Judge mode will remain provider-free and will be the exact path recorded in the submission video.

Required capabilities:

- start from a known clean fictional case;
- one-click reset from any beat;
- six beats aligned to a 2:45–2:55 script;
- state-derived guidance and progression locks;
- no external AI, analytics, fonts, or document-provider dependency that can block the core journey;
- visible fictional-data labeling;
- a Decision Trace moment;
- an engineering proof panel;
- a final evaluation/impact panel containing only versioned claims;
- functional print, JSON, and calendar output;
- complete judge-critical English and Spanish interface copy.

Judge mode may preload local assets, but it must not fake a network-backed success state. All state changes must pass through the real domain event and planner code.

## 6. Live Workflow

The live document workflow is secondary but must be credible.

It will:

- accept only supported image types and bounded sizes;
- process pages independently so one failure does not erase successful work;
- validate structured provider responses and exact supporting quotes;
- expose timeout, malformed response, unavailable provider, partial success, retry, and removal states;
- keep uploaded content out of persistent browser storage and the application database;
- use only current, versioned, source-checked procedures to make live tasks ready;
- display the non-affiliation statement for Round Rock ISD;
- never become a dependency of the fictional demo or submission video.

Provider production activation is an operational release task, not a reason to weaken the provider-free demo.

## 7. Community Validation

### 7.1 Study design

Target approximately five consenting adults, ideally including parents, educators, bilingual community members, or people who have helped families navigate enrollment. Use only fictional documents.

Each session will ask the participant to:

1. identify the enrollment date and location;
2. identify required or optional preparation steps;
3. notice the contradictory orientation locations;
4. find the source supporting a proposed fact;
5. explain what remains unresolved;
6. produce or describe the next action.

### 7.2 Measures

Record:

- correct-step completion count;
- unsupported or incorrect conclusions;
- conflict-detection success;
- source-finding success;
- task completion time;
- confidence before and after Lantern;
- major points of confusion;
- one open-ended improvement suggestion.

The evaluation report must include participant count, task count, denominators, failures, test materials, protocol, limitations, and the distinction between observed behavior and inference.

### 7.3 Privacy and fallback

Do not collect real school documents, student records, immigration information, medical information, or other sensitive case details. Store only the minimum anonymous notes required for aggregate results.

If suitable participants cannot be recruited, publish the result as an expert or heuristic walkthrough. Do not call it a user study or imply family validation.

## 8. Submission Package

### 8.1 Demonstration video

The public YouTube or Vimeo video will run between 2:45 and 2:55 and include every item required by the rules:

- Isaac’s name;
- Lantern: First Day;
- one clear purpose sentence;
- target audience;
- tools and programming languages;
- working functionality.

The video structure will be:

- 0:00–0:20 — participant, audience, purpose, community problem;
- 0:20–0:45 — scattered fictional documents;
- 0:45–1:10 — exact-quote evidence and family review;
- 1:10–1:40 — preserved conflict;
- 1:40–2:05 — Decision Trace and focused update;
- 2:05–2:30 — bilingual family output;
- 2:30–2:50 — architecture, testing, measured results, and close.

The recording will use the exact tagged release candidate. It will have readable zoom, captions, a transcript, clean audio, and no private browser data or developer secrets.

### 8.2 Written answers

Prepare final, concise answers for:

- app title;
- purpose;
- inspiration;
- target audience;
- technical/coding difficulty and solution;
- learning and biggest takeaway;
- responsible 2.0 vision.

The technical challenge answer will focus on preserving uncertainty while deriving a useful plan: exact-quote validation, immutable events, conflict-aware dependencies, and deterministic trace output.

### 8.3 Code and authorship materials

The repository will include:

- a judge quick-start section;
- a concise architecture diagram;
- a Decision Trace explanation;
- current local setup and verification commands;
- versioned evaluation reports;
- an AI/open-source/reused-code disclosure;
- a student-contribution statement;
- a source-code tour with the most important files;
- an immutable submission tag.

AI usage must be fully disclosed. The disclosure will explain where AI assisted development, what Isaac decided and implemented, how generated suggestions were reviewed and tested, and how runtime AI is constrained. Isaac must understand every highlighted component.

## 9. Quality and Verification

### 9.1 Domain tests

Add unit and invariant coverage for:

- stable trace output for identical input;
- chronological event application;
- source removal invalidating dependent trace branches;
- corrections preserving original evidence;
- conflict resolution selecting one effective value without erasing alternatives;
- unrelated tasks remaining unchanged;
- missing references returning explicit trace errors;
- stale or pending procedures preventing ready states;
- replay matching the final planner result.

### 9.2 Browser tests

Cover:

- the complete judge journey without provider calls;
- trace opening, keyboard use, and screen-reader relationships;
- judge reset from every beat;
- English and Spanish competition paths;
- mobile, tablet, desktop, and wide layouts;
- print and calendar downloads;
- reduced motion and high contrast;
- 404 and recovery routes;
- provider success and every defined failure state with synthetic fixtures.

### 9.3 Accessibility and performance budgets

Submission blockers include serious or critical axe violations on judge-critical routes, keyboard traps, clipped controls, hidden content when JavaScript animation is unavailable, or loss of meaning without visual connectors.

Performance budgets will be recorded against a production build and a representative mobile profile. The fictional judge path must not make provider requests. Any third-party dependency used outside that path must fail without preventing navigation or access to core content.

### 9.4 Release gates

The release is blocked by:

- a broken or contradictory demo state;
- an inaccessible critical action;
- inconsistent names, dates, locations, counts, or selected answers;
- a missing or inaccurate AI/reuse disclosure;
- an unsupported evaluation claim;
- a production route or download failure;
- an unavailable public video;
- a mismatch between deployed code, tagged code, video, transcript, or written answers;
- accidental inclusion of secrets or real family documents.

## 10. Schedule

### September 30–October 5: technical centerpiece

- implement Decision Trace domain types and builder;
- implement trace UI and orientation replay;
- integrate trace into judge mode;
- add focused unit and browser coverage;
- write the architecture and code-explanation notes.

### October 6–10: honest validation

- finalize fictional study materials and consent language;
- run approximately five sessions if participants are available;
- record anonymous results;
- publish a versioned report;
- convert only repeated or severe findings into product changes.

### October 11–16: submission-quality hardening

- finish validation-driven fixes;
- finish judge-critical localization;
- verify provider boundaries and source freshness;
- complete accessibility, performance, print, and responsive checks;
- freeze new feature work on October 16.

### October 17–21: submission materials

- finalize the demonstration script;
- record and edit the public video;
- produce captions and transcript;
- finalize written answers, architecture diagram, disclosure, code tour, and quick start;
- run a mock judge review.

### October 22–24: release freeze and early submission

- tag the release candidate;
- deploy and verify the exact commit;
- run the complete automated and manual release matrix;
- test the public video while logged out;
- save offline backups of the video, transcript, screenshots, source archive, and answers;
- submit by October 24, leaving a two-day safety buffer.

## 11. Judging Alignment

### Quality and originality

Lantern does not merely summarize documents. It preserves source identity, exposes uncertainty, records human decisions, and produces an inspectable plan. Decision Trace makes that original trust model visible.

### Implementation, UX, and design

The submission demonstrates a complete bilingual workflow, source inspection, conflict resolution, responsive interaction, accessibility, and family-usable outputs. The judge path is polished and resilient rather than dependent on live AI performance.

### Coding and programming excellence

The technical case rests on typed domain models, exact-quote validation, immutable event history, deterministic dependency evaluation, pure trace-graph construction, provider isolation, comprehensive tests, and reproducible evaluation.

### Top Apps potential

The design emphasizes the three published Top Apps qualities: technical sophistication, creativity, and community impact. It pursues impact through honest validation rather than unsupported scale claims.

## 12. Definition of Done

The submission is ready when:

1. The provider-free judge journey completes from a fresh browser in under three minutes.
2. Every judge-visible plan state has an inspectable source-to-decision trace.
3. Replaying the same events produces the same plan and trace.
4. Conflict resolution changes only the dependent task.
5. English and Spanish judge-critical paths are complete.
6. Mobile, desktop, keyboard, reduced-motion, print, and screen-reader checks pass.
7. Production meets the recorded performance and accessibility budgets.
8. Every evaluation claim points to a versioned report with denominators and limitations.
9. The deployed commit, repository tag, video, transcript, disclosures, and written answers agree.
10. Isaac can explain the architecture, one difficult bug, the runtime AI boundary, the development-assistance disclosure, evaluation limitations, and his personal contributions without relying on marketing language.

## 13. Non-Goals Before Submission

- accounts or authentication;
- payments or pricing;
- persistent family document storage;
- a nationwide school-policy database;
- support for multiple districts;
- unsupported accuracy, usage, or impact claims;
- a wholesale visual redesign;
- additional AI features that do not improve the judging story;
- refactors without a direct reliability, comprehension, or submission benefit.

If time compresses, submission integrity, demo reliability, disclosure accuracy, and the required materials take priority over every optional enhancement.
