# AI use and student contribution disclosure

## Runtime AI features

Lantern can send user-provided page images to Groq for document reading, grounded explanations, assistant responses, and field translation when `GROQ_API_KEY` is configured. The First Day extraction route asks the model for structured fact proposals and exact supporting quotes; Zod schema validation and an exact-quote check run before proposals enter the case.

Optional integrations inherited from the upstream application can use ElevenLabs for server speech and Perplexity for local-help search when their separate keys are configured. Each optional integration fails independently. Provider pricing, availability, and retention terms are external and can change.

AI does not decide which source is correct, confirm a family fact, resolve a conflict, mark a task done, or derive a task state. The fictional workflow, domain planner, exports, held-out evaluation, and automated browser journeys run without a provider request.

## Development assistance

OpenAI Codex assisted with repository inspection, implementation planning, code and test drafting, debugging, official-source review, browser verification, and documentation drafting. AI-generated suggestions were reviewed and revised within the repository before inclusion.

## Student-authored and student-owned work

Isaac Gong is responsible for the product goal, audience, architecture choices, privacy boundaries, evidence model, confirmation and correction rules, conflict behavior, deterministic task families and dependencies, Round Rock ISD source review, test expectations, evaluation interpretation, visual design decisions, release decisions, and presentation. The student is responsible for understanding and explaining every submitted component.

## Reused source

This independent project builds from the public [`isaacgong0311-hash/TRANSLATEtheform`](https://github.com/isaacgong0311-hash/TRANSLATEtheform) repository at revision `479ff86a30890c76a4ec0240406e66d9de4aa6ce`. The imported base included the general letter-explanation interface and APIs for explanation, assistant responses, translation, speech fallback, and local resources. The import is recorded in this repository as commit `f4d4855`.

## Material libraries and platforms

- Next.js 16, React 19, TypeScript, Tailwind CSS, and Zod
- Vercel AI SDK provider packages for Groq and Google
- Vitest for unit and deterministic evaluation regression tests
- Playwright and axe-core for mobile/desktop browser and accessibility testing
- Vercel for hosting and GitHub Actions for continuous integration

The complete dependency versions are recorded in `package-lock.json`.
