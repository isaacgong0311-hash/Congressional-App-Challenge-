# Lantern — Congressional App Challenge 2026 fact sheet

Checked locally: October 14, 2026.

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
| Runtime AI | Groq for configured live reading, source matching, and explanation; optional ElevenLabs speech and Perplexity local help |
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
| `npm test` | 188 passed in 44 test files on the October 14 working tree |
| `npm run build` | Passed, including the new source-ranking route |
| `npm run test:e2e` | 133 passed, 7 intentional skips with refreshed macOS visual references. After the final local-matcher and empty-page refinements, 6 focused mobile/desktop browser checks passed; another 6 source-finder and four-size visual checks passed after the Documents-step code split. Linux visual references still need refresh in CI before this branch can claim a green remote gate. |
| `npm run smoke -- --base-url http://127.0.0.1:3101` | 13 passed on an earlier October 14 local build; the full browser suite above covers this working tree |
| `npm run evaluate:first-day` | 28 synthetic packets across 8 scenarios; report generated without provider calls |
| `npm run evaluate:usability` | Status: Not started; no participant sessions recorded |
| `npm audit --omit=dev --audit-level=moderate` | Zero production dependency vulnerabilities reported locally |
| Synthetic live Groq source-ranking smoke | Local production route returned HTTP 200 with only the two supplied source IDs. This checks provider integration, not real-document accuracy. |
| Local Lighthouse (3 runs per route) | Home median performance 95; First Day median 92; accessibility 100 and layout shift 0 on both routes. Reports stayed on the local machine. |
| GitHub Actions `ci` | Historical passing run on presenter revision `0e8d846`: [run 38357034239](https://github.com/isaacgong0311-hash/Congressional-App-Challenge-/actions/runs/38357034239). The October 14 working tree has no CI result yet. |

## Contributor attribution

Git records `kd228 <karthik.devarasetty2@gmail.com>` as the author of the September 15 initial commit. Isaac confirmed the name **Karthik Devarasetty** and identified Karthik and **Vihan Santhosh** as project partners. The precise division of work remains unspecified, so the materials do not assign unverified contributions.

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

The source finder is verified with fictional, bilingual no-provider browser checks, mocked live AI matching and fallback checks, source-ID validation tests, and an accessibility scan of the open result. These checks establish behavior and provenance controls; they do not measure answer accuracy on real family documents.
