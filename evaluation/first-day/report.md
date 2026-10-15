# First Day held-out evaluation

This report is generated from synthetic, versioned packets. It does not call an AI provider or contain personal records.

## Dataset

- Fixtures: 32
- Scenarios: ambiguous dates (5), conflicting locations (5), cross language conflicts (4), documented alternatives (4), false positive traps (4), follow up corrections (4), spanish only (2), straightforward enrollment (4)
- Provider latency: not measured
- Provider cost: not measured

## Results

| Metric | Result |
| --- | --- |
| Fact precision | 54/54 (100.0%) |
| Fact recall | 54/54 (100.0%) |
| Exact-quote coverage | 54/54 (100.0%) |
| Conflict recall | 14/14 |
| Conflict false positives | 0 |
| Cross-language conflict recall | 4/4 |
| Spanish-only exact-quote coverage | 2/2 (100.0%) |
| False-positive traps passed | 4/4 |
| Unintended conflicts in false-positive traps | 0 |
| Dates read correctly | 13/13 |
| Ready-task source coverage | 34/34 (100.0%) |

## Measured limitations

None in this test set.

## Failures

None.
