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

## AI assistance disclosure

OpenAI Codex assisted with:

- repository inspection and source mapping;
- design and implementation-plan drafting;
- TypeScript domain and test implementation;
- React component and CSS implementation;
- debugging compiler, lint, and dependency-version issues;
- documentation drafting.

The student is responsible for reviewing, understanding, testing, adapting, and presenting the submitted work. Before submission, the student should be able to explain the evidence model, why unknown does not equal false, how all-of/any-of dependencies work, how a source removal affects completed tasks, and why simulated call responses cannot confirm real facts.
