# Lantern: First Day — audit and improvement plan

**Written:** 2026-10-16 · **Code audited:** `b68f56a` (branch `main`) · **Deadline:** Monday 2026-10-26, 12:00 p.m. ET (confirm with your district office) · **Internal submit target:** 2026-10-24

This builds on `cac-2026-final-submission-plan.md` (Oct 14). It records what was re-checked today, what is actually wrong, and what to do in order. It is an appraisal, not a predicted score.

## 1. What was checked today

| Check | Result |
| --- | --- |
| `npm run lint` | Pass |
| `npx tsc --noEmit` | Pass |
| `npm test` | 205 tests in 46 files pass |
| `npm run evaluate:first-day` | Pass; no failures. Replays recorded synthetic packets, so it is a regression check, not live accuracy |
| `npm run build` | Pass (the pre-build env and provider checks ran) |
| `npm audit --omit=dev` | 0 vulnerabilities |
| Browser suite, Lighthouse | Not rerun today; last recorded in the manifest (132 checks locally; Lighthouse on an earlier commit) |

**There is no failing test and no reproducible crash.** The code is healthy. What is wrong is mostly the submission around it, plus a few real engineering gaps.

## 2. What is wrong, ranked

### Submission blockers (decide whether you win more than any code change)

1. **No public video.** Rules require a public YouTube or Vimeo video of 1–3 minutes. A silent 2:33 screen rehearsal exists locally; narration, captions, transcript and upload do not. Nothing else matters if this is missing.
2. **Team and AI disclosure disagree with the git history.** README lists three people (Isaac, Karthik, Vihan). History has commits from `IsaacGong` (50), `vihansanthosh516-byte` (3) and `hogri` (2); `kd228` from the earlier note no longer appears under that name. README and `docs/submission/ai-disclosure.md` name only OpenAI Codex, but earlier "Script 1" commits were co-authored with Claude, and this session also used Claude. Every AI tool actually used must be listed. This needs Isaac's answers, not a guess.
3. **Reuse and eligibility statement is unverified.** Rules count work coded after 2025-10-30. The repo imports `TRANSLATEtheform` at `479ff86`. Someone must check that repo's creation date and what predates the cutoff, then word the disclosure exactly.
4. **No human evidence.** Usability report says "Not started". That is honest, but a judge sees zero observed users. Even three sessions would help.
5. **Manifest is stale.** It still describes the opening-copy candidate `7ac8adb` as not deployed, and says the integrated candidate (`b68f56a`) has no CI or deployment result. Mixed "20-packet / 28-packet / 32-packet" figures remain, though the note on line 38 explains them.

### Product and judge-experience gaps

6. **Homepage pitch is diluted.** The hero says "newcomer families navigating school enrollment" (good) but the primary button on `app/home-content.tsx` is still *Explain a letter*, which leads to the generic tool instead of the First Day demo that the video will show. This is a copy and order change only.
7. **LCP is above target.** The Oct 10 review recorded about 3.0 s LCP on First Day against a 2.5 s goal. Performance score is already 93–97, so this is polish, not a defect.

### Engineering gaps (real, but none breaks the demo)

8. **Rate limiter does not do what its comment says.** `proxy.ts` keeps counts in an in-memory `Map`. On Vercel each serverless instance has its own map, so the limit is a per-instance suggestion and a determined caller can multiply it. The file's comment admits this. It matters because the Groq key is a free-tier key and one abuser can exhaust it during judging. Also, the `Origin` check in `app/lib/server/origin.ts` allows requests with no `Origin` header, so scripts are not blocked by it.
9. **Single provider, unused fallback dependency.** `app/lib/reading-model.ts` only names a Groq model. `@ai-sdk/google` is in `package.json` but nothing under `app/` or `scripts/` imports it. `docs/submission/scalability-and-cost.md` line 44 still says to "confirm in code". Answer: **it is not wired.** Either wire it or remove the dependency and say there is no fallback. If Groq rate-limits a judge, the live path fails (the demo path is unaffected).
10. **No Content-Security-Policy.** `next.config.ts` sets four headers (nosniff, frame deny, referrer, permissions) but no CSP. This is cheap hardening and reads well to a coding-skill judge.
11. **Oversized UI files.** Largest are `first-day.css` (1573 lines), `home.css` (1270), `letter-workspace.tsx` (686), `export-step.tsx` (554), `documents-step.tsx` (517). Not a bug; maintainability only. Do not refactor before the deadline.
12. **Process sprawl.** 13 plans, 8 specs, 15 submission docs. Judges read none of them. Stop adding documents.

