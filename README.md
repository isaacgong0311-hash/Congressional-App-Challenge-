# Lantern: First Day

Lantern helps people understand confusing official letters. **First Day** extends it into a source-backed school-enrollment planner for newcomer families: collect instructions, verify important facts against their source, resolve uncertainty, and leave with a clear plan.

This repository builds from the public [`TRANSLATEtheform`](https://github.com/isaacgong0311-hash/TRANSLATEtheform) application at commit `479ff86a30890c76a4ec0240406e66d9de4aa6ce`. It is now an independent Congressional App Challenge project.

## Current status

The imported Lantern letter explanation tool remains available at `/`. A complete First Day fictional demo is available at `/first-day`, with source-linked facts, deterministic task states, conflict resolution, English/Spanish interface copy, JSON and calendar downloads, and printable output. A static technical walkthrough is available at `/first-day/how-it-works`.

First Day also includes a live Round Rock ISD pilot for up to five JPG/PNG pages. It processes pages sequentially, preserves successful pages when another fails, supports per-page retry and removal, validates exact evidence quotes, and keeps live plans limited to versioned, source-checked enrollment procedures. This pilot is not reviewed, endorsed, or partnered with Round Rock ISD.

The initial First Day school and district scenario is **fictional**. It exists to test evidence handling and deterministic plan logic; it is not real district policy or proof of a school partnership.

## Local setup

Requirements: Node.js 20 or newer and npm.

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Provider-backed features use environment variables when available:

- `GROQ_API_KEY` — document explanation and the grounded assistant
- `ELEVENLABS_API_KEY` — optional server speech
- `PERPLEXITY_API_KEY` — optional local-help search

Do not commit `.env.local` or real family documents.

## Checks

```bash
npm run lint
npm test
npm run evaluate:first-day
npm run build
npm run test:e2e
```

The deterministic evaluation contains 20 synthetic held-out packets across five scenarios. The current versioned report records 32/32 fact precision and recall, 32/32 exact-quote coverage, 8/8 intended conflicts with zero false positives, 0/8 date-normalization errors, and 34/34 ready tasks with source coverage. Provider latency and cost are not measured because the evaluation replays stored responses without making provider calls.

## Privacy boundary

The application does not intentionally write uploaded images to disk or a database. When document explanation is used, the image is sent to the configured external AI provider for processing. First Day accepts no more than 10 MB per page, five pages, and 25 MB per in-memory case; only one page is sent at a time. Browser accessibility preferences may be saved in `localStorage`; the First Day case stays in page memory by default.

Every route receives `nosniff`, frame-denial, strict referrer, and camera/microphone/geolocation permission headers. These headers reduce browser attack surface; they do not replace request validation, exact-quote evidence checks, or careful provider privacy controls.

Review [the approved design](docs/superpowers/specs/2026-09-15-lantern-first-day-design.md), [competition upgrade plan](docs/superpowers/plans/2026-09-16-lantern-competition-upgrade.md), [held-out evaluation](evaluation/first-day/report.md), and [AI disclosure](docs/submission/ai-disclosure.md) for scope, architecture, and measured limitations.

Provider pricing and free-tier limits can change. Verify the current provider terms before deployment; First Day's deterministic fictional demo does not require provider keys.
