# Lantern CAC App Readiness Design

**Date:** 2026-10-09
**Status:** Implementation authorized by Isaac's request to plan and build in this session.

## Objective and competition fit

The [2026 CAC rules](https://www.congressionalappchallenge.us/wp-content/uploads/2026/05/2026-CAC-Rules.pdf) judge quality of idea, implementation and user experience, and demonstrated coding skill. They require a functioning app and full disclosure of AI assistance. Lantern already has a complete provider-free fictional journey, a distinctive evidence and Decision Trace model, a bilingual interface, and source-backed exports. This pass strengthens the trust boundary and live recovery path that a judge or code reviewer can inspect directly.

## Approach considered

1. **Expand features:** add more districts, accounts, or document formats. This increases privacy and accuracy risk before the existing workflow has adult usability evidence.
2. **Redesign the interface:** replace the current presentation across all routes. Recent visual, accessibility, and Lighthouse gates already pass, so this has high regression cost and little demonstrated benefit.
3. **Harden the existing journey (chosen):** keep the product story and visual language, reject unsupported input earlier, make server and browser evidence validation agree, and let a user recover from a temporary capability failure in place.

## Design

### Server boundary

`/api/first-day/extract` will check file bytes against the declared JPEG or PNG type before sending them to the provider. A structurally valid provider response will also be checked for duplicate proposal keys and exact source quotations before the server returns it. The server will return the existing safe error envelope and log only issue categories and request metadata. Client-side evidence validation stays as a second boundary.

### Live document experience

The browser's upload selection will reject empty files before it creates a case page. A page that yields no proposed facts remains a successful reading, but the Documents view will explain why Facts is unavailable and invite a clearer sample page. Provider capability can be checked again from the Start view without losing the current page or requiring a reload. A provider outage still leaves the complete fictional sample available.

### Scope and evidence

The existing six-beat demo, deterministic planner, Decision Trace, privacy boundary, exports, language controls, and source-checked Round Rock ISD procedures remain the product. New tests cover the changed contracts, while the full lint, unit, evaluation, build, browser, audit, and Lighthouse gates check the end-to-end behavior. Synthetic tests are not claims of family validation or provider uptime.

## File boundaries

- `app/features/first-day/domain/evidence.ts`: one normalization rule for exact quote checks.
- `app/features/first-day/server/validate-page.ts`: pure validation of provider proposals against the returned page text.
- `app/api/first-day/extract/route.ts`: input signature and provider-output enforcement.
- `app/features/first-day/domain/upload-queue.ts`: browser file selection contract.
- `app/features/first-day/ui/use-provider-capability.ts`, `start-step.tsx`, `first-day-workspace.tsx`, `use-first-day-controller.ts`: retryable availability check.
- `app/features/first-day/ui/documents-step.tsx`: readable zero-fact status.
- Focused Vitest and Playwright files: behavior evidence without touching real documents or provider credentials.
