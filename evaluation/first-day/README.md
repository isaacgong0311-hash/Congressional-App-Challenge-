# First Day held-out evaluation

This suite tests the deterministic First Day pipeline without calling an AI provider. Every page begins with `SYNTHETIC TEST DOCUMENT`; names, dates, addresses, and identifiers are invented.

The 32 packets cover straightforward enrollment, ambiguous dates, conflicting locations, documented alternatives, follow-up corrections, English/Spanish conflicts, Spanish-only pages, and wording that should not be treated as a conflict. Fixture files store extracted text and complete provider-shaped responses. Separate expectation files are authored against those packets and describe the facts, conflicts, and plan states the domain pipeline should produce.

Run:

```bash
npm run evaluate:first-day
```

The runner validates exact quote grounding, then computes fact precision and recall, conflict true/false positives and negatives, date-normalization errors, and source coverage for ready tasks. It writes `report.md` and `report.json`. Cross-language conflicts and false-positive traps have separate rows. Value matching treats case, accents, word order, English/Spanish names for the same place or month, and the same date written in different forms as equivalent, while a different time on the same date still conflicts. The first two traps motivated those rules, so they are regression checks rather than held-out tests; traps 03 and 04 and the extra conflict packets were written afterward. Because the fixtures replay recorded extractions, none of this measures whether the live model emits consistent semantic keys. Latency and cost are reported only when a fixture contains real measurements; the offline set reports both as not measured.
