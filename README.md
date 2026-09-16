# Lantern: First Day

Lantern helps people understand confusing official letters. **First Day** extends it into a source-backed school-enrollment planner for newcomer families: collect instructions, verify important facts against their source, resolve uncertainty, and leave with a clear plan.

This repository builds from the public [`TRANSLATEtheform`](https://github.com/isaacgong0311-hash/TRANSLATEtheform) application at commit `479ff86a30890c76a4ec0240406e66d9de4aa6ce`. It is now an independent Congressional App Challenge project.

## Current status

The imported Lantern letter explanation tool is the working baseline. The First Day workflow is under active development.

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
npm run build
```

The First Day domain test command will be added with its domain foundation.

## Privacy boundary

The application does not intentionally write uploaded images to disk or a database. When document explanation is used, the image is sent to the configured external AI provider for processing. Browser accessibility preferences may be saved in `localStorage`; the first First Day case stays in page memory by default.

Review [the approved design](docs/superpowers/specs/2026-09-15-lantern-first-day-design.md) and [implementation plan](docs/superpowers/plans/2026-09-15-lantern-first-day-foundation.md) for scope and architecture.
