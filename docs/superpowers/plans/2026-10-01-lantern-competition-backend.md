# Lantern Competition Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden Lantern's existing Next.js backend into a consistent, privacy-safe, testable competition artifact while keeping the complete judge demo provider-free.

**Architecture:** Route handlers remain the HTTP boundary, small provider adapters own external calls, Zod schemas validate all untrusted input and output, and shared server utilities produce safe errors and operational logs. Uploaded documents and case state remain ephemeral; deterministic domain code continues to own task state and Decision Trace output.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 5, Zod 4, Vercel AI SDK 6, Vitest 4, Playwright, Lighthouse CI

---

## File structure

- Create app/lib/server/http.ts for typed errors, request IDs, no-store responses, and bounded JSON parsing.
- Create app/lib/server/origin.ts for a small production same-origin guard.
- Create app/lib/api-error.ts for browser parsing of public API failures.
- Modify app/lib/provider-error.ts to accept only bounded operational metadata.
- Modify app/api/health/route.ts and app/features/first-day/ui/use-provider-capability.ts for product capabilities.
- Create app/features/letter-tool/server/ask.ts, translate.ts, local-help.ts, speech.ts, explain-schema.ts, and explain-provider.ts so provider logic is testable outside route files.
- Reduce every provider-backed app/api route to validation, dependency composition, and response mapping.
- Extend Vitest and Playwright coverage for every documented failure path.
- Update the technical walkthrough, privacy copy, README, and submission materials.
- Create scripts/smoke-providers.ts for opt-in synthetic live checks.

### Task 1: Establish shared server contracts

**Files:**
- Create: app/lib/server/http.ts
- Create: app/lib/server/origin.ts
- Create: app/lib/api-error.ts
- Create: tests/lib/server-http.test.ts
- Modify: app/lib/provider-error.ts

- [ ] **Step 1: Write the failing server-boundary tests**

Create tests/lib/server-http.test.ts:

    import { describe, expect, it } from "vitest";
    import { z } from "zod";
    import { apiError, readBoundedJson, requestIdFrom } from "../../app/lib/server/http";
    import { isTrustedMutationRequest } from "../../app/lib/server/origin";
    import { publicApiError } from "../../app/lib/api-error";

    describe("server HTTP boundary", () => {
      it("accepts only a bounded safe request id", () => {
        expect(requestIdFrom(new Headers({ "x-request-id": "case-17" }))).toBe("case-17");
        expect(requestIdFrom(new Headers({ "x-request-id": "../private" }))).toMatch(/^[a-f0-9-]{36}$/);
      });

      it("returns a stable no-store error envelope", async () => {
        const response = apiError({
          code: "PROVIDER_UNAVAILABLE",
          message: "Live reading is temporarily unavailable.",
          requestId: "request-1",
          retryable: true,
          status: 503,
        });
        expect(response.status).toBe(503);
        expect(response.headers.get("cache-control")).toBe("no-store");
        await expect(response.json()).resolves.toEqual({
          error: {
            code: "PROVIDER_UNAVAILABLE",
            message: "Live reading is temporarily unavailable.",
            requestId: "request-1",
            retryable: true,
          },
        });
      });

      it("rejects malformed and schema-invalid JSON", async () => {
        const schema = z.object({ text: z.string().max(8) }).strict();
        await expect(readBoundedJson(new Request("http://lantern.test/api", {
          method: "POST", body: "not-json",
        }), schema, 32)).resolves.toEqual({ ok: false, reason: "invalid_json" });
        await expect(readBoundedJson(new Request("http://lantern.test/api", {
          method: "POST", body: JSON.stringify({ text: "123456789" }),
        }), schema, 32)).resolves.toEqual({ ok: false, reason: "invalid_body" });
      });

      it("rejects a mismatched production browser origin", () => {
        const request = new Request("https://lantern.test/api/ask", {
          method: "POST",
          headers: { origin: "https://attacker.test", host: "lantern.test" },
        });
        expect(isTrustedMutationRequest(request, true)).toBe(false);
        expect(isTrustedMutationRequest(request, false)).toBe(true);
      });

      it("parses the new envelope and a temporary legacy error", () => {
        expect(publicApiError({ error: {
          code: "PROVIDER_TIMEOUT", message: "Try again.", requestId: "r1", retryable: true,
        } }, "Fallback").code).toBe("PROVIDER_TIMEOUT");
        expect(publicApiError({ error: "Legacy message" }, "Fallback").message).toBe("Legacy message");
      });
    });

