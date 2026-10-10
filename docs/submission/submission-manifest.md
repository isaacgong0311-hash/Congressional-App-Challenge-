# Lantern submission manifest

**Manifest status:** Preparation in progress  
**Last local verification:** 2026-10-10
**Submission target:** 2026-10-24, ahead of the official deadline

This file is the alignment record between code, deployment, video, captions, transcript, written answers, evidence, and the final form. A status changes only after its evidence exists.

| Artifact | Current status | Evidence or next gate |
| --- | --- | --- |
| Decision Trace code | Implemented and locally verified | Commits `05218e2`, `0ba9527`, and `5f4f0bf` |
| Editorial frontend renovation | Implemented and locally verified | Approved design and implementation plan; code commit `90b3ae9`; Home, First Day, and Explain visual baselines refreshed |
| Backend trust boundary | Implemented and locally verified | Release-candidate code commit `7c55e22`; shared contracts, capability reporting, bounded provider routes, safe diagnostics, zero-API judge-path test, and live synthetic Groq smoke evidence |
| Usability protocol | Ready; zero sessions recorded | `evaluation/usability/report.md` says Not started; `docs/submission/usability-run-kit.md` provides the invitation and session checklist |
| Written answers | Form-ready draft prepared; personal fields still need confirmation | `docs/submission/form-ready-answers.md` and `docs/submission/written-answers.md` |
| Demo script | Drafted for a 2:45–2:55 take | `docs/submission/demo-script.md` |
| Cover image | 600×800 JPEG captured from the public app; not uploaded to the form | `docs/submission/cover-photo.jpg` (56 KB) |
| Decision Trace deployment | Prior audited code is live; the opening-copy candidate is not deployed | On 2026-10-10, the public `/api/health` reported version `65103bbbd5eb2ce93b097ce8ca0c83bdeef2dc0e`, matching local `HEAD` at the time; `/` and `/first-day?demo=1` returned 200. Recheck after the next release. |
| Final release commit | Not selected | Select only after deployment verification and any final fixes |
| Final Git tag | Not created | Create an immutable annotated tag after selecting the release commit |
| Video | Not recorded | Record from the verified Decision Trace deployment |
| Silent rehearsal | Local 2:33 draft recorded from the opening-copy candidate; not a submission video | `tmp/judge-demo-draft.webm` is intentionally ignored by Git; regenerate with `npm run record:demo-draft` |
| Public video URL | Does not exist | Upload the accepted final take and test it signed out |
| Captions | Not created | Create and review against the final take |
| Transcript | Draft script only; final transcript does not exist | Transcribe the accepted final take |
| Human usability findings | Do not exist | Run the adult-only fictional protocol before reporting findings |
| Congressional App Challenge form | Not submitted | Submit only after every required field and link is verified |
| Submission confirmation | Does not exist | Save the confirmation only after successful submission |

## Current verification: 2026-10-10

The opening-copy and silent-rehearsal candidate is commit `7ac8adbf04c9cb4c52d3b416bbde0a1cc8c4c1eb`. Its [GitHub Actions run](https://github.com/isaacgong0311-hash/Congressional-App-Challenge-/actions/runs/38070837522) passed lint, unit tests, synthetic evaluation, build, Linux browser tests, and Lighthouse. Local checks on this candidate passed 159 unit tests and 85 browser tests with 7 intentional skips; Home Lighthouse performance was 96–97, First Day 95, accessibility 100, and layout shift 0. This candidate is not yet the public production release. The public version in the health response was still the prior `65103bb...` release at the last check.

Local commit `65103bbbd5eb2ce93b097ce8ca0c83bdeef2dc0e` passed lint, 159 unit tests, the 20-packet synthetic evaluation, the production build, and 85 Playwright browser tests with 7 intentional skips. Lighthouse passed all assertions across six runs: Home performance 94–95, First Day 93–95, accessibility 100 on both routes, and cumulative layout shift 0. The public health endpoint returned 200 with `judgeDemo: true` and `liveDocumentReading: true`. Production smoke requests with the synthetic `public/sample-letter.png` returned a schema-valid First Day extraction in 3,946 ms and a schema-valid general Explain response in 3,424 ms. Optional speech and local-help integrations were unavailable. These checks establish availability and contract shape, not real-document accuracy or human usability.

## Earlier verification history

The October 8 renovation on `codex/frontend-overhaul` passed lint, 153 unit tests, evaluation on 20 synthetic packets, a production build, and 81 browser tests with 7 intentional skips. A 1024 px navigation regression passed in both Playwright projects. Local Lighthouse assertions passed: Home performance 95–98, First Day 92, accessibility 100 for both, and CLS 0 in all six runs. macOS visual regression passed locally; Linux visual regression and the full CI gate passed on commit `38edbdd` ([run](https://github.com/isaacgong0311-hash/Congressional-App-Challenge-/actions/runs/37731551615)).

The October 7 local test target is commit `12b7052` on `codex/frontend-overhaul`. It contains the export regression and the refreshed [release build plan](../superpowers/plans/2026-10-07-cac-release-build-plan.md). Verification ran on the same file tree immediately before the commit:

- `npm run lint`: passed.
- `npm test`: 153 passed.
- `npm run evaluate:first-day`: 20 synthetic packets, with the versioned results in `evaluation/first-day/report.md`.
- `npm run test:e2e`: 81 passed and 7 intentional skips on mobile and desktop Chromium against a production build.
- `npx playwright test e2e/print-export.spec.ts`: 3 passed and 1 intentional mobile skip. The new test reads the downloaded JSON and checks unresolved conflict, source references, and omitted extracted text; it also checks printed unresolved/source details.

This local gate does not verify a public deployment of commit `12b7052`.

### Earlier backend release evidence

- Lint passes.
- 146 unit tests pass.
- Production build passes.
- The live Groq First Day extraction route passed a synthetic document smoke test on 2026-10-02 (`status=pass`, valid response schema, 3,994 ms).
- The general letter explanation route also passed a separate live synthetic Groq check during the same backend release pass. It is kept opt-in in the combined smoke runner to avoid treating free-tier token-window contention as an application failure.
- The focused First Day and Explain browser suite passes all 32 mobile and desktop tests against the release candidate.
- The preceding complete browser gate passes 65 tests with 7 intentional skips, and all 6 Lighthouse runs pass.
- The provider-free fictional journey and Decision Trace passed mobile and desktop browser verification in the preceding release gate.
- Synthetic held-out evaluation remains versioned separately from human usability evidence.
- AI assistance, reused code, runtime providers, and student responsibility are disclosed.

Optional server speech and local-help search were not exercised because their provider credentials are not configured. The app reports those capabilities as unavailable and retains its documented fallbacks; they are not required for the judge demo or the verified First Day journey.

The earlier checks alone did not prove deployment. The public health version matched the October 10 audited code commit, before the subsequent opening-copy candidate. The video does not yet exist and the application has not been submitted.

## Final alignment record

When each artifact exists, replace the corresponding status row with its exact evidence. The completed manifest must record one release commit SHA, one annotated tag, one public deployment URL and deployment identifier, one final video URL and duration, one caption/transcript version, and the final submission confirmation date. Do not record guessed identifiers or reuse an older deployment identity for newer code.