## 3. Coding plan

Rule for every task: small commit, then run `npm run lint`, `npm test`, `npm run evaluate:first-day`, `npm run build`, and `npm run test:e2e`. Do not change the six-beat fictional demo's behavior. Linux visual baselines must come from the CI run's actual captures, not a local run. Read `node_modules/next/dist/docs/` before touching `proxy.ts`, `next.config.ts` or routes, because this Next.js version has breaking changes.

### Phase 0 — before any code (Isaac, about 30 minutes)
- Answer who the contributors are, whether each is eligible, and every AI tool used.
- Check the creation date of `TRANSLATEtheform`.
- Confirm the exact deadline with the district office.

### Phase 1 — truth fixes (Oct 16–17, blocks recording)
- **T1. Roster and AI disclosure.** After Phase 0, make `README.md`, `docs/submission/ai-disclosure.md`, `written-answers.md`, `form-ready-answers.md`, `app/about/page.tsx`, `app/contact/page.tsx` and `site-footer.tsx` agree. Done when `grep -rniE "codex|claude|team"` shows one consistent roster and tool list.
- **T2. Reuse statement.** Reword the "Reused source" section and matching form answer to state exactly what predates 2025-10-30.
- **T3. Homepage framing.** Make *Try the fictional demo* the primary action and *Explain a letter* secondary in `app/home-content.tsx` and its Spanish copy. Done when a 390 px screen shows problem, demo button and "fictional" without scrolling, and Lighthouse stays at performance ≥ 90, accessibility ≥ 95, CLS ≤ 0.1.

### Phase 2 — freeze UI, record video (Oct 17–19)
- Record narration over the 2:33 rehearsal. Show the cafeteria/gym conflict, the human school answer, the task change, and Decision Trace, and explain one rule in plain language (e.g. why a conflict blocks a task).
- Upload public, check signed out, add captions and transcript.

### Phase 3 — resilience and hardening (Oct 17–21, parallel with usability sessions; skip any item that risks the freeze)
- **H1. Provider fallback decision.** Smallest honest option: remove `@ai-sdk/google` if unused and update `scalability-and-cost.md` to say there is no fallback. Better option: wire it behind the existing reading service with a unit test and a controlled-failure e2e. Do not claim a fallback until it exists.
- **H2. Failure message points to the demo.** Make sure the live-upload failure and `RATE_LIMITED` states link to `/first-day?demo=1`, and that the existing live-failure e2e covers it.
- **H3. Rate limiting that holds on serverless.** Use a shared store (Vercel's marketplace Redis/KV or Edge Config is the option to check) or Vercel's firewall rate-limit rules, keep the in-memory map as a local fallback, and add a unit test with a fake clock. If a shared store is more than a small change, set a Groq-side spend and rate cap instead and document it.
- **H4. Content-Security-Policy.** Add a report-only CSP first, run the e2e and Lighthouse suites, then enforce it. Check inline styles/scripts that Next.js emits before enforcing.
- **H5. Origin check.** Decide whether missing `Origin` should be rejected for browser-only routes. Keep `/api/health` open.

### Phase 4 — usability evidence (Oct 16–21)
- Run the prepared protocol (`docs/submission/usability-run-kit.md`) with three to five consenting adults on the fictional case only.
- Fix only repeated or severe confusion, then rerun the affected browser and accessibility checks.
- If sessions cannot happen, keep the "Not started" disclosure. Never write findings that did not occur.

### Phase 5 — release (Oct 22–24)
- Code freeze. Run the full gate on the final commit; deploy; confirm `/api/health` returns that commit; record Vercel deployment ID; create an annotated tag.
- Clean the manifest and checklist so every row names exact evidence, and remove the stale "not deployed" statements.
- Submit the form by Oct 24; save the confirmation; each member completes the exit questionnaire. Oct 25–26 is buffer with no planned work.

## 4. What not to do
- Do not add features. The product is already ahead of the submission.
- Do not refactor the large CSS and component files before the deadline.
- Do not describe a pilot, partnership, school endorsement or usability result that does not exist, and do not present the synthetic 100% results as real-document accuracy.