- [ ] **Step 2: Confirm the tests fail for missing modules**

Run: npx vitest run tests/lib/server-http.test.ts

Expected: FAIL because the three new modules do not exist.

- [ ] **Step 3: Implement the shared HTTP module**

Create app/lib/server/http.ts with these exact public types and signatures:

    import { z } from "zod";

    export const ApiErrorCodeSchema = z.enum([
      "INVALID_REQUEST", "UNSUPPORTED_MEDIA", "PAYLOAD_TOO_LARGE",
      "PROVIDER_UNAVAILABLE", "PROVIDER_TIMEOUT", "PROVIDER_REJECTED",
      "INVALID_PROVIDER_RESPONSE", "INTERNAL_ERROR",
    ]);
    export type ApiErrorCode = z.infer<typeof ApiErrorCodeSchema>;
    export const noStoreHeaders = { "Cache-Control": "no-store" } as const;

    export function requestIdFrom(headers: Headers) {
      const value = headers.get("x-request-id")?.trim() ?? "";
      return /^[a-zA-Z0-9-]{1,120}$/.test(value) ? value : crypto.randomUUID();
    }

    export function apiError(input: {
      code: ApiErrorCode; message: string; requestId: string;
      retryable: boolean; status: number;
    }) {
      return Response.json({ error: {
        code: input.code, message: input.message,
        requestId: input.requestId, retryable: input.retryable,
      } }, { status: input.status, headers: noStoreHeaders });
    }

    export function apiJson<T>(value: T, status = 200) {
      return Response.json(value, { status, headers: noStoreHeaders });
    }

    export async function readBoundedJson<T>(
      request: Request, schema: z.ZodType<T>, maxBytes: number,
    ): Promise<
      | { ok: true; data: T }
      | { ok: false; reason: "invalid_json" | "payload_too_large" | "invalid_body" }
    > {
      const text = await request.text();
      if (new TextEncoder().encode(text).byteLength > maxBytes) {
        return { ok: false, reason: "payload_too_large" };
      }
      let value: unknown;
      try { value = JSON.parse(text); }
      catch { return { ok: false, reason: "invalid_json" }; }
      const parsed = schema.safeParse(value);
      return parsed.success
        ? { ok: true, data: parsed.data }
        : { ok: false, reason: "invalid_body" };
    }

- [ ] **Step 4: Implement origin and browser error helpers**

Create app/lib/server/origin.ts:

    export function isTrustedMutationRequest(request: Request, production: boolean) {
      if (!production) return true;
      const origin = request.headers.get("origin");
      if (!origin) return true;
      const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
      if (!host) return false;
      try { return new URL(origin).host === host; }
      catch { return false; }
    }

Create app/lib/api-error.ts:

    export type PublicApiError = {
      code: string; message: string; requestId?: string; retryable: boolean;
    };

    export function publicApiError(payload: unknown, fallback: string): PublicApiError {
      if (payload && typeof payload === "object" && "error" in payload) {
        const error = payload.error;
        if (error && typeof error === "object" && "message" in error &&
            typeof error.message === "string") {
          return {
            code: "code" in error && typeof error.code === "string"
              ? error.code : "INTERNAL_ERROR",
            message: error.message,
            requestId: "requestId" in error && typeof error.requestId === "string"
              ? error.requestId : undefined,
            retryable: "retryable" in error && error.retryable === true,
          };
        }
        if (typeof error === "string") {
          return { code: "INTERNAL_ERROR", message: error, retryable: true };
        }
      }
      return { code: "INTERNAL_ERROR", message: fallback, retryable: true };
    }

