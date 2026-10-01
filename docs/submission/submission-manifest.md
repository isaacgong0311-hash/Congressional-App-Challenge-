# Lantern submission manifest

**Manifest status:** Preparation in progress  
**Last verified:** 2026-09-30  
**Submission target:** 2026-10-24, ahead of the official deadline

This file is the alignment record between code, deployment, video, captions, transcript, written answers, evidence, and the final form. A status changes only after its evidence exists.

| Artifact | Current status | Evidence or next gate |
| --- | --- | --- |
| Decision Trace code | Implemented and locally verified | Commits `05218e2`, `0ba9527`, and `5f4f0bf` |
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

- Lint passes.
- 130 unit tests pass.
- Production build passes.
- The provider-free fictional journey and Decision Trace passed mobile and desktop browser verification in the preceding release gate.
- Synthetic held-out evaluation remains versioned separately from human usability evidence.
- AI assistance, reused code, runtime providers, and student responsibility are disclosed.

These checks do not prove that the current branch is deployed, the video exists, or the application has been submitted.

## Final alignment record

When each artifact exists, replace the corresponding status row with its exact evidence. The completed manifest must record one release commit SHA, one annotated tag, one public deployment URL and deployment identifier, one final video URL and duration, one caption/transcript version, and the final submission confirmation date. Do not record guessed identifiers or reuse an older deployment identity for newer code.
