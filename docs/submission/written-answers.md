# Lantern: First Day — written submission answers

These are source answers for the 2026 Congressional App Challenge application. Adapt character counts only after opening the official form; preserve the facts, limitations, and disclosure language.

## App title

**Lantern: First Day**

## One-sentence purpose

Lantern helps newcomer families turn scattered school-enrollment instructions into a bilingual, source-linked plan they can inspect, clarify, and carry.

## Inspiration and community problem

School enrollment instructions often arrive across letters, health-office notes, follow-up messages, and web pages. Important dates and requirements are easy to separate from their source, and two messages can disagree. This is especially stressful for a family navigating a new school system or language.

I built Lantern around a specific question: can software make the next step clearer without pretending uncertainty disappeared? The result is not a chatbot that simply summarizes a packet. Lantern keeps source passages attached to facts, asks the family to confirm what documents cannot know, preserves conflicts, and shows why each plan step is ready, waiting, or blocked.

## Target audience

The primary audience is newcomer families navigating school enrollment, including bilingual households and people helping a family interpret school instructions. The current complete demonstration uses a fictional district and family so it is safe, repeatable, and independent of private records. A secondary Round Rock ISD workflow is an independent, source-checked local pilot; it is not affiliated with, reviewed by, or endorsed by the district.

## How the app works

First Day collects related pages as one case while preserving each document's identity. Runtime AI can propose structured facts only with exact supporting quotations. The family reviews unanswered questions. Deterministic TypeScript then evaluates explicit fact and task dependencies to build a plan.

If sources disagree, Lantern creates a conflict instead of choosing an answer. The family can record what the school reports, which appends an immutable event. The planner recomputes only dependent steps. Decision Trace then shows the full path from source evidence to proposed facts, the human decision, dependency logic, and final task state. The family can switch between English and Spanish, print or save the plan, download its event history, and add complete confirmed dates to a calendar.

## Most difficult technical challenge

The hardest challenge was preserving uncertainty while still producing a useful plan. A normal summarizer tends to collapse two similar statements into one answer. That is unsafe when one page says “cafeteria” and another says “gym entrance.”

I solved this with separate server and domain boundaries. Server routes enforce file and text limits, validate untrusted provider output with runtime schemas, return privacy-safe failures, and avoid persisting uploads. Exact-quote validation rejects unsupported model proposals. Typed facts retain their source evidence. An append-only event log records confirmations, corrections, source removal, completion, and school-reported conflict resolutions. The planner recursively evaluates `fact`, `task`, `allOf`, and `anyOf` dependencies and produces deterministic states. Decision Trace is a read-only projection of those same records and the planner result, so it cannot invent a more convenient explanation for the demo. The provider-free judge mode exercises the real event and planning code without making an API request.

## Tools and programming languages

I used TypeScript, React 19, Next.js 16, CSS/Tailwind, Zod, Vitest, Playwright, and axe-core. Optional runtime document reading uses provider integrations through the Vercel AI SDK. The fictional demonstration, planner, Decision Trace, exports, tests, and synthetic evaluation do not require an AI provider.

## Testing and evidence

The repository includes unit tests, mobile and desktop browser journeys, accessibility checks, print and download checks, performance budgets, and responsive visual baselines. A versioned offline evaluation uses 20 synthetic held-out packets across five scenarios. It records 32/32 fact precision and recall, 32/32 exact-quote coverage, all 8 intended conflicts with zero false positives, 0/8 date-normalization errors, and source coverage for all 34 ready tasks. These are synthetic regression results, not an independent measurement of real-world accuracy.

A privacy-safe usability protocol is prepared for approximately five consenting adults using only the fictional case. No participant sessions have been recorded yet, so I do not claim that families or community members have validated the app.

## What I learned

I learned that trust is often an architecture decision rather than a disclaimer. Keeping evidence, uncertainty, and human decisions visible required more work than generating a fluent summary, but it made the behavior testable and explainable. I also learned to separate model-shaped work from code-shaped work: AI can help read unstructured text, while validation, state transitions, dependencies, privacy limits, and failure behavior belong in explicit code.

## Accessibility and privacy

Lantern includes keyboard navigation, visible focus states, reduced-motion support, text-based status labels, high-contrast and large-text controls, English and Spanish interface copy, semantic source quotations, responsive layouts, and automated accessibility checks.

The app does not intentionally persist case documents, extracted text, facts, tasks, or event history. Only language and display preferences may be saved locally. Uploaded pages are bounded and processed one at a time; provider-backed reading is disclosed before use. The competition demo uses local fictional data and makes no provider request.

## Responsible future direction

The next responsible step is not broad automatic advice. It is completing the small fictional usability study, improving repeated points of confusion, adding evaluation with assistive-technology users, and carefully reviewing one additional district procedure set. Any real pilot would require current source review, clearer provider-retention guidance, community feedback, and a plan for procedure updates before expanding coverage.

## AI assistance and reused code

OpenAI Codex assisted with repository inspection, planning, code and test drafting, debugging, official-source review, browser verification, and documentation drafting. I reviewed and revised the work and am responsible for understanding every submitted component. Runtime AI is constrained to reading assistance and structured proposals; it does not resolve conflicts or derive task states.

Lantern: First Day builds from my public `TRANSLATEtheform` project. The original revision and imported capabilities are identified in the repository, alongside libraries, platforms, and the complete AI-development disclosure.

## Repository evidence

- [Project quick start](../../README.md)
- [Decision Trace code tour](decision-trace-code-tour.md)
- [Backend code tour](backend-code-tour.md)
- [Synthetic evaluation](../../evaluation/first-day/report.md)
- [Usability-study status](../../evaluation/usability/report.md)
- [AI and reused-code disclosure](ai-disclosure.md)