Extend ProviderErrorSummary with optional status and providerStatus numbers. Never accept error messages, bodies, prompts, or provider responses.

- [ ] **Step 5: Run focused tests and commit**

Run: npx vitest run tests/lib/server-http.test.ts tests/lib/provider-error.test.ts

Expected: PASS.

    git add app/lib/server app/lib/api-error.ts app/lib/provider-error.ts tests/lib/server-http.test.ts tests/lib/provider-error.test.ts
    git commit -m "feat: add safe backend HTTP contracts"

### Task 2: Replace key disclosure with product capabilities

**Files:**
- Modify: app/api/health/route.ts
- Modify: app/features/first-day/ui/use-provider-capability.ts
- Create: tests/lib/health-route.test.ts
- Modify: tests/first-day/provider-capability.test.ts

- [ ] **Step 1: Write failing capability tests**

Test the exact no-key response:

    {
      status: "ok",
      version: "development",
      capabilities: {
        judgeDemo: true,
        liveDocumentReading: false,
        serverSpeech: false,
        localHelpSearch: false,
      },
    }

Assert Cache-Control is no-store and the serialized body contains neither keys nor API_KEY. Update client parser tests to read capabilities.liveDocumentReading.

- [ ] **Step 2: Verify the old contract fails**

Run: npx vitest run tests/lib/health-route.test.ts tests/first-day/provider-capability.test.ts

Expected: FAIL because the route currently returns keys and the hook reads keys.groq.

- [ ] **Step 3: Implement the capability route and hook**

Return apiJson with status ok, a version selected from VERCEL_GIT_COMMIT_SHA, npm_package_version, or development, and four capability booleans. A missing optional provider never makes the route unhealthy. Update providerCapabilityFromHealth to require only a well-shaped liveDocumentReading boolean.

- [ ] **Step 4: Run tests, lint, and commit**

Run: npx vitest run tests/lib/health-route.test.ts tests/first-day/provider-capability.test.ts && npm run lint

Expected: PASS.

    git add app/api/health/route.ts app/features/first-day/ui/use-provider-capability.ts tests/lib/health-route.test.ts tests/first-day/provider-capability.test.ts
    git commit -m "feat: report backend product capabilities"

### Task 3: Normalize First Day extraction failures

**Files:**
- Modify: app/api/first-day/extract/route.ts
- Modify: app/features/first-day/ui/use-live-case.ts
- Modify: tests/first-day/extraction-route.test.ts
- Modify: e2e/first-day-live.spec.ts

- [ ] **Step 1: Write failing envelope tests**

Assert no-store on success and failure. Assert these mappings:

    invalid multipart or metadata -> INVALID_REQUEST / 400 / false
    unsupported MIME -> UNSUPPORTED_MEDIA / 400 / false
    empty or over 10 MB -> PAYLOAD_TOO_LARGE / 400 / false
    missing provider -> PROVIDER_UNAVAILABLE / 503 / true
    timeout -> PROVIDER_TIMEOUT / 504 / true
    schema failure -> INVALID_PROVIDER_RESPONSE / 502 / true
    provider throw -> PROVIDER_REJECTED / 502 / true

Each error assertion must include requestId and retryable. Keep tests proving server-controlled IDs and logs without document text.

- [ ] **Step 2: Verify current behavior fails**

Run: npx vitest run tests/first-day/extraction-route.test.ts

Expected: FAIL because current failures are string errors and unavailable provider returns 500.

- [ ] **Step 3: Migrate the route**

Use requestIdFrom, apiError, apiJson, and isTrustedMutationRequest. Preserve createExtractionHandler and its injected provider. Reject mismatched production origins before reading multipart data. Do not alter the successful FirstDayExtractionSchema payload.

- [ ] **Step 4: Migrate browser recovery**

