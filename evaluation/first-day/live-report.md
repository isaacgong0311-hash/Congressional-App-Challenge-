# First Day live-provider benchmark

The opt-in benchmark has not been executed in this checkout because no production provider credential is stored in the repository. Run `npm run evaluate:first-day:live` with a dedicated Groq evaluation key. The command replaces this file with aggregate metrics and never writes synthetic images, extracted text, or raw model output to disk.

Release requires 19/20 pages without manual retry, at least 90% fact precision and recall, exact quotes on every accepted fact, zero automatically confirmed facts, median latency below 12 seconds, p95 below 30 seconds, and an estimated five-page cost below $0.10.
