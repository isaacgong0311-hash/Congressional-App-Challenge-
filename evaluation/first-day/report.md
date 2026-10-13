# First Day held-out evaluation

This report is generated from synthetic, versioned packets. It does not call an AI provider or contain personal records.

## Dataset

- Fixtures: 28
- Scenarios: ambiguous dates (4), conflicting locations (4), cross language conflicts (4), documented alternatives (4), false positive traps (2), follow up corrections (4), spanish only (2), straightforward enrollment (4)
- Provider latency: not measured
- Provider cost: not measured

## Results

| Metric | Result |
| --- | --- |
| Fact precision | 46/46 (100.0%) |
| Fact recall | 46/46 (100.0%) |
| Exact-quote coverage | 46/46 (100.0%) |
| Conflict recall | 12/12 |
| Conflict false positives | 1 |
| Cross-language conflict recall | 4/4 |
| Spanish-only exact-quote coverage | 2/2 (100.0%) |
| False-positive traps passed | 1/2 |
| Unintended conflicts in false-positive traps | 1 |
| Dates read correctly | 9/9 |
| Ready-task source coverage | 34/34 (100.0%) |

## Measured limitations

- false-positive-trap-02: expected 0 conflict(s), observed 1.

## Failures

None.
