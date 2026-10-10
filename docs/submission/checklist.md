# Competition release checklist

## Previous production release identity

- Candidate tag: `competition-candidate-v1`
- Git commit: `af9cfb78f8e8ec3946bf90689ce7e118b84b92e3`
- Production URL: `https://lantern-first-day.vercel.app`
- Vercel deployment ID: `dpl_7dkQbkdukbhBo6yXS28H52vUiqHF`

The cohesive frontend overhaul was promoted from its verified preview on 2026-09-21.

## Cohesive frontend release identity

- Release branch: `codex/frontend-overhaul`
- Production code commit: `7bdca699c82bd530d31ff6a51f11a384124d4fbb`
- Passing GitHub Actions run: `35616883073`
- Preview URL: `https://lantern-first-lc80wfrzt-isaacgong0311-5396s-projects.vercel.app`
- Preview deployment ID: `dpl_3y2et1vcwNSGP8U8hBKcTAj2SyjT`
- Production URL: `https://lantern-first-day.vercel.app`
- Production deployment ID: `dpl_CG7sxGEGoNAzEhRbrMkhiTBRHLVT`

## Guided demo release identity

- Release branch: `codex/frontend-overhaul`
- Production code commit: `6aa8cb8f797784c64a425278b5dd5d33900af55c`
- Passing GitHub Actions run: `36508325154`
- Preview URL: `https://lantern-first-3807em2ic-isaacgong0311-5396s-projects.vercel.app`
- Preview deployment ID: `dpl_Deb1J34fMz4MkD1ccFPnR2Mac7Cy`
- Production URL: `https://lantern-first-day.vercel.app`
- Production deployment ID: `dpl_4PvjeeuuH5zmz4Jskq93G2VgMHWG`
- Promoted and verified: `2026-09-28`

## Automated gate

- [x] `npm run lint`
- [x] `npm test`
- [x] `npm run evaluate:first-day`
- [x] `npm run build`
- [x] `npm run test:e2e`
- [x] `npm run test:lighthouse`
- [x] `git diff --check`
- [x] GitHub Actions CI passes on the pushed candidate

## Product acceptance

- [x] First Day is the flagship experience at `/`.
- [x] General Lantern remains available at `/explain`.
- [x] Privacy disclosures are available at `/privacy`.
- [x] Fictional First Day works without provider access.
- [x] The six-beat guided demo at `/first-day?demo=1` completes without provider requests.
- [x] Live pages process sequentially and independently.
- [x] Every accepted proposal has an exact quote from its source page.
- [x] Corrections preserve source records and append history.
- [x] Conflict resolution changes only dependent task state.
- [x] Pending or stale procedures cannot make a live task ready.
- [x] Practice outputs cannot confirm facts.
- [x] Calendar export includes confirmed, complete dates only.
- [x] Print and JSON output expose unresolved items and rule versions.
- [x] Provider errors avoid raw images, extracted text, and raw model output.
- [x] Missing provider capability disables live entry with an explanation.
- [x] Security headers apply to HTML and API routes.
- [x] Mobile and desktop browser journeys require no provider secret.
- [x] Evaluation denominators, failures, latency, and cost are reported honestly.
- [x] AI use, reused code, libraries, and student contribution are disclosed.

## Historical manual production verification (earlier release)

- [x] `GET /` returns 200.
- [x] `GET /first-day` returns 200.
- [x] `GET /first-day/how-it-works` returns 200.
- [x] `GET /api/health` accurately reports degraded provider capability (`503`, `groq: false`).
- [x] Fictional six-screen journey completes in English and Spanish.
- [x] Guided demo entry renders all six judge-facing beats and remains usable at 390, 768, 1024, and 1440 pixels.
- [x] Live synthetic upload is not applicable while provider capability is unavailable; live entry is correctly disabled.
- [x] Letter and A4 print output contain no clipped cards or interactive controls.
- [x] Production HTML and API responses contain the four security headers.
- [x] No unexpected build or runtime errors appear during the synthetic checks.

## Known limitations

- The live pilot is limited to Round Rock ISD enrollment documents and two narrow source-checked procedures. It is not reviewed or endorsed by the district.
- Uploaded images are processed in memory and sent to an external provider; Lantern does not provide an offline OCR mode or persistent case account.
- The interface supports English and Spanish; extracted school content is not guaranteed to be available in every language.
- Provider latency and cost were not measured in the offline held-out evaluation.
- School procedures can change. The deterministic freshness gate requires re-review rather than treating an old snapshot as current.
- As verified on 2026-10-10, production reports live document reading as available and a synthetic First Day extraction passed. Optional server speech and local-help search remain unavailable. The complete fictional workflow remains available without a provider.

## 2026 final submission gates

The historical deployment identities above predate the current Decision Trace release. They remain useful records, but they are not evidence that the newest code is deployed.

- [x] Decision Trace domain projection implemented and tested.
- [x] Decision Trace UI verified at mobile, tablet, desktop, and wide layouts.
- [x] Guided-demo reset restores the untouched fictional case.
- [x] Judge quick start and Decision Trace code tour documented.
- [x] Privacy-safe adult usability protocol and denominator-safe report generator prepared.
- [ ] Approximately five consenting adult usability sessions completed with fictional documents.
- [ ] Repeated or severe usability findings reviewed and any accepted fixes verified.
- [x] Updated 2:50 demonstration script drafted around Decision Trace.
- [x] Written application answers drafted with bounded evidence claims.
- [x] Video production checklist and truthful submission manifest created.
- [x] Current Decision Trace release verified at the public URL by a matching `/api/health` commit, successful route responses, and a synthetic live extraction (2026-10-10); deployment ID still needs recording.
- [ ] Final release commit selected and annotated submission tag created.
- [ ] Final 1–3 minute video recorded from that exact release.
- [ ] Captions reviewed against the accepted final take.
- [ ] Transcript created from the accepted final take.
- [ ] Public video link tested while signed out.
- [ ] Official form field lengths checked and written answers adapted without changing claims.
- [ ] Submission manifest updated with exact commit, tag, deployment, video, captions, and transcript.
- [ ] Congressional App Challenge submission completed and confirmation saved.
