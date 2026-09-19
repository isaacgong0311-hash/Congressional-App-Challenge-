# First Day held-out evaluation

This suite tests the deterministic First Day pipeline without calling an AI provider. Every page begins with `SYNTHETIC TEST DOCUMENT`; names, dates, addresses, and identifiers are invented.

The 20 packets are split evenly across straightforward enrollment, ambiguous dates, conflicting locations, documented alternatives, and follow-up corrections. Fixture files store extracted text and complete provider-shaped responses. Separate expectation files are authored against those packets and describe the facts, conflicts, and plan states the domain pipeline must produce.

Run:

```bash
npm run evaluate:first-day
```

The runner validates exact quote grounding, then computes fact precision and recall, conflict true/false positives and negatives, date-normalization errors, and source coverage for ready tasks. It writes the versioned result to `report.md`. Latency and cost are reported only when a fixture contains real measurements; the initial offline set reports both as not measured.
