# Lantern: First Day — 2:50 demonstration script

**Recording path:** `/first-day?demo=1&present=1`

**Target delivery:** 2:45–2:55

**Data:** Fictional Mesa View case

**Rehearsal rule:** Select **Reset demo** before every take.

## 0:00–0:20 — Identity, audience, and purpose

> I’m Isaac Gong. Together with my project partners, Karthik Devarasetty and Vihan Santhosh, I built Lantern: First Day for newcomer families navigating school enrollment. Lantern turns scattered school instructions into one bilingual plan a family can inspect, question, and carry—without hiding uncertainty or pretending AI knows more than the source documents.

**On screen:** Begin on the homepage with the Lantern name visible. Open the guided demo and pause on its fictional-data label.

## 0:20–0:45 — Before Lantern

> This fictional family received three pages. The enrollment date is in one letter, the health instructions are in another, and two pages disagree about orientation. I can ask where it is and see both original passages. The demo finds those sources in the browser without an AI call.

**On screen:** Show the fictional district notice and document identities. On Documents, choose **Where is orientation?** in Source finder, show both quotes, then continue. Keep this click brief so the later human confirmation remains the focus.

## 0:45–1:10 — Evidence before answers

> Lantern keeps every page separate. Runtime AI may propose a structured fact, but code rejects it unless its exact supporting quotation appears in the page text. Here the nurse-review appointment starts unconfirmed. I compare it with the source, confirm it, and the health step moves from Waiting to Ready. The family—not the model—also answers questions the documents cannot answer.

**On screen:** Advance to Review facts. Show the nurse-review quote, select **Confirm this**, then answer the two family questions.

## 1:10–1:40 — Uncertainty preserved

> The hardest design problem was preserving disagreement. One source says orientation is in the cafeteria; another says it is in the gym. Lantern keeps both quotes, marks the task as needing clarification, and prepares the question to ask. It never silently chooses the newer-looking message.

**On screen:** Advance to the conflict. Point to both locations and both source cards. Select **The school confirmed gym**, review the choice, then press **Confirm school answer**.

## 1:40–2:00 — Focused update and Decision Trace

> That school answer becomes an immutable human-reported event. Deterministic TypeScript recomputes the dependencies, changes only the orientation task, and opens Decision Trace. The trace connects five stages: source evidence, proposed facts, the human decision, dependency logic, and the final ready state. It is a read-only explanation of the same event and planner used by the normal app—not a second AI-generated story.

**On screen:** Let the automatic Decision Trace open. Move slowly through the two quotes, Not selected and Confirmed fact states, school confirmation, any-requirement rule, and Ready result. Keep the focused-update banner visible briefly.

## 2:00–2:25 — A family-ready result

> Now I’ll switch to Spanish. The family can print or save the plan, inspect unresolved items and source references, download its event history, and add only complete confirmed dates to a calendar. The fictional judge path requires no provider key or account.

**On screen:** Close the trace, switch to **ES**, advance to **Llevar conmigo**, and show the Spanish plan plus print, calendar, and technical JSON actions.

## 2:25–2:50 — Engineering proof and close

> We built Lantern with Next.js, TypeScript, Zod, Vitest, and Playwright. In 28 synthetic packets it kept 46 of 46 exact quotes and found 12 of 12 intended conflicts. One equivalent English-Spanish location also triggered a false conflict; the report shows that limit. AI-assisted development is disclosed, while people confirm facts and code derives the plan. Lantern helps a family leave with a plan they can explain.

**On screen:** Open **See how Lantern earns trust**. Show the tool list, AI/code/family boundary, synthetic result denominators, and limitation statement. End with the Lantern name visible.

## Recording notes

- Speak “46 out of 46 in our synthetic set,” not “one hundred percent accurate.” Mention the one recorded false conflict when showing the results.
- Use ← and → to move between beats. Press H to fold or reopen the recording cues.
- Keep cursor motion slow and purposeful; never circle decorative elements.
- Use browser zoom that leaves every quoted source readable in the final upload.
- If a click, state, or spoken claim is wrong, reset and record a new full take. Do not edit separate states together in a way that implies a transition did not actually occur.
- Captions and the final transcript must match the recorded take, not merely this draft.