In use-live-case.ts, replace string-property inspection with:

    const failure = publicApiError(payload, "Could not read this page.");
    throw new Error(failure.message);

Keep per-page retry, late-response rejection, and partial success unchanged.

- [ ] **Step 5: Update Playwright fixtures**

Mock the new health capability response. Return structured extraction errors from route fixtures:

    {
      error: {
        code: "PROVIDER_REJECTED",
        message: "Synthetic provider interruption.",
        requestId,
        retryable: true,
      },
    }

- [ ] **Step 6: Run focused tests and commit**

Run: npx vitest run tests/first-day/extraction-route.test.ts tests/first-day/provider-capability.test.ts && npx playwright test e2e/first-day-live.spec.ts

Expected: PASS.

    git add app/api/first-day/extract/route.ts app/features/first-day/ui/use-live-case.ts tests/first-day/extraction-route.test.ts e2e/first-day-live.spec.ts
    git commit -m "feat: harden First Day extraction boundary"

### Task 4: Make every letter-tool service injectable and bounded

**Files:**
- Create: app/features/letter-tool/server/ask.ts
- Create: app/features/letter-tool/server/translate.ts
- Create: app/features/letter-tool/server/local-help.ts
- Create: app/features/letter-tool/server/speech.ts
- Create: app/features/letter-tool/server/explain-schema.ts
- Create: app/features/letter-tool/server/explain-provider.ts
- Modify: app/api/ask/route.ts
- Modify: app/api/translate-field/route.ts
- Modify: app/api/local-help/route.ts
- Modify: app/api/speak/route.ts
- Modify: app/api/explain/route.ts
- Create: tests/letter-tool/route-contracts.test.ts
- Modify: tests/letter-tool/service-errors.test.ts

- [ ] **Step 1: Write failing factory contract tests**

Import and test these exact factories:

    createAskHandler({ available, generate, timeoutMs })
    createTranslateHandler({ available, translate, timeoutMs })
    createLocalHelpHandler({ available, search, timeoutMs })
    createSpeechHandler({ available, synthesize, timeoutMs })
    createExplainHandler({ available, explain, timeoutMs, today })

For each factory, cover malformed input, oversized input, missing configuration, provider failure, timeout, invalid provider output, safe logging, and success. Inject fakes only; tests must never call a network service.

- [ ] **Step 2: Verify missing exports**

Run: npx vitest run tests/letter-tool/route-contracts.test.ts

Expected: FAIL because the server modules do not exist.

- [ ] **Step 3: Implement strict request schemas**

Use these ceilings:

    assistant message: 2,000 characters
    assistant history: 12 messages
    assistant meaning context: 4,000 characters
    assistant requested items: 20 entries of 500 characters
    translation text: 6,000 characters
    local-help category, city, state: 60 characters each
    local-help results: 5 validated entries
    speech text: 2,500 characters
    explanation image: JPG or PNG, 1 byte through 10 MB
    human-language label: 40 characters

All Zod objects are strict. JSON routes call readBoundedJson before a provider. Image routes validate multipart input before reading bytes.

- [ ] **Step 4: Isolate provider adapters**

Preserve the existing prompts and behavior while moving provider calls behind the factories. The explanation adapter exports:

    export type ExplainProviderInput = {
      bytes: Uint8Array;
      mediaType: "image/jpeg" | "image/png";
      language: string;
      simplify: boolean;
      today: string;
      signal: AbortSignal;
    };

    export async function runGroqLetterExplanation(
      input: ExplainProviderInput,
    ): Promise<unknown>;

Move the existing ResultSchema unchanged into explain-schema.ts and export its inferred type. Local-help output must validate HTTP(S) URLs and at most five entries. Speech returns audio/mpeg with no-store. Route files only compose real dependencies and export POST.

- [ ] **Step 5: Use one failure taxonomy**

Every factory uses the same mappings from Task 3. Provider exceptions go only through providerErrorSummary. Logs may contain route, requestId, kind, duration, status, providerStatus, and issueCount; never source text, prompts, thrown messages, provider bodies, or credentials.

