# First Day held-out evaluation

This suite tests the deterministic First Day pipeline without calling an AI provider. Every page begins with `SYNTHETIC TEST DOCUMENT`; names, dates, addresses, and identifiers are invented.

The 28 packets cover straightforward enrollment, ambiguous dates, conflicting locations, documented alternatives, follow-up corrections, English/Spanish conflicts, Spanish-only pages, and wording that should not be treated as a conflict. Fixture files store extracted text and complete provider-shaped responses. Separate expectation files are authored against those packets and describe the facts, conflicts, and plan states the domain pipeline should produce.

Run:

```bash
npm run evaluate:first-day
```

The runner validates exact quote grounding, then computes fact precision and recall, conflict true/false positives and negatives, date-normalization errors, and source coverage for ready tasks. It writes `report.md` and `report.json`. Cross-language conflicts and false-positive traps have separate rows. One trap currently produces a false conflict because "Gymnasium" and "Gimnasio" have different raw values despite naming the same place; the report keeps that miss visible while the dataset and pipeline checks can still run. Latency and cost are reported only when a fixture contains real measurements; the offline set reports both as not measured.
