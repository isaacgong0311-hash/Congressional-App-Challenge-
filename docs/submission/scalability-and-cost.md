# Scalability and cost

Status: **partly measured.** Numbers marked "not measured" must be filled in before they are quoted anywhere.

## What is measured

| Item | Value | Source |
| --- | --- | --- |
| One live First Day page read (synthetic `public/sample-letter.png`) | 3,946 ms | Production smoke, 2026-10-10, `docs/submission/submission-manifest.md` |
| One live Explain read (same image) | 3,424 ms | Same run |
| Fictional demo (`/first-day?demo=1`) | No provider call, no per-use cost | `e2e/first-day-fictional.spec.ts` |
| Offline evaluation (28 packets) | No provider call; latency and cost recorded as "not measured" | `evaluation/first-day/report.json` |

One run is not a distribution. Repeat `npm run smoke:providers` at least 10 times and record the median and worst case.

## Cost per family (to measure)

The only paid step is reading uploaded pages with the vision model (`app/lib/reading-model.ts`, served through Groq).

```
cost per family = pages per family x (input tokens x input price + output tokens x output price)
```

| Input | Value |
| --- | --- |
| Pages per family (assumed) | 6 (the upload limit is 5 pages per batch) |
| Tokens per page, input and output | not measured: log provider usage during smoke runs |
| Provider price per token | not measured: copy from the provider's current price page on the day you measure |

| Scenario | Formula | Result |
| --- | --- | --- |
| One family | pages x cost per page | not measured |
| 500-family pilot | 500 x one family | not measured |

Do not publish a dollar figure until both unmeasured rows are filled in from real logs and the current price page.

## If the provider goes down

| Layer | What happens |
| --- | --- |
| Fictional demo and sample letter | Keep working. They need no provider. |
| Live upload | The route returns a typed error and the UI shows a retry message (see `app/lib/provider-error.ts`, `e2e/first-day-live.spec.ts`). No plan is made from a failed read. |
| Families already holding a plan | The printed plan and JSON export still work. They are made in the browser. |
| Fallback | A second provider (Google, via `@ai-sdk/google`) is installed. Confirm in code whether it is wired as an automatic fallback before claiming that. |

## Scaling limits to state honestly

- Plans live in page memory. Nothing stored means no database cost, and also no saved cases.
- Rate limits belong to the provider account. For a 500-family pilot, check the account's requests-per-minute and daily limits first.
- Procedure content is hand-reviewed per district (`app/features/first-day/content/procedures/`). Adding districts costs reviewer time, not compute.
