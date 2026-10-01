# Lantern formative usability protocol

**Study version:** `lantern-usability-v1`  
**Product:** Lantern: First Day  
**Target:** Approximately five consenting adults  
**Materials:** Fictional Mesa View case only  
**Expected session length:** 12–18 minutes

## Research questions

1. Can a first-time participant identify the enrollment date and location?
2. Can they identify preparation steps without turning an option into a requirement?
3. Do they notice that two documents disagree about the orientation location?
4. Can they find the exact source behind a proposed fact?
5. Can they explain what remains unresolved and who must resolve it?
6. Can they choose an appropriate next action and describe why?

This is formative usability work. It cannot establish enrollment outcomes, accessibility for every disability, effectiveness with real family records, or community impact.

## Eligibility and recruitment

Recruit adults age 18 or older. Parents, educators, bilingual community members, and people who have helped someone navigate enrollment are useful perspectives, but no professional or family status is required. Do not recruit children for this protocol.

Use neutral recruitment language:

> I am testing whether a student-built school-instruction prototype is understandable. The session takes about 15 minutes and uses fictional documents only. I am testing the app, not you. I will not collect your name, contact information, real school records, audio, video, or screenshots. Participation is voluntary and you may stop at any time.

Do not promise compensation unless it has already been arranged. Do not recruit anyone whose participation could feel required because of a grading, employment, care, or authority relationship.

## Setup

1. Use a clean browser session on the release candidate.
2. Open `/first-day` without `?demo=1`.
3. Confirm the interface starts in English unless the participant chooses Spanish.
4. Prepare a timer that records elapsed seconds but no audio or screen content.
5. Prepare a blank copy of `session-sheet.md` and assign the next anonymous ID.
6. Do not sign into personal accounts or open developer tools during the session.

The guided demo must not be used for the study because its instructions reveal the intended path and would bias discovery.

## Consent script

Read this before beginning:

> Thank you for helping. I am evaluating Lantern, not your ability. You will use a fictional school-enrollment case. Please do not share any real student, school, medical, immigration, or family information. I will record only an anonymous participant ID, task outcomes, elapsed time, confidence ratings, broad confusion categories, and a paraphrased improvement suggestion. I will not record your name, contact information, audio, video, screen, or documents. You may skip anything or stop at any time. Do you confirm that you are at least 18 and voluntarily agree to continue?

Continue only after the participant answers yes to both adulthood and voluntary participation. Mark `adultConfirmed` and `consentConfirmed` on the sheet. If either answer is no, thank them, stop, and do not create a session record.

## Moderator rules

- Ask the task exactly as written.
- Encourage thinking aloud, but do not require it.
- Do not name a control, page, or answer before the participant finds it.
- Neutral prompts are limited to “What are you looking for?”, “What do you expect that to do?”, and “Please continue when you are ready.”
- If the participant is stuck for 90 seconds, mark the task `not_completed` before offering help.
- If help lets the participant finish, keep the original outcome; do not convert it to success.
- Record observable behavior, not guesses about motivation.
- Count an unsupported conclusion whenever the participant states a requirement, answer, or certainty that is not supported by the visible fictional sources or confirmed case state.
- Stop immediately if the participant begins sharing sensitive real information; remind them to use only the fictional case.

## Session script

### Introduction

Say:

> Please use the app as you naturally would and think aloud if that feels comfortable. I may stay quiet because I want to learn where the interface is clear or confusing. There are no trick questions.

Ask: “On a scale from 1 to 5, how confident would you feel turning several school-enrollment messages into a reliable next-step plan?” Record `confidenceBefore`.

Start the timer when the participant begins Task 1. Record each task's elapsed seconds separately.

### Task 1 — `identify_enrollment`

Prompt:

> Open the fictional sample. Tell me the enrollment meeting date, time, and location, and show me where you found them.

- **Success:** Identifies August 12, 2027 at 9:00 a.m. and Mesa View Welcome Center, 145 Oak Street, using the app without moderator help.
- **Partial:** Finds either the complete time or complete location, or gives the right answer but cannot show its source.
- **Not completed:** Cannot provide a substantially correct answer within 90 seconds before help.

### Task 2 — `identify_preparation`

Prompt:

> What should this family prepare for the health-record step? Explain whether there is more than one supported path.

- **Success:** Identifies the immunization record and the fictional confirmed nurse-review alternative without claiming both are mandatory.
- **Partial:** Finds only one path or describes both but incorrectly treats both as mandatory.
- **Not completed:** Cannot identify a supported preparation path within 90 seconds before help.

### Task 3 — `detect_orientation_conflict`

Prompt:

> Review the plan. Is there anything the family should clarify before relying on it?

- **Success:** Independently identifies that cafeteria and gym entrance conflict for the same orientation.
- **Partial:** Notices a blocker or uncertainty but cannot explain the two competing locations.
- **Not completed:** Says the plan has no relevant uncertainty or cannot find the conflict within 90 seconds before help.

### Task 4 — `find_source`

Prompt:

> Show me the original source text supporting each orientation location.

- **Success:** Opens or points to both exact quotes and correctly associates each with its source document.
- **Partial:** Finds one correct quote or both values without their source identities.
- **Not completed:** Cannot locate a supporting quote within 90 seconds before help.

### Task 5 — `explain_unresolved`

Prompt:

> Before recording an answer, explain what Lantern knows, what it does not know, and who must decide what to do next.

- **Success:** Explains that Lantern preserves both source claims, does not know which is current, and the family must ask the school and record the answer.
- **Partial:** Understands that clarification is needed but attributes the final decision to Lantern or omits the need to contact the school.
- **Not completed:** Treats one source as automatically correct or cannot describe the unresolved issue.

### Task 6 — `choose_next_action`

Prompt:

> Assume the school says “Gym entrance.” Record that answer, inspect why the task changed, and tell me the family's next action.

- **Success:** Records Gym entrance, uses the Decision Trace or status explanation to connect the school answer to the ready orientation task, and states an appropriate next action.
- **Partial:** Records the answer and sees the updated task but cannot explain the dependency or provenance.
- **Not completed:** Records the wrong answer, cannot complete the resolution, or cannot identify a next action.

## Closing questions

Ask:

1. “On the same 1-to-5 scale, how confident would you now feel turning these fictional messages into a reliable next-step plan?” Record `confidenceAfter`.
2. “What was the most confusing moment?” Apply one or more predefined confusion codes; do not quote identifying details.
3. “If you could change one thing, what would it be?” Record one anonymous paraphrase of at most 240 characters.

Debrief:

> Mesa View and every document in this session are fictional. Lantern is an independent student project. This short session tests interface comprehension; it does not prove real-world enrollment outcomes.

## Confusion codes

- `navigation` — difficulty knowing where to go next.
- `source_provenance` — difficulty connecting a fact to the original source.
- `status_language` — difficulty interpreting ready, waiting, clarification, review, or done.
- `conflict_resolution` — difficulty understanding or completing the school-confirmation step.
- `decision_trace` — difficulty understanding the provenance flow.
- `export` — difficulty understanding the final plan or export actions.
- `none` — no major confusion reported or observed; do not combine with another code.

## Study completion rule

Use `studyStatus: "not_started"` with zero sessions, `"in_progress"` with one to four valid sessions, and `"complete"` only with at least five valid sessions. Report all eligible sessions; do not remove a difficult session to improve results. Document any stopped or excluded encounter outside the dataset without personal information and without replacing it with invented data.
