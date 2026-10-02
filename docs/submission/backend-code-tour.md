# Lantern backend code tour

Lantern's backend is deliberately narrow. It processes bounded live requests without creating accounts or a document database, validates every external response, and hands accepted proposals to deterministic domain code. The complete fictional judge demo bypasses provider routes and is tested to make zero API requests.

## Request-to-plan path

1. **HTTP contract:** `app/lib/server/http.ts` defines request IDs, bounded JSON parsing, no-store responses, and the public error envelope.
2. **Capability boundary:** `app/api/health/route.ts` reports product capabilities without exposing environment-variable or provider-key names.
3. **Provider services:** `app/features/letter-tool/server/` owns strict request schemas, time budgets, provider adapters, and safe failure mapping.
4. **Live extraction:** `app/api/first-day/extract/route.ts` accepts one JPG or PNG page, overwrites model-supplied identifiers, and validates the response schema.
5. **Evidence check:** `app/features/first-day/domain/evidence.ts` requires supporting quotations to occur in their source text.
6. **Immutable history:** `app/features/first-day/domain/events.ts` appends confirmations, corrections, completions, removals, and school-reported answers.
7. **Deterministic plan:** `app/features/first-day/domain/planner.ts` evaluates explicit dependencies; a model cannot assign task state.
8. **Inspectable result:** `app/features/first-day/domain/decision-trace.ts` explains the same records and planner result without changing them.
9. **Privacy-safe operations:** `app/lib/provider-error.ts` accepts operational metadata but no prompts, document text, response bodies, or thrown messages.
10. **Proof:** `tests/letter-tool/route-contracts.test.ts`, `tests/first-day/extraction-route.test.ts`, and `e2e/first-day-fictional.spec.ts` cover input limits, provider failures, partial recovery, and the zero-API judge path.

## 60-second explanation

> A live page first passes browser file limits, then one validated server route. The route sends the image to a configured reading provider, but treats the response as untrusted. Zod checks its structure, the server replaces model-supplied IDs, and Lantern verifies that every evidence quote occurs in the extracted page text. Only then does the browser create proposed facts. Human confirmations and school answers are append-only events. My deterministic planner—not the model—evaluates dependencies and assigns task states. Decision Trace reads those same facts, events, rules, and planner results to explain why a task changed. Uploaded pages and live case state are not intentionally persisted by Lantern, errors never include provider payloads, and the fictional judge demo runs the real planning code without making any API request.

## Honest limits

- Live processing still sends content to configured third-party providers.
- No saved history in Lantern does not imply zero retention by a provider.
- Synthetic regression results do not establish accuracy for every real document.
- Accounts, stored cases, analytics, and district administration are intentionally outside the competition scope.
