# Lantern: First Day

Lantern helps people understand confusing official letters. **First Day** extends it into a source-backed school-enrollment planner for newcomer families: collect instructions, verify important facts against their source, resolve uncertainty, and leave with a clear plan.

This repository builds from the public [`TRANSLATEtheform`](https://github.com/isaacgong0311-hash/TRANSLATEtheform) application at commit `479ff86a30890c76a4ec0240406e66d9de4aa6ce`. It is now an independent Congressional App Challenge project.

## Current status

The imported Lantern letter explanation tool remains available at `/`. A working First Day fictional demo is available at `/first-day`, with source-linked facts, deterministic task states, conflict resolution, English/Spanish interface copy, and printable output. First Day also includes an early live-intake path for up to five JPG/PNG pages. It processes pages sequentially, preserves successful pages when another fails, and supports per-page retry and removal.

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
npm run build
```

## Privacy boundary

The application does not intentionally write uploaded images to disk or a database. When document explanation is used, the image is sent to the configured external AI provider for processing. First Day accepts no more than 10 MB per page, five pages, and 25 MB per in-memory case; only one page is sent at a time. Browser accessibility preferences may be saved in `localStorage`; the First Day case stays in page memory by default.

Review [the approved design](docs/superpowers/specs/2026-09-15-lantern-first-day-design.md) and [implementation plan](docs/superpowers/plans/2026-09-15-lantern-first-day-foundation.md) for scope and architecture.

Provider pricing and free-tier limits can change. Verify the current provider terms before deployment; First Day's deterministic fictional demo does not require provider keys.
