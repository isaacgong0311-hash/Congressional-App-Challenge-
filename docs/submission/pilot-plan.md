# Pilot plan (draft: not started)

Status: **no partner has agreed yet.** Nothing here may be described as a done pilot, a partnership, or an endorsement.

## Partner (fill in only after a written yes)

- Organization: ________ (a school counselor, parent group, or community organization serving newcomer families)
- Contact role: ________
- Written agreement received on: ________
- Partner reviewed the privacy wording on: ________

## Rules that apply before anything else

- Use only the fictional Rivera case. No real family document is collected, uploaded, or stored.
- Adults only. Each person gives informed consent, in English or Spanish, and may stop at any time.
- If a real pilot with real documents is ever wanted, it needs written consent and an approved process through the partner or district first.
- Letters can hold children's names, health details, and immigration-sensitive facts. Treat that as a reason to stay synthetic by default.

## Consent and data

- Consent script: `docs/submission/usability-run-kit.md`
- Stored by Lantern: nothing. Plans stay in page memory.
- Stored by the researcher: a paper or local note per person, with no name, no child information, and no contact details. Use an ID like P1.
- The partner reviews the privacy wording in `app/privacy/page.tsx` before sessions start.

## Method (5 to 10 adults)

1. Before: ask the same four questions each time.
   - What would you do first for the first day of school?
   - Which dates or places are you unsure about?
   - What would you still need to ask the school?
   - How confident are you (1 to 5)?
2. Task: the person explores `/first-day?demo=1` alone. The researcher stays silent and notes where they hesitate.
3. After: ask the same four questions again, plus: "Where does the plan say the orientation is, and why?"

## Success measures (set before the first session)

- Share who name the correct next step after using Lantern.
- Share who notice the cafeteria/gym conflict without help.
- Median confidence before vs. after.
- Count of hesitation points, ranked by how many people hit each one.

## Reporting

Publish the denominator (for example "3 of 5"), the limits (small sample, fictional case, one researcher), and what did not work. Add results to `app/about/usability-section.tsx` only after sessions are done. Until then, keep the "Not started" wording.
