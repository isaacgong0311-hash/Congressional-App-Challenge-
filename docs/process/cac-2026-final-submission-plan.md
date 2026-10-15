# Lantern: First Day — evaluation and final work plan

**Written:** 2026-10-14 · **Code reviewed:** `230ad11` (live on production) · **Official deadline:** Monday, 2026-10-26, 12:00 p.m. ET (confirm with your district office; one office page lists a later date, so do not rely on it) · **Internal submit target:** 2026-10-24

This is an appraisal, not a predicted score. Congressional offices judge differently.

## 1. Verdict

**The product is already strong. The submission is not finished.** Idea, implementation and engineering depth sit near the top of what a high-school entry usually shows. What is missing is the proof a judge actually sees: a public video, any human feedback, and a single consistent story across site, video and form.

| Judging dimension | Rating | Why |
| --- | --- | --- |
| Idea and need | Strong (8.5/10) | Specific, humane problem (newcomer families, conflicting school letters). The "never guess, keep the conflict visible" stance is a real design idea, not a wrapper around a chatbot. |
| Implementation and UX | Strong (8.5/10) | Zero-account fictional demo, bilingual, print/JSON/calendar export, keyboard and a11y verified (Lighthouse a11y 100, CLS 0), 85 browser tests. |
| Coding skill | Strong (9/10) | Exact-quote validation, typed events, deterministic dependency planner, Decision Trace, 28-packet eval harness, CI. Rare at this level. |
| Submission readiness | Weak (3/10) | No video, no usability sessions, no release tag, form unsubmitted. 11 days left. |

**If the video ships and tells the story cleanly, this is a credible contender at district level. If the video does not ship, none of the rest counts.**

## 2. Risks, ranked

1. **No video exists.** Rules require a public YouTube/Vimeo video of 1–3 minutes. This is the only gating item.
2. **Zero human evidence.** Impact is plausible but unobserved. The pilot plan says no partner has agreed; the usability report says "Not started". Honest, but thin.
3. **Homepage pitch does not match the video pitch.** The video says "newcomer families, school enrollment." The homepage hero says "A bill, school note, or official letter" with *Explain a letter* as the primary button. A judge who clicks through from the video lands on the generic tool, which dilutes the strongest idea. (The First Day demo is the real product; `/explain` is a side feature.)
4. **Team and AI disclosure may be inconsistent.** README lists Isaac as the only team member, but git history has commits from `kd228` (initial commit) and `vihansanthosh516-byte` (three "Script 1" commits, co-authored by Claude). The AI disclosure names OpenAI Codex only. Rules allow up to four members, each must be eligible and complete the exit questionnaire, and disclosure must be accurate. Resolve this before submitting.
5. **Eligibility date for reused code.** Rules say eligible work is coded after 2025-10-30. This repo starts 2026-09-15 but imports `TRANSLATEtheform` at `479ff86`. Verify when that repo was created and keep the disclosure explicit about what is new.
6. **Self-graded evaluation.** 46/46 and 12/12 come from fixtures written by the same team and are already described honestly as regression results. Keep it that way. The packets replay recorded extractions, so they do not measure the live model; say so.
7. **Live path depends on one free-tier provider (Groq).** A judge who uploads a real photo during review may hit a rate limit. The fictional demo is the safe path, so make sure every link and the video point there first.
8. **Process sprawl.** 13 plans and specs, 15 submission docs, a manifest of "not yet" rows. Judges read none of it. The risk is polishing documents instead of shipping the video.

## 3. Schedule (today is Oct 14)

Order matters: **freeze the UI before recording**, or the video will not match the submitted build.

| Dates | Goal | Done when |
| --- | --- | --- |
| Oct 14–15 | Truth fixes: team roster, AI disclosure, eligibility check, homepage framing | Tasks A1–A3 merged, CI green, deployed |
| Oct 16–17 | **Record and upload the video** (fallback-grade take) | Public URL works signed out, 1:00–3:00 |
| Oct 16–20 | Usability sessions (3–5 adults, fictional case only) | Report filled with denominators, or "Not started" kept |
| Oct 20–22 | Fix only repeated/severe findings, then **code freeze** | Final release commit selected |
| Oct 22–23 | Re-record only if UI changed; captions; transcript; tag; manifest | Manifest rows all evidence-backed |
| Oct 23–24 | Submit the form, save confirmation, every member completes exit questionnaire | Confirmation saved |
| Oct 25–26 | Buffer. Do not plan work here. | — |

## 4. Tasks for the coding agent (Claude Code or Codex)

Both read `AGENTS.md`; this repo uses a Next.js with breaking changes, so the agent must read the relevant guide in `node_modules/next/dist/docs/` before touching routes or config.

**Paste this header at the top of every agent prompt:**