- [ ] **Step 6: Run route contracts**

Run: npx vitest run tests/letter-tool/route-contracts.test.ts tests/letter-tool/service-errors.test.ts tests/letter-tool/state.test.ts

Expected: PASS.

- [ ] **Step 7: Commit the route isolation**

    git add app/features/letter-tool/server app/api/ask/route.ts app/api/translate-field/route.ts app/api/local-help/route.ts app/api/speak/route.ts app/api/explain/route.ts tests/letter-tool/route-contracts.test.ts tests/letter-tool/service-errors.test.ts
    git commit -m "feat: isolate validated provider services"

### Task 5: Migrate UI recovery and prove provider independence

**Files:**
- Modify: app/Assistant.tsx
- Modify: app/features/letter-tool/letter-workspace.tsx
- Modify: app/features/letter-tool/letter-support.tsx
- Modify: e2e/first-day-fictional.spec.ts
- Modify: e2e/first-day-live.spec.ts
- Modify: e2e/letter-tool.spec.ts
- Modify: tests/letter-tool/route-contracts.test.ts

- [ ] **Step 1: Migrate public error parsing**

Use publicApiError(payload, fallback).message in every JSON consumer. Do not display error codes, request IDs, provider names, or key names in the main interface. Preserve these fallbacks:

    missing server speech -> browser SpeechSynthesis
    missing local search -> curated resource directory
    missing document provider -> fictional sample journey
    one failed First Day page -> successful pages remain

- [ ] **Step 2: Add a zero-provider judge-demo test**

In first-day-fictional.spec.ts, collect requests whose pathname starts with /api/ while completing the six-beat demonstration. Assert the list is empty.

- [ ] **Step 3: Add complete failure fixtures**

Cover 503, 504, malformed JSON, schema-invalid provider output, and connection abort. Assert no UI contains GROQ, PERPLEXITY, ELEVENLABS, API_KEY, a stack trace, or an injected private provider message. Run axe after the recovery controls become visible.

- [ ] **Step 4: Prove logs are payload-free**

For every factory, throw an error containing a synthetic child name, account number, and source sentence. Assert console.error contains none of those values but still contains request ID, route, failure kind, and duration.

- [ ] **Step 5: Run safety tests and commit**

Run:

    npx vitest run tests/lib/server-http.test.ts tests/lib/health-route.test.ts tests/first-day/extraction-route.test.ts tests/letter-tool/route-contracts.test.ts tests/letter-tool/service-errors.test.ts
    npx playwright test e2e/first-day-fictional.spec.ts e2e/first-day-live.spec.ts e2e/letter-tool.spec.ts

Expected: PASS without external network calls.

    git add app/Assistant.tsx app/features/letter-tool/letter-workspace.tsx app/features/letter-tool/letter-support.tsx e2e/first-day-fictional.spec.ts e2e/first-day-live.spec.ts e2e/letter-tool.spec.ts tests/letter-tool/route-contracts.test.ts
    git commit -m "test: prove backend privacy and recovery"

### Task 6: Add judge-facing proof and opt-in live verification

**Files:**
- Modify: app/first-day/how-it-works/page.tsx
- Modify: app/privacy/page.tsx
- Modify: README.md
- Modify: docs/submission/written-answers.md
- Modify: docs/submission/demo-script.md
- Modify: docs/submission/submission-manifest.md
- Create: docs/submission/backend-code-tour.md
- Create: scripts/smoke-providers.ts
- Modify: package.json

- [ ] **Step 1: Add the backend walkthrough**

Add this semantic, text-first flow to /first-day/how-it-works:

    1. Browser validates page count and total size
    2. Server validates one ephemeral image request
    3. AI proposes structured facts with exact quotations
    4. Runtime schemas and quote checks reject unsupported output
    5. Deterministic rules compute task state
    6. Decision Trace explains the result

State that uploaded content is memory-only inside Lantern, configured providers process live requests, and the fictional demo skips the provider path entirely. Keep the content legible without animation or connector styling.

