# Lantern — Congressional App Challenge 2026 fact sheet

Checked locally: October 13, 2026.

## Links

| Item | Link |
| --- | --- |
| Source repository | [Congressional-App-Challenge-](https://github.com/isaacgong0311-hash/Congressional-App-Challenge-) |
| Public app | [Lantern](https://lantern-first-day.vercel.app/) |
| Clean fictional demo | [First Day demo](https://lantern-first-day.vercel.app/first-day?demo=1) |
| Presenter view | [Guided demo](https://lantern-first-day.vercel.app/first-day?demo=1&present=1) |
| Cover photo | [600×800 JPEG](cover-photo.jpg) |
| Public demonstration video | Not supplied |

## Product and stack

| Item | Fact |
| --- | --- |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Validation and tests | Zod 4, Vitest 4, Playwright 1 |
| Runtime AI | Groq for configured live reading and explanation; optional ElevenLabs speech and Perplexity local help |
| Fictional demo | No account, upload, or AI provider request |
| License | MIT |

## Public routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/first-day` | First Day workspace |
| `/first-day?demo=1` | Clean fictional demo |
| `/first-day?demo=1&present=1` | Presenter view |
| `/first-day/how-it-works` | Evidence pipeline and evaluation explanation |
| `/explain` | Letter explanation tool and offline sample |
| `/about` | Project background |
| `/contact` | Feedback contact paths |
| `/privacy` | Data handling |

## Checks

| Command | Latest local result |
| --- | --- |
| `npm run lint` | Passed |
| `npm test` | 175 passed in 41 test files |
| `npm run build` | Passed |
| `npm run test:e2e` | 115 passed, 7 intentional skips across 8 spec files |
| `npm run smoke -- --base-url http://127.0.0.1:3101` | 13 passed against the local production build |
| `npm run evaluate:first-day` | 28 synthetic packets across 8 scenarios; report generated without provider calls |
| `npm run evaluate:usability` | Status: Not started; no participant sessions recorded |
| GitHub Actions `ci` | [Passed on presenter revision `0e8d846`](https://github.com/isaacgong0311-hash/Congressional-App-Challenge-/actions/runs/38357034239) |

## Offline evaluation results

| Measure | Result |
| --- | --- |
| Fact precision and recall | 46/46 each |
| Exact source quotes covered | 46/46 |
| Intended conflicts found | 12/12 |
| Cross-language conflicts found | 4/4 |
| False-positive traps passed | 1/2 |
| Unintended conflicts | 1 |
| Spanish-only quotes covered | 2/2 |
| Dates read correctly | 9/9 |
| Ready tasks with source coverage | 34/34 |

Evaluation data: [machine-readable report](../../evaluation/first-day/report.json) · [readable report](../../evaluation/first-day/report.md). These counts come from fictional packets.
