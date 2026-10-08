# Lantern submission manifest

**Manifest status:** Preparation in progress  
**Last local verification:** 2026-10-07
**Submission target:** 2026-10-24, ahead of the official deadline

This file is the alignment record between code, deployment, video, captions, transcript, written answers, evidence, and the final form. A status changes only after its evidence exists.

| Artifact | Current status | Evidence or next gate |
| --- | --- | --- |
| Decision Trace code | Implemented and locally verified | Commits `05218e2`, `0ba9527`, and `5f4f0bf` |
| Backend trust boundary | Implemented and locally verified | Release-candidate code commit `7c55e22`; shared contracts, capability reporting, bounded provider routes, safe diagnostics, zero-API judge-path test, and live synthetic Groq smoke evidence |
| Usability protocol | Ready; zero sessions recorded | `evaluation/usability/report.md` says Not started |
| Written answers | Drafted; awaiting adaptation to official form limits | `docs/submission/written-answers.md` |
| Demo script | Drafted for a 2:45–2:55 take | `docs/submission/demo-script.md` |
| Decision Trace deployment | Not deployed | Deploy and verify the current branch before recording |
| Final release commit | Not selected | Select only after deployment verification and any final fixes |
| Final Git tag | Not created | Create an immutable annotated tag after selecting the release commit |
| Video | Not recorded | Record from the verified Decision Trace deployment |
| Public video URL | Does not exist | Upload the accepted final take and test it signed out |
| Captions | Not created | Create and review against the final take |
| Transcript | Draft script only; final transcript does not exist | Transcribe the accepted final take |
| Human usability findings | Do not exist | Run the adult-only fictional protocol before reporting findings |
| Congressional App Challenge form | Not submitted | Submit only after every required field and link is verified |
| Submission confirmation | Does not exist | Save the confirmation only after successful submission |

## Currently verified local gate

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

These checks do not prove that the current branch is deployed, the video exists, or the application has been submitted.

## Final alignment record

When each artifact exists, replace the corresponding status row with its exact evidence. The completed manifest must record one release commit SHA, one annotated tag, one public deployment URL and deployment identifier, one final video URL and duration, one caption/transcript version, and the final submission confirmation date. Do not record guessed identifiers or reuse an older deployment identity for newer code.
