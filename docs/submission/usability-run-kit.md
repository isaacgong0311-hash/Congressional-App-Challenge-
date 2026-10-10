# First Day usability run kit

The app's [protocol](../../evaluation/usability/protocol.md) and [session sheet](../../evaluation/usability/session-sheet.md) are the source of truth. This page is a short operating checklist for collecting the five adult sessions planned before submission. No sessions have been completed as of October 10, 2026.

## Invitation to send yourself

> I built a student app that helps people make sense of school-enrollment messages. Could you spend about 15 minutes trying a fictional example and tell me where the app is confusing? I am testing the app, not you. Please be 18 or older. I will not ask for or record your name, real family records, audio, video, or screenshots. Participation is voluntary and you can stop at any time.

Do not send the invitation to someone whose participation could feel required because of a grading, job, care, or authority relationship. Keep any scheduling contact details outside this repository and delete them when no longer needed.

## Before each session

1. Open a clean browser at `/first-day` without `?demo=1`.
2. Use the fictional Mesa View case only. Do not upload real records.
3. Print or duplicate the anonymous [session sheet](../../evaluation/usability/session-sheet.md) and assign the next ID, `U01` through `U05`.
4. Read the consent script in the [protocol](../../evaluation/usability/protocol.md). Stop if the person does not confirm adulthood and voluntary consent.
5. Ask the six tasks exactly as written. Record task outcomes and elapsed seconds before any help.

## After each session

1. Remove any accidentally written identifying detail from the sheet.
2. Transfer only the structured, anonymous fields to `evaluation/usability/sessions.json`.
3. Run `npm run evaluate:usability` and check that the report counts the session correctly.
4. Keep all valid sessions, including difficult ones. Do not turn a helped task into success.
5. After at least five valid sessions, summarize repeated confusion and fix only the highest-impact findings before the final release gate.

The current report must continue to say **Not started** until real, consented observations are entered. Synthetic tests and the silent demo recording are not participant evidence.
