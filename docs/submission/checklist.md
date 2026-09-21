# Competition release checklist

## Release identity

- Candidate tag: `competition-candidate-v1`
- Git commit: pending final release commit
- Production URL: pending verified deployment
- Vercel deployment ID: pending verified deployment

## Automated gate

- [x] `npm run lint`
- [x] `npm test`
- [x] `npm run evaluate:first-day`
- [x] `npm run build`
- [x] `npm run test:e2e`
- [x] `git diff --check`
- [ ] GitHub Actions CI passes on the pushed candidate

## Product acceptance

- [x] General Lantern remains available at `/`.
- [x] Fictional First Day works without provider access.
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

## Manual production verification

- [ ] `GET /` returns 200.
- [ ] `GET /first-day` returns 200.
- [ ] `GET /first-day/how-it-works` returns 200.
- [ ] `GET /api/health` reports the actual production provider capability.
- [ ] Fictional six-screen journey completes in English and Spanish.
- [ ] One synthetic live upload completes when production capability is available.
- [ ] Letter and A4 print output contain no clipped cards or interactive controls.
- [ ] Production HTML and API responses contain the four security headers.
- [ ] No build or runtime errors appear during the synthetic checks.

## Known limitations

- The live pilot is limited to Round Rock ISD enrollment documents and two narrow source-checked procedures. It is not reviewed or endorsed by the district.
- Uploaded images are processed in memory and sent to an external provider; Lantern does not provide an offline OCR mode or persistent case account.
- The interface supports English and Spanish; extracted school content is not guaranteed to be available in every language.
- Provider latency and cost were not measured in the offline held-out evaluation.
- School procedures can change. The deterministic freshness gate requires re-review rather than treating an old snapshot as current.
