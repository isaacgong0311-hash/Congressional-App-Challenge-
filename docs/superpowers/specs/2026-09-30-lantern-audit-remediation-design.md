# Lantern Audit Remediation Design

**Date:** 2026-09-30  
**Status:** Approved direction  
**Project:** Lantern Congressional App Challenge entry

## Objective

Turn the external audit into a focused, competition-ready repair pass. The result must be reliable during a live judging demo, complete on mobile, internally consistent, and honest about what has and has not been validated.

This pass will not invent customers, testimonials, pricing, partnerships, accuracy claims, or traction. Lantern remains a student project with a source-checked local pilot and a fictional demonstration case.

## Product Position

Lantern will present two clearly separated experiences:

- A fully fictional Mesa View demo that needs no upload and makes no real-school claim.
- A live document workflow whose Round Rock ISD material is described as a source-checked local pilot, not a district partnership or endorsement.

The site will explain who built the project, why it exists, what its limitations are, and how an interested family, educator, or district can contact the builder. The conversion path will be a pilot-interest/contact route using a direct, functional contact method already supportable by the project. It will not claim to collect a waitlist unless submissions are actually stored or delivered.

## Scope

### 1. Guided-demo correctness

Fact actions will always update the fact identified by the clicked card. Derived counts, button availability, step progression, and narrator text will come from the current case state rather than from hard-coded assumptions.

The guided flow will remain blocked until its required actions are truly complete:

- Proposed family questions must each receive an answer or an explicit unclear state.
- The orientation conflict remains open until a school-reported choice is recorded.
- The focused-update beat and exported plan must display the same selected orientation value.
- The final beat must not label unanswered preferences as confirmed or claim zero unresolved items while a conflict remains open.

State-changing behavior will be covered at the domain/controller level where possible and with a browser regression for the judge-visible sequence.

### 2. Functional export actions

“Add dates to calendar” will download a valid `.ics` file containing eligible confirmed dates. It will be disabled, with explanatory copy, when there are no eligible dates. The existing deterministic calendar generation module remains the source of truth.

The button will provide visible success feedback and retain keyboard accessibility. Print and JSON exports will continue to expose unresolved items rather than hiding them.

### 3. Copy, spacing, and localization integrity

Dynamic prose will be assembled with explicit text nodes or interpolation so numbers and surrounding words retain spaces at every breakpoint. Singular/plural copy will be grammatical.

The Spanish preference will translate all visible product labels within the First Day workspace, including brand/context labels and safety copy. User/source content that is intentionally preserved verbatim will remain unchanged.

All dates and locations in the fictional story will agree across documents, facts, narrator beats, plan tasks, and export output.

### 4. Navigation and trust routes

The header demo CTA will remain visible and usable on mobile without crowding the navigation. The footer will include About and Contact/pilot-interest links in addition to the existing product, privacy, and source links.

New routes:

- `/about`: the problem, project origin, builder identity, responsible-AI approach, and explicit student-project framing.
- `/contact`: a concise pilot-interest/contact path for families, educators, and district staff, with no false promise that data is stored.
- `not-found.tsx`: a branded 404 with clear links home and to the demo.

No pricing page will be added because there is no validated pricing model. The contact page may describe a possible no-cost conversation or pilot inquiry, but not a paid offering.

### 5. Fictional and real-source boundaries

Mesa View will be labeled fictional wherever its case is introduced or summarized. Round Rock ISD references will be limited to the live source-checked pilot and will carry a concise non-affiliation statement. The UI will not suggest that Round Rock ISD reviewed, approved, or partnered on Lantern.

Existing public-source procedure records may remain because they are the basis of the local pilot. The project will not replace them with fictional procedures; instead, it will make the boundary explicit.

### 6. Existing work preservation

The current worktree contains uncommitted production-hardening changes. Implementation will inspect and extend those changes rather than reverting, replacing, or committing unrelated work. Files will be edited narrowly, and validation failures caused by pre-existing work will be reported separately if they cannot be resolved within this scope.

## Architecture and Component Boundaries

- Domain event functions remain responsible for immutable fact and conflict updates.
- `useFirstDayController` coordinates UI actions and derives presentation eligibility from `caseSnapshot`.
- Demo narration reads current snapshot/state and never maintains a second competing truth.
- Export UI calls pure calendar/plan document modules, then performs only the browser download side effect.
- Shared header/footer components own global navigation changes.
- About, Contact, and 404 pages reuse the existing Lantern primitives and design tokens rather than introducing a second visual system.
- Localization remains colocated with the First Day UI for this pass; no new i18n dependency is warranted.

## Error Handling

- Calendar download failures produce an inline or toast-style error and do not report success.
- Clipboard and other browser APIs retain fallbacks or visible failure states.
- Contact links expose a readable address or alternate GitHub route so a blocked mail client does not create another dead end.
- Demo progression controls remain available only when their state-derived preconditions are satisfied.

## Verification

The repair is complete when:

1. Unit tests prove actions target the correct fact and selected conflict values flow into the plan/export.
2. The guided browser test reviews every proposed fact, resolves the conflict, reaches export, and observes no contradictory narrator/count text.
3. Calendar export produces a downloadable `.ics` file with confirmed dates.
4. Public-route tests cover About, Contact, Privacy, and the branded 404.
5. Mobile browser checks confirm the primary CTA is visible and usable.
6. Automated searches and browser assertions cover the reported missing-space and singular/plural strings.
7. English and Spanish guided flows show complete interface localization for the audited labels.
8. Lint, unit tests, the targeted Playwright suite, and a production build pass.

Visual snapshots will be updated only for intentional UI changes and only after behavior tests pass.

## Out of Scope

- Accounts, authentication, payments, or pricing.
- A stored waitlist or CRM integration without an explicitly configured delivery service.
- Terms of Service drafted as legal advice.
- Fabricated testimonials, usage metrics, school approval, or family studies.
- Provider latency claims without measured production data.
- Broad refactors unrelated to the audited experience.

