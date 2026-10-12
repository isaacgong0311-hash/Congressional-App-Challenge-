# Lantern — CAC 2026 frontend final push

Adapted from the project’s CAC final-push plan for a focused UI pass. The public judging path is `/first-day?demo=1`; presenter controls remain at `?demo=1&present=1`.

## Ground rules

- Keep the existing Lantern visual identity: warm paper, deep green, restrained gold, readable type, and purposeful motion.
- Make the fictional demo useful without an account, upload, provider key, or request to an AI service.
- Preserve the boundary between a source quote, a family-confirmed fact, and a derived task state. Do not hide conflicts to make the interface look complete.
- Pair every new English string with Spanish copy. Preserve visible focus, semantic controls, and usable layouts at 375px and 200% zoom.
- After each implementation task run `npm run lint && npm test && npm run build`, then the affected Playwright checks. Keep each change in a small commit.

## P0 — Judge path, before October 15

### 1. Make the first action unmistakable

On the clean demo Start screen, show one primary action: “Try the fictional case.” Remove the disabled live example control and the long district explanation from this mode. Keep a short fictional-data reassurance under the action. In live mode, retain the public-source path and its district caveat.

**Accept:** At 390×844, the primary action fits in the first viewport; the clean demo has no disabled CTA; live mode still explains unavailable reading and offers retry.

### 2. Keep the six-step path scannable

Review Documents, Review facts, My plan, Resolve, and Take it with me at 390px, 768px, and 1440px. Emphasize the current step and the next family action; preserve the source quote near any proposed fact or conflict. Shorten only copy that obscures the decision.

**Accept:** Each step has a clear heading, action, status, and source path. No horizontal overflow at 375px or a 188px CSS viewport representing 200% zoom.

### 3. Make the final plan look ready to carry

Check print and export in EN/ES. Keep one-page print layout where possible, readable status labels, and source citations attached to every ready task.

**Accept:** Print preview omits navigation and includes every ready task and citation; unresolved items remain visibly unresolved.

## P1 — Frontend quality, before October 19

### 4. Tighten the public landing and Explain entry

Keep the family-facing headline and one clear demo CTA. Remove dead or disabled controls from first impressions. Check type scale, spacing, contrast, and focus at desktop and mobile sizes. Avoid jargon on `/`; link to `/first-day/how-it-works` for technical detail.

### 5. Accessibility and resilience

Run axe on public routes and every demo step, keyboard through the demo, and verify Aa/contrast controls with and without localStorage. Keep content visible if animation does not run.

**Accept:** Zero serious/critical axe violations; Lighthouse mobile Accessibility at least 95 and Performance at least 85 on `/` and `/first-day?demo=1`.

### 6. Submission presentation

Use a clear Open Graph image, stable page titles, a small-display cover photo, and a public video showing the clean demo. Verify the live URL after deployment before placing it in the CAC form.

## Execution order

Finish item 1 first, then audit items 2–5 with screenshots and tests. Item 6 depends on a verified production deployment and final recording.
