# Lantern Competition Backend Design

**Date:** 2026-10-01  
**Status:** Approved direction; implementation planning pending  
**Project:** Lantern: First Day  
**Submission deadline:** 2026-10-26 at 12:00 p.m. ET

## 1. Objective

Strengthen Lantern's backend so the Congressional App Challenge submission demonstrates clear full-stack engineering without weakening the product's privacy story or putting the provider-free judge demo at risk.

The backend must make three ideas easy for a judge to understand:

1. uploaded documents cross a narrow, validated server boundary and are not persisted;
2. AI output is treated as an untrusted proposal and checked before it reaches the planner;
3. deterministic domain code—not a model—decides plan state and produces the Decision Trace.

This is a hardening and explanation project, not a platform expansion. It will not add accounts, a database, saved family cases, analytics, payments, or administrative tooling before the competition deadline.

## 2. Competition Strategy

The backend work must directly support the official judging themes of programming skill, societal usefulness, idea quality, user experience, and thoughtful implementation. A database is not valuable merely because it makes the application appear more full stack. Lantern already has a real backend in its Next.js route handlers; the higher-value work is to make that backend consistent, secure, testable, observable, and understandable.

The fictional judge journey remains completely provider-free. A missing or failing external service must never prevent a judge from opening the sample case, resolving its conflict, inspecting its Decision Trace, or exporting the plan.

The live document workflow remains secondary proof. It may use configured providers, but it must fail safely and honestly when a provider is unavailable.

## 3. Chosen Architecture

```text
Browser UI
  -> validated Next.js route handler
  -> bounded provider adapter
  -> runtime response schema
  -> exact-quote and evidence validation
  -> deterministic event + planner domain
  -> Decision Trace and exports
```

The backend will stay inside the existing Next.js application. Route handlers own HTTP concerns; provider adapters own external-service calls; schemas own untrusted-data validation; domain modules own evidence, event, conflict, planner, and trace behavior.

No route may bypass the domain boundary by directly assigning a task state. No provider adapter may write uploaded bytes, extracted text, facts, or case history to disk or a database.

## 4. Backend Units

### 4.1 Shared HTTP contracts

Create focused server utilities for consistent JSON errors, request identifiers, bounded JSON parsing, supported-language validation, and safe operational logging.

Public errors will have one stable shape:

```json
{
  "error": {
    "code": "PROVIDER_UNAVAILABLE",
    "message": "Live document reading is temporarily unavailable.",
    "requestId": "generated-or-client-safe-id",
    "retryable": true
  }
}
```

The browser may use `code` and `retryable` to select recovery UI. It must display `message` rather than provider names or environment details. Existing successful payloads remain unchanged so the frontend migration is additive.

Server logs may contain route name, request ID, error category, duration, HTTP status, provider status, and schema issue count. They must not contain document bytes, document text, extracted facts, prompts, provider response bodies, API keys, names, account numbers, school records, or thrown provider messages.

### 4.2 Route factories and dependency injection

Each provider-backed route will expose a handler factory whose dependencies can be replaced in tests. The existing extraction route already follows this pattern and will be the model for the other routes.

Factories will accept only the capabilities a route requires: provider availability, provider call, timeout budget, and clock or ID generator when determinism matters. Production exports will construct the handler with real adapters. Tests will use fakes and must never call the network.

### 4.3 Provider adapters

Provider-specific calls will move out of route files into focused adapters:

- Groq: letter explanation, First Day page extraction, grounded questions, and translation;
- ElevenLabs: optional text-to-speech;
- Perplexity: optional local-resource discovery.

Adapters return provider-neutral values or throw internal categorized failures. They do not return `Response` objects and do not decide user-facing copy. Timeouts are owned by the server boundary and passed through as abort signals where the provider supports them.

Provider model names remain centralized. Optional services remain optional. Groq is required only for live provider-backed workflows, not for the deterministic sample.