> Work in `congressional-app-challenge`. Read `AGENTS.md` and `docs/process/cac-2026-final-submission-plan.md` first. Honesty rules: never describe a pilot, partnership, school endorsement or human usability result that does not exist; never claim real-document accuracy from the synthetic evaluation; keep the AI-use disclosure accurate. Do not change the six-beat fictional demo's behavior. Before finishing run `npm run lint`, `npm test`, `npm run evaluate:first-day`, `npm run build`, and `npm run test:e2e`. If visual baselines change, macOS baselines can be refreshed locally but the Linux ones must come from the CI run's actual captures (see commit `227daac`). Make small commits.

### A1. Reconcile team roster and AI disclosure *(needs Isaac's answers first)*
- **Ask Isaac:** who are `kd228` and `vihansanthosh516-byte`? Are they team members, eligible students in the district, and which AI tools were used (Codex, Claude Code, others)?
- **Edit:** `README.md` Team and AI-use sections, `docs/submission/ai-disclosure.md`, `docs/submission/written-answers.md`, `docs/submission/form-ready-answers.md`, `app/about/page.tsx`, `app/contact/page.tsx`, `app/components/lantern/site-footer.tsx`.
- **Done when:** one roster and one AI-tool list appear identically in every file above (`grep` for "Codex", "Claude", "Team").

### A2. Align the homepage with the First Day story
- **Edit:** `app/home-content.tsx`, `app/styles/home.css`, page `<title>`/metadata for `/`.
- **Change:** lead with newcomer families and school enrollment; make *Try the fictional demo* the primary action and *Explain a letter* secondary. Keep the generic-vs-Lantern comparison and the privacy block. Copy and ordering only, no new features.
- **Done when:** a first-time viewer on a 390 px screen sees the problem, the demo button, and "fictional" without scrolling; Home and First Day Lighthouse stay at performance ≥ 90, accessibility ≥ 95, CLS ≤ 0.1; Spanish copy is updated too; Linux visual baselines are refreshed from CI.

### A3. Verify the reuse and eligibility statement *(Isaac checks the date, agent edits wording)*
- **Isaac:** check the creation date of `TRANSLATEtheform` and what in it predates 2025-10-30.
- **Edit:** the "Reused source" section of `docs/submission/ai-disclosure.md` and the matching form answer so they state exactly what existed before and what was written for this entry.

### B1. Demo and live-path resilience
- Confirm in code whether the Google provider is wired as an automatic fallback (`app/lib/reading-model.ts`); `docs/submission/scalability-and-cost.md` says this is unverified. Update that doc with what the code actually does. Do not claim a fallback that is not wired.
- Make sure the live-upload failure state points to the fictional demo.
- **Done when:** the doc states the true behavior and the existing live-failure e2e test covers the message.

### B2. Measure latency and cost *(optional, needs provider key; skip if short on time)*
- Run `npm run smoke:providers` at least 10 times, record median and worst case, and log token usage. Fill the "not measured" rows in `docs/submission/scalability-and-cost.md`. Use the provider's current price page; do not guess prices.

### B3. Investigate the one false conflict *(done 2026-10-14)*
- Fixed with general value matching (case, accents, word order, English/Spanish place and month names, same date in different forms) in `app/features/first-day/domain/value-normalization.ts`, plus semantic-key canonicalization and per-proposal validation. Traps 03/04 and two conflict packets were added afterward; the set is now 32 packets. Traps 01/02 are not held out because they motivated the rules.

### C1. Release hygiene *(after code freeze)*
- Run the full gate on the final commit, deploy, confirm `/api/health` returns that commit SHA, record the Vercel deployment ID, create an annotated tag, and update `docs/submission/submission-manifest.md` and `docs/submission/checklist.md` with exact evidence.
- Fix stale statements: the manifest still says "20-packet" in places and "opening-copy candidate not deployed."

### C2. Form text
- Check the official form's field limits, then trim `docs/submission/form-ready-answers.md` to fit without changing any claim.

## 5. Tasks only a person can do

- **Record the video** from `/first-day?demo=1&present=1` using `docs/submission/demo-script.md` and the production checklist. Press **Reset demo** before each take. Aim for 2:30–2:50. Upload as public, test signed out, then fix captions and save the transcript.
- **Run usability sessions** with adults only, fictional case only, using `docs/submission/usability-run-kit.md`. Report "3 of 5" style denominators. If you cannot get sessions, keep "Not started."
- **Ask one adult** (teacher, librarian, parent group, ESL or counselor contact) for a short written reaction or a yes to a pilot. Even a single honest quote is stronger than none, but only if it is real and permitted.
- **Submit the form**, save the confirmation, and have every team member complete the exit questionnaire.
- **Confirm the deadline and eligibility** with your district's Congressional office page.

## 6. What not to do

- Do not add features. The product is complete enough.
- Do not call 100% synthetic results "accuracy."
- Do not mention a school, district or partner unless there is written agreement.
- Do not record the video before the UI is frozen, or re-record afterward if the UI changes.
- Do not start any new plan or spec documents.
