# Lantern: First Day — three-minute demonstration script

## 0:00–0:20 — Audience and purpose

“Newcomer families often receive enrollment instructions across several letters, reminders, and office notes. Lantern: First Day turns those scattered school instructions into one source-backed plan families can check, clarify, and carry with them.”

Show the First Day landing screen and the fictional-demo label.

## 0:20–0:42 — Tools and architecture

“I built this as an independent Next.js application using React, TypeScript, Tailwind CSS, and Zod. Vitest checks the domain rules, Playwright and axe test the real browser experience, and Vercel hosts the app. Groq can read uploaded pages in the live pilot, but AI only proposes facts and exact quotes. Deterministic TypeScript code validates, confirms, compares, and plans.”

Open **How First Day works** briefly and point across the five-stage pipeline.

## 0:42–1:24 — Source-backed fictional workflow

Open the sample case.

“The demo packet is entirely fictional. Every page keeps its own extracted text and identity, so one bad page cannot erase the others. On Review facts, each important value stays connected to the exact words that support it.”

Open one **Show source** dialog, read the highlighted passage, then close it.

“Nothing changes the plan until the family confirms, corrects, or marks a fact unclear. Corrections append history instead of rewriting what the page said.”

Confirm the two proposed demo facts and continue.

## 1:24–2:02 — Technical challenge: conflicting instructions

On **My plan**, select **Confirm where orientation begins**, then **Resolve this**.

“The hardest problem was refusing to hide uncertainty. These two documents name different entrances. Lantern does not assume the newest message is correct. It preserves both quotes, prepares a question, and waits for the family to record what the school said.”

Choose the gym entrance.

“That append-only event changes the affected task. Unrelated tasks stay unchanged because every task has explicit fact, task, and procedure dependencies.”

## 2:02–2:28 — Family-ready output

Switch to Spanish and open **Llevar conmigo**.

“The interface works in English and Spanish. The final view puts unresolved items first, then plan steps, confirmed facts, and procedure review details. Families can print it, download a privacy-limited JSON plan, or add only complete confirmed dates to a calendar.”

## 2:28–2:50 — Live pilot and reliability

Return to Start and point to **Add Round Rock ISD documents**.

“The live pilot processes up to five JPG or PNG pages one at a time. A failed page can be retried without losing successful pages, and removing a page also removes its facts from the usable plan. The two district procedures are narrow, source-checked enrollment records—not a claim of district review or endorsement.”

## 2:50–3:00 — Measured result and close

“Across 20 synthetic held-out packets, the versioned offline evaluation reports 32 out of 32 exact quotes covered, all 8 intended conflicts found with zero false positives, and all 34 ready tasks retaining source coverage. Lantern helps a family move forward without pretending uncertainty disappeared.”