- [ ] **Step 2: Align privacy and submission claims**

Update the privacy page, README, written answers, demo script, and manifest with the same boundary. Do not claim provider deletion, encryption at rest, completed live smoke tests, district partnership, or deployed behavior without evidence.

- [ ] **Step 3: Write the backend code tour**

Create docs/submission/backend-code-tour.md with representative file links for the route boundary, Zod validation, provider adapter, quote check, immutable event, planner, Decision Trace, safe log, and contract test. Include a concise 60-second explanation Isaac can rehearse.

- [ ] **Step 4: Create the guarded smoke script**

scripts/smoke-providers.ts must:

- refuse to run unless LANTERN_ALLOW_PROVIDER_SMOKE=1;
- default LANTERN_BASE_URL to http://127.0.0.1:3000;
- call /api/health first;
- exercise only reported available capabilities;
- use public/sample-letter.png as synthetic input;
- print only route, status, duration, and schema-valid booleans;
- never print environment values, request headers, extracted text, or response bodies;
- exit nonzero when an enabled capability fails.

Add this package script:

    "smoke:providers": "tsx scripts/smoke-providers.ts"

- [ ] **Step 5: Run deterministic release gates**

Run:

    rg -n "saved securely|provider deletes|encrypted at rest|completed live smoke|district partner" README.md app/privacy docs/submission
    npm run lint
    npm test
    npm run evaluate:first-day
    npm run evaluate:usability
    npm run build
    npm run test:e2e
    npm run test:lighthouse
    git diff --check

Expected: no unsupported positive claim; all gates PASS; usability remains honestly marked not started unless real sessions were recorded.

- [ ] **Step 6: Commit the competition proof**

    git add app/first-day/how-it-works/page.tsx app/privacy/page.tsx README.md docs/submission/written-answers.md docs/submission/demo-script.md docs/submission/submission-manifest.md docs/submission/backend-code-tour.md scripts/smoke-providers.ts package.json
    git commit -m "docs: explain Lantern backend trust boundary"

### Task 7: Configure providers and verify the release candidate

**Files:**
- Local only: .env.local
- Modify after verification: docs/submission/submission-manifest.md

- [ ] **Step 1: Ask Isaac to configure credentials locally**

Ask Isaac to copy .env.local.example to .env.local and add available values there. Do not ask him to paste secrets into chat. GROQ_API_KEY enables live document reading, ELEVENLABS_API_KEY enables optional server speech, and PERPLEXITY_API_KEY enables optional local search.

- [ ] **Step 2: Confirm the secret file is ignored without reading it**

Run:

    git check-ignore .env.local
    git status --short

Expected: .env.local is ignored and absent from status. Do not print or search its contents.

- [ ] **Step 3: Run a local production server and synthetic smoke checks**

Run npm run build, start npm run start in a persistent terminal, then run:

    LANTERN_ALLOW_PROVIDER_SMOKE=1 npm run smoke:providers

Expected: enabled capabilities report status=pass; disabled optional capabilities report status=skipped; no private content is printed.

- [ ] **Step 4: Manually verify both live and fictional paths**

Use only public/sample-letter.png for the live path. Confirm processing, source display, fact review, retry, and removal. Reset, then complete /first-day?demo=1 and confirm it still makes no provider request.

- [ ] **Step 5: Record verified results and commit**

Update the manifest with the exact date, commit SHA, enabled capabilities, and pass/fail result. Never record keys, provider response content, or an unverified deployment identity.

    git add docs/submission/submission-manifest.md
    git commit -m "docs: record backend release verification"

## Final release gate

From a clean checkout, run:

    npm ci
    npm run lint
    npm test
    npm run evaluate:first-day
    npm run evaluate:usability
    npm run build
    npm run test:e2e
    npm run test:lighthouse
    git diff --check
    git status --short

Expected: every command passes, the usability report remains truthful, and git status is empty. Deployment, tagging, video recording, and final submission remain separate human/external actions.
