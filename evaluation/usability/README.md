# Lantern usability validation

This directory contains the runnable protocol for a small, formative usability study of Lantern: First Day. The target is approximately five consenting adults. The study uses only the fictional Mesa View case and measures whether participants can understand the enrollment plan, trace it to sources, and notice unresolved conflicts.

## Current status

**Not started.** No participant sessions are recorded in `sessions.json`. The presence of a protocol is not evidence that people used or validated the product.

## Privacy boundary

- Recruit adults only.
- Use the fictional Mesa View documents already included in Lantern.
- Do not collect names, contact details, employer or school names, real school documents, student records, immigration details, health details, audio, video, screenshots, or screen recordings.
- Use anonymous IDs `U01` through `U99`.
- Do not put identifying details in the suggestion summary or session notes.
- Participation is voluntary. A participant may skip a question or stop at any time.
- Do not promise compensation unless it has actually been arranged before recruitment.

## Files

- `protocol.md` — recruitment, consent, moderator script, tasks, scoring, and stop conditions.
- `session-sheet.md` — one printable worksheet per participant.
- `sessions.json` — structured anonymous observations used by the report generator.
- `summary.ts` — validation and deterministic aggregation.
- `run.ts` — report runner.
- `report.md` — generated status or results; never edit it by hand.

## Run the report

```bash
npm run evaluate:usability
```

The command validates every record before writing `report.md`. Invalid, incomplete, duplicated, or non-consented records stop the run. With zero sessions, the report says the study has not started. With one to four sessions, it says the results are preliminary. At least five valid sessions are required for `studyStatus: "complete"`.

## Entering a completed session

Transfer only the structured fields from the paper session sheet into `sessions.json`. Keep the six task IDs exactly as shown in the template. Paraphrase the improvement suggestion without names or identifying context. Review the JSON with the moderator before running the report.

Do not change `studyStatus` to `complete` until at least five eligible adults have completed the protocol. Do not infer missing outcomes or turn moderator expectations into participant findings.