### 4.4 Validation and limits

Every route validates its request before consulting a provider.

- Image routes accept only JPG or PNG files between 1 byte and 10 MB.
- First Day accepts no more than five pages and 25 MB per in-memory browser case; server requests remain one page at a time.
- JSON routes reject malformed bodies and enforce explicit field lengths, enum values, array sizes, and message-history limits.
- Text-to-speech is limited to 2,500 normalized characters.
- Translation is limited to 6,000 characters.
- Assistant history is limited to 12 bounded messages, and the total accepted context receives an explicit size ceiling.
- Local-help location fields are validated as data rather than interpolated from unrestricted input.
- Provider responses are parsed through Zod schemas before any value reaches the UI.
- Exact source quotations must occur in the extracted source text before they may support First Day facts.

Oversized or unsupported input returns a non-retryable `400` response. Missing optional configuration returns a retryable or fallback-capable `503`. Provider rejection or malformed output returns `502`. A server-enforced timeout returns `504`.

### 4.5 Health and capabilities

The public health route will stop exposing a raw map of configured keys. It will report only deploy health and named feature capabilities:

```json
{
  "status": "ok",
  "version": "build identifier when available",
  "capabilities": {
    "judgeDemo": true,
    "liveDocumentReading": true,
    "serverSpeech": false,
    "localHelpSearch": false
  }
}
```

The route must use `Cache-Control: no-store`. A missing optional provider does not make the deployment unhealthy. A missing Groq key marks live document reading unavailable while the judge demo remains healthy. The frontend capability hook will consume this contract rather than infer service state from provider names.

### 4.6 Abuse controls

The submission version will use low-complexity, deployment-safe controls that do not require accounts or a database:

- strict request and payload limits;
- route-specific time budgets;
- one-page-at-a-time extraction in the client;
- no credential or provider detail in responses;
- `Cache-Control: no-store` on document and generated-content responses;
- same-origin browser use reinforced with a small allowlist check for mutation routes in production;
- documented platform-level rate limiting as a deployment control if the selected host provides it.

An in-memory serverless rate limiter will not be presented as reliable because instances do not share state. A paid or stateful rate-limit service will be considered only if deployment testing shows a concrete abuse risk before submission.

## 5. Data Lifecycle and Privacy

Uploaded bytes exist only for the duration of a request and are sent only to the configured extraction provider. The application does not intentionally write them to logs, files, object storage, analytics, or a database.

Provider-returned text is validated in server memory, returned to the requesting browser, and held in page memory. First Day facts, case events, plans, and Decision Traces remain client-side. Refreshing the page discards the live case. Only language and accessibility preferences may use the existing versioned local-storage key.

The privacy page, README, submission answers, and demo narration must all describe the same boundary. They must not claim that a third-party provider deletes data unless its verified terms support that statement.

## 6. Data Flow

For a live First Day page:

1. The browser validates file count, type, and aggregate size.
2. It sends one image plus bounded metadata to `/api/first-day/extract`.
3. The route validates the multipart request and assigns the request to a timeout budget.
4. The Groq adapter receives bytes and an abort signal.
5. The route parses the provider result with the extraction schema and overwrites model-supplied IDs with server-controlled IDs.
6. The browser adapter confirms every evidence quote exists in the returned source text.
7. The domain layer derives facts, conflicts, tasks, plan states, and Decision Traces.
8. Removing a source invalidates its dependents without erasing the historical event record.

At no point may a model choose `ready`, `done`, `waiting`, `needs_clarification`, or `needs_review` for a task.

## 7. Failure and Recovery Model

Failures are categorized so the UI can offer a truthful next action:

- `INVALID_REQUEST`: correct the input; do not retry unchanged;
- `UNSUPPORTED_MEDIA`: select a JPG or PNG;
- `PAYLOAD_TOO_LARGE`: remove or compress the page;
- `PROVIDER_UNAVAILABLE`: use the sample or try later;
- `PROVIDER_TIMEOUT`: retry the affected page;
- `PROVIDER_REJECTED`: retry later without blaming photo quality;
- `INVALID_PROVIDER_RESPONSE`: retake a clearer photo or use the sample;
- `INTERNAL_ERROR`: retry once and retain the request ID for diagnosis.

Multi-page work remains partial-success by design. One failed page does not remove successful pages. Retry replaces only the affected page request. The fictional sample is the universal fallback and does not depend on any health check or provider call.

## 8. Testing Strategy

### Unit and contract tests

Add coverage for:

- the shared error envelope and safe request IDs;
- bounded JSON and multipart validation;
- every route's missing-provider, timeout, provider-error, malformed-output, and success paths;
- logs containing operational metadata but never private payloads or thrown provider messages;
- health capability combinations;
- no-store response headers;
- server-controlled IDs and exact-quote rejection;
- production origin checks without blocking local tests;
- provider adapters receiving abort signals and bounded input.

All route tests use injected fakes. No automated test requires an API key or external network access.

### Browser tests

Verify that:

- the judge demo makes zero provider requests;
- missing providers produce actionable fallback UI;
- timeout and malformed-response fixtures preserve successful pages;
- retry touches only the failed page;
- the live workflow never exposes provider names, key names, or internal errors;
- mobile and keyboard users can recover from every route failure.

### Live smoke tests

After local deterministic tests pass, run one controlled smoke request for each configured provider using synthetic content only. These tests are manual, are not part of CI, and must not print or commit credentials or full provider payloads.

## 9. Judge-Facing Proof

The technical walkthrough will include a compact backend diagram, a request-to-plan trace, the privacy boundary, and links to representative route, schema, planner, and test files. The video will not spend time showing infrastructure dashboards. It will explain the meaningful engineering distinction: AI proposes source-backed facts, while validated deterministic code preserves uncertainty and computes the plan.

The written technical-challenge answer will identify concrete controls rather than claim generic security: exact-quote validation, runtime schemas, server-controlled identifiers, bounded requests, privacy-safe logs, immutable events, and deterministic dependency evaluation.

## 10. Delivery Order

1. Establish shared HTTP contracts and tests.
2. Harden health and capability reporting.
3. Convert the small JSON routes to validated injectable handlers.
4. Extract and test provider adapters.
5. Align image-route limits, errors, headers, and logging.
6. Add contract, abuse, and browser failure coverage.
7. Update privacy, architecture, and submission documentation.
8. Run deterministic release gates.
9. Request local provider configuration and run synthetic live smoke tests.
10. Deploy the verified release candidate and repeat the judge journey against production.

## 11. Acceptance Criteria

The backend work is complete when:

- the provider-free judge path works with no configured keys;
- every public route validates bounded input and returns a consistent safe failure contract;
- provider-specific code is isolated behind testable adapters;
- uploaded content and generated case data are not persisted by Lantern;
- health reporting describes product capabilities without exposing key names;
- route and browser tests cover the documented failure states;
- logs are demonstrably free of document content and provider exception text;
- the privacy page, README, technical walkthrough, and submission answers agree;
- lint, unit tests, evaluation, production build, browser tests, and Lighthouse pass;
- synthetic live-provider smoke tests pass for each provider enabled in the release environment;
- Isaac can explain the complete request-to-plan path without relying on generated narration.

## 12. Explicitly Deferred

The following are intentionally outside the 2026 competition scope:

- authentication and user profiles;
- persistent family cases or uploaded-document storage;
- cross-device synchronization;
- administrative dashboards;
- analytics tied to families or documents;
- a vector database or retrieval system;
- multiple district-management workflows;
- billing or subscriptions;
- a stateful third-party rate limiter without demonstrated need.

These features may be reconsidered after submission using a separate privacy and threat-modeling design.
